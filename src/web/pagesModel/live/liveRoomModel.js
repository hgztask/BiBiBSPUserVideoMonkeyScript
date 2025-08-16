import elUtil from "../../utils/elUtil.js";
import watch from '../../watch/watch.js'
import defUtil from "../../utils/defUtil.js";
import live_shielding, {shieldingLiveRoomContentDecorated} from "../../model/shielding/live_shielding.js";

/**
 * 判断是否为直播间
 * @param url {string}
 * @returns {boolean}
 */
const isLiveRoom = (url) => {
    return url.search('/live.bilibili.com/\\d+') !== -1;
}


// 获取直播间弹幕
const getChatItems = async () => {
    const elList = await elUtil.findElements("#chat-items>div");
    if (elList.length >= 200) {
        for (let i = 0; i < 100; i++) {
            elList[i]?.remove();
        }
        console.log("弹幕列表超过200，已删除前100条")
    }
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
        const uid = el.getAttribute("data-uid");
        const content = el.getAttribute("data-danmaku");
        const timeStamp = el.getAttribute("data-timestamp");
        const fansMedalEl = el.querySelector(".fans-medal-content");
        //粉丝牌
        const fansMedal = fansMedalEl === null ? null : fansMedalEl.textContent.trim();
        list.push({
            name,
            uid,
            content,
            timeStamp,
            fansMedal,
            el,
            insertionPositionEl: el,
            explicitSubjectEl: el
        })
    }
    return list;
}

/**
 * 屏蔽直播间弹幕
 */
const startShieldingLiveChatContents = async () => {
    const commentsDataList = await getChatItems()
    for (let commentsData of commentsDataList) {
        if (shieldingLiveRoomContentDecorated(commentsData)) {
            continue;
        }
        live_shielding.addLiveContentBlockButton({data: commentsData, maskingFunc: startShieldingLiveChatContents});
    }
}


// 监听直播间弹幕
const addWatchLiveRoomChatItemsListener = () => {
    const throttle = defUtil.throttle(startShieldingLiveChatContents, 1000);
    watch.watchElementListLengthWithInterval("#chat-items>div", throttle);
}


export default {
    isLiveRoom,
    addWatchLiveRoomChatItemsListener
}
