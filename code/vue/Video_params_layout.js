//TODO 等待后续开发
const Video_params_layout = {
    returnVue() {
        const vue = new Vue({
            el: "#video_params_layout",
            data: {
                autoPlayCheckbox: LocalData.video.isAutoPlay(),
            },
            methods: {
                VideoPIPicture() {
                  Util.video.autoAllPictureInPicture();
                }
            },
            watch: {
                autoPlayCheckbox(newVal) {
                    LocalData.video.setAutoPlay(newVal);
                }
            }
        });
        return function () {
            return vue;
        }
    }
}