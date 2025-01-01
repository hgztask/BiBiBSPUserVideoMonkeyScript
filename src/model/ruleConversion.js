import ruleKeyListData from "../data/ruleKeyListData.js";
import gmUtil from "../utils/gmUtil.js";

/**
 * 旧版规则转新版规则
 * 读取存储在插件里的规则数据，并转换成新版规则数据
 */
const oldToNewRule = () => {
    /**
     *
     * @type {[{key:string,name:string,oldKey:string,oldName:string}]}
     */
    const listData = ruleKeyListData.getRuleKeyListData().filter(item => item.oldKey);
    debugger
    for (let data of listData) {
        const oldKeyDataArr = gmUtil.getData(data.oldKey, []);
        // 如果旧数据为空，则跳过
        if (oldKeyDataArr.length === 0) {
            continue
        }
        const newKeyDataArr = gmUtil.getData(data.key, []);
        // 如果新数据为空，则直接用旧数据覆盖新规则
        if (newKeyDataArr.length === 0) {
            gmUtil.setData(data.key, oldKeyDataArr)
            gmUtil.delData(data.oldKey)
            continue
        }
        //如果新旧数据都不为空，则合并新旧数据
        for (let v of oldKeyDataArr) {
            // 如果旧数据存在，则判断是否已存在
            const isExist = newKeyDataArr.find(item => item === v);
            // 如果不存在，则添加
            if (!isExist) {
                newKeyDataArr.push(v)
            }
        }
        gmUtil.setData(data.key, newKeyDataArr)
    }
}

//规则转换模块
export default {
    oldToNewRule
}
