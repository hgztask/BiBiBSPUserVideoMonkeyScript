import ruleMatchingUtil from "../../core/util/ruleMatchingUtil.ts";
import ruleKeyListData from "../../config/ruleKeyListData.ts";
import ruleUtil from "../../core/util/ruleUtil.ts";
import {eventEmitter} from "@/core/EventEmitter.ts";
import {elEventEmitter} from "@/core/elEventEmitter.ts";
import localMKData, {
    getLimitationFanSumGm,
    getLimitationVideoSubmitSumGm,
    getMaximumUserLevelCommentGm,
    getMaximumUserLevelVideoGm,
    getMinimumUserLevelCommentGm,
    getMinimumUserLevelVideoGm,
    hideBlockButtonGm,
    isEnableMaximumUserLevelCommentGm,
    isEnableMaximumUserLevelVideoGm,
    isEnableMinimumUserLevelCommentGm,
    isEnableMinimumUserLevelVideoGm,
    isFansNumBlockingStatusGm,
    isLimitationVideoSubmitStatusGm,
    isSeniorMemberOnly
} from "../../state/localMKData.ts";
import defUtil from "../../core/util/defUtil.ts";
import {returnTempVal} from "@/config/globalValue.ts";

export interface BlockResult {
    state: boolean;
    type?: string;
    matching?: string | number | boolean;
    msg?: string;
}

interface BlockButtonData {
    data: {
        insertionPositionEl: HTMLElement;
        explicitSubjectEl?: HTMLElement;
        cssMap?: Record<string, string>;
        cssText?: string;
        el?: HTMLElement;
        uid?: number;
        name?: string;
        bv?: string;
        title?: string;
        roomId?: number | string;
        decoratePic?: any;
        collectionActId?: number;
        dressUpId?: number;
        position?: string[];
        userUrl?: string;
        [key: string]: any;
    };
    updateFunc?: (el: HTMLElement) => any;
    maskingFunc?: () => void;
    mouseoverFun?: (buttonEl: HTMLElement) => void;
}

interface ExactFuzzyMatchConfig {
    exactKey?: string;
    exactTypeName?: string;
    exactRuleArr?: (string | number)[];
    fuzzyKey?: string;
    fuzzyTypeName?: string;
    fuzzyRuleArr?: string[];
    regexKey?: string;
    regexTypeName?: string;
    regexRuleArr?: string[];
}

interface Dimension {
    width: number;
    height: number;
}

interface TeamMember {
    mid: number;
    name: string;
}

interface TimeRangeItem {
    status: boolean;
    r: [number, number];
}

