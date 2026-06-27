import elUtil from "../../core/util/elUtil.ts";
import {eventEmitter} from "@/core/EventEmitter.ts";
import {valueCache} from "@/core/cache/valueCache.ts";
import defUtil from "../../core/util/defUtil.ts";
import globalValue from "../../config/globalValue.ts";


/**
 *
 * @returns {null}
 */
const setTopInputPlaceholder = async () => {
    // 是否兼容BewlyBewly插件，如果开启之后，不处理
    if (globalValue.compatibleBEWLYBEWLY) {
        return
    }
    const placeholder = valueCache.get('topInputPlaceholder');
    if (placeholder === null) {
        return
    }
    const targetInput = await elUtil.findElement('.nav-search-input')
    ;(targetInput as any).placeholder = placeholder
    eventEmitter.send('el-notify', {
        title: "tip",
        message: '已恢复顶部搜索框提示内容'
    })
}


/**
 * 处理顶部搜索框内容
 * @returns {Promise<void>|null}
 */
const processTopInputContent = async () => {
    // 是否兼容BewlyBewly插件，如果开启之后，不处理
    if (globalValue.compatibleBEWLYBEWLY) {
        return
    }
    if (!GM_getValue('isClearTopInputTipContent', false)) {
        //没开启清空提示内容功能时结束
        return;
    }
    const targetInput = await elUtil.findElement('.nav-search-input')
    if ((targetInput as any).placeholder === '') {
        await defUtil.wait(1500)
        await processTopInputContent()
        return
    }
    // 缓存搜索框提示内容
    valueCache.set('topInputPlaceholder', (targetInput as any).placeholder);
    ;(targetInput as any).placeholder = '';
    eventEmitter.send('el-msg', '清空了搜索框提示内容')
}


eventEmitter.on('执行清空顶部搜索框提示内容', () => {
    processTopInputContent()
})


export default {processTopInputContent, setTopInputPlaceholder}

