import comments_shielding from "./comments_shielding.js";
import ruleMatchingUtil from "../../utils/ruleMatchingUtil.js";
import ruleKeyListData from "../../data/ruleKeyListData.js";
import output_informationTab from "../../layout/output_informationTab.js";
import {eventEmitter} from "../EventEmitter.js";


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
