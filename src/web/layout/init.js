import gmUtil from "../utils/gmUtil.js";
import localMKData from "../data/localMKData.js";
import defCss from '../css/def.css'
import {addGzStyle, initVueApp} from "../utils/defUtil.js";
import App from "./App.vue";
import elUtil from "../utils/elUtil.js";

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

window.addEventListener('DOMContentLoaded', () => {
    const mainLayoutEl = document.createElement('div');
    document.body.appendChild(mainLayoutEl)
    window.mk_vue_app = initVueApp(mainLayoutEl, App);
    addGzStyle(document);
    elUtil.updateCssVModal();
})

// 设置边框样式
gmUtil.addStyle(`
[gz_bezel]{
border:1px solid ${localMKData.getBorderColor()}
}
`);

gmUtil.addStyle(defCss)
