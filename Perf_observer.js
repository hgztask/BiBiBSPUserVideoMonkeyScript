function perf_observer() {
    const entries = performance.getEntriesByType('resource');
    const windowUrl = Util.getWindowUrl();
    for (let entry of entries) {
        const url = entry.name;
        const initiatorType = entry.initiatorType;
        if (initiatorType === "img" || initiatorType === "css" || initiatorType === "link" || initiatorType === "beacon") {
            continue;
        }
        //只要json类的
        if (url.includes("api.bilibili.com/x/web-interface/web/channel") && windowUrl.includes("www.bilibili.com/v/channel")) {
            //针对于频道界面的综合视频和频道界面的精选视频
            frequencyChannel.videoRules();
            frequencyChannel.listRules();
            continue;
        }
        if (url.includes("api.bilibili.com/x/v2/reply/main?csrf=") || url.includes("api.bilibili.com/x/v2/reply/reply?csrf=")) {
            /**
             * 视频播放页和www.bilibili.com/opus动态页下的评论
             * 需要注意的是，www.bilibili.com/opus这地址，可以从动态页中的，直接点击动态内容跳转的地址
             */
            if (windowUrl.includes("https://www.bilibili.com/video") && LocalData.getDelVideoCommentSections()) {
                return;
            }
            const list = document.querySelectorAll(".reply-list>.reply-item");
            for (let v of list) {//针对于评论区
                const usercontentWarp = v.querySelector(".content-warp");
                const data = trends.getVideoCommentAreaOrTrendsLandlord(usercontentWarp);
                const subReplyList = v.querySelectorAll(".sub-reply-container>.sub-reply-list>.sub-reply-item");//楼主下面的评论区
                if (startPrintShieldNameOrUIDOrContent(v, data.name, data.uid, data.content)) {
                    Qmsg.success("屏蔽了言论！！");
                    continue;
                }
                const jqE = $(usercontentWarp);
                if (!Util.isEventJq(jqE, "mouseover")) {
                    jqE.mouseenter((e) => {
                        const domElement = e.delegateTarget;//dom对象
                        const data = trends.getVideoCommentAreaOrTrendsLandlord(domElement);
                        Util.showSDPanel(e, data.name, data.uid);
                    });
                }
                if (subReplyList.length === 0) {
                    continue;
                }
                for (let j of subReplyList) {
                    const data = trends.getVideoCommentAreaOrTrendsStorey(j);
                    if (startPrintShieldNameOrUIDOrContent(j, data.name, data.uid, data.content)) {
                        Qmsg.success("屏蔽了言论！！");
                        continue;
                    }
                    const jqE = $(j);
                    if (Util.isEventJq(jqE, "mouseover")) {
                        continue;
                    }
                    jqE.mouseenter((e) => {
                        const domElement = e.delegateTarget;//dom对象
                        const data = trends.getVideoCommentAreaOrTrendsStorey(domElement);
                        Util.showSDPanel(e, data.name, data.uid);
                    });
                }
            }
            continue;
        }
        if (url.includes("api.bilibili.com/x/msgfeed/reply?platform=") || url.includes("api.bilibili.com/x/msgfeed/reply?id=")) {//第一次加载对应json信息和后续添加的json信息
            message.delMessageReply();
            continue;
        }
        if (url.includes("api.bilibili.com/x/article/metas?ids=")) {//搜索专栏
           search.searchColumn();
            continue;
        }
        if (url.includes("api.bilibili.com/x/msgfeed/at?build=")) {//消息中心的 @我的
            message.delMessageAT();
            continue;
        }
        //后面一个条件限制为仅仅是专栏页面的该api，消息中心的api疑似也是这个，后续在测试看下
        if (url.includes("api.bilibili.com/x/v2/reply/main?callback=jQuery") || url.includes("api.bilibili.com/x/v2/reply/reply?callback=jQuery")) {
            if (windowUrl.includes("www.bilibili.com/read")) {
                delDReplay();
                continue;
            }
            if (windowUrl.includes("t.bilibili.com")) {
                console.log("接收到了动态的评论区api")
                delDReplay();
                continue;
            }
            if (windowUrl.includes("www.bilibili.com/v/topic/detail/?topic_id=")) {//话题界面的楼层评论
                console.log("话题界面的api")
            }
            if (windowUrl.search("space.bilibili.com/.*dynamic") !== -1) {
                delDReplay();
            }
        }
        if (url.includes("app.bilibili.com/x/topic/web/details/cards?topic_id=") && windowUrl.includes("www.bilibili.com/v/topic/detail/?topic_id=")) {//话题页面数据加载
            subjectOfATalk.deltopIC();
            continue;
        }
        if (url.includes("api.live.bilibili.com/xlive/web-interface/v1/second/getList?platform=web")) {//直播间列表，目前依旧还有点小问题，暂时不考虑维护了，后面再考虑
            Live.liveDel.delLiveRoom();
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/popular")
            || url.includes("api.bilibili.com/x/copyright-music-publicity/toplist/music_list?csrf=")
            && windowUrl.includes("www.bilibili.com/v/popular")) {//热门
            greatDemand.delVideo();
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/dynamic/region?ps=")) {//首页分区类的api
            console.log("检测到首页分区类的api")
            Home.startShieldMainVideo(".bili-video-card");
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/ranking/region?")) {//首页分区排行榜
            for (let v of document.querySelectorAll(".bili-rank-list-video__list.video-rank-list")) {//遍历每个排行榜
                for (let q of v.querySelectorAll("li[class='bili-rank-list-video__item']")) {//遍历某个排行榜中的项目
                    const title = q.querySelector("[title]").textContent;
                    const isTitle = Shield.arrContent(LocalData.getArrTitle(), title);
                    if (isTitle != null) {
                        Print.ln(`已通过标题黑名单关键词屏蔽【${isTitle}】标题【${title}】`);
                        q.remove();
                        continue;
                    }
                    const isTitleCanonical = Shield.arrContentCanonical(LocalData.getArrTitleKeyCanonical(), title);
                    if (isTitleCanonical != null) {
                        Print.ln(`已通过标题正则黑名单关键词屏蔽【${isTitleCanonical}】标题【${title}】`);
                        q.remove();
                    }
                }
            }
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/wbi/search/type?")) {//搜索界面
            if (windowUrl.includes("search.bilibili.com/video") || windowUrl.includes("search.bilibili.com/all")) {
                search.searchRules($(".video-list").children());
                continue;
            }
            Qmsg.info("检测到搜索的接口");
            //search.searchRules();
        }
    }
    performance.clearResourceTimings();//清除资源时间
}