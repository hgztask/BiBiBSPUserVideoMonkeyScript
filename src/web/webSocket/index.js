import {eventEmitter} from "../model/EventEmitter.js";
import {wsLocalHost} from "../data/globalValue.js";
import {isOpenDev} from "../data/localMKData.js";
import {isWsService} from "../layout/vue/debuggerMeanagementVue.js";

let socket;

const connectWs = () => {
    // 检查是否已经存在连接
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log('WebSocket 已经连接，无需重复连接');
        return;
    }
    socket = new WebSocket(wsLocalHost);
    // 连接打开时触发
    socket.addEventListener('open', (event) => {
        const msg = 'ws链接成功';
        console.log(msg, event);
        eventEmitter.send('el-notify', {
            message: msg,
            type: 'success',
            position: 'button-right'
        })
    });
    // 接收服务器消息
    socket.addEventListener('message', (event) => {
        console.log('收到消息:', event.data);
        eventEmitter.send('el-alert', event.data)
    });
    // 错误处理
    socket.addEventListener('error', (event) => {
        console.error('ws链接失败,3秒后尝试重连', event);
        socket = null;
        startTimedReconnectionWs();
    });
    // 连接关闭时触发
    socket.addEventListener('close', (event) => {
        const msg = 'ws链接关闭,3秒后尝试重连';
        socket = null;
        console.log(msg, event);
        eventEmitter.send('el-notify', {
            message: msg,
            type: 'warning',
            position: 'button-right'
        })
        startTimedReconnectionWs()
    });
}

const startTimedReconnectionWs = () => {
    setTimeout(() => {
        connectWs();
    }, 3000)
}

const sendWsMsg = (msg) => {
    if (socket === null) return
    socket?.send(msg);
}

//当开启开发者模式模式并且开启ws服务时，链接ws
if (isOpenDev() && isWsService()) {
    console.info('开发模式链接ws');
    connectWs();
}
eventEmitter.on('ws-send', sendWsMsg)

eventEmitter.on('ws-send-json', (json) => {
    sendWsMsg(JSON.stringify(json));
})