const addBlockButton = (data: BlockButtonData, className: string = 'gz_def_shielding_button', position: string[] = []): void => {
    if (hideBlockButtonGm()) return;
    const {insertionPositionEl, explicitSubjectEl, cssMap, cssText} = data.data;
    if (className === '' || className === null || className === undefined) {
        className = 'gz_def_shielding_button'
    }
    const butEl = insertionPositionEl.querySelector("." + className);
    if (butEl) return;
    const buttonEL = document.createElement("button")
    buttonEL.setAttribute("gz_type", "")
    if (className !== '') {
        buttonEL.className = className;
    }
    buttonEL.textContent = "屏蔽";
    if (position.length !== 0) {
        buttonEL.style.position = "absolute";
    }
    if (position.includes("right")) {
        buttonEL.style.right = "0";
    }
    if (position.includes("bottom")) {
        buttonEL.style.bottom = "0";
    }
    if (cssText) {
        buttonEL.style.cssText = cssText;
    }
    if (cssMap) {
        for (let key of Object.keys(cssMap)) {
            (buttonEL.style as any)[key] = cssMap[key];
        }
    }
    if (explicitSubjectEl) {
        const {mouseoverFun} = data;
        buttonEL.style.display = "none";
        elEventEmitter.addEvent(explicitSubjectEl, "mouseout", () => buttonEL.style.display = "none");
        elEventEmitter.addEvent(explicitSubjectEl, "mouseover", () => {
            if (mouseoverFun) {
                mouseoverFun(buttonEL)
            } else {
                buttonEL.style.display = ""
            }
        });
    }
    insertionPositionEl.appendChild(buttonEL);

    buttonEL.addEventListener("click", (event) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        const {updateFunc, data: {el}} = data;
        if (__DEV__) {
            console.log(data)
        }
        let localData;
        if (updateFunc) {
            localData = updateFunc(el!);
        } else {
            localData = data.data;
        }
        const {
            uid = -1, name = null, bv = null, title = '', roomId = null,
            decoratePic = null, collectionActId = -1, dressUpId = -1,
        } = localData;
        const showList: { label: string; value: string; title?: string }[] = []
        if (uid !== -1) {
            showList.push({label: `uid精确屏蔽-用户uid=${uid}-name=${name}`, value: "uid"});
            showList.push({label: `直播区用户uid精确屏蔽-uid=${uid}-name=${name}`, value: "live_uid"});
        } else {
            showList.push({label: `用户名精确屏蔽(不推荐)-用户name=${name}`, value: 'name'})
        }
        if (bv !== null) {
            showList.push({label: `bv号屏蔽-视频bv=${bv}`, value: "bv", title: title})
        }
        if (roomId !== null) {
            showList.push({label: `直播间id屏蔽-直播间id=${roomId}`, value: "roomId"});
        }
        if (decoratePic !== null && collectionActId !== -1) {
            showList.push({label: `装扮收藏集id屏蔽-id=${collectionActId}`, value: "collectionActId"});
        }
        if (decoratePic !== null && dressUpId !== -1) {
            showList.push({label: `装扮id屏蔽-id=${dressUpId}`, value: "dressUpId"});
        }
        eventEmitter.send('sheet-dialog', {
            title: "屏蔽选项",
            list: showList,
            optionsClick: (item: { value: string }) => {
                const {value} = item
                let results: { status: boolean; res?: string | number };
                switch (value) {
                    case "uid":
                        if (uid === -1) {
                            eventEmitter.send('el-msg', "该页面数据不存在uid字段")
                            return;
                        }
                        results = ruleUtil.addRulePreciseUid(uid);
                        break;
                    case "live_uid":
                        if (uid === -1) {
                            return eventEmitter.send('el-msg', "该页面数据不存在uid字段");
                        }
                        results = ruleUtil.addRule(uid, "precise_live_uid");
                        eventEmitter.send('el-notify', {
                            title: '添加直播区用户uid(精确匹配)操作提示',
                            message: results.res,
                            type: 'success'
                        })
                        break;
                    case "name":
                        results = ruleUtil.addRulePreciseName(name);
                        break;
                    case "bv":
                        results = ruleUtil.addRulePreciseBv(bv);
                        break;
                    case "roomId":
                        results = ruleUtil.addRule(roomId, "precise_liveRoomId");
                        eventEmitter.send('el-notify', {
                            title: '添加精确直播间id操作提示',
                            message: results.res,
                            type: 'success'
                        })
                        break;
                    case 'collectionActId':
                        results = ruleUtil.addRule(collectionActId, "precise_decoration_collection_id");
                        break
                    case 'dressUpId':
                        results = ruleUtil.addRule(dressUpId, "precise_decoration_id");
                        break
                    default:
                        eventEmitter.invoke('el-confirm', '不推荐用户使用精确用户名来屏蔽，确定继续吗？').then(() => {
                            if (ruleUtil.addRulePreciseName(name).status) {
                                data.maskingFunc?.();
                            }
                        })
                }
                if (results!.status) {
                    data.maskingFunc?.();
                }
            }
        })
    })
}

const addTopicDetailVideoBlockButton = (data: BlockButtonData): void => {
    addBlockButton(data, "gz_shielding_button");
}

