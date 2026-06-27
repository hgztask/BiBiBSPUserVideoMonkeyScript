import elUtil from "../../core/util/elUtil.ts";
import {eventEmitter} from "@/core/EventEmitter.ts";
import video_shielding from "../../domain/shielding/video.ts";
import urlUtil from "../../core/util/urlUtil.ts";

/**
 * 判断页面是否是旧版历史记录页面
 * @param url {string}
 * @returns {boolean}
 */
const isOldHistory = (url: any) => {
    return url.includes('https://www.bilibili.com/account/history')
};

/**
 * 获取视频数据列表
 * @returns {Promise<[{}]>}
 */
const getVideoDataList = async () => {
    const elList = await elUtil.findElements('#history_list>.history-record')
    const list: any[] = [];
    for (let el of elList) {
        const labelEL = el.querySelector('.cover-contain>.label');
        if (labelEL !== null) {
            const label = labelEL.textContent.trim()
            console.log(`排除${label}`)
            continue
        }
        const titleEl = el.querySelector('.title')
        const userEl = el.querySelector('.w-info>span>a');
        if (titleEl === null || userEl === null) {
            continue
        }
        const title = titleEl.textContent?.trim() ?? '';
        const videoUrl = titleEl.href ?? '';
        const bv = urlUtil.getUrlBV(videoUrl)
        const name = userEl.textContent?.trim() ?? '';
        const userUrl = userEl.href ?? '';
        const uid = urlUtil.getUrlUID(userUrl)
        list.push({
            title,
            videoUrl,
            name,
            userUrl,
            uid,
            el,
            bv,
            explicitSubjectEl: el.querySelector('.r-txt'),
            insertionPositionEl: el.querySelector('.subtitle')
        })
    }
    return list
}

const startShieldingVideo = async () => {
    console.log('开始屏蔽旧版历史记录视频列表')
    const list = await getVideoDataList()
    const css = {right: "45px"}
    for (let videoData of list) {
        video_shielding.shieldingVideoDecorated(videoData).catch(() => {
            videoData.cssMap = css
            eventEmitter.send('视频添加屏蔽按钮', {data: videoData, maskingFunc: startShieldingVideo})
        })
    }
    console.log('屏蔽旧版历史记录视频列表完成')
}

//间隔执行屏蔽旧版历史记录视频列表
const intervalExecutionStartShieldingVideo = () => {
    setInterval(startShieldingVideo, 2000)
}

export default {
    isOldHistory,
    intervalExecutionStartShieldingVideo
}
