import defUtil from "./defUtil.js";

/**
 *获取url中的uid
 * @param url{string}
 * @return {number}
 */
const getUrlUID = (url) => {
    let uid;
    if (url.startsWith('http')) {
        const parseUrl = defUtil.parseUrl(url);
        uid = parseUrl.pathSegments[0]?.trim()
        return parseInt(uid)
    }
    //是否有参数
    const isDoYouHaveAnyParameters = url.indexOf('?');
    const lastIndexOf = url.lastIndexOf("/");
    if (isDoYouHaveAnyParameters === -1) {
        if (url.endsWith('/')) {
            // 当url以/结尾时，取倒数第二个/
            const nTheIndexOfTheLastSecondOccurrenceOfTheSlash = url.lastIndexOf('/', url.length - 2);
            uid = url.substring(nTheIndexOfTheLastSecondOccurrenceOfTheSlash + 1, url.length - 1);
        } else {
            // 当没有参数时，取url的最后一个/之后的内容
            uid = url.substring(lastIndexOf + 1);
        }
    } else {
        //当url中有参数时，取参数前的uid
        uid = url.substring(lastIndexOf + 1, isDoYouHaveAnyParameters);
    }
    return parseInt(uid);
}

/**
 * 获取url中的BV号
 * @param url {string}
 * @returns {string|null}
 */
const getUrlBV = (url) => {
    //例子：https://www.bilibili.com/video/BV1gLCWYAE5C/?spm_id_from=333.788.recommend_more_video.1
    let match = url.match(/video\/(.+)\//);
    if (match === null) {
        //例子：https://www.bilibili.com/video/BV1wB421r7NX?spm_id_from=333.1245.recommend_more_video.1
        match = url.match(/video\/(.+)\?/)
    }
    if (match === null) {
        //例子:https://www.bilibili.com/video/BV1B1cxewECr
        match = url.match(/video\/(.+)/)
    }
    if (match !== null) {
        return match?.[1]?.trim();
    }
    const {queryParams: {bvid = null}} = defUtil.parseUrl(url);
    return bvid;
}

/**
 * 按次数查找单个元素，每次查找之间有指定的间隔时间
 * @param {string} selector - CSS 选择器，用于选择元素
 * @param config{Object} 配置对象
 * @param config.doc {Document|Element|ShadowRoot}- 查找的文档对象，默认为document
 * @param config.interval  {number} - 每次查找之间的间隔时间（毫秒）默认1秒，即1000毫秒
 * @param config.attempts  {number} - 尝试查找的次数, 默认为5
 * @returns {Promise<Element>} - 返回找到的元素
 */
function
findElementByAttempts(selector, config) {
    const defConfig = {doc: document, interval: 1000, attempts: 5}
    config = {...defConfig, ...config}
    return new Promise((resolve, reject) => {
        let attemptCount = 0;

        function attemptToFind() {
            const element = config.doc.querySelector(selector);
            if (element) {
                resolve(element);
            } else if (++attemptCount < config.attempts) {
                setTimeout(attemptToFind, config.interval);
            } else {
                reject(); // 找不到的情况
            }
        }

        attemptToFind();
    });
}

/**
 * 按次数查找多个元素，每次查找之间有指定的间隔时间
 * @param {string} selector - CSS 选择器，用于选择元素
 * @param config{Object} 配置对象
 * @param config.doc {Document|Element|ShadowRoot}- 查找的文档对象，默认为document
 * @param config.interval  {number} - 每次查找之间的间隔时间（毫秒）默认1秒，即1000毫秒
 * @param config.attempts  {number} - 尝试查找的次数, 默认为5
 * @returns {Promise<NodeListOf<Element>|null>} - 返回找到的 NodeList 或 null
 */
function findElementsByAttempts(selector, config) {
    const defConfig = {doc: document, interval: 1000, attempts: 5}
    config = {...defConfig, ...config}
    return new Promise((resolve, reject) => {
        let attemptCount = 0;

        function attemptToFind() {
            const elements = config.doc.querySelectorAll(selector);
            if (elements.length > 0) {
                resolve(elements);
            } else if (++attemptCount < config.attempts) {
                setTimeout(attemptToFind, config.interval);
            } else {
                reject(null); // 找不到则返回 null
            }
        }

        attemptToFind();
    });
}

/**
 * 持续查找单个元素，每次查找之间有指定的间隔时间，直到找到为止
 * 结合异步操作await可用于监听元素加载完成之后继续执行
 * 如设置超时时间超过指定时间后，将返回null
 * @param {string} selector - CSS 选择器，用于选择元素
 * @param config{{}} 配置对象
 * @param config.doc {Document|Element|ShadowRoot}- 查找的文档对象，默认为document
 * @param config.interval  {number} - 每次查找之间的间隔时间（毫秒）默认1秒，即1000毫秒
 * @param config.timeout  {number} - 超时时间（毫秒）默认-1，即无限等待
 * @param config.parseShadowRoot  {boolean} - 如匹配元素为shadowRoot时，是否解析shadowRoot，默认为false
 * @returns {Promise<Element|Document>}-返回找到的元素，如设置超时超出时间则返回null
 */
const findElement = async (selector, config = {}) => {
    const defConfig = {
        doc: document,
        interval: 1000,
        timeout: -1,
        parseShadowRoot: false
    }
    config = {...defConfig, ...config}
    return new Promise((resolve) => {
        const i1 = setInterval(() => {
            const element = config.doc.querySelector(selector);
            if (element) {
                if (config.parseShadowRoot) {
                    const shadowRoot = element?.shadowRoot;
                    resolve(shadowRoot ? shadowRoot : element);
                    clearInterval(i1);
                    return;
                }
                resolve(element);
                clearInterval(i1);
            }
        }, config.interval);
        if (config.timeout > 0) {
            setTimeout(() => {
                clearInterval(i1);
                resolve(null); // 超时则返回 null
            }, config.timeout);
        }
    });
}

/**
 * 持续查找多个个元素，每次查找之间有指定的间隔时间，直到找到为止
 * 结合异步操作await可用于监听元素加载完成之后继续执行
 * 如设置超时时间超过指定时间后，将返回空数组
 * @param {string} selector - CSS 选择器，用于选择元素
 * @param config{{}} 配置对象
 * @param config.doc {Document|Element|ShadowRoot}- 查找的文档对象，默认为document
 * @param config.interval  {number} - 每次查找之间的间隔时间（毫秒）默认1秒，即1000毫秒
 * @param config.timeout  {number} - 超时时间（毫秒）默认-1，去问问1即无限等待
 * @param config.parseShadowRoot  {boolean} - 如匹配元素为shadowRoot时，是否解析shadowRoot，默认为false
 * @returns {Promise<[Element|Document]>}-返回找到的Element列表，如设置超时超出时间则返回空数组
 */
const findElements = async (selector, config = {}) => {
    const defConfig = {doc: document, interval: 1000, timeout: -1, parseShadowRoot: false}
    config = {...defConfig, ...config}
    return new Promise((resolve) => {
        const i1 = setInterval(() => {
            const els = config.doc.querySelectorAll(selector);
            if (els.length > 0) {
                const list = [];
                for (const el of els) {
                    if (config.parseShadowRoot) {
                        const shadowRoot = el?.shadowRoot;
                        list.push(shadowRoot ? shadowRoot : el)
                        continue;
                    }
                    list.push(el);
                }
                resolve(list);
                clearInterval(i1)
            }
        }, config.interval);
        if (config.timeout > 0) {
            setTimeout(() => {
                clearInterval(i1);
                resolve([]); // 超时则返回 空数组
            }, config.timeout);
        }
    });
}

/**
 * 尝试查找元素，并绑定事件，直到找到为止
 * @param css {string} - CSS 选择器
 * @param callback {function} - 回调函数
 * @param config{Object}
 * @param config.interval {number} - 每次查找之间的间隔时间（毫秒）默认1秒，即1000毫秒
 * @param config.timeOut {number} - 延迟查找的时间（毫秒），默认为3000毫秒
 */
const findElementsAndBindEvents = (css, callback, config = {}) => {
    config = {
        ...{
            interval: 2000,
            timeOut: 3000
        }, config
    }
    setTimeout(() => {
        findElement(css, {interval: config.interval}).then((el) => {
            el.addEventListener("click", () => {
                callback();
            })
        });
    }, config.timeOut);
}


/**
 * 设置悬停计时器，当鼠标悬停在元素上xxx秒后执行回调函数
 * @param {Element} element - 要设置悬停计时器的元素
 * @param {number} timeout - 悬停触发回调的时间（毫秒），默认为2000毫秒
 * @param {Function} callback - 悬停超时后执行的回调函数
 */
function hoverTimeout(element, callback, timeout = 2000) {
    const attribute = element.getAttribute('data-hover-timeout');
    // 清除之前的计时器，避免重复绑定事件
    if (attribute !== null) {
        return
    }
    element.setAttribute('data-hover-timeout', 'true');
    // 设置一个新的计时器
    let time = null;
    element.addEventListener('mouseenter', () => {
        time = setTimeout(() => {
            callback();
        }, timeout);
    });

    // 鼠标离开元素时清除计时器
    element.addEventListener('mouseleave', () => {
        if (time === null) {
            return;
        }
        clearTimeout(time);
    });
}

// 更新弹窗样式
const updateCssVModal = () => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `.v-modal  {
    z-index: auto !important;
}`
    document.head.appendChild(styleEl)
}

