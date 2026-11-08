import ruleKeyListData, {type MultiTypeOption} from '../../config/ruleKeyListData.ts'
import {eventEmitter} from "../EventEmitter.ts";
import backupSnapshot from "../backup/backupSnapshot.ts";
import backupMerge from "../backup/backupMerge.ts";


//验证规则key是否是数字类类型
const isRuleIntType = (type: string): boolean => {
    const keyListData = ruleKeyListData.getRuleKeyListData();
    const find = keyListData.find((item: any) => item.key === type);
    if (find === undefined) {
        throw new Error('规则类型错误');
    }
    return find.type === 'int'
}

interface VerificationResult {
    status: boolean;
    res: string | number;
}

/**
 *验证输入框的值
 * @param ruleValue 规则的实际值
 * @param type 类型
 * @returns {{status: boolean, res: string|number}} 返回验证结果
 */
const verificationInputValue = (ruleValue: string | number | null, type: string): VerificationResult => {
    if (ruleValue === null) return {status: false, res: '内容不能为空'};
    if (isRuleIntType(type)) {
        ruleValue = parseInt(ruleValue as any);
        if (isNaN(ruleValue)) {
            return {
                status: false,
                res: '请输入数字！'
            };
        }
    } else {
        (ruleValue as string).trim();
    }
    if (ruleValue === '') {
        return {status: false, res: '内容不能为空'};
    }
    return {status: true, res: ruleValue};
}


/**
 * 添加规则
 * @param ruleValue {string|number} 规则的实际值
 * @param type {string} 类型
 */
const addRule = (ruleValue: string | number, type: string): VerificationResult => {
    const verificationRes = verificationInputValue(ruleValue, type);
    if (!verificationRes.status) {
        return verificationRes
    }
    const arr = GM_getValue(type, []) as (string | number)[];
    if (arr.includes(verificationRes.res)) {
        return {status: false, res: '已存在此内容'};
    }
    arr.push(verificationRes.res);
    GM_setValue(type, arr);
    return {status: true, res: '添加成功'};
}

interface BatchAddResult {
    successList: (string | number)[];
    failList: (string | number)[];
}

/**
 * 批量添加指定类型
 * @param ruleValues {[string]|[number]}
 * @param type {string}
 * @returns {{successList: [string|number], failList: [string|number]}}
 */
const batchAddRule = (ruleValues: (string | number)[], type: string): BatchAddResult => {
    const successList: (string | number)[] = [];
    const failList: (string | number)[] = [];
    const arr = GM_getValue(type, []) as (string | number)[];
    const isIntType = isRuleIntType(type);
    for (let v of ruleValues) {
        if (isIntType) {
            if (isNaN(v as any)) {
                failList.push(v);
                continue;
            }
            v = parseInt(v as any);
        }
        if (arr.includes(v)) {
            failList.push(v);
            continue;
        }
        arr.push(v);
        successList.push(v);
    }
    if (successList.length > 0) {
        GM_setValue(type, arr);
    }
    return {
        successList,
        failList
    }
}

/**
 * 删除单个规则值
 * @param type {string}
 * @param value {string|number}
 * @returns {{status: boolean, res: (string|number)}|{res: string, status: boolean}}
 */
const delRule = (type: string, value: string | number): VerificationResult => {
    const verificationRes = verificationInputValue(value, type);
    if (!verificationRes.status) {
        return verificationRes
    }
    const {res} = verificationRes
    const arr = GM_getValue(type, []) as (string | number)[];
    const indexOf = arr.indexOf(res);
    if (indexOf === -1) {
        return {status: false, res: '不存在此内容'};
    }
    arr.splice(indexOf, 1);
    GM_setValue(type, arr);
    return {status: true, res: "移除成功"}
}

/**
 * 删除规则对话框
 * @param type {string}
 * @returns {null}
 */
const showDelRuleInput = async (type: string): Promise<void> => {
    let ruleValue: string;
    try {
        const {value} = await eventEmitter.invoke('el-prompt', '请输入要删除的规则内容', '删除指定规则');
        ruleValue = value
    } catch (e) {
        return
    }
    const {status, res} = delRule(type, ruleValue)
    eventEmitter.send('el-msg', res)
    status && eventEmitter.send('刷新规则信息');
}

interface RuleMap {
    [key: string]: (string | number)[];
}

