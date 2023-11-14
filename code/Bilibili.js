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
        const videoElement = document.getElementsByTagName("video");
        const interval = setInterval(() => {
            try {
                if (videoElement.length === 0) return;
                clearInterval(interval);
                if (LocalData.video.isAutoPlay() === true) {
                    const intervalAutoPlay = setInterval(() => {
                        const au = $("input[aria-label='自动开播']");
                        if (au.length === 0) return;
                        for (const videoTag of videoElement) videoTag.pause();
                        if (au.is(":checked")) {
                            au.attr("checked", false);
                        } else {
                            clearInterval(intervalAutoPlay);
                            console.log("退出intervalAutoPlay")
                            console.log("已自动暂定视频播放");
                        }
                    }, 800);
                }
                for (const videoTag of videoElement) {
                    DefVideo.setVideoSpeedInfo(videoTag);
                    videoTag.addEventListener('ended', () => {//播放器结束之后事件
                        Print.ln("播放结束");
                        if (LocalData.video.isVideoEndRecommend()) {
                            Util.circulateClassName("bpx-player-ending-content", 2000, "已移除播放完视频之后的视频推荐");
                        }
                    }, false);
                }
            } catch (e) {
                console.error("播放页调整播放器出错！", e);
            }
        }, 1000);
        if (!videoData.isrigthVideoList && !videoData.isRhgthlayout && !videoData.isRightVideo) {//如果删除了右侧视频列表和右侧布局就不用监听该位置的元素了
            const interval = setInterval(() => {
                const list = document.querySelectorAll(".video-page-card-small");
                if (list.length === 0) {
                    return;
                }
                DefVideo.rightVideo();
                console.log("检测到右侧视频列表中符合条件");
                clearInterval(interval)
            }, 2000);
        }
        DefVideo.delLayout.delRightE();
        DefVideo.delLayout.delBottonE();
        DefVideo.delLayout.rightSuspendButton();
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
            Search.blockUserCard();
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
    if (href.includes("www.bilibili.com/v/channel/")) {
        const interval = setInterval(() => {
            const jqE = $(".slide-scroll");
            if (jqE.length === 0) return;
            clearInterval(interval);
            jqE.css("flex-wrap", "wrap");
            document.querySelector(".arrow-btn.arrow-btn--right").remove();
            Qmsg.success("已调整页面顶部最近观看的频道列表展示效果");
        }, 1000);
    }
    if (href.includes("www.bilibili.com/v/popular")) {//热门
        GreatDemand.delVideo();
        const interval = setInterval(() => {
            const jqE = $(".international-footer");
            if (jqE.length === 0) return;
            clearInterval(interval);
            jqE.remove();
        }, 1000);
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
        if (LocalData.getPrivacyMode() && Space.isH_action()) {
            $(".h-inner").hide();
            $("#navigator-fixed .n-tab-links .n-fans").hide();
            Qmsg.success(`检测到当前页面是用户自己的个人空间，由于开启了隐私模式，故隐藏该信息`);
        }
    }
}