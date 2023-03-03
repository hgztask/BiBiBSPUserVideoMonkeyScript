// ==UserScript==
// @name         b站屏蔽指定用户或者关键词视频
// @version      0.4
// @description  根据用户名、uid和视频关键词进行屏蔽视频，作用场所，频道，首页推荐
// @author       byhgz
// @match        https://www.bilibili.com/v/channel/*?tab=multiple
// @match        *://*.bilibili.com/*
// @icon         https://static.hdslb.com/images/favicon.ico
// @require  https://unpkg.com/ajax-hook@2.1.3/dist/ajaxhook.min.js
// @grant        none
// ==/UserScript==

/**
 * 用户名黑名单模式
 * @type {string[]}
 */
const userNameArr = ["疯狂暗示00", "silly沐"];
/**
 * 用户uid黑名单模式
 * @type {number[]}
 */
const userUIDArr = [3493087556930157];

/**
 * 视频标题关键词
 * @type {string[]}
 */
const videoNameArr = ["感觉不如","为什么","游戏"];

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
        let indexOf = arr.indexOf(upName);
        //视频标题
        let videoName = element.getElementsByClassName("video-name")[0].textContent;
        if (indexOf !== -1) {
            element.style.display = "none";
            console.log("已通过用户名=【" + upName + "】屏蔽指定黑名单用户视频=" + videoName);
            continue;
        }
        //空间地址
        const upSpatialAddress = element.getElementsByClassName("up-name")[0].getAttribute("href");
        const lastIndexOf = upSpatialAddress.lastIndexOf("/") + 1;
        const id = parseInt(upSpatialAddress.substring(lastIndexOf));
        shieldUserNameOrUIDOrTitle(element,upName,id,videoName);
    }
}


/**
 * 针对综合排行榜和频道中的其他精选视频以及综合排行榜下面的视频
 * @param arr
 * @param arrid
 */
function extracted(arr, arrid) {
    //针对综合排行榜
    const comprehensiveRanking = document.getElementsByClassName("rank-video-card");
    startExtracted(comprehensiveRanking, arr, arrid);
    //针对频道中的其他精选视频和在综合排行榜下面的视频
    const cardList = document.getElementsByClassName("card-list");
    for (let v of cardList) {
        const temp = v.getElementsByClassName("video-card");
        startExtracted(temp, arr, arrid);
    }
}

(function () {
    'use strict';
    const href = window.location.href;

    if (href.includes("www.bilibili.com/v/channel")) {
        extracted(userNameArr, userUIDArr);
    }
    if (href.includes("www.bilibili.com/")) {
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
                const lastIndexOf = upSpatialAddress.lastIndexOf("/") + 1;
                const id = parseInt(upSpatialAddress.substring(lastIndexOf));
                shieldUserNameOrUIDOrTitle(element, upName, id, title);
            }
            console.log(biliVideoCardHomeList.length);
            return;
        }
        console.log(biliVideoCardHomeList.length);
    }


    ah.proxy({
        // //请求发起前进入
        onRequest: (config, handler) => {
            handler.next(config);
        },
        //请求发生错误时进入，比如超时；注意，不包括http状态码错误，如404仍然会认为请求成功
        onError: (err, handler) => {
            handler.next(err);
        },
        //请求成功后进入
        onResponse: (response, handler) => {
            const responseURL = handler.xhr.responseURL;
            handler.next(response);
            //针对于频道界面的视频
            if (responseURL.includes("https://api.bilibili.com/x/web-interface/web/channel/multipl")) {
                console.log("检测到符合要求的请求=" + responseURL);
                extracted(userNameArr, userUIDArr);
            }
        }
    });
    // Your code here...
})();
