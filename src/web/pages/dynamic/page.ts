import elUtil from "../../core/util/elUtil.ts";
import defUtil from "../../core/util/defUtil.ts";
import localMKData, {enableDynamicItemsContentBlockingGm, hidePersonalInfoCardGm} from "../../state/localMKData.ts";
import hotSearch from "../search/hot.ts";
import dynamicCommon from "./common.ts";
import cssManager from "../../domain/cssManager.ts";
import {eventEmitter} from "../../core/EventEmitter.ts";

//是否是动态首页
const isUrlDynamicHomePage = () => {
    return window.location.href.includes('t.bilibili.com') && document.title === "动态首页-哔哩哔哩";
}

//是否是动态内容页
const isUrlDynamicContentPage = () => {
    const href = window.location.href;
    const title = document.title;
    return (href.includes('t.bilibili.com') || href.includes('www.bilibili.com/opus')) &&
        (title.endsWith('的动态-哔哩哔哩') || title.includes('的动态 - 哔哩哔哩'));
}

//检查动态列表项执行屏蔽
const debounceCheckDynamicList = defUtil.debounce(() => {
    if (!enableDynamicItemsContentBlockingGm()) return
    dynamicCommon.commonCheckDynamicList();
}, 1000);

//隐藏首页个人资料卡
const hidePersonalInfoCard = (show: any) => {
    elUtil.findElement('.left>section').then(el => {
        if (!el) return;
        el.style.display = show ? 'none' : '';
    });
}

const run = () => {
    debounceCheckDynamicList()
    elUtil.findElement('div.bili-dyn-up-list__content').then(el => {
        if (!el) return;
        console.log('已找到动态首页中顶部用户tabs栏', el);
        el.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target?.className === "shim") return
            debounceCheckDynamicList()
        })
    })
    hotSearch.startShieldingHotListDynamic();
    if (hidePersonalInfoCardGm()) {
        hidePersonalInfoCard(true)
    }
    if (localMKData.isDynamicHomeRightLayHide()) {
        cssManager.setDynamicHomeRightLayHide()
    }
}


export default {
    isUrlDynamicHomePage,
    isUrlDynamicContentPage,
    run, hidePersonalInfoCard,
    debounceCheckDynamicList,
    // 隐藏回到旧版本按钮，根据配置选择隐藏
    runHideBackToOldVersionButFun(hide = false) {
        if (!(hide || localMKData.hideBackToOldVersionButGm())) return
        elUtil.byXpathElAsync('//div[@class="bili-dyn-sidebar"]/div[@class="bili-dyn-sidebar__btn" and span[text()="回到旧版"]]').then(el => {
            if (!el) return;
            el.remove()
            eventEmitter.send('打印信息', '已隐藏回到旧版按钮')
        })
    }
}
