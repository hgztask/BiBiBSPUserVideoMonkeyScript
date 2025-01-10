import elUtil from "../../utils/elUtil.js";
import shielding from "../../model/shielding.js";
import {Tip} from "../../utils/Tip.js";
import defUtil from "../../utils/defUtil.js";
import sFormatUtil from '../../utils/sFormatUtil.js'
import ruleMatchingUtil from "../../utils/ruleMatchingUtil.js";
import ruleKeyListData from "../../data/ruleKeyListData.js";
import output_informationTab from "../../layout/output_informationTab.js";
import searchLive from "./searchLive.js";

/**
 * 判断是否为搜索页
 * @param url {string}
 */
const isSearch = (url) => {
    return url.includes("search.bilibili.com")
}

/**
 * 当前激活的选项卡
 * @returns {Promise<void>|null}
 */
const currentlyActivatedOptions = async () => {
    const el = await elUtil.findElementUntilFound('.vui_tabs--nav-item-active .vui_tabs--nav-text')
    const label = el.textContent.trim();
    if (label === '直播') {
        await searchLive.startShieldingLiveRoomList()
        searchLive.InstallLiveTopTabsListener()
        searchLive.InstallBottomPagingListener()
        elUtil.findElementUntilFound('.live-condition>.vui_button--active').then(activeEl => {
            // 当直播项中的，二级选项卡激活的选项不等于主播时，插入顶部房间排序监听器
            if (activeEl.textContent.trim() !== '主播') {
                searchLive.installTopRoomOrderListener()
            }
        })
    }
}

// 搜索顶部的选项卡安装监听器
const searchTopTabsIWrapperInstallListener = async () => {
    const tempTabs = ['番剧', '影视', '用户']
    const el = await elUtil.findElementUntilFound('.vui_tabs--navbar>ul');
    el.addEventListener("click", async (event) => {
        /**
         *
         * @type {Element|Document}
         */
        const eventTarget = event.target;
        if (eventTarget.className !== 'vui_tabs--nav-text') {
            return
        }
        const tabName = eventTarget.textContent.trim();
        if (tempTabs.includes(tabName)) {
            return
        }
        if (tabName === '直播') {
            searchLive.installTopRoomOrderListener()
            return
        }
        console.log("搜索页顶部选项卡监听器触发了", tabName)
    })
    console.log("搜索页顶部选项卡安装监听器已安装")
}

const getVideoList = async (css) => {
    const elList = await elUtil.findElementsUntilFound(css, {interval: 200});
    const list = [];
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
            Tip.infoBottomRight("移除了非视频内容");
            console.log("移除了非视频内容", userUrl, el);
            continue;
        }
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
            nPlayCount,
            nBulletChat,
            nDuration,
            el,
            videoUrl: el.querySelector(".bili-video-card__info--right>a").href,
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
    return getVideoList(".search-page.search-page-video>.video-list.row>div");
}

//处理搜索页综合选项卡中的综合排序视频列表
const startShieldingCSVideoList = async () => {
    const list = await getTabComprehensiveSortedVideoList()
    for (let videoData of list) {
        if (shielding.shieldingVideoDecorated(videoData)) {
            continue;
        }
        shielding.addVideoBlockButton({data: videoData, maskingFunc: startShieldingCSVideoList});
    }
}

/**
 * 处理搜索页其他的视频列表
 */
const startShieldingOtherVideoList = async () => {
    const list = await getOtherVideoList()
    for (let videoData of list) {
        if (shielding.shieldingVideoDecorated(videoData)) {
            continue;
        }
        shielding.addVideoBlockButton({data: videoData, maskingFunc: startShieldingOtherVideoList});
    }
}

//获取搜索页的二级选项卡激活的选项
const getTwTabActiveItem = async () => {
    const twoTabActiveItem = await elUtil.findElementUntilFound('.vui_button.vui_button--tab.vui_button--active.mr_sm', {interval: 200})
    //二级选项卡激活的选项
    const twoTabActiveItemLabel = twoTabActiveItem.textContent.trim()
    return {el: twoTabActiveItemLabel, label: twoTabActiveItemLabel}
}

/**
 * 开始屏蔽搜索页综合选项卡中的综合排序视频列表和搜索页其他的视频列表
 */
const startShieldingVideoList = async () => {
    const topTabActiveItem = await elUtil.findElementUntilFound('.vui_tabs--nav-item.vui_tabs--nav-item-active', {interval: 200})
    //一级选项卡激活的选项
    const topTabActiveItemLabel = topTabActiveItem.textContent.trim();
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
    if (parseUrl.queryParams['page']) {
        await startShieldingOtherVideoList()
    } else {
        await startShieldingCSVideoList()
        processingExactSearchVideoCardContent()
    }
}

/**
 * 处理精确搜索到的视频内容
 * @returns {Promise<void>|null}
 */
const processingExactSearchVideoCardContent = async () => {
    let el;
    try {
        el = await elUtil.findElementUntilFound('.user-list.search-all-list', {interval: 50, timeout: 4000})
    } catch (e) {
        return
    }
    const infoCardEl = el.querySelector('.info-card');
    const userNameEl = infoCardEl.querySelector('.user-name')
    const name = userNameEl.textContent.trim()
    const userUrl = userNameEl.href
    const uid = elUtil.getUrlUID(userUrl)
    if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseUidArr(), uid)) {
        el.remove()
        Tip.successBottomRight('屏蔽到用户')
        output_informationTab.addInfo(`根据精确uid匹配到用户${name}-【${uid}】`)
        return
    }
    let fuzzyMatch = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getNameArr(), name);
    if (fuzzyMatch) {
        el.remove()
        Tip.infoBottomRight('屏蔽到用户')
        output_informationTab.addInfo(`根据模糊用户名【${fuzzyMatch}】匹配到用户${name}-【${uid}】`)
        return
    }
    fuzzyMatch = ruleMatchingUtil.regexMatch(ruleKeyListData.getNameCanonical(), name)
    if (fuzzyMatch) {
        el.remove()
        Tip.infoBottomRight('屏蔽到用户')
        output_informationTab.addInfo(`根据正则用户名【${fuzzyMatch}】匹配到用户${name}-【${uid}】`)
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
            nPlayCount,
            nDuration,
            el: videoEl,
            videoUrl
        })
    }
    for (let videoData of list) {
        shielding.shieldingVideoDecorated(videoData)
    }
}


//搜索模块
export default {
    isSearch,
    searchTopTabsIWrapperInstallListener,
    startShieldingVideoList,
    currentlyActivatedOptions
}
