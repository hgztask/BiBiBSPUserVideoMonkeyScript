import localMKData from "../state/localMKData.ts"
import elUtil from "../core/elUtil.ts"
import videoCardHideAddSeeLaterButCss from '../ui/videoCardHideAddSeeLaterBut.css'
import BEWLYHomeCss from '../ui/BEWLYHome.css'
import liveRoomListAdaptiveCss from '../ui/live_room_list_adaptive.css'
import liveRoomDefCss from '../ui/liveRoomDef.css'

export default {
    run(url?: string, title?: string): void {
        if (localMKData.isHideAddSeeLater()) {
            elUtil.installStyle(videoCardHideAddSeeLaterButCss, {
                type: "class",
                value: "video_card_hide_add_see_later_but"
            })
        }
    },
    clearBewlyCatStyle(): void {
        let loop = false
        for (let el of document.querySelectorAll('style[rel="stylesheet"]')) {
            if (el.textContent?.includes("body > *:not(#bewly):not(script):not(style)")) {
                loop = true
                console.log('已删除bewlyCat暴力隐藏样式表', el, el.textContent)
                el.remove()
            }
        }
        if (loop) {
            elUtil.installStyle(BEWLYHomeCss)
        }
    },
    hideHomeTopHeaderChannel(hide: boolean): void {
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
        `
        elUtil.installStyle(styleTxt, {type: 'class', value: 'mk-hide-home-top-header-channel'})
    },
    liveStreamPartitionStyle(show: boolean): void {
        elUtil.installStyle(show === false ? '' : liveRoomListAdaptiveCss, {
            type: 'id',
            value: 'live_room_list_adaptive'
        })
    },
    updateCssVModal(): void {
        elUtil.installStyle(`.v-modal  {
    z-index: auto !important;
}`, {type: 'class', value: "mk-css-v-modal"})
    },
    setDynamicHomeRightLayHide(hide: boolean = true): void {
        const cssText = hide ? `.bili-dyn-home--member > aside.right {display: none;}` : ''
        elUtil.installStyle(cssText, {type: 'class', value: "mk-css-dynamic-home-right-lay-hide"})
    },
    insertLiveRoomDefaultStyle(): void {
        elUtil.installStyle(liveRoomDefCss)
    }
}