/**
 * 安装样式
 * @param css {string} - CSS 样式字符串
 * @param selector {string} - 选择器字符串，用以定位更新的样式元素
 */
const installStyle = (css, selector = ".mk-def-style") => {
    let styleEl = document.head.querySelector(selector);
    if (styleEl === null) {
        styleEl = document.createElement('style');
        if (selector.startsWith('#')) {
            styleEl.id = selector.substring(1);
        } else {
            styleEl.className = selector.substring(1);
        }
        document.head.appendChild(styleEl)
    }
    styleEl.innerHTML = css;
}

/**
 * 创建一个Vue容器
 * @description 创建一个Vue容器，用于挂载Vue组件，如如传入el，则将容器挂载到该元素下，不管el是否存在，都将创建一个容器，并返回容器的元素。
 * @param el {Element} 容器要挂载的元素，vue容器
 * @param cssTests {string|null} 要为创建的容器添加的样式，如为null，则不添加样式
 * @returns {{panelDiv: HTMLDivElement, vueDiv: HTMLDivElement}}
 */
const createVueDiv = (el = null, cssTests = null) => {
    const panelDiv = document.createElement('div');
    if (cssTests !== null) {
        panelDiv.style.cssText = cssTests;
    }
    const vueDiv = document.createElement("div");
    panelDiv.appendChild(vueDiv);
    if (el !== null) {
        el.appendChild(panelDiv);
    }
    return {panelDiv, vueDiv}
}


/**
 * @version 0.2.0
 */
export default {
    getUrlUID,
    getUrlBV,
    findElement,
    findElements,
    findElementsAndBindEvents,
    updateCssVModal,
    installStyle,
    createVueDiv
}
