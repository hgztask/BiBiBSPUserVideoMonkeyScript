import localMKData from "../state/localMKData";
import defCss from './styles/def.css?raw'
import {addGzStyle, initVueApp} from "../core/util/defUtil.ts";
import App from "./App.vue";
import elUtil from "../core/util/elUtil.ts";
import cssManager from "../domain/cssManager.ts";
import type {App as VueApp} from "vue";
import GzSpace from "./components/GzSpace.vue";
import GzText from "./components/GzText.vue";
import {installElBridge} from "./elBridge.ts";

declare global {
    interface Window {
        mk_vue_app: VueApp
    }
}

// 等待 DOMContentLoaded（boot 动态导入可能错过该事件，需按 readyState 判断）
const onDomReady = (fn: () => void): void => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => fn(), {once: true})
    } else {
        fn()
    }
}

onDomReady(() => {
    if (document.head.querySelector('#element-plus-css') === null) {
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://unpkg.com/element-plus@2.14.5/dist/index.css'
        linkElement.id = 'element-plus-css'
        document.head.appendChild(linkElement)
        linkElement.addEventListener('load', () => {
            console.log('element-plus样式加载完成')
        })
    }
    const {vueDiv} = elUtil.createVueDiv(document.body);
    // 安装 Element Plus 事件桥接（el-msg/el-notify/el-alert/el-confirm/el-prompt）
    installElBridge();
    window.mk_vue_app = initVueApp(vueDiv, App);
    // 全局注册自定义组件
    window.mk_vue_app.component('gz-space', GzSpace)
    window.mk_vue_app.component('gz-text', GzText)
    addGzStyle(document);
    cssManager.updateCssVModal();
})

GM_addStyle(`
[gz_bezel]{
border:1px solid ${localMKData.getBorderColor()}
}
`);

GM_addStyle(defCss)


