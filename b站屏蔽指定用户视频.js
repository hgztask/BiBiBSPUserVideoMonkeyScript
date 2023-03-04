// ==UserScript==
// @name         b站屏蔽指定用户或者关键词视频
// @version      0.5
// @description  根据用户名、uid和视频关键词进行屏蔽视频，作用场所，频道，首页推荐，搜索页面,播放页右侧推送
// @author       byhgz
// @match        https://www.bilibili.com/v/channel/*?tab=multiple
// @match       *search.bilibili.com/all?keyword=*&page=*&o=*
// @match       *search.bilibili.com/all?keyword=*
// @match       *search.bilibili.com/all*
// @match       *search.bilibili.com/video?keyword=*
// @match       *www.bilibili.com/video*
// @match        https://www.bilibili.com/
// @icon         https://static.hdslb.com/images/favicon.ico
// @require  https://unpkg.com/ajax-hook@2.1.3/dist/ajaxhook.min.js
// @grant        none
// ==/UserScript==

/**
 * 用户名黑名单模式
 * @type {string[]}
 */
const userNameArr = ["战双帕弥什"];
/**
 * 用户uid黑名单模式
 * @type {number[]}
 * 空灵LML
 * 崩坏山官方
 * 原神官方
 */
const userUIDArr = [3493087556930157, 128154158, 27534330, 401742377];

/**
 * 视频标题关键词
 * @type {string[]}
 */
const videoNameArr = ["感觉不如", "对标原神", "原神"];
/**
 * 评论关键词
 * @type {string[]}
 */
const commentOnKeyArr = ["感觉不如"];


/**
 * 获取当前网页的url
 * @returns {string}
 */
function getWindowUrl() {
    return window.location.href;
}


/**
 * 根据用户uid屏蔽元素
 * @param element 网页元素
 * @param uid 用户uid
 * @returns {boolean}
 */
function shieldUID(element, uid) {
    if (userUIDArr.includes(uid)) {
        element.remove();
        return true;
    }
    return false;
}

/**
 *根据用户名屏蔽元素
 * @param element 网页元素
 * @param name 用户名
 * @returns {boolean}
 */
function shieldName(element, name) {
    if (userNameArr.includes(name)) {
        element.remove();
        return true;
    }
    return false;
}

/**
 *  屏蔽视频元素
 *  针对用户名、用户uid，视频标题
 * @param element 对应的视频元素
 * @param name 用户名
 * @param uid 用户uid
 * @param title 视频标题
 * @returns {boolean} 是否执行完
 */
function shieldUserNameOrUIDOrTitle(element, name, uid, title) {
    if (shieldUID(element, uid)) {
        console.log("已通过id=【" + uid + "】屏蔽指定黑名单用户【" + name + "】视频=" + title);
        return true;
    }
    if (shieldName(element, name)) {
        console.log("已通过用户名屏蔽指定黑名单用户【" + name + "】视频=" + title);
        return true;
    }
    for (let str of videoNameArr) {
        if (title.includes(str)) {
            element.remove();
            console.log("已通过视频标题关键词=【" + str + "】屏蔽指定黑名单用户【" + name + "】视频=" + title);
            return true;
        }
    }
    return false;
}

/**
 * 根据言论内容屏蔽元素
 * @param element 网页元素
 * @param content 言论内容
 * @returns {boolean}
 */
function shieldCommentContent(element, content) {
    for (let str of commentOnKeyArr) {
        if (content.includes(str)) {
            element.remove();
            return true;
        }
    }
    return false;
}


/**
 * 频道
 * 隐藏对应元素的视频
 * @param vdoc 视频列表
 * @returns {boolean}
 */
function startExtracted(vdoc) {
    let temp = false;
    for (const element of vdoc) {
        //用户名
        const upName = element.getElementsByClassName("up-name__text")[0].textContent;
        //视频标题
        let videoName = element.getElementsByClassName("video-name")[0].textContent;
        //空间地址
        const upSpatialAddress = element.getElementsByClassName("up-name")[0].getAttribute("href");
        const lastIndexOf = upSpatialAddress.lastIndexOf("/") + 1;
        const id = parseInt(upSpatialAddress.substring(lastIndexOf));
        temp = shieldUserNameOrUIDOrTitle(element, upName, id, videoName);
    }
    return temp;
}

