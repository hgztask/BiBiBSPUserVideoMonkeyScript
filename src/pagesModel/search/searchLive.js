import elUtil from "../../utils/elUtil.js";
import css from '../../css/searchLive.css'
import shielding from "../../model/shielding/shielding.js";
import {elEventEmitter} from "../../model/elEventEmitter.js";
import live_shielding from "../../model/shielding/live_shielding.js";

//安装样式，该样式主要为修改搜索页的直播选项卡下的隐藏房间卡片，使其显示
const installStyle = () => {
    const styleElement = document.createElement('style');
    styleElement.textContent = css;
    document.head.appendChild(styleElement)
}


//获取直播列表
const getLiveRoomList = async () => {
    const elList = await elUtil.findElements('.live-room-cards>.video-list-item')
    const list = []
    for (let el of elList) {
        const titleAEl = el.querySelector('.bili-live-card__info--tit>a');
        const titleEl = el.querySelector('.bili-live-card__info--tit>a>span')
        const userEl = el.querySelector('.bili-live-card__info--uname')
        const liveUrl = titleAEl.href;
        const title = titleEl.textContent.trim();
        const userUrl = userEl.href;
        const uid = elUtil.getUrlUID(userUrl)
        const name = userEl.textContent.trim()
        list.push({
            title,
            liveUrl,
            name,
            userUrl,
            uid,
            el,
            explicitSubjectEl: el.querySelector('.bili-live-card__info'),
            insertionPositionEl: userEl
        })
    }
    return list
}


/**
 * 添加屏蔽按钮
 * @param data {{}}
 * @param data.data {{}} 数据
 * @param data.maskingFunc {function} 屏蔽函数
 * @param data
 */
const addBlockButton = (data) => {
    shielding.addBlockButton(data, '', ['right'])
}

// 屏蔽直播列表
const startShieldingLiveRoomList = async () => {
    const list = await getLiveRoomList()
    for (let liveData of list) {
        if (live_shielding.shieldingLiveRoomDecorated(liveData)) {
            continue
        }
        addBlockButton({data: liveData, maskingFunc: startShieldingLiveRoomList})
    }
}

/**
 * 直播选项顶部tabs安装监听器
 * @returns {Promise<void>|null}
 */
const InstallLiveTopTabsListener = async () => {
    const el = await elUtil.findElement('.live-condition')
    if (elEventEmitter.hasEventName(el, 'click')) return
    elEventEmitter.addEvent(el, 'click', async (event) => {
        /**
         * @type {Element|Document}
         */
        const target = event.target
        const label = target.textContent.trim();
        if (label === '主播') {
            return
        }
        await startShieldingLiveRoomList()
        InstallBottomPagingListener()
        installTopRoomOrderListener()
    })
    console.log("直播顶部选项卡安装监听器已安装")
}

/**
 * 安装底部分页监听器
 * @returns {Promise<void>|null}
 */
const InstallBottomPagingListener = async () => {
    const el = await elUtil.findElement('.vui_pagenation--btns')
    if (elEventEmitter.hasEventName(el, 'click')) return
    elEventEmitter.addEvent(el, 'click', async (event) => {
        /**
         * @type {Element|Document}
         */
        const target = event.target
        if (target.tagName !== 'BUTTON') {
            return
        }
        await startShieldingLiveRoomList()
        installTopRoomOrderListener()
    })
    console.log("底部分页安装监听器已安装")
}

/**
 * 安装顶部房间排序监听器
 * @returns {Promise<void>|null}
 */
const installTopRoomOrderListener = async () => {
    const el = await elUtil.findElement('.room-order')
    if (elEventEmitter.hasEventName(el, 'click')) return
    elEventEmitter.addEvent(el, 'click', async (event) => {
        /**
         * @type {Element|Document}
         */
        const target = event.target
        console.log('顶部房间排序监听器触发了', target.textContent.trim(), target)
        await startShieldingLiveRoomList()
        InstallBottomPagingListener()
        //点击之后，需要重新安装监听器
        installTopRoomOrderListener()
    })
    console.log('顶部房间排序监听器已安装')
}


export default {
    InstallLiveTopTabsListener,
    installStyle,
    startShieldingLiveRoomList,
    InstallBottomPagingListener,
    installTopRoomOrderListener
}
