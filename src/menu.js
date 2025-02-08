import gmUtil from "./utils/gmUtil.js";
import {eventEmitter} from "./model/EventEmitter.js";
import globalValue from "./data/globalValue.js";

gmUtil.addGMMenu('主面板', () => {
    eventEmitter.send('主面板开关')
}, 'Q')
gmUtil.addGMMenu('脚本猫脚本更新页', () => {
    gmUtil.openInTab(globalValue.scriptCat_js_url)
}, 'E')

gmUtil.addGMMenu('gf脚本更新页', () => {
    gmUtil.openInTab('https://greasyfork.org/zh-CN/scripts/461382')
}, 'W')


gmUtil.addGMMenu('加入or反馈', () => {
    gmUtil.openInTab(globalValue.group_url)
}, "T")