/**
 * 删除搜索页面的视频元素
 * @param videoList
 */
function searchRules(videoList) {
    for (let v of videoList) {
        let info = v.getElementsByClassName("bili-video-card__info--right")[0];
        let userInfo = info.getElementsByClassName("bili-video-card__info--owner")[0];
        //用户名
        let name = userInfo.getElementsByClassName("bili-video-card__info--author")[0].textContent;
        //视频标题
        let title = info.getElementsByClassName("bili-video-card__info--tit")[0].getAttribute("title");
        //用户空间地址
        let upSpatialAddress = userInfo.getAttribute("href");
        if (!upSpatialAddress.startsWith("//space.bilibili.com/")) {
            console.log("检测到不是正常视频内容，故隐藏该元素")
            //如果获取的类型不符合规则则结束本轮
            v.parentNode.remove();
            continue;
        }
        let id = parseInt(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1));
        shieldUserNameOrUIDOrTitle(v.parentNode, name, id, title);
    }
}

function perf_observer(list, observer) {
    const entries = performance.getEntriesByType('resource');
    for (let entry of entries) {
        const url = entry.name;
        if (entry.initiatorType !== "xmlhttprequest") {//只要json类的
            continue;
        }

        if (url.includes("api.bilibili.com/x/web-interface/web/channel")) {
            //针对于频道界面的综合视频和频道界面的精选视频
            frequencyChannelRules();
            channelListRules();
            continue;
        }
        if (url.includes("https://api.bilibili.com/x/web-interface/wbi/search/type?__refresh__")) {//搜索页面的请求
            //console.log("检测到动态加载的数据url=" + url)
            //searchRules();
        }
    }
}


/**
 * 频道排行榜规则
 */
function channelListRules() {
    let list = document.getElementsByClassName("rank-video-card");
    if (list.length !== 0 && startExtracted(list)) {
        console.log("已检测到频道综合的排行榜")
    }
}

/**
 * 频道精选视频等其他视频规则
 * 已针对个别情况没有删除对应元素，做了个循环处理
 */
function frequencyChannelRules() {
//针对频道中的精选视频和在综合排行榜下面的视频
    //let index = 0;
    while (true) {
        const list = document.getElementsByClassName("video-card");
        //index++;
        const tempLength = list.length;
        if (tempLength === 0) {
            break;
        }
        //console.log("执行第" + index + "轮检测")
        startExtracted(list)
        if (list.length === tempLength) {
            console.log("页面元素没有变化了，故退出循环")
            break;
        }
    }
}

/**
 * 根据网页url指定不同的逻辑
 * @param href{String} url链接
 */
