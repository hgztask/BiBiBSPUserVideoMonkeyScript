import localMKData, {isCloseCommentBlockingGm, isCommentResponseRewriteGm, isDynamicCommentResponseRewriteGm} from "../state/localMKData.ts";
import {eventEmitter} from "../core/EventEmitter.ts";
import comments_shielding from "./shielding/comments.ts";

const requestType = "station-b-shield:comment-response-filter-request";
const responseType = "station-b-shield:comment-response-filter-response";
/** 主楼评论列表接口（wbi 与非 wbi 两个变体） */
const mainPathnames = ["/x/v2/reply/wbi/main", "/x/v2/reply/main"];
/** 楼中楼子回复列表接口 */
const subPathname = "/x/v2/reply/reply";
const responseTimeout = 800;

type CommentKind = "main" | "sub";

interface CommentFilterEntry {
    index: number;
    /** 评论唯一标识，同一评论出现多处（顶层/嵌套预览）时用于去重输出 */
    rpid?: number | string;
    item: unknown;
}

interface CommentFilterRequest {
    type: string;
    token: string;
    requestId: string;
    kind: CommentKind;
    /** 判定的数组来源：主楼普通评论 / 主楼置顶评论 */
    list: "replies" | "top_replies";
    items: CommentFilterEntry[];
}

interface CommentFilterResponse {
    type: string;
    token: string;
    requestId: string;
    blockedIndexes: number[];
}

/** 响应层可判定的评论数据，结构与 comments.ts 的 CommentData 对齐（无 el，纯数据判定） */
interface ResponseCommentData {
    content: string;
    uid: number;
    name: string;
    level: number;
    dressUpId: number;
    collectionActId: number;
    decoratePic: string | null;
}

const toCommentData = (item: any): ResponseCommentData | null => {
    const content = typeof item?.content?.message === "string" ? item.content.message : "";
    const uid = Number(item?.member?.mid);
    const name = typeof item?.member?.uname === "string" ? item.member.uname : "";
    if (!content || !Number.isSafeInteger(uid) || uid <= 0 || !name) return null;
    // 硬核会员在 DOM 层显示为等级7（level_h），响应层用 is_senior_member 对齐
    const level = item?.member?.is_senior_member === 1 ? 7 :
        (Number.isFinite(Number(item?.member?.level_info?.current_level)) ? Number(item.member.level_info.current_level) : -1);
    // 挂件数据映射装扮规则；收藏集 act_id 响应中不存在，保持 -1 使该规则跳过
    const pid = Number(item?.member?.pendant?.pid);
    const pendantImage = typeof item?.member?.pendant?.image === "string" ? item.member.pendant.image : null;
    return {
        content,
        uid,
        name,
        level,
        dressUpId: Number.isSafeInteger(pid) && pid > 0 ? pid : -1,
        collectionActId: -1,
        decoratePic: pendantImage,
    };
};

const getDecision = (entry: CommentFilterEntry): { blocked: boolean; type: string; matching: string; data: ResponseCommentData | null } => {
    const data = toCommentData(entry.item);
    if (!data) return {blocked: false, type: "unknown", matching: "", data: null};
    const result = comments_shielding.shieldingComment(data);
    // 仅看硬核会员模式下，硬核会员返回 state=true 但语义是保留，不算屏蔽
    if (result.state && result.type === "保留硬核会员") {
        return {blocked: false, type: "保留硬核会员", matching: "", data};
    }
    return {
        blocked: result.state,
        type: String(result.type ?? "评论规则"),
        matching: String(result.matching ?? ""),
        data,
    };
};

const isVideoPlayPage = (): boolean =>
    window.location.hostname === "www.bilibili.com" && window.location.pathname.startsWith("/video/");

/** 动态详情页判定（仅依赖 URL，@runAt document-start 时 title 尚未就绪，与 dynamicPage.isUrlDynamicContentPage 的 URL 部分保持一致） */
const isDynamicContentPage = (): boolean => {
    const {hostname, pathname} = window.location;
    if (hostname === "www.bilibili.com") {
        return pathname.startsWith("/opus/");
    }
    if (hostname === "t.bilibili.com") {
        return /^\/(\d+)(\/.*)?$/.test(pathname) || pathname.startsWith("/opus/");
    }
    return false;
};

