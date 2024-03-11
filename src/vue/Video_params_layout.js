//{"weight":2}
const Video_params_layout = {
    returnVue() {
        const vue = new Vue({
            el: "#video_params_layout",
            data: {
                autoPlayCheckbox: LocalData.video.isAutoPlay(),
                videoEndRecommendCheckbox: LocalData.video.isVideoEndRecommend(),
                isFlipHorizontal: false,
                isFlipVertical: false,
                axleRange: 0,
                setAutoSubItemButShow: LocalData.video.isSubItemButShow(),
                hideVideoTopTitleInfoCheackBox: LocalData.video.isHideVideoTopTitleInfoLayout(),
                hideVideoButtonCheackBox: LocalData.video.isHideVideoButtonCommentSections(),
                hideVideoRightLayoutCheackBox: LocalData.video.isHideVideoRightLayout()
            },
            methods: {
                VideoPIPicture() {
                    Util.video.autoAllPictureInPicture();
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
                },
                setAutoSubItemButShow(newBool) {
                    LocalData.video.setSubItemButShow(newBool);
                }
            }
        });
        return function () {
            return vue;
        }
    }
}
