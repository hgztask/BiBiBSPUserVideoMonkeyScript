import gmUtil from "../utils/gmUtil.js";
import localMKData from "../data/localMKData.js";
import defCss from '../css/def.css'
import {initVueApp} from "../utils/defUtil.js";
import App from "./App.vue";

if (document.head.querySelector('#element-ui-css') === null) {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://unpkg.com/element-ui/lib/theme-chalk/index.css'
    linkElement.id = 'element-ui-css'
    document.head.appendChild(linkElement)
    console.log('挂载element-ui样式成功')
}

window.addEventListener('load', () => {
    const mainLayoutEl = document.createElement('div');
    document.body.appendChild(mainLayoutEl)
    window.mk_vue_app = initVueApp(mainLayoutEl, App);
})

// 设置边框样式
gmUtil.addStyle(`
[gz_bezel]{
border:1px solid ${localMKData.getBorderColor()}
}
`);

gmUtil.addStyle(defCss)