const addTopicDetailContentsBlockButton = (data: BlockButtonData): void => {
    const position = data.data.position;
    const loop = position !== undefined;
    addBlockButton(data, "gz_shielding_topic_detail_button", loop ? position : []);
}

const blockUserUid = (uid: number): BlockResult => {
    if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseUidArr(), uid)) {
        return {state: true, type: "精确uid"};
    }
    return returnTempVal;
}

export const blockCheckWhiteUserUid = (uid: number): boolean => {
    return ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseUidWhiteArr(), uid);
}

const blockExactAndFuzzyMatching = (val: string | number, config: ExactFuzzyMatchConfig): BlockResult => {
    if (!val) {
        return returnTempVal
    }
    const {exactKey, exactTypeName, fuzzyKey, fuzzyTypeName, regexKey, regexTypeName} = config;
    const exactVal = exactKey ? GM_getValue(exactKey) : undefined;
    const exactRuleArr: string[] = Array.isArray(exactVal) ? exactVal : [];
    if (exactKey) {
        if (ruleMatchingUtil.exactMatch(exactRuleArr, val)) {
            return {state: true, type: exactTypeName, matching: val}
        }
    }
    let matching: string | null | undefined;
    const fuzzyVal = fuzzyKey ? GM_getValue(fuzzyKey) : undefined;
    const fuzzyRuleArr: string[] = Array.isArray(fuzzyVal) ? fuzzyVal : [];
    if (fuzzyKey) {
        matching = ruleMatchingUtil.fuzzyMatch(fuzzyRuleArr, String(val));
        if (matching) {
            return {state: true, type: fuzzyTypeName, matching}
        }
    }
    const regexVal = regexKey ? GM_getValue(regexKey) : undefined;
    const regexRuleArr: string[] = Array.isArray(regexVal) ? regexVal : [];
    if (regexKey) {
        matching = ruleMatchingUtil.regexMatch(regexRuleArr, String(val));
        if (matching) {
            return {state: true, type: regexTypeName, matching}
        }
    }
    return returnTempVal
}

export const blockComment = (comment: string): BlockResult => {
    return blockExactAndFuzzyMatching(comment, {
        fuzzyKey: 'commentOn', fuzzyTypeName: '模糊评论',
        regexKey: 'commentOnCanonical', regexTypeName: '正则评论'
    })
}

export const asyncBlockComment = async (comment: string): Promise<void> => {
    const res = blockComment(comment);
    if (res.state) return Promise.reject(res);
}

export const blockAvatarPendant = (name: string): BlockResult => {
    return blockExactAndFuzzyMatching(name, {
        exactKey: 'precise_avatarPendantName',
        exactTypeName: '精确头像挂件名', fuzzyKey: 'avatarPendantName', fuzzyTypeName: '模糊头像挂件名'
    })
}

export const asyncBlockAvatarPendant = async (name: string): Promise<void> => {
    const res = blockAvatarPendant(name);
    if (res.state) return Promise.reject(res);
}

export const blockSignature = (signature: string): BlockResult => {
    return blockExactAndFuzzyMatching(signature, {
        fuzzyKey: 'signature', fuzzyTypeName: '模糊用户签名', regexKey: 'signatureCanonical', regexTypeName: '正则用户签名'
    })
}

export const asyncBlockSignature = async (signature: string): Promise<void> => {
    const res = blockSignature(signature);
    if (res.state) return Promise.reject(res);
}

export const blockVideoDesc = (desc: string): BlockResult => {
    return blockExactAndFuzzyMatching(desc, {
        fuzzyKey: 'videoDesc', fuzzyTypeName: '视频简介(模糊匹配)'
        , regexKey: 'videoDescCanonical', regexTypeName: '视频简介(正则匹配)'
    })
}

export const asyncBlockVideoDesc = async (desc: string): Promise<void> => {
    const res = blockVideoDesc(desc);
    if (res.state) return Promise.reject(res);
}

