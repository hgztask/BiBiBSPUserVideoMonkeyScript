const GreatDemand = {//热门
    delVideo() {
        let list = document.getElementsByClassName("video-card");
        if (list.length === 0) {
            list = document.getElementsByClassName("_card_1kuml_6");
            for (let v of list) {
                const title = v.getElementsByClassName("title")[1].textContent;
                const name = v.getElementsByClassName("upName")[0].textContent;
                const time = v.getElementsByClassName("time")[0].textContent;
                if (shieldVideo_userName_uid_title(v, name, null, title, null, null, time)) {
                    Qmsg.info("屏蔽了视频！！");
                }
            }
            return;
        }
        for (let v of list) {
            //页面暂时没法获取uid，可能是我的技术问题，至少暂时先这样
            const title = v.getElementsByClassName("video-name")[0].textContent;//标题
            const name = v.getElementsByClassName("up-name__text")[0].textContent;//用户名
            const play = v.getElementsByClassName("play-text")[0].textContent.trim();//播放量
            //const like = v.getElementsByClassName("like-text")[0].textContent.trim();//弹幕量
            if (shieldVideo_userName_uid_title(v, name, null, title, null, play, null)) {
                Qmsg.info("屏蔽了视频！！");
            }
        }
    }
}