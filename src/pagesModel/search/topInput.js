import elUtil from "../../utils/elUtil.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import gmUtil from "../../utils/gmUtil.js";
import localMKData from "../../data/localMKData.js";


/**
 * 处理顶部搜索框内容
 * @returns {Promise<void>}
 */
const processTopInputContent = async () => {
    // 是否兼容BewlyBewly插件，如果开启之后，不处理
    if (localMKData.isCompatible_BEWLY_BEWLY()) {
        return
    }
    const targetInput = await elUtil.findElement('.nav-search-input')
    if (!gmUtil.getData('isClearTopInputTipContent', false)) {
        //没开启清空提示内容功能时结束
        return;
    }
    if (targetInput.placeholder === '') return;
    eventEmitter.send('打印信息', '清空了搜索框提示内容')
    targetInput.placeholder = '';
}


eventEmitter.on('执行清空顶部搜索框提示内容', () => {
    processTopInputContent()
})


export default {processTopInputContent}