export const blockGender = (gender: string): BlockResult => {
    const val = localMKData.isGenderRadioVal();
    const state = val === gender && val !== '不处理';
    if (state) {
        return {state: true, type: '性别屏蔽', matching: val}
    }
    return returnTempVal;
}

export const asyncBlockGender = async (gender: string): Promise<void> => {
    const res = blockGender(gender);
    if (res.state) {
        return Promise.reject(res)
    }
}

export const blockUserVip = (vipId: number): BlockResult => {
    const val = localMKData.isVipTypeRadioVal();
    const vipMap: Record<number, string> = {
        0: '无',
        1: '月大会员',
        2: '年度及以上大会员'
    }
    if (val === vipMap[vipId]) {
        return {state: true, type: '会员类型屏蔽', matching: val}
    }
    return returnTempVal
}

export const asyncBlockUserVip = async (vipId: number): Promise<void> => {
    const res = blockUserVip(vipId);
    if (res.state) {
        return Promise.reject(res)
    }
}

export const blockSeniorMember = (num: number): BlockResult => {
    if (num === 1 && localMKData.isSeniorMember()) {
        return {state: true, type: '屏蔽硬核会员'}
    }
    return returnTempVal
}

export const asyncBlockSeniorMember = async (num: number): Promise<void> => {
    const res = blockSeniorMember(num);
    if (res.state) {
        return Promise.reject(res)
    }
}

export const blockVideoCopyright = (num: number): BlockResult => {
    const val = localMKData.isCopyrightRadio();
    const tempMap: Record<number, string> = {
        1: '原创',
        2: '转载'
    }
    if (val === tempMap[num]) {
        return {state: true, type: '视频类型屏蔽', matching: val}
    }
    return returnTempVal
}

export const asyncBlockVideoCopyright = async (num: number): Promise<void> => {
    const res = blockVideoCopyright(num);
    if (res.state) {
        return Promise.reject(res)
    }
}

export const blockVerticalVideo = (dimension: Dimension): BlockResult => {
    if (!localMKData.isBlockVerticalVideo()) {
        return returnTempVal
    }
    if (!dimension) {
        return returnTempVal
    }
    const vertical = dimension.width < dimension.height
    if (vertical) {
        return {state: true, type: '竖屏视频屏蔽', matching: vertical}
    }
    return returnTempVal
}

export const asyncBlockVerticalVideo = async (dimension: Dimension): Promise<void> => {
    const res = blockVerticalVideo(dimension);
    if (res.state) return Promise.reject(res);
}

export const blockVideoLikeRate = (like: number, view: number): BlockResult => {
    if (!like || !view || !localMKData.isVideoLikeRateBlockingStatus()) {
        return returnTempVal
    }
    const mk_likeRate = parseInt(String(localMKData.getVideoLikeRate() * 100));
    if (isNaN(mk_likeRate)) {
        return returnTempVal
    }
    const likeRate = defUtil.calculateLikeRate(like, view);
    if (likeRate <= mk_likeRate) {
        return {
            state: true, type: '视频点赞率屏蔽', matching: mk_likeRate + '%'
            , msg: `视频的点赞率为${likeRate}%，低于用户指定的限制${mk_likeRate}%，屏蔽该视频`
        }
    }
    return returnTempVal
}

export const asyncBlockVideoLikeRate = async (like: number, view: number): Promise<void> => {
    const res = blockVideoLikeRate(like, view);
    if (res.state) return Promise.reject(res);
}

export const blockVideoInteractiveRate = (danmaku: number, reply: number, view: number): BlockResult => {
    if (!danmaku || !view || !localMKData.isInteractiveRateBlockingStatus()) {
        return returnTempVal
    }
    const mk_interactionRate = parseInt(String(localMKData.getInteractiveRate() * 100))
    const interactionRate = defUtil.calculateInteractionRate(danmaku, reply, view);
    if (interactionRate <= mk_interactionRate) {
        return {
            state: true, type: '视频互动率屏蔽', matching: mk_interactionRate + '%'
            , msg: `视频的互动率为${interactionRate}%，低于用户指定的限制${mk_interactionRate}%，屏蔽该视频`
        }
    }
    return returnTempVal
}

