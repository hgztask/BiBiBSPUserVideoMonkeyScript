import {WebSocketServer} from 'ws'
import os from 'os'
import msgIndex from "./msg-index.js";

// 获取本机IP
function getLocalIP() {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address
            }
        }
    }
    return '0.0.0.0'
}

const LOCAL_IP = getLocalIP()
const PORT = 3000

// 启动WebSocket服务
const wss = new WebSocketServer({
    host: '0.0.0.0',
    port: PORT,
})

wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress.replace('::ffff:', '')
    console.log(`来自 ${ip} 的新连接`)
    ws.on('message', (data) => {
        msgIndex.run(data.toString(), ws, wss);
    })
})

console.log(`WebSocket服务运行在:
  本机访问: ws://localhost:${PORT}
  局域网访问: ws://${LOCAL_IP}:${PORT}`)

