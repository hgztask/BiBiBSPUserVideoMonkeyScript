import {eventEmitter} from "./EventEmitter.ts";

export const SHIELD_LOG_EVENT = "屏蔽日志";

export type ShieldSource = "响应层过滤" | "DOM层过滤" | "弹幕过滤" | "屏蔽";
export type ShieldCategory = "响应层过滤" | "视频屏蔽" | "评论屏蔽" | "直播间屏蔽" | "其他屏蔽";
export type ShieldObjectType =
    | "评论"
    | "视频"
    | "直播间"
    | "视频弹幕"
    | "直播弹幕"
    | "动态"
    | "私信"
    | "热搜关键词"
    | "页面元素"
    | "广告"
    | "发布卡片";

export interface ShieldLogEvent {
    source: ShieldSource;
    ruleType: string;
    matching?: string | number | boolean | null;
    objectType: ShieldObjectType;
    data: object;
    original?: unknown;
    sourceLabel?: string;
}

export interface ShieldLogRecord extends ShieldLogEvent {
    category: ShieldCategory;
    message: string;
    htmlMessage: string;
    normalizedData: Record<string, unknown>;
    normalizedOriginal?: JsonValue;
    firstSeenAt: string;
    updatedAt?: string;
    count: number;
}

export type JsonValue = string | number | boolean | null | JsonValue[] | {[key: string]: JsonValue};

const sources: ShieldSource[] = ["响应层过滤", "DOM层过滤", "弹幕过滤", "屏蔽"];

const objectTypes: ShieldObjectType[] = [
    "评论", "视频", "直播间", "视频弹幕", "直播弹幕", "动态", "私信", "热搜关键词", "页面元素", "广告", "发布卡片"
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value);

const isMeaningful = (value: unknown): boolean =>
    value !== undefined && value !== null && value !== "";

/** 递归生成可安全展示和比较的 JSON 快照，跳过 DOM、函数及循环引用字段。 */
export const cloneSerializable = (value: unknown, ancestors = new WeakSet<object>()): JsonValue | undefined => {
    if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return value;
    }
    if (typeof value === "bigint") return undefined;
    if (value instanceof Date) return value.toJSON();
    if (typeof value !== "object" || ancestors.has(value)) return undefined;

    ancestors.add(value);
    try {
        if (Array.isArray(value)) {
            const result: JsonValue[] = [];
            for (const item of value) {
                const cloned = cloneSerializable(item, ancestors);
                if (cloned !== undefined) result.push(cloned);
            }
            return result;
        }
        const result: {[key: string]: JsonValue} = {};
        for (const [key, item] of Object.entries(value)) {
            if (key === "el" || typeof item === "function" || item === undefined) continue;
            const cloned = cloneSerializable(item, ancestors);
            if (cloned !== undefined) result[key] = cloned;
        }
        return result;
    } finally {
        ancestors.delete(value);
    }
};

export const isNonEmptyJsonValue = (value: JsonValue | undefined): value is JsonValue => {
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object") return Object.keys(value).length > 0;
    return true;
};

export const normalizeJson = (value: unknown): JsonValue | undefined => {
    const cloned = cloneSerializable(value);
    return isNonEmptyJsonValue(cloned) ? cloned : undefined;
};

const sortJson = (value: JsonValue): JsonValue => {
    if (Array.isArray(value)) return value.map(sortJson);
    if (value !== null && typeof value === "object") {
        return Object.keys(value).sort().reduce<{[key: string]: JsonValue}>((result, key) => {
            result[key] = sortJson(value[key]);
            return result;
        }, {});
    }
    return value;
};

export const jsonDeepEqual = (left: JsonValue | undefined, right: JsonValue | undefined): boolean => {
    if (left === undefined || right === undefined) return left === right;
    return JSON.stringify(sortJson(left)) === JSON.stringify(sortJson(right));
};

export const getShieldCategory = (source: ShieldSource, objectType: ShieldObjectType): ShieldCategory => {
    if (source === "响应层过滤") return "响应层过滤";
    if (source === "DOM层过滤") {
        if (objectType === "视频") return "视频屏蔽";
        if (objectType === "评论") return "评论屏蔽";
        if (objectType === "直播间") return "直播间屏蔽";
    }
    return "其他屏蔽";
};

export const isShieldLogEvent = (event: unknown): event is ShieldLogEvent => {
    if (!isRecord(event)) return false;
    return sources.includes(event.source as ShieldSource)
        && typeof event.ruleType === "string"
        && event.ruleType.trim() !== ""
        && objectTypes.includes(event.objectType as ShieldObjectType)
        && isRecord(event.data);
};

const matchingText = (matching: ShieldLogEvent["matching"]): string =>
    isMeaningful(matching) ? `-【${String(matching)}】` : "";

const textValue = (data: Record<string, unknown>, key: string): string | null => {
    const value = data[key];
    return isMeaningful(value) ? String(value) : null;
};

const numericValue = (data: Record<string, unknown>, key: string): string | null => {
    const value = data[key];
    if (typeof value === "number" && Number.isFinite(value) && value > 0) return String(value);
    if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return value;
    return null;
};

