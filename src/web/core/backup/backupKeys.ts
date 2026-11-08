import ruleKeyListData from '../../config/ruleKeyListData.ts'

/** 规则值 */
export type RuleValue = string | number

/** 普通规则列表 */
export type RuleList = RuleValue[]

/** 组合规则列表（内层为tag组合） */
export type CombinationList = string[][]

/** 规则映射：key → 规则列表 */
export type RuleMap = Record<string, RuleList | CombinationList>

/** 组合规则key：数据结构为 string[][]，与普通规则数组不同 */
const COMBINATION_KEYS = new Set(['videoTag_preciseCombination', 'videoTag_combination_white'])

/** 全部规则key（含组合规则），来源 ruleKeyListDataJson.json，不手写 */
const allRuleKeys = (): string[] => {
    return ruleKeyListData.getRuleKeyList().slice()
}

/** 是否组合规则key */
const isCombinationKey = (key: string): boolean => {
    return COMBINATION_KEYS.has(key)
}

/** 是否数字类型规则（uid、直播间id、装扮id等） */
const isIntKey = (key: string): boolean => {
    const item = ruleKeyListData.getRuleKeyListData().find(i => i.key === key)
    return item?.type === 'int'
}

/** 获取规则显示名，未知key返回key本身 */
const getRuleKeyName = (key: string): string => {
    const item = ruleKeyListData.getRuleKeyListData().find(i => i.key === key)
    return item?.name ?? key
}

export default {
    allRuleKeys,
    isCombinationKey,
    isIntKey,
    getRuleKeyName
}
