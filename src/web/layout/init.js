import gmUtil from "../utils/gmUtil.js";
import localMKData from "../data/localMKData.js";
import defCss from '../css/def.css'
import {addGzStyle, initVueApp} from "../utils/defUtil.js";
import App from "./App.vue";
import elUtil from "../utils/elUtil.js";

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
