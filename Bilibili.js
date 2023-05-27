function bilibili(href) {
    if (href === "https://www.bilibili.com/" || href.includes("www.bilibili.com/?spm_id_from") || href.includes("www.bilibili.com/index.html")) {//首页
        console.log("进入了首页");

        function ergodicList(list) { //针对频道api中的数据遍历处理并添加进去网页元素
            for (const v of list) {
                const av = v["id"];//视频av号
                const title = v["name"];//标题
                const cover = v["cover"];//封面
                const view_count = v["view_count"];//播放量
                const like_count = v["like_count"];//点赞量
                const danmaku = v["danmaku"];//弹幕量
                const duration = v["duration"];//时长【格式化之后的时分秒】
                const author_name = v["author_name"];//用户名
                const author_id = v["author_id"];//用户UID
                const bvid = v["bvid"];//视频bv号
                if (tempFunc(author_id, title, author_name, bvid, duration, "", view_count, danmaku === undefined ? 0 : danmaku, cover)) {
                    Qmsg.info("过滤了视频！！");
                }
            }
        };

        function loadingVideoZE() { //加载频道视频数据
            const tempChannelId = frequencyChannel.getChannel_id();
            const tempSortType = frequencyChannel.getSort_type();//频道推送的类型，热门还是以播放量亦或者最新
            const tempOffset = frequencyChannel.getOffset(tempChannelId, tempSortType);//视频列表偏移量
            const loading = Qmsg.loading("正在加载数据！");
            HttpUtil.get(`https://api.bilibili.com/x/web-interface/web/channel/multiple/list?channel_id=${tempChannelId}&sort_type=${tempSortType}&offset=${tempOffset}&page_size=30`, function (res) {
                const body = JSON.parse(res.responseText);//频道页一次最多加载30条数据
                if (body["code"] !== 0) {
                    alert("未获取到频道视频数据");
                    loading.close();
                    return;
                }
                const bodyList = body["data"]["list"];
                $(".container.is-version8").html("");
                if (tempOffset === "" && tempSortType === "hot") {
                    ergodicList(bodyList[0]["items"]);
                    ergodicList(bodyList.slice(1));
                } else {
                    ergodicList(bodyList);
                }
                frequencyChannel.setOffset(tempChannelId, tempSortType, body["data"]["offset"]);
                loading.close();
            });
        };

        /**
         * @param uid uid
         * @param videoTitle 标题
         * @param userName 用户名
         * @param bvid by号
         * @param duration  视频时长
         * @param ctimeStr 发布时间
         * @param view 播放量
         * @param danmaku 弹幕量
         * @param pic 封面
         */
        function tempFunc(uid, videoTitle, userName, bvid, duration, ctimeStr, view, danmaku, pic) {
            if (Shield.arrKey(LocalData.getArrUID(), uid)) {
                Print.video("yellow", "已通过UID屏蔽", userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`)
                return true;
            }
            const isNameKey = Shield.arrContent(LocalData.getArrNameKey(), userName);
            if (isNameKey != null) {
                Print.video(null, `已通过用户名模糊屏蔽规则【${isNameKey}】`, userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`)
                return true;
            }
            const isTitleKey = Shield.arrContent(LocalData.getArrTitle(), videoTitle);
            if (isTitleKey != null) {
                Print.video("#66CCCC", `已通过标题模糊屏蔽规则=【${isTitleKey}】`, userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`);
                return true;
            }
            const isTitleKeyCanonical = Shield.arrContentCanonical(LocalData.getArrTitleKeyCanonical(), videoTitle);
            if (isTitleKeyCanonical != null) {
                Print.video("#66CCCC", `已通过标题正则表达式屏蔽规则=${isTitleKeyCanonical}`, userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`);
                return true;
            }
            $(".container.is-version8").append(
                addElement.homeVideoE.getHtmlStr(
                    videoTitle, "https://www.bilibili.com/" + bvid, pic, uid, userName, duration, ctimeStr,
                    Util.getNumberFormat(view), Util.getNumberFormat(danmaku))
            );
            $("div[class='bili-video-card is-rcmd']:last").mouseenter((e) => {
                const domElement = e.delegateTarget;//dom对象
                const title = domElement.querySelector(".bili-video-card__info--tit").textContent;
                const userInfo = domElement.querySelector(".bili-video-card__info--owner");
                const userHref = userInfo.href;
                const uerName = domElement.querySelector(".bili-video-card__info--author").textContent;
                Util.showSDPanel(e, uerName, userHref.substring(userHref.lastIndexOf("/") + 1), title);
            });
        }

        function loadingVideoE(ps) {//加载分区视频数据
            const loading = Qmsg.loading("正在加载数据！");
            HttpUtil.get(`https://api.bilibili.com/x/web-interface/dynamic/region?ps=${ps}&rid=${LocalData.getVideo_zone()}`, function (res) {
                const bodyJson = JSON.parse(res.responseText);
                if (bodyJson["code"] !== 0) {
                    alert("未获取到视频数据！");
                    loading.close();
                    return;
                }
                const archives = bodyJson["data"]["archives"];
                $(".container.is-version8").html("");
                for (const v of archives) {
                    const picUil = v["pic"];
                    const videoTitle = v["title"];
                    let bvid = v["bvid"];
                    const uid = v["owner"]["mid"];
                    const name = v["owner"]["name"];
                    const view = v["stat"]["view"];//播放量
                    const danmaku = v["stat"]["danmaku"];//弹幕量
                    const aid = v["stat"]["aid"];//av号
                    const cid = v["cid"];
                    const ctime = v["ctime"];//视频审核时间时间戳
                    const pubdate = v["pubdate"];//视频上传时间时间戳
                    const ctimeStr = Util.timestampToTime(ctime * 1000);//发布时间
                    const duration = v["duration"];//视频时长秒，专区-存数字时间
                    const bvidSub = bvid.substring(0, bvid.indexOf("?"));
                    bvid = (bvidSub === "" ? bvid : bvidSub);
                    if (tempFunc(uid, videoTitle, name, bvid, Util.formateTime(duration), ctimeStr, view, danmaku, picUil)) {
                        Qmsg.info("过滤了视频！！");
                    }
                }
                loading.close();
            });
        }

        const interval01 = setInterval(() => {
            const recommended = $(".recommended-container_floor-aside");
            if (recommended.length === 0) {
                return;
            }
            clearInterval(interval01);
            recommended.prepend(`<div style="display: flex; flex-direction: row-reverse">
<button class="primary-btn roll-btn" id="replaceItBut" style="  height: 38px;position: fixed;    z-index: 100; background-color: #17181A; "><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style="--darkreader-inline-fill:currentColor;" data-darkreader-inline-fill=""><path d="M8.624933333333333 13.666666666666666C8.624933333333333 14.011849999999999 8.345125 14.291666666666666 7.999933333333333 14.291666666666666C4.525166666666666 14.291666666666666 1.7082933333333332 11.474791666666665 1.7082933333333332 8C1.7082933333333332 6.013308333333333 2.629825 4.2414233333333335 4.066321666666667 3.089385C4.335603333333333 2.8734283333333335 4.728959999999999 2.9166533333333335 4.944915 3.1859349999999997C5.160871666666666 3.4552099999999997 5.1176466666666665 3.848573333333333 4.848366666666666 4.0645283333333335C3.694975 4.98953 2.9582933333333328 6.40852 2.9582933333333328 8C2.9582933333333328 10.784416666666667 5.215528333333333 13.041666666666666 7.999933333333333 13.041666666666666C8.345125 13.041666666666666 8.624933333333333 13.321483333333333 8.624933333333333 13.666666666666666zM11.060475 12.810558333333333C10.844225000000002 12.541558333333331 10.887033333333335 12.148125 11.156041666666667 11.931875C12.306858333333333 11.006775 13.041599999999999 9.589424999999999 13.041599999999999 8C13.041599999999999 5.215561666666666 10.784408333333332 2.958333333333333 7.999933333333333 2.958333333333333C7.6548083333333325 2.958333333333333 7.374933333333333 2.6785083333333333 7.374933333333333 2.333333333333333C7.374933333333333 1.9881533333333332 7.6548083333333325 1.7083333333333333 7.999933333333333 1.7083333333333333C11.474725000000001 1.7083333333333333 14.291599999999999 4.525206666666667 14.291599999999999 8C14.291599999999999 9.984108333333333 13.372483333333332 11.753958333333332 11.939225 12.906125C11.670166666666663 13.122375 11.276725 13.079625 11.060475 12.810558333333333z" fill="currentColor" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"></path><path d="M1.375 3.4130866666666666C1.375 3.0679066666666666 1.654825 2.7880866666666666 2 2.7880866666666666L4.333333333333333 2.7880866666666666C4.862608333333333 2.7880866666666666 5.291666666666666 3.2171449999999995 5.291666666666666 3.7464199999999996L5.291666666666666 6.079753333333334C5.291666666666666 6.424928333333334 5.011841666666666 6.704736666666666 4.666666666666666 6.704736666666666C4.321491666666667 6.704736666666666 4.041666666666666 6.424928333333334 4.041666666666666 6.079753333333334L4.041666666666666 4.038086666666667L2 4.038086666666667C1.654825 4.038086666666667 1.375 3.7582616666666664 1.375 3.4130866666666666z" fill="currentColor" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"></path><path d="M14.625 12.5864C14.625 12.931591666666666 14.345183333333333 13.2114 14 13.2114L11.666666666666666 13.2114C11.137408333333335 13.2114 10.708333333333332 12.782383333333332 10.708333333333332 12.253066666666665L10.708333333333332 9.919733333333333C10.708333333333332 9.574608333333334 10.98815 9.294733333333333 11.333333333333332 9.294733333333333C11.678516666666667 9.294733333333333 11.958333333333332 9.574608333333334 11.958333333333332 9.919733333333333L11.958333333333332 11.9614L14 11.9614C14.345183333333333 11.9614 14.625 12.241275000000002 14.625 12.5864z" fill="currentColor" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"></path></svg>
<span>换一换</span></button>
</div>`);
            $("#replaceItBut").click(() => {
                const temp = Home.getPushType();
                if (Home.videoIndex <= 50 && temp === "分区") {
                    Home.videoIndex += 10;
                }
                if (temp === "分区") {
                    loadingVideoE(Home.videoIndex);
                } else {
                    loadingVideoZE();
                }
            });
        }, 1000);

        const interval02 = setInterval(() => {
            const homeGrid = $(".container.is-version8");
            if (homeGrid === null || homeGrid === undefined || homeGrid.children().length === 0) {
                return;
            }
            clearInterval(interval02);
            homeGrid.html("");//先清空该标签的内容
            if (Home.getPushType() === "分区") {
                loadingVideoE(25);
            } else {
                loadingVideoZE();
            }
            // //首页
            Home.stypeBody();
            document.getElementsByClassName("left-entry")[0].style.visibility = "hidden"//删除首页左上角的导航栏，并继续占位
            setTimeout(() => {
                $(".feed-roll-btn").remove();//移除换一换
                console.log("移除换一换");
            }, 1500);
        }, 100);
        return;
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
        homePrefecture();
        return;
    }

    if (href.includes("space.bilibili.com/[0-9]+/dynamic") !== -1) {
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
            shrieDynamicItems(list);
            if (Util.isEventJq(tempE, "DOMNodeInserted")) {
                clearInterval(interval01);
                return;
            }
            tempE.bind("DOMNodeInserted", () => {
                shrieDynamicItems($(".bili-dyn-list__items").children());
            });
        }, 1000);
    }
}