import shielding from "./shielding/main.ts";
import {eventEmitter} from "../core/EventEmitter.ts";
import output_informationTab from "../ui/output_informationTab.ts";
import crc32Util from "../core/util/crc32Util.ts";
import bFetch from "../core/http/bFetch.ts";
import type {BlockResult} from "@/types/shielding";

const {crc32} = crc32Util;

/**
 * 视频弹幕过滤
 *
 * 新版播放器弹幕引擎(bili-danmaku-x)在 blob Worker 内拉取并解析弹幕数据，
 * 以对象数组形态 postMessage 回主线程（元素含 stime/text/uhash 等字段）。
 * 本模块在 Worker 构造时注册首个 message 监听（早于播放器自身的监听），
 * 对弹幕列表原位剔除命中规则的元素，播放器拿到的是过滤后的列表，
 * 被屏蔽弹幕不会进入渲染队列。
 */

// ==================== 弹幕数据存储 ====================

/**
 * 已渲染弹幕的数据存储（key: dmid），供弹幕详情检查器查询
 * 仅存储过滤后幸存（即实际会渲染）的弹幕
 */
export const danmakuStore = new Map<string, any>();

// CRC32 相关工具（含 uhash 破解）见 core/util/crc32Util.ts

// 每次弹幕列表到达时重建 uid → uhash 映射，保证新增屏蔽uid立即生效，
// 同时保留真实 uid，命中 uid 库时可以直接查询用户信息，无需破解哈希
const buildBlockedUidByUhash = (): Map<number, string> => {
    const map = new Map<number, string>();
    const uidArr: number[] = GM_getValue('precise_uid', []);
    for (const uid of uidArr) {
        map.set(crc32(String(uid)), String(uid));
    }
    return map;
}

// ==================== 过滤判定 ====================

/**
 * 判定单条弹幕是否命中屏蔽规则
 * @param text {string} 弹幕文本
 * @param uhash {string} 发送者uid的CRC32十六进制哈希
 * @param blockedUidByUhash {Map<number, string>} 本次过滤使用的 uid→uhash 映射
 */
const isBlockedDanmaku = (text: string, uhash: string, blockedUidByUhash: Map<number, string>): BlockResult => {
    const hashNum = parseInt(uhash, 16);
    if (!isNaN(hashNum)) {
        // uid 白名单优先放行
        const whiteArr: number[] = GM_getValue('precise_uid_white', []);
        if (whiteArr.some(uid => crc32(String(uid)) === hashNum)) {
            return {state: false, type: ''};
        }
        // 用户uid精确库
        if (blockedUidByUhash.has(hashNum)) {
            return {state: true, type: '视频弹幕(命中uid库)', matching: text};
        }
    }
    // 文本模糊/正则（视频弹幕规则键）
    return shielding.blockExactAndFuzzyMatching(text, {
        fuzzyKey: 'videoBarrage', fuzzyTypeName: '视频弹幕(模糊)',
        regexKey: 'videoBarrageCanonical', regexTypeName: '视频弹幕(正则)'
    })
}

const isDanmakuItem = (item: any): boolean =>
    item !== null && typeof item === 'object' && typeof item.text === 'string' && typeof item.uhash === 'string'

// ==================== 统计 ====================

const stats = {lists: 0, total: 0, blocked: 0};
// 暴露统计供调试：页面控制台或 CDP 读取 __dmFilterStats
(unsafeWindow as any).__dmFilterStats = stats;

/**
 * 破解被屏蔽弹幕的发送者uid并查询用户信息，推送带用户信息的屏蔽记录到输出信息页签
 * @param res {BlockResult} 屏蔽判定结果
 * @param item {any} 被屏蔽的弹幕元素
 */
type VideoDanmakuUserInfo = { uid: string, name: string, level: number };

// 同一发送者可能命中多条弹幕，缓存整个解析流程，避免重复破解和请求用户卡片
const danmakuUserInfoCache = new Map<string, Promise<VideoDanmakuUserInfo | null>>();

const resolveDanmakuUserInfo = (uhash: string, directUid?: string): Promise<VideoDanmakuUserInfo | null> => {
    const cached = danmakuUserInfoCache.get(uhash);
    if (cached) return cached;
    const task = (async (): Promise<VideoDanmakuUserInfo | null> => {
        // uid 库命中时已有真实 uid，直接查询；文本规则命中才需要破解 uhash
        const candidates = directUid ? [directUid] : crc32Util.crackUhashCandidates(uhash, 10);
        for (const uid of candidates) {
            const user = await bFetch.fetchUserInfoByMid(uid);
            if (user) return user;
        }
        return null;
    })();
    danmakuUserInfoCache.set(uhash, task);
    return task;
}

const pushBlockedDanmakuInfo = async (res: BlockResult, item: any, blockedUid?: string): Promise<void> => {
    const user = await resolveDanmakuUserInfo(item.uhash, blockedUid);
    const infoHtml = output_informationTab.getVideoDanmakuInfoHtml(
        res.type ?? '', res.matching ?? '', {text: item.text, user, uhash: item.uhash});
    eventEmitter.send('打印信息', infoHtml);
}

/**
 * 原位剔除弹幕列表中命中规则的元素
 * @param data {any} worker回传的弹幕列表（真数组或数字键的对象数组）
 * @returns {number} 本次剔除的数量
 */
const filterDanmakuList = (data: any): number => {
    let blocked = 0;
    const blockedUidByUhash = buildBlockedUidByUhash();
    const checkItem = (item: any): boolean => {
        if (!isDanmakuItem(item)) return false;
        stats.total++;
        const res = isBlockedDanmaku(item.text, item.uhash, blockedUidByUhash);
        if (res.state) {
            blocked++;
            void pushBlockedDanmakuInfo(res, item, blockedUidByUhash.get(parseInt(item.uhash, 16)));
            return true;
        }
        return false;
    }
    if (Array.isArray(data)) {
        // 真数组：从后往前 splice 原位删除，避免产生空洞
        for (let i = data.length - 1; i >= 0; i--) {
            if (checkItem(data[i])) {
                data.splice(i, 1);
            }
        }
    } else {
        // 数字键的对象数组：原位 delete
        for (const key of Object.keys(data)) {
            if (checkItem(data[key])) {
                delete data[key];
            }
        }
    }
    return blocked;
}

// ==================== Worker 拦截 ====================

const installWorkerHook = (): void => {
    const OriginalWorker = unsafeWindow.Worker;
    const WrappedWorker = function (this: any, scriptUrl: string | URL, options?: WorkerOptions) {
        const instance = new OriginalWorker(scriptUrl as any, options);
        // 注册时机早于播放器自身的监听，可先于播放器处理消息
        instance.addEventListener('message', (e: MessageEvent) => {
            const data = e.data;
            if (data === null || typeof data !== 'object') return;
            const keys = Object.keys(data);
            if (keys.length === 0) return;
            if (!isDanmakuItem(data[keys[0]])) return;
            stats.lists++;
            stats.blocked += filterDanmakuList(data);
            // 存储过滤后幸存的弹幕，供详情检查器查询
            for (const key of Object.keys(data)) {
                const item = data[key];
                if (!isDanmakuItem(item)) continue;
                if (danmakuStore.size > 3000) danmakuStore.clear();
                danmakuStore.set(String(item.dmid ?? item.id_str ?? item.text), item);
            }
        });
        return instance;
    } as unknown as typeof Worker;
    // 保留原型链（instanceof 判断与静态属性不受影响）
    WrappedWorker.prototype = OriginalWorker.prototype;
    unsafeWindow.Worker = WrappedWorker;
}

installWorkerHook();

export default {
    stats
}
