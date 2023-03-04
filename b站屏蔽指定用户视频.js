// ==UserScript==
// @name         b站屏蔽指定用户或者关键词视频
// @version      0.5
// @description  根据用户名、uid和视频关键词进行屏蔽视频，作用场所，频道，首页推荐，搜索页面
// @author       byhgz
// @match        https://www.bilibili.com/v/channel/*?tab=multiple
// @match       *search.bilibili.com/all?keyword=*&page=*&o=*
// @match       *search.bilibili.com/all?keyword=*
// @match       *search.bilibili.com/video?keyword=*
// @match        *://*.bilibili.com/*
// @icon         https://static.hdslb.com/images/favicon.ico
// @require  https://unpkg.com/ajax-hook@2.1.3/dist/ajaxhook.min.js
// @grant        none
// ==/UserScript==

/**
 * 用户名黑名单模式
 * @type {string[]}
 */
const userNameArr = [];
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
 *  屏蔽视频元素
 *  针对用户名、用户uid，视频标题
 * @param element 对应的视频元素
 * @param name 用户名
 * @param uid 用户uid
 * @param title 视频标题
 * @returns {boolean} 是否执行完
 */
function shieldUserNameOrUIDOrTitle(element, name, uid, title) {
    if (userUIDArr.includes(uid)) {
        element.style.display = "none";
        console.log("已通过id=【" + uid + "】屏蔽指定黑名单用户【" + name + "】视频=" + title);
        return true;
    }
    if (userNameArr.includes(name)) {
        element.style.display = "none";
        console.log("已通过用户名屏蔽指定黑名单用户【" + name + "】视频=" + title);
        return true;
    }
    for (let str of videoNameArr) {
        if (title.includes(str)) {
            element.style.display = "none";
            console.log("已通过视频标题关键词=【" + str + "】屏蔽指定黑名单用户【" + name + "】视频=" + title);
            return true;
        }
    }
    return false;
}


/**
 * 隐藏对应元素的视频
 * @param vdoc 视频列表元素
 * @param arr 用户名数组
 * @param arrid 用户id数组
 */
function startExtracted(vdoc, arr, arrid) {
    for (const element of vdoc) {
        //用户名
        const upName = element.getElementsByClassName("up-name__text")[0].textContent;
        //视频标题
        let videoName = element.getElementsByClassName("video-name")[0].textContent;
        //空间地址
        const upSpatialAddress = element.getElementsByClassName("up-name")[0].getAttribute("href");
        const lastIndexOf = upSpatialAddress.lastIndexOf("/") + 1;
        const id = parseInt(upSpatialAddress.substring(lastIndexOf));
        shieldUserNameOrUIDOrTitle(element, upName, id, videoName);
    }
}

function searchRules(videoList) {
    console.log(videoList.length)
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
            console.log(v)
            //如果获取的类型不符合规则则结束本轮
            v.style.display = "none";
            continue;
        }
        let id = parseInt(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1));
        shieldUserNameOrUIDOrTitle(v, name, id, title);
    }
}


/**
 * 针对综合排行榜和频道中的其他精选视频以及综合排行榜下面的视频
 */
function freChFuc() {
    //针对综合排行榜
    const comprehensiveRanking = document.getElementsByClassName("rank-video-card");
    startExtracted(comprehensiveRanking, userNameArr, userUIDArr);
    //针对频道中的其他精选视频和在综合排行榜下面的视频
    const cardList = document.getElementsByClassName("card-list");
    for (let v of cardList) {
        const temp = v.getElementsByClassName("video-card");
        startExtracted(temp, userNameArr, userUIDArr);
    }
}

/**
 * 获取搜索页面的视频列表
 * @returns {HTMLCollectionOf<Element>}
 */
function searchForVideoList() {
    let videoList = document.getElementsByClassName("col_3 col_xs_1_5 col_md_2 col_xl_1_7 mb_x40");
    if (videoList !== 0) {
        return videoList;
    }
    videoList = document.getElementsByClassName("video-list-item col_3 col_xs_1_5 col_md_2 col_xl_1_7 mb_x40");
    if (videoList !== 0) {
        return videoList;
    }
    videoList = document.getElementsByClassName("video-page-card-small");
    if (videoList !== 0) {
        return videoList;
    }
}

function perf_observer(list, observer) {
    const entries = performance.getEntriesByType('resource');
    for (let entry of entries) {
        const url = entry.name;
        if (entry.initiatorType !== "xmlhttprequest") {//只要json类的
            continue;
        }
        //针对于频道界面的视频
        if (url.includes("https://api.bilibili.com/x/web-interface/web/channel/multipl")) {
            console.log("检测到符合要求的请求=" + url);
            freChFuc();
        }
        if (url.includes("https://api.bilibili.com/x/web-interface/wbi/search")) {//搜索页面的请求
            console.log("检测到动态加载的数据url" + url)
            searchRules(searchForVideoList());
        }
    }
}


function ruleList(href) {
    if (href.includes("https://search.bilibili.com/all")) {//搜索页面-综合
        const interval = setInterval(function () {
            const list = document.getElementsByClassName("col_3 col_xs_1_5 col_md_2 col_xl_1_7 mb_x40");
            if (list.length !== 0) {//持续获取，当没有获取到时，延迟一段时间重新获取，直到获取成功
                console.log("综合-获取成功！" + list.length)
                searchRules(list);
                clearInterval(interval);
                return;
            }
            console.log("搜索页面-综合-获取失败！")
        }, 1000);
    }
    if (href.includes("search.bilibili.com/video")) {//搜索界面-视频
        console.log("搜索界面-视频")
        const interval = setInterval(function () {
            var list = document.getElementsByClassName("video-list-item col_3 col_xs_1_5 col_md_2 col_xl_1_7 mb_x40");
            if (list !== 0) {
                console.log("获取成功！" + list.length)
                searchRules(list);
                clearInterval(interval)
                return;
            }
            console.log("搜索界面-视频-获取失败！")
        }, 1000);
    }
    if (href.includes("www.bilibili.com/v/channel")) { //频道
        freChFuc();
    }
    if (href.includes("https://www.bilibili.com/video")) {//如果是视频播放页的话
        const video_page_card_small = document.getElementsByClassName("video-page-card-small");
        for (let e of video_page_card_small) {
            const videoInfo = e.getElementsByClassName("info")[0];
            //用户名
            const name = videoInfo.getElementsByClassName("name")[0].textContent;
            //视频标题
            const videoTitle = videoInfo.getElementsByClassName("title")[0].textContent;
            //用户空间地址
            const upSpatialAddress = e.getElementsByClassName("upname")[0].getElementsByTagName("a")[0].getAttribute("href");
            const id = parseInt(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("com/") + 4, upSpatialAddress.length - 1));
            console.log("用户名= " + name + "  uid= " + id + " 标题=" + videoTitle);
            shieldUserNameOrUIDOrTitle(e, name, id, videoTitle);
        }
    }

}


(function () {
    'use strict';
    let href = window.location.href;
    console.log(href);
    //监听网络变化
    var observer = new PerformanceObserver(perf_observer);
    observer.observe({entryTypes: ['resource']});

    ruleList(href)//正常加载网页时执行

    setInterval(function () {//每秒监听网页中的url
        const tempUrl = window.location.href;
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
