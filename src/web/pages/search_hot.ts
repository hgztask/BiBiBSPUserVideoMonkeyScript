import elUtil from "../core/elUtil.ts";
import ruleKeyListData from "../config/ruleKeyListData.ts";
import ruleMatchingUtil from "../core/ruleMatchingUtil.ts";
import {eventEmitter} from "../core/EventEmitter.ts";
import {isHideHotSearchesPanelGm, isHideSearchHistoryPanelGm} from "../state/localMKData.ts";

//处理热搜词
const dealingWithHotSearchTerms = (el: any, label: any) => {
    const hotSearchKeyArr = ruleKeyListData.getHotSearchKeyArr();
    const hotSearchKeyCanonicalArr = ruleKeyListData.getHotSearchKeyCanonicalArr();
    let match = ruleMatchingUtil.fuzzyMatch(hotSearchKeyArr, label);
    if (match) {
        el.remove();
        eventEmitter.send('打印信息', `根据模糊热搜关键词-【${match}】-屏蔽-${label}`);
        return;
    }
    match = ruleMatchingUtil.regexMatch(hotSearchKeyCanonicalArr, label);
    if (match) {
        eventEmitter.send('打印信息', `根据正则热搜关键词-【${match}】-屏蔽-${label}`);
        el.remove();
    }
};

/**
 * 开始屏蔽热门搜索
 * @returns {Promise<void>|null}
 */
export const startShieldingHotList = async () => {
    if (isHideHotSearchesPanelGm()) {
        return;
    }
    console.log("检查热搜关键词中...");
    const elList = await elUtil.findElements(".trendings-col>.trending-item,.trendings-single>.trending-item",
        {interval: 2000})
    console.log('热搜元素列表', elList);
    for (let el of elList) {
        const label = el.textContent.trim()
        dealingWithHotSearchTerms(el, label);
    }
}

/**
 * //处理动态首页右侧热搜列表
 * @returns {Promise<void>|null}
 */
const startShieldingHotListDynamic = async () => {
    const elList = await elUtil.findElements('.trending-list>a');
    console.log('动态首页右侧热搜列表', elList);
    for (const el of elList) {
        const textEl = el.querySelector('.text');
        if (!textEl) {
            continue;
        }
        const label = textEl.textContent?.trim() || '';
        dealingWithHotSearchTerms(el, label);
    }
}


/**
 * 设置顶部搜索框中的历史记录面板和热搜面板显示状态
 * @param hide {boolean} 是否隐藏
 * @param name {string} 面板名称，默认搜索历史。可选值：搜索历史，热搜
 * @param timeout
 */
const setTopSearchPanelDisplay = (hide: any, name: any = "搜索历史", timeout: any = -1) => {
    const css = name === "搜索历史" ? ".search-panel>.history" : ".search-panel>.trending";
    const msg = name === "搜索历史" ? "搜索历史" : "热搜";
    elUtil.findElement(css, {timeout}).then(el => {
        if (el === null) {
            eventEmitter.send('el-msg', "未找到元素，可能是页面加载未完成，请稍后再试！");
            return
        }
        el.style.display = hide ? 'none' : 'block';
        eventEmitter.send('打印信息', `已将顶部搜索框${msg}显示状态为${hide ? '隐藏' : '显示'}`)
    })
}

const run = () => {
    setTopSearchPanelDisplay(isHideSearchHistoryPanelGm());
    setTopSearchPanelDisplay(isHideHotSearchesPanelGm(), "热搜");
}


export default {
    startShieldingHotList,
    setTopSearchPanelDisplay,
    run,
    startShieldingHotListDynamic
}


