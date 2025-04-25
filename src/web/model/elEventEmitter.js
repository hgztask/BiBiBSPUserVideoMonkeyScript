/**
 * 元素事件管理器
 * @version 1.0.0
 */
class ElEventEmitter {

    #elEvents = new Map()

    /**
     * 网页元素添加事件
     * @param el {Element|Document|any} 网页元素
     * @param eventName {string} 事件名称
     * @param callback {function} 事件回调函数
     * @param repeated {boolean} 是否允许重复添加事件，默认不允许false
     *
     */
    addEvent(el, eventName, callback, repeated = false) {
        const elEvents = this.#elEvents;
        if (!elEvents.has(el)) {
            elEvents.set(el, {events: [], attrs: []})
        }
        // 获取该元素对应的事件监听器表
        const {events, attrs} = elEvents.get(el);
        if (!repeated) {
            if (attrs.includes(eventName)) {
                return
            }
        }
        attrs.push(eventName)
        events.push({eventName, callback})
        el.setAttribute(`gz-event`, JSON.stringify(attrs))
        // 如果该元素还没有对应的事件监听器表，则创建一个空的事件监听器表
        el.addEventListener(eventName, callback);
    }

    /**
     * 判断元素是否已经添加了某个事件名
     * @param el {Element|Document|any} 网页元素
     * @param eventName {string} 事件名称
     * @returns {boolean}
     */
    hasEventName(el, eventName) {
        const elEvents = this.#elEvents;
        if (elEvents.has(el)) {
            return true
        }
        // 获取该元素对应的事件监听器表
        const {attrs} = elEvents.get(el);
        return attrs.includes(eventName)
    }
}

/**
 * 元素事件管理器
 * @type {ElEventEmitter} 实例对象
 */
export const elEventEmitter = new ElEventEmitter()