/**
 *获取本地规则内容
 * @param isToStr {boolean} 是否转为字符串，默认true
 * @param space {number} 缩进
 * @return {string|{[string]: [string|number]}}
 */
const getRuleContent = (isToStr: boolean = true, space: number = 0): string | RuleMap => {
    const ruleMap: RuleMap = {};
    for (let ruleKeyListDatum of ruleKeyListData.getRuleKeyListData()) {
        const key = ruleKeyListDatum.key;
        const data = GM_getValue(key, []) as (string | number)[];
        if (data.length === 0) continue;
        ruleMap[key] = data;
    }
    if (isToStr) {
        return JSON.stringify(ruleMap, null, space);
    }
    return ruleMap;
}

/**
 * 覆盖导入规则
 * 兼容旧版扁平格式与新备份格式；未知key会被忽略，数字类型会做校验与转换。
 * @param content {string}
 */
const overwriteImportRules = (content: string): boolean => {
    const parsed = backupSnapshot.parseSnapshot(content);
    if (parsed === null) {
        alert('规则内容有误');
        return false;
    }
    const rules = parsed.snapshot.data.rules;
    if (Object.keys(rules).length === 0) {
        alert('规则内容为空');
        return false;
    }
    backupMerge.applyRuleMap(rules, 'overwrite');
    return true;
}

/**
 * 追加导入规则
 * 兼容旧版扁平格式与新备份格式；按规则集合取并集，组合规则按内容去重。
 * @param content {string}
 */
const appendImportRules = (content: string): boolean => {
    const parsed = backupSnapshot.parseSnapshot(content);
    if (parsed === null) {
        alert('规则内容有误');
        return false;
    }
    const rules = parsed.snapshot.data.rules;
    if (Object.keys(rules).length === 0) {
        alert('规则内容为空');
        return false;
    }
    backupMerge.applyRuleMap(rules, 'merge');
    return true;
}

/**
 * 添加精确uid
 * @param uid {number}
 * @param isTip {boolean} 是否提示，默认true，则默认提示，如果为false则不提示，返回结果
 * @returns {{res: string, status: boolean}|{res: string, status: boolean}}
 */
const addRulePreciseUid = (uid: number, isTip: boolean = true): VerificationResult => {
    const results = addRule(uid, "precise_uid");
    if (isTip) {
        eventEmitter.send('el-notify', {
            title: '添加精确uid操作提示',
            message: results.res,
            type: 'success'
        })
        return results
    }
    return results;
}
/**
 * 添加精确bv
 * @param bv {string} bv
 * @param isTip {boolean} 是否提示，默认true，则默认提示，如果为false则不提示，返回结果
 * @returns {{status: boolean, res: (string|number)}|{status: boolean, res: string}|{status: boolean, res: string}}
 */
const addRulePreciseBv = (bv: string, isTip: boolean = true): VerificationResult => {
    const results = addRule(bv, "precise_video_bv");
    if (isTip) {
        eventEmitter.send('el-notify', {
            title: '添加精确bv操作提示',
            message: results.res,
            type: 'success'
        })
        return results
    }
    return results;
}

/**
 * 删除精确uid
 * @param uid {number}
 * @param isTip {boolean} 是否提示，默认true，则默认提示，如果为false则不提示，返回结果
 * @returns {{status: boolean, res: string|number}|null}
 */
const delRUlePreciseUid = (uid: number, isTip: boolean = true): VerificationResult | null => {
    const results = delRule('precise_uid', uid)
    if (isTip) {
        eventEmitter.send('el-alert', results.res)
        return null
    }
    return results
}

/**
 * 添加精确name
 * @param name {string}
 * @param tip {boolean} 是否提示,默认true，则默认提示，如果为false则不提示，返回结果
 * @returns {{status: boolean, res: string}|null}
 */
const addRulePreciseName = (name: string, tip: boolean = true): VerificationResult => {
    const results = addRule(name, "precise_name");
    if (tip) {
        eventEmitter.send('el-msg', results.res)
    }
    return results;
}

/**
 * 查找规则项，返回匹配的值，如果找不到则返回null
 * @param type {string}
 * @param value {string|number}
 * @returns {number|string|null}
 */
const findRuleItemValue = (type: string, value: string | number): number | string | null => {
    return (GM_getValue(type, []) as (string | number)[]).find(item => item === value) || null
}

interface AddItemRuleResult {
    status: boolean;
    msg: string;
}

