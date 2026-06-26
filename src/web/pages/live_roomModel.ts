import elUtil from "../core/elUtil.ts";
import live_shielding from "../domain/shielding_live.ts";
import {eventEmitter} from "../core/EventEmitter.ts";
import userProfile from "./userProfile.ts";
import ruleUtil from "../core/ruleUtil.ts";
import defUtil from "../core/defUtil.ts";
import {isDelLivePageRightSidebarGm, isHideLiveGiftPanelGm, isRoomBackgroundHideGm} from "../state/localMKData.ts";
import {asyncBlockByLevel, asyncBlockComment, asyncBlockUserUidAndName,} from "../domain/shielding_main.ts";
import liveCommon from "./live_common.ts";
import cssManager from "../domain/cssManager.ts";
import urlUtil from "../core/urlUtil.ts";


const getTargetEl = async (): Promise<Document | HTMLElement> => {
    let targetEl: Document | HTMLElement;
    if (isLiveRoomActivity()) {
        const iframeEl = await elUtil.findElement('#player-ctnr iframe')
        targetEl = (iframeEl as HTMLIFrameElement).contentDocument || document
    } else {
        targetEl = document.body;
    }
    return targetEl
}

/**
 * 判断是否为直播间
 * @param url {string}
 * @returns {boolean}
 */
const isLiveRoom = (url: any = location.href) => {
    return url.search('/live.bilibili.com/\\d+') !== -1 ||
        url.search('https://live.bilibili.com/blanc/\\d+') !== -1 ||
        url.includes('live.bilibili.com/blackboard/era');
}

//是否是活动类直播间页面
const isLiveRoomActivity = () => {
    return isLiveRoom() && !document.title.endsWith('哔哩哔哩直播，二次元弹幕直播平台');
}

//设置直播间背景显示状态
const setRoomBackgroundDisplay = (hide: any = true) => {
    elUtil.findElement('#room-background-vm').then(el => {
        if (!el) return;
        el.style.display = hide ? 'none' : '';
        eventEmitter.send('打印信息', `已${hide ? '隐藏' : '显示'}直播间背景`)
    })
}

//设置直播间礼物控制面板显示状态
const setGiftControlPanelDisplay = (hide: any = true) => {
    elUtil.installStyle(hide ? `#gift-control-vm,div[data-upgrade-intro=giftSender]{
    display:none !important;
    }` : '', {type: 'id', value: "gift-control-vm-hide"})
    eventEmitter.send('打印信息', `已${hide ? '隐藏' : '显示'}直播间礼物控制面板`);
}

/**
 * 获取直播间弹幕
 * @returns {Promise<
 * {name:string,uid:string,chatType:string,gloryLevelSrc:string,fanBrandLevel:number,content:string,timeStamp:number,
 * fansMedal:string,el:HTMLElement}[]
 * >}
 */
const getChatItems = async () => {
    const elList = await elUtil.findElements("#chat-items>div", {doc: (await getTargetEl()) as Element | undefined});
    const list: any[] = [];
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
        const uid = parseInt(el.getAttribute("data-uid") ?? '');
        const content = el.getAttribute("data-danmaku") ?? '';
        const timeStamp = parseInt(el.getAttribute("data-timestamp") ?? '');
        const fansMedalItemEl = el.querySelector('.fans-medal-item')
        const gloryLevelEl = el.querySelector('img.wealth-medal.p-absolute')
        const gloryLevelSrc = gloryLevelEl ? gloryLevelEl.src : null
        let fansMedal = null, fanBrandLevel = -1
        if (fansMedalItemEl) {
            //粉丝牌
            fansMedal = fansMedalItemEl.querySelector(".fans-medal-content")?.textContent?.trim() ?? '';
            const FanBrandLevelEl = fansMedalItemEl.querySelector('.fans-medal-level>.fans-medal-level-font');
            fanBrandLevel = parseInt(FanBrandLevelEl?.textContent.trim() || '-1')
        }
        const items = {
            name, chatType, gloryLevelSrc, fanBrandLevel,
            uid,
            content,
            timeStamp,
            fansMedal,
            el
        };
        (el as any)['mk-item'] = items
        list.push(items)
    }
    return list;
}

