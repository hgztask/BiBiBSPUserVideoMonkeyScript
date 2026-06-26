import {eventEmitter} from "../core/EventEmitter.ts"
import searchModel from '../pages/search_model.ts'
import bilibiliHome from "../pages/home_bilibili.ts"
import videoPlayModel from "../pages/video_playModel.ts"
import collectionVideoPlayPageModel from "../pages/video_collectionPlay.ts"
import popular from "../pages/popular_main.ts"
import popularAll from "../pages/popular_all.ts"
import topicDetail from "../pages/topicDetail.ts"
import videoPlayWatchLater from "../pages/video_watchLater.ts"
import liveSectionModel from "../pages/live_sectionModel.ts"
import liveHome from "../pages/live_home.ts"
import oldHistory from "../pages/history_old.ts"
import partition from "../pages/partition.ts"
import globalValue from "../config/globalValue.ts"
import BLBLGate from "../pages/home_BLBLGate.ts"
import searchLive from "../pages/search_live.ts"
import dynamicPage from "../pages/dynamic_page.ts"
import space from "../pages/space_main.ts"
import BEWLYSearch from "../pages/search_BEWLY.ts"

eventEmitter.on('通知屏蔽', (): void => {
    const url = window.location.href
    const title = document.title
    if (globalValue.bOnlyTheHomepageIsBlocked) return
    if (searchLive.isSearchLivePage(url)) {
        searchLive.startShieldingLiveRoomList()
    }
    if (searchModel.isSearch(url)) {
        searchModel.startShieldingVideoList()
    }
    if (bilibiliHome.isHome(url, title)) {
        if (globalValue.compatibleBEWLYBEWLY) return
        if (globalValue.adaptationBAppCommerce) {
            BLBLGate.startIntervalShieldingGateVideoList()
        }
        bilibiliHome.startDebounceShieldingHomeVideoList()
    }
    if (videoPlayModel.isVideoPlayPage(url)) {
        videoPlayModel.startShieldingVideoList()
    }
    if (collectionVideoPlayPageModel.iscCollectionVideoPlayPage(url)) {
        collectionVideoPlayPageModel.startShieldingVideoList()
    }
    if (videoPlayWatchLater.isVideoPlayWatchLaterPage(url)) {
        videoPlayWatchLater.startDebounceShieldingVideoList()
    }
    if (popular.isPopularAllPage(url) || popular.isPopularHistory(url)) {
        popularAll.startShieldingVideoList()
    }
    if (popular.isPopularWeeklyPage(url)) {
        popularAll.startShieldingVideoList(true)
    }
    if (popular.isGeneralPopularRank(url)) {
        popular.startShieldingRankVideoList()
    }
    if (topicDetail.isTopicDetailPage(url)) {
        topicDetail.startShielding()
    }
    if (space.isUserSpaceDynamicPage(url)) {
        space.checkUserSpaceShieldingDynamicContentThrottle()
    }
    if (liveSectionModel.isLiveSection()) {
        liveSectionModel.startShieldingLiveRoom()
    }
    if (liveHome.isLiveHomePage(url)) {
        liveHome.startShieldingLiveRoom()
    }
    if (oldHistory.isOldHistory(url)) {
        oldHistory.intervalExecutionStartShieldingVideo()
    }
    if (partition.isPartition(url) || partition.isNewPartition(url)) {
        partition.startIntervalShieldingVideoList()
    }
    if (dynamicPage.isUrlDynamicHomePage()) {
        dynamicPage.debounceCheckDynamicList()
    }
    if (BEWLYSearch.isUrlPage(url, title)) {
        BEWLYSearch.run(url)
    }
})
