const IsShowVue = {
    returnVUe() {
        const vue = new Vue({
            el: "#myBut",
            data: {
                show: true,
            },
            methods: {
                showBut() {
                    Home.hideDisplayHomeLaylout();
                }
            },
            created() {
                this.show = LocalData.isMyButSHow();
            }
        });
        return function () {
            return vue;
        };
    }
};