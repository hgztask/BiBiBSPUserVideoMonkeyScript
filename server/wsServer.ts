import {WebSocket, WebSocketServer} from 'ws';
import {rollup} from 'rollup';
import replace from '@rollup/plugin-replace';
import test_plugin from '../plugin/rollup-test-plugin.js';
// @ts-ignore
import importContent from 'rollup-plugin-import-content';

interface SuccessResponse {
    code: string;
    ok: true;
}

interface ErrorResponse {
    ok: false;
    msg: string;
}

type BuildResponse = SuccessResponse | ErrorResponse;

const wss = new WebSocketServer({port: 9000});
console.log('服务启动：ws://127.0.0.1:9000（手动触发模式）');

async function buildCode(): Promise<string> {
    // 内存编译你的业务代码
    const bundle = await rollup({
        input: 'src/test/main.js',
        plugins: [
            // 使用 replace 插件定义全局变量
            replace({
                __DEV__: true,
                preventAssignment: true,
            }),
            test_plugin({
                isDev: true,
                clearComments: true,
            }),
            importContent({
                fileName: ['.css'],
            }),
        ],
    });
    // 内存输出代码字符串，不写磁盘
    const {output} = await bundle.generate({
        format: 'iife',
        compact: true,
    });
    return output[0].code; // 返回编译后的JS代码
}

// 监听油猴连接
wss.on('connection', (ws: WebSocket) => {
    console.log('🔌 油猴已连接');
    ws.on('message', async (msg: Buffer) => {
        if (msg.toString() === 'build') {
            console.log('收到手动构建指令 → Rollup内存编译');
            try {
                const code = await buildCode();
                const response: SuccessResponse = {code, ok: true};
                ws.send(JSON.stringify(response));
            } catch (e: unknown) {
                const errorMsg = e instanceof Error ? e.message : String(e);
                const response: ErrorResponse = {ok: false, msg: errorMsg};
                ws.send(JSON.stringify(response));
            }
        }
    });
});
