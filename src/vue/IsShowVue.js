const IsShowVue = {
    returnVUe() {
        const vue = new Vue({
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
        return function () {
            return vue;
        };
    }
};