//TODO 等待后续开发
const Video_params_layout = {
    returnVue() {
        const vue = new Vue({
            el: "#video_params_layout",
            data: {
                autoPlayCheckbox: LocalData.video.isAutoPlay(),
                rangePlaySpeed: LocalData.video.getRangePlaySpeed(),
                playbackSpeedSelect: LocalData.video.getRangePlaySpeed(),
                playbackSpeedList: [0.25, 0.5, 0.75, 0.9, 1, 1.25, 1.35, 1.5, 2],
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
                },
                okplaybackSpeedSelectBut() {
                    const data = this.playbackSpeedSelect;
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
                },
                playbackSpeedSelect(newVal) {
                    Util.setVideoBackSpeed(newVal);
                }
            }
        });
        return function () {
            return vue;
        }
    }
}