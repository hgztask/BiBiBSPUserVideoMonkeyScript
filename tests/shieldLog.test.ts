import {describe, expect, it} from "vitest";
import {
  areShieldLogRecordsSame,
  cloneSerializable,
  createShieldLogRecord,
  formatShieldMessage,
  getShieldCategory,
  jsonDeepEqual
} from "../src/web/core/shieldLog.ts";

describe("统一屏蔽日志", () => {
  it("生成统一正文并省略空字段", () => {
    const event = {
      source: "响应层过滤" as const,
      sourceLabel: "首页推荐",
      ruleType: "模糊标题(直播间)",
      matching: "深塔",
      objectType: "直播间" as const,
      data: {name: "主播", uid: 2447278, roomid: 123456, title: "第一次打深塔！"},
      original: {title: "第一次打深塔！"}
    };
    expect(formatShieldMessage(event)).toContain("【响应层过滤】根据模糊标题(直播间)-【深塔】-屏蔽对象【直播间】");
    expect(formatShieldMessage(event)).toContain("来源【首页推荐】");
    expect(formatShieldMessage(event)).toContain("roomid=【123456】");
  });

  it("递归快照会移除 DOM、函数、undefined 和循环引用", () => {
    const value: Record<string, unknown> = {name: "用户", el: {}, omit: undefined, fn: () => undefined};
    value.self = value;
    value.items = [1, undefined, () => undefined, 2];
    expect(cloneSerializable(value)).toEqual({name: "用户", items: [1, 2]});
  });

  it("深度比较不受对象字段顺序影响", () => {
    expect(jsonDeepEqual({a: 1, b: {c: 2}}, {b: {c: 2}, a: 1})).toBe(true);
  });

  it("按来源推导分类", () => {
    expect(getShieldCategory("响应层过滤", "评论")).toBe("响应层过滤");
    expect(getShieldCategory("DOM层过滤", "视频")).toBe("视频屏蔽");
    expect(getShieldCategory("弹幕过滤", "视频弹幕")).toBe("其他屏蔽");
  });

  it("原文不同的相同正文不会合并", () => {
    const base = {
      source: "响应层过滤" as const,
      ruleType: "正则评论",
      matching: "玩.*的",
      objectType: "评论" as const,
      data: {name: "用户", uid: 1, content: "评论"}
    };
    const first = createShieldLogRecord({...base, original: {rpid: 1}});
    const second = createShieldLogRecord({...base, original: {rpid: 2}});
    expect(areShieldLogRecordsSame(first, second)).toBe(false);
  });
});
