import elUtil from "../../utils/elUtil.js";
import sFormatUtil from '../../utils/sFormatUtil.js'
import defUtil, {addGzStyle} from "../../utils/defUtil.js";
import video_shielding from "../../model/shielding/video_shielding.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import shielding from "../../model/shielding/shielding.js";
import globalValue from "../../data/globalValue.js";
//获取bewly的shadowRoot元素
let be_wly_el = null;

//排除执行的选项卡
const excludeTabNames = ['正在关注', '订阅剧集', '直播']
//排行左侧选项卡栏，排除的选项卡
const excludeRankingLeftTabNames = ['番剧', '综艺', '电视剧', '纪录片', '中国动画']

/**
 * 获取bewly的shadowRoot元素
 * @returns {Promise<ShadowRoot|Element|Document>}
 */
const getBewlyEl = async () => {
    if (be_wly_el === null) {
        let el = await elUtil.findElement('#bewly', {interval: 500, cachePromise: true, parseShadowRoot: true})
        be_wly_el = el;
        return el
    }
    return be_wly_el
}

//获取bewly的切换按钮的文本内容
const getBEWlyWitcherButtonTextContent = async () => {
    const el = await getBewlyEl()
    return el.querySelector('.bewly-bili-switcher-button').textContent
}

// 判断是否为BewlyCat插件生效的首页
const isBEWLYCatPlugin = async () => {
    const text = await getBEWlyWitcherButtonTextContent()
    return text.includes('BewlyCat');
}

/**
 * 是否是bewly插件主要页面
 * @param {string} url
 */
const isBEWLYPage = (url) => {
    return url.includes('www.bilibili.com/?page=') ||
        url === 'https://www.bilibili.com/'
        || url.startsWith('https://www.bilibili.com/?spm_id_from=')
}

/**
 * 获取排行左侧选项卡
 * @returns {Promise<[{label:string,el:Element|Document}]>}
 */
const getRankingLeftTabs = async () => {
    const beEl = await getBewlyEl()
    const elList = await elUtil.findElements('ul[flex="~ col gap-2"]>li', {doc: beEl})
    const list = [];
    for (let el of elList) {
        const label = el.textContent.trim()
        list.push({label, el})
    }
    return list
}

/**
 * 获取bewly的右侧选项卡
 * @returns {Promise<[{label:string,active:boolean,el:Element|Document}]>}
 */
const getRightTabs = async () => {
    const beEl = await getBewlyEl();
    const els = await elUtil.findElements(".dock-content-inner>.b-tooltip-wrapper", {doc: beEl})
    const list = [];
    for (let el of els) {
        const label = el.querySelector('.b-tooltip').textContent.trim()
        const active = !!el.querySelector('.dock-item.group.active')
        list.push({label, active, el})
    }
    return list;
}

/**
 * 获取视频列表
 * @returns {Promise<[]>}
 */
const getVideoList = async () => {
    const be_wly_el = await getBewlyEl()
    const elList = await elUtil.findElements('.video-card.group', {doc: be_wly_el})
    const list = [];
    const isBEWLYCatPluginVal = await isBEWLYCatPlugin()
    for (let el of elList) {
        const parentElement = el.parentElement.parentElement;
        const title = el.querySelector('.keep-two-lines>a[title]').textContent.trim();
        const userUrlEl = el.querySelector('.channel-name');
        const userUrl = userUrlEl.href;
        const uid = elUtil.getUrlUID(userUrl);
        const name = userUrlEl.textContent.trim();
        let nDuration, nPlayCount, bulletChat;
        if (isBEWLYCatPluginVal) {
            const statsEl = el.querySelector('.video-card-cover-stats')
            nDuration = statsEl.querySelector('.video-card-cover-stats__item--duration')?.textContent.trim() ?? null
            const othersStatsEls = statsEl.querySelectorAll('.video-card-cover-stats__items>.video-card-cover-stats__item>.video-card-cover-stats__value')
            nPlayCount = othersStatsEls[0].textContent.trim();
            bulletChat = othersStatsEls[1].textContent.trim();
            bulletChat = parseInt(bulletChat)
        } else {
            const playInfoEl = el.querySelector('[flex="~ items-center gap-1 wrap"]>div');
            nDuration = el.querySelector('[class*="group-hover:opacity-0"]')?.textContent.trim() || null;
            nPlayCount = playInfoEl.querySelector('span:first-child')?.textContent.trim() || null;
            bulletChat = playInfoEl.querySelector('span:last-of-type')?.textContent.trim() || null;
            if (playInfoEl.querySelectorAll('span').length < 2) {
                bulletChat = -1
            } else {
                bulletChat = sFormatUtil.toPlayCountOrBulletChat(bulletChat)
            }
        }
        nDuration = sFormatUtil.timeStringToSeconds(nDuration)
        nPlayCount = sFormatUtil.toPlayCountOrBulletChat(nPlayCount)
        const videoUrl = el.querySelector('[href*="https://www.bilibili.com/video"]')?.href;
        const bv = elUtil.getUrlBV(videoUrl)
        const insertionPositionEl = el.querySelector('[class="group/desc"]')
        list.push({
            title,
            name,
            uid,
            bv,
            userUrl,
            videoUrl,
            nPlayCount,
            bulletChat,
            nDuration,
            el: parentElement,
            insertionPositionEl,
            explicitSubjectEl: parentElement
        })
    }
    return list
}

