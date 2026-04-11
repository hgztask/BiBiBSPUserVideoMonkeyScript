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
    watchElementListLengthWithInterval,
    /**
     * 监听父元素下指定选择器的子元素出现（从无到有时触发回调）
     *
     * ---------- 使用示例 ----------
     * 假设页面中有 <div id="container"></div>
     * const container = document.getElementById('container');
     *
     * 监听直接子元素 section 的出现
     * const watcher = watchUtil.watchChildAppear(
     *     container,
     *     'section',
     *     (sectionEl) => {
     *         console.log('直接子元素 section 出现了！', sectionEl);
     *         sectionEl.style.border = '2px solid red';
     *     },
     *     {
     *         once: false,        // 可多次触发（例如移除后再添加还会触发）
     *         initialCheck: true, // 立即检查现有元素
     *         subtree: false      // 只监听直接子元素
     *     }
     * );
     *
     * 需要时停止观察
     * watcher.disconnect();
     *
     * @param {Element} parent - 要监听的父元素
     * @param {string} selector - CSS 选择器，用于匹配子元素
     * @param {function(Element): void} callback - 匹配元素出现时的回调，传入第一个匹配的元素
     * @param {object} [options] - 可选配置
     * @param {boolean} [options.once=false] - 是否只触发一次，之后自动停止观察
     * @param {boolean} [options.initialCheck=true] - 是否在开始时立即检查现有元素
     * @param {boolean} [options.subtree=false] - 是否监听后代元素（默认只监听直接子元素）
     * @returns {{ disconnect: function }} 包含 disconnect 方法的对象，用于停止观察
     */
    watchChildAppear(parent, selector, callback, options = {}) {
        if (!parent || !(parent instanceof Element)) {
            throw new Error('parent 必须是一个有效的 DOM 元素');
        }
        if (typeof selector !== 'string') {
            throw new Error('selector 必须是字符串');
        }
        if (typeof callback !== 'function') {
            throw new Error('callback 必须是函数');
        }

        const {
            once = false,
            initialCheck = true,
            subtree = false
        } = options;

        // 检查是否存在匹配元素（根据 subtree 决定搜索范围）
        function findMatches() {
            if (subtree) {
                // 后代任意位置
                return Array.from(parent.querySelectorAll(selector));
            } else {
                // 仅直接子元素
                return Array.from(parent.children).filter(child => child.matches(selector));
            }
        }

        // 状态：上次是否存在匹配元素（用数组长度判断）
        let hadMatches = false;

        // 执行检查并触发回调
        function checkAndTrigger() {
            const matches = findMatches();
            const hasMatches = matches.length > 0;

            // 仅当从无到有时触发
            if (hasMatches && !hadMatches) {
                // 回调传入第一个匹配元素（可根据需要改为传入所有匹配项）
                callback(matches[0]);

                if (once) {
                    observer.disconnect();
                    return;
                }
            }
            hadMatches = hasMatches;
        }

        // 初始化检查（如果需要）
        if (initialCheck) {
            hadMatches = findMatches().length > 0;
            // 如果初始就存在，也触发一次（代表“出现”行为）
            if (hadMatches) {
                callback(findMatches()[0]);
                if (once) {
                    // 如果 once 为 true 且初始已存在，直接返回一个已断开的观察器（无需再观察）
                    return {
                        disconnect: () => {
                        }
                    };
                }
            }
        } else {
            hadMatches = findMatches().length > 0;
        }

        // 创建 MutationObserver
        const observer = new MutationObserver(() => {
            checkAndTrigger();
        });

        // 开始观察
        observer.observe(parent, {
            childList: true,
            subtree: subtree     // 根据配置决定是否监听后代
        });

        // 返回可断开的方法
        return {
            disconnect: () => observer.disconnect()
        };
    }
}
