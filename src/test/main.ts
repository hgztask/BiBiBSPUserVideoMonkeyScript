// WebSocket 测试入口：直播分区页饥饿问题探针
//
// 验证目标（对应响应过滤 + 手动按钮方案的关键前提）：
// 1. getList 请求走 fetch 还是 XHR
// 2. getList 响应结构（列表字段、分页标记、首项字段）
// 3. 删除大部分卡片后页面是否自动续载（响应过滤路线的自愈假设）
// 4. dispatchEvent(resize) 能否触发页面续载（手动按钮的防御式触发原理）
// 5. scrollTo 微扰 / 真实布局扰动能否触发续载
//
// 注意：探针会删除页面上大部分直播间卡片用于模拟饥饿，测试完成后请手动刷新页面还原。

const isLiveSection = location.href.includes('live.bilibili.com/p/eden/area-tags')

if (!isLiveSection) {
    console.log('[饥饿探针] 当前页面不是直播分区页（' + location.href + '），跳过执行')
} else {
    // 注入页面上下文：hook 必须在页面 window 上才能拦到 Vue 应用的请求
    const probeSource = `
(() => {
    if (window.__starvationProbeInstalled) { console.log('[饥饿探针] 已安装，跳过重复执行'); return; }
    window.__starvationProbeInstalled = true;
    const report = (stage, data) => {
        try { window.__wsReport && window.__wsReport({probe: 'liveSectionStarvation', stage, data}); } catch (e) {}
        console.log('[饥饿探针][' + stage + '] ' + JSON.stringify(data));
    };
    const calls = {fetch: 0, xhr: 0, detail: []};
    const matchUrl = (u) => typeof u === 'string' && u.includes('/xlive/web-interface/v1/second/getList');
    const summarizeResponse = (text) => {
        try {
            const j = JSON.parse(text);
            const d = j.data || {};
            const keys = Object.keys(d);
            let listKey = null, listLen = 0, firstItemKeys = null;
            for (const k of keys) {
                const v = d[k];
                if (Array.isArray(v) && v.length && typeof v[0] === 'object') {
                    listKey = k; listLen = v.length; firstItemKeys = Object.keys(v[0]).slice(0, 50); break;
                }
            }
            return {code: j.code, dataKeys: keys, listKey, listLen, firstItemKeys, hasMore: d.has_more ?? d.hasMore ?? null};
        } catch (e) {
            return {parseError: String(e).slice(0, 120), rawHead: String(text).slice(0, 150)};
        }
    };
    // —— fetch hook ——
    const rawFetch = window.fetch;
    window.fetch = function (...args) {
        const url = typeof args[0] === 'string' ? args[0] : ((args[0] && args[0].url) || '');
        const p = rawFetch.apply(this, args);
        if (matchUrl(url)) {
            calls.fetch++;
            p.then(r => r.clone().text().then(t => { calls.detail.push({transport: 'fetch', summary: summarizeResponse(t)}); }).catch(() => {}));
        }
        return p;
    };
    // —— XHR hook ——
    const rawOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (matchUrl(url)) {
            calls.xhr++;
            this.addEventListener('load', function () {
                try { calls.detail.push({transport: 'xhr', summary: summarizeResponse(this.responseText)}); } catch (e) {}
            });
        }
        return rawOpen.apply(this, arguments);
    };
    // —— 滚动载体探测：记录真实滚动事件的 target ——
    const scrollTargets = [];
    window.addEventListener('scroll', (e) => {
        const t = e.target;
        const name = t === document ? 'document' : (t === window ? 'window' : (t && t.nodeName) + '.' + String(t && t.className && t.className.toString().slice(0, 40)));
        if (!scrollTargets.includes(name)) scrollTargets.push(name);
    }, true);

    const findScrollers = () => [...document.querySelectorAll('#room-card-list, #room-card-list *')].filter(el => {
        const s = getComputedStyle(el);
        return /(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight;
    });

    const state = (label) => {
        const list = document.querySelector('#room-card-list');
        const cards = document.querySelectorAll('#room-card-list>div');
        return {
            label,
            cardCount: cards.length,
            listScrollHeight: list ? list.scrollHeight : null,
            listClientHeight: list ? list.clientHeight : null,
            bodyScrollHeight: document.body.scrollHeight,
            innerHeight: window.innerHeight,
            getListCalls: {fetch: calls.fetch, xhr: calls.xhr}
        };
    };
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    // 等响应到达并计入统计
    const settle = async () => { await wait(2500); };

    (async () => {
        report('阶段0-初始状态', state('init'));
        // 阶段1：真实滚动到底，触发一次页面自然加载（确认传输协议 + 响应结构）
        const before = calls.fetch + calls.xhr;
        window.scrollTo(0, document.body.scrollHeight);
        findScrollers().forEach(el => { el.scrollTop = el.scrollHeight; });
        await settle();
        report('阶段1-真实滚动后', Object.assign(state('afterScroll'), {
            newRequests: calls.fetch + calls.xhr - before,
            scrollEventTargets: scrollTargets,
            lastResponse: calls.detail[calls.detail.length - 1] ?? null
        }));
        // 阶段2：模拟饥饿——删除大部分卡片只留 2 个（模拟脚本 el.remove() 的效果）
        const cards = [...document.querySelectorAll('#room-card-list>div')];
        cards.slice(2).forEach(el => el.remove());
        await wait(300);
        report('阶段2-删除卡片后', state('afterRemove'));
        // 阶段3：静置等待，检验页面是否自动续载（IO 哨兵自愈假设）
        const before3 = calls.fetch + calls.xhr;
        await settle();
        report('阶段3-静置2.5s后', Object.assign(state('waitAuto'), {
            newRequests: calls.fetch + calls.xhr - before3,
            autoHealed: (calls.fetch + calls.xhr - before3) > 0
        }));
        // 阶段4：dispatchEvent(resize)——手动改窗口有效的原理是否等于 resize 事件
        const before4 = calls.fetch + calls.xhr;
        window.dispatchEvent(new Event('resize'));
        await settle();
        report('阶段4-dispatchResize后', Object.assign(state('afterResize'), {
            newRequests: calls.fetch + calls.xhr - before4,
            resizeWorked: (calls.fetch + calls.xhr - before4) > 0
        }));
        // 阶段5：scrollTo 微扰（饥饿态下无滚动空间，预期无效，作为对照）
        const before5 = calls.fetch + calls.xhr;
        window.scrollTo(0, 1);
        await wait(200);
        window.scrollTo(0, 0);
        findScrollers().forEach(el => { el.scrollTop = 1; el.scrollTop = 0; });
        await settle();
        report('阶段5-scrollTo微扰后', Object.assign(state('afterNudge'), {
            newRequests: calls.fetch + calls.xhr - before5,
            nudgeWorked: (calls.fetch + calls.xhr - before5) > 0
        }));
        // 阶段6：真实布局扰动（padding 变化触发 reflow + ResizeObserver/IO 重评，模拟真实 resize 的布局效果）
        const before6 = calls.fetch + calls.xhr;
        const list = document.querySelector('#room-card-list');
        if (list) {
            list.style.paddingBottom = '2px';
            await wait(300);
            list.style.paddingBottom = '';
        }
        await settle();
        report('阶段6-布局扰动后', Object.assign(state('afterLayout'), {
            newRequests: calls.fetch + calls.xhr - before6,
            layoutWorked: (calls.fetch + calls.xhr - before6) > 0
        }));
        // 汇总
        report('汇总', {
            transports: {fetch: calls.fetch, xhr: calls.xhr},
            responses: calls.detail,
            note: '探针已删除大部分卡片，请手动刷新页面还原'
        });
    })().catch(e => report('探针异常', String(e && e.stack || e)));
})()`

    const script = document.createElement('script')
    script.textContent = probeSource
    ;(document.documentElement || document.head || document.body)?.appendChild(script)
    script.remove()
    console.log('[饥饿探针] 已注入直播分区页，等待各阶段结果回传……')
}
