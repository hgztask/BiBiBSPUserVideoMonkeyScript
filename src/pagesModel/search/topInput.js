import elUtil from "../../utils/elUtil.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import gmUtil from "../../utils/gmUtil.js";


/**
 * 处理顶部搜索框内容
 * @returns {Promise<void>}
 */
const processTopInputContent = async () => {
    const targetInput = await elUtil.findElement('.nav-search-input')
    if (!gmUtil.getData('isClearTopInputTipContent', false)) {
        return;
    }
    if (targetInput.placeholder === '') {
        return
    }
    eventEmitter.send('打印信息', '清空了搜索框提示内容')
    targetInput.placeholder = '';
}


eventEmitter.on('执行清空顶部搜索框提示内容', () => {
    processTopInputContent()
})


export default {processTopInputContent}

