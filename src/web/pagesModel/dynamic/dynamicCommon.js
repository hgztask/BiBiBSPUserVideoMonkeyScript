import elUtil from "../../utils/elUtil.js";
import gmUtil from "../../utils/gmUtil.js";
import {blockCheckWhiteUserUid, blockDynamicItemContent} from "../../model/shielding/shielding.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import {isBlockRepostDynamicGm, isCheckNestedDynamicContentGm} from "../../data/localMKData.js";

/**
 * 获取动态主体信息
 * @param vueData
 * @returns {{}}
 */
const getDynamicCardModulesData = (vueData) => {
    const data = {};
    /**
     * 动态主体信息
     * 依次为，up信息，动态内容
     */
    const {module_author, module_dynamic} = vueData.modules;
    data.name = module_author.name;
    data.uid = module_author.mid;
    data.desc = module_dynamic.desc?.text ?? "";//其他动态时为null
    const topic = module_dynamic['topic'];//无时为null
    if (topic !== null) {
        data.topic = topic.name;
    }
    const major = module_dynamic['major'];//动态主体对象，无时为null
    if (module_dynamic['additional'] !== null) {
        //这个相关内容卡片信息,待观察
        console.warn('这个相关内容卡片信息,待观察', vueData)
    }
    if (major !== null) {
        //动态主体类型
        const majorType = major['type'];
        if (majorType === 'MAJOR_TYPE_ARCHIVE') {
            //视频类
            const archive = major['archive'];
            data.videoTitle = archive.title;
            data.videoDesc = archive.desc;
        }
        if (majorType === 'MAJOR_TYPE_OPUS') {
            //图文动态
            const opus = major['opus'];
            const opusTitle = opus.title ?? '';
            const opusDesc = opus.summary.text ?? '';
            data.opusTitle = opusTitle;
            data.opusDesc = opusDesc;
            data.desc += opusTitle + opusDesc;
        }
    }
    return data;
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
    const elList = await elUtil.findElements(".bili-dyn-list__items>.bili-dyn-list__item");
    const list = [];
    for (let el of elList) {
        const dynItemEl = el.querySelector('.bili-dyn-item');
        const vueExample = dynItemEl?.__vue__
        let data = {el};
        const vueData = vueExample?.data ?? null
        data.vueExample = vueExample
        data.vueData = vueData;
        if (vueData.visible === false) {//跳过折叠的动态
            continue;
        }
        const modulesData = getDynamicCardModulesData(vueData);
        data = {...data, ...modulesData}
        if (vueData.type === 'DYNAMIC_TYPE_FORWARD') {
            //转发类动态
            const {orig} = vueData;
            data.orig = getDynamicCardModulesData(orig);
        }
        list.push(data);
    }
    return list;
}

const checkEachItem = (dynamicData, ruleArrMap) => {
    const {desc, name, el, uid = -1, videoTitle = null, orig = null} = dynamicData;
    const blockRepostDynamicGm = isBlockRepostDynamicGm();
    if (orig && blockRepostDynamicGm) {
        el.remove();
        eventEmitter.send('打印信息', `用户${name}-动态内容${desc}-规则转发类动态`)
        return true;
    }
    if (uid !== -1) {
        if (blockCheckWhiteUserUid(uid)) return false;
    }
    if (desc === "" && videoTitle === null) return false;
    let {state, matching, type} = blockDynamicItemContent(desc, videoTitle, ruleArrMap);
    if (!state) {
        return false;
    }
    el.remove();
    eventEmitter.send('打印信息', `用户${name}-动态内容${desc}-${type}-规则${matching}`)
    return true;
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
    const checkNestedDynamicContentGm = isCheckNestedDynamicContentGm();
    for (const v of dataList) {
        if (checkEachItem(v, ruleArrMap)) {
            continue;
        }
        const {orig = null} = v;
        if (orig === null || !checkNestedDynamicContentGm) {
            continue;
        }
        checkEachItem(orig, ruleArrMap);
    }
}

//动态公共方法
export default {
    commonCheckDynamicList
}
