import {eventEmitter} from "@/core/EventEmitter.ts";
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
} from "../../state/localMKData.ts";
import ruleKeyListData from "../../config/ruleKeyListData.ts";
import shielding, {
    asyncBlockAvatarPendant,
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
} from "./main.ts";
import type { BlockResult } from "@/types/shielding";
import type { VideoData, VideoShieldData, ShieldVideoEventData } from "@/types/video";
import {promiseReject, promiseResolve, returnTempVal} from "@/config/globalValue.ts";
import arrUtil from "../../core/util/arrUtil.ts";
import bvRequestQueue from "../../core/http/bvRequestQueue.ts";
import bvDexie from "../../core/cache/bvDexie.ts";
import {videoCacheManager} from "@/core/cache/videoCacheManager.ts";
import ruleMatchingUtil from "../../core/util/ruleMatchingUtil.ts";
import combinationRulesShielding from "./combinationRules.ts";

/** 检查视频tag执行多重tag组合屏蔽 */
const asyncBlockVideoTagPreciseCombination = async (tags: string[]): Promise<void> => {
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

/** 检查视频tag执行精确、模糊、正则三级匹配屏蔽 */
const blockBasedVideoTag = (tags: string[]): BlockResult => {
    const preciseVideoTagArr = ruleKeyListData.getPreciseVideoTagArr();
    const videoTagArr = ruleKeyListData.getVideoTagArr();
    if (preciseVideoTagArr.length <= 0 && videoTagArr.length <= 0) {
        return returnTempVal
    }
    for (let tag of tags) {
        if (ruleMatchingUtil.exactMatch(preciseVideoTagArr, tag)) {
            return {state: true, type: "精确视频tag", matching: tag}
        }
        let fuzzyMatch = ruleMatchingUtil.fuzzyMatch(videoTagArr, tag);
        if (fuzzyMatch) {
            return {state: true, type: "模糊视频tag", matching: fuzzyMatch}
        }
        fuzzyMatch = ruleMatchingUtil.regexMatch(ruleKeyListData.getVideoTagCanonicalArr(), tag)
        if (fuzzyMatch) {
            return {state: true, type: "正则视频tag", matching: fuzzyMatch}
        }
    }
    return returnTempVal
}

/** 异步检查视频tag屏蔽，匹配成功抛出异常 */
const asyncBlockBasedVideoTag = async (tags: string[]): Promise<void> => {
    const res = blockBasedVideoTag(tags);
    if (res.state) return Promise.reject(res);
}

/** 检查视频bv号是否在精确屏蔽列表中 */
const blockVideoBV = (bv: string | null | undefined): BlockResult => {
    if (!bv) return returnTempVal;
    const bvs = ruleKeyListData.getPreciseVideoBV();
    if (bvs.includes(bv)) {
        return {state: true, type: "精确bv号屏蔽", matching: bv};
    }
    return returnTempVal
}

/** 检查视频时长是否在用户设定的最小/最大时长范围内 */
const blockVideoDuration = (duration: number): BlockResult => {
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

/** 检查视频弹幕数是否在用户设定的最小/最大弹幕数范围内 */
const blockVideoBulletChat = (bulletChat: number): BlockResult => {
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

/** 检查视频播放量是否在用户设定的最小/最大播放量范围内 */
const blockVideoPlayCount = (playCount: number): BlockResult => {
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

/** 检查视频争议消息内容，支持精确匹配和模糊匹配 */
const blockArgueMsgContent = (argueMsg: string | undefined): BlockResult => {
    if (argueMsg === undefined || argueMsg.trim().length <= 0) return returnTempVal;
    const argueMsgList = GM_getValue('argue_msg', []);
    let match: any = ruleMatchingUtil.fuzzyMatch(argueMsgList, argueMsg);
    if (match !== null) {
        return {state: true, type: '争议消息内容模糊屏蔽', matching: match}
    }
    const argueMsgPreciseList = GM_getValue('argue_msg_precise', []);
    match = ruleMatchingUtil.exactMatch(argueMsgPreciseList, argueMsg);
    if (match) {
        return {state: true, type: '争议消息内容精确屏蔽', matching: match}
    }
    return returnTempVal
}

/** 异步检查争议消息内容屏蔽，匹配成功抛出异常 */
const asyncBlockArgueMsgContent = async (argueMsg: string | undefined): Promise<BlockResult> => {
    const res = blockArgueMsgContent(argueMsg);
    if (res.state) {
        return Promise.reject(res)
    }
    return res
}

/** 同步视频屏蔽核心流程：依次检查uid/name、标题、bv号、时长、弹幕数、播放量 */
const shieldingVideo = (videoData: VideoData): BlockResult => {
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
    return returnTempVal;
}

/** 装饰版异步视频屏蔽：先同步检查，通过后触发异步获取详细视频信息进行深度检查 */
const shieldingVideoDecorated = async (videoData: VideoData, method: string = "remove"): Promise<void> => {
    const {el, bv = "-1"} = videoData;
    if (el.style.display === "none") return promiseResolve;
    const {state, type, matching = null} = shieldingVideo(videoData);
    if (state) {
        eventEmitter.send('event-屏蔽视频元素', {res: {state, type, matching}, method, videoData})
        return promiseResolve;
    }
    if (bv === '-1') return promiseReject;
    eventEmitter.emitAsync('event:检查其他视频参数', videoData, method)
    return promiseReject;
}

/** 异步获取视频详细信息并进行深度屏蔽检查，优先从缓存读取，未命中时通过网络请求获取 */
eventEmitter.on('event:检查其他视频参数', async (videoData: VideoData, method: string) => {
    const {bv = "-1"} = videoData;
    const bvStr = bv ?? '';
    let videoRes = await videoCacheManager.find(bvStr);
    if (videoRes === null) {
        const disableNetRequestsBvVideoInfo = localMKData.isDisableNetRequestsBvVideoInfo();
        if (disableNetRequestsBvVideoInfo) {
            return promiseReject;
        } else {
            const httpRes = await bvRequestQueue.videoInfoRequestQueue.addBv(bvStr)
            const {msg, data} = httpRes
            if (!httpRes.state) {
                console.warn('获取视频信息失败:' + msg);
                return promiseReject;
            }
            videoRes = data as any
            if ((await bvDexie.addVideoData(bvStr, data as any))) {
                console.log('mk-db-添加视频信息到数据库成功', '获取视频信息成功:' + msg, data, videoData)
                videoCacheManager.updateCacheDebounce()
            }
        }
    }
    const verificationIns = await shieldingOtherVideoParameter(videoRes as any, videoData);
    if (verificationIns.state) {
        eventEmitter.send('event-屏蔽视频元素', {res: verificationIns, method, videoData})
    }
})

/** 统一屏蔽视频元素事件处理，根据method执行remove或hide操作 */
eventEmitter.on('event-屏蔽视频元素', ({res, method = "remove", videoData}: ShieldVideoEventData) => {
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

/** 异步深度视频屏蔽链：通过API获取的完整视频/用户信息，依次执行所有屏蔽检查的promise链 */
const shieldingOtherVideoParameter = async (result: VideoShieldData, videoData: VideoData): Promise<BlockResult> => {
    const {tags = [], userInfo, videoInfo} = result
    return asyncBlockUserUidAndName(userInfo.uid, userInfo.name)
        .then(() => {
            if (!isEffectiveUIDShieldingOnlyVideo()) {
                return
            }
            return Promise.reject({type: '中断', msg: '仅生效UID屏蔽(限视频)'});
        })
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
        .then(() => asyncBlockVideoCopyright(videoInfo.copyright!))
        .then(() => asyncBlockChargeVideo(videoInfo?.is_upower_exclusive!))
        .then(() => asyncBlockFollowedVideo(videoInfo?.following!))
        .then(() => asyncBlockSeniorMember(userInfo.is_senior_member ? 1 : 0))
        .then(() => asyncBlockVideoTeamMember(userInfo.mid!))
        .then(() => asyncBlockVideoLikeRate(videoInfo.like, videoInfo.view))
        .then(() => asyncBlockVideoInteractiveRate(videoInfo.danmaku, videoInfo.reply, videoInfo.view))
        .then(() => asyncBlockVideoTripleRate(videoInfo.favorite, videoInfo.coin, videoInfo.share, videoInfo.view))
        .then(() => asyncBlockVideoCoinLikesRatioRate(videoInfo.coin, videoInfo.like))
        .then(() => asyncBlockTimeRangeMasking(videoInfo.pubdate!))
        .then(() => asyncBlockVideoDesc(videoInfo?.desc!))
        .then(() => asyncBlockSignature(videoInfo?.sign!))
        .then(() => asyncBlockAvatarPendant(userInfo?.pendant?.name))
        .then(() => asyncBlockByLevel(userInfo?.current_level || -1))
        .then(() => asyncBlockGender(userInfo?.sex!))
        .then(() => asyncBlockUserVip(userInfo.vip.type))
        .then(() => asyncBlockUserVideoNumLimit(userInfo.archive_count!)).then(async () => {
            const videosInFeaturedCommentsBlockedVal = isVideosInFeaturedCommentsBlockedGm();
            const followers7DaysOnlyVideosBlockedVal = isFollowers7DaysOnlyVideosBlockedGm();
            const commentDisabledVideosBlockedVal = isCommentDisabledVideosBlockedGm();
            if (videosInFeaturedCommentsBlockedVal === false && followers7DaysOnlyVideosBlockedVal === false && commentDisabledVideosBlockedVal === false) {
                return;
            }
            const res = await bvRequestQueue.fetchGetVideoReplyBoxDescRequestQueue.addBv(videoData.bv!);
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
        .then(() => asyncBlockArgueMsgContent(videoInfo['argue_msg']))
        .then(() => {
            const mergeData = {...result, ...videoData}
            return combinationRulesShielding.asyncBlockCombinationRulePlan(mergeData as any)
        })
        .then(() => {
            return returnTempVal;
        })
        .catch((v: any) => {
            const {msg, type} = v;
            if (msg) {
                console.warn('warn-type-msg', msg);
            }
            if (type === '中断') return returnTempVal;
            return v;
        })
}

/** 热门视频页面添加屏蔽按钮，位于右下角 */
eventEmitter.on('添加热门视频屏蔽按钮', (data: any) => {
    shielding.addBlockButton(data, "gz_shielding_button", ["right", "bottom"]);
})

/** BewlyBewly模式下视频添加屏蔽按钮，位于右下角 */
eventEmitter.on('视频添加屏蔽按钮-BewlyBewly', (data: any) => {
    shielding.addBlockButton(data, "gz_shielding_button", ['right', 'bottom']);
})

/** 通用视频添加屏蔽按钮，位于右侧 */
eventEmitter.on('视频添加屏蔽按钮', (data: any) => {
    shielding.addBlockButton(data, "gz_shielding_button", ["right"]);
})

export default {
    shieldingVideoDecorated
}
