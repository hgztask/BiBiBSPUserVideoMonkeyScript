import gmUtil from "../../utils/gmUtil.js";
import {blockCheckWhiteUserUid, blockDynamicItemContent} from "../../model/shielding/shielding.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import elUtil from "../../utils/elUtil.js";

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
        //todo 发现外层动态话题tag不存在时会定位到嵌套动态的话题tag，待后续调整
        const tagEl = bodyEl.querySelector(".bili-dyn-topic__text,.bili-topic__text");
        const data = {el, name};
        if (tagEl !== null) {
            data.tag = tagEl.textContent.trim();
        }
        const vueExample = el.querySelector('.bili-dyn-item')?.__vue__
        const vueData = vueExample?.data ?? null
        data.uid = vueData?.modules?.['module_author']?.mid ?? -1
        const biliEllipsis = el.querySelector('.bili-dyn-time.fs-small.bili-ellipsis')?.textContent?.trim()
        //动态总内容，不包括嵌套动态里的动态内容
        let content = bodyEl.querySelector(".bili-dyn-content__orig__desc,.bili-dyn-content__forw__desc,.bili-dyn-content__orig:not(.reference)>.bili-dyn-content__orig__major>.dyn-card-opus .bili-rich-text__content")?.textContent.trim() ?? "";
        const titleEl = bodyEl.querySelector('.dyn-card-opus:not(.hide-border) .dyn-card-opus__title.bili-ellipsis')
        const title = titleEl?.textContent.trim() ?? "";
        data.title = title;
        data.vueExample = vueExample
        data.vueData = vueData
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
 * 公共检查动态列表项执行屏蔽函数
 * @returns {Promise<void>|null}
 */
const commonCheckDynamicList = async () => {
    const dataList = await getDataList();
    console.log('动态列表', dataList);
    const ruleArrMap = {
        fuzzyRuleArr: gmUtil.getData('dynamic', []),
        regexRuleArr: gmUtil.getData('dynamicCanonical', [])
    }
    for (const v of dataList) {
        const {content, name, el, uid = -1, videoTitle = null} = v;
        if (uid !== -1) {
            if (blockCheckWhiteUserUid(uid)) continue;
        }
        if (content === "" && videoTitle === null) continue;
        const {state, matching, type} = blockDynamicItemContent(content, videoTitle, ruleArrMap);
        if (!state) continue;
        el.remove();
        eventEmitter.send('打印信息', `用户${name}-动态内容${content}-${type}-规则${matching}`)
        console.log(v);
    }
}

//动态公共方法
export default {
    commonCheckDynamicList
}
