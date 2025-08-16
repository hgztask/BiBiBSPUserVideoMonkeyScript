import {eventEmitter} from "./EventEmitter.js";
import searchModel from '../pagesModel/search/searchModel.js'
import bilibiliHome from "../pagesModel/home/bilibiliHome.js";
import videoPlayModel from "../pagesModel/videoPlay/videoPlayModel.js";
import collectionVideoPlayPageModel from "../pagesModel/videoPlay/collectionVideoPlayPageModel.js";
import popular from "../pagesModel/popular/popular.js";
import popularAll from "../pagesModel/popular/popularAll.js";
import topicDetail from "../pagesModel/topicDetail.js";
import videoPlayWatchLater from "../pagesModel/videoPlay/videoPlayWatchLater.js";
import liveSectionModel from "../pagesModel/live/liveSectionModel.js";
import liveHome from "../pagesModel/live/liveHome.js";
import oldHistory from "../pagesModel/history/oldHistory.js";
import partition from "../pagesModel/partition.js";
import globalValue from "../data/globalValue.js";
import BLBLGate from "../pagesModel/home/BLBLGate.js";
import searchLive from "../pagesModel/search/searchLive.js";
import dynamicPage from "../pagesModel/dynamic/dynamicPage.js";
import space from "../pagesModel/space/space.js";

/**
 * 监听通知屏蔽事件
 * 目前作用域添加规则成功之后通知执行
 */
eventEmitter.on('通知屏蔽', () => {
    const url = window.location.href;
    const title = document.title;
    if (globalValue.bOnlyTheHomepageIsBlocked) return;
    if (searchLive.isSearchLivePage(url)) {
        searchLive.startShieldingLiveRoomList();
    }
    if (searchModel.isSearch(url)) {
        searchModel.startShieldingVideoList()
    }
    if (bilibiliHome.isHome(url, title)) {
        if (globalValue.compatibleBEWLYBEWLY) return;
        if (globalValue.adaptationBAppCommerce) {
            BLBLGate.startIntervalShieldingGateVideoList();
        }
        bilibiliHome.startDebounceShieldingHomeVideoList();
    }
    if (videoPlayModel.isVideoPlayPage(url)) {
        videoPlayModel.startShieldingVideoList();
    }
    if (collectionVideoPlayPageModel.iscCollectionVideoPlayPage(url)) {
        collectionVideoPlayPageModel.startShieldingVideoList();
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
    if (space.isUserSpaceDynamicPage(url)) {
        space.checkUserSpaceShieldingDynamicContentThrottle();
    }
    if (videoPlayWatchLater.isVideoPlayWatchLaterPage(url)) {
        videoPlayWatchLater.startDebounceShieldingVideoList();
    }
    if (liveSectionModel.isLiveSection()) {
        liveSectionModel.startShieldingLiveRoom();
    }
    if (liveHome.isLiveHomePage(url)) {
        liveHome.startShieldingLiveRoom();
    }
    if (oldHistory.isOldHistory(url)) {
        oldHistory.intervalExecutionStartShieldingVideo()
    }
    if (partition.isPartition(url) || partition.isNewPartition(url)) {
        partition.startIntervalShieldingVideoList()
    }
    if (dynamicPage.isUrlDynamicHomePage()) {
        dynamicPage.debounceCheckDynamicList();
    }
})
