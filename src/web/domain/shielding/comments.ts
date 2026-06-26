import {eventEmitter} from "../../core/EventEmitter.ts";
import shielding, {
    blockByLevelForComment,
    blockComment,
    BlockResult,
    blockSeniorMemberOnly,
    blockUserUidAndName
} from "./main.ts";
import {returnTempVal} from "../../config/globalValue.ts";
import localMKData from "../../state/localMKData.ts";

interface CommentData {
    content: string;
    uid: number;
    name: string;
    level?: number;
    decoratePic?: any;
    collectionActId?: number;
    dressUpId?: number;
    el?: HTMLElement;
    replies?: CommentData[];
}

const blockCommentWordLimit = (content: string): BlockResult => {
    const commentWordLimit = localMKData.getCommentWordLimitVal();
    if (commentWordLimit < 3) return returnTempVal;
    if (content.length > commentWordLimit) {
        return {state: true, type: '屏蔽字数限制', matching: `字数限制为${commentWordLimit}`}
    }
    return returnTempVal;
}

const shieldingComment = (commentsData: CommentData): BlockResult => {
    const {
        content, uid, name, level = -1, decoratePic = null,
        collectionActId = -1, dressUpId = -1,
    } = commentsData;
    let returnVal = blockSeniorMemberOnly(level)
    if (returnVal.state) return returnVal;
    returnVal = blockUserUidAndName(uid, name)
    if (returnVal.state) return returnVal;
    returnVal = blockComment(content)
    if (returnVal.state) return returnVal;
    if (level !== -1) {
        returnVal = blockByLevelForComment(level);
        if (returnVal.state) return returnVal;
    }
    returnVal = blockCommentWordLimit(content)
    if (returnVal.state) return returnVal;
    if (decoratePic !== null && collectionActId !== -1) {
        returnVal = shielding.blockDecorationCollection(collectionActId)
        if (returnVal.state) return returnVal;
    }
    if (decoratePic !== null && dressUpId !== -1) {
        returnVal = shielding.blockDecoration(dressUpId)
        if (returnVal.state) return returnVal;
    }
    return returnVal;
}

const shieldingCommentAsync = async (commentsData: CommentData): Promise<any> => {
    const {state, type, matching} = shieldingComment(commentsData);
    eventEmitter.send('event-评论通知替换关键词', commentsData)
    if (type === '保留硬核会员') {
        return false
    }
    if (state) {
        commentsData.el?.remove()
        eventEmitter.send('屏蔽评论信息', type, matching, commentsData)
        return state;
    }
    return state;
}

const shieldingCommentsAsync = async (commentsDataList: CommentData[]): Promise<void> => {
    for (let commentsData of commentsDataList) {
        const {state, type, matching} = await shieldingCommentAsync(commentsData);
        eventEmitter.send('event-评论通知替换关键词', commentsData)
        const {replies = []} = commentsData;
        if (type === '保留硬核会员') continue
        if (state) continue;
        eventEmitter.send('评论添加屏蔽按钮', commentsData)
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
