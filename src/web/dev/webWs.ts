const WS_URL: string = 'ws://127.0.0.1:9000';
const RECONNECT_DELAY: number = 2000;
let ws: WebSocket | null = null;
let reconnectTimer: number = -1;
let isManualClose: boolean = false;

// —— 消息工具 ——

/** 安全序列化：防循环引用，函数/符号转为占位描述 */
function safeStringify(value: any): string {
    const seen = new WeakSet<object>();
    try {
        const json = JSON.stringify(value, (_key, item) => {
            if (typeof item === 'object' && item !== null) {
                if (seen.has(item)) return '[循环引用]';
                seen.add(item);
            }
            if (typeof item === 'function') return `[函数 ${item.name || '匿名'}]`;
            if (typeof item === 'symbol') return item.toString();
            return item;
        });
        return json ?? String(value);
    } catch {
        return String(value);
    }
}

function formatArgs(args: any[]): string {
    return args.map((arg) => (typeof arg === 'string' ? arg : safeStringify(arg))).join(' ');
}

function send(data: Record<string, unknown>): void {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }
}

// —— 页面 console 转发：原始输出保留，连接期间同步回传服务端 ——

type Level = 'log' | 'warn' | 'error';

const originConsole: Record<Level, (...args: any[]) => void> = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
};

function installConsoleForwarding(): void {
    (['log', 'warn', 'error'] as Level[]).forEach((level) => {
        console[level] = (...args: any[]): void => {
            originConsole[level](...args);
            send({type: 'log', level, text: formatArgs(args)});
        };
    });
}

// —— 运行时错误转发 ——

function installErrorForwarding(): void {
    // 连续相同的错误只回传一次，避免页面自身错误刷屏
    let lastErrorText = '';
    const forwardError = (text: string): void => {
        if (text === lastErrorText) return;
        lastErrorText = text;
        send({type: 'error', text});
    };
    window.addEventListener('error', (e: ErrorEvent) => {
        forwardError(`${e.message} @ ${e.filename}:${e.lineno}:${e.colno}`);
    });
    window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
        forwardError(`未处理的 Promise 拒绝: ${safeStringify(e.reason)}`);
    });
}

function connectWebSocket(): void {
    if (ws) ws.close();
    ws = new WebSocket(WS_URL);
    ws.onopen = (): void => {
        originConsole.log('✅ 油猴已连接 WebSocket');
        send({type: 'hello', url: location.href, title: document.title});
        clearTimeout(reconnectTimer);
    };
    ws.onmessage = (e: MessageEvent): void => {
        try {
            const data: any = JSON.parse(e.data);
            // 兼容新协议 {type:'code'} 与旧协议 {ok, code}
            const code: string | undefined = data.type === 'code' ? data.code : (data.ok ? data.code : undefined);
            if (code !== undefined) {
                runInTampermonkey(code);
            } else if (data.ok === false) {
                originConsole.error('服务端构建失败', data.msg);
                send({type: 'error', text: `服务端构建失败: ${data.msg}`});
            } else {
                originConsole.warn('未识别的服务端消息');
            }
        } catch (err: any) {
            originConsole.error('消息处理失败', err);
        }
    };

    ws.onclose = (): void => {
        originConsole.log('🔌 WebSocket 已断开');
        if (!isManualClose) {
            reconnectTimer = setTimeout(connectWebSocket, RECONNECT_DELAY);
            originConsole.log(`⏳ ${RECONNECT_DELAY / 1000}秒后自动重连...`);
        }
    };

    ws.onerror = (err: Event): void => {
        originConsole.error('❌ WebSocket 错误', err);
        ws?.close();
    };
}

const runInTampermonkey = (code: string): void => {
    try {
        const fn: () => unknown = function () {
            return eval(code);
        };
        const result = fn.call(window);
        send({type: 'eval-result', text: safeStringify(result)});
    } catch (e: any) {
        originConsole.error('测试代码执行失败', e);
        send({type: 'error', text: `测试代码执行失败: ${e?.stack || e?.message || String(e)}`});
    }
};

function wsBuild(): void {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('build');
        originConsole.log('已发送手动构建指令（服务端修改文件会自动推送，通常无需手动触发）');
    } else {
        originConsole.log('❌ WebSocket 未连接，无法触发构建');
    }
}

(unsafeWindow as any).wsBuild = wsBuild;
// 测试脚本可主动回传结构化结果：__wsReport({任意可序列化数据})（沙箱与页面 window 都挂载）
const __wsReport = (data: unknown): void => {
    send({type: 'custom', data});
};
(window as any).__wsReport = __wsReport;
(unsafeWindow as any).__wsReport = __wsReport;

installConsoleForwarding();
installErrorForwarding();

export default {
    connectWebSocket,
    stopWsConnect(): void {
        isManualClose = true;
        ws?.close();
        clearTimeout(reconnectTimer);
    },
}
