import elUtil from "../../utils/elUtil.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import gmUtil from "../../utils/gmUtil.js";
import localMKData from "../../data/localMKData.js";
import {valueCache} from "../../model/localCache/valueCache.js";
import defUtil from "../../utils/defUtil.js";


/**
 *
 * @returns {null}
 */
const setTopInputPlaceholder = async () => {
    // 是否兼容BewlyBewly插件，如果开启之后，不处理
    if (localMKData.isCompatible_BEWLY_BEWLY()) {
        return
    }
    const placeholder = valueCache.get('topInputPlaceholder');
    if (placeholder === null) {
        return
    }
    const targetInput = await elUtil.findElement('.nav-search-input')
    targetInput.placeholder = placeholder
    eventEmitter.send('el-notify', {
        title: "tip",
        message: '已恢复顶部搜索框提示内容',
        position: 'bottom-right',
    })
}


/**
 * 处理顶部搜索框内容
 * @returns {Promise<void>}
 */
const processTopInputContent = async () => {
    // 是否兼容BewlyBewly插件，如果开启之后，不处理
    if (localMKData.isCompatible_BEWLY_BEWLY()) {
        return
    }
    if (!gmUtil.getData('isClearTopInputTipContent', false)) {
        //没开启清空提示内容功能时结束
        return;
    }
    const targetInput = await elUtil.findElement('.nav-search-input')
    if (targetInput.placeholder === '') {
        await defUtil.wait(1500)
        await processTopInputContent()
        return
    }
    // 缓存搜索框提示内容
    valueCache.set('topInputPlaceholder', targetInput.placeholder);
    targetInput.placeholder = '';
    eventEmitter.send('el-msg', '清空了搜索框提示内容')
}


eventEmitter.on('执行清空顶部搜索框提示内容', () => {
    processTopInputContent()
})


export default {processTopInputContent, setTopInputPlaceholder}

