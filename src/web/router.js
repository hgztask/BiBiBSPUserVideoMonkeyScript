import bilibiliHome from './pagesModel/home/bilibiliHome.js'
import searchModel from "./pagesModel/search/searchModel.js";
import videoPlayModel from "./pagesModel/videoPlay/videoPlayModel.js";
import collectionVideoPlayPageModel from "./pagesModel/videoPlay/collectionVideoPlayPageModel.js";
import liveRoomModel from "./pagesModel/live/liveRoomModel.js";
import videoPlayWatchLater from "./pagesModel/videoPlay/videoPlayWatchLater.js";
import newHistory from "./pagesModel/history/newHistory.js";
import searchLive from "./pagesModel/search/searchLive.js";
import hotSearch from "./pagesModel/search/hotSearch.js";
import messagePage from "./pagesModel/message/messagePage.js";
import topInput from "./pagesModel/search/topInput.js";
import space from "./pagesModel/space/space.js";
import {eventEmitter} from "./model/EventEmitter.js";
import BLBLGate from "./pagesModel/home/BLBLGate.js";
import globalValue from "./data/globalValue.js";
import {checkAndExcludePage} from "./layout/excludeURLs.js";
import liveSectionModel from "./pagesModel/live/liveSectionModel.js";
import dynamicPage from "./pagesModel/dynamic/dynamicPage.js";
import LiveCommon from "./pagesModel/live/liveCommon.js";
import liveCommon from "./pagesModel/live/liveCommon.js";
import liveHome from "./pagesModel/live/liveHome.js";
import videoPlayPageCommon from "./pagesModel/videoPlay/videoPlayPageCommon.js";
import userProfile from "./pagesModel/userProfile.js";
import {localWs} from "./dev/LocalWs.js";
import allLivePage from "./pagesModel/live/allLivePage.js";
import liveEdenRankPage from "./pagesModel/live/liveEdenRankPage.js";
import BEWLYCommon from "./pagesModel/home/BEWLYCommon.js";

const homeStaticRoute = (title, url) => {
    if (BEWLYCommon.isBEWLYPage(url) && globalValue.compatibleBEWLYBEWLY) {
        BEWLYCommon.run(url)
    }
    if (bilibiliHome.isHome(url, title)) {
        BLBLGate.check_bilibili_gate_compatibility()
        BEWLYCommon.check_BEWLYPage_compatibility()
        eventEmitter.send('通知屏蔽');
        if (globalValue.compatibleBEWLYBEWLY) return;
        bilibiliHome.run();
    }
}

/**
 * 静态路由
 * @param title {string} 标题
 * @param url {string} url地址
 */
const staticRoute = (title, url) => {
    console.log("静态路由", title, url)
    if (checkAndExcludePage(url)) return;
    homeStaticRoute(title, url)
    hotSearch.run();
    if (globalValue.bOnlyTheHomepageIsBlocked) return;
    topInput.processTopInputContent()
    hotSearch.startShieldingHotList()
    eventEmitter.send('通知屏蔽')
    if (searchModel.isSearch(url)) {
        searchLive.installStyle()
        searchModel.delFooterContent()
    }
    if (videoPlayModel.isVideoPlayPage(url)) {
        videoPlayModel.findTheExpandButtonForTheListOnTheRightAndBindTheEvent();
        videoPlayModel.run();
        userProfile.run();
        videoPlayPageCommon.insertUserProfileShieldButton();
    }
    if (collectionVideoPlayPageModel.iscCollectionVideoPlayPage(url)) {
        collectionVideoPlayPageModel.findTheExpandButtonForTheListOnTheRightAndBindTheEvent();
        videoPlayPageCommon.insertTagShieldButton()
        userProfile.run()
        videoPlayPageCommon.insertUserProfileShieldButton();
    }
    if (liveRoomModel.isLiveRoom(url)) {
        liveRoomModel.run();
    }
    if (videoPlayWatchLater.isVideoPlayWatchLaterPage(url)) {
        videoPlayWatchLater.findTheExpandButtonForTheListOnTheRightAndBindTheEvent();
        videoPlayPageCommon.insertTagShieldButton()
        userProfile.run()
        videoPlayPageCommon.insertUserProfileShieldButton();
    }
    if (newHistory.isNewHistoryPage(url)) {
        newHistory.startRun()
    }
    if (messagePage.isMessagePage(url)) {
        messagePage.modifyTopItemsZIndex()
    }
    if (space.isSpacePage()) {
        userProfile.run()
        space.getUserInfo().then(userInfo => {
            console.info('userInfo', userInfo)
        })
    }
    if (liveSectionModel.isLiveSection()) {
        LiveCommon.addStyle();
    }
    if (liveHome.isLiveHomePage(url)) {
        liveHome.run();
    }
    if (dynamicPage.isUrlDynamicHomePage()) {
        dynamicPage.run()
        userProfile.run()
    }
    if (dynamicPage.isUrlDynamicContentPage()) {
        userProfile.run()
    }
    if (allLivePage.isUrlPage(url)) {
        liveCommon.addStyle();
        allLivePage.checkLiveList();
    }
    if (liveEdenRankPage.isUrlPage(url)) {
        liveEdenRankPage.run()
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
    if (globalValue.bOnlyTheHomepageIsBlocked) return;
    if (checkAndExcludePage(url)) return;
    eventEmitter.send('通知屏蔽');
}

export default {
    staticRoute,
    dynamicRouting
}
