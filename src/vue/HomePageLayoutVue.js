//{"weight":2}
const HomePageLayoutVue = {
    returnVue() {
        window.homePageLayoutVue = new Vue({
            el: "#homePageLayout",
            data: {
                isSetHomeStyle: LocalData.home.isSetHomeStyle(),
            },
            methods: {},
            watch: {
                isSetHomeStyle(newBool) {
                    LocalData.home.setHomeStyle(newBool);
                }
            }
        });

    }
}
