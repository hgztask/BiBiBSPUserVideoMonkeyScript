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
                }, 2000);
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

    }
}