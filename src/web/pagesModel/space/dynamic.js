import elUtil from "../../utils/elUtil.js";
import shielding from "../../model/shielding/shielding.js";
import defUtil from "../../utils/defUtil.js";
import space from "./space.js";

/**
 *url是否是用户空间动态页面
 * @param url {string}
 * @returns {boolean}
 */
const isDynamicPage = (url) => {
    return url.search("space.bilibili.com/\\d+/dynamic") !== -1;
}

/**
 *
 * @returns {Promise<[{}]>}
 */
const getDataList = async () => {
    const elList = await elUtil.findElementsUntilFound(".bili-dyn-list__items>.bili-dyn-list__item");
    const list = [];
    for (let el of elList) {
        const videoCardEl = el.querySelector(".bili-dyn-card-video__title");
        const name = el.querySelector(".bili-dyn-title").textContent.trim();
        const tagEl = el.querySelector(".bili-dyn-topic__text");
        const data = {el, name};
        if (tagEl !== null) {
            data.tag = tagEl.textContent.trim();
        }
        //如果有视频标题，则获取视频标题，说明是视频动态
        data.judgmentVideo = videoCardEl !== null;
        if (data.judgmentVideo) {
            data.title = videoCardEl.textContent.trim();
        } else {
            const contentTitleEL = el.querySelector(".dyn-card-opus>.dyn-card-opus__title");
            const contentTitle = contentTitleEL === null ? "" : contentTitleEL.textContent.trim();
            const contentElBody = el.querySelector(".bili-rich-text").textContent.trim();
            data.content = contentTitle + contentElBody;
        }
        list.push(data);
    }
    return list;
}


/**
 * 开始屏蔽动态内容
 * 仅针对于动态中的动态内容和动态视频标题进行处理
 * @returns null
 */
const startShieldingDynamicContent = async () => {
    const personalHomepage = await space.isPersonalHomepage();
    //个人主页，不做动态屏蔽处理
    if (personalHomepage) return;
    const list = await getDataList();
    for (let dynamicContent of list) {
        shielding.shieldingDynamicDecorated(dynamicContent);
    }
}

/**
 * 节流，开始屏蔽动态内容
 * 仅针对于动态中的动态内容和动态视频标题进行处理
 * @type function
 */
const startThrottleShieldingDynamicContent = defUtil.throttle(startShieldingDynamicContent, 2000);


export default {
    isDynamicPage,
    startThrottleShieldingDynamicContent
}