export const asyncBlockVideoInteractiveRate = async (danmaku: number, reply: number, view: number): Promise<void> => {
    const res = blockVideoInteractiveRate(danmaku, reply, view);
    if (res.state) return Promise.reject(res);
}

export const blockVideoTripleRate = (favorite: number, coin: number, share: number, view: number): BlockResult => {
    if (!favorite || !coin || !share || !view || !localMKData.isTripleRateBlockingStatus()) {
        return returnTempVal
    }
    const mk_tripleRate = parseInt(String(localMKData.getTripleRate() * 100))
    const tripleRate = defUtil.calculateTripleRate(favorite, coin, share, view);
    if (tripleRate <= mk_tripleRate) {
        return {
            state: true, type: '视频三连率屏蔽', matching: mk_tripleRate + '%'
            , msg: `视频的三连率为${tripleRate}%，低于用户指定的限制${mk_tripleRate}%，屏蔽该视频`
        }
    }
    return returnTempVal
}

export const asyncBlockVideoTripleRate = async (favorite: number, coin: number, share: number, view: number): Promise<void> => {
    const res = blockVideoTripleRate(favorite, coin, share, view);
    if (res.state) return Promise.reject(res);
}

export const blockVideoCoinLikesRatioRate = (coin: number, like: number): BlockResult => {
    if (!coin || !like || !localMKData.isCoinLikesRatioRateBlockingStatus()) {
        return returnTempVal
    }
    const mk_coinLikesRatioRate = parseInt(String(localMKData.getCoinLikesRatioRate() * 100))
    const coinLikesRatioRate = defUtil.calculateCoinLikesRatioRate(coin, like);
    if (coinLikesRatioRate <= mk_coinLikesRatioRate) {
        return {
            state: true,
            type: '视频投币/点赞比（内容价值）屏蔽',
            matching: mk_coinLikesRatioRate + '%',
            msg: `视频的投币/点赞比（内容价值）为${coinLikesRatioRate}%，低于用户指定的限制${mk_coinLikesRatioRate}%，屏蔽该视频`
        }
    }
    return returnTempVal
}

export const asyncBlockVideoCoinLikesRatioRate = async (coin: number, like: number): Promise<void> => {
    const res = blockVideoCoinLikesRatioRate(coin, like);
    if (res.state) return Promise.reject(res);
}

export const blockByLevelForVideo = (level: number): BlockResult => {
    if (!level) return returnTempVal;
    if (isEnableMinimumUserLevelVideoGm()) {
        const min = getMinimumUserLevelVideoGm();
        if (level < min) {
            return {state: true, type: "最小用户等级过滤-视频", matching: min};
        }
    }
    if (isEnableMaximumUserLevelVideoGm()) {
        const max = getMaximumUserLevelVideoGm();
        if (level > max) {
            return {state: true, type: "最大用户等级过滤-视频", matching: max};
        }
    }
    return returnTempVal;
}

export const blockByLevelForComment = (level: number): BlockResult => {
    if (level === -1) return returnTempVal;
    if (isEnableMinimumUserLevelCommentGm()) {
        const min = getMinimumUserLevelCommentGm();
        if (level < min) {
            return {state: true, type: "最小用户等级过滤-评论", matching: min};
        }
    }
    if (isEnableMaximumUserLevelCommentGm()) {
        const max = getMaximumUserLevelCommentGm();
        if (level > max) {
            return {state: true, type: "最大用户等级过滤-评论", matching: max};
        }
    }
    return returnTempVal;
}

export const asyncBlockByLevelForComment = async (level: number): Promise<void> => {
    const res = blockByLevelForComment(level);
    if (res.state) return Promise.reject(res);
}

export const asyncBlockByLevel = async (level: number): Promise<void> => {
    const res = blockByLevelForVideo(level);
    if (res.state) return Promise.reject(res);
}

