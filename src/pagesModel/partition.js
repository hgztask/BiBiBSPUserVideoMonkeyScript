import elUtil from "../utils/elUtil.js";
import sFormatUtil from "../utils/sFormatUtil.js"
import defUtil from "../utils/defUtil.js";
import {eventEmitter} from "../model/EventEmitter.js";
import video from "../model/shielding/video.js";

/**
 *判断url是否是分区页面
 * @param url {string}
 */
const isPartition = (url) => {
    return url.includes('www.bilibili.com/v/');
}

/**
 * 获取这几天热门视频榜列表
 * 页面html暂时未有uid等其他关键字段信息
 * 只获取到videoUrl、title、bv号
 * @returns {Promise<[]>}
 */
const getHotVideoDayList = async () => {
    const elList = await elUtil.findElementsUntilFound('.bili-rank-list-video__item')
    const list = []
    for (let el of elList) {
        let videoUrlEl = el.querySelector('a.rank-video-card');
        const titleEl = el.querySelector('.rank-video-card__info--tit')
        const videoUrl = videoUrlEl.href;
        const title = titleEl.textContent.trim();
        const bv = elUtil.getUrlBV(videoUrl)
        list.push({
            title, videoUrl, bv, el
        })
    }
    return list
}

/**
 * 获取视频列表
 * @returns {Promise<[]>}
 */
const getVideoDataList = async () => {
    const elList = await elUtil.findElementsUntilFound('.bili-video-card')
    const list = []
    const oneTitleEl = elList[0].querySelector('.bili-video-card__info--tit>a')
    if (oneTitleEl === null) {
        await defUtil.wait()
        return await getVideoDataList()
    }
    for (let el of elList) {
        const titleEl = el.querySelector('.bili-video-card__info--tit>a')
        if (titleEl === null) {
            continue
        }
        const userEl = el.querySelector('a.bili-video-card__info--owner')
        const playAndDmu = el.querySelectorAll('.bili-video-card__stats--item>span')
        let nDuration = el.querySelector('.bili-video-card__stats__duration')?.textContent.trim()
        let nPlayCount = playAndDmu[0]?.textContent.trim()
        nPlayCount = sFormatUtil.toPlayCountOrBulletChat(nPlayCount)
        let nBulletChat = playAndDmu[1]?.textContent.trim()
        nBulletChat = sFormatUtil.toPlayCountOrBulletChat(nBulletChat)
        nDuration = sFormatUtil.toPlayCountOrBulletChat(nDuration)
        const title = titleEl.textContent.trim()
        const videoUrl = titleEl.href;
        const userUrl = userEl.href
        const name = userEl
            .querySelector('.bili-video-card__info--author')
            ?.textContent.trim() || null;
        const uid = elUtil.getUrlUID(userUrl)
        const bv = elUtil.getUrlBV(videoUrl)
        list.push({
            name, title, uid, bv, userUrl, videoUrl, el,
            nPlayCount, nBulletChat, nDuration,
            explicitSubjectEl: el.querySelector('.bili-video-card__info'),
            insertionPositionEl: el.querySelector('.bili-video-card__info--bottom')
        })
    }
    return list
}

//屏蔽专区视频列表
const shieldingVideoList = async () => {
    const list = await getVideoDataList()
    for (let videoData of list) {
        if (video.shieldingVideoDecorated(videoData)) {
            continue
        }
        eventEmitter.send('视频添加屏蔽按钮', {data: videoData, maskingFunc: shieldingVideoList})
    }
}

//开始屏蔽这几天热门视频榜列表
const startShieldingHotVideoDayList = async () => {
    const list = await getHotVideoDayList()
    for (let videoData of list) {
        video.shieldingVideoDecorated(videoData)
    }
}

/**
 * 开始定时屏蔽视频列表
 */
const startIntervalShieldingVideoList = () => {
    setInterval(async () => {
        await shieldingVideoList()
    }, 1500)
}

//分区页面处理模块
export default {
    isPartition,
    startIntervalShieldingVideoList,
    startShieldingHotVideoDayList
}
