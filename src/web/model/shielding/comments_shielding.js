import {eventEmitter} from "../EventEmitter.js";
import {blockByLevel, blockComment, blockSeniorMemberOnly, blockUserUidAndName} from "./shielding.js";
import {returnTempVal} from "../../data/globalValue.js";
import localMKData from "../../data/localMKData.js";


// 根据评论字数限制
const blockCommentWordLimit = (content) => {
    const commentWordLimit = localMKData.getCommentWordLimitVal();
    if (commentWordLimit < 3) return returnTempVal;
    if (content.length > commentWordLimit) {
        return {state: true, type: '屏蔽字数限制', matching: `字数限制为${commentWordLimit}`}
    }
    return returnTempVal;
}


/**
 * 屏蔽单个评论项
 * @param commentsData {{}}
 * @returns {Object}
 * @property {boolean} state 是否屏蔽
 * @property {string} type 屏蔽的类型
 * @property {string} matching 匹配到的规则`
 */
const shieldingComment = (commentsData) => {
    const {content, uid, name, level = -1} = commentsData;
    let returnVal = blockSeniorMemberOnly(level)
    if (returnVal.state) return returnVal;
    returnVal = blockUserUidAndName(uid, name)
    if (returnVal.state) return returnVal;
    returnVal = blockComment(content)
    if (returnVal.state) return returnVal;
    if (level !== -1) {
        returnVal = blockByLevel(level);
        if (returnVal.state) return returnVal;
    }
    return blockCommentWordLimit(content);
}

/**
 * 装饰过的屏蔽评论,屏蔽单个评论项
 * @param commentsData {{}}
 * @returns {Object}
 * @property {boolean} state 是否屏蔽
 * @type {function}
 */
const shieldingCommentAsync = async (commentsData) => {
    const {state, type, matching} = shieldingComment(commentsData);
    eventEmitter.send('event-评论通知替换关键词', commentsData)
    if (type === '保留硬核会员') {
        //提前结束并返回false，这里false用于上层循环中添加按钮
        return false
    }
    if (state) {
        commentsData.el?.remove()
        eventEmitter.send('屏蔽评论信息', type, matching, commentsData)
        return state;
    }
    return state;
}
/**
 * 评论区异步屏蔽评论内容
 * 1.当楼主是硬核会员并且开启仅看硬核会员时，跳过楼中层
 * @param commentsDataList
 * @returns {Promise<void>|null}
 */
const shieldingCommentsAsync = async (commentsDataList) => {
    for (let commentsData of commentsDataList) {
        const {state, type, matching} = await shieldingCommentAsync(commentsData);
        eventEmitter.send('event-评论通知替换关键词', commentsData)
        const {replies = []} = commentsData;
        if (type === '保留硬核会员') continue
        if (state) continue;
        eventEmitter.send('评论添加屏蔽按钮', commentsData)
        //当楼主层执行通过后，检查楼中层
        for (let reply of replies) {
            if (await shieldingCommentAsync(reply)) continue;
            eventEmitter.send('评论添加屏蔽按钮', reply)
        }
        if (state) {
            commentsData.el?.remove()
            eventEmitter.send('屏蔽评论信息', type, matching, commentsData)
        }
    }
}

export default {
    shieldingComment,
    shieldingCommentsAsync,
    shieldingCommentAsync
}
