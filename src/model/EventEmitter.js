/**
 * 事件中心类，用于管理事件的订阅和发布。
 */
class EventEmitter {
    /**
     * 普通事件中心
     */
    #ordinaryEvents = {
        // 普通事件
        events: {},
        // 待订阅事件
        futures: {}
    }

    /**
     * 回调事件中心，接收并处理消息。发送、接受、返回结果
     * @type {{events:{},invoke_interval:number}}
     */
    #handlerEvent = {
        // 回调事件
        events: {},
        // 回调事件查找事件间隔时间
        invoke_interval: 1500
    }

    /**
     * 订阅普通事件，将回调函数添加到事件监听器表中。
     * 一个订阅事件可以有多个回调函数，当事件被触发时，所有回调函数依次执行。
     * 收到未来的订阅事件消息时，依次执行该事件名对应的回调函数。
     * @param {string} eventName - 事件名称
     * @param {function} callback - 回调函数，当事件被触发时执行
     */
    on(eventName, callback) {
        // 处理已订阅事件
        const events = this.#ordinaryEvents.events;
        if (events[eventName]) {
            // 如果事件已经订阅，则将回调函数添加到事件监听器表中
            events[eventName].push(callback);
            return
        }
        // 如果事件没有订阅，则创建一个空的事件监听器表并添加回调函数
        events[eventName] = []
        events[eventName].push(callback);
        //处理待订阅事件
        const futureEvents = this.#ordinaryEvents.futures;
        if (futureEvents[eventName]) {
            //如果待订阅事件中有该事件名，则依次执行该事件名对应的回调函数
            for (const futureEvent of futureEvents[eventName]) {
                callback(...futureEvent)
            }
            delete futureEvents[eventName];
        }
    }

    /**
     * 一次性订阅普通事件，将回调函数添加到事件监听器表中，只执行一次，执行完移除对应的回调函数
     * @param {string} eventName - 事件名称
     * @param {function} callback - 一次性回调函数，事件触发后自动取消订阅对应函数
     */
    once(eventName, callback) {
        const onceCallback = (...args) => {
            callback(...args);
            this.#off(eventName, onceCallback);
        };
        this.on(eventName, onceCallback);
    }

    /**
     * 订阅回调事件，接收并处理消息。当接收到特定的消息时，执行该处理函数，并将结果返回发送方。
     * 回调事件只能一个对应的回调函数，如需覆盖，则需要重新订阅
     * @param eventName {string} 事件名
     * @param callback {function}
     */
    handler(eventName, callback) {
        const handlerEvents = this.#handlerEvent.events;
        if (handlerEvents[eventName]) {
            throw new Error('该事件名已经存在，请更换事件名')
        }
        handlerEvents[eventName] = callback;
    }

    /**
     * 发送通知，如未订阅，则一直等到回调订阅事件存在，拿到结果之后返回结果
     * @param eventName {string} 事件名
     * @param data {...*}数据
     * @returns {Promise<any|boolean|string|any|Set|Map|Element|Document>} 返回结果
     */
    invoke(eventName, ...data) {
        return new Promise(resolve => {
            const handlerEvents = this.#handlerEvent.events;
            if (handlerEvents[eventName]) {
                resolve(handlerEvents[eventName](...data));
                return
            }
            const i1 = setInterval(() => {
                if (handlerEvents[eventName]) {
                    clearInterval(i1)
                    resolve(handlerEvents[eventName](...data));
                }
            }, this.#handlerEvent.invoke_interval);
        })
    }


    /**
     *发送普通消息，如未订阅事件，直到订阅到事件时发送
     * @param eventName {string} 事件类型
     * @param data {...*} 事件数据，可多个参
     */
    send(eventName, ...data) {
        const ordinaryEvents = this.#ordinaryEvents;
        const events = ordinaryEvents.events;
        const event = events[eventName];
        if (event) {
            for (const callback of event) {
                callback(...data);
            }
            return;
        }
        const futures = ordinaryEvents.futures;
        if (futures[eventName]) {
            //如果待订阅事件中有该事件名，则将数据添加到该事件名对应的数据列表中
            futures[eventName].push(data)
            return;
        }
        //如果待订阅事件中没有该事件名，则创建一个空的数据列表并添加数据
        futures[eventName] = []
        futures[eventName].push(data)
    }

    /**
     * 私有取消订阅事件，用于内部临时使用
     * 事件名称会保留，当对应的事件函数会被移除
     * @param {string} eventName - 事件名称
     * @param {function} callback - 要取消的回调函数
     */
    #off(eventName, callback) {
        const events = this.#ordinaryEvents.events;
        if (events[eventName]) {
            events[eventName] = events[eventName].filter(cb => cb !== callback);
        }
        const handlerEvents = this.#handlerEvent.events;
        if (handlerEvents[eventName]) {
            handlerEvents[eventName] = handlerEvents[eventName].filter(cb => cb !== callback);
        }
    }

    /**
     * 移除对应事件名的订阅
     * 会在事件中心中移除对应事件名和对应的事件函数
     * @param eventName {string} 要移除的事件名
     * @returns {boolean} 是否移除成功
     */
    off(eventName) {
        const events = this.#ordinaryEvents.events;
        if (events[eventName]) {
            delete events[eventName]
            return true
        }
        const handlerEvents = this.#handlerEvent.events;
        if (handlerEvents[eventName]) {
            delete handlerEvents[eventName]
            return true
        }
        return false
    }


    /**
     * 设置回调事件查找事件间隔时间
     * @param interval {number} 间隔时间，单位为毫秒
     */
    setInvokeInterval(interval) {
        this.#handlerEvent.invoke_interval = interval;
    }
}


/**
 * 事件中心实例
 * @type {EventEmitter}
 */
export const eventEmitter = new EventEmitter();

