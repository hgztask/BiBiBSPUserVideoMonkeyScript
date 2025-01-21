import elUtil from "../../utils/elUtil.js";
import sFormatUtil from '../../utils/sFormatUtil.js'
import shielding from "../../model/shielding.js";
import defUtil from "../../utils/defUtil.js";

/**
 * 获取bewly的shadowRoot元素
 * @returns {Promise<ShadowRoot>}
 */
const getBewlyEl = async () => {
    let el = await elUtil.findElementUntilFound('#bewly', {interval: 500})
    return el.shadowRoot;
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
 * 获取视频列表
 * @returns {Promise<[]>}
 */
const getVideoList = async () => {
    const beEl = await getBewlyEl();
    const elList = await elUtil.findElementsUntilFound('.video-card.group', {doc: beEl})
    const list = [];
    for (let el of elList) {
        const parentElement = el.parentElement.parentElement;
        const title = el.querySelector('.keep-two-lines>a[title]').textContent.trim();
        const userUrlEl = el.querySelector('.channel-name');
        const userUrl = userUrlEl.href;
        const uid = elUtil.getUrlUID(userUrl);
        const name = userUrlEl.textContent.trim();
        const playInfoEl = el.querySelector('[flex="~ items-center gap-1 wrap"]>div');
        let playCount = playInfoEl.querySelector('span:first-child')?.textContent.trim() || null;
        playCount = sFormatUtil.toPlayCountOrBulletChat(playCount)
        let bulletChat = playInfoEl.querySelector('span:last-of-type')?.textContent.trim() || null;
        if (playInfoEl.querySelectorAll('span').length < 2) {
            bulletChat = -1
        } else {
            bulletChat = sFormatUtil.toPlayCountOrBulletChat(bulletChat)
        }
        let nDuration = el.querySelector('[class*="group-hover:opacity-0"]')?.textContent.trim() || null;
        nDuration = sFormatUtil.timeStringToSeconds(nDuration)
        const videoUrl = el.querySelector('[href*="https://www.bilibili.com/video"]')?.href;
        const bv=elUtil.getUrlBV(videoUrl)
        const insertionPositionEl = el.querySelector('[class="group/desc"]')
        list.push({
            title,
            name,
            uid,
            bv,
            userUrl,
            videoUrl,
            playCount,
            bulletChat,
            nDuration,
            el: parentElement,
            insertionPositionEl,
            explicitSubjectEl: parentElement
        })
    }
    return list
}

/**
 * 获取bewly的右侧选项卡
 * @returns {Promise<[{label:string,active:boolean,el:Element|Document}]>}
 */
const getRightTabs = async () => {
    const beEl = await getBewlyEl();
    const els = await elUtil.findElementsUntilFound(".dock-content-inner>.b-tooltip-wrapper", {doc: beEl})
    const list = [];
    for (let el of els) {
        const label = el.querySelector('.b-tooltip').textContent.trim()
        const active = !!el.querySelector('.dock-item.group.active')
        list.push({label, active, el})
    }
    return list;
}


//获取历史记录中的视频列表数据
const getHistoryVideoDataList = async () => {
    const beEL = await getBewlyEl()
    const elList = await elUtil.findElementsUntilFound("a.group[flex][cursor-pointer]", {doc: beEL})
    const list = []
    for (let el of elList) {
        const titleEl = el.querySelector('h3.keep-two-lines');
        const videoUrlEl = titleEl.parentElement;
        const userEl = videoUrlEl.nextElementSibling;
        const videoUrl = videoUrlEl.href;
        const bv=elUtil.getUrlBV(videoUrl)
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


//执行屏蔽历史记录中的视频
const startShieldingHistoryVideoList = async () => {
    const list = await getHistoryVideoDataList()
    for (let videoData of list) {
        if (shielding.shieldingVideoDecorated(videoData)) {
            continue
        }
        shielding.addVideoBlockButton({data: videoData, maskingFunc: startShieldingHistoryVideoList})
    }
}


//开始执行屏蔽BewlyBewly中首页个性推荐和人视频
const startShieldingVideoList = async () => {
    const list = await getVideoList()
    for (let videoData of list) {
        if (shielding.shieldingVideoDecorated(videoData)) {
            continue
        }
        addVideoBlockButton({data: videoData, maskingFunc: startShieldingVideoList})
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
 * 间隔执行屏蔽视频列表
 * @type function
 * @returns {{start: start, stop: stop}}
 */
const startShieldingVideo = intervalExecutionStartShieldingVideo();

/**
 * 间隔执行屏蔽历史记录视频列表
 * @type function
 * @returns {{start: start, stop: stop}}
 */
const startShieldingHistoryVideo = intervalExecutionStartShieldingHistoryVideo();
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
 * 获取bewly首页中顶部选项卡
 * @returns {Promise<[{label:string,active:boolean,el:Element|Document}]>}
 */
const getHomeTopTabs = async () => {
    const beEl = await getBewlyEl();
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

//排除执行的选项卡
const excludeTabNames = ['正在关注', '订阅剧集', '直播']


//排行左侧选项卡栏，排除的选项卡
const excludeRankingLeftTabNames = ['番剧', '综艺', '电视剧', '纪录片', '中国动画']


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
 * 获取排行左侧选项卡
 * @returns {Promise<[{label:string,el:Element|Document}]>}
 */
const getRankingLeftTabs = async () => {
    const beEl = await getBewlyEl();
    const elList = await elUtil.findElementsUntilFound('ul[flex="~ col gap-2"]>li', {doc: beEl})
    const list = [];
    for (let el of elList) {
        const label = el.textContent.trim()
        list.push({label, el})
    }
    return list
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

/**
 * 视频添加屏蔽按钮和指令
 * 适配BEWLYBEWLY插件
 * @param data {{}}
 * @param data.data {{}} 视频数据
 * @param data.maskingFunc {function} 屏蔽函数
 */
const addVideoBlockButton = (data) => {
    shielding.addBlockButton(data, "gz_shielding_button", ["right", 'bottom']);
}

/**
 * 插入样式
 */
const installBEWLStyle = () => {
    getBewlyEl().then(el => {
        gz_ui_css.addStyle(el, el)
    })
}

/**
 * 搜索框插入监听器
 * @returns null
 */
const searchBoxInsertListener = async () => {
    const beEl = await getBewlyEl()
    const input = await elUtil.findElementUntilFound('[placeholder="搜索观看历史"]', {doc: beEl})
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
const startRun = async (url) => {
    const parseUrl = defUtil.parseUrl(url);
    const {page} = parseUrl.queryParams
    installBEWLStyle()
    if (page === 'Home' || url.startsWith('https://www.bilibili.com/?spm_id_from=')) {
        startShieldingVideo().start()
        homeTopTabsInsertListener()
    }
    if (page === 'History') {

        startShieldingHistoryVideo().start()
        searchBoxInsertListener()
    }
    rightTabsInsertListener()
}

export default {
    startRun,
    isBEWLYPage,
}
