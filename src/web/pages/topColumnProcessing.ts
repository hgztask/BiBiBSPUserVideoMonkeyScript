import localMKData from "../state/localMKData.ts";
import elUtil from "../core/util/elUtil.ts";

const leftSelectorCss = [
    '.link-navbar-ctnr .flex-block>a',
    'div.nav-items-ctnr>div>div>a',

].join(',')
/**
 * 获取直播分区、直播首页、直播间顶栏项
 */
const getLivePageTopColumnItem = () => {
    const dataList = []
    for (const el of document.querySelectorAll(leftSelectorCss)) {
        const fullClass = el.getAttribute('class');
        const attrName = el.getAttribute('name')
        if (fullClass === 'entry_logo') {
            dataList.push({label: "logo", el})
            continue
        }
        if (fullClass === 'entry-title') {
            dataList.push({label: "首页", el})
            continue
        }
        if (fullClass === "live") {
            dataList.push({label: "直播", el})
            continue
        }
        if (attrName) {
            dataList.push({label: attrName.trim(), el})
        }
    }
    for (const el of document.querySelectorAll('#right-part>.user-panel,#right-part>.shortcuts-ctnr>.shortcut-item')) {
        if (el.className.includes('user-panel')) {
            dataList.push({label: "个人logo", el})
            continue
        }
        const labelEl = el.querySelector('.text-label,.startlive-btn');
        if (!labelEl) continue
        const label = labelEl.textContent.trim()
        dataList.push({label, el})
    }
    return dataList
}

/**
 * 获取
 * 首页、动态首页、搜索页、播放页、个人动态页
 * 动态内容页(t.bilibili.com/动态id)
 * 动态内容页(www.bilibili.com/opus/动态id)
 * 顶栏项
 */
const getHomeTopColumnItem = () => {
    const dataList = []
    const elList = document.querySelectorAll('ul.left-entry>li');
    for (const el of elList) {
        const className = el.getAttribute('class');
        const entryTitleEl = el.querySelector('.left-entry__title,.entry-title');
        if (entryTitleEl) {
            const logoEl = el.querySelector('.left-entry__title>svg,.entry-title>svg');
            if (logoEl) {
                dataList.push({label: "logo", el: logoEl})
            }
            const homeEl = entryTitleEl.querySelector('.mini-header__title');
            if (homeEl) {
                dataList.push({label: "首页", el})
            }
            continue
        }
        if (className?.includes('left-loc-entry')) {
            const labelEl = elUtil.byXpathEl('.//a[@class="loc-entry"]|.//a[@class="loc-entry loc-moveclip"]//p[contains(@class,"loc-mc-box__text")][1]', el)
            if (!labelEl) continue
            const label = labelEl.textContent?.trim() ?? ''
            dataList.push({label, el})
            continue
        }
        const labelEl = el.querySelector('.v-popover-wrap>a,a p');
        if (!labelEl) continue
        const label = labelEl.textContent.trim()
        dataList.push({label, el})
    }
    for (const el of document.querySelectorAll('.right-entry>*')) {
        const className = el.getAttribute('class');
        if (className === "vip-wrap") {
            dataList.push({label: "大会员", el})
            continue
        }
        if (className?.includes('header-avatar-wrap')) {
            dataList.push({label: "个人logo", el})
            continue
        }
        if (className?.includes('right-entry-item--upload')) {
            dataList.push({label: "投稿", el})
            continue
        }
        const labelEl = el.querySelector('.right-entry-text')
        if (!labelEl) continue
        const label = labelEl.textContent.trim();
        dataList.push({label, el})
    }
    return dataList
}

const getTopColumnItem = () => {
    const url = location.href;
    if (url.includes('live.bilibili.com')) {
        return getLivePageTopColumnItem()
    }
    return getHomeTopColumnItem()
}

const hideTheLeftTopColumns = () => {
    const topColumns = localMKData.getHideTheLeftTopColumnsGm();
    if (topColumns.length === 0) return;
    for (const item of getTopColumnItem()) {
        const {label, el} = item;
        if (topColumns.includes(label)) {
            el.style.display = 'none'
        } else {
            el.style.display = ''
        }
    }
}

export default {
    /**
     * 执行隐藏页面顶栏侧栏目
     * 前一分钟间隔执行，之后结束定时器
     */
    processHideTheTopColumns(Interval = true) {
        if (Interval) {
            const i = setInterval(() => {
                if (localMKData.isTopBarColumnShieldingStatusGm() === false) {
                    return clearInterval(i)
                }
                hideTheLeftTopColumns()
            }, 2000)
            return setTimeout(() => {
                clearInterval(i)
            }, 1000 * 60)
        }
        hideTheLeftTopColumns()
    }
}