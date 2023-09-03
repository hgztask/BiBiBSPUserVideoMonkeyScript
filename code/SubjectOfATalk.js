const SubjectOfATalk = {//话题
    /**
     * 针对b站话题
     */
    deltopIC() {
        for (let v of document.getElementsByClassName("list__topic-card")) {
            const info = v.getElementsByClassName("bili-dyn-content__orig")[0];
            const name = v.getElementsByClassName("bili-dyn-title")[0].textContent.trim();
            const uid = parseInt(v.getElementsByClassName("bili-dyn-item__following")[0].getAttribute("data-mid"));
            if (info.getElementsByClassName("bili-dyn-content__orig__desc").length === 1) {
                const content = info.textContent;
                if (startPrintShieldNameOrUIDOrContent(v, new ContentCLass()
                    .setUpName(name)
                    .setUid(uid)
                    .setContent(content))) {
                    Qmsg.info("屏蔽了言论！！");
                }
                continue;
            }//如果内容是视频样式

            const videoInfo = info.getElementsByClassName("bili-dyn-card-video")[0];
            const videoTime = videoInfo.getElementsByClassName("bili-dyn-card-video__duration")[0].textContent;
            const title = videoInfo.getElementsByClassName("bili-dyn-card-video__title bili-ellipsis")[0].textContent;
            const data = {
                e: v,
                upName: name,
                uid: uid,
                title: title,
                "视频总时长": videoTime
            };
            if (shieldVideo_userName_uid_title(data)) {
                Qmsg.info("屏蔽了视频！！");
            }
        }
    }
}