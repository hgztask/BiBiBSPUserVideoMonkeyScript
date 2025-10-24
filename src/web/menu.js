import {eventEmitter} from "./model/EventEmitter.js";
import globalValue from "./data/globalValue.js";

GM_registerMenuCommand('主面板', () => {
    eventEmitter.send('主面板开关')
}, 'Q')
GM_registerMenuCommand('脚本猫脚本更新页', () => {
    GM_openInTab(globalValue.scriptCat_js_url)
}, 'E')

GM_registerMenuCommand('gf脚本更新页', () => {
    GM_openInTab('https://greasyfork.org/zh-CN/scripts/461382')
}, 'W')

GM_registerMenuCommand('加入or反馈', () => {
    GM_openInTab(globalValue.group_url)
}, "T")

GM_registerMenuCommand('常见问题', () => {
    GM_openInTab(globalValue.common_question_url)
}, 'Y')

GM_registerMenuCommand('更新日志', () => {
    GM_openInTab(globalValue.update_log_url)
}, 'U')
