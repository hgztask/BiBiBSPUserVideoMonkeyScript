import elUtil from "../utils/elUtil.js";
import shielding from "../model/shielding/shielding.js";
import video_shielding from "../model/shielding/video_shielding.js";
import comments_shielding from "../model/shielding/comments_shielding.js";
import urlUtil from "../utils/urlUtil.js";

//判断是否是话题详情页
const isTopicDetailPage = (url) => {
    return url.includes("//www.bilibili.com/v/topic/detail")
}

/**
 * 获取话题详情页面中的内容列表，其中内容包括视频类话题和动态类话题
 * @returns {Promise<>}
 */
const getDataList = async () => {
    const elList = await elUtil.findElements(".list__topic-card")
    const list = [];
    for (let el of elList) {
        const biliDynItemDiv = el.querySelector('.bili-dyn-item');
        const vueData = biliDynItemDiv['__vue__']
        const {author} = vueData;
        const name = author.name;
        const uid = author.mid;
        // 判断是否是视频
        const judgmentEl = el.querySelector(".bili-dyn-card-video__title");
        const data = {name, uid, el, judgmentVideo: judgmentEl !== null};
        if (judgmentEl !== null) {
            data.title = judgmentEl.textContent.trim();
            const videoUrl = el.querySelector(".bili-dyn-card-video").href;
            data.videoUrl = videoUrl;
            data.bv = urlUtil.getUrlBV(videoUrl);
            data.insertionPositionEl = el.querySelector(".bili-dyn-content__orig");
            data.explicitSubjectEl = data.insertionPositionEl;
        } else {
            const dynTitle = el.querySelector(".dyn-card-opus__title");
            const contentTitle = dynTitle === null ? "" : dynTitle.textContent.trim();
            const contentBody = el.querySelector(".bili-ellipsis").textContent.trim();
            data.insertionPositionEl = el.querySelector(".dyn-card-opus");
            data.explicitSubjectEl = data.insertionPositionEl
            data.content = contentTitle + contentBody;
        }
        list.push(data);
    }
    return list;
}

//开始屏蔽
const startShielding = async () => {
    const list = await getDataList();
    const css = {width: "100%"};
    for (let data of list) {
        data.cssMap = css;
        //判断是否是视频
        if (data.judgmentVideo) {
            video_shielding.shieldingVideoDecorated(data).catch(() => {
                shielding.addTopicDetailVideoBlockButton({data, maskingFunc: startShielding})
            })
        } else {
            if (await comments_shielding.shieldingCommentAsync(data)) continue;
            shielding.addTopicDetailContentsBlockButton({data, maskingFunc: startShielding});
        }
    }
}

export default {
    isTopicDetailPage,
    startShielding
}
