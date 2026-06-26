declare module '*.vue' {
    import Vue from 'vue'
    export default Vue
}

declare module '*.css' {
    const content: string
    export default content
}

declare module '*.less' {
    const content: string
    export default content
}
