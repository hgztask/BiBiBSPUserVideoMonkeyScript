import elUtil from "../../utils/elUtil.js";
import sFormatUtil from '../../utils/sFormatUtil.js'
import {eventEmitter} from "../../model/EventEmitter.js";
import video_shielding from "../../model/shielding/video_shielding.js";

/**
 * 获取视频列表
 * 获取综合热门页面和热门中的每周必看页面
 * @param isWeekly {boolean} 是否是每周必看页面
 * @returns {Promise<*[]>}
 */
const getVideDataList = async (isWeekly = false) => {
    const css = isWeekly ? ".video-list>.video-card" : ".card-list>.video-card";
    const elList = await elUtil.findElementsUntilFound(css);
    const list = [];
    for (let el of elList) {
        const videoCardInfoEl = el.querySelector(".video-card__info");
        const title = videoCardInfoEl.querySelector(".video-name").title.trim();
        const name = videoCardInfoEl.querySelector(".up-name__text").title;
        const videoUrl = el.querySelector('.video-card__content>a')?.href || null;
        const bv = elUtil.getUrlBV(videoUrl);
        let nPlayCount = el.querySelector('.play-text').textContent.trim()
        nPlayCount = sFormatUtil.toPlayCountOrBulletChat(nPlayCount)
        let nBulletChat = el.querySelector('.like-text').textContent.trim()
        nBulletChat = sFormatUtil.toPlayCountOrBulletChat(nBulletChat)
        list.push({
            el,
            title,
            name,
            videoUrl,
            bv,
            nPlayCount,
            nBulletChat,
            insertionPositionEl: videoCardInfoEl.querySelector("div"),
            explicitSubjectEl: videoCardInfoEl
        })
    }
    return list;
}

/**
 * 屏蔽热门中综合热门视频
 * 也可用于每周必看页面
 * @param isWeekly {boolean} 是否是每周必看页面
 * @returns {Promise<void>}
 */
const startShieldingVideoList = async (isWeekly = false) => {
    const list = await getVideDataList(isWeekly);
    for (let videoData of list) {
        if (video_shielding.shieldingVideoDecorated(videoData)) {
            continue;
        }
        eventEmitter.send('添加热门视频屏蔽按钮', {data: videoData, maskingFunc: startShieldingVideoList})
    }
}


export default {
    startShieldingVideoList
}
