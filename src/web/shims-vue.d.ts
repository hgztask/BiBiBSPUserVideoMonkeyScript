declare module '*.vue' {
    import type {DefineComponent} from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module '*.css?raw' {
    const content: string
    export default content
}

declare module '*.less?raw' {
    const content: string
    export default content
}
