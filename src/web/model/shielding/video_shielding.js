import {eventEmitter} from "../EventEmitter.js";
import localMKData, {isEffectiveUIDShieldingOnlyVideo} from "../../data/localMKData.js";
import ruleKeyListData from "../../data/ruleKeyListData.js";
import gmUtil from "../../utils/gmUtil.js";
import shielding, {
    asyncBlockAvatarPendant,
    asyncBlockBasedVideoTag,
    asyncBlockByLevel,
    asyncBlockChargeVideo,
    asyncBlockFollowedVideo,
    asyncBlockGender,
    asyncBlockSeniorMember,
    asyncBlockSignature,
    asyncBlockTimeRangeMasking,
    asyncBlockUserUidAndName,
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
import {videoInfoCache, videoInfoCacheUpdateDebounce} from "../cache/videoInfoCache.js";
import {requestIntervalQueue} from "../asynchronousIntervalQueue.js";
import bFetch from '../bFetch.js'
import {returnTempVal} from "../../data/globalValue.js";
import arrUtil from "../../utils/arrUtil.js";


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
    if (bvs.includes(bv)) return Promise.reject({
        state: true,
        type: "精确bv号屏蔽",
        matching: bv
    })
    return returnTempVal
}

//检查视频时长屏蔽
const blockVideoDuration = (duration) => {
    if (duration !== -1) {
        const min = gmUtil.getData('nMinimumDuration', -1);
        if (min > duration && min !== -1) {
            return {state: true, type: '最小时长', matching: min}
        }
        const max = gmUtil.getData('nMaximumDuration', -1)
        if (max < duration && max !== -1) {
            return {state: true, type: '最大时长', matching: max}
        }
    }
    return returnTempVal
}

//检查视频弹幕数量屏蔽
const blockVideoBulletChat = (bulletChat) => {
    //限制弹幕数
    if (bulletChat !== -1) {
        const min = gmUtil.getData('nMinimumBarrage', -1);
        if (min > bulletChat && min !== -1) {
            return {state: true, type: '最小弹幕数', matching: min}
        }
        const max = gmUtil.getData('nMaximumBarrage', -1)
        if (max < bulletChat && max !== -1) {
            return {state: true, type: '最大弹幕数', matching: max}
        }
    }
    return returnTempVal
}

//检查视频播放量数量屏蔽
const blockVideoPlayCount = (playCount) => {
    if (playCount !== -1) {
        const min = gmUtil.getData('nMinimumPlay', -1);
        if (min > playCount && min !== -1) {
            return {state: true, type: '最小播放量', matching: min}
        }
        const max = gmUtil.getData('nMaximumPlayback', -1)
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
 * @returns {boolean}state 是否屏蔽或屏蔽过
 */
const shieldingVideoDecorated = (videoData, method = "remove") => {
    const {el, bv = "-1"} = videoData;
    if (el.style.display === "none") return true;
    const {state, type, matching = null} = shieldingVideo(videoData);
    if (state) {
        eventEmitter.send('event-屏蔽视频元素', {res: {state, type, matching}, method, videoData})
        return true;
    }
    if (localMKData.isDisableNetRequestsBvVideoInfo()) return state;
    //如果没有bv号参数，则不执行
    if (bv === '-1') return false
    if (videoInfoCache.getCount() === 0) {
        videoInfoCacheUpdateDebounce()
    }
    const find = videoInfoCache.find(bv);
    if (find === null) {
        //获取视频信息
        requestIntervalQueue.add(() => bFetch.fetchGetVideoInfo(bv)).then(({state, data, msg}) => {
            if (!state) {
                console.warn('获取视频信息失败:' + msg);
                return
            }
            videoInfoCache.addResData(bv, data, videoData, method)
            videoInfoCacheUpdateDebounce()
        })
        return false
    } else {
        shieldingOtherVideoParameter(find, videoData, method)
    }
    return state;
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
 * @param method {string} 屏蔽方式，remove为直接删除，hide为隐藏，默认为remove
 * @returns null
 */
const shieldingOtherVideoParameter = async (result, videoData, method) => {
    const {tags = [], userInfo, videoInfo} = result
    asyncBlockUserUidAndName(userInfo.uid, userInfo.name)
        .then(() => {
            if (!isEffectiveUIDShieldingOnlyVideo()) {
                return
            }
            return Promise.reject({type: '中断', msg: '仅生效UID屏蔽(限视频)'});
        })
        .then(() => asyncBlockVideoTagPreciseCombination(tags))
        .then(() => asyncBlockBasedVideoTag(tags))
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
        .catch((v) => {
            const {msg, type} = v;
            if (msg) {
                console.warn('warn-type-msg', msg);
            }
            if (type === '中断') {
                return;
            }
            //这里通知屏蔽
            eventEmitter.send('event-屏蔽视频元素', {res: v, method, videoData})
        })
}

eventEmitter.on('event-检查其他视频参数屏蔽', (result, videoData, method) => {
    shieldingOtherVideoParameter(result, videoData, method)
})

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
    shieldingVideoDecorated,
    shieldingOtherVideoParameter
}

