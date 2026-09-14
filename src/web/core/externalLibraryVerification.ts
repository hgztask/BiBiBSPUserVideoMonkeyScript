import globalValue from "../config/globalValue.ts"

const start = (): void => {
    const w = window as any
    // vue/element-plus 由 boot.ts 运行时加载挂到 window；dexie 由 @require 加载
    // 直接读 window 属性而非 import（import 外部库会被 interop 包装，undefined 也会生成 truthy 空对象，掩盖问题）
    const hasVue = !!w.Vue
    const hasElementPlus = !!w.ElementPlus
    const hasDexie = !!w.Dexie
    console.log('[外部库诊断]',
        'window.Vue =', typeof w.Vue,
        '| window.ElementPlus =', typeof w.ElementPlus,
        '| window.Dexie =', typeof w.Dexie)

    let msg: string | undefined
    if (!hasVue) {
        msg = 'Vue is not defined，Vue未定义，请检查网络后刷新重试'
    }
    if (!hasElementPlus) {
        msg = 'ElementPlus is not defined，ElementPlus未定义，请检查网络后刷新重试'
    }
    if (!hasDexie) {
        msg = 'Dexie is not defined，Dexie未定义，请检查@require是否引入了dexie.min.js'
    }
    if (msg) {
        if (confirm('外部库验证失败:' + msg + `\n请联系作者核查问题\n可通过点击确定按钮跳转。
        \n脚本主页信息中，有相关解决文档
        \n或通过脚本信息底下联系方式联系作者解决`)) {
            GM_openInTab(globalValue.scriptCat_js_url)
            GM_openInTab(globalValue.group_url)
        }
        throw new Error(`外部库验证失败:${msg}`)
    }
}

start()