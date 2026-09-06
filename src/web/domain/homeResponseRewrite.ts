import localMKData, {
    getReleaseTypeCardsGm,
    isHomeResponseRewriteGm
} from "../state/localMKData.ts";
import {eventEmitter} from "../core/EventEmitter.ts";
import {shieldingVideo} from "./shielding/video.ts";
import {shieldingLiveRoom} from "./shielding/live.ts";
import type {
    HomeFeedLiveData,
    HomeFeedVideoData,
    HomeFilterItem,
    HomeItemKind
} from "../types/homeResponse.ts";

const requestType = "station-b-shield:home-response-filter-request";
const responseType = "station-b-shield:home-response-filter-response";
const targetPath = "/x/web-interface/wbi/index/top/feed/rcmd";
const responseTimeout = 800;

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

const isFiniteNumber = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value);

const toNumberOrDefault = (value: unknown): number =>
    isFiniteNumber(value) ? value : -1;

const getItemUri = (item: any): string => {
    const uri = item?.uri ?? item?.url;
    return typeof uri === "string" ? uri : "";
};

/** 只识别明确的广告字段，避免把普通业务信息误判成广告 */
const isMarkedAdItem = (item: any): boolean => {
    return item?.is_ad === true || item?.isAd === true || item?.goto === "ad" || item?.goto === "cm" ||
        item?.card_type === "ad" || item?.cardType === "ad" || item?.business_card === "ad" ||
        item?.businessCard === "ad" || item?.ad_info != null || item?.adInfo != null;
};

const toVideoItem = (item: any): HomeFeedVideoData | null => {
    if (isMarkedAdItem(item) || item?.goto !== "av" || !item?.owner || !item?.stat) return null;
    const title = typeof item?.title === "string" ? item.title : "";
    const name = typeof item?.owner?.name === "string" ? item.owner.name : "";
    const uid = Number(item?.owner?.mid);
    const bv = typeof item?.bvid === "string" ? item.bvid : "";
    const uri = getItemUri(item);
    if (!title || !name || !Number.isSafeInteger(uid) || uid <= 0 || !bv ||
        !/^https?:\/\/www\.bilibili\.com\/video\//.test(uri)) {
        return null;
    }
    return {
        title,
        name,
        uid,
        bv,
        nDuration: toNumberOrDefault(item?.duration),
        nBulletChat: toNumberOrDefault(item?.stat?.danmaku),
        nPlayCount: toNumberOrDefault(item?.stat?.view),
    };
};

const toLiveItem = (item: any): HomeFeedLiveData | null => {
    const uri = getItemUri(item);
    const liveUriMatch = uri.match(/^https?:\/\/live\.bilibili\.com\/(\d+)/);
    const roomInfo = item?.room_info ?? item?.roomInfo ?? {};
    const roomId = roomInfo?.room_id ?? roomInfo?.roomId ?? item?.room_id ?? item?.roomId ?? liveUriMatch?.[1];
    const uid = Number(roomInfo?.uid ?? roomInfo?.up_id ?? roomInfo?.anchor_id ?? item?.up_id ?? item?.anchor_id ?? item?.owner?.mid);
    const name = roomInfo?.anchor_name ?? roomInfo?.anchorName ?? roomInfo?.name ?? item?.owner?.name;
    const title = roomInfo?.title ?? roomInfo?.show?.title ?? item?.title;
    const partition = roomInfo?.area_name ?? roomInfo?.areaName ?? roomInfo?.area?.area_name;
    if (!roomId || !title || typeof title !== "string" || !name || typeof name !== "string" ||
        !Number.isSafeInteger(uid) || uid <= 0) {
        return null;
    }
    return {title, name, uid, roomId, partition};
};

