const UrleCrud = {//规则的增删改查
    addShow(ruleType, ruleName, content = null) {
        if (content === null) {
            content = prompt(`要添加的类型为${ruleName}，请在输入框中填写要添加的具体值规则.`);
            if (content === null) return false;
            content = content.trim();
            if (content === "") {
                Tip.error("请输入正确的内容！");
                return false;
            }
        }
        if (ruleType === "userUIDArr" || ruleType === "userWhiteUIDArr") {
            if (isNaN(content)) {
                Tip.error(`输入的内容不是一个数字！value=${content}`);
                return false;
            }
            content = parseInt(content);
        }
        debugger;
        if (!confirm(`是要添加的${ruleName}规则为：\n${content}\n类型为：${typeof content}`)) {
            return false;
        }
        let ruleDataList = Util.getData(ruleType, []);
        return this.add(ruleDataList, content, ruleType);
    },
    addAllShow(ruleType, ruleName, jsonStrContent) {
        let json;
        if (typeof jsonStrContent !== "string") {
            Tip.error("内容非字符串！");
            return;
        }
        jsonStrContent = jsonStrContent.trim();
        try {
            json = JSON.parse(jsonStrContent);
        } catch (e) {
            Tip.error(`内容不正确！内容需要数组或者json格式！错误信息=${e}`);
            console.error("内容不正确！内容需要数组或者json格式！错误信息", e);
            return;
        }
        if (ruleType === "userUIDArr" || ruleType === "userWhiteUIDArr") {//效验数组内元素是否是整数
            let tempLoop = false;
            for (let v of json) {
                if (typeof v !== "number" && Number.isInteger(v)) {
                    tempLoop = true;
                    break;
                }
            }
            if (tempLoop) {
                Tip.error(json, "数组中有个元素非数字或非整数！");
                return;
            }
        }
        const ruleList = Util.getData(ruleType, []);
        const res = this.addAll(ruleList, json, ruleType);
        if (res.code) {
            Tip.success(`已批量插入${ruleName}的规则`);
        } else {
            Tip.error(res.msg);
        }
    },
    /**
     * 单个元素进行添加
     * @param {Array} arr
     * @param {String,number} key
     * @param {String} ruleType
     */
    add(arr, key, ruleType) {
        if (arr.includes(key)) return false;
        arr.push(key);
        Util.setData(ruleType, arr);
        Tip.success(`添加${ruleType}的值成功=${key}`);
        window.RuleCRUDLayoutVue.updateRuleIndex();
        return true;
    },
    /**
     * 批量添加，要求以数组形式
     * @param {Array} ruleList
     * @param {Array} contentList
     * @param ruleType
     */
    addAll(ruleList, contentList, ruleType) {
        let tempLenSize = 0;
        const set = new Set(ruleList);
        tempLenSize = set.size;
        for (const value of contentList) {
            set.add(value);
        }
        if (set.size === tempLenSize) {
            return {
                code: false,
                msg: "内容长度无变化，可能是已经有了的值",
            };
        }
        const fromList = Array.from(set);
        Util.setData(ruleType, fromList);
        console.log(`已更新${ruleType}的数组`, fromList);
        window.RuleCRUDLayoutVue.updateRuleIndex();
        return {code: true};
    },
    /**
     *
     * @param ruleList
     * @param content
     * @param ruleType
     * @return {boolean}
     */
    del(ruleList, content, ruleType) {
        const index = ruleList.indexOf(content);
        if (index === -1) {
            return false;
        }
        ruleList.splice(index, 1);
        Util.setData(ruleType, ruleList);
        Tip.printLn("已经删除该元素=" + content);
        window.RuleCRUDLayoutVue.updateRuleIndex();
        return true;
    },
    delShow(ruleType, ruleName, content = null) {
        if (content === null) {
            content = prompt(`要删除的类型为${ruleName}，请在输入框中填写要添加的具体值规则.`);
            if (content === null) return false;
            content = content.trim();
            if (content === "") {
                Tip.error("请输入正确的内容！");
                return false;
            }
        }
        if (ruleType === "userUIDArr" || ruleType === "userWhiteUIDArr") {
            if (isNaN(content)) {
                Tip.error(`输入的内容不是一个数字！value=${content}`);
                return false;
            }
            content = parseInt(content);
        }
        if (!confirm(`是要删除的${ruleName}规则为：\n${content}\n类型为：${typeof content}`)) {
            return false;
        }
        let ruleDataList = Util.getData(ruleType, []);
        const isDel = this.del(ruleDataList, content, ruleType);
        if (isDel) {
            Tip.success(`删除指定规则内容成功！content=${content}`);
        } else {
            Tip.error(`删除失败，未找到该规则！content=${content}`);
        }
        return isDel;
    },
    delItem(ruleType) {
        if (!Util.isData(ruleType)) {
            return false;
        }
        Util.delData(ruleType)
        return true;
    },
    delItemShow(ruleType, ruleName) {
        if (!confirm(`是要删除指定项目${ruleName}的规则吗？`)) return;
        if (this.delItem(ruleType)) {
            Tip.success(`已删除${ruleName}的规则内容！`);
        } else {
            Tip.error(`删除失败！可能是不存在指定项目${ruleName}的规则内容！`);
        }
        window.RuleCRUDLayoutVue.updateRuleIndex();
    },
    /**
     *根据数组中的每一项rule名，删除对应存储在油猴脚本中的数据
     * @param ruleStrNameArr{Array} 删除成功之后的个数，和对应的rule名
     */
    delALl(ruleStrNameArr) {
        const info = {index: 0, ruleNameArr: []};
        for (let rule of ruleStrNameArr) {
            if (!Util.isData(rule)) {
                continue;
            }
            if (Util.delData(rule)) {
                info.index++;
                info.ruleNameArr.push(rule);
            }
        }
        return info;
    },
    findKey(ruleType, key, defaultValue = undefined) {
        if (!Util.isData(ruleType)) {
            return false;
        }
        return Util.getData(ruleType, defaultValue).includes(key);
    },
    findKeyShow(ruleType, ruleName, key = null) {
        if (key === null) {
            key = prompt(`输入要查询${ruleName}的具体规则值`);
            if (key === null) return;
        }
        if (ruleType === "userUIDArr" || ruleType === "userWhiteUIDArr") {
            if (isNaN(key)) {
                Tip.error(`输入的内容不是一个数字！value=${key}`);
                return false;
            }
            key = parseInt(key);
        }
        let tip;
        if (this.findKey(ruleType, key, [])) {
            tip = `搜索的${ruleName}规则值已存在！find=${key}`;
            Tip.success(tip);
            console.log(tip, key);
            Tip.printLn(tip);
            return;
        }
        tip = `搜索的${ruleName}规则值不存在！find=${key}`;
        Tip.error(tip);
        console.log(tip, key);
        Tip.printLn(tip);
    },
    setKey(ruleType, oldValue, newValue) {
        if (oldValue === newValue) return false;
        if (oldValue === '' || oldValue.includes(" ") || newValue === "" || newValue.includes(" ")) return false;
        const ruleList = Util.getData(ruleType, []);
        if (ruleList.length === 0) return false;
        if (ruleType === "userUIDArr" || ruleType === "userWhiteUIDArr") {
            if (isNaN(oldValue) || isNaN(newValue)) {
                return false;
            }
            oldValue = parseInt(oldValue);
            newValue = parseInt(newValue);
        }
        const indexOf = ruleList.indexOf(oldValue);
        if (indexOf === -1) return false;
        ruleList.splice(indexOf, 1, newValue);
        Util.setData(ruleType, ruleList);
        return true;
    },
    setKeyShow(ruleType, ruleName, oldValue = null, newValue = null) {
        if (oldValue === null || newValue || null) {
            const data = {};
            let oldVal = prompt(`请输入要修改${ruleName}规则的值`);
            if (oldVal === null) return;
            if (!confirm(`是要对${ruleName}规则中的${oldVal}值进行修改更换吗？`)) return;
            const newVal = prompt(`请输入要修改${ruleName}规则的中${oldVal}之后的值`);
            if (newVal === "取消了操作.") return;
            oldValue = oldVal;
            newValue = newVal;
        }
        if (this.setKey(ruleType, oldValue, newValue)) {
            Tip.success(`修改${ruleName}规则成功！,已将 ${oldValue} 修改成 ${newValue}的值！`);
            return;
        }
        Tip.error(`修改${ruleName}规则失败！`);
    }
}