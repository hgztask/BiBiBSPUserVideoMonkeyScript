import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {createWebdavProvider} from "../src/web/core/backup/providers/webdav.ts";
import {createHttpProvider} from "../src/web/core/backup/providers/http.ts";
import {BackupProviderError} from "../src/web/core/backup/providers/types.ts";

interface FakeResponse {
    status: number;
    body?: string;
    headers?: Record<string, string>;
}

type FakeHandler = (details: any) => FakeResponse;

const requests: any[] = [];
let handler: FakeHandler;

const stubXhr = (): void => {
    vi.stubGlobal("GM_xmlhttpRequest", (details: any): void => {
        requests.push(details);
        const res = handler(details);
        Promise.resolve().then(() => details.onload({
            status: res.status,
            responseText: res.body ?? "",
            responseHeaders: Object.entries(res.headers ?? {})
                .map(([k, v]) => `${k}: ${v}`)
                .join("\n")
        }));
    });
};

const utf8Basic = (raw: string): string => {
    const bytes = new TextEncoder().encode(raw);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return "Basic " + btoa(binary);
};

beforeEach(() => {
    requests.length = 0;
    stubXhr();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("WebDAV提供方", () => {
    const provider = () => createWebdavProvider({
        fileUrl: "https://dav.example.com/dav/BIBIShield/backup.json",
        username: "用户",
        password: "密码"
    });

    it("读取备份返回内容与ETag，认证头为UTF-8安全的Basic", async () => {
        handler = (details) => {
            expect(details.method).toBe("GET");
            expect(details.url).toBe("https://dav.example.com/dav/BIBIShield/backup.json");
            expect(details.headers["Authorization"]).toBe(utf8Basic("用户:密码"));
            return {status: 200, body: '{"a":1}', headers: {ETag: '"abc"'}};
        };
        const result = await provider().read();
        expect(result).toEqual({content: '{"a":1}', etag: '"abc"', lastModified: undefined});
    });

    it("远程文件不存在返回null", async () => {
        handler = () => ({status: 404});
        await expect(provider().read()).resolves.toBeNull();
    });

    it("认证失败抛出AUTH错误", async () => {
        handler = () => ({status: 401});
        await expect(provider().read()).rejects.toMatchObject({code: "AUTH"});
    });

    it("写入成功返回ETag，并带上If-Match", async () => {
        handler = (details) => {
            expect(details.method).toBe("PUT");
            expect(details.headers["If-Match"]).toBe('"v1"');
            expect(details.headers["Content-Type"]).toContain("application/json");
            return {status: 201, headers: {ETag: '"v2"'}};
        };
        const result = await provider().write("{}", '"v1"');
        expect(result.etag).toBe('"v2"');
    });

    it("条件写入冲突抛出CONFLICT", async () => {
        handler = () => ({status: 412});
        await expect(provider().write("{}", '"v1"')).rejects.toMatchObject({code: "CONFLICT"});
    });

    it("目录不存在时先MKCOL再重试PUT", async () => {
        let putCount = 0;
        handler = (details) => {
            if (details.method === "PUT") {
                putCount++;
                return putCount === 1 ? {status: 409} : {status: 201, headers: {ETag: '"v3"'}};
            }
            if (details.method === "MKCOL") return {status: 201};
            throw new Error(`unexpected method ${details.method}`);
        };
        const result = await provider().write("{}");
        expect(result.etag).toBe('"v3"');
        expect(requests.map(r => r.method)).toEqual(["PUT", "MKCOL", "PUT"]);
    });

    it("测试连接：父集合存在时成功", async () => {
        handler = (details) => {
            expect(details.method).toBe("PROPFIND");
            expect(details.url).toBe("https://dav.example.com/dav/BIBIShield");
            expect(details.headers["Depth"]).toBe("0");
            // rclone等WebDAV服务端对带body的PROPFIND返回400，必须无body
            expect(details.data).toBeUndefined();
            return {status: 207};
        };
        await expect(provider().test()).resolves.toEqual({ok: true, message: "连接成功"});
    });

    it("测试连接：目录不存在时自动创建", async () => {
        handler = (details) => {
            if (details.method === "PROPFIND") return {status: 404};
            if (details.method === "MKCOL") return {status: 201};
            throw new Error(`unexpected method ${details.method}`);
        };
        await expect(provider().test()).resolves.toEqual({ok: true, message: "连接成功，远程目录已创建"});
    });

    it("测试连接：认证失败返回可读提示", async () => {
        handler = () => ({status: 401});
        const result = await provider().test();
        expect(result.ok).toBe(false);
        expect(result.message).toContain("认证失败");
    });

    it("地址缺协议时自动补 http://，根路径给出可读提示", async () => {
        const noScheme = createWebdavProvider({fileUrl: "127.0.0.1:8180/backup.json", username: "u", password: "p"});
        handler = (details) => {
            expect(details.url).toBe("http://127.0.0.1:8180/backup.json");
            return {status: 200, body: "{}", headers: {ETag: '"e1"'}};
        };
        await expect(noScheme.read()).resolves.toMatchObject({content: "{}"});

        const rootOnly = createWebdavProvider({fileUrl: "http://127.0.0.1:8180/", username: "u", password: "p"});
        const result = await rootOnly.test();
        expect(result.ok).toBe(false);
        expect(result.message).toContain("而不是站点根路径");
    });

    it("网络错误透传GM错误文本并给出XHR安全设置指引", async () => {
        vi.stubGlobal("GM_xmlhttpRequest", (details: any): void => {
            Promise.resolve().then(() => details.onerror({errorText: "Domain not permitted"}));
        });
        const result = await provider().test();
        expect(result.ok).toBe(false);
        expect(result.message).toContain("Domain not permitted");
        expect(result.message).toContain("XHR 安全");
        vi.unstubAllGlobals();
        stubXhr();
    });
});

describe("HTTP中间层提供方", () => {
    const provider = () => createHttpProvider({url: "https://backup.example.com/api/backup", token: "token-1"});

    it("地址缺协议时自动补 http://", async () => {
        const noScheme = createHttpProvider({url: "127.0.0.1:9000/backup", token: "t"});
        handler = (details) => {
            expect(details.url).toBe("http://127.0.0.1:9000/backup");
            return {status: 200, body: "{}"};
        };
        await expect(noScheme.test()).resolves.toEqual({ok: true, message: "连接成功"});
    });

    it("读取备份带上Bearer令牌", async () => {
        handler = (details) => {
            expect(details.method).toBe("GET");
            expect(details.headers["Authorization"]).toBe("Bearer token-1");
            return {status: 200, body: "{}", headers: {ETag: '"h1"'}};
        };
        await expect(provider().read()).resolves.toMatchObject({content: "{}", etag: '"h1"'});
    });

    it("404视为暂无备份", async () => {
        handler = () => ({status: 404});
        await expect(provider().read()).resolves.toBeNull();
    });

    it("写入冲突抛出CONFLICT", async () => {
        handler = () => ({status: 412});
        await expect(provider().write("{}", '"h1"')).rejects.toBeInstanceOf(BackupProviderError);
    });

    it("空间不足映射为QUOTA", async () => {
        handler = () => ({status: 507});
        await expect(provider().write("{}")).rejects.toMatchObject({code: "QUOTA"});
    });
});
