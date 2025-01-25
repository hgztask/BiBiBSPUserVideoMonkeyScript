import gmUtil from "./utils/gmUtil.js";
import {eventEmitter} from "./model/EventEmitter.js";

gmUtil.addGMMenu('主面板', () => {
    eventEmitter.emit('主面板开关')
}, 'Q')

gmUtil.addGMMenu('脚本主页', () => {
    const aEl = document.createElement('a');
    aEl.target = '_blank';
    aEl.href = 'https://greasyfork.org/zh-CN/scripts/461382';
    aEl.click();
}, 'W')
