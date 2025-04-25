import localMKData from "./localMKData.js";
//加群链接_qq
const group_url = 'http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=tFU0xLt1uO5u5CXI2ktQRLh_XGAHBl7C&authKey=KAf4rICQYjfYUi66WelJAGhYtbJLILVWumOm%2BO9nM5fNaaVuF9Iiw3dJoPsVRUak&noverify=0&group_code=876295632'
//本脚本的脚本猫链接
const scriptCat_js_url = 'https://scriptcat.org/zh-CN/script-show-page/1029'
//作者B站链接
const b_url = 'https://space.bilibili.com/473239155'
//常见问题链接
const common_question_url = 'https://docs.qq.com/doc/DSlJNR1NVcGR3eEto'
//更新日志链接
const update_log_url = 'https://docs.qq.com/doc/DSnhjSVZmRkpCd0Nj'
// 是否适配bilibili-app-commerce脚本(Bilibili-Gate脚本)
const adaptationBAppCommerce = localMKData.getAdaptationBAppCommerce();
//是否兼容BewlyBewly插件
const compatibleBEWLYBEWLY = localMKData.isCompatible_BEWLY_BEWLY();
// 是否只屏蔽首页
const bOnlyTheHomepageIsBlocked = localMKData.getBOnlyTheHomepageIsBlocked();

export const httpLocalHost = 'http://localhost:3000'
export const wsLocalHost = 'ws://localhost:3000'
//默认返回值-不符合屏蔽条件-{state: false}
export const returnTempVal = {state: false}
export default {
    group_url,
    scriptCat_js_url,
    b_url,
    common_question_url,
    update_log_url,
    adaptationBAppCommerce,
    compatibleBEWLYBEWLY,
    bOnlyTheHomepageIsBlocked
}
