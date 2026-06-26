import ruleKeyListDataJson from './ruleKeyListDataJson.json'

interface RuleKeyItem {
    key: string
    name: string
    type?: string
}

interface SelectOptionChild {
    value: string
    label: string
}

interface SelectOption {
    value: string
    label: string
    children: SelectOptionChild[]
}

const getSelectOptions = (): SelectOption[] => {
    const options: SelectOption[] = [
        {
            value: '模糊匹配',
            label: '模糊匹配',
            children: []
        },
        {
            value: '正则匹配',
            label: '正则匹配',
            children: []
        },
        {
            value: '组合匹配',
            label: '组合匹配',
            children: []
        },
        {
            value: '精确匹配',
            label: '精确匹配',
            children: []
        }
    ]
    for (const {name, key} of ruleKeyListDataJson as RuleKeyItem[]) {
        let children: SelectOptionChild[] | undefined
        if (name.includes('(模糊匹配)')) {
            children = options[0].children
        }
        if (name.includes('(正则匹配)')) {
            children = options[1].children
        }
        if (name.includes('(组合匹配)')) {
            children = options[2].children
        }
        if (name.includes('(精确匹配)')) {
            children = options[3].children
        }
        if (children) {
            children.push({
                value: key,
                label: name
            })
        }
    }
    return options
}

const getRuleKeyListData = (): RuleKeyItem[] => {
    return ruleKeyListDataJson as RuleKeyItem[]
}

const getRuleKeyList = (): string[] => {
    return (ruleKeyListDataJson as RuleKeyItem[]).map(item => {
        return item.key
    })
}

const getNameArr = (): string[] => {
    return GM_getValue("name", [])
}

const getPreciseNameArr = (): string[] => {
    return GM_getValue("precise_name", [])
}

const getNameCanonical = (): string[] => {
    return GM_getValue("nameCanonical", [])
}

const getPreciseUidArr = (): number[] => {
    return GM_getValue("precise_uid", [])
}

const getPreciseUidWhiteArr = (): string[] => {
    return GM_getValue("precise_uid_white", [])
}

const getTitleArr = (): string[] => {
    return GM_getValue("title", [])
}

const getTitleCanonicalArr = (): string[] => {
    return GM_getValue("titleCanonical", [])
}

const getCommentOnArr = (): string[] => {
    return GM_getValue("commentOn", [])
}

const getCommentOnCanonicalArr = (): string[] => {
    return GM_getValue("commentOnCanonical", [])
}

const getPreciseTagArr = (): string[] => {
    return GM_getValue("precise_tag", [])
}

const getTagArr = (): string[] => {
    return GM_getValue("tag", [])
}

const getTagCanonicalArr = (): string[] => {
    return GM_getValue("tagCanonical", [])
}

const getPreciseFanCardArr = (): string[] => {
    return GM_getValue("precise_fanCard", [])
}

const getPrecisePartitionArr = (): string[] => {
    return GM_getValue("precise_partition", [])
}

const getVideoTagArr = (): string[] => {
    return GM_getValue("videoTag", [])
}

const getPreciseVideoTagArr = (): string[] => {
    return GM_getValue("precise_videoTag", [])
}

const getVideoTagCanonicalArr = (): string[] => {
    return GM_getValue("videoTagCanonical", [])
}

const getHotSearchKeyArr = (): string[] => {
    return GM_getValue("hotSearchKey", [])
}

const getHotSearchKeyCanonicalArr = (): string[] => {
    return GM_getValue("hotSearchKeyCanonical", [])
}

const clearKeyItem = (ruleKey: string): void => {
    GM_deleteValue(ruleKey)
}

const getVideoTagPreciseCombination = (): string[][] => {
    return GM_getValue("videoTag_preciseCombination", [])
}

const getPreciseVideoBV = (): string[] => {
    return GM_getValue("precise_video_bv", [])
}

export default {
    getNameArr,
    getPreciseNameArr,
    getNameCanonical,
    getPreciseUidArr,
    getPreciseUidWhiteArr,
    getTitleArr,
    getTitleCanonicalArr,
    getCommentOnArr,
    getCommentOnCanonicalArr,
    getRuleKeyListData,
    getPreciseTagArr,
    getTagArr,
    getTagCanonicalArr,
    getPreciseFanCardArr,
    getPrecisePartitionArr,
    getVideoTagArr,
    getPreciseVideoTagArr,
    getVideoTagCanonicalArr,
    getHotSearchKeyArr,
    getHotSearchKeyCanonicalArr,
    clearKeyItem,
    getSelectOptions,
    getVideoTagPreciseCombination,
    getRuleKeyList,
    getPreciseVideoBV,
    getVideoTagCombinationWhite(): string[][] {
        return GM_getValue("videoTag_combination_white", [])
    }
}