const installPageFetchHook = (token: string): void => {
    const source = `(() => {
        const token = ${JSON.stringify(token)};
        const requestType = ${JSON.stringify(requestType)};
        const responseType = ${JSON.stringify(responseType)};
        const mainPathnames = ${JSON.stringify(mainPathnames)};
        const subPathname = ${JSON.stringify(subPathname)};
        const responseTimeout = ${responseTimeout};
        if (window.__stationBShieldCommentResponseHookInstalled) return;
        window.__stationBShieldCommentResponseHookInstalled = true;
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
        const requestFilter = (kind, list, items) => new Promise((resolve) => {
            const requestId = String(++requestSequence);
            const timer = setTimeout(() => { pending.delete(requestId); resolve([]); }, responseTimeout);
            pending.set(requestId, {timer, resolve});
            window.postMessage({type: requestType, token, requestId, kind, list, items}, window.location.origin);
        });
        // 接收沙箱返回的过滤结果并resolve对应pending。此前缺少该监听器，
        // 页面侧永远等不到响应（仅靠超时放行原始响应），导致评论照常渲染、再由DOM层二次屏蔽
        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;
            const data = event.data;
            if (!data || data.type !== responseType || data.token !== token) return;
            const entry = pending.get(data.requestId);
            if (!entry) return;
            clearTimeout(entry.timer);
            pending.delete(data.requestId);
            entry.resolve(Array.isArray(data.blockedIndexes) ? data.blockedIndexes : []);
        });
        // 递归收集顶层评论及其嵌套预览（楼中楼），携带 rpid 供沙箱去重
        const collectEntries = (list, keyPrefix) => {
            const entries = [];
            const walk = (items, path, depth) => {
                if (!Array.isArray(items) || depth > 3) return;
                items.forEach((item, index) => {
                    const currentPath = path + '[' + index + ']';
                    entries.push({path: keyPrefix + currentPath, rpid: item && item.rpid, item});
                    walk(item && item.replies, currentPath + '.replies', depth + 1);
                });
            };
            walk(list, '', 1);
            return entries;
        };
        // 按 rpid 集合递归剔除所有出现位置（顶层与嵌套预览）
        const filterByRpids = (items, blockedRpids) => {
            if (!Array.isArray(items)) return items;
            const kept = [];
            for (const item of items) {
                if (item && typeof item.rpid !== 'undefined' && blockedRpids.has(item.rpid)) continue;
                if (item && Array.isArray(item.replies)) item.replies = filterByRpids(item.replies, blockedRpids);
                kept.push(item);
            }
            return kept;
        };
        window.fetch = async function (...args) {
            const response = await rawFetch.apply(this, args);
            try {
                const url = new URL(response.url || args[0], window.location.href);
                if (!response.ok || url.hostname !== 'api.bilibili.com' || !url.searchParams.has('oid')) return response;
                const isMain = mainPathnames.includes(url.pathname);
                if (!isMain && url.pathname !== subPathname) return response;
                const kind = isMain ? 'main' : 'sub';
                const originalBody = await response.clone().text();
                const responseJson = JSON.parse(originalBody);
                if (responseJson?.code !== 0 || !responseJson?.data) return response;
                let changed = false;
                for (const key of ['replies', 'top_replies']) {
                    if (kind === 'sub' && key === 'top_replies') continue;
                    const list = responseJson.data[key];
                    if (!Array.isArray(list) || !list.length) continue;
                    const entries = collectEntries(list, key);
                    if (!entries.length) continue;
                    const items = entries.map((entry, index) => ({index, rpid: entry.rpid, item: entry.item}));
                    const blockedIndexes = await requestFilter(kind, key, items);
                    if (!blockedIndexes.length) continue;
                    const blockedRpids = new Set(blockedIndexes
                        .filter((index) => Number.isInteger(index))
                        .map((index) => entries[index] && entries[index].rpid)
                        .filter((rpid) => typeof rpid !== 'undefined'));
                    if (!blockedRpids.size) continue;
                    responseJson.data[key] = filterByRpids(responseJson.data[key], blockedRpids);
                    changed = true;
                    const listLabel = kind === 'sub' ? '楼中楼' : (key === 'top_replies' ? '主楼置顶' : '主楼');
                    console.log('[B站屏蔽][评论响应层过滤] ' + listLabel + '：原始' + entries.length + '个位置，过滤' + blockedRpids.size + '条评论');
                }
                if (!changed) return response;
                return copyResponse(response, JSON.stringify(responseJson));
            } catch (error) {
                console.warn('[B站屏蔽][评论响应层过滤] 处理失败，已放行原始响应', error);
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
    const data = event.data as Partial<CommentFilterRequest> | null;
    if (!data || data.type !== requestType || data.token !== expectedToken ||
        (data.kind !== "main" && data.kind !== "sub") ||
        (data.list !== "replies" && data.list !== "top_replies") || !Array.isArray(data.items)) return;
    const decisions = data.items.filter(entry => entry && Number.isInteger(entry.index))
        .map(entry => ({index: entry.index, rpid: entry.rpid, ...getDecision(entry)}));
    const label = data.kind === "sub" ? "楼中楼评论" : (data.list === "top_replies" ? "主楼置顶评论" : "主楼评论");
    const emittedRpids = new Set<number | string>();
    for (const item of decisions) {
        if (!item.blocked || !item.data) continue;
        // 同一评论在响应中出现多处时只输出一条记录
        if (item.rpid !== undefined) {
            if (emittedRpids.has(item.rpid)) continue;
            emittedRpids.add(item.rpid);
        }
        // 与 DOM 流程一致，输出屏蔽记录（评论屏蔽类型，uid 可点击跳转）
        eventEmitter.send("屏蔽评论信息", item.type, item.matching, item.data, "响应层过滤");
        const contentPreview = item.data.content.length > 50 ? `${item.data.content.slice(0, 50)}…` : item.data.content;
        console.log(`[B站屏蔽][评论响应层过滤] ${label} 根据${item.type}${item.matching ? `【${item.matching}】` : ""}屏蔽用户【${item.data.name}】uid=${item.data.uid} 评论【${contentPreview}】`);
    }
    const response: CommentFilterResponse = {
        type: responseType,
        token: expectedToken,
        requestId: data.requestId!,
        blockedIndexes: decisions.filter(item => item.blocked).map(item => item.index)
    };
    window.postMessage(response, window.location.origin);
};

const install = (): void => {
    // 关闭评论屏蔽总开关时，响应层过滤随之停用
    if (isCloseCommentBlockingGm() || localMKData.isCompatible_BEWLY_BEWLY()) return;
    const videoEnabled = isCommentResponseRewriteGm() && isVideoPlayPage();
    const dynamicEnabled = isDynamicCommentResponseRewriteGm() && isDynamicContentPage();
    if (!videoEnabled && !dynamicEnabled) return;
    const token = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    window.addEventListener("message", createFilterRequestHandler(token));
    installPageFetchHook(token);
};

install();

export default {install};
