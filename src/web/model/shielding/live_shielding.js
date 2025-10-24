import ruleMatchingUtil from "../../utils/ruleMatchingUtil.js";
import ruleKeyListData from "../../data/ruleKeyListData.js";
import output_informationTab from "../../layout/output_informationTab.js";
import {eventEmitter} from "../EventEmitter.js";
import shielding, {
    asyncBlockByLevelForComment,
    asyncBlockComment,
    asyncBlockSeniorMemberOnly,
    asyncBlockUserFanCard,
    asyncBlockUserUidAndName,
    blockCheckWhiteUserUid,
    blockUserUidAndName,
    blockVideoOrOtherTitle
} from "./shielding.js";
import {returnTempVal} from "../../data/globalValue.js";

//检查直播间id屏蔽
export const blockLiveRoomId = (liveRoomId) => {
    if (GM_getValue('precise_liveRoomId', []).includes(liveRoomId)) {
        return {state: true, type: "精确直播间id", matching: liveRoomId};
    }
    return returnTempVal;
}

/**
 * 装饰过的屏蔽直播间评论
 * @param liveRoomContent {*} 评论数据
 * @returns {boolean}
 * @type {function}
 */
const shieldingLiveRoomContent = (liveRoomContent) => {
    const {content, uid, name, level = -1, chatType, fansMedal, el} = liveRoomContent;
    asyncBlockSeniorMemberOnly(level)
        .then(() => asyncBlockUserUidAndName(uid, name))
        .then(() => asyncBlockByLevelForComment(level))
        .then(() =>asyncBlockUserFanCard(fansMedal))
        .then(() => {
            if (chatType === 'emoticon') {
                return Promise.reject({type: '中断'});
            }
        })
        .then(() => asyncBlockComment(content))
        .catch(res => {
            let {state, type, matching} = res;
            if (type === '中断') return;
            if (state) {
                el?.remove()
            }
            if (type) {
                const infoHtml = output_informationTab.getLiveRoomCommentInfoHtml(type, matching, liveRoomContent);
                eventEmitter.send('打印信息', infoHtml)
            }
        })
}

// 屏蔽直播间
const shieldingLiveRoom = (liveRoomData) => {
    const {name, title, partition, uid = -1, roomId} = liveRoomData;
    let returnVal;
    if (uid !== -1) {
        if (blockCheckWhiteUserUid(uid)) {
            return returnTempVal;
        }
        returnVal = blockUserUidAndName(uid, name)
        if (returnVal.state) {
            return returnVal
        }
    }
    returnVal = blockVideoOrOtherTitle(title)
    if (returnVal.state) {
        return returnVal
    }
    if (partition) {
        if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPrecisePartitionArr(), partition)) {
            return {state: true, type: "精确直播分区"};
        }
    }
    if (roomId) {
        return blockLiveRoomId(roomId);
    }
    return returnTempVal;
}

/**
 * 装饰过的屏蔽直播间
 * @param liveRoomData {{}} 直播间数据
 * @returns {boolean}
 */
const shieldingLiveRoomDecorated = (liveRoomData) => {
    const {state, type, matching = null} = shieldingLiveRoom(liveRoomData);
    if (state) {
        liveRoomData.el?.remove();
        const infoHtml = output_informationTab.getLiveRoomInfoHtml(type, matching, liveRoomData);
        eventEmitter.send('打印信息', infoHtml)
    }
    return state;
}


/**
 * 直播间弹幕添加屏蔽按钮
 * @param commentsData
 */
const addLiveContentBlockButton = (commentsData) => {
    shielding.addBlockButton(commentsData, "gz_shielding_live_danmaku_button");
}

eventEmitter.on('event-直播首页列表添加屏蔽按钮', (liveCardItemData) => {
    shielding.addBlockButton(liveCardItemData, "gz-live-home-room-card-list-item");
})

export default {
    shieldingLiveRoomDecorated, shieldingLiveRoomContent,
    addLiveContentBlockButton
}
