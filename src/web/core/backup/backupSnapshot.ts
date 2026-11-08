import backupKeys, {type CombinationList, type RuleMap, type RuleValue} from './backupKeys.ts'

/** 备份格式标识 */
const BACKUP_FORMAT = 'bibishield-backup'

/** 当前备份格式版本，数据结构变更时递增并补充迁移 */
const SCHEMA_VERSION = 1

/** 设备id的GM存储key */
const DEVICE_ID_GM_KEY = 'backup_device_id'

export interface BackupSnapshot {
    format: string
    schemaVersion: number
    appVersion: string
    createdAt: number
    deviceId: string
    data: {
        rules: RuleMap
    }
}

export interface ParsedSnapshot {
    snapshot: BackupSnapshot
    /** 被忽略的未知规则key及条数 */
    unknownKeys: { key: string, count: number }[]
    /** 校验失败被丢弃的条目数，按key统计 */
    invalidCounts: { key: string, count: number }[]
    /** 来源为新格式备份还是旧版扁平导出 */
    source: 'backup' | 'legacy'
}

/** 稳定序列化：key排序，用于hash比较 */
const stableStringify = (value: unknown): string => {
    const walk = (v: any): any => {
        if (Array.isArray(v)) {
            return v.map(walk)
        }
        if (v && typeof v === 'object') {
            const obj: Record<string, any> = {}
            for (const k of Object.keys(v).sort()) {
                obj[k] = walk(v[k])
            }
            return obj
        }
        return v
    }
    return JSON.stringify(walk(value))
}

/** SHA-256 hex，用于本地/远程内容比较；非安全场景下回退到FNV-1a */
const sha256Hex = async (text: string): Promise<string> => {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
        try {
            const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
            return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
        } catch {
            // 非安全上下文时 crypto.subtle 不可用，走回退
        }
    }
    let h1 = 0x811c9dc5
    let h2 = 0x811c9dc5
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i)
        h1 ^= code
        h1 = Math.imul(h1, 0x01000193)
        h2 ^= (code + i) & 0xffff
        h2 = Math.imul(h2, 0x85ebca6b)
    }
    return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0')
}

/** 读取或首次生成本机设备id */
const getDeviceId = (): string => {
    let id = GM_getValue<string>(DEVICE_ID_GM_KEY, '')
    if (id) return id
    id = 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
    GM_setValue(DEVICE_ID_GM_KEY, id)
    return id
}

/**
 * 校验并规范化单个规则值：数字类型要求非负整数字符串或数字，其余保持字符串
 */
const normalizeRuleValue = (value: unknown, isInt: boolean): RuleValue | null => {
    if (isInt) {
        if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return value
        if (typeof value === 'string' && /^\d+$/.test(value)) return parseInt(value, 10)
        return null
    }
    if (typeof value !== 'string') return null
    return value
}

/** 校验并规范化单个规则key的列表，返回规范化结果与丢弃条数 */
const normalizeRuleList = (key: string, rawList: unknown[]): { list: RuleValue[] | CombinationList, invalidCount: number } => {
    const seen = new Set<string>()
    if (backupKeys.isCombinationKey(key)) {
        const list: CombinationList = []
        let invalidCount = 0
        for (const item of rawList) {
            if (!Array.isArray(item)) {
                invalidCount++
                continue
            }
            const combination: string[] = []
            for (const v of item) {
                if (typeof v !== 'string') {
                    invalidCount++
                    break
                }
                combination.push(v)
            }
            if (combination.length !== item.length) continue
            const canonical = JSON.stringify([...combination].sort())
            if (seen.has(canonical)) continue
            seen.add(canonical)
            list.push(combination)
        }
        return {list, invalidCount}
    }
    const isInt = backupKeys.isIntKey(key)
    const list: RuleValue[] = []
    let invalidCount = 0
    for (const item of rawList) {
        const v = normalizeRuleValue(item, isInt)
        if (v === null) {
            invalidCount++
            continue
        }
        const canonical = String(v)
        if (seen.has(canonical)) continue
        seen.add(canonical)
        list.push(v)
    }
    return {list, invalidCount}
}

/**
 * 构建当前规则全量快照。全部规则key都写入（空数组也保留），恢复时才能精确清空目标端。
 */
const buildSnapshot = async (): Promise<BackupSnapshot> => {
    const rules: RuleMap = {}
    for (const key of backupKeys.allRuleKeys()) {
        const value = GM_getValue(key, [])
        rules[key] = Array.isArray(value) ? value as RuleValue[] : []
    }
    return {
        format: BACKUP_FORMAT,
        schemaVersion: SCHEMA_VERSION,
        appVersion: typeof GM_info !== 'undefined' ? GM_info.script.version : '',
        createdAt: Date.now(),
        deviceId: getDeviceId(),
        data: {rules}
    }
}

/** 构建用于比较的hash输入：只含规则数据与格式版本 */
const snapshotHashInput = (snapshot: BackupSnapshot): string => {
    return stableStringify({schemaVersion: snapshot.schemaVersion, rules: snapshot.data.rules})
}

/**
 * 解析备份内容。兼容两种来源：
 * 1. 新备份格式（含format/schemaVersion包裹）
 * 2. 旧版扁平导出 {key: [...]}，未知key将被忽略
 */
const parseSnapshot = (content: string): ParsedSnapshot | null => {
    let parsed: any
    try {
        parsed = JSON.parse(content)
    } catch {
        return null
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null

    const knownKeys = new Set(backupKeys.allRuleKeys())
    const unknownKeys: { key: string, count: number }[] = []
    const invalidCounts: { key: string, count: number }[] = []
    let source: 'backup' | 'legacy'
    let rawRules: Record<string, unknown>

    if (parsed.format === BACKUP_FORMAT && parsed.data && typeof parsed.data === 'object') {
        source = 'backup'
        const version = parsed.schemaVersion
        if (typeof version !== 'number' || version > SCHEMA_VERSION) return null
        rawRules = parsed.data.rules
        if (!rawRules || typeof rawRules !== 'object' || Array.isArray(rawRules)) return null
    } else {
        source = 'legacy'
        rawRules = parsed
    }

    const rules: RuleMap = {}
    for (const key of Object.keys(rawRules)) {
        const rawList = rawRules[key]
        if (!knownKeys.has(key)) {
            unknownKeys.push({key, count: Array.isArray(rawList) ? rawList.length : 0})
            continue
        }
        if (!Array.isArray(rawList)) {
            invalidCounts.push({key, count: 0})
            continue
        }
        const {list, invalidCount} = normalizeRuleList(key, rawList)
        if (invalidCount > 0) invalidCounts.push({key, count: invalidCount})
        // 旧版扁平导出跳过空数组（保持原有导入行为）；新备份格式保留空数组，用于精确清空
        if (list.length === 0 && source === 'legacy') continue
        rules[key] = list
    }

    const snapshot: BackupSnapshot = {
        format: BACKUP_FORMAT,
        schemaVersion: source === 'backup' ? parsed.schemaVersion : SCHEMA_VERSION,
        appVersion: typeof parsed.appVersion === 'string' ? parsed.appVersion : '',
        createdAt: typeof parsed.createdAt === 'number' ? parsed.createdAt : 0,
        deviceId: typeof parsed.deviceId === 'string' ? parsed.deviceId : '',
        data: {rules}
    }
    return {snapshot, unknownKeys, invalidCounts, source}
}

export default {
    BACKUP_FORMAT,
    SCHEMA_VERSION,
    buildSnapshot,
    parseSnapshot,
    snapshotHashInput,
    stableStringify,
    sha256Hex,
    getDeviceId
}
