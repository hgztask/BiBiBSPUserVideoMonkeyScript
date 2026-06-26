import localMKData from "../../state/localMKData.ts";
import {returnTempVal} from "../../config/globalValue.ts";
import arrUtil from "../../core/util/arrUtil.ts";
import {BlockResult} from "./main.ts";

interface MatchModeOption {
    label: string;
    value: string;
}

interface FieldOption {
    label: string;
    value: string;
}

interface CombinationRuleItem {
    key: string;
    mode: string;
    value: string;
}

interface CombinationRulePlan {
    name: string;
    status: boolean;
    ruleList: CombinationRuleItem[];
}

interface CombinationRuleData {
    title: string;
    tags: string[];
    videoInfo: {
        desc: string;
    };
}

const matchModeOptions: MatchModeOption[] = [
    {label: '正则', value: 'regex'},
    {label: '精确', value: 'precise'}
]

const fieldOptions: FieldOption[] = [
    {label: "视频标题", value: "videoTitle"},
    {label: "视频tag", value: "videoTag"},
    {label: "视频简介", value: "videoDesc"}
]

const verifyCombinationRuleItem = (data: CombinationRuleData, ruleList: CombinationRuleItem[]): boolean => {
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
        const valueTag = value.split(',').filter(str => str.trim() !== '').map(str => str.trim())
        if (!arrUtil.arrayContains(tags, valueTag)) {
            return false
        }
    }
    return true
}

const blockCombinationRulePlan = (data: CombinationRuleData): BlockResult => {
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
    async asyncBlockCombinationRulePlan(data: CombinationRuleData): Promise<void> {
        const res = blockCombinationRulePlan(data);
        if (res.state) {
            return Promise.reject(res)
        }
    }
}
