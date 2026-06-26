import localMKData from "../state/localMKData.ts"

const group_url: string = 'http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=tFU0xLt1uO5u5CXI2ktQRLh_XGAHBl7C&authKey=KAf4rICQYjfYUi66WelJAGhYtbJLILVWumOm%2BO9nM5fNaaVuF9Iiw3dJoPsVRUak&noverify=0&group_code=876295632'
const scriptCat_js_url: string = 'https://scriptcat.org/zh-CN/script-show-page/1029'
const b_url: string = 'https://space.bilibili.com/473239155'
const common_question_url: string = 'https://docs.qq.com/doc/DSlJNR1NVcGR3eEto'
const update_log_url: string = 'https://docs.qq.com/doc/DSnhjSVZmRkpCd0Nj'
const adaptationBAppCommerce: boolean = localMKData.getAdaptationBAppCommerce()
const compatibleBEWLYBEWLY: boolean = localMKData.isCompatible_BEWLY_BEWLY()
const bOnlyTheHomepageIsBlocked: boolean = localMKData.getBOnlyTheHomepageIsBlocked()

export const httpLocalHost: string = 'http://localhost:3000'
export const wsLocalHost: string = 'ws://localhost:3011'

export const returnTempVal: { state: boolean } = {state: false}

export const promiseResolve: Promise<void> = Promise.resolve()

export const promiseReject: Promise<never> = Promise.reject()

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
