const UrleCrud = {//规则的增删改查
    /**
     * 单个元素进行添加
     * @param {Array} arr
     * @param {String,number} key
     * @param {String} ruleStrName
     */
    add(arr, key, ruleStrName) {
        arr.push(key);
        Util.setData(ruleStrName, arr);
        Qmsg.success(`添加${ruleStrName}的值成功=${key}`);
        Rule.ruleLength();
        return true;
    },
    /**
     * 批量添加，要求以数组形式
     * @param {Array} arr
     * @param {Array} key
     * @param ruleStrName
     */
    addAll(arr, key, ruleStrName) {
        let tempLenSize = 0;
        const set = new Set();
        for (let v of key) {
            if (arr.includes(v)) {
                continue;
            }
            tempLenSize++;
            arr.push(v);
            set.add(v);
        }

        if (tempLenSize === 0) {
            Print.ln("内容长度无变化，可能是已经有了的值")
            return;
        }
        Util.setData(ruleStrName, arr);
        Print.ln(`已添加个数${tempLenSize}，新内容为【${JSON.stringify(Array.from(set))}】`)
        Rule.ruleLength();
    },
    /**
     *
     * @param arr
     * @param key
     * @param ruleStrName
     * @return {boolean}
     */
    del(arr, key, ruleStrName) {
        const index = arr.indexOf(key);
        if (index === -1) {
            Print.ln("未有该元素！")
            return false;
        }
        arr.splice(index, 1);
        Util.setData(ruleStrName, arr);
        Print.ln("已经删除该元素=" + key);
        Rule.ruleLength();
        return true;
    }

}