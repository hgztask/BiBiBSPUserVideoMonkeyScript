import {eventEmitter} from "../EventEmitter.js";
import localMKData from "../../data/localMKData.js";
import ruleMatchingUtil from "../../utils/ruleMatchingUtil.js";
import ruleKeyListData from "../../data/ruleKeyListData.js";
import gmUtil from "../../utils/gmUtil.js";
import shielding, {
    blockAvatarPendant,
    blockBasedVideoTag,
    blockByLevel,
    blockByUidRange,
    blockCheckWhiteUserUid,
    blockGender,
    blockSeniorMember,
    blockSignature,
    blockTimeRangeMasking,
    blockUserName,
    blockUserUid,
    blockUserVip,
    blockVerticalVideo,
    blockVideoCoinLikesRatioRate,
    blockVideoCopyright,
    blockVideoDesc,
    blockVideoInteractiveRate,
    blockVideoLikeRate,
    blockVideoTeamMember,
    blockVideoTripleRate
} from "./shielding.js";
import {videoInfoCache} from "../cache/videoInfoCache.js";
import {requestIntervalQueue} from "../asynchronousIntervalQueue.js";
import bFetch from '../bFetch.js'
import bvDexie from "../bvDexie.js";
import {returnTempVal} from "../../data/globalValue.js";


/**
 * 屏蔽视频
 * @param videoData {{}} 视频数据
 * @returns {Object}结果对象，其中包括状态state，和消息msg
 * @property {boolean} state 是否屏蔽
 * @property {string} type 屏蔽了的类型
 * @property {string} matching 匹配到的规则
 * @returns {{state:boolean,type:string|any,matching:string|any}} 是否屏蔽
 */
const shieldingVideo = (videoData) => {
    const {
        title, uid = -1,
        name, nDuration = -1,
        nBulletChat = -1, nPlayCount = -1
    } = videoData;
    if (blockCheckWhiteUserUid(uid)) {
        return returnTempVal;
    }
    let returnVal = blockUserUid(uid);
    if (returnVal.state) {
        return returnVal;
    }
    returnVal = blockByUidRange(uid)
    if (returnVal.state) {
        return returnVal;
    }
    let matching = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getTitleArr(), title);
    if (matching !== null) {
        return {state: true, type: "模糊标题", matching};
    }
    matching = ruleMatchingUtil.regexMatch(ruleKeyListData.getTitleCanonicalArr(), title);
    if (matching !== null) {
        return {state: true, type: "正则标题", matching};
    }
    returnVal = blockUserName(name)
    if (returnVal.state) {
        return returnVal;
    }
    //限制时长
    if (nDuration !== -1) {
        const min = gmUtil.getData('nMinimumDuration', -1);
        if (min > nDuration && min !== -1) {
            return {state: true, type: '最小时长', matching: min}
        }
        const max = gmUtil.getData('nMaximumDuration', -1)
        if (max < nDuration && max !== -1) {
            return {state: true, type: '最大时长', matching: max}
        }
    }
    //限制弹幕数
    if (nBulletChat !== -1) {
        const min = gmUtil.getData('nMinimumBarrage', -1);
        if (min > nBulletChat && min !== -1) {
            return {state: true, type: '最小弹幕数', matching: min}
        }
        const max = gmUtil.getData('nMaximumBarrage', -1)
        if (max < nBulletChat && max !== -1) {
            return {state: true, type: '最大弹幕数', matching: max}
        }
    }
    if (nPlayCount !== -1) {
        const min = gmUtil.getData('nMinimumPlay', -1);
        if (min > nPlayCount && min !== -1) {
            return {state: true, type: '最小播放量', matching: min}
        }
        const max = gmUtil.getData('nMaximumPlayback', -1)
        if (max < nPlayCount && max !== -1) {
            return {state: true, type: '最大播放量', matching: max}
        }
    }
    //表面放行该内容
    return returnTempVal;
}

/**
 * 装饰过的屏蔽视频
 * @param videoData {{}} 视频数据
 * @param method {string} 屏蔽方法, remove为直接删除，hide为隐藏，默认为remove
 * @returns {boolean}state 是否屏蔽或屏蔽过
 */
const shieldingVideoDecorated = (videoData, method = "remove") => {
    const {el} = videoData;
    if (el.style.display === "none") {
        return true
    }
    const {state, type, matching = null} = shieldingVideo(videoData);
    if (state) {
        if (method === "remove") {
            el?.remove();
        } else {
            el.style.display = "none";
        }
        /**
         * 如果在搜索页面里使用Qmsg库相关的方法，会暂停一些setTimeOut函数对应的事件，这个问题后续排查
         * 不知为什么这里如果使用Qmsg库相关的方法，会暂停一些setTimeOut函数对应的事件
         */
        eventEmitter.send('屏蔽视频信息', type, matching, videoData)
        return true;
    }
    if (localMKData.isDisableNetRequestsBvVideoInfo()) {
        return state
    }
    shieldingOtherVideoParameter(videoData).then(res => {
        if (!res) {
            return
        }
        const {type, matching} = res
        if (method === "remove") {
            el.remove();
        } else {
            el.style.display = "none";
        }
        eventEmitter.send('屏蔽视频信息', type, matching, videoData)
    })
    return state;
}

