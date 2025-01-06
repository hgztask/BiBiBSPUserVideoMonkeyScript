import elUtil from "../utils/elUtil.js";
import shielding from "../model/shielding.js";
import {Tip} from "../utils/Tip.js";
import defUtil from "../utils/defUtil.js";
import sFormatUtil from '../utils/sFormatUtil.js'


/**
 * 判断是否为搜索页
 * @param url {string}
 */
const isSearch = (url) => {
    return url.includes("search.bilibili.com")
}

const getVideoList = async (css) => {
    const elList = await elUtil.findElementsWithTimeout(css);
    const list = [];
    for (let el of elList) {
        const title = el.querySelector(".bili-video-card__info--tit").title;
        const userEl = el.querySelector(".bili-video-card__info--owner");
        let userUrl='';
        try {
            userUrl = userEl.getAttribute("href");
        } catch (e) {
            console.error(e);
        }
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


/**
 * 开始屏蔽搜索页综合选项卡中的综合排序视频列表和搜索页其他的视频列表
 */
const startShieldingVideoList = () => {
    //处理搜索页综合选项卡中的综合排序视频列表
    getTabComprehensiveSortedVideoList().then(list => {
        for (let videoData of list) {
            if (shielding.shieldingVideoDecorated(videoData)) {
                continue;
            }
            shielding.addVideoBlockButton({data: videoData, maskingFunc: startShieldingVideoList});
        }
        console.log("搜索页综合选项卡中的综合排序视频列表已处理完成")
    });
    //处理搜索页其他的视频列表
    getOtherVideoList().then(list => {
        for (let videoData of list) {
            if (shielding.shieldingVideoDecorated(videoData)) {
                continue;
            }
            shielding.addVideoBlockButton({data: videoData, maskingFunc: startShieldingVideoList});
        }
    });
}


/**
 *
 * @type function
 */
const startDebounceShieldingVideoList = defUtil.debounce(startShieldingVideoList, 500);


//搜索模块
export default {
    isSearch,
    startDebounceShieldingVideoList
}
