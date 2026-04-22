// ==UserScript==
// @grant        unsafeWindow
// @connect      127.0.0.1
// @unsafeWindow
// ==/UserScript==

// 配置项
const WS_URL = 'ws://127.0.0.1:9000';
const RECONNECT_DELAY = 2000; // 重连间隔
let ws = null;
let reconnectTimer = -1;
let isManualClose = false; // 手动关闭不重连

function connectWebSocket() {
    if (ws) ws.close();
    ws = new WebSocket(WS_URL);
    ws.onopen = () => {
        console.log('✅ 油猴已连接 WebSocket');
        clearTimeout(reconnectTimer);
    };
    ws.onmessage = (e) => {
        const data = e.data;
        try {
            const parse = JSON.parse(data);
            if (parse.ok) {
                runInTampermonkey(parse.code);
            } else {
                console.error('接受内容不是json', parse.msg)
            }
        } catch (err) {
            console.error('执行失败', err);
        }
    };

    // 连接关闭 → 自动重连
    ws.onclose = () => {
        console.log('🔌 WebSocket 已断开');
        if (!isManualClose) {
            reconnectTimer = setTimeout(connectWebSocket, RECONNECT_DELAY);
            console.log(`⏳ ${RECONNECT_DELAY / 1000}秒后自动重连...`);
        }
    };

    // 连接错误 → 自动重连
    ws.onerror = (err) => {
        console.error('❌ WebSocket 错误', err);
        ws?.close();
    };
}

const runInTampermonkey = (code) => {
    const fn = function () {
        eval(code);
    };
    fn.call(window);
};

function wsBuild() {
    // 仅连接成功时发送消息
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send('build');
    } else {
        console.log('❌ WebSocket 未连接，无法触发构建');
    }
}

unsafeWindow.wsBuild = wsBuild;

export default {
    connectWebSocket,
    stopWsConnect() {
        isManualClose = true;
        ws?.close();
        clearTimeout(reconnectTimer);
    },
}