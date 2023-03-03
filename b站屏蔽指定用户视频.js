// ==UserScript==
// @name         b站屏蔽指定用户频道排行榜视频
// @version      0.2
// @description  屏蔽频道页面下的指定用户黑名单视频，可根据用户名和用户uid进行屏蔽
// @author       byhgz
// @match        https://www.bilibili.com/v/channel/*?tab=multiple
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
const  videoNameArr=["感觉不如"];

/**
 * 隐藏对应元素的视频
 * @param vdoc 视频列表元素
 * @param arr 用户名数组
 * @param arrid 用户id数组
 */
function startExtracted(vdoc, arr, arrid) {
  for (const element of vdoc) {
    //用户名
    const uPameText = element.getElementsByClassName("up-name__text")[0].textContent;
    let indexOf = arr.indexOf(uPameText);
    //视频标题
    let videoName = element.getElementsByClassName("video-name")[0].textContent;
    console.log(uPameText)
    if (indexOf !== -1) {
      element.style.display = "none";
      console.log("已通过用户名=【" + uPameText + "】屏蔽指定黑名单用户视频=" + videoName);
      continue;
    }
    //空间地址
    const upSpatialAddress = element.getElementsByClassName("up-name")[0].getAttribute("href");
    const lastIndexOf = upSpatialAddress.lastIndexOf("/") + 1;
    const id = parseInt(upSpatialAddress.substring(lastIndexOf));
    if (arrid===id) {
      element.style.display = "none";
      console.log("已通过id=【" + id +"】屏蔽指定黑名单用户【"+ uPameText+"】视频="+ videoName);
      continue;
    }
    for (let str of videoNameArr) {
      if (videoName.includes(str)) {
        element.style.display = "none";
        console.log("已通过视频标题关键词=【" + str +"】屏蔽指定黑名单用户【"+ uPameText+"】视频="+ videoName);
      }
    }

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
  extracted(userNameArr, userUIDArr);
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
      if (responseURL.includes("https://api.bilibili.com/x/web-interface/web/channel/multipl")) {
        console.log("检测到符合要求的请求=" + responseURL);
        extracted(userNameArr, userUIDArr);
      }
    }
  });

  // Your code here...
})();
