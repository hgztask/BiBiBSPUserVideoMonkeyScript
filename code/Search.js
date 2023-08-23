const Search = {
    //是否正在执行获取操作
    isGetLoadIngData: false,
    getKeyword() {//返回搜索页面中搜索关键词
        const match = Util.getWindowUrl().match(/keyword=([^&]+)/);
        if (match) {
            return decodeURIComponent(match[1]);
        } else {
            return null;
        }
    },
    getTabsItem() {//获取搜索页面当前选中的总选项卡
        return document.querySelector(".vui_tabs--nav.vui_tabs--nav-pl0>.vui_tabs--nav-item-active .vui_tabs--nav-text").textContent;
    },
    video: {
        getDataV(v) {
            let info = v.querySelector(".bili-video-card__info--right");
            let userInfo = info.querySelector(".bili-video-card__info--owner");
            //用户空间地址
            let upSpatialAddress = userInfo.getAttribute("href");
            const topInfo = v.querySelector(".bili-video-card__stats--left").querySelectorAll(".bili-video-card__stats--item");//1播放量2弹幕数
            return {
                //用户名
                name: userInfo.querySelector(".bili-video-card__info--author").textContent,
                //标题
                title: info.querySelector(".bili-video-card__info--tit").getAttribute("title"),
                upSpatialAddress: upSpatialAddress,
                uid: Util.getSubUid(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1)),
                //视频的时间
                videoTime: v.querySelector(".bili-video-card__stats__duration").textContent,
                //播放量
                playbackVolume: topInfo[0],
                //弹幕量
                barrageQuantity: topInfo[1]
            }
        },
        getTabTheSelectedSort() {//排序
            const e = document.querySelector(".search-condition-row>.vui_button--active");
            return e == null ? "默认排序" : e.textContent;
        },
        getVideoDataList(list = document.querySelectorAll(".video-list.row>*")) {
            const dataList = [];
            list.forEach(v => {
                const data = {};
                const info = v.querySelector(".bili-video-card__info--right");
                const title = info.querySelector("h3").getAttribute("title");
                if (title === null) {
                    return;
                }
                data["title"] = title.trim();
                const videoAddress = info.querySelector("a").getAttribute("href");
                data["bv"] = Util.getSubWebUrlBV(videoAddress);
                data["videoAddress"] = videoAddress;
                const userInfo = info.querySelector(".bili-video-card__info--owner");
                if (userInfo === null) {
                    return;
                }
                const userAddress = userInfo.getAttribute("href");
                data["name"] = userInfo.querySelector(".bili-video-card__info--author").textContent;
                data["uid"] = parseInt(Util.getSubWebUrlUid(userAddress));
                data["userAddress"] = userAddress;
                let tempDate;
                try {
                    tempDate = userInfo.querySelector(".bili-video-card__info--date").textContent;
                    data["date"] = tempDate.substring(3);
                } catch (e) {
                    console.log("搜索页面中获取项目时间出错了！");
                    console.error(e);
                }
                data["e"] = v;
                dataList.push(data);
            });
            return dataList;
        },
        async getAsyncVideoDataList() {
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    const arr = document.querySelectorAll(".video-list.row>*");
                    if (arr.length === 0) {
                        return;
                    }
                    if (arr[0].textContent === "") {
                        return;
                    }
                    clearInterval(interval)
                    resolve(Search.video.getVideoDataList(arr));
                }, 500);
            });
        },
        async getAllVideoDataList() {
            let dataList = [];
            return new Promise((resolve, reject) => {
                const interval = setInterval(() => {
                    const tabsItem = Search.getTabsItem();
                    if (!(tabsItem === "视频" || tabsItem === "综合")) {
                        clearInterval(interval);
                        reject("当前请在视频选项卡或者综合选项卡中获取！");
                        return;
                    }
                    const tempDataList = Search.video.getVideoDataList();
                    dataList = dataList.concat(tempDataList);
                    const nextPageBut = $(".vui_pagenation--btns>button:contains('下一页')");
                    if (nextPageBut.prop("disabled")) {
                        clearInterval(interval);
                        resolve(dataList);
                    }
                    nextPageBut.click();
                    Util.bufferBottom();
                }, 2500);
            });
        },
        /**
         * 删除搜索页面的视频元素
         */
        async searchRules() {
            const videoDataList = await this.getAsyncVideoDataList();
            videoDataList.forEach(v => {
                const data = {
                    e: v["e"],
                    upName: v["name"],
                    uid: v["uid"],
                    title: v["title"],
                    "视频地址": v["videoAddress"]
                };
                if (shieldVideo_userName_uid_title(data)) {
                    Qmsg.info("屏蔽了视频！！");
                    return;
                }
                const jqE = $(v["e"]);
                if (Util.isEventJq(jqE, "mouseover")) {
                    return;
                }
                jqE.mouseenter((e) => {
                    const domElement = e.delegateTarget;
                    const data = Search.video.getDataV(domElement);
                    Util.showSDPanel(e, data.name, data.uid);
                });
            });
        }
    },
    article: {
        getTabTheSelectedSort() {//排序
            const e = document.querySelector(".condition-row>.vui_button--active");
            return e == null ? "综合排序" : e.textContent;
        },
        getDataList() {
            const eList = document.querySelectorAll(".media-list.row.mt_lg>*");
            const list = [];
            eList.forEach(v => {
                const data = {};
                data["title"] = v.querySelector(".text1").getAttribute("title");
                data["type"] = v.querySelector(".b_text.atc-info.text_ellipsis>a").textContent;
                data["desc"] = v.querySelector(".atc-desc").textContent;
                const userInfo = v.querySelector(".flex_start.flex_inline.text3");
                data["src"] = v.querySelector(".v-img.cover-img>img").getAttribute("src");
                data["userAddress"] = userInfo.getAttribute("href");
                data["name"] = userInfo.querySelector(".lh_xs").textContent;
                const articleAddress = v.querySelector(".text1").getAttribute("href");
                data["address"] = articleAddress;
                data["cv"] = articleAddress.match(/read\/(.*?)[?]/)[1];
                list.push(data);
            });
            return list;
        },
        getAllDataList() {
            let dataList = [];
            return new Promise((resolve, reject) => {
                const interval = setInterval(() => {
                    if (document.querySelector(".loading-text.b_text.text3.p_center") !== null) {
                        Qmsg.info("加载中...");
                        return;
                    }
                    const tempList = Search.article.getDataList();
                    dataList = dataList.concat(tempList);
                    if (document.querySelector(".net-error.p_center.text_center") !== null) {
                        reject(dataList);
                        clearInterval(interval);
                        return;
                    }
                    const nextPageBut = $(".vui_pagenation--btns>button:contains('下一页')");
                    if (nextPageBut.prop("disabled")) {
                        clearInterval(interval);
                        resolve(dataList);
                    }
                    nextPageBut.click();
                    Util.bufferBottom();
                }, 2500);
            });
        }
    },
    upuser: {
        getTabTheSelectedSort() {//排序
            const e = document.querySelector(".condition-row>.vui_button--active");
            return e == null ? "默认排序" : e.textContent;
        },
        getTwoTabTheSelectedSort() {//二级筛选
            return document.querySelector(".more-conditions.hide.ov_hidden>.condition-row>.vui_button--active").textContent;
        },
        getUserInfoList() {//获取搜索用户页面列表(当前页面可见)
            const elementNodeList = document.querySelectorAll(".media-list.row.mt_x40>*");
            const dataList = [];
            elementNodeList.forEach(v => {
                const data = {};
                const userInfo = v.querySelector("h2>a");
                data["name"] = userInfo.getAttribute("title");
                const address = userInfo.getAttribute("href");
                data["uid"] = parseInt(Util.getSubWebUrlUid(address));
                const lvSvgVar = v.querySelector("h2>.level-icon>use").getAttribute("xlink:href");
                data["lv"] = parseInt(lvSvgVar.replace("#lv_", ""));
                data["address"] = address;
                data["text_ellipsis"] = v.querySelector(".user-content>.text_ellipsis").getAttribute("title");
                dataList.push(data);
            });
            return dataList;
        }, getUserInfoAllList() {//获取搜索用户页面列表(当前页面全部可见)
            let dataList = [];
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    const tempDataList = Search.upuser.getUserInfoList();
                    dataList = dataList.concat(tempDataList);
                    const nextPageBut = $(".vui_pagenation--btns>button:contains('下一页')");
                    if (nextPageBut.prop("disabled")) {
                        clearInterval(interval);
                        resolve(dataList);
                    }
                    nextPageBut.click();
                }, 2110);
            });
        }

    },
    bangumi: {
        getDataList() {
            const arr = document.querySelectorAll(".media-list.i_wrapper>.row>*");
            const list = [];
            arr.forEach(v => {
                const data = {};
                data["封面"] = v.querySelector(".v-img>img").getAttribute("src");
                data["tag"] = v.querySelector(".tag.tag-primary.media-card-content-head-title-tag").textContent;
                data["番剧名"] = v.querySelector(".text_ellipsis").getAttribute("title");
                data["lableContent"] = v.querySelector(".media-card-content-head-text.media-card-content-head-label").textContent;
                const cvDesc = v.querySelector(".media-card-content-head-text.media-card-content-head-cv.text_ellipsis>span");
                data["声优"] = cvDesc === null ? "" : cvDesc.textContent;
                data["简介"] = v.querySelector(".media-card-content-head-text.media-card-content-head-desc.text_ellipsis_3l").getAttribute("title");
                const scoreFooterE = v.querySelector(".score.media-card-content-footer-score");
                data["评分人数"] = scoreFooterE.querySelector(".score-text").textContent;
                data["评分值"] = scoreFooterE.querySelector(".score-value").textContent;
                list.push(data);
            });
            console.log(list);
            return list;
        },
        getAllDataList() {
            let dataList = [];
            return new Promise(resolve => {
                const inte = setInterval(() => {
                    const arr = Search.bangumi.getDataList();
                    dataList = dataList.concat(arr);
                    const nextPageBut = $(".vui_pagenation--btns>button:contains('下一页')");
                    if (nextPageBut.prop("disabled")) {
                        clearInterval(inte);
                        resolve(dataList);
                        return;
                    }
                    nextPageBut.click();
                }, 2000);
            });
        }
    },
    live: {
        getTabsItem() {
            const e = document.querySelector(".live-condition.mt_lg.mt_xxl>.vui_button--active");
            return e === null ? "全部" : e.textContent;
        },
        liveUsers: {
            getDataList() {
                const list = [];
                document.querySelectorAll(".live-user-cards.row.mt_lg>*").forEach(v => {
                    const data = {};
                    const liveTitleE = v.querySelector(".live-title");
                    data["直播间标题"] = liveTitleE.textContent;
                    data["直播间地址"] = liveTitleE.getAttribute("href");
                    data["text_ellipsisD_inline_block"] = v.querySelector(".text_ellipsis.d_inline_block").textContent;
                    data["用户头像"] = v.querySelector(".bili-avatar>img").getAttribute("src");
                    list.push(data);
                });
                return list;
            },
            getAllDataList() {
                let list = [];
                return new Promise(resolve => {
                    const interval = setInterval(() => {
                        const arr = Search.live.liveUsers.getDataList();
                        list = list.concat(arr);
                        const nextPageBut = $(".vui_pagenation--btns>button:contains('下一页')");
                        if (nextPageBut.prop("disabled")) {
                            clearInterval(interval);
                            resolve(list);
                            return;
                        }
                        nextPageBut.click();
                    }, 2000);
                });
            }
        },
        getLiveRoomSort() {//直播间排序
            const e = document.querySelector(".room-order.flex_start.ml_sm>.vui_button--active");
            return e === null ? "综合排序" : e.textContent;
        },
        getLiveDataList() {
            const list = [];
            document.querySelectorAll(".live-room-cards.row.mt_lg>*").forEach(v => {
                const data = {};
                data["封面"] = v.querySelector(".v-img.bili-live-card__cover>img").getAttribute("src");
                const liveCard = v.querySelector(".bili-live-card__info--tit");
                const userInfoE = v.querySelector(".bili-live-card__info--uname");
                data["直播间标题"] = liveCard.querySelector("a>span").textContent;
                data["直播间地址"] = liveCard.querySelector("a").getAttribute("href");
                data["用户名"] = userInfoE.querySelector("span").textContent;
                const userAddress = userInfoE.getAttribute("href");
                data["uid"] = Util.getSubWebUrlUid(userAddress);
                data["用户地址"] = userAddress;
                data["人气"] = v.querySelector(".bili-live-card__stats--item>span").textContent;
                list.push(data);
            });
            return list;
        },
        getLiveAllDataList() {
            let list = [];
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    const arr = Search.live.getLiveDataList();
                    list = list.concat(arr);
                    const nextPageBut = $(".vui_pagenation--btns>button:contains('下一页')");
                    if (nextPageBut.prop("disabled")) {
                        clearInterval(interval);
                        resolve(list);
                        return;
                    }
                    nextPageBut.click();
                }, 2000);
            });
        }
    },
    searchColumn() {//根据规则屏蔽搜索专栏项目
        const interval = setInterval(() => {
            const list = $(".media-list.row.mt_lg").children();
            if (list.length === 0) {
                return;
            }
            clearInterval(interval);
            for (let v of list) {
                const userInfo = v.querySelector(".flex_start.flex_inline.text3");
                const title = v.querySelector(".text1").textContent;
                const textContent = v.querySelector(".atc-desc.b_text.text_ellipsis_2l.text3.fs_5").textContent;//搜索专栏中的预览部分
                const name = userInfo.text;
                const upSpatialAddress = userInfo.href;
                const uid = parseInt(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1));
                if (Remove.isWhiteUserUID(uid)) {
                    continue;
                }
                if (Remove.uid(v, uid)) {
                    Print.ln("已通过uid【" + uid + "】，屏蔽用户【" + name + "】，专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
                    continue;
                }
                if (Remove.name(v, name)) {
                    Print.ln("已通过黑名单用户【" + name + "】，屏蔽处理，专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
                    continue;
                }
                const isNameKey = Remove.nameKey(v, name);
                if (isNameKey != null) {
                    Print.ln("用户【" + name + "】的用户名包含屏蔽词【" + isNameKey + "】 故进行屏蔽处理 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid)
                    continue;
                }
                const isTitleKey = Remove.titleKey(v, title);
                if (isTitleKey != null) {
                    Print.ln("通过标题关键词屏蔽用户【" + name + "】 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
                    continue;
                }
                const titleKeyCanonical = Remove.titleKeyCanonical(v, title);
                if (titleKeyCanonical != null) {
                    Print.ln(`通过标题正则表达式=【${titleKeyCanonical}】屏蔽用户【${name}】专栏预览内容=${textContent} 用户空间地址=https://space.bilibili.com/${uid}`);
                    continue;
                }
                const key = Remove.columnContentKey(v, textContent);
                if (key !== null) {
                    Print.ln("已通过专栏内容关键词【" + key + "】屏蔽用户【" + name + "】 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
                    continue;
                }
                $(v).mouseenter((e) => {
                    const domElement = e.delegateTarget;
                    const title = domElement.querySelector(".text1").textContent;
                    const info = domElement.querySelector(".flex_start.flex_inline.text3");
                    const name = info.querySelector(".lh_xs").text;
                    const userHref = info.href;
                    const uid = userHref.substring(userHref.lastIndexOf("/") + 1);
                    Util.showSDPanel(e, name, uid, title);
                });
            }
        }, 1000);
    }
}