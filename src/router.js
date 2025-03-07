import bilibiliHome from './pagesModel/home/bilibiliHome.js'
import searchModel from "./pagesModel/search/searchModel.js";
import videoPlayModel from "./pagesModel/videoPlay/videoPlayModel.js";
import collectionVideoPlayPageModel from "./pagesModel/videoPlay/collectionVideoPlayPageModel.js";
import liveRoomModel from "./pagesModel/live/liveRoomModel.js";
import videoPlayWatchLater from "./pagesModel/videoPlay/videoPlayWatchLater.js";
import localMKData from "./data/localMKData.js";
import compatibleBewlyBewly from "./pagesModel/home/compatibleBewlyBewly.js";
import newHistory from "./pagesModel/history/newHistory.js";
import searchLive from "./pagesModel/search/searchLive.js";
import hotSearch from "./pagesModel/search/hotSearch.js";
import elUtil from "./utils/elUtil.js";
import messagePage from "./pagesModel/message/messagePage.js";
import topInput from "./pagesModel/search/topInput.js";
import space from "./pagesModel/space/space.js";
import {eventEmitter} from "./model/EventEmitter.js";
import BLBLGate from "./pagesModel/home/BLBLGate.js";

// 是否只屏蔽首页
const bOnlyTheHomepageIsBlocked = localMKData.getBOnlyTheHomepageIsBlocked();

/**
 * 静态路由
 * @param title {string} 标题
 * @param url {string} url地址
 */
const staticRoute = (title, url) => {
    console.log("静态路由", title, url)
    topInput.processTopInputContent()
    if (bOnlyTheHomepageIsBlocked) return;
    hotSearch.startShieldingHotList()
    eventEmitter.send('通知屏蔽')
    if (compatibleBewlyBewly.isBEWLYPage(url)) {
        if (localMKData.isCompatible_BEWLY_BEWLY()) {
            compatibleBewlyBewly.startRun(url)
            return;
        }
    }
    if (bilibiliHome.isHome(url, title)) {
        BLBLGate.check_bilibili_gate_compatibility()
        if (localMKData.isCompatible_BEWLY_BEWLY()) {
            return;
        }
        bilibiliHome.scrollMouseUpAndDown().then(() => bilibiliHome.startDebounceShieldingChangeVideoList());
        bilibiliHome.startClearExcessContentList();
        bilibiliHome.deDesktopDownloadTipEl();
    }
    if (searchModel.isSearch(url)) {
        searchModel.searchTopTabsIWrapperInstallListener()
        searchModel.startShieldingVideoList();
        searchModel.currentlyActivatedOptions()
        searchLive.installStyle()
        searchModel.delFooterContent()
    }
    if (videoPlayModel.isVideoPlayPage(url)) {
        elUtil.updateCssVModal();
        videoPlayModel.findTheExpandButtonForTheListOnTheRightAndBindTheEvent();
        videoPlayModel.setVideoPlayerEnded()
        videoPlayModel.delElManagement();
    }
    if (collectionVideoPlayPageModel.iscCollectionVideoPlayPage(url)) {
        collectionVideoPlayPageModel.findTheExpandButtonForTheListOnTheRightAndBindTheEvent();
    }
    if (liveRoomModel.isLiveRoom(url)) {
        liveRoomModel.addWatchLiveRoomChatItemsListener();
    }
    if (videoPlayWatchLater.isVideoPlayWatchLaterPage(url)) {
        elUtil.updateCssVModal();
        videoPlayWatchLater.findTheExpandButtonForTheListOnTheRightAndBindTheEvent();
    }
    if (newHistory.isNewHistoryPage(url)) {
        newHistory.startRun()
    }
    if (messagePage.isMessagePage(url)) {
        messagePage.modifyTopItemsZIndex()
    }
    if (space.isSpacePage()) {
        space.getUserInfo().then(userInfo => {
            console.info('userInfo', userInfo)
        })
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
    eventEmitter.send('通知屏蔽');
}

export default {
    staticRoute,
    dynamicRouting
}
