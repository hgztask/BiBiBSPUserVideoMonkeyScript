import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import backupSnapshot from "../src/web/core/backup/backupSnapshot.ts";
import backupKeys from "../src/web/core/backup/backupKeys.ts";

const gmStore = new Map<string, unknown>();

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

beforeEach(() => {
    gmStore.clear();
    stubGmGlobals();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("备份快照", () => {
    it("构建快照时包含全部规则key，空数组也保留", async () => {
        gmStore.set("name", ["原神"]);
        const snapshot = await backupSnapshot.buildSnapshot();

        expect(snapshot.format).toBe("bibishield-backup");
        expect(snapshot.schemaVersion).toBe(1);
        expect(snapshot.appVersion).toBe("test-version");
        expect(Object.keys(snapshot.data.rules).sort()).toEqual(backupKeys.allRuleKeys().sort());
        expect(snapshot.data.rules["name"]).toEqual(["原神"]);
        expect(snapshot.data.rules["title"]).toEqual([]);
    });

    it("设备id首次生成后保持不变", async () => {
        const first = await backupSnapshot.buildSnapshot();
        const second = await backupSnapshot.buildSnapshot();
        expect(first.deviceId).not.toBe("");
        expect(second.deviceId).toBe(first.deviceId);
    });

    it("解析旧版扁平格式：数字字符串转数字、去重、跳过空数组", () => {
        const parsed = backupSnapshot.parseSnapshot(JSON.stringify({
            name: ["原神", "原神", " 崩坏 "],
            precise_uid: ["123", 456, "123"],
            videoTag_preciseCombination: [["b", "a"], ["a", "b"]],
            title: []
        }));

        expect(parsed).not.toBeNull();
        expect(parsed!.source).toBe("legacy");
        expect(parsed!.snapshot.data.rules["name"]).toEqual(["原神", " 崩坏 "]);
        expect(parsed!.snapshot.data.rules["precise_uid"]).toEqual([123, 456]);
        expect(parsed!.snapshot.data.rules["videoTag_preciseCombination"]).toEqual([["b", "a"]]);
        expect(parsed!.snapshot.data.rules["title"]).toBeUndefined();
    });

    it("解析新备份格式：保留空数组", () => {
        const parsed = backupSnapshot.parseSnapshot(JSON.stringify({
            format: "bibishield-backup",
            schemaVersion: 1,
            appVersion: "2.18.1",
            createdAt: 1760000000000,
            deviceId: "dev-x",
            data: {rules: {name: [], title: ["a"]}}
        }));

        expect(parsed).not.toBeNull();
        expect(parsed!.source).toBe("backup");
        expect(parsed!.snapshot.data.rules["name"]).toEqual([]);
        expect(parsed!.snapshot.data.rules["title"]).toEqual(["a"]);
        expect(parsed!.snapshot.appVersion).toBe("2.18.1");
    });

    it("拒绝未知格式版本", () => {
        const parsed = backupSnapshot.parseSnapshot(JSON.stringify({
            format: "bibishield-backup",
            schemaVersion: 99,
            data: {rules: {name: ["a"]}}
        }));
        expect(parsed).toBeNull();
    });

    it("忽略未知规则key，不写入设置项", () => {
        const parsed = backupSnapshot.parseSnapshot(JSON.stringify({
            isWsService: [true],
            name: ["a"]
        }));
        expect(parsed).not.toBeNull();
        expect(parsed!.snapshot.data.rules["isWsService"]).toBeUndefined();
        expect(parsed!.unknownKeys).toEqual([{key: "isWsService", count: 1}]);
    });

    it("非法内容计入invalidCounts，不阻塞其他类型", () => {
        const parsed = backupSnapshot.parseSnapshot(JSON.stringify({
            precise_uid: ["abc", "12"],
            name: [123, "ok"],
            videoTag_preciseCombination: [["a"], "bad", ["b", 1]]
        }));
        expect(parsed).not.toBeNull();
        expect(parsed!.snapshot.data.rules["precise_uid"]).toEqual([12]);
        expect(parsed!.snapshot.data.rules["name"]).toEqual(["ok"]);
        expect(parsed!.snapshot.data.rules["videoTag_preciseCombination"]).toEqual([["a"]]);
        const invalidMap = Object.fromEntries(parsed!.invalidCounts.map(item => [item.key, item.count]));
        expect(invalidMap["precise_uid"]).toBe(1);
        expect(invalidMap["name"]).toBe(1);
        expect(invalidMap["videoTag_preciseCombination"]).toBe(2);
    });

    it("内容有误时返回null", () => {
        expect(backupSnapshot.parseSnapshot("not json")).toBeNull();
        expect(backupSnapshot.parseSnapshot("[]")).toBeNull();
        expect(backupSnapshot.parseSnapshot("null")).toBeNull();
    });

    it("稳定序列化与hash只和内容有关", async () => {
        const a = backupSnapshot.stableStringify({b: 1, a: {d: 2, c: 3}});
        const b = backupSnapshot.stableStringify({a: {c: 3, d: 2}, b: 1});
        expect(a).toBe(b);
        const hashA = await backupSnapshot.sha256Hex(a);
        const hashB = await backupSnapshot.sha256Hex(b);
        expect(hashA).toBe(hashB);
        expect(await backupSnapshot.sha256Hex(a + "x")).not.toBe(hashA);
    });
});
