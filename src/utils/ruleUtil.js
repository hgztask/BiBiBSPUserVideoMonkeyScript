import gmUtil from "./gmUtil.js";
import ruleKeyListData from '../data/ruleKeyListData.js'

/**
 *验证输入框的值
 * @param ruleValue 规则的实际值
 * @param type 类型
 * @returns {number|string|null}
 */
const verificationInputValue = (ruleValue, type) => {
    if (ruleValue === null) return null;
    if (type === "precise_uid" || type === "precise_uid_white") {
        ruleValue = parseInt(ruleValue);
        if (isNaN(ruleValue)) {
            Qmsg.info('请输入数字!')
            return null;
        }
    } else {
        ruleValue.trim();
    }
    if (ruleValue === '') {
        Qmsg.info('内容为空')
        return null;
    }
    return ruleValue;
}


/**
 * 添加规则
 * @param ruleValue {string|number} 规则的实际值
 * @param type {string} 类型
 * @returns {Promise<unknown>}
 */
const addRule = (ruleValue, type) => {
    const inputValue = verificationInputValue(ruleValue, type);
    return new Promise((resolve, reject) => {
            if (inputValue === null) {
                reject('取消添加');
                return;
            }
            const arr = gmUtil.getData(type, []);
            if (arr.includes(inputValue)) {
                reject('已存在此内容');
                return;
            }
            arr.push(inputValue);
            gmUtil.setData(type, arr);
            resolve('添加成功');
        }
    )
}

/**
 * 添加规则对话框
 * @param type {string} 类型
 * @returns {Promise<unknown>}
 */
const showAddRuleInput = (type) => {
    const ruleValue = window.prompt('请输入要添加的规则内容', '');
    return addRule(ruleValue, type);
}

const showDelRuleInput = (type) => {
    let prompt = window.prompt('请输入要移除的规则内容', '');
    const inputValue = verificationInputValue(prompt, type);
    return new Promise((resolve, reject) => {
        if (inputValue === null) {
            reject('取消添加');
            return;
        }
        const arr = gmUtil.getData(type, []);
        const indexOf = arr.indexOf(inputValue);
        if (indexOf === -1) {
            reject('不存在此内容');
            return;
        }
        arr.splice(indexOf, 1);
        gmUtil.setData(type, arr);
        resolve('移除成功');
    })
}

const showSetRuleInput = (type) => {
    let prompt = window.prompt('请输入要修改的规则内容', '');
    const inputValue = verificationInputValue(prompt, type);
    return new Promise((resolve, reject) => {
        if (inputValue === null) return;
        const arr = gmUtil.getData(type, []);
        const indexOf = arr.indexOf(inputValue);
        if (indexOf === -1) {
            reject('不存在此内容');
            return;
        }
        prompt = window.prompt('请输入要修改的内容', '');
        const newInputValue = verificationInputValue(prompt, type);
        if (newInputValue === null) return;
        if (arr.includes(newInputValue)) {
            reject('已存在要修改过后的值内容');
            return;
        }
        arr[indexOf] = newInputValue;
        gmUtil.setData(type, arr);
        resolve('修改成功');
    })
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
        xtip.msg(msg, {icon: 's'});
    }).catch(msg => {
        xtip.msg(msg, {icon: 'e'});
    })
}

/**
 * 添加精确name
 * @param name {string}
 * @returns null
 */
const addRulePreciseName = (name) => {
    return addRule(name, "precise_name").then(msg => {
        xtip.msg(msg, {icon: 's'});
    }).catch(msg => {
        xtip.msg(msg, {icon: 'e'});
    })
}


export default {
    addRule,
    showAddRuleInput,
    showDelRuleInput,
    showSetRuleInput,
    getRuleContent,
    overwriteImportRules,
    appendImportRules,
    overwriteImportRulesV1,
    getNewRuleKeyList,
    addRulePreciseUid,
    addRulePreciseName
}
