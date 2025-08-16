import elUtil from "../../utils/elUtil.js";
import sFormatUtil from '../../utils/sFormatUtil.js'
import shielding from "../../model/shielding/shielding.js";
import video_shielding from "../../model/shielding/video_shielding.js";

/**
 * 判断是否是新的history页面
 * @param url {string}
 * @returns boolean
 */
const isNewHistoryPage = (url) => {
    return url.includes('://www.bilibili.com/history')
}


//获取时长
const getDuration = (str) => {
    if (str === null) {
        return -1
    }
    if (str.includes('已看完') || str === '') {
        return -1
    } else {
        const match = str?.match(/\/(.*)/);
        if (match) {
            return sFormatUtil.timeStringToSeconds(match[1]);
        }
    }
    return -1
}

/**
 * 获取视频数据列表
 * @returns {Promise<[]>}
 */
const getVideoDataList = async () => {
    const elList = await elUtil.findElements('.section-cards.grid-mode>div')
    const list = [];
    for (let el of elList) {
        const titleEl = el.querySelector('.bili-video-card__title');
        const title = titleEl.textContent.trim();
        const videoUrl = titleEl.firstElementChild.href||null
        if (videoUrl?.includes('live.bilibili.com')) {
            //如果卡片为直播卡片,则不做任何处理
            continue
        }
        const bv=elUtil.getUrlBV(videoUrl)
        const userEl = el.querySelector('.bili-video-card__author');
        const cardTag = el.querySelector('.bili-cover-card__tag')?.textContent.trim() || null;
        const name = userEl.textContent.trim()
        const userUrl = userEl.href
        const uid = elUtil.getUrlUID(userUrl)
        let nDuration = -1
        if (cardTag !== '专栏') {
            nDuration = el.querySelector('.bili-cover-card__stat')?.textContent.trim() || null
            nDuration = getDuration(nDuration)
        }
        const tempEL = el.querySelector('.bili-video-card__details');
        list.push({
            title,
            videoUrl,
            name,
            userUrl,
            nDuration,
            uid,
            el,
            bv,
            insertionPositionEl: tempEL,
            explicitSubjectEl: tempEL
        })
    }
    return list
}


//遍历视频列表屏蔽视频
const startShieldingVideoList = async () => {
    const list = await getVideoDataList();
    for (let videoData of list) {
        if (video_shielding.shieldingVideoDecorated(videoData)) {
            continue;
        }
        shielding.addBlockButton({data: videoData, maskingFunc: startShieldingVideoList}, "gz_shielding_button");
    }
};

/**
 * 间隔执行屏蔽历史记录项包装函数
 * @type function
 */
const intervalExecutionStartShieldingVideo = () => {
    const res = shielding.intervalExecutionStartShieldingVideoInert(startShieldingVideoList, '历史记录项')
    return () => {
        return res
    }
}

/**
 * 执行屏蔽历史记录项
 * @type function
 */
const executionStartShieldingVideo = intervalExecutionStartShieldingVideo();

const getTopFilterLabel = async () => {
    const el = await elUtil.findElement('.radio-filter>.radio-filter__item--active')
    return el.textContent?.trim()
}

// 监听顶部筛选器
const topFilterInsertListener = () => {
    elUtil.findElement('.radio-filter').then((el => {
        el.addEventListener('click', (e) => {
            /**
             *
             * @type {Document}
             */
            const target = e.target;
            const label = target.textContent?.trim()
            console.log(`点击了${label}`)
            if (label === '直播') {
                executionStartShieldingVideo().stop()
                return
            }
            executionStartShieldingVideo().start()
        })
    }))
}


const startRun = () => {
    getTopFilterLabel().then(label => {
        if (label === '直播') {
            return
        }
        executionStartShieldingVideo().start()
    })
    topFilterInsertListener()
}


export default {
    isNewHistoryPage,
    intervalExecutionStartShieldingVideo,
    startRun
}
