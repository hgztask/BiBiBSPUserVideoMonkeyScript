/**
 * 事件中心类，用于管理事件的订阅和发布。
 */
class EventEmitter {
    constructor() {
        // 存储事件和回调函数
        this.events = {};
        // 存储事件处理函数
        this.handlers = {};
    }

    /**
     * 订阅事件。
     * @param {string} eventName - 事件名称
     * @param {function} callback - 回调函数，当事件被触发时执行
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    /**
     * 一次性订阅事件。
     * @param {string} eventName - 事件名称
     * @param {function} callback - 一次性回调函数，事件触发后自动取消订阅
     */
    once(eventName, callback) {
        const onceCallback = (...args) => {
            callback(...args);
            this.off(eventName, onceCallback);
        };
        this.on(eventName, onceCallback);
    }

    /**
     * 发布事件。
     * @param {string} eventName - 事件名称
     * @param {*} data - 事件数据
     */
    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for "${eventName}":`, error);
                }
            });
            return
        }
        throw new Error(`No event listeners registered for "${eventName}"`);
    }

    /**
     * 取消订阅事件。
     * @param {string} eventName - 事件名称
     * @param {function} callback - 要取消的回调函数
     */
    off(eventName, callback) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
        }
    }

    /**
     * 移除指定事件的所有监听器或所有事件的所有监听器。
     * @param {string} [eventName] - 可选的事件名称，如果不指定则移除所有事件的监听器
     */
    removeAllListeners(eventName) {
        if (eventName) {
            delete this.events[eventName];
            delete this.handlers[eventName];
        } else {
            this.events = {};
            this.handlers = {};
        }
    }

    /**
     * 获取事件监听器数量。
     * @param {string} eventName - 事件名称
     * @returns {number} - 返回事件监听器的数量
     */
    listenerCount(eventName) {
        return this.events[eventName] ? this.events[eventName].length : 0;
    }

    /**
     * 添加事件处理函数。
     * @param {string} eventName - 事件名称
     * @param {function} handler - 事件处理函数，接收事件数据并返回处理结果
     */
    handle(eventName, handler) {
        this.handlers[eventName] = handler;
    }

    /**
     * 调用事件处理函数。
     * @param {string} eventName - 事件名称
     * @param {*} data - 事件数据
     * @returns {*} - 返回事件处理函数的结果，如果没有处理函数则返回 null
     */
    invoke(eventName, data) {
        if (this.handlers[eventName]) {
            return this.handlers[eventName](data);
        }
        return null;
    }
}


/**
 * 事件中心实例
 * @type {EventEmitter}
 */
export const eventEmitter = new EventEmitter();

