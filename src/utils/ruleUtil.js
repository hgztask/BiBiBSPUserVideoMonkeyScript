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
 * @returns {Promise<unknown>}
 */
const addRule = async (ruleValue, type) => {
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
 * 添加规则对话框
 * @param type {string} 类型
 * @returns {null}
 */
const showAddRuleInput = async (type) => {
    let ruleValue;
    try {
        const {value} = await eventEmitter.invoke('el-prompt', '请输入要添加的规则内容', 'tip');
        ruleValue = value
    } catch (e) {
        return
    }
    const {res} = await addRule(ruleValue, type)
    eventEmitter.send('el-msg', res)
    eventEmitter.send('刷新规则信息')
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
    const {status, res} = verificationInputValue(ruleValue, type);
    if (!status) {
        eventEmitter.send('el-msg', res)
        return
    }
    const arr = gmUtil.getData(type, []);
    const indexOf = arr.indexOf(res);
    if (indexOf === -1) {
        eventEmitter.send('el-msg', '不存在此内容')
        return;
    }
    arr.splice(indexOf, 1);
    gmUtil.setData(type, arr);
    eventEmitter.send('el-msg', '移除成功')
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
 * @param keyArr {[]}
 * @param content {string}
 */
const overwriteImportRules = (keyArr, content) => {
    const map = verificationRuleMap(keyArr, content);
    if (map === false) return false;
    for (let key of Object.keys(map)) {
        gmUtil.setData(key, map[key]);
    }
    return true;
}

/**
 * 追加导入规则
 * @param keyArr {[]}
 * @param content {string}
 */
const appendImportRules = (keyArr, content) => {
    const map = verificationRuleMap(keyArr, content);
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
 * 获取新版本规则key列表
 */
const getNewRuleKeyList = () => {
    return ruleKeyListData.getRuleKeyListData();
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
 * @param uid
 * @returns {Promise<void>}
 */
const addRulePreciseUid = (uid) => {
    return addRule(uid, "precise_uid").then(msg => {
        eventEmitter.send('el-msg', msg)
    }).catch(msg => {
        eventEmitter.send('el-msg', msg)
    })
}

/**
 * 添加精确name
 * @param name {string}
 * @returns null
 */
const addRulePreciseName = (name) => {
    return addRule(name, "precise_name").then(msg => {
        eventEmitter.send('el-msg', msg)
    }).catch(msg => {
        eventEmitter.send('el-msg', msg)
    })
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


export default {
    addRule,
    showAddRuleInput,
    showDelRuleInput,
    getRuleContent,
    overwriteImportRules,
    appendImportRules,
    overwriteImportRulesV1,
    getNewRuleKeyList,
    addRulePreciseUid,
    addRulePreciseName,
    findRuleItemValue
}
