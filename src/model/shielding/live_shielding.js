import comments_shielding from "./comments_shielding.js";
import ruleMatchingUtil from "../../utils/ruleMatchingUtil.js";
import ruleKeyListData from "../../data/ruleKeyListData.js";
import output_informationTab from "../../layout/output_informationTab.js";
import {eventEmitter} from "../EventEmitter.js";
import shielding, {blockCheckWhiteUserUid, blockUserUidAndName, blockVideoOrOtherTitle} from "./shielding.js";
import {returnTempVal} from "../../data/globalValue.js";


/**
 * 装饰过的屏蔽直播间评论
 * @param liveRoomContent {*} 评论数据
 * @returns {boolean}
 * @type {function}
 */
export const shieldingLiveRoomContentDecorated = (liveRoomContent) => {
    let {state, type, matching} = comments_shielding.shieldingComment(liveRoomContent);
    const {el, fansMedal} = liveRoomContent;
    if (fansMedal !== null) {
        if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseFanCardArr(), fansMedal)) {
            el?.remove();
            state = true;
            type = "精确粉丝牌";
        }
    }
    if (state) {
        el?.remove()
    }
    if (type) {
        const infoHtml = output_informationTab.getLiveRoomCommentInfoHtml(type, matching, liveRoomContent);
        eventEmitter.send('打印信息', infoHtml)
    }
    return state;
}

// 屏蔽直播间
const shieldingLiveRoom = (liveRoomData) => {
    const {name, title, partition, uid = -1} = liveRoomData;
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


export default {
    shieldingLiveRoomDecorated,
    addLiveContentBlockButton
}
