import elUtil from "../../utils/elUtil.js";
import live_shielding from "../../model/shielding/live_shielding.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import userProfile from "../userProfile.js";
import ruleUtil from "../../utils/ruleUtil.js";
import defUtil from "../../utils/defUtil.js";
import {isDelLivePageRightSidebarGm, isHideLiveGiftPanelGm, isRoomBackgroundHideGm} from "../../data/localMKData.js";
import {
    asyncBlockByLevel,
    asyncBlockComment,
    asyncBlockUserFanCard,
    asyncBlockUserUidAndName,
} from "../../model/shielding/shielding.js";
import liveCommon from "./liveCommon.js";

/**
 * 判断是否为直播间
 * @param url {string}
 * @returns {boolean}
 */
const isLiveRoom = (url = location.href) => {
    return url.search('/live.bilibili.com/\\d+') !== -1 ||
        url.search('https://live.bilibili.com/blanc/\\d+') !== -1 ||
        url.includes('live.bilibili.com/blackboard/era');
}

//是否是活动类直播间页面
const isLiveRoomActivity = () => {
    return isLiveRoom() && !document.title.endsWith('哔哩哔哩直播，二次元弹幕直播平台');
}

//设置直播间背景显示状态
const setRoomBackgroundDisplay = (hide = true) => {
    elUtil.findElement('#room-background-vm').then(el => {
        el.style.display = hide ? 'none' : '';
        eventEmitter.send('打印信息', `已${hide ? '隐藏' : '显示'}直播间背景`)
    })
}

//设置直播间礼物控制面板显示状态
const setGiftControlPanelDisplay = (hide = true) => {
    elUtil.findElement('#gift-control-vm').then(el => {
        el.style.display = hide ? 'none' : '';
        eventEmitter.send('打印信息', `已${hide ? '隐藏' : '显示'}直播间礼物控制面板`);
    })
}

// 获取直播间弹幕
const getChatItems = async () => {
    let targetEl;
    if (isLiveRoomActivity()) {
        const iframeEl = await elUtil.findElement('#player-ctnr iframe')
        targetEl = iframeEl.contentDocument
    } else {
        targetEl = document.body;
    }
    const elList = await elUtil.findElements("#chat-items>div", {doc: targetEl});
    const list = [];
    for (let el of elList) {
        if (el.className === "chat-item  convention-msg border-box") {
            continue;
        }
        //跳过聊天项目杂项消息保护购买
        if (el.className === "chat-item misc-msg guard-buy") {
            continue;
        }
        const name = el.getAttribute("data-uname");
        if (name === null) {
            continue;
        }
        let chatType;
        //聊天表情符号
        if (el.classList.contains('chat-emoticon')) {
            chatType = 'emoticon';
        } else {
            chatType = 'text';
        }
        const uid = parseInt(el.getAttribute("data-uid"));
        const content = el.getAttribute("data-danmaku");
        const timeStamp = parseInt(el.getAttribute("data-timestamp"));
        const fansMedalEl = el.querySelector(".fans-medal-content");
        //粉丝牌
        const fansMedal = fansMedalEl === null ? null : fansMedalEl.textContent.trim();
        list.push({
            name, chatType,
            uid,
            content,
            timeStamp,
            fansMedal,
            el
        })
    }
    return list;
}

//获取醒目留言
const getSCList = async () => {
    const elList = await elUtil.findElements('.card-wrapper>.card-item-box.child');
    const list = [];
    for (let el of elList) {
        const vueData = el['__vue__'];
        const {itemData} = vueData;
        const {userInfo} = itemData;
        const {message, uid} = itemData;
        //用户名，等级
        const {uname, userLevel} = userInfo;
        const {fansMedal} = userInfo;
        //粉丝牌名，粉丝牌等级
        let fansMedalName = null, fansMedalLevel = null;
        if (fansMedal) {
            fansMedalName = fansMedal.name;
            fansMedalLevel = fansMedal.level;
        }
        list.push({
            uname, userLevel, uid, message, fansMedalName, fansMedalLevel,
            el, vueData, itemData
        })
    }
    return list;
}

//检查醒目留言
const checkSCList = async () => {
    const list = await getSCList();
    for (let v of list) {
        const {uid, uname, el, userLevel, fansMedalName, message} = v;
        asyncBlockUserUidAndName(uid, uname)
            .then(() => asyncBlockComment(message))
            .then(() => asyncBlockByLevel(userLevel))
            .then(() => asyncBlockUserFanCard(fansMedalName))
            .catch(res => {
                el?.remove();
                const {type, matching} = res;
                eventEmitter.send(
                    '打印信息',
                    `根据${type}屏蔽用户${uname}醒目留言:【${message}】,匹配值【${matching}】`
                );
            })
    }
}

//监听醒目留言
const listeningSC = () => {
    elUtil.findElement('#pay-note-panel-vm').then(el => {
        const observer = new MutationObserver(checkSCList);
        observer.observe(el, {childList: true, subtree: true});
    })
}

/**
 * 屏蔽直播间弹幕-节流
 */
const startShieldingLiveChatContents = defUtil.throttle(async () => {
    const commentsDataList = await getChatItems()
    for (let commentsData of commentsDataList) {
        live_shielding.shieldingLiveRoomContent(commentsData)
    }
}, 2000)

//删除直播间礼物栏下方横幅广告
const delLivePageRightSidebarAd =() => {
    if (isDelLivePageRightSidebarGm()) {
        elUtil.findElement('.flip-view.p-relative.over-hidden.w-100').then(el => {
            el.remove();
            eventEmitter.send('打印信息', '已删除直播间礼物栏下方横幅广告');
        })
    }
}


const run = async () => {
    const isLiveRoomActivityVal = isLiveRoomActivity();
    if (!isLiveRoomActivityVal) {
        userProfile.run()
        listeningSC();
        checkSCList();
        delLivePageRightSidebarAd()
    }
    setInterval(() => {
        startShieldingLiveChatContents();
    }, 2000)
    let targetEl;
    if (isLiveRoomActivityVal) {
        const iframeEl = await elUtil.findElement('#player-ctnr iframe')
        targetEl = iframeEl.contentDocument
    } else {
        targetEl = document.body;
    }
    elUtil.findElement('.danmaku-menu', {doc: targetEl}).then(el => {
        const selectEl = el.querySelector('.none-select');
        const butEl = document.createElement('div');
        butEl.textContent = '添加屏蔽(uid)';
        for (const name of selectEl.getAttributeNames()) {
            butEl.setAttribute(name, name === 'class' ? 'block-this-guy' : '');
        }
        selectEl.appendChild(butEl);
        butEl.addEventListener('click', () => {
            const vueData = el['__vue__'];
            console.log(vueData);
            const {uid, username} = vueData['info']
            eventEmitter.invoke('el-confirm', `是要屏蔽的用户${username}-【${uid}】吗？`).then(() => {
                if (ruleUtil.addRulePreciseUid(uid).status) {
                    startShieldingLiveChatContents()
                }
            })
        })
    });
    if (isRoomBackgroundHideGm()) {
        setRoomBackgroundDisplay();
    }
    if (isHideLiveGiftPanelGm()) {
        setGiftControlPanelDisplay()
    }
    liveCommon.setLivePageRightSidebarHide(isDelLivePageRightSidebarGm())
}

export default {
    isLiveRoom, setRoomBackgroundDisplay, setGiftControlPanelDisplay,
    run,isLiveRoomActivity,delLivePageRightSidebarAd
}
