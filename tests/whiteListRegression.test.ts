import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

/**
 * uid白名单回归测试：
 * 白名单命中应跳过该用户的所有屏蔽检查（视频标题、用户名、评论内容等），
 * 防止「标题等规则误伤白名单用户」再次回归（对齐 blockCheckWhiteUserUid 的 JSDoc 意图）。
 */

const gmStore = new Map<string, unknown>();

/** 打桩 GM 全局：未设置的键返回调用方传入的默认值，模块加载期的 GM_getValue 也能安全执行 */
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
    vi.resetModules();
});

describe("uid白名单最高优先", () => {
    it("shieldingVideo: 白名单uid的视频标题命中规则不屏蔽", async () => {
        gmStore.set("precise_uid_white", [123456]);
        gmStore.set("title", ["某标题"]);
        const {shieldingVideo} = await import("../src/web/domain/shielding/video.ts");
        const res = shieldingVideo({title: "某标题视频", name: "白名单用户", uid: 123456});
        expect(res.state).toBe(false);
    });

    it("shieldingVideo: 非白名单uid的标题命中规则正常屏蔽（模糊标题）", async () => {
        gmStore.set("precise_uid_white", []);
        gmStore.set("title", ["某标题"]);
        const {shieldingVideo} = await import("../src/web/domain/shielding/video.ts");
        const res = shieldingVideo({title: "某标题视频", name: "普通用户", uid: 999999});
        expect(res.state).toBe(true);
        expect(res.type).toBe("模糊标题");
    });

    it("blockUserUidAndName: 白名单uid命中精确用户名规则不屏蔽", async () => {
        gmStore.set("precise_uid_white", [123456]);
        gmStore.set("precise_name", ["白名单用户"]);
        const {blockUserUidAndName} = await import("../src/web/domain/shielding/main.ts");
        const res = blockUserUidAndName(123456, "白名单用户");
        expect(res.state).toBe(false);
    });

    it("blockUserUidAndName: 非白名单uid命中精确用户名规则正常屏蔽（精确用户名）", async () => {
        gmStore.set("precise_uid_white", []);
        gmStore.set("precise_name", ["普通用户"]);
        const {blockUserUidAndName} = await import("../src/web/domain/shielding/main.ts");
        const res = blockUserUidAndName(999999, "普通用户");
        expect(res.state).toBe(true);
        expect(res.type).toBe("精确用户名");
    });

    it("shieldingComment: 白名单uid的评论命中关键词与仅看硬核会员均不屏蔽", async () => {
        gmStore.set("precise_uid_white", [123456]);
        gmStore.set("commentOn", ["关键词"]);
        gmStore.set("is_senior_member_only", true);
        const commentsShield = (await import("../src/web/domain/shielding/comments.ts")).default;
        const res = commentsShield.shieldingComment({
            content: "含关键词的评论",
            uid: 123456,
            name: "白名单用户",
            level: 3
        });
        expect(res.state).toBe(false);
    });

    it("shieldingComment: 非白名单uid的评论命中关键词正常屏蔽（模糊评论）", async () => {
        gmStore.set("precise_uid_white", []);
        gmStore.set("commentOn", ["关键词"]);
        const commentsShield = (await import("../src/web/domain/shielding/comments.ts")).default;
        const res = commentsShield.shieldingComment({
            content: "含关键词的评论",
            uid: 999999,
            name: "普通用户"
        });
        expect(res.state).toBe(true);
        expect(res.type).toBe("模糊评论");
    });
});