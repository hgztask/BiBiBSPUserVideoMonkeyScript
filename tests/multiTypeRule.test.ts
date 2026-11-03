import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import ruleUtil from "../src/web/core/util/ruleUtil.ts";
import ruleKeyListData from "../src/web/config/ruleKeyListData.ts";
import {
    clearRememberedTypes,
    getRememberedTypes,
    rememberTypes
} from "../src/web/core/util/multiTypeRuleMemory.ts";

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
};

beforeEach(() => {
    gmStore.clear();
    stubGmGlobals();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

const fuzzyTypes = () => ruleKeyListData.getMultiTypeOptions("模糊匹配");
const exactTypes = () => ruleKeyListData.getMultiTypeOptions("精确匹配");
const regexTypes = () => ruleKeyListData.getMultiTypeOptions("正则匹配");

const pick = <T extends { type: string }>(list: T[], keys: string[]): T[] => {
    return list.filter(item => keys.includes(item.type));
};

describe("多类型批量规则", () => {
    it("按匹配模式返回类型，组合匹配不参与", () => {
        const fuzzy = fuzzyTypes();
        expect(fuzzy.length).toBeGreaterThan(10);
        expect(fuzzy.map(item => item.type)).toContain("name");
        expect(fuzzy.map(item => item.type)).toContain("videoTag");
        expect(fuzzy.map(item => item.type)).not.toContain("precise_uid");
        expect(fuzzy.map(item => item.type)).not.toContain("videoTag_preciseCombination");
        expect(fuzzy.every(item => !item.isRegex)).toBe(true);

        const exact = exactTypes();
        expect(exact.find(item => item.type === "precise_uid")?.isInt).toBe(true);
        expect(exact.find(item => item.type === "precise_uid_white")?.isWhitelist).toBe(true);
        expect(exact.find(item => item.type === "precise_videoTag")?.isVideoTag).toBe(true);

        const regex = regexTypes();
        expect(regex.length).toBeGreaterThan(0);
        expect(regex.every(item => item.isRegex)).toBe(true);

        expect(ruleKeyListData.getMultiTypeOptions("组合匹配")).toEqual([]);
    });

    it("分割输入时先 trim 再去空去重", () => {
        expect(ruleUtil.splitRuleValues(" 原神 , 原神 ,, 米哈游 ,   ", ",")).toEqual(["原神", "米哈游"]);
        expect(ruleUtil.splitRuleValues("原神|米哈游", "|")).toEqual(["原神", "米哈游"]);
        expect(ruleUtil.splitRuleValues("   ", ",")).toEqual([]);
        expect(ruleUtil.splitRuleValues("原神", "")).toEqual(["原神"]);
    });

    it("选中数字类型时整组必须是非负整数", () => {
        const types = pick(exactTypes(), ["precise_uid", "precise_name"]);
        const validation = ruleUtil.validateMultiTypeGroup(["12345", "原神"], types, "add");
        expect(validation.intInvalidValues).toEqual(["原神"]);
        expect(validation.canSubmit).toBe(false);
    });

    it("只选文本类型时允许非整数内容", () => {
        const types = pick(fuzzyTypes(), ["name", "title"]);
        const validation = ruleUtil.validateMultiTypeGroup(["原神"], types, "add");
        expect(validation.intInvalidValues).toEqual([]);
        expect(validation.canSubmit).toBe(true);
        expect(validation.totalNew).toBe(2);
    });

    it("批量添加到多个类型并按类型独立去重", () => {
        gmStore.set("name", ["原神"]);
        gmStore.set("title", []);
        const types = pick(fuzzyTypes(), ["name", "title"]);
        const result = ruleUtil.batchAddRules(["原神", "米哈游"], types);

        expect(gmStore.get("name")).toEqual(["原神", "米哈游"]);
        expect(gmStore.get("title")).toEqual(["原神", "米哈游"]);
        expect(result.totalAdded).toBe(3);
        expect(result.totalDuplicates).toBe(1);

        const nameRow = result.rows.find(row => row.type === "name");
        expect(nameRow?.added).toEqual(["米哈游"]);
        expect(nameRow?.duplicates).toEqual(["原神"]);
    });

    it("数字类型存数字，文本类型存字符串", () => {
        gmStore.set("precise_uid", []);
        gmStore.set("precise_name", []);
        const types = pick(exactTypes(), ["precise_uid", "precise_name"]);
        ruleUtil.batchAddRules(["12345"], types);

        expect(gmStore.get("precise_uid")).toEqual([12345]);
        expect(gmStore.get("precise_name")).toEqual(["12345"]);
    });

    it("全部已存在时不可提交", () => {
        gmStore.set("name", ["原神"]);
        const types = pick(fuzzyTypes(), ["name"]);
        const validation = ruleUtil.validateMultiTypeGroup(["原神"], types, "add");
        expect(validation.totalNew).toBe(0);
        expect(validation.canSubmit).toBe(false);
    });

    it("屏蔽视频tag组合规则冲突的值", () => {
        gmStore.set("videoTag_preciseCombination", [["原神", "游戏"]]);
        gmStore.set("videoTag", []);
        gmStore.set("title", []);
        const types = pick(fuzzyTypes(), ["videoTag", "title"]);

        const validation = ruleUtil.validateMultiTypeGroup(["原神"], types, "add");
        expect(validation.videoTagConflictValues).toEqual(["原神"]);
        expect(validation.canSubmit).toBe(true);

        const result = ruleUtil.batchAddRules(["原神"], types);
        expect(gmStore.get("videoTag")).toEqual([]);
        expect(gmStore.get("title")).toEqual(["原神"]);
        expect(result.totalConflicts).toBe(1);
        expect(result.rows.find(row => row.type === "videoTag")?.conflicts).toEqual(["原神"]);
    });

    it("同时选中 uid 和 uid 白名单时给出冲突警告", () => {
        const types = pick(exactTypes(), ["precise_uid", "precise_uid_white"]);
        const validation = ruleUtil.validateMultiTypeGroup(["12345"], types, "add");
        expect(validation.whitelistSelected).toBe(true);
        expect(validation.whitelistConflict).toBe(true);
        expect(validation.canSubmit).toBe(true);
    });

    it("正则模式跳过非法表达式，合法表达式写入多个类型", () => {
        const types = pick(regexTypes(), ["nameCanonical", "titleCanonical"]);
        const validation = ruleUtil.validateMultiTypeGroup(["原神.*", "("], types, "add");
        expect(validation.regexInvalidValues).toEqual(["("]);
        expect(validation.canSubmit).toBe(true);

        const result = ruleUtil.batchAddRules(["原神.*", "("], types);
        expect(gmStore.get("nameCanonical")).toEqual(["原神.*"]);
        expect(gmStore.get("titleCanonical")).toEqual(["原神.*"]);
        expect(result.totalAdded).toBe(2);
        expect(result.totalInvalid).toBe(2);
    });

    it("全部是非法正则时不可提交", () => {
        const types = pick(regexTypes(), ["nameCanonical", "titleCanonical"]);
        const validation = ruleUtil.validateMultiTypeGroup(["("], types, "add");
        expect(validation.canSubmit).toBe(false);
    });

    it("批量移除返回 removed 和 notFound", () => {
        gmStore.set("name", ["原神", "米哈游"]);
        gmStore.set("title", ["米哈游"]);
        const types = pick(fuzzyTypes(), ["name", "title"]);

        const result = ruleUtil.batchDelRules(["原神", "不存在"], types);
        expect(gmStore.get("name")).toEqual(["米哈游"]);
        expect(gmStore.get("title")).toEqual(["米哈游"]);
        expect(result.totalRemoved).toBe(1);
        expect(result.totalNotFound).toBe(3);
    });

    it("移除时数字类型跳过非数字，不阻塞文本类型", () => {
        gmStore.set("precise_uid", [12345]);
        gmStore.set("precise_name", ["原神"]);
        const types = pick(exactTypes(), ["precise_uid", "precise_name"]);

        const validation = ruleUtil.validateMultiTypeGroup(["原神"], types, "remove");
        expect(validation.totalRemoved).toBe(1);
        expect(validation.totalInvalid).toBe(1);
        expect(validation.canSubmit).toBe(true);

        const result = ruleUtil.batchDelRules(["原神"], types);
        expect(gmStore.get("precise_name")).toEqual([]);
        expect(gmStore.get("precise_uid")).toEqual([12345]);
        expect(result.rows.find(row => row.type === "precise_uid")?.invalid).toEqual(["原神"]);
    });

    it("按匹配模式记忆类型并过滤失效类型", () => {
        rememberTypes("模糊匹配", ["name", "title", "videoTag_preciseCombination"]);
        const fuzzyKeys = fuzzyTypes().map(item => item.type);
        const exactKeys = exactTypes().map(item => item.type);

        expect(getRememberedTypes("模糊匹配", fuzzyKeys)).toEqual(["name", "title"]);
        expect(getRememberedTypes("精确匹配", exactKeys)).toEqual([]);

        clearRememberedTypes("模糊匹配");
        expect(getRememberedTypes("模糊匹配", fuzzyKeys)).toEqual([]);
    });
});
