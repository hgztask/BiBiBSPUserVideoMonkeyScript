import elUtil from "../utils/elUtil.js";
import shielding from "../model/shielding/shielding.js";
import video_shielding from "../model/shielding/video_shielding.js";
import comments_shielding from "../model/shielding/comments_shielding.js";

//判断是否是话题详情页
const isTopicDetailPage = (url) => {
    return url.includes("//www.bilibili.com/v/topic/detail/")
}

/**
 * 获取话题详情页面中的内容列表，其中内容包括视频类话题和动态类话题
 * @returns {Promise<>}
 */
const getDataList = async () => {
    const elList = await elUtil.findElementsUntilFound(".list__topic-card")
    const list = [];
    for (let el of elList) {
        const name = el.querySelector(".bili-dyn-title").textContent.trim();
        const uidEl = el.querySelector(".bili-dyn-item__following");
        const uid = parseInt(uidEl.getAttribute("data-mid"));
        // 判断是否是视频
        const judgmentEl = el.querySelector(".bili-dyn-card-video__title");
        const data = {name, uid, el, judgmentVideo: judgmentEl !== null};
        if (judgmentEl !== null) {
            data.title = judgmentEl.textContent.trim();
            const videoUrl = el.querySelector(".bili-dyn-card-video").href;
            data.videoUrl = videoUrl;
            data.bv = elUtil.getUrlBV(videoUrl);
            data.insertionPositionEl = el.querySelector(".bili-dyn-content__orig");
            data.explicitSubjectEl = data.insertionPositionEl;
        } else {
            const dynTitle = el.querySelector(".dyn-card-opus__title");
            const contentTitle = dynTitle === null ? "" : dynTitle.textContent.trim();
            const contentBody = el.querySelector(".bili-rich-text>div").textContent.trim();
            data.insertionPositionEl = el.querySelector(".dyn-card-opus");
            data.explicitSubjectEl = data.insertionPositionEl
            data.content = contentTitle + contentBody;
        }
        list.push(data);
    }
    return list;
}

const __shieldingVideo = (videoData) => {
    if (video_shielding.shieldingVideoDecorated(videoData)) {
        return;
    }
    shielding.addTopicDetailVideoBlockButton({data: videoData, maskingFunc: startShielding})
}
const __shieldingDynamic = async (dynamicData) => {
    if (await comments_shielding.shieldingCommentAsync(dynamicData)) {
        return;
    }
    shielding.addTopicDetailContentsBlockButton({data: dynamicData, maskingFunc: startShielding});
}

//开始屏蔽
const startShielding = async () => {
    const list = await getDataList();
    const css = {width: "100%"};
    for (let data of list) {
        data.css = css;
        //判断是否是视频
        if (data.judgmentVideo) {
            __shieldingVideo(data);
        } else {
            __shieldingDynamic(data);
        }
    }
}

export default {
    isTopicDetailPage,
    startShielding
}
