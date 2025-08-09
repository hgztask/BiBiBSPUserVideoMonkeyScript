import gmUtil from "./gmUtil.js";
import ruleKeyListData from '../data/ruleKeyListData.js'
import {eventEmitter} from "../model/EventEmitter.js";

/**
 *验证输入框的值
 * @param ruleValue 规则的实际值
 * @param type 类型
 * @returns {{status: boolean, res: string|number}} 返回验证结果
 */
const verificationInputValue = (ruleValue, type) => {
    if (ruleValue === null) return {status: false, res: '内容不能为空'};
    if (type === "precise_uid" || type === "precise_uid_white") {
        ruleValue = parseInt(ruleValue);
        if (isNaN(ruleValue)) {
            return {
                status: false,
                res: '请输入数字！'
            };
        }
    } else {
        ruleValue.trim();
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
const addRule = (ruleValue, type) => {
    const verificationRes = verificationInputValue(ruleValue, type);
    if (!verificationRes.status) {
        return verificationRes
    }
    const arr = gmUtil.getData(type, []);
    if (arr.includes(verificationRes.res)) {
        return {status: false, res: '已存在此内容'};
    }
    arr.push(verificationRes.res);
    gmUtil.setData(type, arr);
    return {status: true, res: '添加成功'};
}

/**
 * 批量添加指定类型
 * @param ruleValues {[string]|[number]}
 * @param type {string}
 * @returns {{successList: [string|number], failList: [string|number]}}
 */
const batchAddRule = (ruleValues, type) => {
    const successList = [];
    const failList = [];
    const arr = gmUtil.getData(type, []);
    //是否是uid类型
    const isUidType = type.includes('uid');
    for (let v of ruleValues) {
        if (isUidType) {
            if (isNaN(v)) {
                failList.push(v);
                continue;
            }
            v = parseInt(v);
        }
        if (arr.includes(v)) {
            failList.push(v);
            continue;
        }
        arr.push(v);
        successList.push(v);
    }
    if (successList.length > 0) {
        gmUtil.setData(type, arr);
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
const delRule = (type, value) => {
    const verificationRes = verificationInputValue(value, type);
    if (!verificationRes.status) {
        return verificationRes
    }
    const {res} = verificationRes
    const arr = gmUtil.getData(type, []);
    const indexOf = arr.indexOf(res);
    if (indexOf === -1) {
        return {status: false, res: '不存在此内容'};
    }
    arr.splice(indexOf, 1);
    gmUtil.setData(type, arr);
    return {status: true, res: "移除成功"}
}

/**
 * 删除规则对话框
 * @param type {string}
 * @returns {null}
 */
const showDelRuleInput = async (type) => {
    let ruleValue;
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

/**
 *获取本地规则内容
 * @param space {number} 缩进
 * @return {string}
 */
const getRuleContent = (space = 0) => {
    const ruleMap = {};
    for (let ruleKeyListDatum of ruleKeyListData.getRuleKeyListData()) {
        const key = ruleKeyListDatum.key;
        ruleMap[key] = gmUtil.getData(key, []);
    }
    return JSON.stringify(ruleMap, null, space);
}

/**
 * 验证规则内容并获取核心的规则
 * @param keyArr {Array}
 * @param content {string}
 * @returns {boolean|Object}
 */
const verificationRuleMap = (keyArr, content) => {
    let parse;
    try {
        parse = JSON.parse(content);
    } catch (e) {
        alert('规则内容有误');
        return false;
    }
    const newRule = {};
    for (const key in parse) {
        if (!Array.isArray(parse[key])) {
            continue;
        }
        if (parse[key].length === 0) {
            continue;
        }
        newRule[key] = parse[key];
    }
    if (Object.keys(newRule).length === 0) {
        alert('规则内容为空');
        return false;
    }
    return newRule;
}

/**
 * 覆盖导入规则
 * @param content {string}
 */
const overwriteImportRules = (content) => {
    const map = verificationRuleMap(ruleKeyListData.getRuleKeyList(), content);
    if (map === false) return false;
    for (let key of Object.keys(map)) {
        gmUtil.setData(key, map[key]);
    }
    return true;
}

/**
 * 追加导入规则
 * @param content {string}
 */
const appendImportRules = (content) => {
    const map = verificationRuleMap(ruleKeyListData.getRuleKeyList(), content);
    if (map === false) return false;
    for (let key of Object.keys(map)) {
        const arr = gmUtil.getData(key, []);
        for (let item of map[key]) {
            if (!arr.includes(item)) {
                arr.push(item);
            }
        }
        gmUtil.setData(key, arr);
    }
    return true;
}

/**
 * 覆盖导入规则V1
 * 该函数用于解析和重写从V1版本升级上来的规则内容
 * 它会尝试解析给定的内容，然后根据预定义的规则键列表数据来更新或重写现有的规则
 *
 * @param {string} content - 包含规则的字符串内容，通常是从文件或输入中获取的
 * @returns {boolean} - 返回一个布尔值，表示规则解析和重写是否成功
 */
const overwriteImportRulesV1 = (content) => {
    // 初始化解析变量
    let parse;
    try {
        // 尝试解析输入内容，如果解析失败则弹出警报并返回false
        parse = JSON.parse(content);
    } catch (e) {
        alert('规则内容有误');
        return false;
    }
    // 遍历规则键列表数据，以便更新或重写规则
    for (let ruleKeyListDatum of ruleKeyListData.getRuleKeyListData()) {
        // 获取旧规则名称和对应的键
        const name = ruleKeyListDatum.oldName;
        const jsonRuleList = parse[name];
        // 如果当前规则不存在，则跳过
        if (!jsonRuleList) {
            continue;
        }
        // 如果规则列表为空，则跳过
        if (jsonRuleList.length === 0) {
            continue;
        }
        // 使用gmUtil工具类设置数据，更新或重写规则
        gmUtil.setData(ruleKeyListDatum.key, jsonRuleList);
    }

    // 规则解析和重写成功，返回true
    return true;
}

/**
 * 添加精确uid
 * @param uid {number}
 * @param isTip {boolean} 是否提示，默认true，则默认提示，如果为false则不提示，返回结果
 * @returns {{res: string, status: boolean}|{res: string, status: boolean}}
 */
const addRulePreciseUid = (uid, isTip = true) => {
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
const addRulePreciseBv = (bv, isTip = true) => {
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
const delRUlePreciseUid = (uid, isTip = true) => {
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
const addRulePreciseName = (name, tip = true) => {
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
const findRuleItemValue = (type, value) => {
    return gmUtil.getData(type, []).find(item => item === value) || null
}

/**
 * 添加规则项
 * @param arr {[]} 要添加的内容数组
 * @param key {string}
 * @param coverage {boolean} 是否覆盖，默认true，如果为false则追加
 */
const addItemRule = (arr, key, coverage = true) => {
    const complianceList = []
    for (let v of arr) {
        const {status, res} = verificationInputValue(v, key)
        if (!status) return {status: false, msg: `内容中有误:${res}`}
        complianceList.push(v)
    }
    if (coverage) {
        gmUtil.setData(key, complianceList)
        return {status: true, msg: `添加成功-覆盖模式，数量：${complianceList.length}`}
    }
    const oldArr = gmUtil.getData(key, []);
    const newList = complianceList.filter(item => !oldArr.includes(item))
    if (newList.length === 0) {
        return {status: false, msg: '内容重复'}
    }
    gmUtil.setData(key, oldArr.concat(newList))
    return {status: true, msg: '添加成功-追加模式，新增数量：' + newList.length}
}

/**
 * 批量添加精确uid项
 * @param uidArr {[]} uid数组
 * @param isTip {boolean} 是否提示，默认true，则默认提示，如果为false则不提示，返回结果
 * @param coverage {boolean} 是否覆盖，默认true，如果为false则追加
 * @returns {{msg:string, status: boolean}|null|boolean}
 */
const addPreciseUidItemRule = (uidArr, isTip = true, coverage = true) => {
    const {status, msg} = addItemRule(uidArr, 'precise_uid', coverage)
    if (isTip) {
        eventEmitter.send('el-alert', msg)
        return status
    }
    return {status, msg}
}

export default {
    addRule,
    batchAddRule,
    showDelRuleInput,
    getRuleContent,
    overwriteImportRules,
    appendImportRules,
    overwriteImportRulesV1,
    addRulePreciseUid,
    addRulePreciseName,
    delRUlePreciseUid,
    findRuleItemValue,
    addItemRule,
    addPreciseUidItemRule,
    addRulePreciseBv
}
