import elUtil from "../../utils/elUtil.js";
import {eventEmitter} from "../../model/EventEmitter.js";

const isMessagePage = (url = window.location.href) => {
    return url.includes("message.bilibili.com");
}

// 修改顶部的z-index
const modifyTopItemsZIndex = () => {
    elUtil.findElement('#home_nav').then(el => {
        el.style.zIndex = 1000
        eventEmitter.send('添加信息', '已修改顶部的z-index值为1')
    })
}


export default {
    isMessagePage,
    modifyTopItemsZIndex,
}
