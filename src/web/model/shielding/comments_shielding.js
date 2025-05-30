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
 * 屏蔽评论
 * @param commentsDataList {[{}]} 评论数据
 */
const shieldingComments = (commentsDataList) => {
    for (let commentsData of commentsDataList) {
        //判断是否为楼主，如果是楼主层，则有楼中餐
        //处理列表中的楼主层
        if (shieldingCommentDecorated(commentsData)) continue;
        eventEmitter.send('评论添加屏蔽按钮', commentsData)
        //当楼主层执行通过后，检查楼中层
        const {replies = []} = commentsData;
        if (replies.length === 0) continue;
        for (let reply of replies) {
            if (shieldingCommentDecorated(reply)) continue;
            eventEmitter.send('评论添加屏蔽按钮', reply)
        }
    }
}

/**
 * 装饰过的屏蔽评论,屏蔽单个评论项
 * @param commentsData {{}}
 * @returns {Object}
 * @property {boolean} state 是否屏蔽
 * @type {function}
 */
const shieldingCommentDecorated = (commentsData) => {
    const {state, type, matching} = shieldingComment(commentsData);
    if (state && type === '只看硬核会员') {
        return {state: false, type: '屏蔽只看硬核会员', matching: '只看硬核会员'}
    }
    if (state) {
        commentsData.el?.remove()
        eventEmitter.send('屏蔽评论信息', type, matching, commentsData)
    }
    eventEmitter.send('event-评论通知替换关键词', commentsData)
    return state;
}


export default {
    shieldingComment,
    shieldingComments,
    shieldingCommentDecorated
}
