const WS_URL: string = 'ws://127.0.0.1:9000';
const RECONNECT_DELAY: number = 2000;
let ws: WebSocket | null = null;
let reconnectTimer: number = -1;
let isManualClose: boolean = false;

function connectWebSocket(): void {
    if (ws) ws.close();
    ws = new WebSocket(WS_URL);
    ws.onopen = (): void => {
        console.log('✅ 油猴已连接 WebSocket');
        clearTimeout(reconnectTimer);
    };
    ws.onmessage = (e: MessageEvent): void => {
        const data: string = e.data;
        try {
            const parse: any = JSON.parse(data);
            if (parse.ok) {
                runInTampermonkey(parse.code);
            } else {
                console.error('接受内容不是json', parse.msg)
            }
        } catch (err: any) {
            console.error('执行失败', err);
        }
    };

    ws.onclose = (): void => {
        console.log('🔌 WebSocket 已断开');
        if (!isManualClose) {
            reconnectTimer = setTimeout(connectWebSocket, RECONNECT_DELAY);
            console.log(`⏳ ${RECONNECT_DELAY / 1000}秒后自动重连...`);
        }
    };

    ws.onerror = (err: Event): void => {
        console.error('❌ WebSocket 错误', err);
        ws?.close();
    };
}

const runInTampermonkey = (code: string): void => {
    const fn: () => void = function () {
        eval(code);
    };
    fn.call(window);
};

function wsBuild(): void {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('build');
    } else {
        console.log('❌ WebSocket 未连接，无法触发构建');
    }
}

(unsafeWindow as any).wsBuild = wsBuild;

export default {
    connectWebSocket,
    stopWsConnect(): void {
        isManualClose = true;
        ws?.close();
        clearTimeout(reconnectTimer);
    },
}
