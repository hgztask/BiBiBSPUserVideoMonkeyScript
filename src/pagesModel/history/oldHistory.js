import elUtil from "../../utils/elUtil.js";
import shielding from "../../model/shielding.js";

/**
 * 判断页面是否是旧版历史记录页面
 * @param url {string}
 * @returns {boolean}
 */
const isOldHistory = (url) => {
    return url.includes('https://www.bilibili.com/account/history')
};

/**
 * 获取视频数据列表
 * @returns {Promise<[{}]>}
 */
const getVideoDataList = async () => {
    const elList = await elUtil.findElementsUntilFound('#history_list>.history-record')
    const list = [];
    for (let el of elList) {
        const labelEL = el.querySelector('.cover-contain>.label');
        if (labelEL !== null) {
            const label = labelEL.textContent.trim()
            console.log(`排除${label}`)
            continue
        }
        const titleEl = el.querySelector('.title')
        const userEl = el.querySelector('.w-info>span>a');
        const title = titleEl.textContent.trim();
        const videoUrl = titleEl.href;
        const name = userEl.textContent.trim();
        const userUrl = userEl.href;
        const uid = elUtil.getUrlUID(userUrl)
        list.push({
            title,
            videoUrl,
            name,
            userUrl,
            uid,
            el,
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
        if (shielding.shieldingVideoDecorated(videoData)) {
            continue;
        }
        videoData.css = css
        shielding.addVideoBlockButton({data: videoData, maskingFunc: startShieldingVideo});
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
