import gmUtil from "./utils/gmUtil.js";
import {eventEmitter} from "./model/EventEmitter.js";

gmUtil.addGMMenu('主面板', () => {
    eventEmitter.send('主面板开关')
}, 'Q')

gmUtil.addGMMenu('gf脚本更新页', () => {
    gmUtil.openInTab('https://greasyfork.org/zh-CN/scripts/461382')
}, 'W')

gmUtil.addGMMenu('脚本猫脚本更新页', () => {
    gmUtil.openInTab('https://scriptcat.org/zh-CN/script-show-page/1029')
}, 'E')
