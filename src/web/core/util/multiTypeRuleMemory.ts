/**
 * 多类型批量规则的 UI 记忆。
 * 仅记录用户上次确认的类型集合，不属于规则数据，不参与导入导出。
 */

export type MultiTypeModeKey = 'fuzzy' | 'exact' | 'regex';

export interface MultiTypeMemoryMap {
    fuzzy?: string[];
    exact?: string[];
    regex?: string[];
}

/** 独立于规则 key 的 UI 记忆存储键 */
const STORAGE_KEY = 'multiTypeAdd_lastTypes';

/** 匹配模式中文名 → 记忆键 */
const MODE_KEY_MAP: Record<string, MultiTypeModeKey> = {
    '模糊匹配': 'fuzzy',
    '精确匹配': 'exact',
    '正则匹配': 'regex'
};

const getModeKey = (mode: string): MultiTypeModeKey | null => {
    return MODE_KEY_MAP[mode] ?? null;
};

const readMemoryMap = (): MultiTypeMemoryMap => {
    const value = GM_getValue(STORAGE_KEY, {});
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return value as MultiTypeMemoryMap;
};

/**
 * 读取指定模式下上次确认的类型集合。
 * @param mode 匹配模式中文名
 * @param validTypes 当前模式可用的类型 key，用于过滤配置变更后失效的类型
 */
export const getRememberedTypes = (mode: string, validTypes: string[]): string[] => {
    const modeKey = getModeKey(mode);
    if (!modeKey) return [];
    const raw = readMemoryMap()[modeKey];
    if (!Array.isArray(raw)) return [];
    const valid = new Set(validTypes);
    return Array.from(new Set(raw.filter((item): item is string => typeof item === 'string' && valid.has(item))));
};

/**
 * 记住指定模式下本次确认的类型集合。
 */
export const rememberTypes = (mode: string, types: string[]): void => {
    const modeKey = getModeKey(mode);
    if (!modeKey) return;
    const map = readMemoryMap();
    map[modeKey] = Array.from(new Set(types));
    GM_setValue(STORAGE_KEY, map);
};

/**
 * 清除指定模式（不传则全部）的记忆。
 */
export const clearRememberedTypes = (mode?: string): void => {
    if (!mode) {
        GM_deleteValue(STORAGE_KEY);
        return;
    }
    const modeKey = getModeKey(mode);
    if (!modeKey) return;
    const map = readMemoryMap();
    delete map[modeKey];
    GM_setValue(STORAGE_KEY, map);
};
