import elUtil from "../../utils/elUtil.js";
import live_shielding, {shieldingLiveRoomContentDecorated} from "../../model/shielding/live_shielding.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import userProfile from "../userProfile.js";

/**
 * 判断是否为直播间
 * @param url {string}
 * @returns {boolean}
 */
const isLiveRoom = (url) => {
    return url.search('/live.bilibili.com/\\d+') !== -1 || url.search('https://live.bilibili.com/blanc/\\d+') !== -1;
}

//是否是活动类直播间页面
const isLiveRoomActivity = () => {
    return location.href.search('/live.bilibili.com/\\d+') !== -1 && !document.title.endsWith('哔哩哔哩直播，二次元弹幕直播平台');
}

//获取直播间底部直播列表元素项数据
const getBottomLiveRoomDataItem = (el) => {
    const data = {};
    const vueData = el['__vue__'];
    data.vueData = vueData;
    data.title = vueData['room_title'];
    data.name = vueData.uname;
    data.uid = vueData['up_id'];
    data.partition = vueData['area_name'];
    data.roomId = vueData['room_id'];
    data.text_small = vueData['text_small'];
    //插入按钮元素位置和悬停元素位置可以优先考虑el
    data.insertionPositionEl = el.querySelector('.name_line');
    data.explicitSubjectEl = el;
    data.el = el;
    return data;
}

//获取直播间底部直播列表
const getBottomLiveRoomList = async () => {
    const elList = await elUtil.findElements('.card-list>.item_box.card-item');
    const list = [];
    for (const el of elList) {
        list.push(getBottomLiveRoomDataItem(el));
    }
    return list;
}

//检查底部直播间列表
const checkBottomLiveRoomList = async () => {
    const elList = await getBottomLiveRoomList();
    for (const liveData of elList) {
        if (live_shielding.shieldingLiveRoomDecorated(liveData)) continue;
        eventEmitter.send('event-直播首页列表添加屏蔽按钮', {
            data: liveData,
            updateFunc: getBottomLiveRoomDataItem,
            maskingFunc: checkBottomLiveRoomList
        });
    }
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

const run = () => {
    if (!isLiveRoomActivity()) {
        userProfile.run()
        checkBottomLiveRoomList().then(async () => {
            const switchBtn = await elUtil.findElement('#observerTarget>.switch-btn');
            switchBtn.addEventListener('click', () => {
                checkBottomLiveRoomList();
            })
        })
    }
    setInterval(async () => {
        await startShieldingLiveChatContents();
    }, 2000)
}

export default {
    isLiveRoom,
    run
}