/**
 * 添加规则项
 * @param arr {[]} 要添加的内容数组
 * @param key {string}
 * @param coverage {boolean} 是否覆盖，默认true，如果为false则追加
 */
const addItemRule = (arr: (string | number)[], key: string, coverage: boolean = true): AddItemRuleResult => {
    const complianceList: (string | number)[] = []
    for (let v of arr) {
        const {status, res} = verificationInputValue(v, key)
        if (!status) return {status: false, msg: `内容中有误:${res}`}
        complianceList.push(v)
    }
    if (coverage) {
        GM_setValue(key, complianceList)
        return {status: true, msg: `添加成功-覆盖模式，数量：${complianceList.length}`}
    }
    const oldArr = GM_getValue(key, []) as (string | number)[];
    const newList = complianceList.filter(item => !oldArr.includes(item))
    if (newList.length === 0) {
        return {status: false, msg: '内容重复'}
    }
    GM_setValue(key, oldArr.concat(newList))
    return {status: true, msg: '添加成功-追加模式，新增数量：' + newList.length}
}

/**
 * 批量添加精确uid项
 * @param uidArr {[]} uid数组
 * @param isTip {boolean} 是否提示，默认true，则默认提示，如果为false则不提示，返回结果
 * @param coverage {boolean} 是否覆盖，默认true，如果为false则追加
 * @returns {{msg:string, status: boolean}|null|boolean}
 */
const addPreciseUidItemRule = (uidArr: number[], isTip: boolean = true, coverage: boolean = true): AddItemRuleResult | boolean => {
    const {status, msg} = addItemRule(uidArr, 'precise_uid', coverage)
    if (isTip) {
        eventEmitter.send('el-alert', msg)
        return status
    }
    return {status, msg}
}

/* ============================ 多类型批量规则 ============================ */

export type MultiTypeOperation = 'add' | 'remove';

export interface MultiTypeValidationRow {
    type: string;
    name: string;
    newCount: number;
    existsCount: number;
    invalidCount: number;
    conflictCount: number;
    removedCount: number;
    notFoundCount: number;
}

export interface MultiTypeValidationResult {
    rows: MultiTypeValidationRow[];
    totalTypes: number;
    totalValues: number;
    totalItems: number;
    totalNew: number;
    totalExists: number;
    totalInvalid: number;
    totalConflict: number;
    totalRemoved: number;
    totalNotFound: number;
    intRequired: boolean;
    intInvalidValues: string[];
    regexInvalidValues: string[];
    whitelistSelected: boolean;
    whitelistConflict: boolean;
    videoTagConflictValues: string[];
    highRiskTypes: string[];
    canSubmit: boolean;
}

export interface MultiTypeAddRow {
    type: string;
    name: string;
    added: (string | number)[];
    duplicates: (string | number)[];
    invalid: (string | number)[];
    conflicts: (string | number)[];
}

export interface MultiTypeAddResult {
    rows: MultiTypeAddRow[];
    totalAdded: number;
    totalDuplicates: number;
    totalInvalid: number;
    totalConflicts: number;
}

export interface MultiTypeDelRow {
    type: string;
    name: string;
    removed: (string | number)[];
    notFound: (string | number)[];
    invalid: (string | number)[];
}

export interface MultiTypeDelResult {
    rows: MultiTypeDelRow[];
    totalRemoved: number;
    totalNotFound: number;
    totalInvalid: number;
}

/** 非负整数校验，拒绝 parseInt 会宽松接受的 "123abc" */
const INT_VALUE_REGEX = /^\d+$/;

/** 高影响面类型：评论、动态、tag、弹幕、视频tag、直播分区、热搜、签名、简介 */
const HIGH_RISK_TYPES = new Set([
    'commentOn',
    'dynamic',
    'dynamic_video',
    'tag',
    'precise_tag',
    'liveBarrage',
    'videoBarrage',
    'videoTag',
    'precise_videoTag',
    'precise_partition',
    'hotSearchKey',
    'signature',
    'videoDesc'
]);

/**
 * 分割批量输入并去空、去重。
 * 先 trim 再判空/去重，避免 " 原神" 和 "原神" 被当成两项，也避免纯空格进入规则。
 */
const splitRuleValues = (input: string, separator: string): string[] => {
    const sep = separator === '' ? ',' : separator;
    const result: string[] = [];
    const seen = new Set<string>();
    for (const raw of input.split(sep)) {
        const value = raw.trim();
        if (value === '' || seen.has(value)) continue;
        seen.add(value);
        result.push(value);
    }
    return result;
};

