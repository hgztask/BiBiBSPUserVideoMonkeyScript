import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import backupMerge from "../src/web/core/backup/backupMerge.ts";
import ruleUtil from "../src/web/core/util/ruleUtil.ts";

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
    vi.stubGlobal("alert", vi.fn());
};

beforeEach(() => {
    gmStore.clear();
    stubGmGlobals();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("规则差异与合并", () => {
    it("按类型统计差异，组合规则按集合语义比较", () => {
        const local = {
            name: ["a", "b"],
            precise_uid: [123],
            videoTag_preciseCombination: [["a", "b"]]
        };
        const incoming = {
            name: ["b", "c"],
            precise_uid: ["123" as any],
            videoTag_preciseCombination: [["b", "a"]]
        };
        const diff = backupMerge.diffRuleMap(local as any, incoming as any);

        const rows = Object.fromEntries(diff.rows.map(row => [row.key, row]));
        expect(rows["name"].onlyLocalCount).toBe(1);
        expect(rows["name"].onlyIncomingCount).toBe(1);
        expect(rows["precise_uid"].onlyLocalCount).toBe(0);
        expect(rows["precise_uid"].onlyIncomingCount).toBe(0);
        expect(rows["videoTag_preciseCombination"].onlyLocalCount).toBe(0);
        expect(rows["videoTag_preciseCombination"].onlyIncomingCount).toBe(0);
        expect(diff.totalOnlyLocal).toBe(1);
        expect(diff.totalOnlyIncoming).toBe(1);
    });

    it("覆盖模式整体替换类型，空数组会清空", () => {
        gmStore.set("name", ["old1", "old2"]);
        gmStore.set("title", ["keep"]);
        backupMerge.applyRuleMap({
            name: ["new"],
            precise_uid: []
        } as any, "overwrite");

        expect(gmStore.get("name")).toEqual(["new"]);
        expect(gmStore.get("precise_uid")).toEqual([]);
        // 文件中未出现的key保持不变
        expect(gmStore.get("title")).toEqual(["keep"]);
    });

    it("合并模式取并集，数字类型规范化后去重", () => {
        gmStore.set("precise_uid", ["123", 456]);
        gmStore.set("name", ["a"]);
        const result = backupMerge.applyRuleMap({
            precise_uid: [123, 789],
            name: ["a", "b"]
        } as any, "merge");

        expect(gmStore.get("precise_uid")).toEqual([123, 456, 789]);
        expect(gmStore.get("name")).toEqual(["a", "b"]);
        expect(result.addedCount).toBe(2);
    });

    it("组合规则合并按内容去重（回归：旧includes按引用比较导致重复）", () => {
        gmStore.set("videoTag_preciseCombination", [["a", "b"]]);
        backupMerge.applyRuleMap({
            videoTag_preciseCombination: [["b", "a"], ["c", "d"]]
        } as any, "merge");

        expect(gmStore.get("videoTag_preciseCombination")).toEqual([["a", "b"], ["c", "d"]]);
    });

    it("追加导入组合规则两次不会重复（走ruleUtil公开入口）", () => {
        const content = JSON.stringify({
            videoTag_preciseCombination: [["原神", "攻略"], ["崩坏", "攻略"]]
        });
        expect(ruleUtil.appendImportRules(content)).toBe(true);
        expect(ruleUtil.appendImportRules(content)).toBe(true);
        expect(gmStore.get("videoTag_preciseCombination")).toEqual([
            ["原神", "攻略"],
            ["崩坏", "攻略"]
        ]);
    });

    it("覆盖导入不再写入未知key", () => {
        expect(ruleUtil.overwriteImportRules(JSON.stringify({
            name: ["a"],
            isWsService: [true]
        }))).toBe(true);
        expect(gmStore.get("name")).toEqual(["a"]);
        expect(gmStore.has("isWsService")).toBe(false);
    });
});
