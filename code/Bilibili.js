/**
 * 根据网页url指定不同的逻辑
 * @param href{String} url链接
 */
async function bilibili(href) {
    if (href.includes("live.bilibili.com/p/eden/area-tags")) {
        console.log("直播专区")
        Live.liveDel.delLiveRoom();
        return;
    }
    if (href.includes("https://www.bilibili.com/video")) {//如果是视频播放页的话
        const videoData = Rule.videoData;
        const interval = setInterval(() => {
            try {
                const videoElement = document.getElementsByTagName("video")[0];
                if (videoElement === undefined) {
                    return;
                }
                clearInterval(interval);
                const autoPlay = Util.getData("autoPlay");
                if (autoPlay === true) {
                    const intervalAutoPlay = setInterval(() => {
                        const au = $("input[aria-label='自动开播']");
                        if (au.length === 0) {
                            return;
                        }
                        videoElement.pause();
                        if (au.is(":checked")) {
                            au.attr("checked", false);
                            console.log(au.is(":checked"));
                        } else {
                            clearInterval(intervalAutoPlay);
                            console.log("退出intervalAutoPlay")
                            console.log("已自动暂定视频播放");
                        }
                    }, 800);
                }

                function setVideoSpeedInfo() {
                    const data = Util.getData("playbackSpeed");
                    if (data === undefined) {
                        return;
                    }
                    if (data === 0 || data < 0.1) {
                        return;
                    }
                    //播放视频速度
                    videoElement.playbackRate = data;
                    Print.ln("已设置播放器的速度=" + data);
                }

                setVideoSpeedInfo();
                videoElement.addEventListener('ended', () => {//播放器结束之后事件
                    Print.ln("播放结束");
                    if (videoData.isVideoEndRecommend) {
                        Util.circulateClassName("bpx-player-ending-content", 2000, "已移除播放完视频之后的视频推荐");
                    }
                }, false);
            } catch (e) {
            }
        }, 1000);
        if (!videoData.isrigthVideoList && !videoData.isRhgthlayout && !videoData.isRightVideo) {//如果删除了右侧视频列表和右侧布局就不用监听该位置的元素了
            const interval = setInterval(() => {
                const list = document.querySelectorAll(".video-page-card-small");
                if (list.length === 0) {
                    return;
                }
                videoFun.rightVideo();
                console.log("检测到右侧视频列表中符合条件");
                clearInterval(interval)

            }, 2000);
        }
        videoFun.delRightE();
        videoFun.delBottonE();
        videoFun.rightSuspendButton();
        return;
    }
    if (href.includes("search.bilibili.com")) {
        const tabsItem = Search.getTabsItem();
        const $getDataListBut = $("#getDataListBut");
        const $getAllDataListBut = $("#getAllDataListBut");
        $getDataListBut.text(`获取${tabsItem}数据(当前页)`);
        $getAllDataListBut.text(`获取${tabsItem}数据(全部页)`);

        if (tabsItem === "直播") {
            const liveTabItems = Search.live.getTabsItem();
            if (liveTabItems === "全部") {
                $getDataListBut.hide();
                $getAllDataListBut.hide();
            } else {
                $getDataListBut.text(`获取${liveTabItems}数据(当前页)`);
                $getAllDataListBut.text(`获取${liveTabItems}数据(全部页)`);
                $getDataListBut.show();
                $getAllDataListBut.show();
            }
        } else {
            $getDataListBut.show();
            $getAllDataListBut.show();
        }


        if (href.includes("search.bilibili.com/all") || href.includes("search.bilibili.com/video")) {//搜索页面-综合-搜索界面-视频
                Search.video.searchRules();
            return;
        }
        return;
    }
    if (href.includes("message.bilibili.com/#/at") || href.includes("message.bilibili.com/?spm_id_from=..0.0#/at")) {//消息中心-艾特我的
        message.delMessageAT();
        return;
    }
    if (href.includes("message.bilibili.com/#/reply") || href.includes("message.bilibili.com/?spm_id_from=..0.0#/reply")) {
        message.delMessageReply();
        return;
    }
    if (href.search("www.bilibili.com/v/channel/.*?tab=.*") !== -1) {//频道 匹配到频道的精选列表，和综合的普通列表
        frequencyChannel.videoRules();
        frequencyChannel.delDevelop();
        frequencyChannel.cssStyle.backGauge();

    }
    if (href.includes("www.bilibili.com/v/popular")) {//热门
        greatDemand.delVideo();
        try {
            document.getElementsByClassName("international-footer")[0].remove();
        } catch (e) {
            console.log("屏蔽热门底部元素出错！" + e);
        }
        return;
    }
    if (href.includes("www.bilibili.com/v/")) {//通过URL变动执行屏蔽首页分区视频
        Home.startShieldMainVideo(".bili-video-card");
        Home.homePrefecture();
        return;
    }
    if (href.includes("space.bilibili.com")) {
        const userName = await Space.getUserName();
        const $getDataListBut = $("#getDataListBut");
        const $getAllDataListBut = $("#getAllDataListBut");
        const getTabName = Space.getTabName();
        if (getTabName === "主页") {
            $getDataListBut.hide();
            $getAllDataListBut.hide();
        } else {
            $getDataListBut.show();
            $getAllDataListBut.show();
        }
        if (getTabName === "投稿") {
            const name = Space.video.getLeftTabTypeName();
            $getDataListBut.text(`获取当前${getTabName}页的${name}列表数据`);
            $getAllDataListBut.text(`获取${getTabName}的${name}列表数据`);
        } else if (getTabName === "订阅") {
            const tabsName = Space.subscribe.getTabsName();
            $getDataListBut.text(`获取当前${tabsName}页的列表数据`);
            $getAllDataListBut.text(`获取${tabsName}的列表数据`);
        } else {
            $getDataListBut.text(`获取当前${getTabName}页的列表数据`);
            $getAllDataListBut.text(`获取${getTabName}的列表数据`);
        }

        switch (getTabName) {
            case "动态":
                const interval01 = setInterval(() => {
                    const tempE = $(".bili-dyn-list__items");
                    if (tempE.length === 0) {
                        return;
                    }
                    const list = tempE.children();
                    if (list.length === 0) {
                        return;
                    }
                    clearInterval(interval01);
                    Trends.shrieDynamicItems(list);
                    if (Util.isEventJq(tempE, "DOMNodeInserted")) {
                        clearInterval(interval01);
                        return;
                    }
                    tempE.bind("DOMNodeInserted", () => {
                        Trends.shrieDynamicItems($(".bili-dyn-list__items").children());
                    });
                }, 1000);
                break;
        }


    }

}