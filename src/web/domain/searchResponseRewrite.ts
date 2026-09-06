import localMKData, {
    isClearLiveCardGm,
    isSearchResponseRewriteGm
} from "../state/localMKData.ts";
import {eventEmitter} from "../core/EventEmitter.ts";
import {shieldingVideo} from "./shielding/video.ts";
import {shieldingLiveRoom} from "./shielding/live.ts";
import type {HomeFeedLiveData, HomeFeedVideoData} from "../types/homeResponse.ts";

const requestType = "station-b-shield:search-response-filter-request";
const responseType = "station-b-shield:search-response-filter-response";
const targetPath = "/x/web-interface/wbi/search/type";
const responseTimeout = 800;

type SearchType = "video" | "live";
interface SearchFilterEntry {
    index: number;
    item: unknown;
}
interface SearchFilterRequest {
    type: string;
    token: string;
    requestId: string;
    searchType: SearchType;
    items: SearchFilterEntry[];
}
interface SearchFilterResponse {
    type: string;
    token: string;
    requestId: string;
    blockedIndexes: number[];
}

type SearchItemKind = "video" | "live" | "unknown";
interface SearchItemDecision {
    index: number;
    kind: SearchItemKind;
    title: string;
    blocked: boolean;
    reason: string;
}

const parseDuration = (value: unknown): number => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value !== "string") return -1;
    const parts = value.split(":").map(Number);
    if (parts.some(item => !Number.isFinite(item))) return -1;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return -1;
};

const parseNumber = (value: unknown): number => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
        const number = Number(value.replace(/,/g, ""));
        if (Number.isFinite(number)) return number;
    }
    return -1;
};

const toVideoData = (item: any): HomeFeedVideoData | null => {
    const title = typeof item?.title === "string" ? item.title : "";
    const name = typeof item?.author === "string" ? item.author : (typeof item?.uname === "string" ? item.uname : "");
    const uid = Number(item?.mid ?? item?.owner?.mid);
    const bv = typeof item?.bvid === "string" ? item.bvid : "";
    if (!title || !name || !Number.isSafeInteger(uid) || uid <= 0 || !bv) return null;
    return {
        title,
        name,
        uid,
        bv,
        nDuration: parseDuration(item?.duration),
        nBulletChat: parseNumber(item?.danmaku),
        nPlayCount: parseNumber(item?.play),
    };
};

const toLiveData = (item: any): HomeFeedLiveData | null => {
    const title = typeof item?.title === "string" ? item.title : "";
    const name = typeof item?.uname === "string" ? item.uname : (typeof item?.anchor_name === "string" ? item.anchor_name : "");
    const uid = Number(item?.uid ?? item?.up_id ?? item?.anchor_id);
    const roomId = item?.roomid ?? item?.room_id;
    const partition = typeof item?.area_v2_name === "string" ? item.area_v2_name :
        (typeof item?.area_name === "string" ? item.area_name : undefined);
    if (!title || !name || !Number.isSafeInteger(uid) || uid <= 0 || !roomId) return null;
    return {title, name, uid, roomId, partition};
};

const classifyItem = (searchType: SearchType, item: any): {kind: SearchItemKind; video?: HomeFeedVideoData; live?: HomeFeedLiveData} => {
    if (searchType === "video") {
        const video = toVideoData(item);
        return video ? {kind: "video", video} : {kind: "unknown"};
    }
    const live = toLiveData(item);
    return live ? {kind: "live", live} : {kind: "unknown"};
};

const getDecision = (searchType: SearchType, entry: SearchFilterEntry): SearchItemDecision => {
    const classified = classifyItem(searchType, entry.item);
    const title = typeof (entry.item as any)?.title === "string" ? (entry.item as any).title : "";
    if (classified.kind === "video") {
        const result = shieldingVideo(classified.video!);
        return {
            index: entry.index,
            kind: "video",
            title,
            blocked: result.state,
            reason: result.state ? `${result.type ?? "基础视频规则"}${result.matching ? `（${result.matching}）` : ""}` : ""
        };
    }
    if (classified.kind === "live") {
        if (!isClearLiveCardGm()) {
            return {index: entry.index, kind: "live", title, blocked: false, reason: "直播卡片已放行"};
        }
        const result = shieldingLiveRoom(classified.live!);
        return {
            index: entry.index,
            kind: "live",
            title,
            blocked: result.state,
            reason: result.state ? `${result.type ?? "直播规则"}${result.matching ? `（${result.matching}）` : ""}` : ""
        };
    }
    return {index: entry.index, kind: "unknown", title, blocked: false, reason: "未知结构已放行"};
};

