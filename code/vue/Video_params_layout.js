//TODO 等待后续开发
const Video_params_layout = {
    returnVue() {
        const vue = new Vue({
            el: "#video_params_layout",
            data: {
                autoPlayCheckbox: LocalData.video.isAutoPlay(),
                fenestruleCheckbox: false,
            },
            methods: {
                VideoPIPicture() {
                    const video = $("video");
                    //TODO 该功能目前尚有bug，不知道为什么获取到video标签之后没法使用对应的进出画中画模式，后续优化
                    debugger;
                    if (this.fenestruleCheckbox) {
                        for (const v of video) {
                            v.requestPictureInPicture();//进入画中画
                        }
                    } else {
                        for (const v of video) {
                            v.exitPictureInPicture();//退出画中画
                        }
                    }
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