export default {
    isWsService(): boolean {
        return GM_getValue('isWsService', false)
    },
    bAfterLoadingThePageOpenMainPanel(): boolean {
        return GM_getValue('bAfterLoadingThePageOpenMainPanel', false)
    }
}
