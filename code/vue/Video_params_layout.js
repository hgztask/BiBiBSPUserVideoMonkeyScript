//TODO 等待后续开发
const Video_params_layout = {
    returnVue() {
        const vue = new Vue({
            el: "#video_params_layout",
            data: {
                autoPlayCheckbox: LocalData.video.isAutoPlay(),
                rangePlaySpeed: LocalData.video.getRangePlaySpeed()
            },
            methods: {
                VideoPIPicture() {
                    Util.video.autoAllPictureInPicture();
                },
                preservePlaySpeed() {//保存视频播放速度值
                    const data = this.rangePlaySpeed;
                    if (!confirm(`是要保存视频的播放速度值吗？\n${data}x`)) return;
                    LocalData.video.setRangePlaySpeed(data);
                    Qmsg.success(`已保存视频的播放速度值=${data}x`);
                }
            },
            watch: {
                autoPlayCheckbox(newVal) {
                    LocalData.video.setAutoPlay(newVal);
                },
                rangePlaySpeed(newVal) {
                    Util.setVideoBackSpeed(newVal);
                }
            }
        });
        return function () {
            return vue;
        }
    }
}