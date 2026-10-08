import {describe, expect, it} from "vitest";
import {cloneSerializable, createShieldLogRecord} from "../src/web/core/shieldLog.ts";

/**
 * 回归测试：屏蔽日志深拷贝含 DOM / Vue 结构数据时不能卡死
 * 复现：热门页 videoData 含 Vue 响应式实例 + DOM，首次打开主面板挂载"输出信息"页补发日志时
 * cloneSerializable 深拷贝导致主线程死循环卡死。
 */
describe("屏蔽日志深拷贝安全", () => {
    it("cloneSerializable 跳过 DOM 节点（不深拷贝元素）", () => {
        const el = document.createElement('div');
        const result = cloneSerializable({title: '视频', el, contentEl: el});
        expect(result).toEqual({title: '视频'});
    });

    it("cloneSerializable 深度保护：含自引用/共享引用的对象在限定深度内完成", () => {
        const a: Record<string, any> = {name: 'x', child: null};
        const b: Record<string, any> = {name: 'y', parent: a};
        a.child = b;
        const t0 = Date.now();
        const result = cloneSerializable(a);
        expect(Date.now() - t0).toBeLessThan(2000);
        expect(result?.name).toBe('x');
    });

    it("createShieldLogRecord 对含 DOM 的数据能完成（不卡死）", () => {
        const el = document.createElement('div');
        const t0 = Date.now();
        const record = createShieldLogRecord({
            source: "DOM层过滤",
            ruleType: "视频规则",
            objectType: "视频",
            data: {title: '视频', el, vueData: {videoData: {title: 'x'}}},
            original: {title: '视频'}
        });
        expect(Date.now() - t0).toBeLessThan(2000);
        expect(record.message).toContain('视频');
    });
});
