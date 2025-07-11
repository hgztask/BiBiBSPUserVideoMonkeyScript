import gzStyleCss from '../css/gz-style.css'

/**
 * 等待一段时间
 * @param milliseconds{Number} 等待时间，单位毫秒，默认1000毫秒，即1秒
 * @returns {Promise<>}
 */
const wait = (milliseconds = 1000) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * 内容导出为文件
 * @param {String}content 内容
 * @param {String}fileName 文件名
 */
const fileDownload = (content, fileName) => {
    // 获取导出文件内容
    // 创建隐藏的下载文件链接
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', fileName);
    element.style.display = 'none';
    document.body.appendChild(element);
    // 手动触发下载
    element.click();
    // 清理dom
    document.body.removeChild(element);
}

/**
 * 保存大文本到文件
 * @param text {string} 文本内容
 * @param filename {string} 文件名
 */
export function saveTextAsFile(text, filename = 'data.txt') {
    // 创建Blob对象（处理大文本）
    const blob = new Blob([text], {type: 'text/plain'});
    // 创建下载链接
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename;
    // 触发下载
    document.body.appendChild(downloadLink);
    downloadLink.click();
    // 清理
    setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadLink.href);
    }, 100);
}

/**
 *封装file标签handle的回调，用于读取文件内容
 * @param event
 * @returns {Promise<{any,content:string|string}>}
 */
const handleFileReader = (event) => {
    return new Promise((resolve, reject) => {
        const file = event.target.files[0];
        if (!file) {
            reject('未读取到文件');
            return;
        }
        let reader = new FileReader();
        reader.onload = (e) => {
            const fileContent = e.target.result;
            resolve({file, content: fileContent});
            reader = null;
        };
        reader.readAsText(file);
    });
}

/**
 * 判断对象是否可迭代
 * 1.array可迭代
 * 2.string可迭代
 * 3.map可迭代
 * 4.set可迭代
 * 5.类数组对象可迭代
 * @param obj {any}
 * @returns {boolean}
 */
const isIterable = (obj) => {
    return obj != null && typeof obj[Symbol.iterator] === 'function';
}

/**
 * 返回当前时间
 * @returns {String}
 */
const toTimeString = () => {
    return new Date().toLocaleString();
}


/**
 * 平滑滚动到页面顶部或底部
 * @param {boolean} toTop - 是否滚动到顶部，默认为 false（滚动到底部）
 * @param {number} duration - 滚动动画的持续时间（毫秒），默认为 1000 毫秒（1 秒）
 * @returns {Promise<>} - 返回一个 Promise，滚动完成后 resolve
 */
function smoothScroll(toTop = false, duration = 1000) {
    return new Promise((resolve) => {
        const start = window.scrollY;
        const end = toTop ? 0 : document.documentElement.scrollHeight - window.innerHeight;
        const change = end - start;
        const startTime = performance.now();

        function animateScroll(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeInOutQuad = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

            window.scrollTo(0, start + change * easeInOutQuad);

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(animateScroll);
    });
}

/**
 * 防抖函数
 * @param func {function} 需要防抖的函数
 * @param wait {number} 等待时间，单位毫秒，默认为 1000毫秒
 * @returns {(function(...[*]): void)|*}
 */
function debounce(func, wait = 1000) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 *  节流函数
 * @param func {function} 需要节流的函数
 * @param limit {number} 节流时间，单位毫秒
 * @returns {(function(...[*]): void)|*}
 */
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}


/**
 * 异步节流函数
 * @param asyncFunc {function} 需要节流的异步函数
 * @param limit {number} 节流时间，单位毫秒，默认为 1000毫秒
 * @returns {(function(...[*]): Promise<void>)|*}
 */
function throttleAsync(asyncFunc, limit) {
    let isThrottled = false;
    let pendingArgs = null;
    let pendingContext = null;
    let timeoutId;
    let pendingPromiseResolve;

    const throttled = async function (...args) {
        const context = this;

        if (isThrottled) {
            // 如果已经节流，则保存当前的参数和上下文
            return new Promise((resolve) => {
                pendingArgs = args;
                pendingContext = context;
                pendingPromiseResolve = resolve;
            });
        }

        isThrottled = true;

        try {
            // 执行异步函数并等待其完成
            return await asyncFunc.apply(context, args);
        } finally {
            // 设置定时器，在 limit 时间后解除节流状态
            timeoutId = setTimeout(() => {
                isThrottled = false;

                if (pendingArgs) {
                    // 如果有等待中的调用，则立即执行它们
                    throttled.apply(pendingContext, pendingArgs).then(pendingPromiseResolve);
                    pendingArgs = null;
                    pendingContext = null;
                    pendingPromiseResolve = null;
                }
            }, limit);
        }
    };

    // 清除节流逻辑的定时器（可选）
    throttled.cancel = () => {
        clearTimeout(timeoutId);
        isThrottled = false;
        pendingArgs = null;
        pendingContext = null;
        pendingPromiseResolve = null;
    };

    return throttled;
}

/**
 * 解析 URL
 * @param urlString {string} 要解析的 URL 字符串
 * @returns {{protocol: string, hostname: string, search: string, port: string, queryParams: {}, pathSegments: string[], hash: string, pathname: string}}
 */
