import elUtil from "../../utils/elUtil.js";
import live_shielding from "../../model/shielding/live_shielding.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import userProfile from "../userProfile.js";
import ruleUtil from "../../utils/ruleUtil.js";
import defUtil from "../../utils/defUtil.js";

/**
 * 判断是否为直播间
 * @param url {string}
 * @returns {boolean}
 */
const isLiveRoom = (url) => {
    return url.search('/live.bilibili.com/\\d+') !== -1 ||
        url.search('https://live.bilibili.com/blanc/\\d+') !== -1 ||
        url.includes('live.bilibili.com/blackboard/era');
}

//是否是活动类直播间页面
const isLiveRoomActivity = () => {
    return isLiveRoom(location.href) && !document.title.endsWith('哔哩哔哩直播，二次元弹幕直播平台');
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
            name,chatType,
            uid,
            content,
            timeStamp,
            fansMedal,
            el
        })
    }
    return list;
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

const run = async () => {
    const isLiveRoomActivityVal = isLiveRoomActivity();
    if (!isLiveRoomActivityVal) {
        userProfile.run()
        checkBottomLiveRoomList().then(async () => {
            const switchBtn = await elUtil.findElement('#observerTarget>.switch-btn');
            switchBtn.addEventListener('click', () => {
                checkBottomLiveRoomList();
            })
        })
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
}

export default {
    isLiveRoom,
    run
}
