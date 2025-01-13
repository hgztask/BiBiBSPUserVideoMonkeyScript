import elUtil from "../../utils/elUtil.js";
import defUtil from "../../utils/defUtil.js";
import ruleKeyListData from "../../data/ruleKeyListData.js";
import ruleUtil from "../../utils/ruleUtil.js";
import {Tip} from "../../utils/Tip.js";

//是否是用户空间页面
const isSpacePage = (url) => {
    return url.startsWith('https://space.bilibili.com/')
}


/**
 * 是否个人主页
 * todo 目前会出现非个人主页的情况但会返回true的情况，待后续修复
 * todo 2025年1月13日23:52:56，改成判断localStorage中值来作为是否是个人主页，待后续观察
 * @returns boolean
 */
const isPersonalHomepage = () => {
    const data = defUtil.getLocalStorage('time_tracker', true, {})
    const dataKeys = Object.keys(data);
    if (dataKeys.length === 0) {
        return false
    }
    const tempUid=dataKeys[0]
    const urlUID = elUtil.getUrlUID(window.location.href);
    try {
        return parseInt(tempUid) === urlUID;
    } catch (e) {
        console.log('isPersonalHomepage出现错误',e)
        return false
    }
}


/**
 * 插入屏蔽按钮
 * @param el {Element|Document}
 * @param label {string}
 * @param callback {function}
 */
const __insertButton = (el, label, callback = null) => {
    debugger
    const liEl = document.createElement("li");
    liEl.textContent = label;
    liEl.className = 'be-dropdown-item';
    //在该元素的子元素之前插入
    el.insertAdjacentElement('afterbegin', liEl)
    liEl.addEventListener('click', callback)
}


/**
 * 初始化用户空间页面屏蔽按钮
 * 用户空间主页插入屏蔽按钮
 * 插入的位置为页面右侧关注和发消息旁边的菜单栏
 * @returns null
 */
const initializePageBlockingButton = async () => {
    const is = isPersonalHomepage()
    //个人主页，不做屏蔽按钮处理
    if (is) return
    const el = await elUtil.findElementUntilFound('.be-dropdown.h-add-to-black .be-dropdown-menu.menu-align-')
    const urlUID = elUtil.getUrlUID(window.location.href);
    const nameEl = await elUtil.findElementUntilFound('#h-name')
    if (ruleKeyListData.getPreciseUidArr().includes(urlUID)) {
        xtip.msg('当前用户为已标记uid黑名单')
        return
    }
    const name = nameEl.textContent
    const name_label = '用户名精确屏蔽';
    __insertButton(el, name_label, () => {
        xtip.confirm(`屏蔽的对象为${urlUID}【${name}】`, {
            title: name_label, icon: "a",
            btn1: () => {
                ruleUtil.addRulePreciseName(name)
            }
        })
    })
    const uid_label = 'uid精确屏蔽';
    __insertButton(el, uid_label, () => {
        xtip.confirm(`屏蔽的对象为${urlUID}【${name}】`, {
            title: uid_label, icon: "a",
            btn1: () => {
                ruleUtil.addRulePreciseUid(urlUID)
            }
        })
    })
    Tip.infoBottomRight('用户空间页面屏蔽按钮插入成功')
}


export default {
    isPersonalHomepage,
    initializePageBlockingButton,
    isSpacePage
}
