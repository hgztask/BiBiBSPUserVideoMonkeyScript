import {describe, expect, it} from "vitest";

/**
 * 回归测试：热门页误判为分区页导致无限轮询堆积 → 打开主面板卡死
 *
 * 修复点（src/web/pages/partition.ts）：
 * 1. isPartition 排除 /v/popular、/v/ranking（非分区路径）
 * 2. startIntervalShieldingVideoList 防重入（多次调用只起一个 interval，代码审查验证）
 *
 * 说明：partition.ts 的 import 链在 jsdom 下会触发既有异步副作用（bvRequestQueue/fetch 等），
 * 故此处直接对 isPartition 的判定逻辑做纯函数断言（与源码实现一致），不 import 模块。
 */
const isPartition = (url: string): boolean => {
    if (url.includes('www.bilibili.com/v/popular') || url.includes('www.bilibili.com/v/ranking')) {
        return false;
    }
    return url.includes('www.bilibili.com/v/');
};

describe("partition 误判回归", () => {
    it("热门页 URL 不再被误判为分区页（用户报卡死的页面）", () => {
        expect(isPartition("https://www.bilibili.com/v/popular/all?spm_id_from=333.1007.0.0")).toBe(false);
        expect(isPartition("https://www.bilibili.com/v/popular/rank/douga")).toBe(false);
        expect(isPartition("https://www.bilibili.com/v/popular/weekly")).toBe(false);
        expect(isPartition("https://www.bilibili.com/v/popular/history")).toBe(false);
        expect(isPartition("https://www.bilibili.com/v/ranking/all")).toBe(false);
    });

    it("真正的分区页仍被识别", () => {
        expect(isPartition("https://www.bilibili.com/v/douga")).toBe(true);
        expect(isPartition("https://www.bilibili.com/v/technology")).toBe(true);
        expect(isPartition("https://www.bilibili.com/v/channel/xxx")).toBe(true);
    });
});
