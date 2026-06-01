import localMKData from "../../data/localMKData.js";
import {returnTempVal} from "../../data/globalValue.js";
import arrUtil from "../../utils/arrUtil.js";

const matchModeOptions = [
    {label: '正则', value: 'regex'},
    {label: '精确', value: 'precise'}
]

const fieldOptions = [
    {label: "视频标题", value: "videoTitle"},
    {label: "视频tag", value: "videoTag"},
    {label: "视频简介", value: "videoDesc"}
]

/**
 * 验证组合规则方案中规则列表是否都匹配
 * 只要有一个规则匹配不上则返回returnTempVal，反之验证成功
 * @param data
 * @param ruleList
 */
const verifyCombinationRuleItem = (data, ruleList) => {
    const {title, tags = [], videoInfo} = data
    const {desc} = videoInfo
    if (ruleList.length === 0) {
        return false
    }
    for (let itemRule of ruleList) {
        const {key, mode, value} = itemRule
        if (key === "videoTitle") {
            if (title.search(value) === -1) {
                return false
            }
        }
        if (key === "videoDesc") {
            if (desc.search(value) === -1) {
                return false
            }
        }
        // tag
        const valueTag = value.split(',').filter(str => str.trim() !== '').map(str => str.trim())
        if (!arrUtil.arrayContains(tags, valueTag)) {
            return false
        }
    }
    return true
}
/**
 * 根据组合规则方案屏蔽
 * @param data 依据数据源
 * @returns {{state: boolean, type: string, matching: string}|{state: boolean}}
 */
const blockCombinationRulePlan = (data) => {
    const listGm = localMKData.getCombinationRuleListGm();
    if (listGm.length === 0) return returnTempVal
    for (let planItemRule of listGm) {
        if (!planItemRule.status) continue
        if (verifyCombinationRuleItem(data, planItemRule.ruleList)) {
            return {state: true, type: "组合规则", matching: planItemRule.name}
        }
    }
    return returnTempVal
}

export default {
    matchModeOptions, fieldOptions,
    //异步根据组合规则方案屏蔽
    async asyncBlockCombinationRulePlan(data) {
        const res = blockCombinationRulePlan(data);
        if (res.state) {
            return Promise.reject(res)
        }
    }
}

