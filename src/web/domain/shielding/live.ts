import ruleMatchingUtil from "../../core/util/ruleMatchingUtil.ts";
import ruleKeyListData from "../../config/ruleKeyListData.ts";
import output_informationTab from "../../ui/output_informationTab.ts";
import {eventEmitter} from "@/core/EventEmitter.ts";
import shielding, {
    asyncBlockByLevelForComment,
    asyncBlockSeniorMemberOnly,
    asyncBlockUserUidAndName,
    blockCheckWhiteUserUid,
    blockUserUidAndName,
} from "./main.ts";
import type { BlockResult } from "@/types/shielding";
import {returnTempVal} from "@/config/globalValue.ts";
import localMKData from "../../state/localMKData.ts";
import LocalMKData from "../../state/localMKData.ts";

interface LiveRoomData {
    name: string;
    title: string;
    partition?: string;
    uid?: number;
    roomId: number | string;
    el?: HTMLElement;
}

interface LiveRoomContent {
    content: string;
    uid: number;
    name: string;
    level?: number;
    chatType: string;
    fansMedal: string | null;
    fanBrandLevel: number;
    el: HTMLElement;
    roomId: number | string;
    gloryLevelSrc?: string | null;
}

interface GloryLevelMappingItem {
    src: string;
    level: number;
}

interface GloryLevelLimitItem {
    roomId: number;
    status: boolean;
    limitLevel?: number;
    level?: number;
}

interface FansLevelLimitItem {
    name: string;
    status: boolean;
    limitLevel: number;
}

export const blockLiveRoomId = (liveRoomId: number | string): BlockResult => {
    if (GM_getValue('precise_liveRoomId', [] as (string | number)[]).includes(liveRoomId)) {
        return {state: true, type: "精确直播间id", matching: liveRoomId};
    }
    return returnTempVal;
}

const asyncBlockUserFanCard = async (fansMedal: string | null): Promise<BlockResult> => {
    if (fansMedal !== null) {
        if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseFanCardArr(), fansMedal)) {
            return {state: true, type: '精确粉丝牌', matching: fansMedal}
        }
    }
    return returnTempVal;
}

const blockLiveTitle = (title: string): BlockResult => {
    return shielding.blockExactAndFuzzyMatching(title, {
        fuzzyKey: 'liveTitle', fuzzyTypeName: '模糊标题(直播间)',
        regexKey: 'liveTitleCanonical', regexTypeName: '正则标题(直播间)'
    })
}

const blockLiveUserId = (liveUid: number): BlockResult => {
    if (ruleMatchingUtil.exactMatch(GM_getValue('precise_live_uid', []), liveUid)) {
        return {state: true, type: "精确uid(直播区)"};
    }
    return returnTempVal;
}

const blockLiveBarrage = (barrage: string): BlockResult => {
    return shielding.blockExactAndFuzzyMatching(barrage, {
        fuzzyKey: 'liveBarrage', fuzzyTypeName: '直播弹幕(模糊)',
        regexKey: 'liveBarrageCanonical', regexTypeName: '直播弹幕(正则)'
    })
}

const blockGloryLevel = (roomId: number | string, gloryLevelSrc: string | null): BlockResult => {
    if (gloryLevelSrc === null || gloryLevelSrc.length <= 10) return returnTempVal
    const listGm = localMKData.getGloryLevelMappingListGm();
    if (listGm.length === 0) return returnTempVal;
    const find = listGm.find(item => item.src === gloryLevelSrc);
    if (find === undefined) return returnTempVal;
    const findLevel = find.level
    const levelLimitListGm: any[] = LocalMKData.getGloryLevelLimitListGm();
    const globalItem = levelLimitListGm.find(item => item.roomId === 0)
    if (globalItem.status) {
        if (findLevel >= globalItem.limitLevel!) {
            return returnTempVal
        }
        return {
            state: true,
            type: "荣耀等级屏蔽",
            matching: `用户等级${findLevel}<=全局限制等级${globalItem.limitLevel}`
        }
    }
    for (let limitItem of levelLimitListGm) {
        if (limitItem.roomId !== roomId) continue
        if (!limitItem.status) break;
        if (findLevel <= limitItem.level!) {
            return {
                state: true,
                type: "荣耀等级屏蔽",
                matching: `用户等级${findLevel}=>当前房间${roomId}限制等级${limitItem.limitLevel}`
            }
        }
    }
    return returnTempVal
}

