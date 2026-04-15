import localMKData from "../data/localMKData.js";
import elUtil from "../utils/elUtil.js";
import videoCardHideAddSeeLaterButCss from '../css/videoCardHideAddSeeLaterBut.css'
import BEWLYHomeCss from '../css/BEWLYHome.css'
import liveRoomListAdaptiveCss from '../css/live_room_list_adaptive.css'
import liveRoomDefCss from '../css/liveRoomDef.css'

export default {
    run() {
        if (localMKData.isHideAddSeeLater()) {
            elUtil.installStyle(videoCardHideAddSeeLaterButCss, {
                type: "class",
                value: "video_card_hide_add_see_later_but"
            })
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
        elUtil.installStyle(styleTxt, {type: 'class', value: 'mk-hide-home-top-header-channel'});
    },
    //直播分区页房间列表自适应
    liveStreamPartitionStyle(show) {
        elUtil.installStyle(show === false ? '' : liveRoomListAdaptiveCss, {
            type: 'id',
            value: 'live_room_list_adaptive'
        })
    },
    // 更新弹窗element弹窗遮罩样式
    updateCssVModal() {
        elUtil.installStyle(`.v-modal  {
    z-index: auto !important;
}`, {type: 'class', value: "mk-css-v-modal"})
    },
    //设置动态首页右侧布局的显隐
    setDynamicHomeRightLayHide(hide = true) {
        const cssText = hide ? `.bili-dyn-home--member > aside.right {display: none;}` : '';
        elUtil.installStyle(cssText, {type: 'class', value: "mk-css-dynamic-home-right-lay-hide"})
    },
    //插入直播间默认样式
    insertLiveRoomDefaultStyle() {
        elUtil.installStyle(liveRoomDefCss)
    }
}