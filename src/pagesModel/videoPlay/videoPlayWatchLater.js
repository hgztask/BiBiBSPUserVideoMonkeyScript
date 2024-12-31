import elUtil from "../../utils/elUtil.js";
import shielding from "../../model/shielding.js";
import defUtil from "../../utils/defUtil.js";
import sFormatUtil from '../../utils/sFormatUtil.js'
import generalFuc from "./generalFuc.js";

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
    const elList = await elUtil.findElementsUntilFound(".recommend-video-card.video-card")
    const list = []
    for (let el of elList) {
        const title = el.querySelector(".title").textContent.trim();
        const userInfoEl = el.querySelector(".upname");
        const name = userInfoEl.querySelector(".name").textContent.trim();
        const userUrl = userInfoEl.href;
        const uid = elUtil.getUrlUID(userUrl);

        list.push({
            ...generalFuc.getPlayCountAndBulletChatAndDuration(el), ...{
                title,
                name,
                userUrl,
                videoUrl: el.querySelector(".info>a").href,
                uid,
                el,
                insertionPositionEl: el.querySelector(".playinfo"),
                explicitSubjectEl: el.querySelector(".info")
            }
        })
    }
    return list;
}


//屏蔽视频列表
const startShieldingVideoList = async () => {
    const videoList = await getRightVideoDataList();
    const css = {right: "123px"};
    for (let videoData of videoList) {
        videoData.css = css;
        if (shielding.shieldingVideoDecorated(videoData)) continue;
        shielding.addVideoBlockButton({data: videoData, maskingFunc: startShieldingVideoList});
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
