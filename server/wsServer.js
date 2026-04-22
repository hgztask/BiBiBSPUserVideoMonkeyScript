import {WebSocketServer} from 'ws';
import {rollup} from 'rollup';
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import test_plugin from "../plugin/rollup-test-plugin.js";

const wss = new WebSocketServer({port: 9000});
console.log('服务启动：ws://127.0.0.1:9000（手动触发模式）');

async function buildCode() {
    // 内存编译你的业务代码
    const bundle = await rollup({
        input: 'src/test/main.ts',
        plugins: [
            // 使用 replace 插件定义全局变量
            replace({
                __DEV__: true,
                preventAssignment: true,
            }),
            typescript({
                tsconfig: './tsconfig.json',
                declaration: false,
                outputToFilesystem: true // 显式设置，消除警告
            }),
            test_plugin({
                isDev: true,
                clearComments: true
            }),
        ]
    });
    // 内存输出代码字符串，不写磁盘
    const {output} = await bundle.generate({
        format: 'es',
        compact: true
    });
    return output[0].code; // 返回编译后的JS代码
}

// 监听油猴连接
wss.on('connection', (ws) => {
    console.log('🔌 油猴已连接');
    ws.on('message', async (msg) => {
        if (msg.toString() === 'build') {
            console.log('收到手动构建指令 → Rollup内存编译');
            try {
                const code = await buildCode();
                ws.send(JSON.stringify({code, ok: true}));
            } catch (e) {
                ws.send(JSON.stringify({ok: false, msg: e.message}));
            }
        }
    });
});