const getDetails = (event: ShieldLogEvent): Array<[string, string]> => {
    const data = event.data as Record<string, unknown>;
    const details: Array<[string, string]> = [];
    const name = textValue(data, "name");
    const uid = numericValue(data, "uid");
    const bvid = textValue(data, "bvid") ?? textValue(data, "bv");
    const roomid = textValue(data, "roomid") ?? textValue(data, "roomId");
    const title = textValue(data, "title");
    const content = textValue(data, "content") ?? textValue(data, "text");
    const sourceLabel = event.source === "响应层过滤" ? textValue(data, "sourceLabel") ?? event.sourceLabel : null;

    if (sourceLabel) details.push(["来源", sourceLabel]);
    if (name) details.push(["name=", name]);
    if (uid) details.push(["uid=", uid]);
    if (bvid) details.push(["bvid=", bvid]);
    if (roomid) details.push(["roomid=", roomid]);
    if (event.objectType === "评论" && content) details.push(["评论", content]);
    else if (event.objectType === "视频弹幕" || event.objectType === "直播弹幕") {
        if (content) details.push(["内容", content]);
    } else if (event.objectType === "热搜关键词") {
        details.push(["关键词", textValue(data, "keyword") ?? content ?? ""]);
    } else if (event.objectType === "页面元素") {
        details.push(["详情", textValue(data, "target") ?? content ?? ""]);
    } else if (event.objectType === "动态" || event.objectType === "私信") {
        if (content) details.push(["内容", content]);
    } else if (title) {
        details.push(["标题", title]);
    } else if (content) {
        details.push(["详情", content]);
    }
    return details.filter(([, value]) => value !== "");
};

export const formatShieldMessage = (event: ShieldLogEvent): string => {
    const source = `【${event.source}】`;
    const rule = `根据${event.ruleType}${matchingText(event.matching)}`;
    const object = `屏蔽对象【${event.objectType}】`;
    const details = getDetails(event).map(([key, value]) => `${key}【${value}】`).join(" ");
    return source + [rule, object, details].filter(Boolean).join("-");
};

const escapeHtml = (value: string): string => value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const safeUrl = (value: unknown, kind: "space" | "video" | "live"): string | null => {
    if (typeof value !== "string") return null;
    const prefix = kind === "space"
        ? "https://space.bilibili.com/"
        : kind === "video" ? "https://www.bilibili.com/video/" : "https://live.bilibili.com/";
    return value.startsWith(prefix) ? value : null;
};

const htmlField = (key: string, value: string, event: ShieldLogEvent): string => {
    const data = event.data as Record<string, unknown>;
    let content = escapeHtml(value);
    if (key === "uid=" && numericValue(data, "uid")) {
        content = `<a href="https://space.bilibili.com/${escapeHtml(numericValue(data, "uid")!)}" target="_blank" rel="noopener">${content}</a>`;
    }
    if (key === "bvid=") {
        const url = safeUrl(data.videoUrl, "video");
        if (url) content = `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${content}</a>`;
    }
    if (key === "roomid=") {
        const url = safeUrl(data.liveUrl, "live");
        if (url) content = `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${content}</a>`;
    }
    return `${escapeHtml(key)}【${content}】`;
};

export const formatShieldMessageHtml = (event: ShieldLogEvent): string => {
    const details = getDetails(event).map(([key, value]) => htmlField(key, value, event)).join(" ");
    return escapeHtml(`【${event.source}】`) + [
        escapeHtml(`根据${event.ruleType}`) + escapeHtml(matchingText(event.matching)),
        escapeHtml(`屏蔽对象【${event.objectType}】`),
        details
    ].filter(Boolean).join("-");
};

export const formatDateTime = (date = new Date()): string => {
    const pad = (value: number): string => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} `
        + `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const createShieldLogRecord = (event: ShieldLogEvent, now = new Date()): ShieldLogRecord => {
    const normalizedData = (normalizeJson(event.data) as Record<string, unknown> | undefined) ?? {};
    const normalizedOriginal = normalizeJson(event.original);
    const normalizedEvent: ShieldLogEvent = {...event, data: normalizedData, original: normalizedOriginal};
    return {
        ...normalizedEvent,
        category: getShieldCategory(event.source, event.objectType),
        message: formatShieldMessage(normalizedEvent),
        htmlMessage: formatShieldMessageHtml(normalizedEvent),
        normalizedData,
        normalizedOriginal,
        firstSeenAt: formatDateTime(now),
        count: 1
    };
};

export const areShieldLogRecordsSame = (left: ShieldLogRecord, right: ShieldLogRecord): boolean =>
    left.category === right.category
    && left.source === right.source
    && left.message === right.message
    && jsonDeepEqual(left.normalizedOriginal, right.normalizedOriginal);

/** 统一事件入口，业务模块只负责提交结构化屏蔽数据。 */
export const sendShieldLog = (event: ShieldLogEvent): void => {
    if (!isShieldLogEvent(event)) {
        console.error("屏蔽日志事件无效", event);
        return;
    }
    eventEmitter.send(SHIELD_LOG_EVENT, event);
};

export const isValidSource = (value: unknown): value is ShieldSource => sources.includes(value as ShieldSource);
export const isValidObjectType = (value: unknown): value is ShieldObjectType => objectTypes.includes(value as ShieldObjectType);
