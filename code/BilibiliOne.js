/**
 *
 * 首次加载时只会加载一次
 * @param {string}href
 * @param {string}windowsTitle
 */
async function bilibiliOne(href, windowsTitle) {
    const $body = $("body");
    if (LocalData.getBWebNone()) {
        Qmsg.success("已执行不可见模式！");
        $body.append(`<div style="position: fixed;top: 0;left: 0;width: 100%;height: 100%;background-color: black;z-index: 2022"></div>`);
        return;
    }
    const interval01 = setInterval(() => {
        const nav_search_input = $(".nav-search-input,.search-input-el");
        if (nav_search_input.length === 0) return;
        clearInterval(interval01);
        const arrContent = Matching.arrContent(LocalData.getArrTitle(), nav_search_input.attr("placeholder"));
        if (arrContent !== null) {
            const title = nav_search_input.attr("title");
            nav_search_input.attr("placeholder", "");
            nav_search_input.attr("title", "");
            Qmsg.info(`已通过标题关键词 ${arrContent} 过滤顶部搜索框显示的内容=${title}`);
        }
        nav_search_input.click(() => {
            console.log("点击了顶部搜索框");
            const interval01 = setInterval(() => {
                const list = document.querySelectorAll(".trendings-double .trending-item");
                if (list.length === 0) return;
                clearInterval(interval01);
                list.forEach((value, key, parent) => {
                    const content = value.querySelector(".trending-text").textContent;
                    const titleKey = Remove.titleKey(value, content);
                    if (titleKey !== null) {
                        Qmsg.info("规则屏蔽了相关热搜");
                        Print.ln(`已通过标题关键词【${titleKey}】屏蔽热搜榜项目内容【${content}】`);
                        return;
                    }
                    const titleKeyCanonical = Remove.titleKeyCanonical(value, content);
                    if (titleKeyCanonical !== null) {
                        Qmsg.info("规则屏蔽了相关热搜");
                        Print.ln(`已通过标题正则关键词【${titleKeyCanonical}】屏蔽热搜榜项目内容【${content}】`);
                        return;
                    }
                    const contentKey = Remove.contentKey(value, content);
                    if (contentKey !== null) {
                        Qmsg.info("规则屏蔽了相关热搜");
                        Print.ln(`已通过标内容关键词【${contentKey}】屏蔽热搜榜项目内容【${content}】`);
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

    if (href === "https://www.bilibili.com/" || href.includes("www.bilibili.com/?spm_id_from") || href.includes("www.bilibili.com/index.html")) {//首页
        console.log("进入了首页");
        const interval03 = setInterval(() => {
            const jqE = $(".channel-icons");
            if (jqE.length === 0) {
                return;
            }
            clearInterval(interval03);
            const jqELast = jqE.children().eq(-1);
            const jqEa = jqELast.clone();
            jqEa.attr("href", "https://www.bilibili.com/v/channel");
            jqEa.find(".icon-title").text("频道");
            jqEa.find(".icon-bg.icon-bg__popular").html(`<img src="https://img1.imgtp.com/2023/09/18/tR1X1XpA.png" alt="频道">`);
            jqE.append(jqEa);
        }, 1000);
        const interval04 = setInterval(() => {
            const jqE = $(".header-channel");
            if (jqE.length === 0) {
                return;
            }
            clearInterval(interval04);
            jqE.remove();
            Qmsg.info("已移除页面下滑时，显示顶部的部分导航信息");
        }, 1000);
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
            if (Matching.arrKey(LocalData.getArrUID(), uid)) {
                Print.video("yellow", "已通过UID屏蔽", userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`)
                return true;
            }
            const isNameKey = Matching.arrContent(LocalData.getArrNameKey(), userName);
            if (isNameKey != null) {
                Print.video(null, `已通过用户名模糊屏蔽规则【${isNameKey}】`, userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`)
                return true;
            }
            const isTitleKey = Matching.arrContent(LocalData.getArrTitle(), videoTitle);
            if (isTitleKey != null) {
                Print.video("#66CCCC", `已通过标题模糊屏蔽规则=【${isTitleKey}】`, userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`);
                return true;
            }
            const isTitleKeyCanonical = Matching.arrContentCanonical(LocalData.getArrTitleKeyCanonical(), videoTitle);
            if (isTitleKeyCanonical != null) {
                Print.video("#66CCCC", `已通过标题正则表达式屏蔽规则=${isTitleKeyCanonical}`, userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`);
                return true;
            }
            const jqE = addElement.homeVideoE.getHtmlStr(videoTitle, "https://www.bilibili.com/video/" + bvid, pic, uid, userName, duration, ctimeStr, Util.getNumberFormat(view), Util.getNumberFormat(danmaku));
            $(".container.is-version8").append(jqE);

            if (Util.isEventJq(jqE, "mouseover")) {
                return false;
            }
            jqE.mouseenter((e) => {
                const element = e.delegateTarget;
                const tempInfo = element.querySelector(".bili-video-card__info--tit");
                const title = tempInfo.textContent;
                const videoAddress = tempInfo.querySelector("a").href;
                const userInfo = element.querySelector(".bili-video-card__info--owner");
                const userHref = userInfo.href;
                const data = {
                    upName: element.querySelector(".bili-video-card__info--author").textContent,
                    uid: Util.getSubWebUrlUid(userHref),
                    title: title,
                    videoAddress: videoAddress,
                    bv: Util.getSubWebUrlBV(videoAddress)
                };
                Util.showSDPanel(e, data);
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
        const userName = await Space.getUserName();
        if (Matching.arrKey(LocalData.getArrUID(), hrefUID)) {
            setTimeout(() => {
                alert("当前用户时是黑名单！UID=" + hrefUID)
            }, 2500);
            return;
        }
        const filterQueue = layout.panel.getFilter_queue();
        const getDataListBut = layout.panel.getHoverball("get(当前页)", "5%", "85%");
        const getAllDataListBut = layout.panel.getHoverball("get(全部页)", "9%", "85%");
        $body.append(getDataListBut);
        $body.append(getAllDataListBut);
        getDataListBut.attr("id", "getDataListBut");
        getAllDataListBut.attr("id", "getAllDataListBut");

        if (Space.isH_action()) {
            console.log("当前登录账号的个人空间主页");
        } else {
            console.log("非个人空间主页")
            $body.append(filterQueue);
        }

        filterQueue.click(() => {
            UrleCrud.addShow("userUIDArr", "用户uid黑名单模式(精确匹配)", hrefUID);
        });

        getDataListBut.click(async () => {
            const tabName = Space.getTabName();
            let dataList, fileName;
            switch (tabName) {
                case "投稿":
                    const tabTypeName = Space.video.getLeftTabTypeName();
                    switch (tabTypeName) {
                        case "视频":
                            dataList = Space.video.getDataList();
                            break;
                        case "专栏":
                            dataList = Space.article.getdataList();
                            break;
                        case "相簿":
                            dataList = Space.album.getdataList();
                            break;
                        default:
                            alert(`暂不支持获取${tabTypeName}的数据！`);
                            return;
                    }
                    fileName = `获取用户${userName}${Space.video.getSortText()}的${Space.video.getVideoType()}${tabName}${tabTypeName}列表`;
                    break;
                case "收藏":
                    const fav = Space.fav;
                    const favName = fav.getFavName();
                    const authorName = fav.getAuthorName();
                    const favID = fav.getFavID();
                    const favtype = fav.getFavtype();
                    if (!confirm(`获取【${authorName}】用户【${favName}】收藏夹当前显示的内容，是要获取吗？`)) {
                        return;
                    }
                    const input = prompt(`请选择获取的模式\n输入单个数字0为：页面自动化操作模式进行获取\n1为：网络请求模式获取，比页面自动化操作模式多3个结果参数（头像、uid、弹幕量）`);
                    if (input === null) return;
                    fileName = `${authorName}的${favName}收藏夹列表`;
                    if (input === "0") {
                        dataList = fav.getDataList();
                        break;
                    }
                    if (input === "1") {
                        const loading = Qmsg.loading("正在获取中！");
                        if (favtype === "collect") {//用户收藏其他用户收藏夹
                            alert("暂不支持通过网络请求方式只获取当前页收藏夹列表，如需网络请求方式，请使用【获取收藏的列表数据】功能！或者使用【页面自动化操作模式】");
                            loading.close();
                            return;
                        }
                        const data = await fav.getHttpUserCreationDataList(favID)
                        loading.close();
                        if (!data["state"]) {
                            Qmsg.error("获取失败!");
                            return;
                        }
                        dataList = data["dataList"];
                    } else {
                        Qmsg.error("输入了意外的值！" + input);
                        return;
                    }
                    break;
                case "订阅":
                    const tempTabsName = Space.subscribe.getTabsName();
                    if (tempTabsName === "标签") {
                        dataList = Space.subscribe.subs.getdataList();
                        fileName = `${userName}的订阅标签`;
                        break;
                    }
                    dataList = Space.subscribe.bangumiAndCinema.getdataList();
                    fileName = `${userName}订阅的${tempTabsName}列表`;
                    break;
                case "关注数":
                case "粉丝数":
                    dataList = Space.followAndFans.getdataList();
                    fileName = `${userName}的用户${tabName}列表.json`;
                    break;
                default:
                    alert("出现意外的参数！" + tabName);
                    return;
            }
            const info = "获取到个数：" + dataList.length;
            Qmsg.success(info);
            console.log(info);
            console.log(dataList);
            alert(info);
            Util.fileDownload(JSON.stringify(dataList, null, 3), `${fileName}[${dataList.length}个].json`);
        });

        getAllDataListBut.click(async () => {
            const tabName = Space.getTabName();
            if (Space.isFetchingFollowersOrWatchlists) {
                Qmsg.error("请等待获取完！");
                return;
            }
            Space.isFetchingFollowersOrWatchlists = true;
            const loading = Qmsg.loading(`正在获取 ${userName} 的${tabName}列表数据中，请不要轻易动当前页面内容`);
            let fileName, dataList;
            switch (tabName) {
                case "投稿":
                    const tabTypeName = Space.video.getLeftTabTypeName();
                    switch (tabTypeName) {
                        case "视频":
                            dataList = await Space.video.getAllDataList();
                            break;
                        case "专栏":
                            dataList = await Space.article.getAllDataList();
                            break;
                        case "相簿":
                            dataList = await Space.album.getAllDataList();
                            break;
                        default:
                            loading.close();
                            alert(`暂不支持获取${tabTypeName}的数据！`);
                            break;
                    }
                    fileName = `获取用户${userName}${Space.video.getSortText()}的${Space.video.getVideoType()}${tabName}${tabTypeName}列表`;
                    break;
                case"收藏":
                    const fav = Space.fav;
                    const favName = fav.getFavName();
                    const authorName = fav.getAuthorName();
                    const favID = fav.getFavID();
                    if (!confirm(`是要获取收藏夹创建者【${authorName}】用户【${favName}】的收藏夹所有的内容吗？`)) {
                        Space.isFetchingFollowersOrWatchlists = false;
                        loading.close();
                        return;
                    }
                    const input = prompt(`请选择获取的模式\n输入单个数字0为：页面自动化操作模式进行获取\n1为：网络请求模式获取，比页面自动化操作模式多3个结果参数（头像、uid、弹幕量）`);
                    if (input === null) {
                        loading.close();
                        return;
                    }
                    fileName = `${authorName}的${favName}收藏夹列表`;
                    if (input === "0") {
                        dataList = await fav.getAllDataList();
                        break;
                    }
                    if (input === "1") {
                        const favtype = fav.getFavtype();
                        let data;
                        if (favtype === "collect") {//用户收藏其他用户收藏夹
                            data = await fav.getHttpCollectOthersDataAllList(favID);
                        } else {
                            data = await fav.getHttpUserCreationAllDataList(favID);
                        }
                        if (!data["state"]) {
                            Qmsg.error("获取失败!");
                            loading.close();
                            return;
                        }
                        dataList = data["dataList"];
                    } else {
                        Qmsg.error("出现意外的值！" + input);
                        loading.close();
                        return;
                    }
                    break;
                case "订阅":
                    const tempTabsName = Space.subscribe.getTabsName();
                    if (tempTabsName === "标签") {
                        Space.isFetchingFollowersOrWatchlists = false;
                        loading.close();
                        Qmsg.error("意外的结果!");
                        return;
                    }
                    dataList = await Space.subscribe.bangumiAndCinema.getAllDataList();
                    fileName = `${userName}订阅的${tempTabsName}列表`;
                    break;
                case "关注数":
                case "粉丝数":
                    if (tabName === "粉丝数") {
                        if (!confirm("温馨提示，最多能获取1000(一千)个粉丝用户信息，是否继续？")) {
                            Space.isFetchingFollowersOrWatchlists = false;
                            loading.close();
                            return;
                        }
                    }
                    fileName = `${userName}的用户${tabName}列表`;
                    dataList = await Space.followAndFans.getAllDataList();
                    break;
                default:
                    loading.close();
                    alert("出现意外的参数！" + tabName);
                    Space.isFetchingFollowersOrWatchlists = false;
                    return;
            }
            loading.close();
            const info = "最终结果个数：" + dataList.length;
            Qmsg.success(info);
            console.log(info);
            console.log(dataList);
            Util.fileDownload(JSON.stringify(dataList, null, 3), `${fileName}[${dataList.length}个].json`);
            Space.isFetchingFollowersOrWatchlists = false;
        });

        return;
    }

    if (href.includes("www.bilibili.com/v/topic/detail/?topic_id=")) {//话题
        SubjectOfATalk.deltopIC();
        return;
    }
    if (href.includes("www.bilibili.com/video") || href.includes("www.bilibili.com/list/watchlater")) {//视频页
        $body.append(layout.htmlVue.videoPlayVue());
        const videoPlayVue = VideoPlayVue.returnVue();


        if (LocalData.video.isHideVideoRightLayout()) {
            const interval = setInterval(() => {
                const jqE = $(".right-container.is-in-large-ab,.playlist-container--right");
                if (jqE.length === 0) return;
                if (!LocalData.video.isHideVideoRightLayout() || videoPlayVue().hideRightLayoutButText === "隐藏右侧布局") {
                    clearInterval(interval)
                    return;
                }
                jqE.hide();
            }, 1600);
        }
        if (LocalData.video.isHideVideoButtonCommentSections()) {
            const interval = setInterval(() => {
                const jqE = $("#comment,.playlist-comment");
                if (jqE.length === 0) return;
                if (!LocalData.video.isHideVideoButtonCommentSections() || videoPlayVue().hideButtonLayoutButText === "隐藏评论区") {
                    clearInterval(interval)
                    return;
                }
                jqE.hide();
            }, 1600);
        }

        if (LocalData.video.isHideVideoTopTitleInfoLayout()) {
            const interval = setInterval(() => {
                const jqE = $("#viewbox_report,.video-info-container");
                if (jqE.length === 0) return;
                clearInterval(interval);
                jqE.hide();
            }, 1500);
        }
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
        console.log("动态页面");
        const interval01 = setInterval(() => {
            const login = $(".bili-dyn-login-register");
            if (login.length === 0) {
                return;
            }
            clearInterval(interval01);
            login.remove();
            console.log("已移除动态页面中的提示登录");
        }, 1000);
        const interval02 = setInterval(() => {
            const jqE = $(".bili-rich-textarea");
            if (jqE.length === 0) {
                return;
            }
            clearInterval(interval02);
            jqE.css("max-height", "");
            Qmsg.success("已解锁发动态编辑框的最大可视内容！");
        }, 1000);
        //.bili-dyn-ads
        Trends.topCssDisply.body();
        Trends.topCssDisply.topTar();
        Trends.topCssDisply.rightLayout();

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
        const interval03 = setInterval(() => {
            const tempE = $(".bili-dyn-up-list__content");
            if (tempE.length === 0) {
                return;
            }
            const list = tempE.children();
            if (list === null || list.length === 0) {
                return;
            }
            clearInterval(interval03);
            Trends.layoutCss.tabUserItems(tempE);
            $(".bili-dyn-up-list__shadow-right").remove();
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
                case "影视":
                    dataList = Search.bangumi.getDataList();
                    fileName = `(搜索关键词【${keyword}】的${tabsItem}列表${dataList.length})个.json`;
                    break;
                case "专栏":
                    dataList = Search.article.getDataList();
                    fileName = `(搜索关键词【${keyword}】的${Search.article.getTabTheSelectedSort()}专栏列表${dataList.length})个.json`;
                    break;
                case "用户":
                    dataList = Search.upuser.getUserInfoList();
                    fileName = `搜索关键词【${keyword}】的${Search.upuser.getTabTheSelectedSort()}的用户列表(${dataList.length}个).json`;
                    break;
                case "直播":
                    const liveTabs = Search.live.getTabsItem();
                    switch (liveTabs) {
                        case "直播间":
                            dataList = Search.live.getLiveDataList();
                            fileName = `(搜索关键词【${keyword}】的${Search.live.getLiveRoomSort()}${liveTabs}列表${dataList.length})个.json`;
                            break;
                        case "主播":
                            dataList = Search.live.liveUsers.getDataList();
                            fileName = `(搜索关键词【${keyword}】的${liveTabs}列表${dataList.length})个.json`;
                            break;
                        default:
                            alert("直播获取时出现意外的选项！");
                            return;
                    }
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
                case "直播":
                    const liveTabs = Search.live.getTabsItem();
                    switch (liveTabs) {
                        case "直播间":
                            dataList = await Search.live.getLiveAllDataList();
                            fileName = `(搜索关键词【${keyword}】的${Search.live.getLiveRoomSort()}${liveTabs}列表${dataList.length})个.json`;
                            break;
                        case "主播":
                            dataList = await Search.live.liveUsers.getAllDataList();
                            fileName = `(搜索关键词【${keyword}】的${liveTabs}列表${dataList.length})个.json`;
                            break;
                        default:
                            alert("直播获取时出现意外的选项！");
                            return;
                    }
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