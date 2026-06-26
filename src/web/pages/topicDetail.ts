import elUtil from "../core/elUtil.ts";
import shielding from "../domain/shielding_main.ts";
import video_shielding from "../domain/shielding_video.ts";
import comments_shielding from "../domain/shielding_comments.ts";
import urlUtil from "../core/urlUtil.ts";

//判断是否是话题详情页
const isTopicDetailPage = (url: any) => {
    return url.includes("//www.bilibili.com/v/topic/detail")
}

/**
 * 获取话题详情页面中的内容列表，其中内容包括视频类话题和动态类话题
 * @returns {Promise<>}
 */
const getDataList = async () => {
    const elList = await elUtil.findElements(".list__topic-card")
    const list: any[] = [];
    for (let el of elList) {
        const biliDynItemDiv = el.querySelector('.bili-dyn-item');
        if (!biliDynItemDiv) continue;
        const vueData = biliDynItemDiv['__vue__']
        const {author} = vueData;
        const name = author.name;
        const uid = author.mid;
        // 判断是否是视频
        const judgmentEl = el.querySelector(".bili-dyn-card-video__title");
        const data: Record<string, any> = {name, uid, el, judgmentVideo: judgmentEl !== null};
        if (judgmentEl !== null) {
            data.title = judgmentEl.textContent?.trim() ?? '';
            const videoEl = el.querySelector(".bili-dyn-card-video");
            const videoUrl = videoEl?.href ?? '';
            data.videoUrl = videoUrl;
            data.bv = urlUtil.getUrlBV(videoUrl);
            data.insertionPositionEl = el.querySelector(".bili-dyn-content__orig");
            data.explicitSubjectEl = data.insertionPositionEl;
        } else {
            const dynTitle = el.querySelector(".dyn-card-opus__title");
            const contentTitle = dynTitle?.textContent?.trim() ?? "";
            const contentBody = el.querySelector(".bili-ellipsis")?.textContent?.trim() ?? '';
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
