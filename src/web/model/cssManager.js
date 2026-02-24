import localMKData from "../data/localMKData.js";
import elUtil from "../utils/elUtil.js";
import videoCardHideAddSeeLaterButCss from '../css/videoCardHideAddSeeLaterBut.css'
import BEWLYHomeCss from '../css/BEWLYHome.css'
import liveRoomListAdaptiveCss from '../css/live_room_list_adaptive.css'

export default {
    run(url, title) {
        if (localMKData.isHideAddSeeLater()) {
            elUtil.installStyle(videoCardHideAddSeeLaterButCss, 'video_card_hide_add_see_later_but')
        }
    },
    //清除bewlyCat暴力隐藏样式
    clearBewlyCatStyle() {
        let loop = false;
        for (let el of document.querySelectorAll('style[rel="stylesheet"]')) {
            if (el.textContent.includes("body > *:not(#bewly):not(script):not(style)")) {
                loop = true;
                console.log('已删除bewlyCat暴力隐藏样式表', el, el.textContent)
                el.remove();
            }
        }
        if (loop) {
            elUtil.installStyle(BEWLYHomeCss)
        }
    },
    //隐藏首页视频列表上方的动态、热门、频道栏一整行
    hideHomeTopHeaderChannel(hide) {
        const styleTxt = hide ? `
        .bili-header__channel{
        height: 36px!important;
        visibility: hidden;
        }
        /* 向下滚动时顶部的频道栏 */
        .header-channel{
        display: none;
        }
        ` : `.bili-header__channel{
        height: 120px!important;
        visibility: visible;
        }
        /* 向下滚动时顶部的频道栏 */
        .header-channel{
        display: block;
        }
        `;
        elUtil.installStyle(styleTxt, '.mk-hide-home-top-header-channel');
    },
    //直播分区页房间列表自适应
    liveStreamPartitionStyle(show) {
        const selectorCss = '#live_room_list_adaptive';
        const el = document.querySelector(selectorCss);
        if (el && show === false) {
            el.textContent = '';
        } else {
            elUtil.installStyle(liveRoomListAdaptiveCss, selectorCss)
        }
    },
    // 更新弹窗element弹窗遮罩样式
    updateCssVModal() {
        elUtil.installStyle(`.v-modal  {
    z-index: auto !important;
}`, '.mk-css-v-modal')
    }
}