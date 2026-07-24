/**
 * 事件中心类，用于管理事件的订阅和发布。
 * 提供了订阅普通事件、一次性订阅普通事件、订阅回调事件、发送通知、发送普通消息等功能。
 * @version 1.3.0
 */

type EventCallback = (...args: any[]) => any

interface DebounceConfig {
    wait: number
    timeOut: ReturnType<typeof setTimeout> | null
}

interface RegularEvents {
    events: Record<string, EventCallback>
    futures: Record<string, any[][]>
    parametersDebounce: Record<string, DebounceConfig>
    preHandles: Record<string, EventCallback>
}

interface CallbackEvents {
    events: Record<string, EventCallback>
    callbackInterval: number
}

class EventEmitter {
    #regularEvents: RegularEvents = {
        events: {},
        futures: {},
        parametersDebounce: {},
        preHandles: {}
    }

    #callbackEvents: CallbackEvents = {
        events: {},
        callbackInterval: 1500
    }

    /**
     * 注册普通事件监听器。
     * 若同名事件已注册且未设置 overrideEvents，则静默忽略后续注册。
     * 注册后立即消费 futures 中缓存的待处理数据。
     * @param eventName - 事件名称
     * @param callback - 事件回调
     * @param overrideEvents - 是否覆盖已注册的回调
     */
    on(eventName: string, callback: EventCallback, overrideEvents: boolean = false): EventEmitter {
        const events = this.#regularEvents.events
        if (events[eventName]) {
            if (overrideEvents) {
                events[eventName] = callback
                this.#handlePendingEvents(eventName, callback)
            }
            return this
        }
        events[eventName] = callback
        this.#handlePendingEvents(eventName, callback)
        return this
    }

    /**
     * 注册 preHandle 预处理回调。
     * 在 send() 投递事件前对参数进行预处理，可在 dispatch 前统一转换数据格式。
     * @param eventName - 事件名称
     * @param callback - 预处理回调，接收原始参数，返回处理后的参数数组
     */
    onPreHandle(eventName: string, callback: EventCallback): EventEmitter {
        const preHandles = this.#regularEvents.preHandles
        preHandles[eventName] = callback
        return this
    }

    /**
     * 注册 callback 事件处理器，用于与 invoke() 配合实现 Promise 风格的请求/响应模式。
     * 同名事件重复注册会抛出异常。
     * @param eventName - 事件名称
     * @param callback - 处理回调，返回值将作为 invoke() 的 resolve 值
     * @throws 同名事件已存在时抛出 Error
     */
    handler(eventName: string, callback: EventCallback): void {
        const handlerEvents = this.#callbackEvents.events
        if (handlerEvents[eventName]) {
            throw new Error('该事件名已经存在，请更换事件名')
        }
        handlerEvents[eventName] = callback
    }

    /**
     * Promise 风格的事件调用，与 handler() 配合使用。
     * 若 handler 已注册则立即调用；若未注册则以回调间隔轮询等待注册。
     * 典型场景：业务逻辑调用 UI 确认弹窗，handler 由 Vue 组件挂载时注册。
     * @param eventName - 事件名称
     * @param data - 传递给 handler 的参数
     * @returns Promise，resolve 值为 handler 的返回值
     */
    invoke(eventName: string, ...data: any[]): Promise<any> {
        return new Promise(resolve => {
            const handlerEvents = this.#callbackEvents.events
            if (handlerEvents[eventName]) {
                resolve(handlerEvents[eventName](...data))
                return
            }
            const i1 = setInterval(() => {
                if (handlerEvents[eventName]) {
                    clearInterval(i1)
                    resolve(handlerEvents[eventName](...data))
                }
            }, this.#callbackEvents.callbackInterval)
        })
    }

    /**
     * 同步发送事件，经 preHandle 预处理后投递给已注册的 handler。
     * 若 handler 尚未注册，数据将被缓存到 futures 队列，待 on() 注册时补发。
     * @param eventName - 事件名称
     * @param data - 传递给 handler 的参数
     */
    send(eventName: string, ...data: any[]): EventEmitter {
        const ordinaryEvents = this.#regularEvents
        const events = ordinaryEvents.events
        const event = events[eventName]
        if (event) {
            const preHandleData = this.#executePreHandle(eventName, data)
            event.apply(null, preHandleData)
            return this
        }
        const futures = ordinaryEvents.futures
        if (futures[eventName]) {
            futures[eventName].push(data)
            return this
        }
        futures[eventName] = []
        futures[eventName].push(data)
        return this
    }

    /**
     * 防抖发送事件。在指定等待时间内多次调用仅最后一次生效。
     * 防抖时长默认为 1500ms，可通过 setDebounceWaitTime() 调整。
     * @param eventName - 事件名称
     * @param data - 传递给 handler 的参数
     */
    sendDebounce(eventName: string, ...data: any[]): EventEmitter {
        const parametersDebounce = this.#regularEvents.parametersDebounce
        let timeOutConfig = parametersDebounce[eventName]
        if (timeOutConfig) {
            clearTimeout(timeOutConfig.timeOut as ReturnType<typeof setTimeout>)
            timeOutConfig.timeOut = null
        } else {
            timeOutConfig = parametersDebounce[eventName] = {wait: 1500, timeOut: null}
        }
        timeOutConfig.timeOut = setTimeout(() => {
                this.send(eventName, ...data)
            },
            timeOutConfig.wait)
        return this
    }

    /**
     * 设置指定事件的防抖等待时长。
     * @param eventName - 事件名称
     * @param wait - 防抖时长（毫秒）
     */
    setDebounceWaitTime(eventName: string, wait: number): EventEmitter {
        const timeOutConfig = this.#regularEvents.parametersDebounce[eventName]
        if (timeOutConfig) {
            timeOutConfig.wait = wait
        } else {
            this.#regularEvents.parametersDebounce[eventName] = {
                wait: wait,
                timeOut: null
            }
        }
        return this
    }

    /**
     * 同步触发事件（无 preHandle，无 futures 缓存）。
     * 若 handler 未注册则静默丢弃。适用于瞬时通知，不关心是否被消费。
     * @param eventName - 事件名称
     * @param data - 传递给 handler 的参数
     */
    emit(eventName: string, ...data: any[]): EventEmitter {
        const callback = this.#regularEvents.events[eventName]
        if (callback) {
            callback.apply(null, data)
        }
        return this
    }

    /**
     * 异步触发事件，将 handler 执行推迟到下一个 macrotask。
     * 相比同步 emit，可以避免 handler 同步序言阻塞当前调用栈中的微任务执行。
     *
     * 典型场景：需要确保 promise.catch() 等微任务在 handler 启动前先执行完毕。
     */
    emitAsync(eventName: string, ...data: any[]): EventEmitter {
        setTimeout(() => this.emit(eventName, ...data), 0)
        return this
    }

    /**
     * 异步发送事件，将 handler 执行推迟到下一个 macrotask。
     * 与 send 语义一致（支持 preHandle 预处理和 futures 队列），但延迟执行。
     */
    sendAsync(eventName: string, ...data: any[]): EventEmitter {
        setTimeout(() => this.send(eventName, ...data), 0)
        return this
    }

    /**
     * 注销指定事件的所有监听（regularEvents 和 callbackEvents）。
     * @param eventName - 事件名称
     * @returns 是否成功注销
     */
    off(eventName: string): boolean {
        const events = this.#regularEvents.events
        if (events[eventName]) {
            delete events[eventName]
            return true
        }
        const handlerEvents = this.#callbackEvents.events
        if (handlerEvents[eventName]) {
            delete handlerEvents[eventName]
            return true
        }
        return false
    }

    /**
     * 设置 invoke() 轮询 handler 注册状态的间隔时间。
     * @param interval - 轮询间隔（毫秒）
     */
    setInvokeInterval(interval: number): void {
        this.#callbackEvents.callbackInterval = interval
    }

    /**
     * 获取事件中心内部状态，用于调试和检查。
     * @returns regularEvents 和 callbackEvents 的快照引用
     */
    getEvents(): { regularEvents: RegularEvents; callbackEvents: CallbackEvents } {
        return {
            regularEvents: this.#regularEvents,
            callbackEvents: this.#callbackEvents
        }
    }

    /** 处理 on() 注册前由 send() 缓存的待补发事件 */
    #handlePendingEvents(eventName: string, callback: EventCallback): void {
        const futureEvents = this.#regularEvents.futures
        if (futureEvents[eventName]) {
            for (const eventData of futureEvents[eventName]) {
                const preHandleData = this.#executePreHandle(eventName, eventData)
                callback.apply(null, preHandleData)
            }
            delete futureEvents[eventName]
        }
    }

    /** 执行 preHandle 预处理，无预处理时透传原始数据 */
    #executePreHandle(eventName: string, data: any[]): any[] {
        const preHandles = this.#regularEvents.preHandles
        const callback = preHandles[eventName]
        if (callback) {
            return callback.apply(null, data)
        }
        return data
    }
}

export const eventEmitter = new EventEmitter()
