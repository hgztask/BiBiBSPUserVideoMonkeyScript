/** 时间范围屏蔽项，r存储毫秒级时间戳起止范围 */
export interface TimeRangeMaskingItem {
    /** 该时间范围是否启用 */
    status: boolean
    /** 起止时间戳数组 [开始毫秒级时间戳, 结束毫秒级时间戳] */
    r: [number, number]
}

/** 排除URL配置项，regularURL为正则表达式字符串 */
export interface ExcludeURLItem {
    /** 该排除规则是否启用 */
    state: boolean
    /** URL匹配正则表达式字符串 */
    regularURL: string
    /** 排除规则描述 */
    desc: string
}

/** 荣耀等级图标映射，level为等级，src为图标URL */
export interface GloryLevelMappingItem {
    /** 荣耀等级数值 */
    level: number
    /** 对应等级图标URL */
    src: string
}

/** 荣耀等级限制规则，应用于指定直播间 */
export interface GloryLevelLimitItem {
    /** 直播间ID，0表示全局默认配置 */
    roomId: number | string
    /** 限制的荣耀等级阈值 */
    limitLevel: number
    /** 该规则是否启用 */
    status: boolean
}

/** 粉丝牌等级限制规则 */
export interface FansLevelLimitItem {
    /** 粉丝牌名称 */
    name: string
    /** 限制的粉丝牌等级阈值 */
    limitLevel: number
    /** 该规则是否启用 */
    status: boolean
}

/** 组合规则中的单条子规则 */
export interface CombinationRuleItem {
    /** 规则匹配的字段键名 */
    key: string
    /** 匹配模式，如精确、模糊、正则等 */
    mode: string
    /** 匹配的目标值 */
    value: string
}

/** 组合规则方案，包含多条子规则和启用状态 */
export interface CombinationRuleListItem {
    /** 方案是否启用 */
    status: boolean
    /** 方案名称 */
    name: string
    /** 该方案下的子规则列表 */
    ruleList: CombinationRuleItem[]
}