//获取历史记录中的视频列表数据
const getHistoryVideoDataList = async () => {
    const beEL = await getBewlyEl()
    const elList = await elUtil.findElements("a.group[flex][cursor-pointer]", {doc: beEL})
    const list = []
    for (let el of elList) {
        const titleEl = el.querySelector('h3.keep-two-lines');
        const videoUrlEl = titleEl.parentElement;
        const userEl = videoUrlEl.nextElementSibling;
        const videoUrl = videoUrlEl.href;
        const bv = elUtil.getUrlBV(videoUrl)
        const userUrl = userEl.href
        const uid = elUtil.getUrlUID(userUrl)
        const name = userEl.textContent.trim()
        const title = titleEl?.textContent.trim()
        const tempTime = el.querySelector('div[pos][rounded-8]')?.textContent.trim().split(/[\t\r\f\n\s]*/g).join("")
        const match = tempTime?.match(/\/(.*)/);
        let nDuration = match?.[1]
        nDuration = sFormatUtil.timeStringToSeconds(nDuration)
        list.push({
            title,
            userUrl,
            name,
            uid,
            videoUrl,
            nDuration,
            bv,
            el,
            insertionPositionEl: videoUrlEl.parentElement,
            explicitSubjectEl: el
        })
    }
    return list
}

/**
 * 获取bewly首页中顶部选项卡
 * @returns {Promise<[{label:string,active:boolean,el:Element|Document}]>}
 */
const getHomeTopTabs = async () => {
    const beEl = await getBewlyEl()
    const els = beEl.querySelectorAll('.home-tabs-inside>[data-overlayscrollbars-contents]>button')
    const list = [];
    for (let el of els) {
        const label = el.textContent.trim()
        const active = el.classList.contains('tab-activated')
        list.push({label, active, el})
    }
    if (list.some(tab => tab.active === true)) {
        return list
    }
    return await getHomeTopTabs()
}

//开始执行屏蔽Bewly拓展中首页个性推荐和视频
const startShieldingVideoList = async () => {
    const list = await getVideoList()
    for (let videoData of list) {
        if (video_shielding.shieldingVideoDecorated(videoData)) {
            continue
        }
        eventEmitter.send('视频添加屏蔽按钮-BewlyBewly', {data: videoData, maskingFunc: startShieldingVideoList})
    }
}

/**
 * 间隔执行屏蔽视频列表包装函数
 * @type function
 * @returns {function(): {stop: stop, start: start}}
 */
const intervalExecutionStartShieldingVideo = () => {
    const res = shielding.intervalExecutionStartShieldingVideoInert(startShieldingVideoList, '视频');
    return () => {
        return res
    }
}

/**
 * 间隔执行屏蔽视频列表
 * @type function
 * @returns {{start: start, stop: stop}}
 */
const startShieldingVideo = intervalExecutionStartShieldingVideo();

//执行屏蔽历史记录中的视频
const startShieldingHistoryVideoList = async () => {
    const list = await getHistoryVideoDataList()
    for (let videoData of list) {
        if (video_shielding.shieldingVideoDecorated(videoData)) {
            continue
        }
        eventEmitter.send('视频添加屏蔽按钮', {data: videoData, maskingFunc: startShieldingHistoryVideoList})
    }
}