const parseUrl = (urlString) => {
    // 创建一个新的 URL 对象
    const url = new URL(urlString);

    // 提取路径部分并分割成数组
    const pathSegments = url.pathname.split('/').filter(segment => segment !== '');

    // 使用 URLSearchParams 来解析查询参数
    const searchParams = new URLSearchParams(url.search.slice(1));
    const queryParams = {};
    for (const [key, value] of searchParams.entries()) {
        queryParams[key] = value;
    }

    return {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        pathSegments,
        search: url.search,
        queryParams,
        hash: url.hash
    };
}

/**
 *获取localStorage指定key数据
 * 如Key不存在则返回默认值
 * 如指定isList为true,则返回数组
 * @param key {string}
 * @param isList {boolean} 是否是数组
 * @param defaultValue {any}
 * @returns {any|string|boolean|number|[]}
 */
const getLocalStorage = (key, isList = false, defaultValue = null) => {
    const item = localStorage.getItem(key);
    if (item === null) {
        return defaultValue
    }
    if (isList) {
        try {
            return JSON.parse(item)
        } catch (e) {
            console.error(`读取localStorage时尝试转换${key}的值失败`, e)
            return defaultValue
        }
    }
    return item
}

/**
 * 时间戳转时间字符串 (增强版)
 * @param {number|string} timestamp - 支持10位(秒)/13位(毫秒)/字符串数字
 * @param {object} [options] - 配置项
 * @param {string} [options.format='YYYY-MM-DD HH:mm:ss'] - 输出格式，可选标记：
 *    YYYY/YY: 年, MM/M: 月, DD/D: 日, HH/H: 时, mm/m: 分, ss/s: 秒
 * @param {number} [options.timezone] - 时区偏移(小时)，如 +8 或 -5
 * @param {boolean} [options.returnObject=false] - 是否返回时间对象
 * @returns {string|object} 格式化时间字符串 或 时间对象 {year,month,day...}
 */
const formatTimestamp = (timestamp, options = {}) => {
    // 参数校验与转换
    if (!timestamp || isNaN(timestamp)) return 'Invalid Timestamp'
    const ts = String(timestamp).length === 10 ? +timestamp * 1000 : +timestamp

    // 处理时区偏移 (单位: 小时)
    const timezoneOffset = (options.timezone || 0) * 60 * 60 * 1000
    const date = new Date(ts + timezoneOffset)

    // 有效性检查
    if (isNaN(date.getTime())) return 'Invalid Date'

    // 时间组件提取
    const timeObj = {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        hours: date.getUTCHours(),
        minutes: date.getUTCMinutes(),
        seconds: date.getUTCSeconds()
    }

    // 返回原始对象
    if (options.returnObject) return timeObj

    // 格式处理
    const format = options.format || 'YYYY-MM-DD HH:mm:ss'
    const pad = (n) => n.toString().padStart(2, '0')

    return format
        .replace(/YYYY/g, timeObj.year)
        .replace(/YY/g, String(timeObj.year).slice(-2))
        .replace(/MM/g, pad(timeObj.month))
        .replace(/M/g, timeObj.month)
        .replace(/DD/g, pad(timeObj.day))
        .replace(/D/g, timeObj.day)
        .replace(/HH/g, pad(timeObj.hours))
        .replace(/H/g, timeObj.hours)
        .replace(/mm/g, pad(timeObj.minutes))
        .replace(/m/g, timeObj.minutes)
        .replace(/ss/g, pad(timeObj.seconds))
        .replace(/s/g, timeObj.seconds)
}

/**
 * 求点赞率
 * 由于精度问题，其值为整数，如 结果0.9，等于90%返回值为90
 * @param likeCount {number} 点赞数
 * @param viewCount {number} 播放数
 * @returns {number}
 */
const calculateLikeRate = (likeCount, viewCount) => {
    if (viewCount === 0) {
        return 0;
    }
    return parseInt((likeCount / viewCount) * 100)
}

/**
 * 求互动率
 * @param danmaku {number} 弹幕数
 * @param reply {number} 评论数
 * @param view {number} 播放数
 */
const calculateInteractionRate = (danmaku, reply, view) => {
    return parseInt((danmaku + reply) / view * 100)
}

/**
 * 求视频三连率
 * @param favorite {number} 收藏数
 * @param coin {number} 投币数
 * @param share {number} 分享数
 * @param view {number} 播放数
 */
const calculateTripleRate = (favorite, coin, share, view) => {
    return parseInt((favorite + coin + share) / view * 100)
}

/**
 * 求投币点赞比
 * @param coin {number} 投币数
 * @param like {number} 点赞数
 * @returns {number}
 */
const calculateCoinLikesRatioRate = (coin, like) => {
    return parseInt((coin / like) * 100)
}

/**
 * 插个人常用样式
 * @param el {Document}该元素下是否已经插入过样式
 * @param insertionPosition {Element|Document} 要插入样式的位置
 */
export const addGzStyle = (el, insertionPosition = document.head) => {
    const styleEl = el.querySelector("style[gz_style]");
    if (styleEl !== null) {
        console.log("已有gz_style样式，故不再插入该样式内容");
        return;
    }
    const style = document.createElement('style');
    style.setAttribute("gz_style", "");
    style.textContent = gzStyleCss;
    insertionPosition.appendChild(style);
}


export default {
    wait,
    fileDownload,
    toTimeString,
    smoothScroll,
    debounce,
    throttle,
    parseUrl,
    handleFileReader,
    isIterable,
    getLocalStorage,
    formatTimestamp,
    calculateLikeRate,
    calculateInteractionRate,
    calculateTripleRate,
    calculateCoinLikesRatioRate
}
