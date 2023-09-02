/**
 * 用户基本信息
 */
class userClass {
    upName;
    uid;
    upAddress;

    setUpName(upName) {
        this.upName = upName;
        return this;
    }

    setUpAddress(upAddress) {
        this.upAddress = upAddress;
        return this;
    }

    setUid(uid) {
        this.uid = uid;
        return this;
    }
}

/**
 * 视频基本信息
 */
class VideoClass extends userClass {
    title;
    bv;
    av;
    videoAddress;
    videoTime;
    playbackVolume;

    setTitle(title) {
        this.title = title;
        return this;
    }

    setBv(bv) {
        this.bv = bv;
        return this;
    }

    setAv(av) {
        this.av = av;
        return this;
    }

    setVideoAddress(videoAddress) {//设置视频地址
        this.videoAddress = videoAddress;
        return this;
    }

    setVideoTime(videoTime) {//设置时长
        this.videoTime = videoTime;
        return this;
    }

    //设置播放量
    setPlaybackVolume(playbackVolume) {
        this.playbackVolume = playbackVolume;
        return this;
    }

}



