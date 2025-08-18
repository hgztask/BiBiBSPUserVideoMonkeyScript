import elUtil from "../../utils/elUtil.js";
import gmUtil from "../../utils/gmUtil.js";
import {blockCheckWhiteUserUid, blockDynamicItemContent} from "../../model/shielding/shielding.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import {
    isBlockAppointmentDynamicGm,
    isBlockRepostDynamicGm,
    isBlockUPowerLotteryDynamicGm,
    isBlockVoteDynamicGm,
    isCheckNestedDynamicContentGm
} from "../../data/localMKData.js";

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
    const additional = module_dynamic['additional'];
    if (additional !== null) {
        //这个相关内容卡片信息
        switch (additional.type) {
            case 'ADDITIONAL_TYPE_RESERVE':
                //预约信息，直播预约，不确定是否还有其他预约类型
                const reserve = additional['reserve'];
                // 预约标题
                data.reserveTitle = reserve.title;
                break;
            case 'ADDITIONAL_TYPE_VOTE':
                //投票信息
                const vote = additional['vote'];
                data.voteTitle = vote.desc;
                break;
            case 'ADDITIONAL_TYPE_UPOWER_LOTTERY':
                //充电专属抽奖信息
                const uPowerLottery = additional['upower_lottery'];
                data.uPowerLotteryTitle = uPowerLottery.title;
                data.uPowerLotteryDesc = uPowerLottery.desc.text;
                console.warn('充电专属抽奖信息，待观察', uPowerLottery);
                break;
            case 'ADDITIONAL_TYPE_GOODS':
                //商品信息
                data.gools = additional['goods'];
                break;
            default:
                console.warn('相关内容卡片信息,待观察', vueData);
                break;
        }
    }
    if (major !== null) {
        //动态主体类型
        switch (major['type']) {
            case 'MAJOR_TYPE_ARCHIVE':
                //视频类
                const archive = major['archive'];
                data.videoTitle = archive.title;
                data.videoDesc = archive.desc;
                //角标信息
                const badge = archive.badge;
                //角标文本，如果是充电专属视频时，这里的值会是充电专属
                data.videoBadgeText = badge.text;
                //是否充电专属视频
                data.videoChargingExclusive = badge.text === '充电专属';
                break;
            case 'MAJOR_TYPE_OPUS':
                //图文动态
                const opus = major['opus'];
                const opusTitle = opus.title ?? '';
                const opusDesc = opus.summary.text ?? '';
                data.opusTitle = opusTitle;
                data.opusDesc = opusDesc;
                data.desc += opusTitle + opusDesc;
                break;
            case 'MAJOR_TYPE_BLOCKED':
                //该类型目前不确定，猜测属于需要条件才能看的内容
                const blocked = major['blocked'];
                data.blockedTitle = blocked.title;
                //图标徽章名称
                const iconBadgeText = module_author?.['icon_badge']?.text;
                if (iconBadgeText) {
                    data.iconBadgeText = iconBadgeText;
                    if (iconBadgeText === '充电专属') {
                        //是否是充电专属专栏
                        data.specialColumnForCharging = true;
                    }
                }
                break;
            default:
                console.warn('动态主体类型,待观察', vueData);
                break;
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
        switch (vueData.type) {
            case 'DYNAMIC_TYPE_FORWARD':
                //转发类动态
                const {orig} = vueData;
                data.orig = getDynamicCardModulesData(orig);
                break;
            case 'DYNAMIC_TYPE_ARTICLE':
                //投稿专栏
                break
        }
        list.push(data);
    }
    return list;
}

const checkEachItem = (dynamicData, ruleArrMap) => {
    const {desc, name, uid = -1, videoTitle = null, orig = null} = dynamicData;
    const blockRepostDynamicGm = isBlockRepostDynamicGm();
    if (orig && blockRepostDynamicGm) {
        eventEmitter.send('打印信息', `用户${name}-动态内容${desc}-规则转发类动态`)
        return true;
    }
    if (uid !== -1) {
        if (blockCheckWhiteUserUid(uid)) return false;
    }
    if (desc === "" && videoTitle === null) return false;
    if (dynamicData['reserveTitle'] && isBlockAppointmentDynamicGm()) {
        eventEmitter.send('打印信息', `用户${name}-动态内容${desc}-屏蔽预约类动态`)
        return true;
    }
    if (dynamicData['uPowerLotteryTitle'] && isBlockUPowerLotteryDynamicGm()) {
        eventEmitter.send('打印信息', `用户${name}-动态内容${desc}-屏蔽充电专属抽奖类动态`)
        return true;
    }
    if (dynamicData['voteTitle'] && isBlockVoteDynamicGm()) {
        eventEmitter.send('打印信息', `用户${name}-动态内容${desc}-屏蔽投票类动态`)
        return true;
    }
    let {state, matching, type} = blockDynamicItemContent(desc, videoTitle, ruleArrMap);
    if (!state) {
        return false;
    }
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
            v.el.remove();
            continue;
        }
        const {orig = null} = v;
        if (orig === null || !checkNestedDynamicContentGm) {
            continue;
        }
        if (checkEachItem(orig, ruleArrMap)) {
            v.el.remove();
        }
    }
}

//动态公共方法
export default {
    commonCheckDynamicList
}
