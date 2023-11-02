const Video_params_layout = {
    returnVue() {
        const vue = new Vue({
            el: "#video_params_layout",
            data: {
                autoPlayCheckbox: LocalData.video.isAutoPlay(),
                videoEndRecommendCheckbox: LocalData.video.isVideoEndRecommend(),
                rangePlaySpeed: LocalData.video.getRangePlaySpeed(),
                playbackSpeedSelect: LocalData.video.getRangePlaySpeed(),
                playbackSpeedList: [0.25, 0.5, 0.75, 0.9, 1, 1.25, 1.35, 1.5, 2],
                isFlipHorizontal: false,
                isFlipVertical: false,
                axleRange: 0,
                hideVideoTopTitleInfoCheackBox: LocalData.video.isHideVideoTopTitleInfoLayout(),
                hideVideoButtonCheackBox: LocalData.video.isHideVideoButtonCommentSections(),
                hideVideoRightLayoutCheackBox: LocalData.video.isHideVideoRightLayout()
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
                okFlipHorizontal() {//水平翻转
                    if (this.isFlipHorizontal) {
                        Util.setVideoRotationAngle("Y", 0);
                        this.isFlipHorizontal = false;
                        return;
                    }
                    Util.setVideoRotationAngle("Y", 180);
                    this.isFlipHorizontal = true;
                },
                okFlipVertical() {//垂直翻转
                    if (this.isFlipVertical) {
                        Util.setVideoRotationAngle("X", 0);
                        this.isFlipVertical = false;
                        return;
                    }
                    Util.setVideoRotationAngle("X", 180)
                    this.isFlipVertical = true;
                }

            },
            watch: {
                autoPlayCheckbox(newVal) {
                    LocalData.video.setAutoPlay(newVal);
                },
                videoEndRecommendCheckbox(newVal) {
                    LocalData.video.setVideoEndRecommend(newVal);
                },
                rangePlaySpeed(newVal) {
                    Util.setVideoBackSpeed(newVal);
                },
                playbackSpeedSelect(newVal) {
                    this.rangePlaySpeed = newVal;
                },
                axleRange(newVal) {
                    Util.setVideoCenterRotation(newVal);
                },
                hideVideoTopTitleInfoCheackBox(newVal) {
                    LocalData.video.setHideVideoTopTitleInfoLayout(newVal);
                },
                hideVideoRightLayoutCheackBox(newVal) {
                    LocalData.video.setHideVideoRightLayout(newVal);
                },
                hideVideoButtonCheackBox(newVal) {
                    LocalData.video.setHideVideoButtonCommentSections(newVal);
                }
            }
        });
        return function () {
            return vue;
        }
    }
}