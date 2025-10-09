/**
 * 事件中心类，用于管理事件的订阅和发布。
 * 提供了订阅普通事件、一次性订阅普通事件、订阅回调事件、发送通知、发送普通消息等功能。
 * @version 1.1.0
 */
class EventEmitter {
    /**
     * 普通事件中心，存储已订阅的普通事件和待订阅的普通事件。
     */
    #regularEvents = {
        // 普通事件
        events: {},
        // 待订阅事件
        futures: {},
        //发送消息参数防抖配置
        parametersDebounce: {}
    }

    /**
     * 回调事件中心，接收并处理消息。发送、接受、返回结果。
     * @type {{events:{}, callbackInterval:number}}
     */
    #callbackEvents = {
        // 回调事件
        events: {},
        // 回调事件查找事件间隔时间
        callbackInterval: 1500
    }

    // 普通待订阅事件处理函数
    #handlePendingEvents(eventName, callback) {
        const futureEvents = this.#regularEvents.futures;
        if (futureEvents[eventName]) {
            //如果待订阅事件中有该事件名，则依次执行该事件名对应的回调函数
            for (const futureEvent of futureEvents[eventName]) {
                callback.apply(null, futureEvent)
            }
            delete futureEvents[eventName];
        }
    }

    /**
     * 订阅普通事件，将回调函数添加到事件监听器表中。
     * 一个订阅事件只有一个对应的回调函数，如需覆盖，则需要重新订阅。
     * 收到未来的订阅事件消息时，依次执行该事件名对应的回调函数。
     * @param {string} eventName - 事件名称
     * @param {function} callback - 回调函数，当事件被触发时执行
     * @param overrideEvents {boolean} - 是否覆盖已订阅事件
     * @returns {EventEmitter}
     */
    on(eventName, callback, overrideEvents = false) {
        // 处理已订阅事件
        const events = this.#regularEvents.events;
        // 如果事件已经订阅，则提前结束
        if (events[eventName]) {
            if (overrideEvents) {
                events[eventName] = callback;
                this.#handlePendingEvents(eventName, callback);
            }
            return this;
        }
        // 如果事件没有订阅，则创建一个空的事件监听器表并添加回调函数
        events[eventName] = callback;
        this.#handlePendingEvents(eventName, callback);
        return this;
    }

    /**
     * 订阅回调事件，接收并处理消息。当接收到特定的消息时，执行该处理函数，并将结果返回发送方。
     * 回调事件只能有一个对应的回调函数，如需覆盖，则需要重新订阅。
     * @param {string} eventName - 事件名称
     * @param {function} callback - 处理消息的回调函数
     */
    handler(eventName, callback) {
        const handlerEvents = this.#callbackEvents.events;
        if (handlerEvents[eventName]) {
            throw new Error('该事件名已经存在，请更换事件名')
        }
        handlerEvents[eventName] = callback;
    }

    /**
     * 发送通知，如未订阅，则一直等到回调订阅事件存在，拿到结果之后返回结果。
     * @param {string} eventName - 事件名称
     * @param {...*} data - 发送的数据
     * @returns {Promise<any>} 返回处理结果
     */
    invoke(eventName, ...data) {
        return new Promise(resolve => {
            const handlerEvents = this.#callbackEvents.events;
            if (handlerEvents[eventName]) {
                resolve(handlerEvents[eventName](...data));
                return
            }
            const i1 = setInterval(() => {
                if (handlerEvents[eventName]) {
                    clearInterval(i1)
                    resolve(handlerEvents[eventName](...data));
                }
            }, this.#callbackEvents.callbackInterval);
        })
    }

    /**
     *发送普通消息，如未订阅事件，直到订阅到事件时发送。
     * @param {string} eventName - 事件名称
     * @param {...*} data - 发送的数据
     * @returns {EventEmitter}
     */
    send(eventName, ...data) {
        const ordinaryEvents = this.#regularEvents;
        const events = ordinaryEvents.events;
        const event = events[eventName];
        if (event) {
            event.apply(null, data);
            return this;
        }
        const futures = ordinaryEvents.futures;
        if (futures[eventName]) {
            //如果待订阅事件中有该事件名，则将数据添加到该事件名对应的数据列表中
            futures[eventName].push(data)
            return this;
        }
        //如果待订阅事件中没有该事件名，则创建一个空的数据列表并添加数据
        futures[eventName] = []
        futures[eventName].push(data)
        return this;
    }

    /**
     * 发送普通消息，发送时只有订阅了该事件名，才会执行该函数，并且发送数据会进行防抖处理。
     * 默认防抖时间为1500ms，可以通过setDebounceWaitTime方法进行设置。
     * @param eventName {string} 事件名称
     * @param data {*} 数据
     */
    sendDebounce(eventName, ...data) {
        const parametersDebounce = this.#regularEvents.parametersDebounce;
        let timeOutConfig = parametersDebounce[eventName];
        if (timeOutConfig) {
            clearTimeout(timeOutConfig.timeOut);
            timeOutConfig.timeOut = null;
        } else {
            timeOutConfig = parametersDebounce[eventName] = {wait: 1500, timeOut: null}
        }
        timeOutConfig.timeOut = setTimeout(() => {
                this.send(eventName, ...data)
            },
            timeOutConfig.wait)
        return this;
    }

    /**
     * 设置普通消息发送的防抖时间
     * @param eventName {string} 事件名称
     * @param wait {number} 防抖时间
     */
    setDebounceWaitTime(eventName, wait) {
        const timeOutConfig = this.#regularEvents.parametersDebounce[eventName];
        if (timeOutConfig) {
            timeOutConfig.wait = wait;
        } else {
            this.#regularEvents.parametersDebounce[eventName] = {
                wait: wait,
                timeOut: null
            }
        }
        return this;
    }

    /**
     * 发送普通消息，发送时只有订阅了该事件名，才会执行该函数
     * @param eventName {string} 事件名称
     * @param data {*} 数据
     */
    emit(eventName, ...data) {
        const callback = this.#regularEvents.events[eventName];
        if (callback) {
            callback.apply(null, data);
        }
        return this;
    }

    /**
     * 移除对应事件名的订阅。
     * 会在事件中心中移除对应事件名和对应的事件函数。
     * @param {string} eventName - 要移除的事件名
     * @returns {boolean} 是否移除成功
     */
    off(eventName) {
        const events = this.#regularEvents.events;
        if (events[eventName]) {
            delete events[eventName]
            return true
        }
        const handlerEvents = this.#callbackEvents.events;
        if (handlerEvents[eventName]) {
            delete handlerEvents[eventName]
            return true
        }
        return false
    }

    /**
     * 设置回调事件查找事件间隔时间。
     * @param {number} interval - 间隔时间，单位为毫秒
     */
    setInvokeInterval(interval) {
        this.#callbackEvents.callbackInterval = interval;
    }

    /**
     * 获取事件中心所有事件
     * @returns {{callbackEvents: {events: {}, callbackInterval: number}, regularEvents: {futures: {}, events: {}}}}
     */
    getEvents() {
        return {
            regularEvents: this.#regularEvents,
            callbackEvents: this.#callbackEvents
        }
    }
}

/**
 * 事件中心实例，用于管理事件的订阅和发布。
 * 提供了订阅普通事件、一次性订阅普通事件、订阅回调事件、发送通知、发送普通消息等功能。
 * @type {EventEmitter}
 */
export const eventEmitter = new EventEmitter();

