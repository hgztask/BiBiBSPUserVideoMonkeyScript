/**
 * 监听url变化
 * @param callback {function} 回调函数
 */
const addEventListenerUrlChange = (callback) => {
    let oldUrl = window.location.href;
    setInterval(() => {
        const newUrl = window.location.href;
        if (oldUrl === newUrl) return;
        oldUrl = newUrl;
        const title = document.title;
        callback(newUrl, oldUrl, title)
    }, 1000);
}

/**
 * 监听网络请求
 * @param callback {function} 回调函数
 */
const addEventListenerNetwork = (callback) => {
    const performanceObserver = new PerformanceObserver(() => {
        const entries = performance.getEntriesByType('resource');
        const windowUrl = window.location.href;
        const winTitle = document.title;
        for (let entry of entries) {
            const url = entry.name;
            const initiatorType = entry.initiatorType;
            if (initiatorType === "img" || initiatorType === "css" || initiatorType === "link" || initiatorType === "beacon") {
                continue;
            }
            try {
                callback(url, windowUrl, winTitle, initiatorType);
            } catch (e) {
                if (e.message === "stopPerformanceObserver") {
                    performanceObserver.disconnect();
                    console.log("检测到当前页面在排除列表中，已停止性能观察器对象实例", e)
                    break;
                }
                throw e;
            }
        }
        performance.clearResourceTimings();//清除资源时间
    });
    performanceObserver.observe({entryTypes: ['resource']});
}


/**
 * 监听指定 CSS 选择器下的元素列表长度变化，并在元素数量发生变化时触发 Promise。
 *
 * @param {string} selector - 要监听的 CSS 选择器字符串。
 * @param callback {function} 回调函数，回调会data对象，对象里包括变化状态，当前列表和列数
 * @param {Object} config - 配置对象，包含以下属性：
 * @param {number} config.interval - 定时检查的时间间隔（毫秒），默认为 1000 毫秒。
 * @returns {function} - 返回一个取消观察的方法，调用此方法可以停止定时器。
 */
function watchElementListLengthWithInterval(selector, callback, config = {}) {
    const defConfig = {};
    config = {...defConfig, ...config};
    //先前长度
    let previousLength = -1;
    const timer = setInterval(() => {
            if (previousLength === -1) {
                previousLength = document.querySelectorAll(selector).length;
                return
            }
            const currentElements = document.querySelectorAll(selector);
            //现在查找列表长度
            const currentLength = currentElements.length;
            if (currentLength !== previousLength) {
                // 元素列表长度发生变化，调用回调函数
                //新的长度更新先前的长度
                previousLength = currentLength;
                callback({
                        action: currentLength > previousLength ? 'add' : 'del',
                        elements: currentElements,
                        length: currentLength
                    }
                );
            }
        },
        config.interval
    );
    // 提供一个取消观察的方法
    return stop = () => {
        clearInterval(timer);
    };
}


export default {
    addEventListenerUrlChange,
    addEventListenerNetwork,
    watchElementListLengthWithInterval
}
