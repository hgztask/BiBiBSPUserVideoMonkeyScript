import cssContent from '../../ui/styles/live-partition.css?raw';
import elUtil from "../../core/util/elUtil.ts";
import {eventEmitter} from "@/core/EventEmitter.ts";
import {sendShieldLog} from "@/core/shieldLog.ts";

const addStyle = () => {
    const style = document.createElement('style');
    style.textContent = cssContent;
    document.head.appendChild(style);
}

/**
 * 设置直播页面的右侧边栏显隐
 * 直播分区和直播间
 * @param hided {boolean} 是否隐藏
 */
const setLivePageRightSidebarHide = (hided: any = false) => {
    elUtil.findElement('#area-tags>div>aside,#sidebar-vm.p-relative.z-sidebar.contain-optimize').then(el => {
        if (!el) return;
        el.style.display = hided ? 'none' : '';
        if (hided) sendShieldLog({source: "屏蔽", ruleType: "直播页右侧边栏", objectType: "页面元素", data: {target: "直播页右侧边栏"}});
    })
}

export default {
    addStyle, setLivePageRightSidebarHide
}
