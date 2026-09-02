import {WebSocket, WebSocketServer} from 'ws';
import {rollup} from 'rollup';
import replace from '@rollup/plugin-replace';
import esbuild from 'rollup-plugin-esbuild';
import test_plugin from '../plugin/rollup-test-plugin.js';
import tsResolve from '../plugin/tsResolve.js';
// @ts-ignore
import importContent from 'rollup-plugin-import-content';
import fs from 'fs';

interface SuccessResponse {
    code: string;
    ok: true;
}

interface ErrorResponse {
    ok: false;
    msg: string;
}

type BuildResponse = SuccessResponse | ErrorResponse;

const PORT = 9000;

function ts(): string {
    return new Date().toLocaleTimeString('zh-CN', {hour12: false});
}

const wss = new WebSocketServer({port: PORT});

// 端口占用等启动错误：给出可操作的提示而不是裸栈崩溃
wss.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`端口 ${PORT} 已被其他程序占用，ws 服务无法启动。`);
        console.error(`排查方法：netstat -ano | findstr :${PORT} 找到占用进程后结束它（注意可能是音频转发等其他自启程序）。`);
        process.exit(1);
    }
    throw err;
});

console.log(`服务启动：ws://127.0.0.1:${PORT}（热更新模式：修改 src/ 下文件自动构建并推送到页面执行）`);

let latestCode: string | null = null;
let building = false;
let rebuildQueued = false;

async function buildCode(): Promise<string> {
    // 内存编译 src/test/main.ts 测试入口（支持 TS 语法与 @/ 别名导入 src/web 模块）
    const bundle = await rollup({
        input: 'src/test/main.ts',
        // vue/dexie 由脚本头 @require 加载为全局变量，测试脚本可直接引用
        external: ['vue', 'dexie'],
        plugins: [
            tsResolve(),
            // 使用 replace 插件定义全局变量
            replace({
                __DEV__: 'true',
                preventAssignment: true,
            }),
            esbuild({
                target: 'es2020',
                charset: 'utf8', // 明确使用 UTF-8 编码
                minify: false,
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
        globals: {
            vue: 'Vue',
            dexie: 'Dexie'
        }
    });
    return output[0].code; // 返回编译后的JS代码
}

function broadcastCode(): void {
    if (!latestCode) return;
    const message = JSON.stringify({type: 'code', code: latestCode});
    let sent = 0;
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
            sent++;
        }
    });
    if (sent > 0) console.log(`[${ts()}] 🚀 最新测试代码已推送给 ${sent} 个客户端`);
}

async function buildAndBroadcast(reason: string): Promise<void> {
    if (building) {
        rebuildQueued = true;
        return;
    }
    building = true;
    try {
        const code = await buildCode();
        latestCode = code;
        console.log(`[${ts()}] ✅ 构建成功（${reason}）`);
        broadcastCode();
    } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        console.error(`[${ts()}] ❌ 构建失败（${reason}），保留上次产物，下次变更会重试：\n${errorMsg}`);
    } finally {
        building = false;
        if (rebuildQueued) {
            rebuildQueued = false;
            void buildAndBroadcast('防抖合并的再次变更');
        }
    }
}

// 监听 src/ 下文件变更，防抖后自动构建推送
let watchTimer: NodeJS.Timeout | null = null;
fs.watch('src', {recursive: true}, () => {
    if (watchTimer) clearTimeout(watchTimer);
    watchTimer = setTimeout(() => {
        void buildAndBroadcast('文件变更');
    }, 500);
});

// 服务启动时先构建一次
void buildAndBroadcast('服务启动');

// 监听油猴连接
wss.on('connection', (ws: WebSocket) => {
    console.log(`[${ts()}] 🔌 油猴已连接（当前 ${wss.clients.size} 个）`);
    // 接入即推送当前最新构建
    if (latestCode) {
        ws.send(JSON.stringify({type: 'code', code: latestCode}));
    } else {
        void buildAndBroadcast('客户端接入但尚无产物');
    }
    ws.on('message', (msg: Buffer) => {
        const raw = msg.toString();
        if (raw === 'build') {
            void buildAndBroadcast('手动指令');
            return;
        }
        try {
            const data: Record<string, any> = JSON.parse(raw);
            switch (data.type) {
                case 'hello':
                    console.log(`[${ts()}] 📄 页面：${data.title} ← ${data.url}`);
                    break;
                case 'log':
                    console.log(`[${ts()}] 🖥 [${data.level}] ${data.text}`);
                    break;
                case 'error':
                    console.log(`[${ts()}] 💥 [页面错误] ${data.text}`);
                    break;
                case 'eval-result':
                    console.log(`[${ts()}] ↩ [返回值] ${data.text}`);
                    break;
                case 'custom':
                    console.log(`[${ts()}] 📤 [回传] ${JSON.stringify(data.data)}`);
                    break;
                default:
                    console.log(`[${ts()}] ❓ 未识别消息: ${raw.slice(0, 300)}`);
            }
        } catch {
            console.log(`[${ts()}] ❓ 非JSON消息: ${raw.slice(0, 200)}`);
        }
    });
    ws.on('close', () => {
        console.log(`[${ts()}] 🔌 油猴断开（剩余 ${wss.clients.size} 个）`);
    });
});
