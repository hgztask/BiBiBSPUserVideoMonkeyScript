import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import backupService, {RemoteChangedError} from "../src/web/core/backup/backupService.ts";

const gmStore = new Map<string, unknown>();
let remoteStore: { content: string, etag: string } | null = null;
let etagSeed = 0;
const requests: any[] = [];

const stubGmGlobals = (): void => {
    vi.stubGlobal("GM_getValue", (key: string, def: unknown) =>
        gmStore.has(key) ? gmStore.get(key) : def
    );
    vi.stubGlobal("GM_setValue", (key: string, value: unknown): void => {
        gmStore.set(key, value);
    });
    vi.stubGlobal("GM_deleteValue", (key: string): void => {
        gmStore.delete(key);
    });
    vi.stubGlobal("GM_info", {script: {version: "test-version"}});
};

const stubXhr = (): void => {
    vi.stubGlobal("GM_xmlhttpRequest", (details: any): void => {
        requests.push(details);
        let response: { status: number, responseText?: string, responseHeaders?: string };
        if (details.method === "GET") {
            response = remoteStore
                ? {status: 200, responseText: remoteStore.content, responseHeaders: `ETag: ${remoteStore.etag}`}
                : {status: 404};
        } else if (details.method === "PUT") {
            const ifMatch = details.headers?.["If-Match"];
            if (ifMatch && remoteStore && ifMatch !== remoteStore.etag) {
                response = {status: 412};
            } else {
                const etag = `"v${++etagSeed}"`;
                remoteStore = {content: details.data, etag};
                response = {status: 201, responseHeaders: `ETag: ${etag}`};
            }
        } else {
            response = {status: 405};
        }
        Promise.resolve().then(() => details.onload({
            status: response.status,
            responseText: response.responseText ?? "",
            responseHeaders: response.responseHeaders ?? ""
        }));
    });
};

const setupWebdavConfig = (): void => {
    backupService.saveRemoteConfig({
        type: "webdav",
        webdav: {
            fileUrl: "https://dav.example.com/dav/backup.json",
            username: "u",
            password: "p"
        },
        http: {url: "", token: ""}
    });
};

const backupContent = (rules: Record<string, unknown>): string => JSON.stringify({
    format: "bibishield-backup",
    schemaVersion: 1,
    appVersion: "1.0.0",
    createdAt: 100,
    deviceId: "dev-other",
    data: {rules}
});

beforeEach(() => {
    gmStore.clear();
    remoteStore = null;
    etagSeed = 0;
    requests.length = 0;
    stubGmGlobals();
    stubXhr();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("远程备份服务", () => {
    it("未配置远程地址时拒绝上传", async () => {
        await expect(backupService.upload()).rejects.toThrow("请先配置远程备份地址");
    });

    it("首次上传写入远程并记录同步元数据", async () => {
        setupWebdavConfig();
        gmStore.set("name", ["本地规则"]);

        const result = await backupService.upload();
        expect(result.status).toBe("uploaded");
        expect(remoteStore).not.toBeNull();
        const remoteJson = JSON.parse(remoteStore!.content);
        expect(remoteJson.format).toBe("bibishield-backup");
        expect(remoteJson.data.rules["name"]).toEqual(["本地规则"]);
        expect(backupService.getLastSync()?.hash).toMatch(/^[0-9a-f]+$/);
        expect(backupService.getLastSync()?.etag).toBe('"v1"');
    });

    it("规则未变化时重复上传为no-op", async () => {
        setupWebdavConfig();
        gmStore.set("name", ["a"]);
        await backupService.upload();
        const putCountBefore = requests.filter(r => r.method === "PUT").length;

        const second = await backupService.upload();
        expect(second.status).toBe("unchanged");
        expect(requests.filter(r => r.method === "PUT").length).toBe(putCountBefore);
    });

    it("远程被其他设备修改后上传抛出冲突，force可覆盖", async () => {
        setupWebdavConfig();
        gmStore.set("name", ["a"]);
        await backupService.upload();

        remoteStore = {content: backupContent({name: ["远端"]}), etag: '"v-other"'};
        await expect(backupService.upload()).rejects.toBeInstanceOf(RemoteChangedError);

        const result = await backupService.upload({force: true});
        expect(result.status).toBe("uploaded");
        expect(JSON.parse(remoteStore!.content).data.rules["name"]).toEqual(["a"]);
    });

    it("预览远程备份：本地有修改时标记localDirty并给出差异", async () => {
        setupWebdavConfig();
        gmStore.set("name", ["本地"]);
        remoteStore = {content: backupContent({name: ["本地", "远端"], title: ["t"]}), etag: '"v1"'};

        const preview = await backupService.previewRemote();
        expect(preview.localDirty).toBe(true);
        expect(preview.rules["title"]).toEqual(["t"]);
        const nameRow = preview.diff.rows.find(row => row.key === "name");
        expect(nameRow?.onlyIncomingCount).toBe(1);
    });

    it("合并恢复保留本地规则并写入远程新增项", async () => {
        setupWebdavConfig();
        gmStore.set("name", ["本地"]);
        remoteStore = {content: backupContent({name: ["远端"], title: ["t"]}), etag: '"v1"'};

        const preview = await backupService.previewRemote();
        await backupService.confirmDownload(preview, "merge");

        expect(gmStore.get("name")).toEqual(["本地", "远端"]);
        expect(gmStore.get("title")).toEqual(["t"]);
        expect(backupService.getLastSync()?.etag).toBe('"v1"');
    });

    it("覆盖恢复会清空备份中为空的规则类型", async () => {
        setupWebdavConfig();
        gmStore.set("name", ["本地"]);
        remoteStore = {content: backupContent({name: [], title: ["t"]}), etag: '"v1"'};

        const preview = await backupService.previewRemote();
        await backupService.confirmDownload(preview, "overwrite");

        expect(gmStore.get("name")).toEqual([]);
        expect(gmStore.get("title")).toEqual(["t"]);
    });

    it("远程没有备份时给出可读错误", async () => {
        setupWebdavConfig();
        await expect(backupService.previewRemote()).rejects.toThrow("远程还没有备份文件");
    });

    it("测试连接走保存的配置", async () => {
        setupWebdavConfig();
        const result = await backupService.testProvider();
        // 默认fake只处理GET/PUT，PROPFIND返回405，应给出失败结果而不是抛异常
        expect(result.ok).toBe(false);
        expect(result.message).toContain("HTTP 405");
    });
});
