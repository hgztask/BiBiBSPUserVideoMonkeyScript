/**
 * 元素事件管理器
 * @version 1.0.0
 */

interface ElEventItem {
    eventName: string
    callback: EventListener
}

interface ElEventsData {
    events: ElEventItem[]
    attrs: string[]
}

class ElEventEmitter {

    #elEvents: Map<Element | Document, ElEventsData> = new Map()

    addEvent(el: Element | Document, eventName: string, callback: EventListener, repeated: boolean = false): void {
        const elEvents = this.#elEvents
        if (!elEvents.has(el)) {
            elEvents.set(el, {events: [], attrs: []})
        }
        const {events, attrs} = elEvents.get(el)!
        if (!repeated) {
            if (attrs.includes(eventName)) {
                return
            }
        }
        attrs.push(eventName)
        events.push({eventName, callback})
        if (el instanceof Element) {
            el.setAttribute(`gz-event`, JSON.stringify(attrs))
        }
        el.addEventListener(eventName, callback)
    }

    hasEventName(el: Element | Document, eventName: string): boolean {
        const elEvents = this.#elEvents
        if (!elEvents.has(el)) {
            return false
        }
        const {attrs} = elEvents.get(el)!
        return attrs.includes(eventName)
    }
}

export const elEventEmitter = new ElEventEmitter()
