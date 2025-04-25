import elUtil from "../../utils/elUtil.js";
import {valueCache} from "../../model/localCache/valueCache.js";

//是否是用户空间页面
const isSpacePage = (url = window.location.href) => {
    return url.startsWith('https://space.bilibili.com/')
}

/**
 * 是否个人主页
 * todo 目前会出现非个人主页的情况但会返回true的情况，待后续修复
 * todo 2025年1月13日23:52:56，改成判断localStorage中值来作为是否是个人主页，待后续观察
 * todo 2025年1月26日18:44:11 改成检查顶部选项卡里是否有设置选项，有表明示个人主页，反之不是
 * @returns {Promise<boolean>}
 */
const isPersonalHomepage = async () => {
    const keyStr = 'isPersonalHomepage';
    const cache = valueCache.get(keyStr);
    if (cache) {
        return cache
    }
    //先尝试获取新版ui
    const {
        state: newState,
        data: newData
    } = await elUtil.findElements('.nav-tab__item .nav-tab__item-text', {timeout: 2500})
    if (newState) {
        const bool = newData.some(el => el.textContent.trim() === '设置');
        valueCache.set('space_version', 'new')
        return valueCache.set(keyStr, bool);
    }
    //旧ui定位设置
    let {state} = await elUtil.findElement('.n-tab-links>.n-btn.n-setting>.n-text', {timeout: 1500});
    valueCache.set('space_version', 'old')
    return valueCache.set(keyStr, state);
}


/**
 * 获取当前用户空间的uid和name信息
 * 已做缓存处理，第一次获取后会缓存，后续获取直接返回缓存数据
 * @returns {Promise<{name:string,uid:number}>}
 */
const getUserInfo = async () => {
    const spaceUserInfo = valueCache.get('space_userInfo');
    if (spaceUserInfo) {
        return spaceUserInfo
    }
    await isPersonalHomepage()
    const nameData = {}
    nameData.uid = elUtil.getUrlUID(window.location.href)
    if (valueCache.get('space_version', 'new') === 'new') {
        //获取新版ui用户名
        nameData.name = await elUtil.findElement('.nickname').then(el => el.textContent.trim())
    } else {
        //获取旧ui用户名
        nameData.name = await elUtil.findElement('#h-name').then(el => el.textContent.trim())
    }
    if (!nameData.name) {
        //新旧页面都获取不到用户name时，从title中获取用户name
        const title = document.title;
        nameData.name = title.match(/(.+)的个人空间/)[1]
    }
    valueCache.set('space_userInfo', nameData)
    return nameData
}


//个人空间主页相关
export default {
    isPersonalHomepage,
    isSpacePage,
    getUserInfo
}
