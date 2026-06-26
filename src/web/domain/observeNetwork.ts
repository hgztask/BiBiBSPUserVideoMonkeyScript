import bilibiliHome from "../pages/home/bilibili.ts";
import commentSectionModel from "../pages/commentSectionModel.ts";
import popularAll from "../pages/popular/all.ts";
import liveSectionModel from "../pages/live/sectionModel.ts";
import partition from "../pages/partition.ts";
import globalValue from "../config/globalValue.ts";
import searchModel from "../pages/search/model.ts";
import {eventEmitter} from "../core/EventEmitter.ts";
import {checkAndExcludePage} from "../ui/excludeURLs.ts";
import dynamicPage from "../pages/dynamic/page.ts";
import space from "../pages/space/main.ts";
import allLivePage from "../pages/live/allPage.ts";
import spaceRelation from "../pages/space/relation.ts";
import msgReply from "../pages/message/reply.ts";
import msgWhisper from "../pages/message/whisper.ts";
import topicDetail from "../pages/topicDetail.ts";

const observeNetwork = (url: string, windowUrl: string, winTitle: string, initiatorType: string): void => {
    if (!url.includes('api')) return;
    if (checkAndExcludePage(windowUrl)) {
        throw new Error('stopPerformanceObserver')
    }
    if (globalValue.bOnlyTheHomepageIsBlocked) {
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
        console.log('动态首页api加载了');
        dynamicPage.debounceCheckDynamicList()
    }
    if (url.includes('api.live.bilibili.com/xlive/web-interface/v1/second/getListByArea') ||
        url.includes('api.live.bilibili.com/xlive/web-interface/v1/second/getUserRecommend')) {
        allLivePage.checkLiveList();
    }
    if (url.includes('api.bilibili.com/x/v2/reply/reply?callback') ||
        url.includes('api.bilibili.com/x/v2/reply?callback')) {
        console.log('直播页排行榜地下的评论列表加载了')
        commentSectionModel.checkLiveRankingsCommentSectionList();
    }
    if ((url.includes("api.bilibili.com/x/relation/fans?pn=") || url.includes("api.bilibili.com/x/relation/followings"))
        && spaceRelation.isUrlPage(windowUrl)) {
        spaceRelation.userListInsertionButton()
    }
    if (url.includes("api.bilibili.com/x/msgfeed/reply") || url.includes("api.bilibili.com/x/msgfeed/at")) {
        msgReply.userListInsertionButton()
    }
    if (url.includes("api.vc.bilibili.com/session_svr/v1/session_svr/get_sessions")) {
        msgWhisper.checkLeftUserList()
    }
    if (url.includes('api.bilibili.com/x/polymer/web-dynamic/v1/feed/topic?topic_id=')) {
        topicDetail.startShielding()
    }
}

export default {
    observeNetwork
}