const isValidIntValue = (value: string): boolean => INT_VALUE_REGEX.test(value);

const isValidRegexValue = (value: string): boolean => {
    try {
        new RegExp(value);
        return true;
    } catch {
        return false;
    }
};

const normalizeRuleValue = (value: string, isInt: boolean): string | number => {
    return isInt ? parseInt(value, 10) : value;
};

const getTypeValues = (type: string): (string | number)[] => {
    const value = GM_getValue(type, []);
    return Array.isArray(value) ? value as (string | number)[] : [];
};

/** 扁平化视频tag组合规则，用于检测和基础视频tag的互斥冲突 */
const getVideoTagCombinationValues = (): Set<string> => {
    const combinations = GM_getValue('videoTag_preciseCombination', [] as string[][]);
    const values = new Set<string>();
    if (!Array.isArray(combinations)) return values;
    for (const combination of combinations) {
        if (!Array.isArray(combination)) continue;
        for (const item of combination) {
            if (typeof item === 'string') values.add(item);
        }
    }
    return values;
};

/**
 * 校验多类型批量操作并生成预览统计。
 * 添加：任一数字类型入选时整组必须是非负整数，否则 canSubmit=false。
 * 移除：数字类型对非数字项按“非数字跳过”处理，不阻塞文本类型。
 */
const validateMultiTypeGroup = (
    values: string[],
    options: MultiTypeOption[],
    operation: MultiTypeOperation
): MultiTypeValidationResult => {
    const rows: MultiTypeValidationRow[] = [];
    const intRequired = options.some(option => option.isInt);
    const intInvalidValues = intRequired ? values.filter(value => !isValidIntValue(value)) : [];
    const hasRegexType = options.some(option => option.isRegex);
    const regexInvalidValues = operation === 'add' && hasRegexType
        ? values.filter(value => !isValidRegexValue(value))
        : [];
    const whitelistSelected = options.some(option => option.isWhitelist);
    const whitelistConflict = options.some(option => option.type === 'precise_uid_white')
        && options.some(option => option.type === 'precise_uid');
    const videoTagTypes = options.filter(option => option.isVideoTag);
    const combinationValues = videoTagTypes.length > 0 ? getVideoTagCombinationValues() : new Set<string>();
    const videoTagConflictValues = videoTagTypes.length > 0
        ? values.filter(value => combinationValues.has(value))
        : [];
    const highRiskTypes = options
        .filter(option => HIGH_RISK_TYPES.has(option.type))
        .map(option => option.type);

    for (const option of options) {
        const existing = new Set(getTypeValues(option.type));
        let newCount = 0;
        let existsCount = 0;
        let invalidCount = 0;
        let conflictCount = 0;
        let removedCount = 0;
        let notFoundCount = 0;

        for (const value of values) {
            if (option.isInt && !isValidIntValue(value)) {
                invalidCount++;
                continue;
            }
            if (operation === 'add' && option.isRegex && !isValidRegexValue(value)) {
                invalidCount++;
                continue;
            }
            if (operation === 'add' && option.isVideoTag && combinationValues.has(value)) {
                conflictCount++;
                continue;
            }
            const normalized = normalizeRuleValue(value, option.isInt);
            const exists = existing.has(normalized);
            if (operation === 'add') {
                if (exists) {
                    existsCount++;
                } else {
                    newCount++;
                    existing.add(normalized);
                }
            } else if (exists) {
                removedCount++;
                existing.delete(normalized);
            } else {
                notFoundCount++;
            }
        }

        rows.push({
            type: option.type,
            name: option.name,
            newCount,
            existsCount,
            invalidCount,
            conflictCount,
            removedCount,
            notFoundCount
        });
    }

    const totalNew = rows.reduce((sum, row) => sum + row.newCount, 0);
    const totalExists = rows.reduce((sum, row) => sum + row.existsCount, 0);
    const totalInvalid = rows.reduce((sum, row) => sum + row.invalidCount, 0);
    const totalConflict = rows.reduce((sum, row) => sum + row.conflictCount, 0);
    const totalRemoved = rows.reduce((sum, row) => sum + row.removedCount, 0);
    const totalNotFound = rows.reduce((sum, row) => sum + row.notFoundCount, 0);
    const totalItems = options.length * values.length;
    const canSubmit = options.length > 0 && values.length > 0 && (
        operation === 'add'
            ? intInvalidValues.length === 0 && totalNew > 0
            : totalRemoved > 0
    );

    return {
        rows,
        totalTypes: options.length,
        totalValues: values.length,
        totalItems,
        totalNew,
        totalExists,
        totalInvalid,
        totalConflict,
        totalRemoved,
        totalNotFound,
        intRequired,
        intInvalidValues,
        regexInvalidValues,
        whitelistSelected,
        whitelistConflict,
        videoTagConflictValues,
        highRiskTypes,
        canSubmit
    };
};

