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
 * 动态内容如遇到引用其他动态或内容，不用匹配时排除.reference
 * 1.尝试获取动态内容，不包括嵌套动态，赋值content。获取不到时为空串
 * 2.当动态有主标题时，会把主标题拼接在content前
 * 2.动态为视频类型时，获取其标题和简介，为空时为空串
 * 3.暂不考虑处理嵌套动态内容，待后续改动
 * @returns {Promise<[{}]>}
 */
const getDataList = async () => {
    const elList = await elUtil.findElementsUntilFound(".bili-dyn-list__items>.bili-dyn-list__item");
    const list = [];
    for (let el of elList) {
        const bodyEl = el.querySelector('.bili-dyn-content')
        const name = el.querySelector(".bili-dyn-title").textContent.trim();
        const tagEl = bodyEl.querySelector(".bili-dyn-topic__text,.bili-topic__text");
        const data = {el, name};
        if (tagEl !== null) {
            data.tag = tagEl.textContent.trim();
        }
        const biliEllipsis = el.querySelector('.bili-dyn-time.fs-small.bili-ellipsis')?.textContent?.trim()
        //动态总内容，不包括嵌套动态里的动态内容
        let content = bodyEl.querySelector(".bili-dyn-content__orig__desc,.bili-dyn-content__forw__desc,.bili-dyn-content__orig:not(.reference)>.bili-dyn-content__orig__major>.dyn-card-opus .bili-rich-text__content")?.textContent.trim() ?? "";
        const titleEl = bodyEl.querySelector('.dyn-card-opus:not(.hide-border) .dyn-card-opus__title.bili-ellipsis')
        const title = titleEl?.textContent.trim() ?? "";
        data.title = title;
        data.judgmentVideo = biliEllipsis.includes('投稿了视频');
        if (data.judgmentVideo) {
            const videoCardEl = el.querySelector(".bili-dyn-content__orig__major.suit-video-card");
            const vTitleEl = videoCardEl.querySelector('.bili-dyn-card-video__title');
            const vDescEl = videoCardEl.querySelector('.bili-dyn-card-video__desc');
            data.videoTitle = vTitleEl.textContent.trim();
            data.videoDesc = vDescEl?.textContent.trim() ?? "";
        } else {
            content = title + content;
        }
        data.content = content;
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
    startThrottleShieldingDynamicContent,
    getDataList
}