function ruleList(href) {
    //https://search.bilibili.com/all?keyword=%E5%8E%9F%E7%A5%9E&page=2&o=36
    if (href.includes("https://search.bilibili.com/all") || href.includes("search.bilibili.com/video")) {//搜索页面-综合-搜索界面-视频
        const interval = setInterval(() => {
            while (true) {
                const list = document.getElementsByClassName("bili-video-card");
                const tempListLength = list.length;
                if (tempListLength === 0) {
                    break;
                }
                try {//删除搜索到的精确结果元素
                    document.getElementsByClassName("activity-game-list i_wrapper search-all-list")[0].remove();
                    console.log("删除搜索到的精确结果元素")
                } catch (e) {
                }
                try {//删除搜索到的精确用户结果元素
                    document.getElementsByClassName("user-list search-all-list")[0].remove();
                    console.log("删除搜索到的精确用户结果元素")
                } catch (e) {
                }
                searchRules(list);
                if (tempListLength === list.length) {
                    clearInterval(interval);
                    console.log("页面元素没有变化，故退出循环")
                    break;
                }
            }
        }, 500);
    }
    if (href.includes("https://www.bilibili.com/video")) {//如果是视频播放页的话
        for (let e of document.getElementsByClassName("video-page-card-small")) {//获取左侧的页面的视频列表
            const videoInfo = e.getElementsByClassName("info")[0];
            //用户名
            const name = videoInfo.getElementsByClassName("name")[0].textContent;
            //视频标题
            const videoTitle = videoInfo.getElementsByClassName("title")[0].textContent;
            //用户空间地址
            const upSpatialAddress = e.getElementsByClassName("upname")[0].getElementsByTagName("a")[0].getAttribute("href");
            const id = parseInt(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("com/") + 4, upSpatialAddress.length - 1));
            shieldUserNameOrUIDOrTitle(e, name, id, videoTitle);
        }

    }
    if (href.includes("https://www.bilibili.com/video")) {//如果是视频播放页的话
        for (let v of document.getElementsByClassName("reply-item")) {//针对于评论区
            const userInfo = v.getElementsByClassName("user-info")[0];
            const userName = userInfo.getElementsByClassName("user-name")[0].textContent;
            const userID = userInfo.getElementsByClassName("user-name")[0].getAttribute("data-user-id")
            const root = v.getElementsByClassName("reply-content")[0].parentNode.textContent;//楼主评论
            const subReplyList = v.getElementsByClassName("sub-reply-list")[0];//楼主下面的评论区
            for (let j of subReplyList.getElementsByClassName("sub-reply-item")) {
                const subUserName = j.getElementsByClassName("sub-user-name")[0].textContent;
                const subUserID = j.getElementsByClassName("sub-user-name")[0].getAttribute("data-user-id")
                const subContent = j.getElementsByClassName("reply-content-container sub-reply-content")[0].textContent;
                console.log(subContent)
            }
        }
        //针对于评论区
    }

    if (href.search("www.bilibili.com/v/channel/.*?tab=.*") !== -1) {//频道 匹配到频道的精选列表，和综合的普通列表
        frequencyChannelRules();
    }


}


(function () {
    'use strict';
    let href = getWindowUrl();
    console.log("当前网页url= " + href);
    //监听网络变化
    var observer = new PerformanceObserver(perf_observer);
    observer.observe({entryTypes: ['resource']});

    ruleList(href)//正常加载网页时执行

    setInterval(function () {//每秒监听网页中的url
        const tempUrl = getWindowUrl();
        if (href === tempUrl) {//没有变化就结束本轮
            return;
        }//有变化就执行对应事件
        console.log("页面url发生变化了，原=" + href + " 现=" + tempUrl);
        href = tempUrl;//更新url
        ruleList(href);//网页url发生变化时执行
    }, 1000);


    if (href === "https://www.bilibili.com/") { //首页
        // console.log("当前是首页");
        let biliVideoCardHomeList = document.getElementsByClassName("feed-card");
        if (biliVideoCardHomeList.length !== 0) {
            //内测默认视图，后面再写
            console.log("内测默认视图")
            return;
        }
        biliVideoCardHomeList = document.getElementsByClassName("bili-video-card is-rcmd");
        if (biliVideoCardHomeList.length !== 0) {
            //Bilibili Evolved修改过后的内测默认视图
            for (let element of biliVideoCardHomeList) {
                let videoInfo = element.getElementsByClassName("bili-video-card__info--right")[0];
                //视频标题
                let title = videoInfo.getElementsByClassName("bili-video-card__info--tit")[0].getAttribute("title");
                //用户名
                let upName = videoInfo.getElementsByClassName("bili-video-card__info--author")[0].getAttribute("title");
                //用户控件地址
                let upSpatialAddress = videoInfo.getElementsByClassName("bili-video-card__info--owner")[0].getAttribute("href");
                const id = parseInt(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1));
                shieldUserNameOrUIDOrTitle(element, upName, id, title);
            }
            console.log(biliVideoCardHomeList.length);
            return;
        }
        console.log(biliVideoCardHomeList.length);
    }
    // Your code here...
})();
