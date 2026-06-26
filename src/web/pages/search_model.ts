import elUtil from "../core/elUtil.ts";
import shielding from "../domain/shielding_main.ts";
import strFormatUtil from '../core/strFormatUtil.ts'
import ruleMatchingUtil from "../core/ruleMatchingUtil.ts";
import ruleKeyListData from "../config/ruleKeyListData.ts";
import {eventEmitter} from "../core/EventEmitter.ts";
import video_shielding from "../domain/shielding_video.ts";
import {isClearLiveCardGm} from "../state/localMKData.ts";
import urlUtil from "../core/urlUtil.ts";

/**
 * 判断是否为搜索页
 * @param url {string}
 */
const isSearch = (url: any) => {
    return url.includes("search.bilibili.com")
}

//是否是搜索视频网络请求的url
const isSearchVideoNetWorkUrl = (netUrl: any) => {
    //综合-综合排序
    if (netUrl.includes('api.bilibili.com/x/web-interface/wbi/search/all/v2')) return true;
    //非该接口时返回false
    if (!netUrl.includes('api.bilibili.com/x/web-interface/wbi/search/type')) return false;
    const parseUrl = urlUtil.parseUrl(netUrl);
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
const isSearchLiveRoomNetWorkUrl = (netUrl: any) => {
    //非该接口时返回false
    if (!netUrl.includes('api.bilibili.com/x/web-interface/wbi/search/type')) return false;
    const parseUrl = urlUtil.parseUrl(netUrl);
    const search_type = parseUrl.queryParams['search_type'] || null;
    return search_type === 'live';
}

const getVideoList = async (css: any) => {
    const elList = await elUtil.findElements(css, {interval: 200});
    const list: any[] = [];
    const isClearLiveCard = isClearLiveCardGm();
    for (let el of elList) {
        const titleEl = el.querySelector(".bili-video-card__info--tit");
        if (titleEl === null) {
            console.log("获取不到该视频卡片的标题元素，", el)
            el?.remove();
            continue
        }
        const title = titleEl.title;
        const userEl = el.querySelector(".bili-video-card__info--owner");
        if (userEl === null) {
            console.log("获取不到该视频卡片的用户地址，", el)
            el?.remove();
            continue
        }
        const userUrl = userEl.getAttribute("href");
        if (userUrl === null || !userUrl.includes("//space.bilibili.com/")) {
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
        const bv = urlUtil.getUrlBV(videoUrl ?? '')
        const uid = urlUtil.getUrlUID(userUrl ?? '');
        const authorEl = userEl.querySelector(".bili-video-card__info--author");
        const name = authorEl?.textContent?.trim() ?? '';
        const bili_video_card__stats_item = el.querySelectorAll('.bili-video-card__stats--item');
        let nPlayCount: any = bili_video_card__stats_item[0]?.textContent.trim()
        nPlayCount = strFormatUtil.toPlayCountOrBulletChat(nPlayCount)
        let nBulletChat: any = bili_video_card__stats_item[1]?.textContent.trim()
        nBulletChat = strFormatUtil.toPlayCountOrBulletChat(nBulletChat)
        let nDuration: any = el.querySelector('.bili-video-card__stats__duration')?.textContent.trim()
        nDuration = strFormatUtil.timeStringToSeconds(nDuration)
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
    if (twoTabActiveItem === null) {
        return {el: '', label: ''}
    }
    //二级选项卡激活的选项
    const twoTabActiveItemLabel = twoTabActiveItem.textContent.trim()
    return {el: twoTabActiveItemLabel, label: twoTabActiveItemLabel}
}

/**
 * 开始屏蔽搜索页综合选项卡中的综合排序视频列表和搜索页其他的视频列表
 */
const startShieldingVideoList = async () => {
    const topTabActiveItem = await elUtil.findElement('.vui_tabs--nav-item.vui_tabs--nav-item-active', {interval: 200})
    if (topTabActiveItem === null) {
        return
    }
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
    const parseUrl = urlUtil.parseUrl(window.location.href);
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
    if (infoCardEl === null) return;
    const userNameEl = infoCardEl.querySelector('.user-name')
    if (userNameEl === null) return;
    const name = userNameEl.textContent.trim()
    const userUrl = userNameEl.href
    const uid = urlUtil.getUrlUID(userUrl ?? '')
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
            insertionPositionEl: insertionPositionEl as HTMLElement,
        }
    })
    const videoElList = el.querySelectorAll('.video-list>.video-list-item');
    const list = []
    for (let videoEl of videoElList) {
        const titleEl = videoEl.querySelector('.bili-video-card__info--right>a');
        if (titleEl === null) continue;
        const videoUrl = titleEl.href ?? '';
        const bv = urlUtil.getUrlBV(videoUrl)
        const title = titleEl.textContent.trim()
        let nDuration: any = videoEl.querySelector('.bili-video-card__stats__duration')?.textContent.trim()
        nDuration = strFormatUtil.timeStringToSeconds(nDuration)
        let nPlayCount: any = videoEl.querySelector('.bili-video-card__stats--item>span')?.textContent.trim();
        nPlayCount = strFormatUtil.toPlayCountOrBulletChat(nPlayCount)
        list.push({
            title,
            userUrl,
            name,
            uid,
            bv,
            nPlayCount,
            nDuration,
            el: videoEl as HTMLElement,
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
        if (el === null) return;
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
