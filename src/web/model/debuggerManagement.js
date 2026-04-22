export default {
// 是否开启ws服务
    isWsService() {
        return GM_getValue('isWsService', false)
    },
    /**
     * 是否加载完页面打开主面板
     * @returns {boolean}
     */
    bAfterLoadingThePageOpenMainPanel() {
        return GM_getValue('bAfterLoadingThePageOpenMainPanel', false)
    }
}