const isSearchPage = (): boolean => window.location.hostname === "search.bilibili.com";

const installPageFetchHook = (token: string): void => {
    const source = `(() => {
        const token = ${JSON.stringify(token)};
        const requestType = ${JSON.stringify(requestType)};
        const responseType = ${JSON.stringify(responseType)};
        const targetPath = ${JSON.stringify(targetPath)};
        const responseTimeout = ${responseTimeout};
        if (window.__stationBShieldSearchResponseHookInstalled) return;
        window.__stationBShieldSearchResponseHookInstalled = true;
        const rawFetch = window.fetch;
        const pending = new Map();
        let requestSequence = 0;
        const copyResponse = (response, body) => {
            const headers = new Headers(response.headers);
            ['content-encoding', 'content-length', 'content-md5', 'content-range', 'etag', 'transfer-encoding']
                .forEach((name) => headers.delete(name));
            headers.set('content-type', 'application/json; charset=utf-8');
            return new Response(body, {status: response.status, statusText: response.statusText, headers});
        };
        const requestFilter = (searchType, items) => new Promise((resolve) => {
            const requestId = String(++requestSequence);
            const timer = setTimeout(() => { pending.delete(requestId); resolve([]); }, responseTimeout);
            pending.set(requestId, {timer, resolve});
            window.postMessage({type: requestType, token, requestId, searchType, items}, window.location.origin);
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
                if (!response.ok || url.hostname !== 'api.bilibili.com' || url.pathname !== targetPath || !url.searchParams.has('search_type')) return response;
                const searchType = url.searchParams.get('search_type');
                if (searchType !== 'video' && searchType !== 'live') return response;
                const originalBody = await response.clone().text();
                const responseJson = JSON.parse(originalBody);
                if (responseJson?.code !== 0 || !Array.isArray(responseJson?.data?.result)) return response;
                const items = responseJson.data.result.map((item, index) => ({index, item}));
                const blockedIndexes = await requestFilter(searchType, items);
                if (!blockedIndexes.length) return response;
                const blocked = new Set(blockedIndexes.filter((index) => Number.isInteger(index)));
                const originalCount = responseJson.data.result.length;
                responseJson.data.result = responseJson.data.result.filter((item, index) => !blocked.has(index));
                console.log('[B站屏蔽][搜索响应层过滤] 已修改搜索响应：原始' + originalCount + '条，过滤' + blocked.size + '条，剩余' + responseJson.data.result.length + '条');
                return copyResponse(response, JSON.stringify(responseJson));
            } catch (error) {
                console.warn('[B站屏蔽][搜索响应层过滤] 处理失败，已放行原始响应', error);
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
    const data = event.data as Partial<SearchFilterRequest> | null;
    if (!data || data.type !== requestType || data.token !== expectedToken ||
        (data.searchType !== "video" && data.searchType !== "live") || !Array.isArray(data.items)) return;
    const decisions = data.items.filter(entry => entry && Number.isInteger(entry.index))
        .map(entry => getDecision(data.searchType!, entry));
    const blockedIndexes = decisions.filter(item => item.blocked).map(item => item.index);
    const kinds = decisions.reduce((result, item) => {
        result[item.kind] += 1;
        return result;
    }, {video: 0, live: 0, unknown: 0} as Record<SearchItemKind, number>);
    const details = decisions.filter(item => item.blocked).map(({index, kind, title, reason}) => ({index, kind, title, reason}));
    const label = data.searchType === "video" ? "视频搜索" : "直播搜索";
    const message = `[B站屏蔽][搜索响应层过滤] ${label}响应：总计${data.items.length}条，分类${JSON.stringify(kinds)}，过滤${blockedIndexes.length}条，原因${JSON.stringify(details)}`;
    console.log(message);
    eventEmitter.send("打印信息", message);
    const response: SearchFilterResponse = {type: responseType, token: expectedToken, requestId: data.requestId!, blockedIndexes};
    window.postMessage(response, window.location.origin);
};

const install = (): void => {
    if (!isSearchResponseRewriteGm() || localMKData.isCompatible_BEWLY_BEWLY() || !isSearchPage()) return;
    const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    window.addEventListener("message", createFilterRequestHandler(token));
    installPageFetchHook(token);
};

install();

export default {install};