/**
 * 间隔执行屏蔽历史记录中的视频包装函数
 * @type function
 */
const intervalExecutionStartShieldingHistoryVideo = () => {
    const res = shielding.intervalExecutionStartShieldingVideoInert(startShieldingHistoryVideoList, '历史记录');
    return () => {
        return res
    }
};

/**
 * 间隔执行屏蔽历史记录视频列表
 * @type function
 * @returns {{start: start, stop: stop}}
 */
const startShieldingHistoryVideo = intervalExecutionStartShieldingHistoryVideo();


//添加顶部选项卡栏的监听器
const homeTopTabsInsertListener = () => {
    //监听顶部选项卡栏，个性推荐、正在关注该栏
    getHomeTopTabs().then(list => {
        for (let {el, label} of list) {
            el.addEventListener('click', () => {
                console.log('点击了' + label)
                if (excludeTabNames.includes(label)) {
                    startShieldingVideo().stop();
                    return
                }
                if (label === '排行') {
                    rankingLeftTabsInsertListener()
                }
                startShieldingVideo().start();
            })
        }
    })
}

/**
 * 添加排行左侧选项卡栏的监听器
 */
const rankingLeftTabsInsertListener = () => {
    getRankingLeftTabs().then(list => {
        for (let {el, label} of list) {
            el.addEventListener('click', () => {
                console.log('点击了' + label)
                if (excludeRankingLeftTabNames.includes(label)) {
                    startShieldingVideo().stop()
                    return
                }
                startShieldingVideo().start();
            })
        }
    })
}

//添加右侧选项卡栏的监听器
const rightTabsInsertListener = () => {
    getRightTabs().then(list => {
            for (let {el, label, active} of list) {
                el.addEventListener('click', () => {
                        console.log('右侧选项卡栏点击了' + label, active)
                        if (label === '首页') {
                            homeTopTabsInsertListener()
                            startShieldingVideo().start();
                        } else {
                            startShieldingVideo().stop();
                        }
                        if (label === '观看历史') {
                            startShieldingHistoryVideo().start()
                        } else {
                            startShieldingHistoryVideo().stop()
                        }
                    }
                )
            }
        }
    )
}

/**
 * 搜索框插入监听器
 * @returns null
 */
const searchBoxInsertListener = async () => {
    const beEl = await getBewlyEl()
    const input = await elUtil.findElement('[placeholder="搜索观看历史"]', {doc: beEl})
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.keyCode === 13) {
            console.log('回车键被按下');
            if (input['value'].length === 0) return
            setTimeout(startShieldingHistoryVideoList, 1500)
        }
    });
}

/**
 *
 * @param url
 * @returns null
 */
const run = async (url) => {
    const parseUrl = defUtil.parseUrl(url);
    const {page} = parseUrl.queryParams
    getBewlyEl().then(el => {
        addGzStyle(el, el);
    })
    if (page === 'Home' ||
        url.startsWith('https://www.bilibili.com/?spm_id_from=') ||
        url === 'https://www.bilibili.com/'
    ) {
        startShieldingVideo().start()
        homeTopTabsInsertListener()
    }
    if (page === 'History') {
        startShieldingHistoryVideo().start()
        searchBoxInsertListener()
    }
    rightTabsInsertListener()
}

/**
 * 检查页面的 bewly插件兼容性
 * @returns {Promise<void>|null}
 */
const check_BEWLYPage_compatibility = async () => {
    const el = await elUtil.findElement('#bewly', {interval: 200, cachePromise: true, timeout: 5000})
    if (el) {
        if (!globalValue.compatibleBEWLYBEWLY) {
            eventEmitter.send('el-alert', '检测到使用Bewly插件但未开启兼容选项，需要启用相关兼容选项才可正常使用')
        }
    } else {
        //如果页面中没有 bewly插件标志，且开启了兼容选项
        if (globalValue.compatibleBEWLYBEWLY) {
            eventEmitter.send('el-alert', '检测到未使用Bewly插件却开启了兼容选项，请关闭兼容选项或启用bilibili_gate脚本后再启用相关兼容选项')
        }
    }
}

export default {
    isBEWLYPage, run,
    check_BEWLYPage_compatibility
}