//获取醒目留言
const getSCList = async () => {
    const elList = await elUtil.findElements('.card-wrapper>.card-item-box.child');
    const list: any[] = [];
    for (let el of elList) {
        const vueData = (el as any)['__vue__'];
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

//获取直播间弹幕列表中的荣耀等级图片链接
const getBulletGloryLevelList = async () => {
    const body = await getTargetEl();
    const imgSrcSet = new Set()
    const elements = body.querySelectorAll('.wealth-medal.p-absolute');
    for (const el of Array.from(elements)) {
        const imgSrc = (el as HTMLImageElement).src;
        imgSrcSet.add(imgSrc)
    }
    return Array.from(imgSrcSet)
}

//检查醒目留言
const checkSCList = async () => {
    const list = await getSCList();
    for (let v of list) {
        const {uid, uname, el, userLevel, fansMedalName, message} = v;
        asyncBlockUserUidAndName(uid, uname)
            .then(() => asyncBlockComment(message))
            .then(() => asyncBlockByLevel(userLevel))
            .then(() => live_shielding.asyncBlockUserFanCard(fansMedalName))
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
        if (!el) return;
        const observer = new MutationObserver(checkSCList);
        observer.observe(el, {childList: true, subtree: true});
    })
}

/**
 *获取当前直播间id
 * @returns {Promise<number>}
 */
const getCurrentLiveRoomLiveId = () => {
    if (isLiveRoomActivity()) {
        return getTargetEl().then(targetEl => {
            const el = targetEl.querySelector('#head-info-vm');
            if (!el) return;
            const vueData = (el as any)['__vue__'];
            return vueData.roomId;
        })
    }
    return Promise.resolve(urlUtil.getUrlRoomId(location.href))
}

/**
 * 屏蔽直播间弹幕-节流
 */
const startShieldingLiveChatContents = defUtil.throttle(async () => {
    const commentsDataList = await getChatItems()
    const roomId = await getCurrentLiveRoomLiveId()
    for (let commentsData of commentsDataList) {
        commentsData['roomId'] = roomId;
        live_shielding.shieldingLiveRoomContent(commentsData)
    }
}, 2000)

//删除直播间礼物栏下方横幅广告
const delLivePageRightSidebarAd = () => {
    if (isDelLivePageRightSidebarGm()) {
        elUtil.findElement('.flip-view.p-relative.over-hidden.w-100').then(el => {
            if (!el) return;
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
    let targetEl: Document | HTMLElement;
    if (isLiveRoomActivityVal) {
        const iframeEl = await elUtil.findElement('#player-ctnr iframe')
        targetEl = (iframeEl as HTMLIFrameElement).contentDocument || document
    } else {
        targetEl = document.body;
    }
    elUtil.findElement('.danmaku-menu', {doc: targetEl as Element | undefined}).then(el => {
        if (!el) return;
        const selectEl = el.querySelector('.none-select');
        if (!selectEl) return;
        const butEl = document.createElement('div');
        butEl.textContent = '添加屏蔽(uid)';
        for (const name of selectEl.getAttributeNames()) {
            butEl.setAttribute(name, name === 'class' ? 'block-this-guy' : '');
        }
        selectEl.appendChild(butEl);
        console.log('已为点击弹幕项插入添加屏蔽(uid)按钮', butEl)
        butEl.addEventListener('click', () => {
            const vueData = (el as any)['__vue__'];
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
    cssManager.insertLiveRoomDefaultStyle()
}

export default {
    isLiveRoom, setRoomBackgroundDisplay, setGiftControlPanelDisplay,
    run, isLiveRoomActivity, delLivePageRightSidebarAd,
    //发送直播间弹幕列表中的荣耀等级图片链接列表
    sendBulletGloryLevelList() {
        return getBulletGloryLevelList().then(imgSrcList => {
            eventEmitter.emit('event:更新荣耀等级图片链接列表', imgSrcList)
        })
    }
}
