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

/** 多类型批量操作的类型选项 */
export interface MultiTypeOption {
    /** 规则类型 key */
    type: string
    /** 完整显示名，如“用户名(模糊匹配)” */
    name: string
    /** 去掉匹配方式后缀的短名，如“用户名” */
    shortName: string
    /** 是否为数字类型（uid、直播间id、装扮id 等） */
    isInt: boolean
    /** 是否为白名单类型 */
    isWhitelist: boolean
    /** 是否为视频tag（含分区，和组合规则互斥） */
    isVideoTag: boolean
    /** 是否为正则类型 */
    isRegex: boolean
}

/** 白名单类型：白名单会放行匹配内容，和对应黑名单语义相反 */
const MULTI_TYPE_WHITELIST_KEYS = new Set(['precise_uid_white', 'videoTag_combination_white'])

/** 视频tag类型：和视频tag组合规则互斥 */
const VIDEO_TAG_KEYS = new Set(['videoTag', 'precise_videoTag'])

const COMBINATION_MODE = '组合匹配'

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

/**
 * 获取指定匹配模式下可用于多类型批量操作的类型。
 * 组合匹配的数据结构是 string[][]，和“一组平铺值”的模型不兼容，返回空数组。
 * @param mode 匹配模式中文名：模糊匹配 / 精确匹配 / 正则匹配 / 组合匹配
 */
const getMultiTypeOptions = (mode: string): MultiTypeOption[] => {
    if (mode === COMBINATION_MODE) return []
    const group = getSelectOptions().find(item => item.value === mode)
    if (!group) return []
    const ruleKeyList = getRuleKeyListData()
    return group.children.map(child => {
        const rule = ruleKeyList.find(item => item.key === child.value)
        return {
            type: child.value,
            name: child.label,
            shortName: child.label.replace(/\([^)]*匹配\)$/, ''),
            isInt: rule?.type === 'int',
            isWhitelist: MULTI_TYPE_WHITELIST_KEYS.has(child.value),
            isVideoTag: VIDEO_TAG_KEYS.has(child.value),
            isRegex: mode === '正则匹配'
        }
    })
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
    getMultiTypeOptions,
    getVideoTagPreciseCombination,
    getRuleKeyList,
    getPreciseVideoBV,
    getVideoTagCombinationWhite(): string[][] {
        return GM_getValue("videoTag_combination_white", [])
    }
}
