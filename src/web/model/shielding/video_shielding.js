import {eventEmitter} from "../EventEmitter.js";
import localMKData, {
    getMaximumBarrageGm,
    getMaximumDurationGm,
    getMaximumPlayGm,
    getMinimumBarrageGm,
    getMinimumDurationGm,
    getMinimumPlayGm,
    isCommentDisabledVideosBlockedGm,
    isEffectiveUIDShieldingOnlyVideo,
    isFollowers7DaysOnlyVideosBlockedGm,
    isMaximumBarrageGm,
    isMaximumDurationGm,
    isMaximumPlayGm,
    isMinimumBarrageGm,
    isMinimumDurationGm,
    isMinimumPlayGm,
    isVideosInFeaturedCommentsBlockedGm
} from "../../data/localMKData.js";
import ruleKeyListData from "../../data/ruleKeyListData.js";
import shielding, {
    asyncBlockAvatarPendant,
    asyncBlockBasedVideoTag,
    asyncBlockByLevel,
    asyncBlockChargeVideo,
    asyncBlockFollowedVideo,
    asyncBlockGender,
    asyncBlockLimitationFanSum,
    asyncBlockSeniorMember,
    asyncBlockSignature,
    asyncBlockTimeRangeMasking,
    asyncBlockUserUidAndName,
    asyncBlockUserVideoNumLimit,
    asyncBlockUserVip,
    asyncBlockVerticalVideo,
    asyncBlockVideoCoinLikesRatioRate,
    asyncBlockVideoCopyright,
    asyncBlockVideoDesc,
    asyncBlockVideoInteractiveRate,
    asyncBlockVideoLikeRate,
    asyncBlockVideoTeamMember,
    asyncBlockVideoTripleRate,
    blockUserUidAndName,
    blockVideoOrOtherTitle
} from "./shielding.js";
import {promiseReject, promiseResolve, returnTempVal} from "../../data/globalValue.js";
import arrUtil from "../../utils/arrUtil.js";
import bvRequestQueue from "../queue/bvRequestQueue.js";
import bvDexie from "../bvDexie.js";
import {videoCacheManager} from "../cache/videoCacheManager.js";

// 检查视频tag执行多重tag检查屏蔽
const asyncBlockVideoTagPreciseCombination = async (tags) => {
    if (tags.length <= 0) return;
    const mkArrTags = ruleKeyListData.getVideoTagPreciseCombination();
    for (let mkTags of mkArrTags) {
        if (arrUtil.arrayContains(tags, mkTags)) return Promise.reject({
            state: true,
            type: "多重tag屏蔽",
            matching: mkTags
        })
    }
}

// 检查视频bv执行屏蔽
const blockVideoBV = (bv) => {
    const bvs = ruleKeyListData.getPreciseVideoBV();
    if (bvs.includes(bv)) {
        return {state: true, type: "精确bv号屏蔽", matching: bv};
    }
    return returnTempVal
}

//检查视频时长屏蔽
const blockVideoDuration = (duration) => {
    if (duration !== -1) {
        if (isMinimumDurationGm()) {
            const min = getMinimumDurationGm()
            if (min > duration && min !== -1) {
                return {state: true, type: '最小时长', matching: min}
            }
        }
        if (isMaximumDurationGm()) {
            const max = getMaximumDurationGm()
            if (max < duration && max !== -1) {
                return {state: true, type: '最大时长', matching: max}
            }
        }
    }
    return returnTempVal
}

//检查视频弹幕数量屏蔽
const blockVideoBulletChat = (bulletChat) => {
    if (bulletChat !== -1) {
        if (isMinimumBarrageGm()) {
            const min = getMinimumBarrageGm()
            if (min > bulletChat && min !== -1) {
                return {state: true, type: '最小弹幕数', matching: min}
            }
        }
        if (isMaximumBarrageGm()) {
            const max = getMaximumBarrageGm()
            if (max < bulletChat && max !== -1) {
                return {state: true, type: '最大弹幕数', matching: max}
            }
        }
    }
    return returnTempVal
}