/**
 * 检查其他视频参数执行屏蔽
 * @param videoData {{}} 视频数据
 * @returns {Promise<{state:boolean,type:string,matching:string}|any>}
 */
const shieldingOtherVideoParameter = async (videoData) => {
    const {bv = '-1'} = videoData
    //如果没有bv号参数，则不执行
    if (bv === '-1') return
    if (videoInfoCache.getCount() === 0) {
        await videoInfoCache.update()
    }
    const find = videoInfoCache.find(bv);
    let result;
    if (find === null) {
        //获取视频信息
        const {state, data, msg} = await requestIntervalQueue.add(() => bFetch.fetchGetVideoInfo(bv))
        if (!state) {
            console.warn('获取视频信息失败:' + msg);
            return
        }
        result = data
        if (await bvDexie.addVideoData(bv, result)) {
            await videoInfoCache.update()
            console.log('mk-db-添加视频信息到数据库成功', result, videoData)
        }
    } else {
        result = find
    }
    const {tags = [], userInfo, videoInfo} = result
    //屏蔽已关注视频
    if (videoInfo?.following && localMKData.isBlockFollowed()) {
        return {state: true, type: '已关注'}
    }
    const isUpOwnerExclusive = videoInfo?.is_upower_exclusive;
    if (isUpOwnerExclusive && localMKData.isUpOwnerExclusive()) {
        return {state: true, type: '充电专属视频'}
    }
    /**
     * @type {state:boolean,type:string,matching:string|any}
     */
    let returnValue;
    //开始验证
    //当tags长度不为0时，执行根据tags屏蔽视频
    if (tags.length !== 0) {
        returnValue = blockBasedVideoTag(tags);
        if (returnValue.state) {
            return returnValue
        }
    }
    //检查用户等级，当前用户等级
    const currentLevel = userInfo?.current_level || -1;
    returnValue = blockByLevel(currentLevel);
    if (returnValue.state) {
        return returnValue
    }
    //头像挂件
    const avatarPendantName = userInfo?.pendant?.name || null;
    if (avatarPendantName) {
        returnValue = blockAvatarPendant(avatarPendantName);
        if (returnValue.state) {
            return returnValue
        }
    }
    //根据用户签名屏蔽
    const signContent = userInfo?.sign;
    if (signContent) {
        returnValue = blockSignature(signContent)
        if (returnValue.state) {
            return returnValue
        }
    }
    //根据视频简介屏蔽
    const desc = videoInfo?.desc || null;
    if (desc) {
        returnValue = blockVideoDesc(desc)
        if (returnValue.state) {
            return returnValue
        }
    }
    const tempList = [
        blockGender(userInfo?.sex), blockUserVip(userInfo.vip.type),
        blockSeniorMember(userInfo.is_senior_member), blockVideoCopyright(videoInfo.copyright),
        blockVerticalVideo(videoInfo.dimension), blockVideoTeamMember(videoInfo.staff),
        blockVideoLikeRate(videoInfo.like, videoInfo.view), blockVideoInteractiveRate(videoInfo.danmaku, videoInfo.reply, videoInfo.view),
        blockVideoTripleRate(videoInfo.favorite, videoInfo.coin, videoInfo.share, videoInfo.view),
        blockVideoCoinLikesRatioRate(videoInfo.coin, videoInfo.like), blockTimeRangeMasking(videoInfo.pubdate)
    ]
    for (let v of tempList) {
        if (v.state) {
            return v
        }
        const msg = v['msg'];
        if (msg) {
            console.warn(msg);
        }
    }
}
/**
 * 添加热门视频屏蔽按钮
 * @param data{Object}
 * @param data.data {Object} 评论数据
 * @param data.maskingFunc {function} 屏蔽函数
 */
eventEmitter.on('添加热门视频屏蔽按钮', (data) => {
    shielding.addBlockButton(data, "gz_shielding_button", ["right", "bottom"]);
})

/**
 * 对视频添加屏蔽按钮和指令-BewlyBewly
 * @param data {Object}
 * @param data.data {{}} 视频数据
 * @param data.maskingFunc {function} 屏蔽函数
 */
eventEmitter.on('视频添加屏蔽按钮-BewlyBewly', (data) => {
    shielding.addBlockButton(data, "gz_shielding_button", ['right', 'bottom']);
})

/**
 * 视频添加屏蔽按钮和指令
 * @param data {Object}
 * @param data.data {{}} 视频数据
 * @param data.maskingFunc {function} 屏蔽函数
 */
eventEmitter.on('视频添加屏蔽按钮', (data) => {
    shielding.addBlockButton(data, "gz_shielding_button", ["right"]);
})



export default {
    shieldingVideoDecorated
}