export const blockUserUidAndName = (uid: number, name: string): BlockResult => {
    if (!uid || !name) {
        return returnTempVal
    }
    let returnVal = blockUidWholeProcess(uid)
    if (returnVal.state) {
        return returnVal
    }
    returnVal = blockUserName(name)
    if (returnVal.state) {
        return returnVal
    }
    return returnTempVal
}

export const asyncBlockUserUidAndName = async (uid: number, name: string): Promise<void> => {
    const res = blockUserUidAndName(uid, name);
    if (res.state) {
        return Promise.reject(res)
    }
}

export const blockVideoTeamMember = (teamMember: TeamMember[]): BlockResult => {
    if (!teamMember) {
        return returnTempVal
    }
    for (let u of teamMember) {
        const returnVal = blockUserUidAndName(u.mid, u.name)
        if (returnVal.state) {
            return returnVal
        }
    }
    return returnTempVal
}

export const asyncBlockVideoTeamMember = async (teamMember: TeamMember[]): Promise<void> => {
    const res = blockVideoTeamMember(teamMember)
    if (res.state) return Promise.reject(res)
}

export const blockUserName = (name: string): BlockResult => {
    return blockExactAndFuzzyMatching(name, {
        exactKey: 'precise_name',
        exactTypeName: '精确用户名', fuzzyKey: 'name', fuzzyTypeName: '模糊用户名',
        regexKey: 'nameCanonical', regexTypeName: '正则用户名'
    })
}

export const blockVideoOrOtherTitle = (title: string): BlockResult => {
    return blockExactAndFuzzyMatching(title, {
        fuzzyKey: 'title', fuzzyTypeName: '模糊标题',
        regexKey: 'titleCanonical', regexTypeName: '正则标题'
    })
}

export const blockByUidRange = (uid: number): BlockResult => {
    if (!localMKData.isUidRangeMaskingStatus()) {
        return returnTempVal
    }
    const [head, tail] = localMKData.getUidRangeMasking();
    if ((head >= uid) && (uid <= tail)) {
        return {state: true, type: "uid范围屏蔽", matching: `${head}=>${uid}<=${tail}`}
    }
    return returnTempVal
}

export const blockUidWholeProcess = (uid: number): BlockResult => {
    if (!uid || blockCheckWhiteUserUid(uid)) return returnTempVal
    let returnVal = blockUserUid(uid)
    if (returnVal.state) {
        return returnVal;
    }
    return blockByUidRange(uid)
}

export const asyncBlockFollowedVideo = async (following: boolean): Promise<void> => {
    if (following && localMKData.isBlockFollowed()) {
        return Promise.reject({state: true, type: '已关注'})
    }
}

export const asyncBlockChargeVideo = async (isUpOwnerExclusive: boolean): Promise<void> => {
    if (isUpOwnerExclusive && localMKData.isUpOwnerExclusive()) {
        return Promise.reject({state: true, type: '充电专属视频'})
    }
}

export const blockTimeRangeMasking = (timestamp: number): BlockResult => {
    if (!timestamp || !localMKData.isTimeRangeMaskingStatus()) {
        return returnTempVal
    }
    const timeRangeMaskingArr = localMKData.getTimeRangeMaskingArr();
    if (timeRangeMaskingArr.length === 0) {
        return returnTempVal;
    }
    for (let {status, r: [startTimestamp, endTimestamp]} of timeRangeMaskingArr) {
        if (!status) continue
        const startSecondsTimestamp = Math.floor(startTimestamp / 1000)
        const endSecondsTimestamp = Math.floor(endTimestamp / 1000)
        if ((startSecondsTimestamp >= timestamp as any) <= endSecondsTimestamp) {
            const startToTime = new Date(startTimestamp).toLocaleString();
            const endToTime = new Date(endTimestamp).toLocaleString();
            const timestampToTime = new Date(timestamp * 1000).toLocaleString();
            return {state: true, type: "时间范围屏蔽", matching: `${startToTime}=>${timestampToTime}<=${endToTime}`}
        }
    }
    return returnTempVal
}

