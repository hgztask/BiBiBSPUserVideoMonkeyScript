import {eventEmitter} from "../model/EventEmitter.js";
import {wsLocalHost} from "../data/globalValue.js";

const socket = new WebSocket(wsLocalHost);
// 连接打开时触发
socket.addEventListener('open', (event) => {
    const msg = 'ws链接成功';
    console.log(msg, event);
    eventEmitter.send('el-msg', msg)
});
// 接收服务器消息
socket.addEventListener('message', (event) => {
    console.log('收到消息:', event.data);
    eventEmitter.send('el-alert', event.data)
});

// 错误处理
socket.addEventListener('error', (event) => {
    const msg = 'ws链接失败';
    console.error(msg, event);
    eventEmitter.send('el-msg', msg)
});

// 连接关闭时触发
socket.addEventListener('close', (event) => {
    const msg = 'ws链接关闭';
    console.log(msg, event);
    eventEmitter.send('el-msg', msg)
});
