import elUtil from "../utils/elUtil.js";
import shielding from "../model/shielding.js";
import {Tip} from "../utils/Tip.js";
import defUtil from "../utils/defUtil.js";
import localMKData from "../data/localMKData.js";


// 判断是否是首页
const isHome = (url, title) => {
    if (title !== "哔哩哔哩 (゜-゜)つロ 干杯~-bilibili") {
        return false
    }
    if (url === 'https://www.bilibili.com/') {
        return true
    }
    return url === 'https://www.bilibili.com/?spm_id_from=333.1007.0.0'
}

// 是否适配BAppcommerce脚本
const adaptationBAppCommerce = localMKData.getAdaptationBAppCommerce();


// 删除下载提示
const deDesktopDownloadTipEl = async () => {
    const el = await elUtil.findElementUntilFound(".desktop-download-tip")
    el?.remove();
    const log = "已删除下载提示";
    Tip.infoBottomRight(log);
    console.log(log, el);
}


/**
 * //首页中的换一换区域视频列表
 * @returns {Promise<[]>}
 * @type function
 */
const getChangeTheVideoElList = async () => {
    const elList = await elUtil.findElementsUntilFound(".container.is-version8>.feed-card")
    const list = [];
    for (let el of elList) {
        try {
            const title = el.querySelector(".bili-video-card__info--tit").title;
            const userUrl = el.querySelector(".bili-video-card__info--owner").getAttribute("href");
            const videoUrl = el.querySelector(".bili-video-card__info--tit>a").href;
            //过滤非视频内容
            if (!userUrl.includes("//space.bilibili.com/")) {
                el?.remove();
                const log = "遍历换一换视频列表中检测到异常内容，已将该元素移除";
                Tip.infoBottomRight(log);
                console.log(log, el);
                continue;
            }
            const uid = elUtil.getUrlUID(userUrl);
            const name = el.querySelector(".bili-video-card__info--author").textContent.trim();
            list.push({
                title,
                userUrl,
                name,
                uid,
                videoUrl,
                el,
                insertionPositionEl: el.querySelector(".bili-video-card__info--bottom"),
                explicitSubjectEl: el.querySelector(".bili-video-card__info.__scale-disable")
            });
        } catch (e) {
            el.remove();
            Qmsg.error("获取视频信息失败");
        }
    }
    return list
}

//首页中的视频列表，不包括换一换中的视频列表
const getHomeVideoELList = async () => {
    const elList = await elUtil.findElementsUntilFound(".container.is-version8>.bili-video-card");
    let list = [];
    for (let el of elList) {
        try {
            const title = el.querySelector(".bili-video-card__info--tit").title;
            const userUrl = el.querySelector(".bili-video-card__info--owner").getAttribute("href");
            //过滤非视频内容
            if (!userUrl.includes("//space.bilibili.com/")) {
                el?.remove();
                const log = "遍历换一换视频列表下面列表时检测到异常内容，已将该元素移除";
                Tip.infoBottomRight(log);
                console.log(log, el);
                continue;
            }
            const uid = elUtil.getUrlUID(userUrl);
            const name = el.querySelector(".bili-video-card__info--author").textContent.trim();
            list.push({
                title,
                userUrl,
                name,
                uid,
                videoUrl: el.querySelector(".bili-video-card__info--tit>a").href,
                el,
                insertionPositionEl: el.querySelector(".bili-video-card__info--bottom"),
                explicitSubjectEl: el.querySelector(".bili-video-card__info.__scale-disable")
            })
        } catch (e) {
            el?.remove();
            Tip.infoBottomRight("遍历视频列表中检测到异常内容，已将该元素移除;")
        }
    }
    return list;
}


/**
 * 获取Bilibili-Gate脚本下的首页其脚本自带的激活的选项卡
 * @returns {Promise<string>}
 */
const getGateActivatedTab = async () => {
    const el = await elUtil.findElementUntilFound(".ant-radio-group>.ant-radio-button-wrapper-checked .css-1k4kcw8")
    return el?.textContent.trim();
}


/**
 * 获取Bilibili-Gate脚本下的首页视频列表
 * @returns {Promise<[{}]>}
 */
const getGateDataList = async () => {
    const elList = await elUtil.findElementsUntilFound(".bilibili-gate-video-grid>[data-bvid].bili-video-card")
    const list = [];
    for (let el of elList) {
        const videoUrl = el.querySelector("a.css-feo88y").href;
        const name = el.querySelector(".bili-video-card__info--author").textContent.trim();
        const title = el.querySelector(".bili-video-card__info--tit").textContent.trim();
        const insertionPositionEl = el.querySelector(".bili-video-card__info--owner");
        const userUrl = insertionPositionEl.href;
        const uid = elUtil.getUrlUID(userUrl);
        list.push({
            title,
            userUrl,
            name,
            uid,
            videoUrl,
            el,
            insertionPositionEl,
            explicitSubjectEl: el
        })
    }
    return list;
}

const startShieldingGateVideoList = async () => {
    const list = await getGateDataList()
    for (let videoData of list) {
        if (shielding.shieldingVideoDecorated(videoData,"hide")) {
            continue;
        }
        shielding.addVideoBlockButton({data: videoData, maskingFunc: startShieldingGateVideoList});
    }
}

/**
 * 每秒检测是否需要屏蔽首页中视频列表(适配BAppcommerce脚本)
 */
const startIntervalShieldingGateVideoList = () => {
    const throttle = defUtil.throttle(startShieldingGateVideoList, 2000);
    setInterval(async () => {
        const tabName = await getGateActivatedTab();
        throttle();
    }, 1500);
}


/**
 * 每秒检测清理首页中视频列表里多余的内容，如直播，番剧推荐等
 */
const startClearExcessContentList = () => {
    //如果开启适配BAppcommerce脚本，则不执行此功能
    if (adaptationBAppCommerce) return;
    //每秒清理一次
    setInterval(() => {
        const otherElList = document.querySelectorAll(".floor-single-card");
        const liveList = document.querySelectorAll(".bili-live-card")
        const elList = [...otherElList, ...liveList]
        for (let el of elList) {
            el?.remove();
        }
    }, 1000);
    console.log("已启动每秒清理首页视频列表中多余的内容");
}


//开始屏蔽换一换的视频
const startShieldingChangeVideoList = async () => {
    const list = await getChangeTheVideoElList();
    for (let videoData of list) {
        if (shielding.shieldingVideoDecorated(videoData)) {
            continue;
        }
        shielding.addVideoBlockButton({data: videoData, maskingFunc: startShieldingChangeVideoList});
    }
}

/**
 * 屏蔽换一换视频列表的防抖
 * @type function
 */
const startDebounceShieldingChangeVideoList = defUtil.debounce(startShieldingChangeVideoList, 200);

//开始屏蔽首页中换一换下面的视频列表
const startShieldingHomeVideoList = async () => {
    const homeVideoELList = await getHomeVideoELList();
    for (const videoData of homeVideoELList) {
        if (shielding.shieldingVideoDecorated(videoData)) {
            continue;
        }
        shielding.addVideoBlockButton({data: videoData, maskingFunc: startShieldingHomeVideoList});
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
    if (adaptationBAppCommerce) return;
    await defUtil.smoothScroll(false, 100);
    return defUtil.smoothScroll(true, 600);
}

//b站首页相关辅助逻辑
export default {
    isHome,
    startClearExcessContentList,
    startDebounceShieldingChangeVideoList,
    startDebounceShieldingHomeVideoList,
    scrollMouseUpAndDown,
    deDesktopDownloadTipEl,
    startIntervalShieldingGateVideoList
}
