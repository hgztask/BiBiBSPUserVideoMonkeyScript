export default {
    //设置数据
    setData(key, content) {
        GM_setValue(key, content);
    },
    /**
     * 读取数据
     * @param key
     * @param defaultValue
     * @returns {[string]|[number]|[any]|boolean|number|string}
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
    /**
     * 打开新标签页
     * 使用参数url打开一个新的tab，options可以是以下值
     *  另外，新的选项卡将被添加。
     * @param url {string}
     * @param options {{}}
     * @param options.active {boolean} 决定新的tab是否被聚焦，聚焦的意思是直接显示
     * @param options.insert {boolean} 插入一个新的tab在当前的tab后面
     * @param options.setParent {boolean}在tab关闭后重新聚焦当前tab
     */
    openInTab(url, options = {active: true, insert: true, setParent: true}) {
        GM_openInTab(url, options)
    }
}
