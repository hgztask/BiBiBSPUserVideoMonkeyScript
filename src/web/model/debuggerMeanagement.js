import gmUtil from "../utils/gmUtil.js";

/**
 * 是否加载完页面打开主面板
 * @returns {boolean}
 */
export const bAfterLoadingThePageOpenMainPanel = () => {
    return gmUtil.getData('bAfterLoadingThePageOpenMainPanel', false)
}

// 是否开启ws服务
export const isWsService = () => {
    return gmUtil.getData('isWsService', false)
}
