import elUtil from "../../utils/elUtil.js";
import defUtil from "../../utils/defUtil.js";
import generalFuc from "./generalFuc.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import video_shielding from "../../model/shielding/video_shielding.js";

/**
 *判断是否为稍后再看播放页
 * @param url {string}
 */
const isVideoPlayWatchLaterPage = (url) => {
    return url.startsWith("https://www.bilibili.com/list/watchlater")
}

/**
 * 获取右侧推荐视频列表
 * @returns {Promise<[{}]>}
 */
const getRightVideoDataList = async () => {
    const elList = await elUtil.findElements(".recommend-video-card.video-card")
    return generalFuc.getRightVideoDataList(elList);
}


//屏蔽视频列表
const startShieldingVideoList = async () => {
    const videoList = await getRightVideoDataList();
    const css = {right: "123px"};
    for (let videoData of videoList) {
        videoData.css = css;
        if (video_shielding.shieldingVideoDecorated(videoData)) continue;
        eventEmitter.send('视频添加屏蔽按钮', {data: videoData, maskingFunc: startShieldingVideoList})
    }
}

/**
 * 开始屏蔽防抖
 * @type function
 */
const startDebounceShieldingVideoList = defUtil.debounce(startShieldingVideoList, 1000);

// 查找稍后再看列表的展开按钮，并绑定事件
const findTheExpandButtonForTheListOnTheRightAndBindTheEvent = () => {
    elUtil.findElementsAndBindEvents(".rec-footer", startDebounceShieldingVideoList);
}


//播放页(稍后再看版本)
export default {
    isVideoPlayWatchLaterPage,
    startDebounceShieldingVideoList,
    findTheExpandButtonForTheListOnTheRightAndBindTheEvent
}
