import bilibiliHome from './pagesModel/home/bilibiliHome.js'
import searchModel from "./pagesModel/searchModel.js";
import videoPlayModel from "./pagesModel/videoPlay/videoPlayModel.js";
import collectionVideoPlayPageModel from "./pagesModel/videoPlay/collectionVideoPlayPageModel.js";
import liveRoomModel from "./pagesModel/live/liveRoomModel.js";
import popularAll from "./pagesModel/popular/popularAll.js";
import popular from "./pagesModel/popular/popular.js";
import topicDetail from "./pagesModel/topicDetail.js";
import dynamic from "./pagesModel/space/dynamic.js";
import videoPlayWatchLater from "./pagesModel/videoPlay/videoPlayWatchLater.js";
import liveSectionModel from "./pagesModel/live/liveSectionModel.js";
import liveHome from "./pagesModel/live/liveHome.js";
import localMKData from "./data/localMKData.js";
import compatibleBewlyBewly from "./pagesModel/home/compatibleBewlyBewly.js";
import newHistory from "./pagesModel/history/newHistory.js";

// 是否只屏蔽首页
const bOnlyTheHomepageIsBlocked = localMKData.getBOnlyTheHomepageIsBlocked();
// 是否适配bilibili-app-commerce脚本(Bilibili-Gate脚本)
const adaptationBAppCommerce = localMKData.getAdaptationBAppCommerce();
// 是否兼容BewlyBewly插件
const compatible_BEWLY_BEWLY = localMKData.isCompatible_BEWLY_BEWLY()

/**
 * 静态路由
 * @param title {string} 标题
 * @param url {string} url地址
 */
const staticRoute = (title, url) => {
    console.log("静态路由", title, url)
    if (compatible_BEWLY_BEWLY && compatibleBewlyBewly.isBEWLYPage(url)) {
        compatibleBewlyBewly.startRun(url)
        return;
    }
    if (bilibiliHome.isHome(url, title)) {
        if (compatible_BEWLY_BEWLY) {
            return;
        }
        if (adaptationBAppCommerce) {
            bilibiliHome.startIntervalShieldingGateVideoList();
        }
        bilibiliHome.scrollMouseUpAndDown().then(() => bilibiliHome.startDebounceShieldingChangeVideoList());
        bilibiliHome.startClearExcessContentList();
        bilibiliHome.deDesktopDownloadTipEl();
        bilibiliHome.startDebounceShieldingHomeVideoList();
    }
    //如果只屏蔽首页，则不执行以下代码
    if (bOnlyTheHomepageIsBlocked) return;
    if (searchModel.isSearch(url)) {
        searchModel.startDebounceShieldingVideoList();
    }
    if (videoPlayModel.isVideoPlayPage(url)) {
        videoPlayModel.startShieldingVideoList();
        videoPlayModel.findTheExpandButtonForTheListOnTheRightAndBindTheEvent();
    }
    if (collectionVideoPlayPageModel.iscCollectionVideoPlayPage(url)) {
        collectionVideoPlayPageModel.startShieldingVideoList();
        collectionVideoPlayPageModel.findTheExpandButtonForTheListOnTheRightAndBindTheEvent();
    }
    if (liveRoomModel.isLiveRoom(url)) {
        liveRoomModel.addWatchLiveRoomChatItemsListener();
    }
    if (popular.isPopularAllPage(url) || popular.isPopularHistory(url)) {
        popularAll.startShieldingVideoList();
    }
    if (popular.isPopularWeeklyPage(url)) {
        popularAll.startShieldingVideoList(true);
    }
    if (popular.isGeneralPopularRank(url)) {
        popular.startShieldingRankVideoList();
    }
    if (topicDetail.isTopicDetailPage(url)) {
        topicDetail.startShielding();
    }
    if (dynamic.isDynamicPage(url)) {
        dynamic.startThrottleShieldingDynamicContent();
    }
    if (videoPlayWatchLater.isVideoPlayWatchLaterPage(url)) {
        videoPlayWatchLater.startDebounceShieldingVideoList();
        videoPlayWatchLater.findTheExpandButtonForTheListOnTheRightAndBindTheEvent();
    }
    if (liveSectionModel.isLiveSection(url)) {
        liveSectionModel.startShieldingLiveRoom();
    }
    if (liveHome.isLiveHomePage(url)) {
        liveHome.startShieldingLiveRoom();
        liveHome.startShieldingTopLiveRoom();
    }
    if (newHistory.isNewHistoryPage(url)) {
        newHistory.startRun()
    }
}

/**
 * 动态路由
 * @param title {string} 标题
 * @param url {string} url地址
 */
const dynamicRouting = (title, url) => {
    console.log("动态路由", title, url);
    //如果只屏蔽首页，则不执行以下代码
    if (bOnlyTheHomepageIsBlocked) return;
    if (searchModel.isSearch(url)) {
        searchModel.startDebounceShieldingVideoList();
    }
    if (videoPlayModel.isVideoPlayPage(url)) {
        videoPlayModel.startShieldingVideoList();
    }
    if (popular.isPopularAllPage(url) || popular.isPopularHistory(url)) {
        popularAll.startShieldingVideoList();
    }
    if (popular.isPopularWeeklyPage(url)) {
        popularAll.startShieldingVideoList(true);
    }
    if (popular.isGeneralPopularRank(url)) {
        popular.startShieldingRankVideoList();
    }
    if (dynamic.isDynamicPage(url)) {
        dynamic.startThrottleShieldingDynamicContent();
    }
}


export default {
    staticRoute,
    dynamicRouting
}
