const LookAtItLater = {
    lookAtItLaterListVue() {
        return new Vue({
            el: "lookAtItLaterListLayout",
            data: {
                lookAtItLaterList: LocalData.getLookAtItLaterArr()
            }
        })
    }
}