const releaseTypePatterns: Array<[RegExp, string]> = [
    [/\/bangumi\//, "番剧"],
    [/\/movie\//, "电影"],
    [/\/guochuang\//, "国创"],
    [/\/variety\//, "综艺"],
    [/\/cheese\//, "课堂"],
    [/\/tv\//, "电视剧"],
    [/\/documentary\//, "纪录片"],
    [/\/manga\//, "漫画"],
];

const getReleaseType = (item: any): string | null => {
    const uri = getItemUri(item);
    for (const [pattern, type] of releaseTypePatterns) {
        if (pattern.test(uri)) return type;
    }
    return null;
};

/** 按明确业务字段分类；unknown 永远不进入响应层删除流程 */
export const classifyHomeItem = (item: any): HomeFilterItem => {
    if (isMarkedAdItem(item)) {
        return {index: -1, kind: "ad", item};
    }
    const video = toVideoItem(item);
    if (video) return {index: -1, kind: "video", item, video};
    const isLive = item?.goto === "live" || /^https?:\/\/live\.bilibili\.com\//.test(getItemUri(item));
    if (isLive) {
        const live = toLiveItem(item);
        if (live) return {index: -1, kind: "live", item, live};
    }
    const releaseType = getReleaseType(item);
    if (releaseType) return {index: -1, kind: "release", item, releaseType};
    return {index: -1, kind: "unknown", item};
};

interface HomeItemDecision {
    blocked: boolean;
    reason: string;
}

const getHomeItemDecision = (classified: HomeFilterItem): HomeItemDecision => {
    switch (classified.kind as HomeItemKind) {
        case "ad":
            return {blocked: true, reason: "广告"};
        case "video": {
            const result = classified.video ? shieldingVideo(classified.video) : null;
            return {
                blocked: Boolean(result?.state),
                reason: result?.state ? `${result.type ?? "基础视频规则"}${result.matching ? `（${result.matching}）` : ""}` : ""
            };
        }
        case "live": {
            if (!classified.live || getReleaseTypeCardsGm().includes("直播")) {
                return {blocked: false, reason: "直播已放行"};
            }
            const result = shieldingLiveRoom(classified.live);
            return {
                blocked: result.state,
                reason: result.state ? `${result.type ?? "直播规则"}${result.matching ? `（${result.matching}）` : ""}` : ""
            };
        }
        case "release": {
            const releaseType = classified.releaseType ?? "未知发布类型";
            return {
                blocked: !getReleaseTypeCardsGm().includes(releaseType),
                reason: !getReleaseTypeCardsGm().includes(releaseType) ? `未放行${releaseType}` : `${releaseType}已放行`
            };
        }
        default:
            return {blocked: false, reason: "未知类型已放行"};
    }
};

const installPageFetchHook = (token: string): void => {
    const source = `(() => {
        const token = ${JSON.stringify(token)};
        const requestType = ${JSON.stringify(requestType)};
        const responseType = ${JSON.stringify(responseType)};
        const targetPath = ${JSON.stringify(targetPath)};
        const responseTimeout = ${responseTimeout};
        if (window.__stationBShieldHomeResponseHookInstalled) return;
        window.__stationBShieldHomeResponseHookInstalled = true;
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
                if (!response.ok || url.hostname !== 'api.bilibili.com' || url.pathname !== targetPath || !contentType.includes('json')) {
                    return response;
                }
                const originalBody = await response.clone().text();
                const responseJson = JSON.parse(originalBody);
                if (responseJson?.code !== 0 || !responseJson.data || !Array.isArray(responseJson.data.item)) {
                    return response;
                }
                const items = responseJson.data.item.map((item, index) => ({index, item}));
                const blockedIndexes = await requestFilter(items);
                if (!blockedIndexes.length) return response;
                const blocked = new Set(blockedIndexes.filter((index) => Number.isInteger(index)));
                const originalCount = responseJson.data.item.length;
                responseJson.data.item = responseJson.data.item.filter((item, index) => !blocked.has(index));
                console.log('[B站屏蔽][响应层过滤] 已修改首页推荐响应：原始' + originalCount + '条，过滤' + blocked.size + '条，剩余' + responseJson.data.item.length + '条');
                return copyResponse(response, JSON.stringify(responseJson));
            } catch (error) {
                console.warn('[station-b-shield] 首页响应过滤失败，已放行原始响应', error);
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
    const kindCounts: Record<HomeItemKind, number> = {ad: 0, video: 0, live: 0, release: 0, unknown: 0};
    const blockedCounts: Record<HomeItemKind, number> = {ad: 0, video: 0, live: 0, release: 0, unknown: 0};
    const decisions: Array<{index: number; kind: HomeItemKind; title: string; reason: string}> = [];
    data.items.forEach((entry) => {
        if (!entry || !Number.isInteger(entry.index)) return;
        const classified = classifyHomeItem(entry.item);
        classified.index = entry.index;
        kindCounts[classified.kind] += 1;
        const decision = getHomeItemDecision(classified);
        if (decision.blocked) {
            blockedIndexes.push(entry.index);
            blockedCounts[classified.kind] += 1;
            decisions.push({
                index: entry.index,
                kind: classified.kind,
                title: typeof (entry.item as any)?.title === "string" ? (entry.item as any).title : "",
                reason: decision.reason
            });
        }
    });
    const message = `[B站屏蔽][响应层过滤] 首页推荐响应：总计${data.items.length}条，分类${JSON.stringify(kindCounts)}，过滤${blockedIndexes.length}条，原因${JSON.stringify(decisions)}`;
    console.log(message);
    eventEmitter.send('打印信息', message);
    const response: FilterResponseData = {
        type: responseType,
        token: expectedToken,
        requestId: data.requestId,
        blockedIndexes,
    };
    window.postMessage(response, window.location.origin);
};

const isStandardHomePage = (): boolean => {
    const url = new URL(window.location.href);
    return url.hostname === "www.bilibili.com" && url.pathname === "/";
};

const install = (): void => {
    if (!isHomeResponseRewriteGm() || localMKData.isCompatible_BEWLY_BEWLY() || !isStandardHomePage()) return;
    const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    window.addEventListener("message", createFilterRequestHandler(token));
    installPageFetchHook(token);
};

install();

export default {install, classifyHomeItem};
