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
function debounce(func, wait=1000) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 * 防抖异步函数
 * @param asyncFunc {function} 需要防抖的异步函数
 * @param wait {number} 等待时间，单位毫秒，默认为 1000毫秒
 * @returns {function(...[*]): Promise<any>}
 */
function debounceAsync(asyncFunc, wait=1000) {
    let timeout;
    let pendingPromise;

    return async function(...args) {
        const context = this;

        // 如果有正在进行的异步操作，则取消定时器并等待其完成
        if (pendingPromise) {
            clearTimeout(timeout);
            await pendingPromise;
        }

        // 创建一个新的 Promise 以便我们可以等待防抖结束
        pendingPromise = new Promise((resolve) => {
            timeout = setTimeout(() => {
                pendingPromise = null; // 清除引用
                resolve(asyncFunc.apply(context, args));
            }, wait);
        });

        // 返回一个 Promise，它会在防抖结束后解析为原始异步函数的结果
        return pendingPromise;
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


export default {
    wait,
    fileDownload,
    toTimeString,
    smoothScroll,
    debounce,
    debounceAsync,
    throttle,
    throttleAsync,
    parseUrl
}