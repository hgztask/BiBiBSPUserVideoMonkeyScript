import backupKeys, {type RuleMap, type RuleValue} from './backupKeys.ts'

export interface RuleDiffRow {
    key: string
    name: string
    localCount: number
    incomingCount: number
    onlyLocalCount: number
    onlyIncomingCount: number
}

export interface RuleDiffResult {
    rows: RuleDiffRow[]
    /** 文件中有但本地为空的规则类型（覆盖导入会清空本地） */
    emptyIncomingKeys: string[]
    totalOnlyLocal: number
    totalOnlyIncoming: number
}

export type ApplyMode = 'overwrite' | 'merge'

export interface ApplyResult {
    appliedKeys: string[]
    /** 合并模式新增条目数 */
    addedCount: number
    /** 覆盖模式写入条目数 */
    overwrittenCount: number
}

/** 单条规则的比较键：组合规则按集合语义（内层排序、外层排序），数字规则按数字比较 */
const canonicalOf = (key: string, value: RuleValue | string[]): string => {
    if (backupKeys.isCombinationKey(key) && Array.isArray(value)) {
        return JSON.stringify([...value].sort())
    }
    if (backupKeys.isIntKey(key)) {
        const n = Number(value)
        return Number.isNaN(n) ? String(value) : String(n)
    }
    return String(value)
}

/** 列表的规范化字符串集合，组合规则外层也按集合处理 */
const canonicalSet = (key: string, list: RuleValue[] | string[][]): Set<string> => {
    const set = new Set<string>()
    for (const item of list as (RuleValue | string[])[]) {
        if (backupKeys.isCombinationKey(key)) {
            if (Array.isArray(item)) set.add(JSON.stringify([...item].map(String).sort()))
            continue
        }
        set.add(canonicalOf(key, item as RuleValue))
    }
    return set
}

/**
 * 比较本地规则与导入内容，生成按类型统计的差异。
 * onlyLocal 表示“文件里没有、本地有”，覆盖导入会删除；onlyIncoming 表示“文件里有、本地没有”，合并会新增。
 */
const diffRuleMap = (local: RuleMap, incoming: RuleMap): RuleDiffResult => {
    const keys = new Set([...Object.keys(local), ...Object.keys(incoming)])
    const rows: RuleDiffRow[] = []
    const emptyIncomingKeys: string[] = []
    let totalOnlyLocal = 0
    let totalOnlyIncoming = 0

    for (const key of backupKeys.allRuleKeys()) {
        if (!keys.has(key)) continue
        const localList = local[key] ?? []
        const incomingList = incoming[key] ?? []
        if (incomingList.length === 0 && localList.length > 0) {
            emptyIncomingKeys.push(key)
        }
        const localSet = canonicalSet(key, localList)
        const incomingSet = canonicalSet(key, incomingList)
        let onlyLocalCount = 0
        let onlyIncomingCount = 0
        for (const v of localSet) {
            if (!incomingSet.has(v)) onlyLocalCount++
        }
        for (const v of incomingSet) {
            if (!localSet.has(v)) onlyIncomingCount++
        }
        if (localList.length === 0 && incomingList.length === 0) continue
        totalOnlyLocal += onlyLocalCount
        totalOnlyIncoming += onlyIncomingCount
        rows.push({
            key,
            name: backupKeys.getRuleKeyName(key),
            localCount: localList.length,
            incomingCount: incomingList.length,
            onlyLocalCount,
            onlyIncomingCount
        })
    }
    return {rows, emptyIncomingKeys, totalOnlyLocal, totalOnlyIncoming}
}

/** 合并模式下规范化本地已有值，修复历史遗留的数字类型字符串 */
const normalizeExistingList = (key: string, list: RuleValue[]): RuleValue[] => {
    if (!backupKeys.isIntKey(key)) return list
    return list.map(item => {
        if (typeof item === 'string' && /^\d+$/.test(item)) return parseInt(item, 10)
        return item
    })
}

/**
 * 应用规则映射到GM存储。
 * overwrite：文件里出现的key整体替换（空数组会清空该类型），未出现的key保持不变。
 * merge：按规则集合取并集，组合规则按内容去重，不受引用比较影响。
 */
const applyRuleMap = (map: RuleMap, mode: ApplyMode): ApplyResult => {
    const appliedKeys: string[] = []
    let addedCount = 0
    let overwrittenCount = 0

    for (const key of Object.keys(map)) {
        const incomingList = map[key]
        if (!Array.isArray(incomingList)) continue
        appliedKeys.push(key)

        if (mode === 'overwrite') {
            GM_setValue(key, incomingList)
            overwrittenCount += incomingList.length
            continue
        }

        const current = GM_getValue(key, []) as RuleValue[]
        const existing = Array.isArray(current) ? normalizeExistingList(key, current) : []
        const existingSet = canonicalSet(key, existing as RuleValue[] | string[][])
        const newItems: (RuleValue | string[])[] = []
        for (const item of incomingList as (RuleValue | string[])[]) {
            const canonical = backupKeys.isCombinationKey(key) && Array.isArray(item)
                ? JSON.stringify([...item].map(String).sort())
                : canonicalOf(key, item as RuleValue)
            if (existingSet.has(canonical)) continue
            existingSet.add(canonical)
            newItems.push(item)
        }
        if (newItems.length === 0) continue
        GM_setValue(key, [...existing, ...newItems] as RuleValue[])
        addedCount += newItems.length
    }

    return {appliedKeys, addedCount, overwrittenCount}
}

/** 读取当前本地规则映射，只保留非空类型（用于差异展示） */
const getLocalRuleMap = (): RuleMap => {
    const map: RuleMap = {}
    for (const key of backupKeys.allRuleKeys()) {
        const value = GM_getValue(key, [])
        if (Array.isArray(value) && value.length > 0) {
            map[key] = value as RuleValue[]
        }
    }
    return map
}

export default {
    diffRuleMap,
    applyRuleMap,
    getLocalRuleMap
}
