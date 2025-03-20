import {eventEmitter} from "../EventEmitter.js";
import localMKData from "../../data/localMKData.js";
import ruleMatchingUtil from "../../utils/ruleMatchingUtil.js";
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
    blockUserUidAndName
} from "./shielding.js";
import {videoInfoCache} from "../cache/videoInfoCache.js";
import {requestIntervalQueue} from "../asynchronousIntervalQueue.js";
import bFetch from '../bFetch.js'
import bvDexie from "../bvDexie.js";
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
    let returnVal = blockUserUidAndName(uid, name);
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
    if (el.style.display === "none") return true;
    const {state, type, matching = null} = shieldingVideo(videoData);
    if (state) {
        eventEmitter.send('event-屏蔽视频元素', {res: {state, type, matching}, method, videoData})
        return true;
    }
    if (localMKData.isDisableNetRequestsBvVideoInfo()) return state;
    shieldingOtherVideoParameter(videoData, method)
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
    eventEmitter.send('屏蔽视频信息', type, matching, videoData)
})

/**
 * 检查其他视频参数执行屏蔽
 * @param videoData {{}} 视频数据
 * @param method {string} 屏蔽方式，remove为直接删除，hide为隐藏，默认为remove
 * @returns null
 */
const shieldingOtherVideoParameter = async (videoData, method) => {
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
    asyncBlockUserUidAndName(userInfo.mid, userInfo.name)
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
            const msg = v['msg'];
            if (msg) {
                console.warn(msg);
            }
            //这里通知屏蔽
            eventEmitter.send('event-屏蔽视频元素', {res: v, method, videoData})
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

