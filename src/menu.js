import gmUtil from "./utils/gmUtil.js";
import mainDrawer from "./layout/drawer/mainDrawer.js";

gmUtil.addGMMenu('主面板', () => {
    mainDrawer.showDrawer()
},'Q')

gmUtil.addGMMenu('脚本主页', () => {
    const aEl = document.createElement('a');
    aEl.target = '_blank';
    aEl.href = 'https://greasyfork.org/zh-CN/scripts/461382';
    aEl.click();
},'W')
