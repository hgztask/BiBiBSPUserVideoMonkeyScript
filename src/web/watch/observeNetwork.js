import bilibiliHome from "../pagesModel/home/bilibiliHome.js";
import commentSectionModel from "../pagesModel/commentSectionModel.js";
import popularAll from "../pagesModel/popular/popularAll.js";
import liveSectionModel from "../pagesModel/live/liveSectionModel.js";
import partition from "../pagesModel/partition.js";
import globalValue from "../data/globalValue.js";
import searchModel from "../pagesModel/search/searchModel.js";
import {eventEmitter} from "../model/EventEmitter.js";
import {checkAndExcludePage} from "../layout/excludeURLs.js";
import dynamicPage from "../pagesModel/dynamic/dynamicPage.js";
import space from "../pagesModel/space/space.js";
import allLivePage from "../pagesModel/live/allLivePage.js";

/**
 * 监听网络请求
 * @param url {string} 请求的url
 * @param windowUrl {string} 窗口的url
 * @param winTitle {string} 窗口的标题
 * @param initiatorType {string} 请求发起者类型
 */
const observeNetwork = (url, windowUrl, winTitle, initiatorType) => {
    //如果不是api请求，就直接返回
    if (!url.includes('api')) return;
    if (checkAndExcludePage(windowUrl)) {
        throw new Error('stopPerformanceObserver')
    }
    if (globalValue.bOnlyTheHomepageIsBlocked) {
        //如果开启了只屏蔽首页，且当前窗口不是首页，就直接返回
        if (!bilibiliHome.isHome(windowUrl, winTitle)) return;
    }
    if (url.startsWith("https://api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd?web_location=")) {
        if (globalValue.compatibleBEWLYBEWLY) return;
        bilibiliHome.startDebounceShieldingHomeVideoList();
        console.log("检测到首页加载了换一换视频列表和其下面的视频列表")
        return;
    }
    if (url.startsWith("https://api.bilibili.com/x/v2/reply/wbi/main?oid=")) {
        console.log("检测到评论区楼主评论加载了");
        eventEmitter.send('event-检查评论区屏蔽')
        return;
    }
    if (url.startsWith("https://api.bilibili.com/x/v2/reply/reply?oid=")) {
        console.log("检测到评论区楼主层中的子层评论列表加载了");
        eventEmitter.send('event-检查评论区屏蔽')
    }
    if (url.startsWith("https://api.bilibili.com/x/web-interface/popular?ps=")) {
        popularAll.startShieldingVideoList();
    }
    if (url.startsWith("https://api.bilibili.com/x/web-interface/popular/series/one?number=")) {
        popularAll.startShieldingVideoList(true);
    }
    if (url.startsWith("https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?offset=")) {
        console.log("用户空间动态api加载了");
        space.checkUserSpaceShieldingDynamicContentThrottle();
    }
    if (url.startsWith("https://api.live.bilibili.com/xlive/web-interface/v1/second/getList?platform=web&parent_area_id=")) {
        console.log("检测到直播间加载了分区下的房间列表");
        liveSectionModel.startShieldingLiveRoom();
    }
    if (url.startsWith('https://api.bilibili.com/x/web-interface/ranking/region?day=')) {
        console.log("检测到专区热门排行榜加载了");
        partition.startShieldingHotVideoDayList()
    }
    if (searchModel.isSearchVideoNetWorkUrl(url) || searchModel.isSearchLiveRoomNetWorkUrl(url)) {
        eventEmitter.send('通知屏蔽');
    }
    if (url.includes('api.bilibili.com/x/polymer/web-dynamic/v1/feed/all')) {
        //动态主页中，动态列表加载新的动态项，非动态评论区
        console.log('动态首页api加载了');
        dynamicPage.debounceCheckDynamicList()
    }
    if (url.includes('api.live.bilibili.com/xlive/web-interface/v1/second/getListByArea') ||
        url.includes('api.live.bilibili.com/xlive/web-interface/v1/second/getUserRecommend')) {
        allLivePage.checkLiveList();
    }
    if (url.includes('api.bilibili.com/x/v2/reply/reply?callback')||
    url.includes('api.bilibili.com/x/v2/reply?callback')) {
        console.log('直播页排行榜地下的评论列表加载了')
        commentSectionModel.checkLiveRankingsCommentSectionList();
    }
    /**
     *
     * 该接口暂不需要，检测列表方式改成了定时遍历专区里的视频列表
     *
     * 用于获取特定标签（tag_id=）和分区（rid=）的动态内容
     * https://api.bilibili.com/x/web-interface/dynamic/tag?ps=
     *
     * 用于获取特定分区（rid=）的动态内容
     * https://api.bilibili.com/x/web-interface/dynamic/region?ps=
     */
}

export default {
    observeNetwork
}
