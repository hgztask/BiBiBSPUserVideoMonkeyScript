/**
 * 事件中心类，用于管理事件的订阅和发布。
 * 提供了订阅普通事件、一次性订阅普通事件、订阅回调事件、发送通知、发送普通消息等功能。
 * @version 1.2.0
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

    onPreHandle(eventName: string, callback: EventCallback): EventEmitter {
        const preHandles = this.#regularEvents.preHandles
        preHandles[eventName] = callback
        return this
    }

    handler(eventName: string, callback: EventCallback): void {
        const handlerEvents = this.#callbackEvents.events
        if (handlerEvents[eventName]) {
            throw new Error('该事件名已经存在，请更换事件名')
        }
        handlerEvents[eventName] = callback
    }

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

    emit(eventName: string, ...data: any[]): EventEmitter {
        const callback = this.#regularEvents.events[eventName]
        if (callback) {
            callback.apply(null, data)
        }
        return this
    }

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

    setInvokeInterval(interval: number): void {
        this.#callbackEvents.callbackInterval = interval
    }

    getEvents(): { regularEvents: RegularEvents; callbackEvents: CallbackEvents } {
        return {
            regularEvents: this.#regularEvents,
            callbackEvents: this.#callbackEvents
        }
    }

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
