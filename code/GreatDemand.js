const GreatDemand = {//热门
    delVideo() {
        let list = document.getElementsByClassName("video-card");
        if (list.length === 0) {
            list = document.getElementsByClassName("_card_1kuml_6");
            for (let v of list) {
                if (shieldVideo_userName_uid_title(new VideoClass().setE(v)
                    .setTitle(v.getElementsByClassName("title")[1].textContent)
                    .setUpName(v.getElementsByClassName("upName")[0].textContent)
                    .setVideoTime(v.getElementsByClassName("time")[0].textContent))) {
                    Qmsg.info("屏蔽了视频！！");
                }
            }
            return;
        }
        for (let v of list) {
            //页面暂时没法获取uid，可能是我的技术问题，至少暂时先这样
            const data = {
                e: v,
                title: v.getElementsByClassName("video-name")[0].textContent,
                upName: v.getElementsByClassName("up-name__text")[0].textContent,
                "播放量": v.getElementsByClassName("play-text")[0].textContent.trim()
            };
            if (shieldVideo_userName_uid_title(data)) {
                Qmsg.info("屏蔽了视频！！");
            }
        }
    }
}