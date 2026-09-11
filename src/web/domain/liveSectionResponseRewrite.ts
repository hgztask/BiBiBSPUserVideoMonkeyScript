import {isLiveSectionResponseRewriteGm} from "../state/localMKData.ts";
import {shieldingLiveRoom} from "./shielding/live.ts";
import {eventEmitter} from "../core/EventEmitter.ts";

// 直播分区页 getList 响应层过滤：
// 在页面渲染前剔除命中屏蔽规则的直播间，避免"渲染→删除"造成的列表高度骤降。
// 过滤后列表可能不满一屏（滚动加载饿死），由 sectionModel 的饥饿提示+补满按钮兜底：
// 检测到列表过短时按钮变红呼吸提示用户点击，点击后循环"撑高文档+真实滚动"补满一屏。
const requestType = "station-b-shield:live-section-response-filter-request";
const responseType = "station-b-shield:live-section-response-filter-response";
const targetHost = "api.live.bilibili.com";
const targetPath = "/xlive/web-interface/v1/second/getList";
// 2026-09-11：800ms 实测在部分场景下不够用（点击"加载更多"后的一批曾超时静默放行导致闪现），
// 提升至 2000ms：超时只在沙箱异常时生效，正常往返为毫秒级，不影响正常加载速度
const responseTimeout = 2000;

// 屏蔽记录输出去重：B 站分区页初始化会对同一页重复请求 getList（实测同页两次相同响应），
// 相同屏蔽指纹在短时间窗口内只输出一次，避免输出信息面板出现 ×2 合并记录
const shieldDedupWindow = 10000;
const recentShieldOutput = new Map<string, number>();

interface FilterRequestData {
    type: string;
    token: string;
    requestId: string;
    items: Array<{index: number; item: unknown}>;
}

interface FilterResponseData {
    type: string;
    token: string;
    requestId: string;
    blockedIndexes: number[];
}

/** 将 getList 响应项映射为屏蔽规则判定所需的数据结构 */
const mapToLiveRoomData = (item: any): Omit<Parameters<typeof shieldingLiveRoom>[0], 'el'> => {
    const roomid = Number(item?.roomid);
    const uid = Number(item?.uid);
    return {
        name: typeof item?.uname === "string" ? item.uname : "",
        title: typeof item?.title === "string" ? item.title : "",
        partition: typeof item?.area_name === "string" ? item.area_name : undefined,
        uid: Number.isFinite(uid) && uid > 0 ? uid : undefined,
        roomId: Number.isFinite(roomid) && roomid > 0 ? roomid : item?.roomid,
    };
};

const getLiveItemDecision = (item: unknown): {blocked: boolean; type: string; matching: string | number | boolean | null; liveData: ReturnType<typeof mapToLiveRoomData>} => {
    const liveData = mapToLiveRoomData(item);
    if (!liveData.name && !liveData.title) {
        return {blocked: false, type: "", matching: null, liveData};
    }
    const result = shieldingLiveRoom(liveData);
    return {
        blocked: result.state,
        type: result.type ?? "直播规则",
        matching: result.matching ?? "",
        liveData,
    };
};

