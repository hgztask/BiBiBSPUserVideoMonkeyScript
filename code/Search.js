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
        getTabTheSelectedSort() {//排序
            const e = document.querySelector(".search-condition-row>.vui_button--active");
            return e == null ? "默认排序" : e.textContent;
        },
        getVideoDataList() {
            const ENList = document.querySelectorAll(".video-list.row>*");
            const dataList = [];
            ENList.forEach(v => {
                const data = {};
                const info = v.querySelector(".bili-video-card__info--right");
                data["title"] = info.querySelector("h3").getAttribute("title").trim();
                const videoAddress = info.querySelector("a").getAttribute("href");
                data["bv"] = Util.getSubWebUrlBV(videoAddress);
                data["videoAddress"] = videoAddress;
                const userInfo = info.querySelector(".bili-video-card__info--owner");
                const userAddress = userInfo.getAttribute("href");
                data["name"] = userInfo.querySelector(".bili-video-card__info--author").textContent;
                data["uid"] = parseInt(Util.getSubWebUrlUid(userAddress));
                data["userAddress"] = userAddress;
                const tempDate = userInfo.querySelector(".bili-video-card__info--date").textContent;
                data["date"] = tempDate.substring(3);
                dataList.push(data);
            });
            return dataList;
        },
        getAllVideoDataList() {
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
    }
}