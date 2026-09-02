import shielding from "./shielding/main.ts";
import {eventEmitter} from "../core/EventEmitter.ts";
import output_informationTab from "../ui/output_informationTab.ts";
import type {BlockResult} from "@/types/shielding";

/**
 * 视频弹幕过滤
 *
 * 新版播放器弹幕引擎(bili-danmaku-x)在 blob Worker 内拉取并解析弹幕数据，
 * 以对象数组形态 postMessage 回主线程（元素含 stime/text/uhash 等字段）。
 * 本模块在 Worker 构造时注册首个 message 监听（早于播放器自身的监听），
 * 对弹幕列表原位剔除命中规则的元素，播放器拿到的是过滤后的列表，
 * 被屏蔽弹幕不会进入渲染队列。
 */

// ==================== CRC32 ====================
// 弹幕数据不提供uid，只提供uid字符串的CRC32十六进制哈希(uhash)，用于uid库比对
const CRC32_TABLE: number[] = (() => {
    const table: number[] = [];
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table[i] = c >>> 0;
    }
    return table;
})();

const crc32 = (str: string): number => {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < str.length; i++) {
        crc = CRC32_TABLE[(crc ^ str.charCodeAt(i)) & 0xFF] ^ (crc >>> 8);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

// 被屏蔽uid对应的uhash集合（懒加载，uid规则变更后需刷新页面生效）
let blockedUhashSet: Set<number> | null = null;
const getBlockedUhashSet = (): Set<number> => {
    if (blockedUhashSet === null) {
        blockedUhashSet = new Set<number>();
        const uidArr: number[] = GM_getValue('precise_uid', []);
        for (const uid of uidArr) {
            blockedUhashSet.add(crc32(String(uid)));
        }
    }
    return blockedUhashSet;
}

// ==================== 过滤判定 ====================

/**
 * 判定单条弹幕是否命中屏蔽规则
 * @param text {string} 弹幕文本
 * @param uhash {string} 发送者uid的CRC32十六进制哈希
 */
const isBlockedDanmaku = (text: string, uhash: string): BlockResult => {
    const hashNum = parseInt(uhash, 16);
    if (!isNaN(hashNum)) {
        // uid 白名单优先放行
        const whiteArr: number[] = GM_getValue('precise_uid_white', []);
        if (whiteArr.some(uid => crc32(String(uid)) === hashNum)) {
            return {state: false, type: ''};
        }
        // 用户uid精确库
        if (getBlockedUhashSet().has(hashNum)) {
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
 * 原位剔除弹幕列表中命中规则的元素
 * @param data {any} worker回传的弹幕列表（真数组或数字键的对象数组）
 * @returns {number} 本次剔除的数量
 */
const filterDanmakuList = (data: any): number => {
    let blocked = 0;
    const checkItem = (item: any): boolean => {
        if (!isDanmakuItem(item)) return false;
        stats.total++;
        const res = isBlockedDanmaku(item.text, item.uhash);
        if (res.state) {
            blocked++;
            const infoHtml = output_informationTab.getVideoDanmakuInfoHtml(
                res.type ?? '', res.matching ?? '', {text: item.text});
            eventEmitter.send('打印信息', infoHtml);
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