export const asyncBlockTimeRangeMasking = async (timestamp: number): Promise<void> => {
    const res = blockTimeRangeMasking(timestamp)
    if (res.state) return Promise.reject(res);
}

export const blockSeniorMemberOnly = (level: number): BlockResult => {
    if (!isSeniorMemberOnly() || level === -1) {
        return returnTempVal
    }
    if (level === 7) {
        return {state: true, type: '保留硬核会员'}
    }
    return {state: true, type: '非硬核会员'}
}

export const asyncBlockSeniorMemberOnly = async (level: number): Promise<void> => {
    const res = blockSeniorMemberOnly(level)
    if (res.state) return Promise.reject(res);
}

const blockLimitationFanSum = (fansNum: number): BlockResult => {
    if (fansNum < 0 || !isFansNumBlockingStatusGm()) {
        return returnTempVal
    }
    const limitFansNum = getLimitationFanSumGm();
    if (limitFansNum === -1) return returnTempVal;
    if (fansNum <= limitFansNum) {
        return {state: true, type: '粉丝数限制', matching: `限制数[${limitFansNum}],${fansNum}<=${limitFansNum}`}
    }
    return returnTempVal
}

export const asyncBlockLimitationFanSum = async (fansNum: number): Promise<void> => {
    const res = blockLimitationFanSum(fansNum)
    if (res.state) return Promise.reject(res);
}

export const blockUserVideoNumLimit = (num: number): BlockResult => {
    if (!isLimitationVideoSubmitStatusGm()) return returnTempVal;
    const sumGm = getLimitationVideoSubmitSumGm();
    if (sumGm >= num) {
        return {state: true, type: '用户投稿视频数量限制', matching: `用户投稿视频数量[${num}],${sumGm}>=${num}`}
    }
    return returnTempVal
}

export const asyncBlockUserVideoNumLimit = async (num: number): Promise<void> => {
    const res = blockUserVideoNumLimit(num)
    if (res.state) return Promise.reject(res);
}

interface DynamicContentRuleArrMap {
    fuzzyRuleArr?: string[];
    regexRuleArr?: string[];
}

export const blockDynamicItemContent = (content: string, videoTitle: string | null = null, ruleArrMap: DynamicContentRuleArrMap = {}): BlockResult => {
    let res: BlockResult;
    if (content !== '') {
        res = blockExactAndFuzzyMatching(content, {
            fuzzyKey: 'dynamic',
            fuzzyTypeName: '动态内容(模糊匹配)',
            regexKey: 'dynamicCanonical',
            regexTypeName: '动态内容(正则匹配)',
            ...ruleArrMap
        });
        if (res.state) return res;
    }
    if (videoTitle) {
        res = blockExactAndFuzzyMatching(videoTitle, {
            fuzzyKey: 'dynamic_video',
            fuzzyTypeName: '动态视频(模糊匹配)',
            regexKey: 'dynamic_videoCanonical',
            regexTypeName: '动态视频(正则匹配)'
        })
    }
    return res!
}

export default {
    addTopicDetailVideoBlockButton,
    addTopicDetailContentsBlockButton,
    blockExactAndFuzzyMatching,
    addBlockButton,
    blockDecoration(value: any): BlockResult {
        const list = GM_getValue('precise_decoration_id', []);
        const match = ruleMatchingUtil.exactMatch(list, value);
        if (match) {
            return {state: true, type: "精确装扮ID", matching: value}
        }
        return returnTempVal;
    },
    blockDecorationCollection(value: any): BlockResult {
        const list = GM_getValue('precise_decoration_collection_id', [])
        const exactMatch = ruleMatchingUtil.exactMatch(list, value);
        if (exactMatch) {
            return {state: true, type: "精确装扮合集ID", matching: value}
        }
        return returnTempVal;
    }
}
