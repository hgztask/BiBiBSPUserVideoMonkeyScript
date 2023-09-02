class userClass {
    upName;
    uid;
}

class VideoClass extends userClass {
    title;
    bv;
    videoAddress;
    upAddress;

    constructor(title, bv, videoAddress, upAddress) {
        super();
        this.title = title;
        this.bv = bv;
        this.videoAddress = videoAddress;
        this.upAddress = upAddress;
    }
}
