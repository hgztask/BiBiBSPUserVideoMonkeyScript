import bilibiliHome from "../pagesModel/home/bilibiliHome.js";
import commentSectionModel from "../pagesModel/commentSectionModel.js";
import popularAll from "../pagesModel/popular/popularAll.js";
import dynamic from "../pagesModel/space/dynamic.js";
import liveSectionModel from "../pagesModel/live/liveSectionModel.js";
import liveHome from "../pagesModel/live/liveHome.js";
import localMKData from "../data/localMKData.js";

// 是否只屏蔽首页
const bOnlyTheHomepageIsBlocked = localMKData.getBOnlyTheHomepageIsBlocked();

// 是否兼容BewlyBewly插件
const compatible_BEWLY_BEWLY = localMKData.isCompatible_BEWLY_BEWLY()
/**
 * 监听网络请求
 * @param url {string} 请求的url
 * @param windowUrl {string} 窗口的url
 * @param winTitle {string} 窗口的标题
 * @param initiatorType {string} 请求发起者类型
 */
const observeNetwork = (url, windowUrl,winTitle, initiatorType) => {
    if (bOnlyTheHomepageIsBlocked) {
        if (!bilibiliHome.isHome(windowUrl, winTitle)) {
            //如果开启了只屏蔽首页，且当前窗口不是首页，就直接返回
            return;
        }
    }
    if (url.startsWith("https://api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd?web_location=")) {
        if (compatible_BEWLY_BEWLY) {
            return;
        }
        bilibiliHome.startDebounceShieldingChangeVideoList();
        bilibiliHome.startDebounceShieldingHomeVideoList();
        console.log("检测到首页加载了换一换视频列表和其下面的视频列表")
        return;
    }
    if (url.startsWith("https://api.bilibili.com/x/v2/reply/wbi/main?oid=")) {
        console.log("检测到评论区楼主评论加载了");
        commentSectionModel.startShieldingComments();
        return;
    }
    if (url.startsWith("https://api.bilibili.com/x/v2/reply/reply?oid=")) {
        console.log("检测到评论区楼主层中的子层评论列表加载了");
        commentSectionModel.startShieldingComments();
    }
    if (url.startsWith("https://api.bilibili.com/x/web-interface/popular?ps=")) {
        popularAll.startShieldingVideoList();
    }
    if (url.startsWith("https://api.bilibili.com/x/web-interface/popular/series/one?number=")) {
        popularAll.startShieldingVideoList(true);
    }
    if (url.startsWith("https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?offset=")) {
        console.log("检测到用户动态加载了");
        dynamic.startThrottleShieldingDynamicContent();
    }
    if (url.startsWith("https://api.live.bilibili.com/xlive/web-interface/v1/second/getList?platform=web&parent_area_id=")) {
        console.log("检测到直播间加载了分区下的房间列表");
        liveSectionModel.startShieldingLiveRoom();
    }
    if (url.startsWith("https://api.live.bilibili.com/xlive/web-interface/v1/index/getList?platform=web")) {
        console.log("检测到直播间加载了推荐房间列表");
        liveHome.startShieldingLiveRoom();
    }
}

export default {
    observeNetwork
}
