export default {
    //设置数据
    setData(key, content) {
        GM_setValue(key, content);
    },
    /**
     * 读取数据
     * @param key
     * @param defaultValue
     * @returns {[]|string|number|boolean}
     */
    getData(key, defaultValue) {
        return GM_getValue(key, defaultValue);
    },
    //删除数据
    delData(key) {
        if (!this.isData(key)) {
            return false;
        }
        GM_deleteValue(key);
        return true;
    },
    //判断数据是否存在
    isData(key) {
        return this.getData(key) !== undefined;
    },
    /**
     * 添加CSS样式
     * @param style CSS样式
     */
    addStyle(style) {
        GM_addStyle(style);
    },
    /**
     *注册一个菜单并返回菜单id，可在插件中点击油猴时看到对应脚本的菜单
     * @param {string}text 显示文本
     * @param {function}func 事件
     * @param {string}shortcutKey 快捷键
     * @return menu 菜单id
     */
    addGMMenu(text, func, shortcutKey = null) {
        return GM_registerMenuCommand(text, func, shortcutKey);
    },
}
