//{"weight":2}
const IsShowVue = {
    returnVUe() {
        window.isShowVue = new Vue({
            el: "#myBut",
            data: {
                show: LocalData.isMyButSHow(),
            },
            methods: {
                showBut() {
                    Home.hideDisplayHomeLaylout();
                }
            }
        });
    }
};