/**
 * 批量添加到多个类型。
 * 每个类型独立去重；数字类型存数字，文本类型存字符串；
 * 视频tag组合冲突、非法正则、非数字项按类型跳过并返回明细。
 */
const batchAddRules = (values: string[], options: MultiTypeOption[]): MultiTypeAddResult => {
    const hasVideoTagType = options.some(option => option.isVideoTag);
    const combinationValues = hasVideoTagType ? getVideoTagCombinationValues() : new Set<string>();
    const rows: MultiTypeAddRow[] = [];
    let totalAdded = 0;
    let totalDuplicates = 0;
    let totalInvalid = 0;
    let totalConflicts = 0;

    for (const option of options) {
        const existing = getTypeValues(option.type);
        const existingSet = new Set(existing);
        const added: (string | number)[] = [];
        const duplicates: (string | number)[] = [];
        const invalid: (string | number)[] = [];
        const conflicts: (string | number)[] = [];

        for (const value of values) {
            if (option.isInt && !isValidIntValue(value)) {
                invalid.push(value);
                continue;
            }
            if (option.isRegex && !isValidRegexValue(value)) {
                invalid.push(value);
                continue;
            }
            if (option.isVideoTag && combinationValues.has(value)) {
                conflicts.push(value);
                continue;
            }
            const normalized = normalizeRuleValue(value, option.isInt);
            if (existingSet.has(normalized)) {
                duplicates.push(value);
                continue;
            }
            existingSet.add(normalized);
            added.push(normalized);
        }

        if (added.length > 0) {
            GM_setValue(option.type, existing.concat(added));
        }
        totalAdded += added.length;
        totalDuplicates += duplicates.length;
        totalInvalid += invalid.length;
        totalConflicts += conflicts.length;
        rows.push({
            type: option.type,
            name: option.name,
            added,
            duplicates,
            invalid,
            conflicts
        });
    }

    return {rows, totalAdded, totalDuplicates, totalInvalid, totalConflicts};
};

/**
 * 批量从多个类型移除。
 * 数字类型对非数字项按“非数字跳过”处理，文本类型正常移除并返回不存在明细。
 */
const batchDelRules = (values: string[], options: MultiTypeOption[]): MultiTypeDelResult => {
    const rows: MultiTypeDelRow[] = [];
    let totalRemoved = 0;
    let totalNotFound = 0;
    let totalInvalid = 0;

    for (const option of options) {
        const existing = getTypeValues(option.type);
        const removed: (string | number)[] = [];
        const notFound: (string | number)[] = [];
        const invalid: (string | number)[] = [];

        for (const value of values) {
            if (option.isInt && !isValidIntValue(value)) {
                invalid.push(value);
                continue;
            }
            const normalized = normalizeRuleValue(value, option.isInt);
            const index = existing.indexOf(normalized);
            if (index === -1) {
                notFound.push(value);
                continue;
            }
            existing.splice(index, 1);
            removed.push(normalized);
        }

        if (removed.length > 0) {
            GM_setValue(option.type, existing);
        }
        totalRemoved += removed.length;
        totalNotFound += notFound.length;
        totalInvalid += invalid.length;
        rows.push({
            type: option.type,
            name: option.name,
            removed,
            notFound,
            invalid
        });
    }

    return {rows, totalRemoved, totalNotFound, totalInvalid};
};

export default {
    addRule,
    batchAddRule,
    showDelRuleInput,
    getRuleContent,
    overwriteImportRules,
    appendImportRules,
    addRulePreciseUid,
    addRulePreciseName,
    delRUlePreciseUid,
    findRuleItemValue,
    addItemRule,
    addPreciseUidItemRule,
    addRulePreciseBv,
    isRuleIntType,
    splitRuleValues,
    validateMultiTypeGroup,
    batchAddRules,
    batchDelRules
}
