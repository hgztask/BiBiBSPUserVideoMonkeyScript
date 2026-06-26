import bilibiliHome from './pages/home/bilibili.ts'
import searchModel from "./pages/search/model.ts";
import videoPlayModel from "./pages/video/playModel.ts";
import collectionVideoPlayPageModel from "./pages/video/collectionPlay.ts";
import liveRoomModel from "./pages/live/roomModel.ts";
import videoPlayWatchLater from "./pages/video/watchLater.ts";
import newHistory from "./pages/history/new.ts";
import searchLive from "./pages/search/live.ts";
import hotSearch from "./pages/search/hot.ts";
import messagePage from "./pages/message/page.ts";
import topInput from "./pages/search/topInput.ts";
import space from "./pages/space/main.ts";
import {eventEmitter} from "./core/EventEmitter.ts";
import BLBLGate from "./pages/home/BLBLGate.ts";
import globalValue from "./config/globalValue";
import {checkAndExcludePage} from "./ui/excludeURLs.ts";
import liveSectionModel from "./pages/live/sectionModel.ts";
import dynamicPage from "./pages/dynamic/page.ts";
import liveCommon from "./pages/live/common.ts";
import liveHome from "./pages/live/home.ts";
import videoPlayPageCommon from "./pages/video/playCommon.ts";
import userProfile from "./pages/userProfile.ts";
import allLivePage from "./pages/live/allPage.ts";
import liveEdenRankPage from "./pages/live/edenRank.ts";
import BEWLYCommon from "./pages/home/BEWLYCommon.ts";
import BEWLYSearch from "./pages/search/BEWLY.ts";
import searchUserTab from "./pages/search/userTab.ts";
import urlUtil from "./core/util/urlUtil.ts";
import msgWhisper from "./pages/message/whisper.ts";
import cssManager from "./domain/cssManager.ts";
import topColumnProcessing from "./pages/topColumnProcessing.ts";
import defHomeCss from './ui/styles/defHome.less'
import elUtil from "./core/util/elUtil.ts";

const homeStaticRoute = (title: string, url: string): void => {
    elUtil.installStyle(defHomeCss, {type: 'id', value: 'defHome'})
    const isBewlyPage = BEWLYCommon.isBEWLYPage(url);
    if (isBewlyPage) {
        cssManager.clearBewlyCatStyle()
    }
    if (isBewlyPage && globalValue.compatibleBEWLYBEWLY) {
        return BEWLYCommon.run(url)
    }
    topColumnProcessing.processHideTheTopColumns()
    if (bilibiliHome.isHome(url, title)) {
        BLBLGate.check_bilibili_gate_compatibility()
        BEWLYCommon.check_BEWLYPage_compatibility()
        eventEmitter.send('通知屏蔽');
        if (globalValue.compatibleBEWLYBEWLY) return;
        bilibiliHome.run();
    }
}

const staticRoute = (title: string, url: string): void => {
    console.log("静态路由", title, url)
    if (checkAndExcludePage(url)) return;
    homeStaticRoute(title, url)
    hotSearch.run();
    cssManager.run(url, title);
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
        const parseUrl = urlUtil.parseUrl(url);
        msgWhisper.checkMsgListIntervalExecutor.setExecutorStatus(msgWhisper.isChatWindowInterface(parseUrl));
    }
    if (space.isSpacePage()) {
        userProfile.run()
        space.executeSetChargingVideosVisible()
        space.executeSetLiveReplayVideosVisible()
        space.getUserInfo().then((userInfo: any) => {
            console.info('userInfo', userInfo)
        })
    }
    if (liveSectionModel.isLiveSection()) {
        liveSectionModel.run()
        liveSectionModel.startCheckTopLiveRoomTagList(url)
    }
    if (liveHome.isLiveHomePage(url)) {
        liveHome.run();
    }
    if (dynamicPage.isUrlDynamicHomePage()) {
        dynamicPage.run()
        userProfile.run()
        dynamicPage.runHideBackToOldVersionButFun()
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
    if (BEWLYSearch.isUrlPage(url, title)) {
        BEWLYSearch.run(url)
    }
    if (searchUserTab.isUrlPage(url)) {
        searchUserTab.userListInsertionButton()
    }
}

const dynamicRouting = (title: string, url: string): void => {
    console.log("动态路由", title, url);
    if (liveSectionModel.isLiveSection(url)) {
        liveSectionModel.startCheckTopLiveRoomTagList(url)
    }
    if (globalValue.bOnlyTheHomepageIsBlocked) return;
    if (checkAndExcludePage(url)) return;
    if (searchUserTab.isUrlPage(url)) {
        searchUserTab.userListInsertionButton()
    }
    if (messagePage.isMessagePage(url)) {
        const parseUrl = urlUtil.parseUrl(url);
        msgWhisper.checkMsgListIntervalExecutor.setExecutorStatus(msgWhisper.isChatWindowInterface(parseUrl));
    }
    eventEmitter.send('通知屏蔽');
}

export default {
    staticRoute,
    dynamicRouting
}
