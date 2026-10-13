import {describe, expect, it, vi} from "vitest";

/**
 * 回归测试：webWs console 转发安装防御
 *
 * 复现：Firefox 等浏览器中 console.log/warn/error 可能是"只有 getter 的只读访问器"，
 * 旧实现 installConsoleForwarding 在模块加载期直接 `console[level] = ...` 覆写，
 * 在严格模式下抛 "Cannot set property log of [object Object] which has only a getter"，
 * 该错误发生在模块加载期，会把整个 userscript 启动中断（用户侧表现为脚本完全失效）。
 *
 * 修复要点：
 * 1. 接管改为仅当 WebSocket 调试通道启用（connectWebSocket）时才执行，普通用户不触碰 console；
 * 2. 接管本身防御：getter-only 且可配置时用 defineProperty 接管，不可配置时静默跳过，绝不抛错。
 */

type ConsoleLevel = 'log' | 'warn' | 'error';
const LEVELS: ConsoleLevel[] = ['log', 'warn', 'error'];

// 模块加载前（任何改写前）的原始 console 方法，用于断言与恢复
const originals: Record<ConsoleLevel, (...args: any[]) => void> = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
};

/** 模拟 Firefox：console 方法改为只有 getter 的访问器 */
function makeGetterOnly(configurable: boolean): void {
    LEVELS.forEach((level) => {
        Object.defineProperty(console, level, {
            configurable,
            enumerable: true,
            get: () => originals[level],
        });
    });
}

/** 恢复为普通可写数据属性 */
function restoreWritable(): void {
    LEVELS.forEach((level) => {
        Object.defineProperty(console, level, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: originals[level],
        });
    });
}

describe('webWs console 转发安装防御', () => {
    it('可配置的 getter-only console 方法：defineProperty 接管，不抛错', async () => {
        vi.stubGlobal('unsafeWindow', window);
        makeGetterOnly(true);
        vi.resetModules();
        const mod = await import('../src/web/dev/webWs.ts');
        expect(() => mod.default.installConsoleForwarding()).not.toThrow();
        // 接管成功：console.log 已被替换为转发包装
        expect(console.log).not.toBe(originals.log);
        restoreWritable();
    });

    it('普通可写 console：直接赋值接管，不抛错（原路径保持可用）', async () => {
        vi.stubGlobal('unsafeWindow', window);
        restoreWritable();
        vi.resetModules();
        const mod = await import('../src/web/dev/webWs.ts');
        expect(() => mod.default.installConsoleForwarding()).not.toThrow();
        expect(console.log).not.toBe(originals.log);
    });

    it('不可配置的只读 console 方法：跳过接管，不抛错（最坏场景）', async () => {
        vi.stubGlobal('unsafeWindow', window);
        makeGetterOnly(false);
        vi.resetModules();
        const mod = await import('../src/web/dev/webWs.ts');
        expect(() => mod.default.installConsoleForwarding()).not.toThrow();
        // 接管失败但不影响原始输出：console.log 读取仍返回原函数
        expect(console.log).toBe(originals.log);
    });
});
