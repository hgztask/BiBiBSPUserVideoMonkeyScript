import elUtil from "../utils/elUtil.js";
import dynamic from "./space/dynamic.js";
import gmUtil from "../utils/gmUtil.js";
import {eventEmitter} from "../model/EventEmitter.js";
import defUtil from "../utils/defUtil.js";
import {blockCheckWhiteUserUid, blockDynamicItemContent} from "../model/shielding/shielding.js";
import {enableDynamicItemsContentBlockingGm} from "../data/localMKData.js";

//是否是动态首页
const isUrlPage = () => {
    return window.location.href.includes('t.bilibili.com') && document.title === "动态首页-哔哩哔哩";
}

//检查动态列表项执行屏蔽
const checkDynamicList = async () => {
    if (!enableDynamicItemsContentBlockingGm()) return
    const dataList = await dynamic.getDataList();
    const ruleArrMap = {
        fuzzyRuleArr: gmUtil.getData('dynamic', []),
        regexRuleArr: gmUtil.getData('dynamicCanonical', [])
    }
    for (const v of dataList) {
        const {content, name, el, uid = -1} = v;
        if (uid !== -1) {
            if (blockCheckWhiteUserUid(uid)) continue;
        }
        if (content === "") continue;
        const {state, matching, type} = blockDynamicItemContent(content, ruleArrMap);
        if (!state) continue;
        el.remove();
        eventEmitter.send('打印信息', `用户${name}-动态内容${content}-${type}-规则${matching}`)
        console.log(v);
    }
}

const debounceCheckDynamicList = defUtil.debounce(checkDynamicList, 1000);

const run = () => {
    debounceCheckDynamicList()
    elUtil.findElement('div.bili-dyn-up-list__content').then(el => {
        console.log('已找到动态首页中顶部用户tabs栏', el);
        el.addEventListener('click', (event) => {
            const target = event.target;
            if (target['className'] === "shim") return
            checkDynamicList()
        })
    })

}


export default {
    isUrlPage,
    run,
    debounceCheckDynamicList,
}
