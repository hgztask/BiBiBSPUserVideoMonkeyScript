import elUtil from "../utils/elUtil.js";
import dynamic from "./space/dynamic.js";
import gmUtil from "../utils/gmUtil.js";
import ruleMatchingUtil from "../utils/ruleMatchingUtil.js";
import {eventEmitter} from "../model/EventEmitter.js";
import defUtil from "../utils/defUtil.js";
import {blockCheckWhiteUserUid} from "../model/shielding/shielding.js";

//是否是动态首页
const isUrlPage = () => {
    return window.location.href.includes('t.bilibili.com') && document.title === "动态首页-哔哩哔哩";
}

//检查动态列表项执行屏蔽
const checkDynamicList = async () => {
    const dataList = await dynamic.getDataList();
    const arr = gmUtil.getData('dynamic', []);
    for (const v of dataList) {
        const {content, name, el, uid = -1} = v;
        if (uid !== -1) {
            if (blockCheckWhiteUserUid(uid)) continue;
        }
        if (content === "") continue;
        const match = ruleMatchingUtil.fuzzyMatch(arr, content);
        if (match === null) continue;
        el.remove();
        eventEmitter.send('打印信息', `用户${name}-动态内容${content}-匹配规则${match}`)
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
