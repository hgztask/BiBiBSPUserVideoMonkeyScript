// Edge/Chrome CDP 调试客户端（零新依赖：node 内置 http + 项目 ws 包）
// 前提：浏览器以 --remote-debugging-port=9222 启动
//
// 用法：
//   node server/cdpClient.mjs tabs                          列出页面标签
//   node server/cdpClient.mjs eval "location.href"          在标签页执行 JS（支持 --tab 关键词、--port）
//   node server/cdpClient.mjs console [秒数]                收集标签页 console 输出（默认 3 秒）
//   node server/cdpClient.mjs net [秒数] [--filter 关键词]   抓包网络请求（默认 8 秒，可配合 reload 观测页面请求）
//   node server/cdpClient.mjs rewrite [秒数] [--filter 关键词] [--reload] 响应改写冒烟测试（默认 8 秒，默认过滤首页推荐接口）
//   node server/cdpClient.mjs shot 输出.png                 截图保存为 PNG
//   node server/cdpClient.mjs reload                        刷新标签页
//   node server/cdpClient.mjs goto <url>                    导航到指定地址
import http from 'node:http';
import {writeFileSync} from 'node:fs';
import {WebSocket} from 'ws';

const argv = process.argv.slice(2);
const command = argv[0];

// 解析 --port / --tab 标志
function parseFlag(name) {
    const index = argv.indexOf(name);
    if (index === -1) return null;
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
        fail(`参数 ${name} 缺少值`);
    }
    argv.splice(index, 2);
    return value;
}

const portValue = parseFlag('--port') ?? '9222';
const port = Number(portValue);
if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    fail(`端口号无效：${portValue}`);
}
const tabKeyword = parseFlag('--tab');

function parseSeconds(value, defaultValue, command) {
    const seconds = Number(value ?? defaultValue);
    if (!Number.isFinite(seconds) || seconds <= 0) {
        fail(`${command} 的秒数必须是大于 0 的数字`);
    }
    return seconds;
}

function parseFilter(defaultValue, command) {
    const filterIndex = argv.indexOf('--filter');
    if (filterIndex === -1) return defaultValue;
    const value = argv[filterIndex + 1];
    if (!value || value.startsWith('--')) {
        fail(`${command} 的 --filter 缺少值`);
    }
    argv.splice(filterIndex, 2);
    return value.toLowerCase();
}

function fail(message) {
    console.error(`❌ ${message}`);
    process.exit(1);
}

/** 拉取调试目标列表 */
function getTargets() {
    return new Promise((resolve, reject) => {
        http.get({host: '127.0.0.1', port, path: '/json'}, (res) => {
            let buf = '';
            res.on('data', (chunk) => buf += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(buf));
                } catch (e) {
                    reject(new Error(`解析 /json 响应失败: ${e.message}`));
                }
            });
        }).on('error', () => reject(new Error(`无法连接 http://127.0.0.1:${port}，请确认浏览器以 --remote-debugging-port=${port} 启动`)));
    });
}

/** 按关键词挑选页面标签；无关键词时取列表第一个（通常是最近活动页） */
function pickTab(targets) {
    const pages = targets.filter((t) => t.type === 'page');
    if (pages.length === 0) fail('没有可用的页面标签');
    if (!tabKeyword) return pages[0];
    const keyword = tabKeyword.toLowerCase();
    const matched = pages.filter((t) => `${t.title} ${t.url}`.toLowerCase().includes(keyword));
    if (matched.length === 0) {
        fail(`没有匹配 "${tabKeyword}" 的标签页。现有页面：\n` +
            pages.map((t) => `  - ${t.title} ← ${t.url}`).join('\n'));
    }
    if (matched.length > 1) {
        fail(`匹配 "${tabKeyword}" 的标签页不唯一：\n` +
            matched.map((t) => `  - ${t.title} ← ${t.url}`).join('\n') +
            `\n请用更精确的关键词。`);
    }
    return matched[0];
}

/** 建立 CDP 会话，返回带自增 id 的命令发送器与事件监听 */
function connectCdp(wsUrl) {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(wsUrl);
        const listeners = {};
        let nextId = 1;
        const pending = new Map();
        socket.on('open', () => resolve({
            send(method, params = {}) {
                return new Promise((res, rej) => {
                    const id = nextId++;
                    pending.set(id, {res, rej});
                    socket.send(JSON.stringify({id, method, params}));
                });
            },
            on(event, handler) {
                (listeners[event] ??= []).push(handler);
            },
            close() {
                socket.close();
            },
        }));
        socket.on('message', (buf) => {
            const msg = JSON.parse(buf.toString());
            if (msg.id && pending.has(msg.id)) {
                const {res, rej} = pending.get(msg.id);
                pending.delete(msg.id);
                msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
            } else if (msg.method) {
                (listeners[msg.method] ?? []).forEach((fn) => fn(msg.params));
            }
        });
        socket.on('error', (e) => reject(new Error(`CDP 连接失败: ${e.message}`)));
    });
}

