import localMKData from "../state/localMKData";
import defCss from './styles/def.css'
import {addGzStyle, initVueApp} from "../core/util/defUtil.ts";
import App from "./App.vue";
import elUtil from "../core/util/elUtil.ts";
import cssManager from "../domain/cssManager.ts";
import Vue from "vue";
import GzSpace from "./components/GzSpace.vue";
import GzText from "./components/GzText.vue";

declare global {
    interface Window {
        mk_vue_app: Vue
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (document.head.querySelector('#element-ui-css') === null) {
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://unpkg.com/element-ui@2.15.14/lib/theme-chalk/index.css'
        linkElement.id = 'element-ui-css'
        document.head.appendChild(linkElement)
        linkElement.addEventListener('load', () => {
            console.log('element-ui样式加载完成')
        })
    }
    const {vueDiv} = elUtil.createVueDiv(document.body);
    window.mk_vue_app = initVueApp(vueDiv, App);
    Vue.component('gz-space', GzSpace)
    Vue.component('gz-text', GzText)
    addGzStyle(document);
    cssManager.updateCssVModal();
})

GM_addStyle(`
[gz_bezel]{
border:1px solid ${localMKData.getBorderColor()}
}
`);

GM_addStyle(defCss)
