//{"weight":0}
/**
 * 用户基本信息
 */
class UserClass {
    upName;
    uid;
    upAddress;
    /**
     *
     * @param {string}upName
     * @return {UserClass}
     */
    setUpName(upName) {
        this.upName = upName.trim();
        return this;
    }
    setUpAddress(upAddress) {
        this.upAddress = upAddress;
        return this;
    }
    setUid(uid) {
        this.uid = uid;
        this.setUpAddress(`https://space.bilibili.com/${uid}`)
        return this;
    }
}
/**
 * 视频基本信息
 */
class VideoClass extends UserClass {
    title;
    bv;
    av;
    videoAddress;
    videoTime;
    playbackVolume;
    barrageQuantity;
    //封面
    frontCover;
    e;
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
    setE(element) {//元素
        this.e = element;
        return this;
    }
    setFrontCover(frontCover) {
        this.frontCover = frontCover;
        return this;
    }
    setBarrageQuantity(value) {//弹幕量
        this.barrageQuantity = value;
        return this;
    }
}
/**
 * 用户评论内容
 */
class ContentCLass extends UserClass {
    content;
    setContent(content) {
        this.content = content;
        return this;
    }
}
class LiveRoom extends UserClass {
    roomId;
    title;
    //头像
    face;
    //封面
    frontCover;
    //视频帧
    videoFrame;
    setRoomId(roomId) {
        this.roomId = roomId;
        return this;
    }
    setTitle(title) {
        this.title = title;
        return this;
    }
    setFace(face) {
        this.face = face;
        return this;
    }
    setFrontCover(frontCover) {
        this.frontCover = frontCover;
        return this;
    }
    setVideoFrame(videoFrame) {
        this.videoFrame = videoFrame;
        return this;
    }
}
