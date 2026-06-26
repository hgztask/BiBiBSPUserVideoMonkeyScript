import elUtil from "../core/elUtil.ts";
import {eventEmitter} from "../core/EventEmitter.ts";

const isMessagePage = (url: any = window.location.href) => {
    return url.includes("message.bilibili.com");
}

// 修改顶部的z-index
const modifyTopItemsZIndex = () => {
    elUtil.findElement('#home_nav').then(el => {
        if (!el) return
        el.style.zIndex = '1000'
        eventEmitter.send('打印信息', '已修改顶部的z-index值为1')
    })
}


export default {
    isMessagePage,
    modifyTopItemsZIndex,
}