const asyncBlockGloryLevel = async (roomId: number | string, gloryLevelSrc: string | null): Promise<BlockResult> => {
    const res = blockGloryLevel(roomId, gloryLevelSrc)
    if (res.state) {
        return Promise.reject(res)
    }
    return res
}

const blockFansLevel = (fansMedal: string | null, fansLevel: number): BlockResult => {
    if (fansMedal === null || fansLevel === -1) return returnTempVal
    const listGm = localMKData.getFansLevelLimitListGm();
    const find = listGm.find(item => item.name === fansMedal);
    if (find === undefined) return returnTempVal
    if (!find.status) return returnTempVal
    const {limitLevel} = find;
    if (limitLevel >= fansLevel) {
        return {
            state: true,
            type: "粉丝牌等级屏蔽",
            matching: `限制【${fansMedal}】粉丝牌等级${limitLevel}>=目标粉丝牌等级${fansLevel}`
        }
    }
    return returnTempVal
}

const asyncBlockFansLevel = async (fansMedal: string | null, fansLevel: number): Promise<BlockResult> => {
    const res = blockFansLevel(fansMedal, fansLevel)
    if (res.state) {
        return Promise.reject(res)
    }
    return res
}

const shieldingLiveRoom = (liveRoomData: LiveRoomData): BlockResult => {
    const {name, title, partition, uid = -1, roomId} = liveRoomData;
    let returnVal: BlockResult;
    if (uid !== -1) {
        if (blockCheckWhiteUserUid(uid)) {
            return returnTempVal;
        }
        returnVal = blockUserUidAndName(uid, name)
        if (returnVal.state) return returnVal
        returnVal = blockLiveUserId(uid)
        if (returnVal.state) return returnVal
    }
    returnVal = blockLiveTitle(title)
    if (returnVal.state) {
        return returnVal
    }
    if (partition) {
        if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPrecisePartitionArr(), partition)) {
            return {state: true, type: "精确直播分区"};
        }
    }
    if (roomId) {
        return blockLiveRoomId(roomId);
    }
    return returnTempVal;
}

const shieldingLiveRoomDecorated = (liveRoomData: LiveRoomData): boolean => {
    const {state, type, matching} = shieldingLiveRoom(liveRoomData);
    if (state) {
        liveRoomData.el?.remove();
        const infoHtml = output_informationTab.getLiveRoomInfoHtml(type ?? '', matching ?? '', liveRoomData);
        eventEmitter.send('打印信息', infoHtml)
    }
    return state;
}

const addLiveContentBlockButton = (commentsData: any): void => {
    shielding.addBlockButton(commentsData, "gz_shielding_live_danmaku_button");
}

eventEmitter.on('event-直播首页列表添加屏蔽按钮', (liveCardItemData: any) => {
    shielding.addBlockButton(liveCardItemData, "gz-live-home-room-card-list-item");
})

export default {
    shieldingLiveRoomDecorated,
    shieldingLiveRoomContent(liveRoomContent: LiveRoomContent): void {
        const {
            content, uid, name, level = -1, chatType, fansMedal, fanBrandLevel, el,
            roomId, gloryLevelSrc = null
        } = liveRoomContent;
        asyncBlockSeniorMemberOnly(level)
            .then(() => asyncBlockUserUidAndName(uid, name))
            .then(() => asyncBlockByLevelForComment(level))
            .then(() => asyncBlockUserFanCard(fansMedal))
            .then(() => asyncBlockGloryLevel(roomId, gloryLevelSrc))
            .then(() => asyncBlockFansLevel(fansMedal, fanBrandLevel))
            .then(() => {
                if (chatType === 'emoticon') {
                    return Promise.reject({type: '中断'});
                }
            })
            .then(() => blockLiveBarrage(content))
            .catch(res => {
                let {state, type, matching} = res;
                if (type === '中断') return;
                if (state) {
                    el?.remove()
                }
                if (type) {
                    const infoHtml = output_informationTab.getLiveRoomCommentInfoHtml(type, matching, liveRoomContent);
                    eventEmitter.send('打印信息', infoHtml)
                }
            })
    },
    addLiveContentBlockButton, asyncBlockUserFanCard
}