function formatRemoteObject(obj) {
    if (!obj) return 'undefined';
    if ('value' in obj) return typeof obj.value === 'string' ? obj.value : JSON.stringify(obj.value);
    if (obj.description) return obj.description;
    return obj.type ?? 'unknown';
}

async function main() {
    if (!command) fail('缺少命令。可用：tabs / eval / console / net / rewrite / shot / reload / goto');
    const targets = await getTargets();
    const page = pickTab(targets);

    switch (command) {
        case 'tabs': {
            targets.filter((t) => t.type === 'page').forEach((t, i) => {
                console.log(`[${i}] ${t.title}\n    ${t.url}`);
            });
            break;
        }
        case 'eval': {
            const expression = argv[1];
            if (!expression) fail('用法：eval "<js 表达式>"');
            const cdp = await connectCdp(page.webSocketDebuggerUrl);
            const result = await cdp.send('Runtime.evaluate', {
                expression,
                returnByValue: true,
                awaitPromise: true,
                userGesture: true,
            });
            if (result.exceptionDetails) {
                fail(`页面执行异常: ${result.exceptionDetails.exception?.description || result.exceptionDetails.text}`);
            }
            console.log(formatRemoteObject(result.result));
            cdp.close();
            break;
        }
        case 'console': {
            const seconds = parseSeconds(argv[1], 3, 'console');
            const cdp = await connectCdp(page.webSocketDebuggerUrl);
            await cdp.send('Runtime.enable');
            await cdp.send('Log.enable');
            console.log(`── 收集 ${page.title} 的 console 输出（${seconds} 秒）──`);
            cdp.on('Runtime.consoleAPICalled', (params) => {
                const text = params.args.map(formatRemoteObject).join(' ');
                console.log(`[${params.type}] ${text}`);
            });
            cdp.on('Log.entryAdded', (params) => {
                console.log(`[${params.entry.level}] ${params.entry.text} @ ${params.entry.url ?? ''}`);
            });
            setTimeout(() => {
                cdp.close();
                process.exit(0);
            }, seconds * 1000);
            break;
        }
        case 'net': {
            const seconds = parseSeconds(argv[1], 8, 'net');
            const filter = parseFilter(null, 'net');
            const cdp = await connectCdp(page.webSocketDebuggerUrl);
            await cdp.send('Network.enable');
            await cdp.send('Page.enable');
            // 建立 frameId → URL 映射，用于判断请求来自主 frame 还是 iframe
            const frameMap = {};
            const tree = await cdp.send('Page.getFrameTree');
            const walkFrame = (f) => {
                frameMap[f.frame.id] = (f.frame.url || '').slice(0, 60);
                (f.childFrames ?? []).forEach(walkFrame);
            };
            walkFrame(tree.frameTree);
            cdp.on('Page.frameAttached', (p) => {
                if (!p.frame || !p.frame.id) return;
                frameMap[p.frame.id] = (p.frame.url || '') + '(attached)';
            });
            console.log(`── 抓包 ${page.title} 的网络请求（${seconds} 秒${filter ? `，过滤: ${filter}` : ''}）──`);
            console.log('frame 映射:', JSON.stringify(frameMap));
            cdp.on('Network.requestWillBeSent', (params) => {
                const url = params.request.url;
                if (filter && !url.toLowerCase().includes(filter)) return;
                console.log(`→ [frame:${frameMap[params.frameId] ?? params.frameId.slice(0, 8)}] ${params.type ?? ''} ${url.slice(0, 120)}`);
            });
            cdp.on('Network.responseReceived', (params) => {
                const url = params.response.url;
                if (filter && !url.toLowerCase().includes(filter)) return;
                console.log(`← [frame:${frameMap[params.frameId] ?? params.frameId.slice(0, 8)}] ${params.type} ${params.response.status} ${url.slice(0, 120)}`);
            });
            setTimeout(() => {
                cdp.close();
                process.exit(0);
            }, seconds * 1000);
            break;
        }
        case 'rewrite': {
            const seconds = parseSeconds(argv[1], 8, 'rewrite');
            const defaultFilter = '/x/web-interface/wbi/index/top/feed/rcmd';
            const filter = parseFilter(defaultFilter, 'rewrite');
            const reload = argv.includes('--reload');
            if (reload) argv.splice(argv.indexOf('--reload'), 1);
            const cdp = await connectCdp(page.webSocketDebuggerUrl);
            let pausedCount = 0;
            let matchedCount = 0;
            let rewrittenCount = 0;
            let failedCount = 0;
            let markerSeen = false;
            let closing = false;
            const activeTasks = new Set();

            const continueRequest = async (requestId) => {
                await cdp.send('Fetch.continueRequest', {requestId}).catch(() => {});
            };

            cdp.on('Fetch.requestPaused', (params) => {
                const task = (async () => {
                    pausedCount += 1;
                    const url = params.request?.url ?? '';
                    const isMatched = !closing && url.toLowerCase().includes(filter);
                    if (!isMatched || params.responseStatusCode == null) {
                        await continueRequest(params.requestId);
                        return;
                    }
                    matchedCount += 1;
                    try {
                        const response = await cdp.send('Fetch.getResponseBody', {
                            requestId: params.requestId
                        });
                        const body = Buffer.from(
                            response.body,
                            response.base64Encoded ? 'base64' : 'utf8'
                        ).toString('utf8');
                        const data = JSON.parse(body);
                        data.__station_b_shield_rewrite_test__ = 'passed';
                        const headers = (params.responseHeaders ?? [])
                            .filter(({name}) => !/^(content-length|content-encoding|etag|content-md5|content-range|content-security-policy|content-type)$/i.test(name));
                        headers.push({name: 'content-type', value: 'application/json; charset=utf-8'});
                        await cdp.send('Fetch.fulfillRequest', {
                            requestId: params.requestId,
                            responseCode: params.responseStatusCode,
                            responsePhrase: 'OK',
                            responseHeaders: headers,
                            body: Buffer.from(JSON.stringify(data), 'utf8').toString('base64')
                        });
                        rewrittenCount += 1;
                        markerSeen = true;
                        console.log(`← 已改写响应 ${params.responseStatusCode} ${url}`);
                    } catch (error) {
                        failedCount += 1;
                        console.error(`⚠️ 响应改写失败，将继续放行：${url}，${error.message}`);
                        await continueRequest(params.requestId);
                    }
                })().finally(() => activeTasks.delete(task));
                activeTasks.add(task);
            });

            await cdp.send('Fetch.enable', {
                patterns: [{urlPattern: '*', requestStage: 'Response'}]
            });
            console.log(`── 响应改写测试 ${page.title}（${seconds} 秒，过滤: ${filter}${reload ? '，启动后刷新' : ''}）──`);
            if (reload) {
                await cdp.send('Page.reload', {ignoreCache: false});
            }
            await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
            closing = true;
            await cdp.send('Fetch.disable').catch(() => {});
            await Promise.all([...activeTasks]);
            cdp.close();
            console.log(JSON.stringify({
                command: 'rewrite',
                filter,
                reload,
                pausedCount,
                matchedCount,
                rewrittenCount,
                failedCount,
                markerSeen
            }, null, 2));
            break;
        }
        case 'shot': {
            const file = argv[1];
            if (!file) fail('用法：shot <输出.png>');
            const cdp = await connectCdp(page.webSocketDebuggerUrl);
            const result = await cdp.send('Page.captureScreenshot', {format: 'png'});
            writeFileSync(file, Buffer.from(result.data, 'base64'));
            console.log(`✅ 截图已保存：${file}`);
            cdp.close();
            break;
        }
        case 'reload': {
            const cdp = await connectCdp(page.webSocketDebuggerUrl);
            await cdp.send('Page.reload', {ignoreCache: false});
            console.log(`✅ 已刷新：${page.title}`);
            cdp.close();
            break;
        }
        case 'goto': {
            const url = argv[1];
            if (!url) fail('用法：goto <url>');
            const cdp = await connectCdp(page.webSocketDebuggerUrl);
            await cdp.send('Page.navigate', {url});
            console.log(`✅ 已导航：${url}`);
            cdp.close();
            break;
        }
        default:
            fail(`未知命令 "${command}"。可用：tabs / eval / console / net / rewrite / shot / reload / goto`);
    }
}

main().catch((e) => fail(e.message));
