import cssContent from '../../css/live-partition.css';
import elUtil from "../../utils/elUtil.js";

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
const setLivePageRightSidebarHide = (hided = false) => {
    elUtil.findElement('#area-tags>div>aside,#sidebar-vm').then(el => {
        el.style.display = hided ? 'none' : '';
    })
}


export default {
    addStyle, setLivePageRightSidebarHide
}