const installPageFetchHook = (token: string): void => {
    const source = `(() => {
        const token = ${JSON.stringify(token)};
        const requestType = ${JSON.stringify(requestType)};
        const responseType = ${JSON.stringify(responseType)};
        const targetHost = ${JSON.stringify(targetHost)};
        const targetPath = ${JSON.stringify(targetPath)};
        const responseTimeout = ${responseTimeout};
        if (window.__stationBShieldLiveSectionResponseHookInstalled) return;
        window.__stationBShieldLiveSectionResponseHookInstalled = true;
        const rawFetch = window.fetch;
        const pending = new Map();
        let requestSequence = 0;

        const copyResponse = (response, body) => {
            const headers = new Headers(response.headers);
            [
                'content-encoding',
                'content-length',
                'content-md5',
                'content-range',
                'etag',
                'transfer-encoding'
            ].forEach((name) => headers.delete(name));
            headers.set('content-type', 'application/json; charset=utf-8');
            return new Response(body, {
                status: response.status,
                statusText: response.statusText,
                headers
            });
        };

        const requestFilter = (items) => new Promise((resolve) => {
            const requestId = String(++requestSequence);
            const timer = setTimeout(() => {
                pending.delete(requestId);
                console.warn('[station-b-shield] 直播分区响应过滤超时，本批放行（沙箱未在 ' + responseTimeout + 'ms 内返回判定结果）');
                resolve([]);
            }, responseTimeout);
            pending.set(requestId, {timer, resolve});
            window.postMessage({type: requestType, token, requestId, items}, window.location.origin);
        });

        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;
            const data = event.data;
            if (!data || data.type !== responseType || data.token !== token) return;
            const task = pending.get(data.requestId);
            if (!task) return;
            clearTimeout(task.timer);
            pending.delete(data.requestId);
            task.resolve(Array.isArray(data.blockedIndexes) ? data.blockedIndexes : []);
        });

        window.fetch = async function (...args) {
            const response = await rawFetch.apply(this, args);
            try {
                const url = new URL(response.url || args[0], window.location.href);
                const contentType = response.headers.get('content-type') || '';
                if (!response.ok || url.hostname !== targetHost || !url.pathname.includes(targetPath) || !contentType.includes('json')) {
                    return response;
                }
                const originalBody = await response.clone().text();
                const responseJson = JSON.parse(originalBody);
                if (responseJson?.code !== 0 || !responseJson.data || !Array.isArray(responseJson.data.list)) {
                    return response;
                }
                const items = responseJson.data.list.map((item, index) => ({index, item}));
                const blockedIndexes = await requestFilter(items);
                if (!blockedIndexes.length) return response;
                const blocked = new Set(blockedIndexes.filter((index) => Number.isInteger(index)));
                responseJson.data.list = responseJson.data.list.filter((item, index) => !blocked.has(index));
                return copyResponse(response, JSON.stringify(responseJson));
            } catch (error) {
                console.warn('[station-b-shield] 直播分区响应过滤失败，本批放行：' + (error && error.message ? error.message : String(error)));
                return response;
            }
        };
    })();`;
    const script = document.createElement("script");
    script.textContent = source;
    (document.documentElement || document.head || document.body)?.appendChild(script);
    script.remove();
};

const createFilterRequestHandler = (expectedToken: string) => (event: MessageEvent): void => {
    if (event.origin !== window.location.origin) return;
    const data = event.data as Partial<FilterRequestData> | null;
    if (!data || data.type !== requestType || data.token !== expectedToken || typeof data.requestId !== "string" || !Array.isArray(data.items)) {
        return;
    }
    const blockedIndexes: number[] = [];
    const now = Date.now();
    data.items.forEach((entry) => {
        if (!entry || !Number.isInteger(entry.index)) return;
        const decision = getLiveItemDecision(entry.item);
        if (!decision.blocked) return;
        blockedIndexes.push(entry.index);
        // 相同屏蔽记录短时间窗口内去重（同页重复请求场景），过滤行为不受影响
        const fingerprint = `${decision.liveData.uid ?? -1}-${decision.liveData.roomId}-${decision.type}-${decision.matching}`;
        const lastOutput = recentShieldOutput.get(fingerprint);
        if (lastOutput !== undefined && now - lastOutput < shieldDedupWindow) {
            return;
        }
        recentShieldOutput.set(fingerprint, now);
        eventEmitter.send('屏蔽直播信息', decision.type, decision.matching, {
            name: decision.liveData.name,
            uid: decision.liveData.uid ?? -1,
            title: decision.liveData.title,
            liveUrl: "https://live.bilibili.com/" + decision.liveData.roomId,
        }, '响应层过滤')
    });
    // 清理过期的去重记录，避免无限增长
    if (recentShieldOutput.size > 500) {
        const expireTime = now - shieldDedupWindow;
        for (const [key, time] of recentShieldOutput) {
            if (time < expireTime) recentShieldOutput.delete(key);
        }
    }
    const response: FilterResponseData = {
        type: responseType,
        token: expectedToken,
        requestId: data.requestId,
        blockedIndexes,
    };
    window.postMessage(response, window.location.origin);
};

const isLiveSectionPage = (): boolean => {
    return window.location.href.includes("live.bilibili.com/p/eden/area-tags");
};

const install = (): void => {
    if (!isLiveSectionResponseRewriteGm() || !isLiveSectionPage()) return;
    const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    window.addEventListener("message", createFilterRequestHandler(token));
    installPageFetchHook(token);
};

install();

export default {install, mapToLiveRoomData};