//检查视频播放量数量屏蔽
const blockVideoPlayCount = (playCount) => {
    if (playCount === -1) return returnTempVal;
    if (isMinimumPlayGm()) {
        const min = getMinimumPlayGm()
        if (min > playCount && min !== -1) {
            return {state: true, type: '最小播放量', matching: min}
        }
    }
    if (isMaximumPlayGm()) {
        const max = getMaximumPlayGm()
        if (max < playCount && max !== -1) {
            return {state: true, type: '最大播放量', matching: max}
        }
    }
    return returnTempVal
}

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
        nBulletChat = -1, nPlayCount = -1,
        bv = null
    } = videoData;
    let returnVal = blockUserUidAndName(uid, name);
    if (returnVal.state) return returnVal;
    if (isEffectiveUIDShieldingOnlyVideo()) return returnTempVal;
    returnVal = blockVideoOrOtherTitle(title)
    if (returnVal.state) return returnVal;
    returnVal = blockVideoBV(bv)
    if (returnVal.state) return returnVal;
    returnVal = blockVideoDuration(nDuration)
    if (returnVal.state) return returnVal;
    returnVal = blockVideoBulletChat(nBulletChat)
    if (returnVal.state) return returnVal;
    returnVal = blockVideoPlayCount(nPlayCount)
    if (returnVal.state) return returnVal;
    //表面放行该内容
    return returnTempVal;
}

/**
 * 装饰过的屏蔽视频
 * @param videoData {{}} 视频数据
 * @param method {string} 屏蔽方法, remove为直接删除，hide为隐藏，默认为remove
 * @returns {Promise|null}是否屏蔽视频，Resolve为已做屏蔽处理，反之放行
 */
const shieldingVideoDecorated = async (videoData, method = "remove") => {
    const {el, bv = "-1"} = videoData;
    if (el.style.display === "none") return promiseResolve;
    const {state, type, matching = null} = shieldingVideo(videoData);
    if (state) {
        eventEmitter.send('event-屏蔽视频元素', {res: {state, type, matching}, method, videoData})
        return promiseResolve;
    }
    //如果没有bv号参数，则不执行
    if (bv === '-1') return promiseReject;
    let videoRes = await videoCacheManager.find(bv);
    if (videoRes === null) {
        const disableNetRequestsBvVideoInfo = localMKData.isDisableNetRequestsBvVideoInfo();
        //如果禁用了网络请求
        if (disableNetRequestsBvVideoInfo) {
            return promiseReject;
        } else {
            const httpRes = await bvRequestQueue.videoInfoRequestQueue.addBv(bv)
            const {msg, data} = httpRes
            if (!httpRes.state) {
                console.warn('获取视频信息失败:' + msg);
                return promiseReject;
            }
            videoRes = data
            if ((await bvDexie.addVideoData(bv, data))) {
                console.log('mk-db-添加视频信息到数据库成功', '获取视频信息成功:' + msg, data, videoData)
                videoCacheManager.updateCacheDebounce()
            }
        }
    }
    const verificationIns = await shieldingOtherVideoParameter(videoRes, videoData);
    if (verificationIns.state) {
        eventEmitter.send('event-屏蔽视频元素', {res: verificationIns, method, videoData})
        return promiseResolve;
    }
    return promiseReject;
}

/**
 * 屏蔽视频元素回调事件
 * 回调参数：
 * res 结果对象，其中包括状态state，和消息msg
 * method 屏蔽方式，remove为直接删除，hide为隐藏，默认为remove
 */
eventEmitter.on('event-屏蔽视频元素', ({res, method = "remove", videoData}) => {
    if (!res) return
    const {type, matching} = res
    const {el} = videoData
    if (method === "remove") {
        el?.remove();
    } else {
        el.style.display = "none";
    }
    eventEmitter.send('event-打印屏蔽视频信息', type, matching, videoData)
})

/**
 * 检查其他视频参数执行屏蔽
 * @param result {{}} 请求相应视频数据
 * @param videoData {{}} 视频网页元素数据
 */
