//{"weight":1}
async function perf_observer() {
    const entries = performance.getEntriesByType('resource');
    const windowUrl = Util.getWindowUrl();
    for (let entry of entries) {
        const url = entry.name;
        const initiatorType = entry.initiatorType;
        if (initiatorType === "img" || initiatorType === "css" || initiatorType === "link" || initiatorType === "beacon") {
            continue;
        }
        if (url.includes("api.bilibili.com/x/v2/reply/wbi/main?oid=") || url.includes("api.bilibili.com/x/v2/reply/reply?") ||
            url.includes("api.bilibili.com/x/web-interface/wbi/view/detail?aid=") || url.includes("api.bilibili.com/x/v2/reply/reply?oid=")) {
            /**
             * 视频播放页和www.bilibili.com/opus动态页下的评论
             * 需要注意的是，www.bilibili.com/opus这地址，可以从动态页中的，直接点击动态内容跳转的地址
             */
            if (windowUrl.includes("https://www.bilibili.com/video") && LocalData.video.isHideVideoButtonCommentSections()) {
                continue;
            }
            console.log("视频api");
            const p = new Promise(resolve => {
                const i1 = setInterval(() => {
                    if (document.querySelector(".reply-list>.reply-loading") !== null) {
                        return;
                    }
                    clearInterval(i1);
                    let replyList;
                    if (windowUrl.includes("https://www.bilibili.com/video")) {
                        const tempE = document.querySelector("bili-comments");
                        replyList = tempE.shadowRoot.querySelectorAll("bili-comment-thread-renderer")
                    } else {
                        replyList = document.querySelectorAll(".reply-list>.reply-item")
                    }
                    resolve(replyList);
                }, 1000);
            });
            const list = await p;
            for (let v of list) {//针对于评论区
                let usercontentWarp, data;
                //适配新版b站视频评论区
                if (windowUrl.includes("https://www.bilibili.com/video")) {
                    usercontentWarp = v.shadowRoot.querySelector("#comment");
                    data = DefVideo.getOuterCommentInfo(usercontentWarp);
                } else {
                    usercontentWarp = v.querySelector(".content-warp");
                    data = Trends.getVideoCommentAreaOrTrendsLandlord(usercontentWarp);
                }
                if (startPrintShieldNameOrUIDOrContent(v, data)) {
                    Tip.success("屏蔽了言论！！");
                    continue;
                }
                const jqE = $(usercontentWarp);
                if (!Util.isEventJq(jqE, "mouseover")) {
                    jqE.mouseenter((e) => {
                        let domElement = e.delegateTarget;
                        let data;
                        if (windowUrl.includes("https://www.bilibili.com/video")) {
                            data = DefVideo.getOuterCommentInfo(domElement);
                        } else {
                            data = Trends.getVideoCommentAreaOrTrendsLandlord(domElement);
                        }
                        Util.showSDPanel(e, data);
                    });
                }
                let subReplyList;//楼层中的评论列表
                if (windowUrl.includes("https://www.bilibili.com/video")) {
                    subReplyList = v.shadowRoot
                        .querySelector("bili-comment-replies-renderer").shadowRoot
                        .querySelectorAll("bili-comment-reply-renderer")
                } else {
                    subReplyList = v.querySelectorAll(".sub-reply-container>.sub-reply-list>.sub-reply-item");//楼主下面的评论区
                }
                if (subReplyList.length === 0) {
                    continue;
                }
                for (let j of subReplyList) {
                    let data;
                    if (windowUrl.includes("https://www.bilibili.com/video")) {
                        data = DefVideo.getInnerCommentInfo(j);
                    } else {
                        data = Trends.getVideoCommentAreaOrTrendsStorey(j);
                    }
                    if (startPrintShieldNameOrUIDOrContent(j, data)) {
                        Tip.success("屏蔽了言论！！");
                        continue;
                    }
                    const jqE = $(j);
                    if (Util.isEventJq(jqE, "mouseover")) {
                        continue;
                    }
                    jqE.mouseenter((e) => {
                        const domElement = e.delegateTarget;
                        if (windowUrl.includes("https://www.bilibili.com/video")) {
                            data = DefVideo.getInnerCommentInfo(domElement);
                        } else {
                            data = Trends.getVideoCommentAreaOrTrendsStorey(domElement);
                        }
                        Util.showSDPanel(e, data);
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
            Search.searchColumn();
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
            SubjectOfATalk.deltopIC();
            continue;
        }
        if (url.includes("api.live.bilibili.com/xlive/web-interface/v1/second/getList?platform=web")) {//直播间列表，目前依旧还有点小问题，暂时不考虑维护了，后面再考虑
            Live.liveDel.delLiveRoom();
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/popular")
            || url.includes("api.bilibili.com/x/copyright-music-publicity/toplist/music_list?csrf=")
            && windowUrl.includes("www.bilibili.com/v/popular")) {//热门
            GreatDemand.delVideo();
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
                    const isTitle = Matching.arrContent(LocalData.getArrTitle(), title);
                    if (isTitle != null) {
                        Tip.printLn(`已通过标题黑名单关键词屏蔽【${isTitle}】标题【${title}】`);
                        q.remove();
                        continue;
                    }
                    const isTitleCanonical = Matching.arrContentCanonical(LocalData.getArrTitleKeyCanonical(), title);
                    if (isTitleCanonical != null) {
                        Tip.printLn(`已通过标题正则黑名单关键词屏蔽【${isTitleCanonical}】标题【${title}】`);
                        q.remove();
                    }
                }
            }
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/wbi/search/type?") || url.includes("api.bilibili.com/x/web-interface/wbi/search/all/v2")) {//搜索界面
            if (windowUrl.includes("search.bilibili.com/video") || windowUrl.includes("search.bilibili.com/all")) {
                Search.video.searchRules();
            }
            if (windowUrl.includes("search.bilibili.com/all")) {
                Search.blockUserCard();
            }
            Tip.info("检测到搜索的接口");
            //search.searchRules();
            continue;
        }
        if (url.includes("https://api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd?web_location")) {//首页换一换
            Home.startShieldMainVideo(".container.is-version8>.feed-card").then(() => {
                Home.startShieldMainVideo(".container.is-version8>.bili-video-card");//换一换下面的视频
            });
        }
        if (url.includes("https://api.bilibili.com/x/web-interface/ranking/v2")) {
            console.log("热门排行榜api");
            const interval = setInterval(() => {
                const elList = document.querySelectorAll(".rank-list>.rank-item");
                if (elList.length === 0) return;
                clearInterval(interval);
                try {
                    elList.forEach(e => {
                        const info = e.querySelector(".info");
                        const videoInfo = info.querySelector(".title");
                        const userInfo = info.querySelector(".detail>a");
                        const video = new VideoClass().setE(e)
                            .setUpName(userInfo.textContent.trim())
                            .setBv(Util.getUrlBVID(videoInfo.href))
                            .setTitle(videoInfo.textContent.trim());
                        video.setUid(Util.getSubWebUrlUid(userInfo.href))
                        if (shieldVideo_userName_uid_title(video)) {
                            Tip.videoBlock("屏蔽了视频");
                        }
                    });
                } catch (e) {
                    console.error(e);
                    Tip.error("检测时出现错误！，请查询控制台信息！");
                }
            }, 100);
        }
    }
    performance.clearResourceTimings();//清除资源时间
}
