/**
 *
 * 首次加载时只会加载一次
 * @param {string}href
 * @param {string}windowsTitle
 */
function bilibiliOne(href, windowsTitle) {
    const $body = $("body");
    const interval01 = setInterval(() => {
        const nav_search_input = $(".nav-search-input,.search-input-el");
        if (nav_search_input.length === 0) {
            return;
        }
        clearInterval(interval01);
        nav_search_input.click(() => {
            console.log("点击了");
            const interval01 = setInterval(() => {
                const list = document.querySelectorAll(".trendings-double .trending-item");
                if (list.length === 0) {
                    return;
                }
                clearInterval(interval01);
                list.forEach((value, key, parent) => {
                    const content = value.querySelector(".trending-text").textContent;
                    const titleKey = Remove.titleKey(value, content);
                    if (titleKey !== null) {
                        const info = `已通过标题关键词【${titleKey}】屏蔽热搜榜项目内容【${content}】`;
                        Qmsg.info(info);
                        Print.ln(info);
                        return;
                    }
                    const titleKeyCanonical = Remove.titleKeyCanonical(value, content);
                    if (titleKeyCanonical !== null) {
                        const info = `已通过标题正则关键词【${titleKeyCanonical}】屏蔽热搜榜项目内容【${content}】`;
                        Qmsg.info(info);
                        Print.ln(info);
                        return;
                    }
                    const contentKey = Remove.contentKey(value, content);
                    if (contentKey !== null) {
                        const info = `已通过标内容关键词【${contentKey}】屏蔽热搜榜项目内容【${content}】`;
                        Qmsg.info(info);
                        Print.ln(info);
                    }
                });
                // nav_search_input.unbind();//删除该元素的所有jq添加的事件
            }, 50);
        });
    }, 1000);
    if (LocalData.getPrivacyMode()) {
        const interval02 = setInterval(() => {
            const tempE01 = document.querySelector(".right-entry") || document.querySelector(".nav-user-center");
            if (tempE01 === null) {
                return;
            }
            tempE01.style.visibility = "hidden";//隐藏元素继续占位
        }, 1100);
    }

    function tempFunc(css) {
        let tempIndex = 0;
        const interval = setInterval(() => {
            const leftEntryItems = document.querySelectorAll(css);
            if (leftEntryItems.length === 0) {
                return;
            }
            leftEntryItems.forEach((value) => {
                const title = value.textContent;
                switch (title) {
                    case "首页":
                    case "直播":
                    case "番剧":
                    case "主站":
                        break;
                    default:
                        value.remove();
                }
            });
            if (++tempIndex >= 10) {
                clearInterval(interval);
            }
        }, 1000);
    }

    if (href.includes("www.bilibili.com/v/channel")) {
        tempFunc(".nav-link-ul");
    } else {
        tempFunc(".left-entry>*");
    }

    if (href === "https://www.bilibili.com/" || href.includes("www.bilibili.com/?spm_id_from") || href.includes("www.bilibili.com/index.html")) {//首页
        console.log("进入了首页");
        if (!LocalData.getIsMainVideoList()) {
            Home.startShieldMainVideo(".container.is-version8>.feed-card").then(() => {
                Home.startShieldMainVideo(".container.is-version8>.bili-video-card");//换一换下面的视频
            }); //换一换

            return;
        }

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
                Util.showSDPanel(e, uerName, Util.getSubWebUrlUid(userHref), title);

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
    if (href.includes("space.bilibili.com/")) {//b站用户空间主页
        const hrefUID = Util.getSubUid(href.split("/")[3]);
        if (Shield.arrKey(LocalData.getArrUID(), hrefUID)) {
            setTimeout(() => {
                alert("当前用户时是黑名单！UID=" + hrefUID)
            }, 4500);
            return;
        }
        const filterQueue = layout.panel.getFilter_queue();
        const getFollowersOrWatchlists = layout.panel.getFollowersOrWatchlists();
        const getFavListPageBut = layout.panel.getHoverball("获取选中收藏夹项目(当前页)", "36%", "4%");
        const getFavAllListBut = layout.panel.getHoverball("获取选中收藏夹项目(所有页)", "40%", "4%");
        $body.append(getFollowersOrWatchlists);
        $body.append(getFavListPageBut);
        $body.append(getFavAllListBut);
        getFollowersOrWatchlists.attr("id", "getFollowersOrWatchlists");
        getFavListPageBut.attr("id", "getFavListPageBut");
        getFavAllListBut.attr("id", "getFavAllListBut");
        getFavListPageBut.hide();
        getFavAllListBut.hide();
        const interval01 = setInterval(() => {
            if ($("#h-name").length === 0) {
                return;
            }
            clearInterval(interval01);
            if (!Space.isH_action()) {
                console.log("非个人空间主页")
                $body.append(filterQueue);
            }
        }, 1000);
        filterQueue.click(() => {
            butLayEvent.butaddName("userUIDArr", parseInt(hrefUID));
        });
        if (Space.isSpaceFollowOrFollow(href) === null) {
            getFollowersOrWatchlists.hide();
        }
        getFollowersOrWatchlists.click(() => {
            if (Space.isFetchingFollowersOrWatchlists) {
                Qmsg.error("请等待获取完！");
                return;
            }
            Space.isFetchingFollowersOrWatchlists = true;
            let loading, fileName;
            const type = Space.isSpaceFollowOrFollow(Util.getWindowUrl());
            const userName = Space.getUserName();
            switch (type) {
                case "follow"://关注数
                    loading = Qmsg.loading(`正在获取 ${userName} 的关注列表数据中，请不要轻易动当前页面内容`);
                    fileName = `${userName}用户的${Space.getMyFollowLabel()}列表`;
                    break;
                case "fans"://粉丝
                    if (!confirm("温馨提示，最多能获取1000(一千)个粉丝用户信息，是否继续？")) {
                        return;
                    }
                    loading = Qmsg.loading(`正在获取 ${userName} 的粉丝列表数据中，请不要轻易动当前页面内容`);
                    fileName = `${userName}的用户粉丝列表`;
                    break;
                default:
                    alert("出现意外的参数！" + type);
                    Space.isFetchingFollowersOrWatchlists = false;
                    return;
            }
            Space.extracted(loading).then(dataList => {
                const info = "最终结果个数：" + dataList.length;
                Qmsg.success(info);
                console.log(info);
                console.log(dataList);
                Util.fileDownload(JSON.stringify(dataList, null, 3), `${fileName}[${dataList.length}个].json`);
                Space.isFetchingFollowersOrWatchlists = false;
            });
        });

        getFavListPageBut.click(() => {
            const fav = Space.fav;
            const favName = fav.getFavName();
            const authorName = fav.getAuthorName();
            if (!confirm(`获取【${authorName}】用户【${favName}】收藏夹当前显示的内容，是要获取吗？`)) {
                return;
            }
            const dataList = fav.getDataList();
            Util.fileDownload(JSON.stringify(dataList, null, 3), `${authorName}的${favName}收藏夹(${dataList.length}个).json`);
        });
        getFavAllListBut.click(() => {
            const fav = Space.fav;
            const favName = fav.getFavName();
            const authorName = fav.getAuthorName();
            if (!confirm(`是要获取收藏夹创建者【${authorName}】用户【${favName}】的收藏夹所有的内容吗？`)) {
                return;
            }
            const loading = Qmsg.loading(`正在获取用户【${authorName}】的收藏夹【${favName}】....`);
            new Promise(resolve => {
                let dataList = [];
                const interval = setInterval(() => {
                    const tempDataList = fav.getDataList();
                    const next = $(".be-pager-next");
                    dataList = dataList.concat(tempDataList);
                    if (next.is(':hidden')) {
                        clearInterval(interval);
                        resolve(dataList);
                        return;
                    }
                    next.click();
                }, 2000);
            }).then(dataList => {
                loading.close();
                Qmsg.success("获取成功！");
                alert("获取成功！");
                Util.fileDownload(JSON.stringify(dataList, null, 3), `${authorName}的${favName}收藏夹(${dataList.length}个).json`);
            });
        });
        return;
    }

    if (href.includes("www.bilibili.com/v/topic/detail/?topic_id=")) {//话题
        subjectOfATalk.deltopIC();
        return;
    }
    if (href.includes("www.bilibili.com/video")) {//视频页
        const Shielding_UID = layout.panel.getHoverball("屏蔽(uid)", "15%", "96%");
        const getTheVideoBarrage = layout.panel.getHoverball("获取视频弹幕", "19%", "95%");
        const getTheVideoAVNumber = layout.panel.getHoverball("获取视频av号", "22%", "95%");
        const getVideoCommentArea = layout.panel.getHoverball("获取评论区页面可见数据", "25%", "92%");
        $body.append(Shielding_UID);
        $body.append(getTheVideoBarrage);
        $body.append(getTheVideoAVNumber);
        $body.append(getVideoCommentArea);
        Shielding_UID.click(() => {
            const userList = DefVideo.getCreativeTeam();
            if (userList.length === 0) {
                alert("获取失败！");
                return;
            }
            if (userList.length === 1) {
                const data = userList[0];
                const name = data["name"];
                const uid = data["uid"];
                if (!confirm(`是要屏蔽用户【${name}】吗？屏蔽方式为uid=${uid}`)) {
                    return;
                }
                butLayEvent.butaddName("userUIDArr", parseInt(uid));
                return;
            }
            alert("暂不支持屏蔽多作者方式.");
        });
        getTheVideoBarrage.click(() => {//打开当前视频弹幕列表
            const windowUrl = Util.getWindowUrl();
            if (!windowUrl.includes("www.bilibili.com/video")) {
                alert("当前不是播放页!");
                return;
            }
            const urlBVID = Util.getUrlBVID(windowUrl);
            if (urlBVID === null) {
                alert("获取不到BV号!");
                return;
            }
            if (!confirm(`当前视频BV号是 ${urlBVID} 吗`)) {
                return;
            }
            const loading = Qmsg.loading("正在获取数据中!");
            HttpUtil.getVideoInfo(urlBVID, (res) => {
                const body = JSON.parse(res.responseText);
                const code = body["code"];
                const message = body["message"];
                if (code !== 0) {
                    Qmsg.error("获取失败!" + message);
                    loading.close();
                    return;
                }
                let data;
                try {
                    data = body["data"][0];
                } catch (e) {
                    Qmsg.error("获取数据失败!" + e);
                    loading.close();
                    return;
                }
                if (data === null || data === undefined) {
                    Qmsg.error("获取到的数据为空的!");
                    loading.close();
                    return;
                }
                loading.close();
                const cid = data["cid"];
                Qmsg.success("cid=" + cid);
                Util.openWindow(`https://comment.bilibili.com/${cid}.xml`);
            }, (err) => {
                loading.close();
                Qmsg.error("错误状态!");
                Qmsg.error(err);
            });
        });
        getTheVideoAVNumber.click(() => {//获取视频av号
            const urlBVID = Util.getUrlBVID(Util.getWindowUrl());
            if (urlBVID === null) {
                alert("获取不到BV号!");
                return;
            }
            if (!confirm(`当前视频BV号是 ${urlBVID} 吗`)) {
                return;
            }
            alert(Util.BilibiliEncoder.dec(urlBVID));
        });
        getVideoCommentArea.click(() => {//获取视频的评论区列表可见的内容
            const list = document.querySelectorAll(".reply-list>.reply-item");
            if (list.length === 0) {
                Qmsg.error("未获取评论区内容，可能是当前并未有人评论！");
                return;
            }
            const arr = [];
            for (let v of list) {
                const rootName = v.querySelector(".user-name").textContent;
                const rootUid = v.querySelector(".user-name").getAttribute("data-user-id");
                const rootContent = v.querySelector(".root-reply .reply-content").textContent;
                const subList = v.querySelectorAll(".sub-reply-list>.sub-reply-item");
                const data = {
                    name: rootName,
                    uid: parseInt(rootUid),
                    content: rootContent,
                };
                if (subList.length === 0) {
                    arr.push(data);
                    continue;
                }
                const subArr = [];
                for (let j of subList) {
                    const subName = j.querySelector(".sub-user-name").textContent;
                    const subUid = j.querySelector(".sub-user-name").getAttribute("data-user-id");
                    const subContent = j.querySelector(".reply-content").textContent;
                    const subData = {
                        name: subName,
                        uid: parseInt(subUid),
                        content: subContent
                    };
                    subArr.push(subData);
                }
                data["sub"] = subArr;
                arr.push(data);
            }
            Util.fileDownload(JSON.stringify(arr, null, 3), "评论区列表-" + Util.toTimeString());
            Qmsg.success("已获取成功！");
        });
        return;
    }
    if ((href.includes("https://live.bilibili.com/?spm_id_from") || href === "https://live.bilibili.com/") && windowsTitle === "哔哩哔哩直播，二次元弹幕直播平台") {//直播首页
        console.log("进入直播首页了");
        const interval01 = setInterval(() => {
            const videoElement = document.getElementsByTagName("video")[0];
            if (videoElement) {
                videoElement.pause();//暂停视频
                //删除直播首页顶部无用直播间（包括占用大屏幕的，还其右侧的直播间列表）
                const bigPlayerClass = document.getElementsByClassName("player-area-ctnr border-box p-relative t-center")[0];
                if (bigPlayerClass) {
                    bigPlayerClass.remove();
                    clearInterval(interval01);
                }
            }
            const interval02 = setInterval(() => {
                const classNameElement = document.getElementsByClassName("link-footer-ctnr")[0];
                if (classNameElement) {
                    classNameElement.remove();
                    Print.ln("已移除页脚信息")
                    clearInterval(interval02);
                }
            }, 2000);
            if (Rule.liveData.rightSuspendButton) {
                const interval = setInterval(() => {
                    const classNameElement = document.getElementsByClassName("live-sidebar-ctnr a-move-in-left ts-dot-4")[0];
                    if (classNameElement) {
                        clearInterval(interval);
                        classNameElement.remove();
                        Print.ln("已移除直播首页右侧的悬浮按钮");
                    }
                }, 2000);
            }

        }, 800);
        return;
    }
    if (href.includes("//live.bilibili.com/") && windowsTitle.includes("哔哩哔哩直播，二次元弹幕直播平台")) {//直播间房间-该判断要低于上面的直播首页判断
        console.log("当前界面疑似是直播间");
        $("#getLiveHighEnergyListBut").css("display", "inline");//显示获取高能用户列表按钮
        $("#getLiveDisplayableBarrageListBut").css("display", "inline");//显示获取当前可显示的弹幕列表
        Live.liveDel.topElement();
        Live.liveDel.hreadElement();
        Live.liveDel.bottomElement();
        Live.liveDel.delGiftBar();
        Live.liveDel.delRightChatLayout();
        Live.liveDel.delOtherE();
        const interval01 = setInterval(() => {
            const chat_items = $("#chat-items");
            if (chat_items.length === 0) {
                return;
            }
            clearInterval(interval01);

            chat_items.bind("DOMNodeInserted", () => {
                const list = $("#chat-items").children();
                if (list.length === 0) {
                    return;
                }
                if (list.length >= 100) {
                    for (let i = 0; i < 50; i++) {
                        list[i].remove();
                    }
                    Qmsg.info("当前弹幕内容达到100个，已自动进行截取，保留50个");
                    return;
                }
                Live.shield(list);
            });
            console.log("定义了监听器!");
        }, 1000);
        return;
    }


    if (href.includes("t.bilibili.com") && windowsTitle === "动态首页-哔哩哔哩") {
        console.log("动态页面")
        const interval01 = setInterval(() => {
            const login = $(".bili-dyn-login-register");
            if (login.length === 0) {
                return;
            }
            clearInterval(interval01);
            login.remove();
            console.log("已移除动态页面中的提示登录");
        }, 1000);
        //.bili-dyn-ads
        Trends.topCssDisply.body();
        Trends.topCssDisply.topTar();
        Trends.topCssDisply.rightLayout();

        // trends.layoutCss.items();

        function followListLive() {
            const tempE = $("#liveLayout .bili-dyn-live-users__body:eq(0)");
            HttpUtil.getUsersFollowTheLiveList(sessdata, Trends.data.concernPage++, (res) => {
                const body = JSON.parse(res.responseText);
                const code = body["code"];
                const message = body["message"];
                if (code !== 0) {
                    const info = "获取当前用户正在直播的用户错误！" + message;
                    Qmsg.error(info);
                    console.log(info);
                    return;
                }
                /**
                 *
                 * @type {Array}
                 */
                const list = body["data"]["list"];
                if (list === undefined || list === null || list.length === 0) {
                    const info = "未获取到当前用户关注的直播用户列表信息";
                    Qmsg.info(info);
                    console.log(info);
                    return;
                }
                for (let v of list) {
                    /**
                     *直播状态
                     * 0：未开播
                     * 1：直播中
                     * 2：轮播中
                     */
                    const live_status = v["live_status"];
                    if (live_status === 0) {
                        Trends.data.concernBool = true;
                        break;
                    }
                    if (live_status !== 1) {
                        continue;
                    }
                    const roomid = v["roomid"];
                    const uid = v["uid"];
                    const uname = v["uname"];
                    const title = v["title"];
                    const face = v["face"];
                    const liveItem = HtmlStr.getLiveItem(uname, uid, roomid, face, title);
                    tempE.append(liveItem);
                }
                const tempIndex = tempE.children().length;
                if (tempIndex === 0) {
                    Qmsg.info("未获取到关注中正在直播的用户");
                    return;
                }
                if (!Trends.data.concernBool) {
                    followListLive();
                    return;
                }
                $("#liveLayout .bili-dyn-live-users__title>span:eq(0)").text(`${tempIndex}`);
                Qmsg.success(`已获取到${tempIndex}个直播间`);
            }, (err) => {
                Qmsg.error("出现错误");
                Qmsg.error(err);
            });
        }

        const liveLayout = $("#liveLayout");
        liveLayout.append(HtmlStr.getLiveList("关注列表在中正在直播的用户-"));
        liveLayout.append(`<hr>`);
        const okBut = $(`<button>确定</button>`);
        const openBut = $(`<button>打开页面</button>`);
        const findBut = $(`<button>查询</button>`);
        const select_parent_name = $(`<select></select>`);
        const select_name = $(`<select></select>`);
        const jsonArr = JSON.parse(`{"手游":[{"parent_name":"手游","parent_id":3,"name":"全部","id":0},{"parent_name":"手游","parent_id":3,"name":"原神","id":321},{"parent_name":"手游","parent_id":3,"name":"欢乐斗地主","id":719},{"parent_name":"手游","parent_id":3,"name":"DNF手游","id":343},{"parent_name":"手游","parent_id":3,"name":"新游评测","id":274},{"parent_name":"手游","parent_id":3,"name":"黎明觉醒：生机","id":479},{"parent_name":"手游","parent_id":3,"name":"宝可梦大集结","id":493},{"parent_name":"手游","parent_id":3,"name":"幻塔","id":550},{"parent_name":"手游","parent_id":3,"name":"三国志战棋版","id":756},{"parent_name":"手游","parent_id":3,"name":"明日之后","id":189},{"parent_name":"手游","parent_id":3,"name":"百闻牌","id":286},{"parent_name":"手游","parent_id":3,"name":"阴阳师","id":36},{"parent_name":"手游","parent_id":3,"name":"第五人格","id":163},{"parent_name":"手游","parent_id":3,"name":"战双帕弥什","id":293},{"parent_name":"手游","parent_id":3,"name":"FIFA足球世界","id":641},{"parent_name":"手游","parent_id":3,"name":"跃迁旅人","id":717},{"parent_name":"手游","parent_id":3,"name":"空之要塞：启航","id":718},{"parent_name":"手游","parent_id":3,"name":"火影忍者手游","id":292},{"parent_name":"手游","parent_id":3,"name":"Fate/GO","id":37},{"parent_name":"手游","parent_id":3,"name":"CF手游","id":333},{"parent_name":"手游","parent_id":3,"name":"游戏王","id":303},{"parent_name":"手游","parent_id":3,"name":"重返未来：1999 ","id":761},{"parent_name":"手游","parent_id":3,"name":"哈利波特：魔法觉醒 ","id":474},{"parent_name":"手游","parent_id":3,"name":"玛娜希斯回响","id":644},{"parent_name":"手游","parent_id":3,"name":" 东方归言录","id":538},{"parent_name":"手游","parent_id":3,"name":"无期迷途","id":675},{"parent_name":"手游","parent_id":3,"name":"光遇","id":687},{"parent_name":"手游","parent_id":3,"name":"少女前线：云图计划","id":525},{"parent_name":"手游","parent_id":3,"name":"黑色沙漠手游","id":615},{"parent_name":"手游","parent_id":3,"name":"雀姬","id":214},{"parent_name":"手游","parent_id":3,"name":"时空猎人3","id":643},{"parent_name":"手游","parent_id":3,"name":"明日方舟","id":255},{"parent_name":"手游","parent_id":3,"name":"猫咪公寓2","id":736},{"parent_name":"手游","parent_id":3,"name":"QQ飞车手游","id":154},{"parent_name":"手游","parent_id":3,"name":"古魂","id":759},{"parent_name":"手游","parent_id":3,"name":"航海王热血航线","id":504},{"parent_name":"手游","parent_id":3,"name":"和平精英","id":256},{"parent_name":"手游","parent_id":3,"name":"暗黑破坏神：不朽","id":492},{"parent_name":"手游","parent_id":3,"name":"蛋仔派对","id":571},{"parent_name":"手游","parent_id":3,"name":"JJ斗地主","id":724},{"parent_name":"手游","parent_id":3,"name":"香肠派对","id":689},{"parent_name":"手游","parent_id":3,"name":"跑跑卡丁车手游","id":265},{"parent_name":"手游","parent_id":3,"name":"梦幻模拟战","id":178},{"parent_name":"手游","parent_id":3,"name":"APEX手游","id":506},{"parent_name":"手游","parent_id":3,"name":"综合棋牌","id":354},{"parent_name":"手游","parent_id":3,"name":"以闪亮之名","id":755},{"parent_name":"手游","parent_id":3,"name":"恋爱养成游戏","id":576},{"parent_name":"手游","parent_id":3,"name":"漫威超级战争","id":478},{"parent_name":"手游","parent_id":3,"name":"暗区突围","id":502},{"parent_name":"手游","parent_id":3,"name":"狼人杀","id":41},{"parent_name":"手游","parent_id":3,"name":"盾之勇者成名录：浪潮","id":704},{"parent_name":"手游","parent_id":3,"name":"荒野乱斗","id":469},{"parent_name":"手游","parent_id":3,"name":"猫和老鼠手游","id":269},{"parent_name":"手游","parent_id":3,"name":"LOL手游","id":395},{"parent_name":"手游","parent_id":3,"name":"战火勋章","id":765},{"parent_name":"手游","parent_id":3,"name":"深空之眼","id":598},{"parent_name":"手游","parent_id":3,"name":"碧蓝航线","id":113},{"parent_name":"手游","parent_id":3,"name":"坎公骑冠剑","id":442},{"parent_name":"手游","parent_id":3,"name":"摩尔庄园手游","id":464},{"parent_name":"手游","parent_id":3,"name":"非人学园","id":212},{"parent_name":"手游","parent_id":3,"name":"崩坏3","id":40},{"parent_name":"手游","parent_id":3,"name":"天地劫：幽城再临","id":448},{"parent_name":"手游","parent_id":3,"name":"弹弹堂","id":734},{"parent_name":"手游","parent_id":3,"name":"300大作战","id":688},{"parent_name":"手游","parent_id":3,"name":"解密游戏","id":42},{"parent_name":"手游","parent_id":3,"name":"使命召唤手游","id":386},{"parent_name":"手游","parent_id":3,"name":"猫之城","id":645},{"parent_name":"手游","parent_id":3,"name":"长安幻想","id":738},{"parent_name":"手游","parent_id":3,"name":"少女前线","id":39},{"parent_name":"手游","parent_id":3,"name":"游戏王：决斗链接","id":407},{"parent_name":"手游","parent_id":3,"name":"梦幻西游手游","id":342},{"parent_name":"手游","parent_id":3,"name":"其他手游","id":98},{"parent_name":"手游","parent_id":3,"name":"决战！平安京","id":140},{"parent_name":"手游","parent_id":3,"name":"三国杀移动版","id":352},{"parent_name":"手游","parent_id":3,"name":"影之诗","id":156},{"parent_name":"手游","parent_id":3,"name":"公主连结Re:Dive","id":330},{"parent_name":"手游","parent_id":3,"name":"王者荣耀","id":35},{"parent_name":"手游","parent_id":3,"name":"忍者必须死3","id":203},{"parent_name":"手游","parent_id":3,"name":"BanG Dream","id":258},{"parent_name":"手游","parent_id":3,"name":"休闲小游戏","id":679},{"parent_name":"手游","parent_id":3,"name":"金铲铲之战","id":514},{"parent_name":"手游","parent_id":3,"name":"环形战争","id":725},{"parent_name":"手游","parent_id":3,"name":"天涯明月刀手游","id":389},{"parent_name":"手游","parent_id":3,"name":"漫威对决","id":511},{"parent_name":"手游","parent_id":3,"name":"奥比岛手游","id":661},{"parent_name":"手游","parent_id":3,"name":"奇点时代","id":762},{"parent_name":"手游","parent_id":3,"name":"部落冲突:皇室战争","id":50},{"parent_name":"手游","parent_id":3,"name":"重返帝国","id":613},{"parent_name":"手游","parent_id":3,"name":"小动物之星","id":473}],"赛事":[{"parent_name":"赛事","parent_id":13,"name":"全部","id":0},{"parent_name":"赛事","parent_id":13,"name":"体育赛事","id":562},{"parent_name":"赛事","parent_id":13,"name":"游戏赛事","id":561},{"parent_name":"赛事","parent_id":13,"name":"赛事综合","id":563}],"生活":[{"parent_name":"生活","parent_id":10,"name":"全部","id":0},{"parent_name":"生活","parent_id":10,"name":"手工绘画","id":627},{"parent_name":"生活","parent_id":10,"name":"时尚","id":378},{"parent_name":"生活","parent_id":10,"name":"影音馆","id":33},{"parent_name":"生活","parent_id":10,"name":"生活分享","id":646},{"parent_name":"生活","parent_id":10,"name":"萌宠","id":369},{"parent_name":"生活","parent_id":10,"name":"美食","id":367},{"parent_name":"生活","parent_id":10,"name":"搞笑","id":624},{"parent_name":"生活","parent_id":10,"name":"运动","id":628}],"娱乐":[{"parent_name":"娱乐","parent_id":1,"name":"全部","id":0},{"parent_name":"娱乐","parent_id":1,"name":"视频唱见","id":21},{"parent_name":"娱乐","parent_id":1,"name":"户外","id":123},{"parent_name":"娱乐","parent_id":1,"name":"萌宅领域","id":530},{"parent_name":"娱乐","parent_id":1,"name":"情感","id":706},{"parent_name":"娱乐","parent_id":1,"name":"视频聊天","id":145},{"parent_name":"娱乐","parent_id":1,"name":"日常","id":399},{"parent_name":"娱乐","parent_id":1,"name":"聊天室","id":740},{"parent_name":"娱乐","parent_id":1,"name":"舞见","id":207}],"电台":[{"parent_name":"电台","parent_id":5,"name":"全部","id":0},{"parent_name":"电台","parent_id":5,"name":"配音","id":193},{"parent_name":"电台","parent_id":5,"name":"唱见电台","id":190},{"parent_name":"电台","parent_id":5,"name":"聊天电台","id":192}],"网游":[{"parent_name":"网游","parent_id":2,"name":"全部","id":0},{"parent_name":"网游","parent_id":2,"name":"诛仙世界","id":654},{"parent_name":"网游","parent_id":2,"name":"街头篮球","id":649},{"parent_name":"网游","parent_id":2,"name":"洛克王国","id":669},{"parent_name":"网游","parent_id":2,"name":"剑灵","id":505},{"parent_name":"网游","parent_id":2,"name":"堡垒之夜","id":164},{"parent_name":"网游","parent_id":2,"name":"枪神纪","id":251},{"parent_name":"网游","parent_id":2,"name":"逃离塔科夫","id":252},{"parent_name":"网游","parent_id":2,"name":"吃鸡行动","id":80},{"parent_name":"网游","parent_id":2,"name":"坦克世界","id":115},{"parent_name":"网游","parent_id":2,"name":"VRChat","id":656},{"parent_name":"网游","parent_id":2,"name":"新游前瞻","id":298},{"parent_name":"网游","parent_id":2,"name":"星际战甲","id":249},{"parent_name":"网游","parent_id":2,"name":"战争雷霆","id":316},{"parent_name":"网游","parent_id":2,"name":"英雄联盟","id":86},{"parent_name":"网游","parent_id":2,"name":"超击突破","id":680},{"parent_name":"网游","parent_id":2,"name":"其他网游","id":107},{"parent_name":"网游","parent_id":2,"name":"创世战车","id":705},{"parent_name":"网游","parent_id":2,"name":"最终幻想14","id":102},{"parent_name":"网游","parent_id":2,"name":"跑跑卡丁车","id":664},{"parent_name":"网游","parent_id":2,"name":"梦三国","id":710},{"parent_name":"网游","parent_id":2,"name":"古剑奇谭OL","id":173},{"parent_name":"网游","parent_id":2,"name":"永恒轮回","id":459},{"parent_name":"网游","parent_id":2,"name":"激战2","id":607},{"parent_name":"网游","parent_id":2,"name":"奇迹MU","id":683},{"parent_name":"网游","parent_id":2,"name":"怀旧网游","id":288},{"parent_name":"网游","parent_id":2,"name":"APEX英雄","id":240},{"parent_name":"网游","parent_id":2,"name":"FIFA ONLINE 4","id":388},{"parent_name":"网游","parent_id":2,"name":"使命召唤:战区","id":318},{"parent_name":"网游","parent_id":2,"name":"反恐精英Online","id":629},{"parent_name":"网游","parent_id":2,"name":"阿尔比恩","id":639},{"parent_name":"网游","parent_id":2,"name":"星际争霸2","id":93},{"parent_name":"网游","parent_id":2,"name":"星际公民","id":658},{"parent_name":"网游","parent_id":2,"name":"CS:GO","id":89},{"parent_name":"网游","parent_id":2,"name":"天涯明月刀","id":596},{"parent_name":"网游","parent_id":2,"name":"炉石传说","id":91},{"parent_name":"网游","parent_id":2,"name":"生死狙击2","id":575},{"parent_name":"网游","parent_id":2,"name":"彩虹岛","id":686},{"parent_name":"网游","parent_id":2,"name":"武装突袭","id":634},{"parent_name":"网游","parent_id":2,"name":"魔兽争霸3","id":181},{"parent_name":"网游","parent_id":2,"name":"问道","id":670},{"parent_name":"网游","parent_id":2,"name":"剑网3","id":82},{"parent_name":"网游","parent_id":2,"name":"造梦西游","id":668},{"parent_name":"网游","parent_id":2,"name":"NBA2KOL2","id":581},{"parent_name":"网游","parent_id":2,"name":"星战前夜：晨曦","id":331},{"parent_name":"网游","parent_id":2,"name":"英魂之刃","id":690},{"parent_name":"网游","parent_id":2,"name":"永恒之塔","id":684},{"parent_name":"网游","parent_id":2,"name":"艾尔之光","id":651},{"parent_name":"网游","parent_id":2,"name":"大话西游","id":652},{"parent_name":"网游","parent_id":2,"name":"洛奇","id":663},{"parent_name":"网游","parent_id":2,"name":"风暴英雄","id":114},{"parent_name":"网游","parent_id":2,"name":"新天龙八部","id":653},{"parent_name":"网游","parent_id":2,"name":"骑士精神2","id":650},{"parent_name":"网游","parent_id":2,"name":"赛尔号","id":667},{"parent_name":"网游","parent_id":2,"name":"300英雄","id":84},{"parent_name":"网游","parent_id":2,"name":"封印者","id":300},{"parent_name":"网游","parent_id":2,"name":"新世界","id":544},{"parent_name":"网游","parent_id":2,"name":"战争与抉择","id":729},{"parent_name":"网游","parent_id":2,"name":"人间地狱","id":677},{"parent_name":"网游","parent_id":2,"name":"剑网3缘起","id":499},{"parent_name":"网游","parent_id":2,"name":"魔兽世界","id":83},{"parent_name":"网游","parent_id":2,"name":"泡泡堂","id":737},{"parent_name":"网游","parent_id":2,"name":"战舰世界","id":248},{"parent_name":"网游","parent_id":2,"name":"Squad战术小队","id":659},{"parent_name":"网游","parent_id":2,"name":"逆战","id":487},{"parent_name":"网游","parent_id":2,"name":"QQ飞车","id":610},{"parent_name":"网游","parent_id":2,"name":"穿越火线","id":88},{"parent_name":"网游","parent_id":2,"name":"洛奇英雄传","id":599},{"parent_name":"网游","parent_id":2,"name":"超激斗梦境","id":519},{"parent_name":"网游","parent_id":2,"name":"龙之谷","id":112},{"parent_name":"网游","parent_id":2,"name":"无畏契约","id":329},{"parent_name":"网游","parent_id":2,"name":"传奇","id":695},{"parent_name":"网游","parent_id":2,"name":"冒险岛","id":574},{"parent_name":"网游","parent_id":2,"name":"猎杀对决","id":600},{"parent_name":"网游","parent_id":2,"name":"流放之路","id":551},{"parent_name":"网游","parent_id":2,"name":"命运方舟","id":590},{"parent_name":"网游","parent_id":2,"name":"综合射击","id":601},{"parent_name":"网游","parent_id":2,"name":"黑色沙漠","id":632},{"parent_name":"网游","parent_id":2,"name":"刀塔自走棋","id":239},{"parent_name":"网游","parent_id":2,"name":"DNF","id":78},{"parent_name":"网游","parent_id":2,"name":"战意","id":383},{"parent_name":"网游","parent_id":2,"name":"守望先锋","id":87},{"parent_name":"网游","parent_id":2,"name":"DOTA2","id":92},{"parent_name":"网游","parent_id":2,"name":"FPS沙盒","id":633},{"parent_name":"网游","parent_id":2,"name":"风暴奇侠","id":648},{"parent_name":"网游","parent_id":2,"name":"幻想全明星","id":176},{"parent_name":"网游","parent_id":2,"name":"铁甲雄兵","id":691},{"parent_name":"网游","parent_id":2,"name":"三国杀","id":81},{"parent_name":"网游","parent_id":2,"name":"永劫无间","id":666},{"parent_name":"网游","parent_id":2,"name":"CFHD ","id":472},{"parent_name":"网游","parent_id":2,"name":"QQ三国","id":685},{"parent_name":"网游","parent_id":2,"name":"装甲战争","id":642}],"虚拟主播":[{"parent_name":"虚拟主播","parent_id":9,"name":"全部","id":0},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟Singer","id":744},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟Gamer","id":745},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟声优","id":746},{"parent_name":"虚拟主播","parent_id":9,"name":"TopStar","id":743},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟日常","id":371}],"单机游戏":[{"parent_name":"单机游戏","parent_id":6,"name":"全部","id":0},{"parent_name":"单机游戏","parent_id":6,"name":"原子之心","id":750},{"parent_name":"单机游戏","parent_id":6,"name":"以撒","id":219},{"parent_name":"单机游戏","parent_id":6,"name":"荒野大镖客2","id":226},{"parent_name":"单机游戏","parent_id":6,"name":"双人成行","id":446},{"parent_name":"单机游戏","parent_id":6,"name":"刺客信条","id":227},{"parent_name":"单机游戏","parent_id":6,"name":"霍格沃茨之遗","id":747},{"parent_name":"单机游戏","parent_id":6,"name":"狂野之心","id":748},{"parent_name":"单机游戏","parent_id":6,"name":"独立游戏","id":283},{"parent_name":"单机游戏","parent_id":6,"name":"怀旧游戏","id":237},{"parent_name":"单机游戏","parent_id":6,"name":"格斗游戏","id":433},{"parent_name":"单机游戏","parent_id":6,"name":"胡闹厨房","id":507},{"parent_name":"单机游戏","parent_id":6,"name":"怪物猎人","id":578},{"parent_name":"单机游戏","parent_id":6,"name":"重生细胞","id":426},{"parent_name":"单机游戏","parent_id":6,"name":"盗贼之海","id":341},{"parent_name":"单机游戏","parent_id":6,"name":"暖雪","id":582},{"parent_name":"单机游戏","parent_id":6,"name":"NBA2K","id":362},{"parent_name":"单机游戏","parent_id":6,"name":"消逝的光芒2","id":586},{"parent_name":"单机游戏","parent_id":6,"name":"恋爱模拟游戏","id":592},{"parent_name":"单机游戏","parent_id":6,"name":"饥荒","id":218},{"parent_name":"单机游戏","parent_id":6,"name":"策略游戏","id":570},{"parent_name":"单机游戏","parent_id":6,"name":"卧龙：苍天陨落","id":700},{"parent_name":"单机游戏","parent_id":6,"name":"全面坦克战略官","id":758},{"parent_name":"单机游戏","parent_id":6,"name":"弹幕互动玩法","id":460},{"parent_name":"单机游戏","parent_id":6,"name":"暗黑破坏神","id":535},{"parent_name":"单机游戏","parent_id":6,"name":"全境封锁2","id":243},{"parent_name":"单机游戏","parent_id":6,"name":"禁闭求生","id":707},{"parent_name":"单机游戏","parent_id":6,"name":"帝国时代4","id":548},{"parent_name":"单机游戏","parent_id":6,"name":"边境","id":763},{"parent_name":"单机游戏","parent_id":6,"name":"战神","id":579},{"parent_name":"单机游戏","parent_id":6,"name":"全面战争：战锤3","id":594},{"parent_name":"单机游戏","parent_id":6,"name":"无主之地3","id":273},{"parent_name":"单机游戏","parent_id":6,"name":"辐射76","id":220},{"parent_name":"单机游戏","parent_id":6,"name":"红色警戒2","id":693},{"parent_name":"单机游戏","parent_id":6,"name":"不羁联盟","id":764},{"parent_name":"单机游戏","parent_id":6,"name":"糖豆人","id":357},{"parent_name":"单机游戏","parent_id":6,"name":"霓虹序列","id":766},{"parent_name":"单机游戏","parent_id":6,"name":"战锤40K:暗潮","id":723},{"parent_name":"单机游戏","parent_id":6,"name":"Dread Hunger","id":591},{"parent_name":"单机游戏","parent_id":6,"name":"森林之子","id":751},{"parent_name":"单机游戏","parent_id":6,"name":"聚会游戏","id":636},{"parent_name":"单机游戏","parent_id":6,"name":"生化危机","id":721},{"parent_name":"单机游戏","parent_id":6,"name":"方舟","id":295},{"parent_name":"单机游戏","parent_id":6,"name":"艾尔登法环","id":555},{"parent_name":"单机游戏","parent_id":6,"name":"歧路旅人2","id":752},{"parent_name":"单机游戏","parent_id":6,"name":"Roblox","id":753},{"parent_name":"单机游戏","parent_id":6,"name":"只狼","id":245},{"parent_name":"单机游戏","parent_id":6,"name":"风帆纪元","id":739},{"parent_name":"单机游戏","parent_id":6,"name":"其他单机","id":235},{"parent_name":"单机游戏","parent_id":6,"name":"游戏速通","id":678},{"parent_name":"单机游戏","parent_id":6,"name":"恐怖游戏","id":276},{"parent_name":"单机游戏","parent_id":6,"name":"恐鬼症","id":387},{"parent_name":"单机游戏","parent_id":6,"name":"使命召唤19","id":282},{"parent_name":"单机游戏","parent_id":6,"name":"我的世界","id":216},{"parent_name":"单机游戏","parent_id":6,"name":"仁王2","id":313},{"parent_name":"单机游戏","parent_id":6,"name":"THE FINALS","id":754},{"parent_name":"单机游戏","parent_id":6,"name":"FORZA 极限竞速","id":302},{"parent_name":"单机游戏","parent_id":6,"name":"全面战争","id":257},{"parent_name":"单机游戏","parent_id":6,"name":"塞尔达传说","id":308},{"parent_name":"单机游戏","parent_id":6,"name":"鬼泣5","id":244},{"parent_name":"单机游戏","parent_id":6,"name":"法外枭雄:滚石城","id":757},{"parent_name":"单机游戏","parent_id":6,"name":"SIFU","id":587},{"parent_name":"单机游戏","parent_id":6,"name":"FIFA23","id":708},{"parent_name":"单机游戏","parent_id":6,"name":"命运2","id":277},{"parent_name":"单机游戏","parent_id":6,"name":"精灵宝可梦","id":228},{"parent_name":"单机游戏","parent_id":6,"name":"文字游戏","id":583},{"parent_name":"单机游戏","parent_id":6,"name":"主机游戏","id":236},{"parent_name":"单机游戏","parent_id":6,"name":"植物大战僵尸","id":309},{"parent_name":"单机游戏","parent_id":6,"name":"人类一败涂地","id":270},{"parent_name":"单机游戏","parent_id":6,"name":"战地风云","id":597},{"parent_name":"单机游戏","parent_id":6,"name":"骑马与砍杀","id":326},{"parent_name":"单机游戏","parent_id":6,"name":"泰拉瑞亚","id":593},{"parent_name":"单机游戏","parent_id":6,"name":"体育游戏","id":500},{"parent_name":"单机游戏","parent_id":6,"name":"宝可梦集换式卡牌游戏","id":720},{"parent_name":"单机游戏","parent_id":6,"name":"斯普拉遁3","id":694},{"parent_name":"单机游戏","parent_id":6,"name":"枪火重生","id":364}],"知识":[{"parent_name":"知识","parent_id":11,"name":"全部","id":0},{"parent_name":"知识","parent_id":11,"name":"科学科普","id":701},{"parent_name":"知识","parent_id":11,"name":"社科法律心理","id":376},{"parent_name":"知识","parent_id":11,"name":"职场·技能","id":377},{"parent_name":"知识","parent_id":11,"name":"科技","id":375},{"parent_name":"知识","parent_id":11,"name":"人文历史","id":702},{"parent_name":"知识","parent_id":11,"name":"校园学习","id":372}]}`);
        const parent_nameArr = Object.keys(jsonArr);
        for (let v of jsonArr["手游"]) {
            const id = v["id"];
            const name = v["name"];
            select_name.append(`<option value="${id}">${name}</option>`);
        }
        const map = new Map();
        for (let v of parent_nameArr) {
            const id = jsonArr[v][0]["parent_id"];
            const name = jsonArr[v][0]["parent_name"];
            map.set(id, name);
        }

        map.forEach((value, key, map) => {
            select_parent_name.append($(`<option value=${key}>${value}</option>`));
        });

        /**
         * @param {number|string}key 父级分区id
         */
        function flushedSelectFun(key) {
            const tempVar = map.get(parseInt(key));
            select_name.children().remove();
            for (let v of jsonArr[tempVar]) {
                const id = v["id"];
                const name = v["name"];
                select_name.append(`<option value="${id}">${name}</option>`);
            }
        }

        select_parent_name.change(() => {
            flushedSelectFun(select_parent_name.val());
        });
        okBut.click(() => {
            const select_parent_ID = select_parent_name.val();
            const select_name_ID = select_name.val();
            const select_nameText = select_name.find("option:selected").text();
            const loading = Qmsg.loading(`正在获取${select_nameText}分区直播列表信息`);
            const liveListChildren = liveList.children(".bili-dyn-live-users__body").children();
            if (liveListChildren.length !== 0) {
                liveListChildren.remove();
            }
            tempFunc(select_parent_ID, select_name_ID, loading);
        });
        findBut.click(() => {
            const content = prompt("请输入你要查询的子分区");
            if (content == null) {
                return;
            }
            if (content === "") {
                Qmsg.error("请正确输入你的内容");
                return;
            }
            for (let v of parent_nameArr) {
                for (let j of jsonArr[v]) {
                    const parent_name = j["parent_name"];
                    const parent_id = j["parent_id"];
                    const name = j["name"];
                    const id = j["id"];
                    if (!name.includes(content)) {
                        continue;
                    }
                    select_parent_name.val(parent_id);
                    flushedSelectFun(parent_id);
                    select_name.val(id);
                    Qmsg.success(`已找到${parent_name}的${name}`);
                    console.log(parent_name, parent_id, name, id)
                    return;
                }
            }
            Qmsg.error(`未找到${content}分区的信息`);
        });
        openBut.click(() => {
            const select_parent_ID = select_parent_name.val();
            const select_name_ID = select_name.val();
            Util.openWindow(`https://live.bilibili.com/p/eden/area-tags?areaId=${select_name_ID}&parentAreaId=${select_parent_ID}`);
        });

        liveLayout.append(select_parent_name);
        liveLayout.append(select_name);
        liveLayout.append(okBut);
        liveLayout.append(findBut);
        liveLayout.append(openBut);
        const liveList = HtmlStr.getLiveList("直播分区-");
        liveLayout.append(liveList);
        const flushBut = $(`<div style="display: flex;justify-content: center;">
<div style="display: none">
<button>加载更多</button>
</div>
</div>`);
        liveLayout.append(flushBut);
        liveLayout.append(`<hr>`);
        const sessdata = LocalData.getSESSDATA();
        if (sessdata !== null) {
            Qmsg.success("用户配置了sessdata");
            followListLive();
        }

        flushBut.click(() => {
            const select_parent_ID = select_parent_name.val();
            const select_name_ID = select_name.val();
            const select_nameText = select_name.find("option:selected").text();
            const loading = Qmsg.loading(`正在获取${select_nameText}分区直播列表信息`);
            tempFunc(select_parent_ID, select_name_ID, loading);
        });

        function tempFunc(parent_id, id, qmLoading) {
            const tempE = $("#liveLayout .bili-dyn-live-users__body:eq(1)");
            if (tempE.length === 0) {
                Qmsg.error("布局异常");
                qmLoading.close();
                return;
            }
            let partitionPage = Trends.data.getPartitionPage(id);
            HttpUtil.getLiveList(parent_id, id, partitionPage, "", (res) => {
                const body = JSON.parse(res.responseText);
                const code = body["code"];
                const message = body["message"];
                if (code !== 0) {
                    const info = "获取直播分区信息错误！" + message;
                    Qmsg.error(info);
                    console.log(info);
                    qmLoading.close();
                    return;
                }
                const list = body["data"]["list"];
                if (list.length === 0) {
                    Trends.data.setPartitionBool(id, true);
                    qmLoading.close();
                    Qmsg.success(`累计获取到${Trends.data.partitionEndTypeLiveName}分区的${tempE.children().length}个直播间`);
                    flushBut.find("div").hide();
                    return;
                }
                for (let v of list) {
                    const roomid = v["roomid"];
                    const title = v["title"];
                    const uname = v["uname"];
                    const uid = v["uid"];
                    if (Shield.arrKey(LocalData.getArrUID(), uid)) {
                        const tempInfo = `已通过UID，过滤用户【${uname}】 uid【${uid}】`;
                        Print.ln(tempInfo);
                        Qmsg.success(tempInfo);
                        continue;
                    }
                    const face = v["face"];
                    const cover = v["cover"];//封面
                    const system_cover = v["system_cover"];//关键帧
                    const parent_name = v["parent_name"];//父级分区
                    const area_name = v["area_name"];//子级分区
                    Trends.data.partitionEndTypeLiveName = `${parent_name}-${area_name}`;
                    const liveItem = HtmlStr.getLiveItem(uname, uid, roomid, face, title);
                    tempE.append(liveItem);
                }
                qmLoading.close();
                const tempIndex = tempE.children().length;
                if (tempIndex === 0) {
                    Qmsg.info("未获取到指定分区正在直播的用户");
                    flushBut.find("div").hide();
                    qmLoading.close();
                    return;
                }
                $("#liveLayout .bili-dyn-live-users__title>span:eq(1)").text(`${tempIndex}`);
                Qmsg.success(`本轮已获取到${Trends.data.partitionEndTypeLiveName}分区的${list.length}个直播间`);
                if (list.length < 20) {
                    flushBut.find("div").hide();
                } else {
                    flushBut.find("div").show();
                    Trends.data.setPartitionPage(id, ++partitionPage);
                }
            }, (err) => {
                Qmsg.error("错误信息" + err);
                qmLoading.close();
            });
        };

        function tempLoadIng() {
            const interval01 = setInterval(() => {
                const tempList = document.querySelectorAll(".bili-dyn-list__items>.bili-dyn-list__item");
                if (tempList.length === 0) {
                    return;
                }
                clearInterval(interval01);
                Trends.shrieDynamicItems(tempList);
                if (!Trends.data.getTrendsItemsTwoColumnCheackbox()) {
                    return;
                }
                Trends.layoutCss.items();
            }, 1000);
            const tempE01 = $(".bili-dyn-list__items");
            if (Util.isEventJq(tempE01, "DOMNodeInserted")) {
                return;
            }
            tempE01.bind("DOMNodeInserted", () => {
                Trends.shrieDynamicItems(tempE01.children());
            });
        }

        tempLoadIng();
        const interval02 = setInterval(() => {
            const tempE = $(".bili-dyn-up-list__content");
            if (tempE.length === 0) {
                return;
            }
            const list = tempE.children();
            if (list === null || list.length === 0) {
                return;
            }
            clearInterval(interval02);
            list.click(() => {
                tempLoadIng();
            });
        }, 1000);
    }
    if (href.includes("search.bilibili.com")) {
        const getDataListBut = layout.panel.getHoverball("get(当前页)", "15%", "94%");
        const getAllDataListBut = layout.panel.getHoverball("get(全部页)", "20%", "94%");

        $body.append(getDataListBut);
        $body.append(getAllDataListBut);

        getDataListBut.attr("id", "getDataListBut");
        getAllDataListBut.attr("id", "getAllDataListBut");

        // getDataListBut.hide();
        // getAllDataListBut.hide();

        getDataListBut.click(() => {
            let dataList, fileName;
            const tabsItem = Search.getTabsItem();
            const keyword = Search.getKeyword();
            switch (tabsItem) {
                case "综合":
                case "视频":
                    dataList = Search.video.getVideoDataList();
                    fileName = `(搜索关键词【${keyword}】的${Search.video.getTabTheSelectedSort()}视频列表${dataList.length})个.json`;
                    break;
                case "番剧":
                    break;
                case "专栏":
                    dataList = Search.article.getDataList();
                    fileName = `(搜索关键词【${keyword}】的${Search.article.getTabTheSelectedSort()}专栏列表${dataList.length})个.json`;
                    break;
                case "用户":
                    dataList = Search.upuser.getUserInfoList();
                    fileName = `搜索关键词【${keyword}】的${Search.upuser.getTabTheSelectedSort()}的用户列表(${dataList.length}个).json`;
                    break;
                default:
                    alert(`搜索${keyword}时出现了意外的分支结果！`);
                    return;
            }
            if (dataList.length === 0) {
                alert(`未获取到关键词【${keyword}】相关${tabsItem}列表数据！`);
                return;
            }
            Qmsg.success(`获取当前页的${tabsItem}列表成功！`);
            Util.fileDownload(JSON.stringify(dataList, null, 3), fileName);
        });

        getAllDataListBut.click(async () => {
            if (Search.isGetLoadIngData) {
                Qmsg.error("请等待，获取完成！");
                return;
            }
            Search.isGetLoadIngData = true;
            const tabsItem = Search.getTabsItem();
            const keyword = Search.getKeyword();
            const loading = Qmsg.loading(`正在获取关键词【${keyword}】的相关${tabsItem}数据，请耐心等待！`);
            let dataList, fileName;
            switch (tabsItem) {
                case "综合":
                case "视频":
                    dataList = await Search.video.getAllVideoDataList();
                    fileName = `(搜索关键词【${keyword}】的${Search.video.getTabTheSelectedSort()}视频列表${dataList.length})个.json`;
                    break;
                case "番剧":
                    dataList = await Search.bangumi.getAllDataList();
                    fileName = `(搜索关键词【${keyword}】的番剧列表${dataList.length})个.json`;
                    break;
                case "专栏":
                    dataList = await Search.article.getAllDataList();
                    fileName = `(搜索关键词【${keyword}】的${Search.article.getTabTheSelectedSort()}专栏列表${dataList.length})个.json`;
                    break;
                case "用户":
                    dataList = await Search.upuser.getUserInfoAllList();
                    fileName = `搜索关键词【${keyword}】的${Search.upuser.getTabTheSelectedSort()}用户列表(${dataList.length}个).json`;
                    break;
                default:
                    alert(`搜索${keyword}时出现了意外的分支结果！`);
                    return;
            }
            loading.close();
            Search.isGetLoadIngData = false;
            if (dataList.length === 0) {
                alert(`未获取到相关${tabsItem}列表数据！`);
                return;
            }
            Qmsg.success(`获取${tabsItem}的关键词${keyword}的数据成功!个数为：${dataList.length}个`);
            Util.fileDownload(JSON.stringify(dataList, null, 3), fileName);
        });

        $("#biliMainFooter").remove();
        console.log("已清空底部信息");
        $(".side-buttons.flex_col_end.p_absolute").remove();
        console.log("已移除bilibili右侧悬浮按钮");
        return;
    }
    if (href.includes("www.bilibili.com/v/channel")) {
        const interval01 = setInterval(() => {
            const nav_link_ulMini = $(".nav-link-ul.mini");
            if (nav_link_ulMini.length === 0) {
                return;
            }
            clearInterval(interval01);
            const item = $(".nav-link-item:contains('下载'),.nav-link-item:contains('赛事'),.nav-link-item:contains('漫画'),.nav-link-item:contains('会员购')");
            console.log(item);
            item.remove();
            $(".navbar_logo").remove();//移除左上角的bilibili的LOGO
            console.log("已移除坐上顶栏部分项目");
        }, 1000);
        return;
    }
    if (href.includes("www.bilibili.com/v")) {//首页分区页,该判断要低于频道等其他页面，主要是因为地址有相似的地方
        let size = -1;
        setInterval(() => {
            const tempSize = document.querySelectorAll(".bili-video-card");
            if (tempSize.length === size) {
                return;
            }
            size = tempSize.length;
            Home.startShieldMainVideo(".bili-video-card");
        }, 1000);
        return;
    }
    if ((href.includes("www.bilibili.com") && windowsTitle === "哔哩哔哩 (゜-゜)つロ 干杯~-bilibili") || (href.includes("t.bilibili.com") & windowsTitle === "动态首页-哔哩哔哩")) {
        const interval01 = setInterval(() => {
            const login = $(".lt-col>.login-tip:contains('立即登录')");
            if (login.length === 0) {
                return;
            }
            clearInterval(interval01);
            login.remove();
            console.log("已移除页面右下角的提示登录");
        }, 1000);
        const interval02 = setInterval(() => {
            const login = $(".login-panel-popover");
            if (login.length === 0) {
                return;
            }
            clearInterval(interval02);
            login.remove();
            console.log("已移除页面的提示登录信息");
        }, 1000);
        return;
    }
    if (href.includes("www.bilibili.com/account/history") && windowsTitle === "历史记录") {
        const getPageShowHistoryBut = layout.panel.getHoverball("获取页面可见的历史记录", "18%", "5%");
        const getAllPageHistoryBut = layout.panel.getHoverball("获取页面全部的历史记录", "28%", "5%");
        $body.append(getPageShowHistoryBut);
        $body.append(getAllPageHistoryBut);
        History.delLayout.footer();
        getPageShowHistoryBut.click(() => {
            if (History.isGetLoadIngData) {
                alert("请等待获取完成！");
                return;
            }
            alert("如果您要获取所有全部可见的历史记录内容，可以一直滚动到底部，直到显示全部可见的历史记录内容，再获取");
            History.isGetLoadIngData = true;
            const dataHistory = History.getDataHistory();
            History.isGetLoadIngData = false;
            if (dataHistory.length === 0) {
                alert("未获取到相关历史记录！");
                return;
            }
            alert("已获取完成！接下来可以将获取到的数据保存到电脑上任意一个位置");
            Util.fileDownload(JSON.stringify(dataHistory, null, 3), `b站用户的历史记录${Util.toTimeString()}(${dataHistory.length}个).json`);
        });
        getAllPageHistoryBut.click(() => {
            if (History.isGetLoadIngData) {
                alert("请等待获取完成！");
                return;
            }
            if (!confirm("温馨提示，此功能会持续模拟滚动到页面的底部使其加载更多的历史记录内容，直到到b站历史记录保留的最早的记录内容，可能会比较耗时，请耐心等待！是否继续？")) {
                return;
            }
            History.isGetLoadIngData = true;
            const loading = Qmsg.loading("温馨提示，此功能会持续模拟滚动到页面的底部使其加载更多的历史记录内容，直到到b站历史记录保留的最早的记录内容，可能会比较耗时，请耐心等待！");
            History.getAllDataHistory().then(() => {
                loading.close();
                const dataHistory = History.getDataHistory();
                History.isGetLoadIngData = false;
                if (dataHistory.length === 0) {
                    alert("未获取到相关历史记录！");
                    return;
                }
                alert("已获取完成！接下来可以将获取到的数据保存到电脑上任意一个位置");
                Util.fileDownload(JSON.stringify(dataHistory, null, 3), `b站用户全部的历史记录${Util.toTimeString()}(${dataHistory.length}个).json`);
            });
        });
        return;
    }
    if (href.includes("www.bilibili.com/watchlater")) {
        Watchlater.initLayout();
        $(".international-footer").remove();
        console.log("已移除页面页脚信息");
    }
}