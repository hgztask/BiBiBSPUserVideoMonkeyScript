import elUtil from "../../utils/elUtil.js";
import ruleKeyListData from "../../data/ruleKeyListData.js";
import ruleMatchingUtil from "../../utils/ruleMatchingUtil.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import {isHideHotSearchesPanelGm, isHideSearchHistoryPanelGm} from "../../data/localMKData.js";


/**
 * 开始屏蔽热门搜索
 * @returns {Promise<void>|null}
 */
export const startShieldingHotList = async () => {
    if (isHideHotSearchesPanelGm()) {
        return;
    }
    const elList = await elUtil.findElements(".trendings-col>.trending-item",
        {interval: 2000})
    console.log("检查热搜关键词中...");
    const hotSearchKeyArr = ruleKeyListData.getHotSearchKeyArr();
    const hotSearchKeyCanonicalArr = ruleKeyListData.getHotSearchKeyCanonicalArr();
    for (let el of elList) {
        const label = el.textContent.trim()
        let match = ruleMatchingUtil.fuzzyMatch(hotSearchKeyArr, label);
        if (match) {
            el.remove();
            eventEmitter.send('打印信息', `根据模糊热搜关键词-【${match}】-屏蔽-${label}`)
            continue;
        }
        match = ruleMatchingUtil.regexMatch(hotSearchKeyCanonicalArr, label);
        if (match) {
            eventEmitter.send('打印信息', `根据正则热搜关键词-【${match}】-屏蔽-${label}`);
            el.remove();
        }
    }
}


/**
 * 设置顶部搜索框中的历史记录面板和热搜面板显示状态
 * @param hide {boolean} 是否隐藏
 * @param name {string} 面板名称，默认搜索历史。可选值：搜索历史，热搜
 * @param timeout
 */
const setTopSearchPanelDisplay = (hide, name = "搜索历史", timeout = -1) => {
    const css = name === "搜索历史" ? ".search-panel>.history" : ".search-panel>.trending";
    const msg = name === "搜索历史" ? "搜索历史" : "热搜";
    elUtil.findElement(css, {timeout}).then(res => {
        const el = timeout === -1 ? res : res.data;
        if (res['state'] === false) {
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
    run
}


