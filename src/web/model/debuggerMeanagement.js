/**
 * 是否加载完页面打开主面板
 * @returns {boolean}
 */
export const bAfterLoadingThePageOpenMainPanel = () => {
    return GM_getValue('bAfterLoadingThePageOpenMainPanel', false)
}

// 是否开启ws服务
export const isWsService = () => {
    return GM_getValue('isWsService', false)
}
