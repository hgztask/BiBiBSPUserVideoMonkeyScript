/// <reference types="tampermonkey" />

import Vue from 'vue'

declare global {
    const __DEV__: boolean

    interface Window {
        Vue: typeof Vue
    }

    interface Element {
        __vue__?: any
        __data?: any
        href?: string
        src?: string
        title?: string
        placeholder?: string
        value?: string
        contentDocument?: Document
        style: CSSStyleDeclaration

        insertAdjacentElement(position: string, element: Element): Element

        remove(): void
    }

    interface ShadowRoot {
        style: CSSStyleDeclaration

        remove(): void

        insertAdjacentElement(position: string, element: Element): Element
    }

    interface EventTarget {
        textContent?: string
        value?: string
    }

    interface KeyboardEvent {
        keyCode?: number
    }

    type AnyRecord = Record<string, any>
}

export {}
