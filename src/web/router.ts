import bilibiliHome from './pages/home_bilibili.ts'
import searchModel from "./pages/search_model.ts";
import videoPlayModel from "./pages/video_playModel.ts";
import collectionVideoPlayPageModel from "./pages/video_collectionPlay.ts";
import liveRoomModel from "./pages/live_roomModel.ts";
import videoPlayWatchLater from "./pages/video_watchLater.ts";
import newHistory from "./pages/history_new.ts";
import searchLive from "./pages/search_live.ts";
import hotSearch from "./pages/search_hot.ts";
import messagePage from "./pages/msg_page.ts";
import topInput from "./pages/search_topInput.ts";
import space from "./pages/space_main.ts";
import {eventEmitter} from "./core/EventEmitter.ts";
import BLBLGate from "./pages/home_BLBLGate.ts";
import globalValue from "./config/globalValue";
import {checkAndExcludePage} from "./ui/excludeURLs.ts";
import liveSectionModel from "./pages/live_sectionModel.ts";
import dynamicPage from "./pages/dynamic_page.ts";
import liveCommon from "./pages/live_common.ts";
import liveHome from "./pages/live_home.ts";
import videoPlayPageCommon from "./pages/video_playCommon.ts";
import userProfile from "./pages/userProfile.ts";
import allLivePage from "./pages/live_allPage.ts";
import liveEdenRankPage from "./pages/live_edenRank.ts";
import BEWLYCommon from "./pages/home_BEWLYCommon.ts";
import BEWLYSearch from "./pages/search_BEWLY.ts";
import searchUserTab from "./pages/search_userTab.ts";
import urlUtil from "./core/urlUtil.ts";
import msgWhisper from "./pages/msg_whisper.ts";
import cssManager from "./domain/cssManager.ts";
import topColumnProcessing from "./pages/topColumnProcessing.ts";
import defHomeCss from './ui/defHome.less'
import elUtil from "./core/elUtil.ts";

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