const shieldingOtherVideoParameter = async (result, videoData) => {
    const {tags = [], userInfo, videoInfo} = result
    return asyncBlockUserUidAndName(userInfo.uid, userInfo.name)
        .then(() => {
            if (!isEffectiveUIDShieldingOnlyVideo()) {
                return
            }
            return Promise.reject({type: '中断', msg: '仅生效UID屏蔽(限视频)'});
        })
        //视频tag白名单组合
        .then(() => {
            if (tags.length === 0) return;
            const mkArrTags = ruleKeyListData.getVideoTagCombinationWhite();
            for (let mkArrTag of mkArrTags) {
                if (arrUtil.arrayContains(tags, mkArrTag)) {
                    return Promise.reject({type: '中断', msg: '视频标签组合白名单'});
                }
            }
        })
        .then(() => asyncBlockVideoTagPreciseCombination(tags))
        .then(() => asyncBlockBasedVideoTag(tags))
        .then(() => asyncBlockLimitationFanSum(userInfo.follower))
        .then(() => asyncBlockVerticalVideo(videoInfo.dimension))
        .then(() => asyncBlockVideoCopyright(videoInfo.copyright))
        .then(() => asyncBlockChargeVideo(videoInfo?.is_upower_exclusive))
        .then(() => asyncBlockFollowedVideo(videoInfo?.following))
        .then(() => asyncBlockSeniorMember(userInfo.is_senior_member))
        .then(() => asyncBlockVideoTeamMember(userInfo.mid))
        .then(() => asyncBlockVideoLikeRate(videoInfo.like, videoInfo.view))
        .then(() => asyncBlockVideoInteractiveRate(videoInfo.danmaku, videoInfo.reply, videoInfo.view))
        .then(() => asyncBlockVideoTripleRate(videoInfo.favorite, videoInfo.coin, videoInfo.share, videoInfo.view))
        .then(() => asyncBlockVideoCoinLikesRatioRate(videoInfo.coin, videoInfo.like))
        .then(() => asyncBlockTimeRangeMasking(videoInfo.pubdate))
        .then(() => asyncBlockVideoDesc(videoInfo?.desc))
        .then(() => asyncBlockSignature(videoInfo?.sign))
        .then(() => asyncBlockAvatarPendant(userInfo?.pendant?.name))
        .then(() => asyncBlockByLevel(userInfo?.current_level || -1))
        .then(() => asyncBlockGender(userInfo?.sex))
        .then(() => asyncBlockUserVip(userInfo.vip.type))
        .then(() => asyncBlockUserVideoNumLimit(userInfo.archive_count)).then(async () => {
            //这里请求检查视频评论输入框情况
            const videosInFeaturedCommentsBlockedVal = isVideosInFeaturedCommentsBlockedGm();
            const followers7DaysOnlyVideosBlockedVal = isFollowers7DaysOnlyVideosBlockedGm();
            const commentDisabledVideosBlockedVal = isCommentDisabledVideosBlockedGm();
            if (videosInFeaturedCommentsBlockedVal === false && followers7DaysOnlyVideosBlockedVal === false && commentDisabledVideosBlockedVal === false) {
                return;
            }
            //todo 目前未做持久化缓存处理，待后续完善
            const res = await bvRequestQueue.fetchGetVideoReplyBoxDescRequestQueue.addBv(videoData.bv);
            const {childText, disabled, message, state} = res;
            if (!state) {
                console.warn('获取视频评论输入框失败:' + message)
                return;
            }
            if (commentDisabledVideosBlockedVal && disabled) {
                return Promise.reject({state, type: '禁止评论类视频'})
            }
            if (childText === '关注UP主7天以上的人可发评论' && followers7DaysOnlyVideosBlockedVal) {
                return Promise.reject({state, type: '7天关注才可评论类视频'})
            }
            if (childText === '评论被up主精选后，对所有人可见' && videosInFeaturedCommentsBlockedVal) {
                return Promise.reject({state, type: '精选评论类视频'})
            }
        })
        .then(() => {
            return returnTempVal;
        })
        .catch((v) => {
            const {msg, type} = v;
            if (msg) {
                console.warn('warn-type-msg', msg);
            }
            if (type === '中断') return returnTempVal;
            return v;
        })
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
