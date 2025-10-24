import elUtil from "../../utils/elUtil.js";
import shielding from "../../model/shielding/shielding.js";
import defUtil from "../../utils/defUtil.js";
import sFormatUtil from '../../utils/sFormatUtil.js'
import ruleMatchingUtil from "../../utils/ruleMatchingUtil.js";
import ruleKeyListData from "../../data/ruleKeyListData.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import video_shielding from "../../model/shielding/video_shielding.js";
import {isClearLiveCardGm} from "../../data/localMKData.js";

/**
 * 判断是否为搜索页
 * @param url {string}
 */
const isSearch = (url) => {
    return url.includes("search.bilibili.com")
}

//是否是搜索视频网络请求的url
const isSearchVideoNetWorkUrl = (netUrl) => {
    //综合-综合排序
    if (netUrl.includes('api.bilibili.com/x/web-interface/wbi/search/all/v2')) return true;
    //非该接口时返回false
    if (!netUrl.includes('api.bilibili.com/x/web-interface/wbi/search/type')) return false;
    const parseUrl = defUtil.parseUrl(netUrl);
    /**
     * 判断是否为搜索网络请求的url
     * 当search_type等于
     * media_bangumi为番剧
     * media_ft为影视
     * live为直播,live_user为主播
     * article为专栏,bili_user为用户
     */
    const search_type = parseUrl.queryParams['search_type'] || null;
    return search_type === 'video';
}

//是否是搜索直播网络请求的url
const isSearchLiveRoomNetWorkUrl = (netUrl) => {
    //非该接口时返回false
    if (!netUrl.includes('api.bilibili.com/x/web-interface/wbi/search/type')) return false;
    const parseUrl = defUtil.parseUrl(netUrl);
    const search_type = parseUrl.queryParams['search_type'] || null;
    return search_type === 'live';
}

const getVideoList = async (css) => {
    const elList = await elUtil.findElements(css, {interval: 200});
    const list = [];
    const isClearLiveCard = isClearLiveCardGm();
    for (let el of elList) {
        const title = el.querySelector(".bili-video-card__info--tit").title;
        const userEl = el.querySelector(".bili-video-card__info--owner");
        if (userEl === null) {
            console.log("获取不到该视频卡片的用户地址，", el)
            el?.remove();
            continue
        }
        const userUrl = userEl.getAttribute("href");
        if (!userUrl.includes("//space.bilibili.com/")) {
            el?.remove();
            console.log("移除了非视频内容", userUrl, el);
            continue;
        }
        const videoUrl = el.querySelector(".bili-video-card__info--right>a")?.href
        if (videoUrl?.includes('live.bilibili.com/')) {
            if (isClearLiveCard) {
                console.log('移除了综合选项卡视频列表中的直播内容', title, videoUrl, el);
                el?.remove();

            }
            continue
        }
        const bv = elUtil.getUrlBV(videoUrl)
        const uid = elUtil.getUrlUID(userUrl);
        const name = userEl.querySelector(".bili-video-card__info--author").textContent.trim();
        const bili_video_card__stats_item = el.querySelectorAll('.bili-video-card__stats--item');
        let nPlayCount = bili_video_card__stats_item[0]?.textContent.trim()
        nPlayCount = sFormatUtil.toPlayCountOrBulletChat(nPlayCount)
        let nBulletChat = bili_video_card__stats_item[1]?.textContent.trim()
        nBulletChat = sFormatUtil.toPlayCountOrBulletChat(nBulletChat)
        let nDuration = el.querySelector('.bili-video-card__stats__duration')?.textContent.trim()
        nDuration = sFormatUtil.timeStringToSeconds(nDuration)
        list.push({
            title,
            userUrl,
            name,
            uid,
            bv,
            nPlayCount,
            nBulletChat,
            nDuration,
            el,
            videoUrl,
            insertionPositionEl: el.querySelector(".bili-video-card__info--bottom"),
            explicitSubjectEl: el.querySelector(".bili-video-card__info")
        })
    }
    return list;
}

/**
 * 获取综合选项卡中的综合排序下视频列表
 * 仅仅第一页有效
 * @returns {Promise<[{}]>}
 */
const getTabComprehensiveSortedVideoList = () => {
    return getVideoList(".video.i_wrapper.search-all-list>.video-list>div");
}

/**
 * 获取其他选项卡中的视频列表
 * 包括综合选项卡下的视频列表=>除综合排序之外的
 * 包括视频选项卡下的视频列表
 * @returns {Promise<[{}]>}
 */
const getOtherVideoList = () => {
    return getVideoList(".search-page.search-page-video>.video-list.row>div:not(:empty)");
}

//处理搜索页综合选项卡中的综合排序视频列表
const startShieldingCSVideoList = async () => {
    const list = await getTabComprehensiveSortedVideoList()
    for (let videoData of list) {
        video_shielding.shieldingVideoDecorated(videoData).catch(() => {
            eventEmitter.send('视频添加屏蔽按钮', {data: videoData, maskingFunc: startShieldingCSVideoList})
        })

    }
}

