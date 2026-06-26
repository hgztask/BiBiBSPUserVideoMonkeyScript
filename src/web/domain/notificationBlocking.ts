import {eventEmitter} from "../core/EventEmitter.ts"
import searchModel from '../pages/search/model.ts'
import bilibiliHome from "../pages/home/bilibili.ts"
import videoPlayModel from "../pages/video/playModel.ts"
import collectionVideoPlayPageModel from "../pages/video/collectionPlay.ts"
import popular from "../pages/popular/main.ts"
import popularAll from "../pages/popular/all.ts"
import topicDetail from "../pages/topicDetail.ts"
import videoPlayWatchLater from "../pages/video/watchLater.ts"
import liveSectionModel from "../pages/live/sectionModel.ts"
import liveHome from "../pages/live/home.ts"
import oldHistory from "../pages/history/old.ts"
import partition from "../pages/partition.ts"
import globalValue from "../config/globalValue.ts"
import BLBLGate from "../pages/home/BLBLGate.ts"
import searchLive from "../pages/search/live.ts"
import dynamicPage from "../pages/dynamic/page.ts"
import space from "../pages/space/main.ts"
import BEWLYSearch from "../pages/search/BEWLY.ts"

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
