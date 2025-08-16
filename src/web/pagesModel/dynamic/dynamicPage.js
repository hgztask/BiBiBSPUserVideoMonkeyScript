import elUtil from "../../utils/elUtil.js";
import defUtil from "../../utils/defUtil.js";
import {enableDynamicItemsContentBlockingGm} from "../../data/localMKData.js";
import hotSearch from "../search/hotSearch.js";
import dynamicCommon from "./dynamicCommon.js";

//是否是动态首页
const isUrlDynamicHomePage = () => {
    return window.location.href.includes('t.bilibili.com') && document.title === "动态首页-哔哩哔哩";
}

//检查动态列表项执行屏蔽
const debounceCheckDynamicList = defUtil.debounce(() => {
    if (!enableDynamicItemsContentBlockingGm()) return
    dynamicCommon.commonCheckDynamicList();
}, 1000);

const run = () => {
    debounceCheckDynamicList()
    elUtil.findElement('div.bili-dyn-up-list__content').then(el => {
        console.log('已找到动态首页中顶部用户tabs栏', el);
        el.addEventListener('click', (event) => {
            const target = event.target;
            if (target['className'] === "shim") return
            debounceCheckDynamicList()
        })
    })
    hotSearch.startShieldingHotListDynamic();
}


export default {
    isUrlDynamicHomePage,
    run,
    debounceCheckDynamicList,
}
