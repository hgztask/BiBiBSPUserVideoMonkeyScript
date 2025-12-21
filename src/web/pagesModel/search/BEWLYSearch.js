import BEWLYCommon from "../home/BEWLYCommon.js";
import elUtil from "../../utils/elUtil.js";
import strFormatUtil from "../../utils/strFormatUtil.js";
import video_shielding from "../../model/shielding/video_shielding.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import defUtil from "../../utils/defUtil.js";
import {IntervalExecutor} from "../../model/IntervalExecutor.js";
import shielding from "../../model/shielding/shielding.js";
import live_shielding from "../../model/shielding/live_shielding.js";
import urlUtil from "../../utils/urlUtil.js";

const getVideoList = async () => {
    const be_wly_el = await BEWLYCommon.getBewlyEl()
    const elList = await elUtil.findElements('.grid-adaptive>.video-card-container', {doc: be_wly_el})
    const list = [];
    for (const el of elList) {
        if (el.getAttribute("bg") === "") {
            continue;
        }
        const titleEl = el.querySelector('h3>a')
        const nameEl = el.querySelector('a.channel-name')
        const viewEl = el.querySelector('.cover-stat-view>span')
        const danmakuEl = el.querySelector('.cover-stat-danmaku>span');
        const durationEl = el.querySelector(".video-card-cover-stats__item--duration>span");
        const title = titleEl.title.trim();
        const videoUrl = titleEl.href;
        const bv = elUtil.getUrlBV(videoUrl)
        const userUrl = nameEl.href;
        const uid = elUtil.getUrlUID(userUrl)
        const name = nameEl.textContent.trim()
        const nDuration = strFormatUtil.timeStringToSeconds(durationEl.textContent.trim());
        const nPlayCount = strFormatUtil.toPlayCountOrBulletChat(viewEl.textContent.trim())
        let bulletChat = -1;
        if (danmakuEl) {
            bulletChat = strFormatUtil.toPlayCountOrBulletChat(danmakuEl.textContent.trim())
        }
        let explicitSubjectEl;
        explicitSubjectEl = el.querySelector('.vertical-card-cover+div');
        if (explicitSubjectEl === null) {
            explicitSubjectEl = el
        }
        const insertionPositionEl = nameEl.parentElement;
        list.push({
            title, name, uid, bv, userUrl, videoUrl, nPlayCount, bulletChat, nDuration, el,
            insertionPositionEl, explicitSubjectEl
        })
    }
    return list
}

//检查搜索页视频列表
const checkSearchVideoList = async () => {
    const list = await getVideoList();
    for (let v of list) {
        video_shielding.shieldingVideoDecorated(v).catch(() => {
            eventEmitter.send('视频添加屏蔽按钮', {data: v, maskingFunc: checkSearchVideoList})
        })
    }
}

const searchVideoListIntervalExecutor = new IntervalExecutor(checkSearchVideoList, {
    processTips: true, intervalName: "bewly搜索页视频列表", timeout: 1000
});

const userListInstallAddButton = async () => {
    const be_wly_el = await BEWLYCommon.getBewlyEl()
    const gridEls = be_wly_el.querySelectorAll(".user-grid>a,.live-search-page a.user-card");
    for (let el of gridEls) {
        const nameEl = el.querySelector('.username')
        const userUrl = el.href;
        const name = nameEl.textContent.trim();
        const uid = elUtil.getUrlUID(userUrl);
        const insertionPositionEl = el.querySelector('[flex*="col"]>[items-center]:last-child');
        shielding.addBlockButton({data: {uid, name, userUrl, el, insertionPositionEl, explicitSubjectEl: el}})
    }
}

/**
 * bewly插件中的搜索页用户列表仅做添加屏蔽按钮，不做移除屏蔽操作
 * 包括直播选项卡中二级选项卡主播列表
 * @type {IntervalExecutor}
 */
const searchUserListIntervalExecutor = new IntervalExecutor(userListInstallAddButton, {
    processTips: true, intervalName: "bewly搜索页用户or主播列表", timeout: 1500,
});

const searchLiveListIntervalExecutor = new IntervalExecutor(async () => {
    const be_wly_el = await BEWLYCommon.getBewlyEl()
    const list = []
    for (let el of be_wly_el.querySelectorAll(".grid-adaptive>.video-card-container")) {
        const liveUrlAEl = el.querySelector('a[href^="https://live.bilibili.com/"]')
        const userAEl = el.querySelector('a.channel-name')
        const partitionEl = el.querySelector('.video-card-meta__chip')
        const explicitSubjectEl = el.querySelector('.vertical-card-cover+div');
        const liveUrl = liveUrlAEl.href
        const title = liveUrlAEl.querySelector('h3').title
        const userUrl = userAEl.href
        const uid = elUtil.getUrlUID(userUrl)
        const name = userAEl.textContent.trim();
        const partition = partitionEl.textContent.trim();
        const roomId = urlUtil.getUrlRoomId(liveUrl)
        list.push({
            title, liveUrl, name, userUrl, uid, roomId,
            el, partition, explicitSubjectEl, insertionPositionEl: userAEl.parentElement
        })
    }
    for (let v of list) {
        if (live_shielding.shieldingLiveRoomDecorated(v)) continue;
        shielding.addBlockButton({data: v})
    }
}, {
    processTips: true, intervalName: "bewly搜索页直播列表", timeout: 1500,
});

export default {
    isUrlPage(url, title) {
        return url.startsWith("https://www.bilibili.com/?page=SearchResults") &&
            title.includes('- 搜索结果 - 哔哩哔哩')
    },
    run(url) {
        const parseUrl = defUtil.parseUrl(url);
        const {category, search_type = null} = parseUrl.queryParams;
        if (category === "all" || category === "video") {
            searchVideoListIntervalExecutor.start()
        } else {
            searchVideoListIntervalExecutor.stop()
        }
        if (category === "user" ||
            (category === "live" && search_type === "live_user")) {
            searchUserListIntervalExecutor.start()
        } else {
            searchUserListIntervalExecutor.stop()
        }
        if (category === "live") {
            if (search_type === null) {
                userListInstallAddButton()
            }
            if (search_type === null || search_type === "live_room") {
                searchLiveListIntervalExecutor.start()
            } else {
                searchLiveListIntervalExecutor.stop()
            }
        }
    }
}