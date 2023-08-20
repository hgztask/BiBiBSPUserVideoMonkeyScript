//匹配数组元素
const Matching = {
    /**
     * 根据用户提供的网页元素和对应的数组及key，精确匹配数组某个元素
     * @param arr 数组
     * @param key 唯一key
     * @returns {boolean}
     */
    arrKey(arr, key) {
        if (arr === null || arr === undefined) {
            return false;
        }
        return arr.includes(key);
    },
    /**
     * 根据用户提供的字符串集合，当content某个字符包含了了集合中的某个字符则返回对应的字符，模糊匹配
     * 反之返回null
     * @param {string[]}arr 字符串数组
     * @param {string}content 内容
     * @returns {null|string}
     */
    arrContent(arr, content) {
        if (arr === null || arr === undefined) {
            return null;
        }
        try {
            const lowerCase = Util.strTrimAll(content).toLowerCase();//将内容去重空格并把字母转成小写进行比较
            for (let str of arr) {
                if (lowerCase.includes(str)) {
                    return str;
                }
            }
        } catch (e) {
            return null;
        }
        return null;
    },
    /**
     * 根据用户提供的字符串集合，与指定内容进行比较，当content某个字符包含了了集合中的某个正则匹配则返回对应的字符，正则匹配
     * 反之返回null
     * @param {string[]}arr 字符串数组
     * @param {string}content 内容
     * @return {null|string}
     */
    arrContentCanonical(arr, content) {
        if (arr === null || arr === undefined) {
            return null;
        }
        try {
            const lowerCase = Util.strTrimAll(content).toLowerCase();//将内容去重空格并把字母转成小写进行比较
            for (let str of arr) {
                if (lowerCase.search(str) === -1) {
                    continue;
                }
                return str;
            }
        } catch (e) {
            return null;
        }
        return null;
    }
}