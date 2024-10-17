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
                   Tip.info("屏蔽了言论！！");
                }
                continue;
            }//如果内容是视频样式
            const videoInfo = info.querySelector(".bili-dyn-card-video");
            if (shieldVideo_userName_uid_title(new VideoClass()
                .setE(v)
                .setUpName(name)
                .setUid(uid)
                .setTitle(videoInfo.querySelector(".bili-dyn-card-video__title.bili-ellipsis").textContent)
                .setVideoTime(videoInfo.querySelector(".bili-dyn-card-video__duration").textContent))) {
                Tip.videoBlock("屏蔽了视频");
            }
        }
    }
}
