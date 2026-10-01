import {describe, expect, it, vi, beforeEach, afterEach} from "vitest";

/**
 * 复现首页屏蔽链路：findElements 等待元素 → 解析卡片 → 挂屏蔽按钮。
 * 用于验证"元素延迟渲染"时屏蔽链路是否正常（回归测试，防止再次引入静默失效）。
 */

// jsdom 的定时器用真实定时器（等待元素出现需要时间）
beforeEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
});

afterEach(() => {
    vi.useRealTimers();
});

describe("home 屏蔽链路回归", () => {
    it("findElements: 元素延迟出现时能等到并返回（不被超时打断）", async () => {
        // 先设置一个较长的默认 interval，模拟真实场景
        // 让卡片在 300ms 后才插入 DOM（模拟异步渲染）
        setTimeout(() => {
            const container = document.createElement("div");
            container.className = "container is-version8";
            const feedCard = document.createElement("div");
            feedCard.className = "feed-card";
            const biliCard = document.createElement("div");
            biliCard.className = "bili-video-card";
            biliCard.innerHTML = `
                <div class="bili-video-card__info">
                  <div class="bili-video-card__info--tit">
                    <a title="测试视频标题" href="https://www.bilibili.com/video/BV1test4567">测试视频</a>
                  </div>
                  <div class="bili-video-card__info--owner">
                    <a href="//space.bilibili.com/123456">测试UP主</a>
                  </div>
                  <div class="bili-video-card__info--bottom">
                    <div class="bili-video-card__stats--text">1万</div>
                    <div class="bili-video-card__stats__duration">10:00</div>
                  </div>
                </div>
            `;
            feedCard.appendChild(biliCard);
            container.appendChild(feedCard);
            document.body.appendChild(container);
        }, 300);

        // 使用原始的 findElements（timeout 不设置，默认 -1 无限等待）
        const elUtil = (await import("../src/web/core/util/elUtil.ts")).default;
        const list = await elUtil.findElements(
            ".container.is-version8>.feed-card,.container.is-version8>.bili-feed-card",
            {interval: 100}
        );
        expect(list.length).toBeGreaterThan(0);
        expect(list[0].className).toContain("feed-card");
    });

    it("findElements: 元素立即存在时直接返回（不悬挂）", async () => {
        const card = document.createElement("div");
        card.className = "feed-card";
        document.body.appendChild(card);

        const elUtil = (await import("../src/web/core/util/elUtil.ts")).default;
        const list = await elUtil.findElements(".feed-card", {interval: 100});
        expect(list.length).toBe(1);
    });
});