import elUtil from "../../utils/elUtil.js";
import defUtil from "../../utils/defUtil.js";
import sFormatUtil from '../../utils/sFormatUtil.js'
import {eventEmitter} from "../../model/EventEmitter.js";
import video_shielding from "../../model/shielding/video_shielding.js";
import globalValue from "../../data/globalValue.js";

// 判断是否是首页
const isHome = (url, title) => {
    if (title !== "哔哩哔哩 (゜-゜)つロ 干杯~-bilibili") {
        return false
    }
    if (url === 'https://www.bilibili.com/') {
        return true
    }
    return url.includes('https://www.bilibili.com/?spm_id_from=')
}

// 删除下载提示
const deDesktopDownloadTipEl = async () => {
    const el = await elUtil.findElementUntilFound(".desktop-download-tip")
    el?.remove();
    const log = "已删除下载提示";
    console.log(log, el);
}

/**
 * 获取视频数据
 * @param el
 * @returns {{title, userUrl, name, uid, videoUrl, nPlayCount, nBulletChat, nDuration}}
 */
const getVideoData = (el) => {
    const title = el.querySelector(".bili-video-card__info--tit").title;
    const name = el.querySelector(".bili-video-card__info--author").textContent.trim();
    let nPlayCount = el.querySelector('.bili-video-card__stats--text')?.textContent.trim()
    nPlayCount = sFormatUtil.toPlayCountOrBulletChat(nPlayCount)
    let nBulletChat = el.querySelector('.bili-video-card__stats--text')?.textContent.trim()
    nBulletChat = sFormatUtil.toPlayCountOrBulletChat(nBulletChat)
    let nDuration = el.querySelector('.bili-video-card__stats__duration')?.textContent.trim()
    nDuration = sFormatUtil.timeStringToSeconds(nDuration)
    const userUrl = el.querySelector(".bili-video-card__info--owner").getAttribute("href");
    const uid = elUtil.getUrlUID(userUrl);
    return {
        title,
        name,
        uid,
        nPlayCount,
        nBulletChat,
        nDuration,
        userUrl
    }
}

//首页中的视频列表，包括换一换中的视频列表
const getHomeVideoELList = async () => {
    const elList = await elUtil.findElementsUntilFound(".container.is-version8>.feed-card,.container.is-version8>.bili-feed-card");
    let list = [];
    for (let el of elList) {
        try {
            const tempData = getVideoData(el);
            const {userUrl} = tempData
            //过滤非视频内容
            if (!userUrl.includes("//space.bilibili.com/")) {
                el?.remove();
                const log = "遍历换一换视频列表下面列表时检测到异常内容，已将该元素移除";
                eventEmitter.send('打印信息', log)
                console.log(log, el);
                continue;
            }

            const videoUrl = el.querySelector(".bili-video-card__info--tit>a")?.href
            const items = {
                ...tempData, ...{
                    videoUrl,
                    el,
                    insertionPositionEl: el.querySelector(".bili-video-card__info--bottom"),
                    explicitSubjectEl: el.querySelector(".bili-video-card__info")
                }
            };
            if (videoUrl?.includes('www.bilibili.com/video')) {
                items.bv = elUtil.getUrlBV(videoUrl)
            }

            list.push(items)
        } catch (e) {
            el?.remove();
            console.log("遍历视频列表中检测到异常内容，已将该元素移除;");
        }
    }
    return list;
}

/**
 * 每秒检测清理首页中视频列表里多余的内容，如直播，番剧推荐等
 */
const startClearExcessContentList = () => {
    //如果开启适配BAppcommerce脚本，则不执行此功能
    if (globalValue.adaptationBAppCommerce) return;
    //每秒清理一次
    setInterval(() => {
        const otherElList = document.querySelectorAll(".floor-single-card");
        const liveList = document.querySelectorAll(".bili-live-card")
        const elList = [...otherElList, ...liveList]
        //右侧大卡片的广告
        let rightAdEl = document.querySelector('.adcard');
        if (rightAdEl) {
            elList.push(rightAdEl)
        }
        //右侧小卡片的广告
        rightAdEl = document.querySelector('.fixed-card');
        if (rightAdEl) {
            elList.push(rightAdEl)
        }
        for (let el of elList) {
            el?.remove();
            console.log("已清理首页视频列表中多余的内容，直播选项卡，右侧大卡片广告，右侧小卡片广告等", el)
        }
    }, 1000);
    console.log("已启动每秒清理首页视频列表中多余的内容");
}

//开始屏蔽首页中的视频列表
const startShieldingHomeVideoList = async () => {
    const homeVideoELList = await getHomeVideoELList();
    for (const videoData of homeVideoELList) {
        if (video_shielding.shieldingVideoDecorated(videoData)) {
            continue;
        }
        eventEmitter.send('视频添加屏蔽按钮', {data: videoData, maskingFunc: startShieldingHomeVideoList})
    }
}

/**
 * 屏蔽首页中换一换下面的视频列表的防抖
 * @type function
 */
const startDebounceShieldingHomeVideoList = defUtil.debounce(startShieldingHomeVideoList, 500);

/**
 * 模拟鼠标上下滚动
 * @returns {Promise<>}
 */
const scrollMouseUpAndDown = async () => {
    //如果开启适配BAppcommerce脚本，则不执行此功能
    if (globalValue.adaptationBAppCommerce) return;
    await defUtil.smoothScroll(false, 100);
    return defUtil.smoothScroll(true, 600);
}

//b站首页相关辅助逻辑
export default {
    isHome,
    startClearExcessContentList,
    startDebounceShieldingHomeVideoList,
    scrollMouseUpAndDown,
    deDesktopDownloadTipEl,
    getVideoData
}