/**
 * 处理搜索页其他的视频列表
 */
const startShieldingOtherVideoList = async () => {
    const list = await getOtherVideoList()
    for (let videoData of list) {
        video_shielding.shieldingVideoDecorated(videoData).catch(() => {
            eventEmitter.send('视频添加屏蔽按钮', {data: videoData, maskingFunc: startShieldingOtherVideoList})
        })
    }
}

//获取搜索页的二级选项卡激活的选项
const getTwTabActiveItem = async () => {
    const twoTabActiveItem = await elUtil.findElement('.vui_button.vui_button--tab.vui_button--active.mr_sm', {interval: 200})
    //二级选项卡激活的选项
    const twoTabActiveItemLabel = twoTabActiveItem.textContent.trim()
    return {el: twoTabActiveItemLabel, label: twoTabActiveItemLabel}
}

/**
 * 开始屏蔽搜索页综合选项卡中的综合排序视频列表和搜索页其他的视频列表
 */
const startShieldingVideoList = async () => {
    const topTabActiveItem = await elUtil.findElement('.vui_tabs--nav-item.vui_tabs--nav-item-active', {interval: 200})
    //一级选项卡激活的选项
    const topTabActiveItemLabel = topTabActiveItem.textContent.trim();
    console.log(topTabActiveItemLabel)
    if (topTabActiveItemLabel !== '综合') {
        await startShieldingOtherVideoList()
        return
    }
    //二级选项卡激活的选项
    const {label} = await getTwTabActiveItem()
    if (label !== '综合排序') {
        await startShieldingOtherVideoList()
        return
    }
    const parseUrl = defUtil.parseUrl(window.location.href);
    /**
     * 当url中有page参数时，说明是搜索页的其他选项卡中的视频列表
     * 否则是搜索页综合选项卡中的第一页的综合排序视频列表
     */
    if (parseUrl.queryParams['page'] || parseUrl.queryParams['pubtime_begin_s']) {
        await startShieldingOtherVideoList()
    } else {
        await startShieldingCSVideoList()
        await processingExactSearchVideoCardContent()
    }
}

/**
 * 处理精确搜索到的视频内容
 * @returns {Promise<void>|null}
 */
const processingExactSearchVideoCardContent = async () => {
    let el = await elUtil.findElement('.user-list.search-all-list', {interval: 50, timeout: 4000})
    if (el === null) return;
    const infoCardEl = el.querySelector('.info-card');
    const userNameEl = infoCardEl.querySelector('.user-name')
    const name = userNameEl.textContent.trim()
    const userUrl = userNameEl.href
    const uid = elUtil.getUrlUID(userUrl)
    if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseUidArr(), uid)) {
        el.remove()
        eventEmitter.send('打印信息', `根据精确uid匹配到用户${name}-【${uid}】`)
        return
    }
    let fuzzyMatch = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getNameArr(), name);
    if (fuzzyMatch) {
        el.remove()
        eventEmitter.send('打印信息', `根据模糊用户名【${fuzzyMatch}】匹配到用户${name}-【${uid}】`)
        return
    }
    fuzzyMatch = ruleMatchingUtil.regexMatch(ruleKeyListData.getNameCanonical(), name)
    if (fuzzyMatch) {
        el.remove()
        eventEmitter.send('打印信息', `根据正则用户名【${fuzzyMatch}】匹配到用户${name}-【${uid}】`)
        return
    }
    const insertionPositionEl = el.querySelector('.info-card.flex_start')
    shielding.addBlockButton({
        data: {
            name,
            uid,
            insertionPositionEl,
        }
    })
    const videoElList = el.querySelectorAll('.video-list>.video-list-item');
    const list = []
    for (let videoEl of videoElList) {
        const titleEl = videoEl.querySelector('.bili-video-card__info--right>a');
        const videoUrl = titleEl.href;
        const bv = elUtil.getUrlBV(videoUrl)
        const title = titleEl.textContent.trim()
        let nDuration = videoEl.querySelector('.bili-video-card__stats__duration')?.textContent.trim()
        nDuration = sFormatUtil.timeStringToSeconds(nDuration)
        let nPlayCount = videoEl.querySelector('.bili-video-card__stats--item>span')?.textContent.trim();
        nPlayCount = sFormatUtil.toPlayCountOrBulletChat(nPlayCount)
        list.push({
            title,
            userUrl,
            name,
            uid,
            bv,
            nPlayCount,
            nDuration,
            el: videoEl,
            videoUrl
        })
    }
    for (let videoData of list) {
        video_shielding.shieldingVideoDecorated(videoData)
    }
}

//屏蔽删除底部内容
const delFooterContent = () => {
    if (!GM_getValue('isRemoveSearchBottomContent', false)) {
        return
    }
    elUtil.findElement('#biliMainFooter').then(el => {
        el.remove()
        eventEmitter.send('打印信息', '已删除底部内容')
    })
}


//搜索模块
export default {
    isSearch,
    startShieldingVideoList,
    delFooterContent,
    isSearchVideoNetWorkUrl,
    isSearchLiveRoomNetWorkUrl
}
