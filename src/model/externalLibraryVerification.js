import Vue from "vue";
import Dexie from "dexie";
import gmUtil from "../utils/gmUtil.js";
import globalValue from "../data/globalValue.js";

//验证外部库是否引入
const start = () => {
    let loop = false
    let msg;
    if (!Vue) {
        loop = true
        msg = 'Vue is not defined，Vue未定义，请检查是否引入了Vue';
    }
    if (!Dexie) {
        loop = true
        msg = 'Dexie is not defined，Dexie未定义，请检查是否引入了Dexie';
    }
    if (loop) {
        if (confirm('外部库验证失败:' + msg + `\n请联系作者核查问题\n可通过点击确定按钮跳转。
        \n脚本主页信息中，有相关解决文档
        \n或通过脚本信息底下联系方式联系作者解决`)) {
            gmUtil.openInTab(globalValue.scriptCat_js_url)
            gmUtil.openInTab(globalValue.group_url)
        }
        throw new Error(`外部库验证失败:${msg}`)
    }
}

start()
