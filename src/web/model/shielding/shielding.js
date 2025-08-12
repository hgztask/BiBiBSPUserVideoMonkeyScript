import ruleMatchingUtil from "../../utils/ruleMatchingUtil.js";
import ruleKeyListData from "../../data/ruleKeyListData.js";
import ruleUtil from "../../utils/ruleUtil.js";
import output_informationTab from "../../layout/output_informationTab.js";
import gmUtil from "../../utils/gmUtil.js";
import {eventEmitter} from "../EventEmitter.js";
import {elEventEmitter} from "../elEventEmitter.js";
import localMKData, {
    getLimitationFanSumGm,
    getLimitationVideoSubmitSumGm,
    hideBlockButtonGm,
    isFansNumBlockingStatusGm,
    isLimitationVideoSubmitStatusGm,
    isSeniorMemberOnly
} from "../../data/localMKData.js";
import defUtil from "../../utils/defUtil.js";
import {returnTempVal} from "../../data/globalValue.js";

/**
 * 添加屏蔽按钮
 * @param data {{}}
 * @param data.data {{}} 数据
 * @param data.maskingFunc {function} 屏蔽函数
 * @param data.css {string|null} css
 * @param className {string} class名称，标记css，用于标记是否已添加
 * @param position {[]} 位置
 */
const addBlockButton = (data, className = '', position = []) => {
    if (hideBlockButtonGm()) return;
    //插入位置元素,显隐主体元素,主el元素
    const {insertionPositionEl, explicitSubjectEl, css} = data.data;
    if (className !== '') {
        if (insertionPositionEl.querySelector("." + className)) return;
    }
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
    if (css !== undefined) {
        for (let key of Object.keys(css)) {
            buttonEL.style[key] = css[key];
        }
    }
    //当没有显隐主体元素，则主动隐藏，不添加鼠标经过显示移开隐藏事件
    if (explicitSubjectEl) {
        buttonEL.style.display = "none";
        elEventEmitter.addEvent(explicitSubjectEl, "mouseout", () => buttonEL.style.display = "none");
        elEventEmitter.addEvent(explicitSubjectEl, "mouseover", () => buttonEL.style.display = "");
    }
    insertionPositionEl.appendChild(buttonEL);
    buttonEL.addEventListener("click", (event) => {
        event.stopImmediatePropagation(); // 阻止事件冒泡和同一元素上的其他事件处理器
        event.preventDefault(); // 阻止默认行为
        const {uid = -1, name = null, bv = null, title = ''} = data.data;
        const showList = []
        if (uid !== -1) {
            showList.push({label: `uid精确屏蔽-用户uid=${uid}-name=${name}`, value: "uid"});
        } else {
            showList.push({label: `用户名精确屏蔽(不推荐)-用户name=${name}`, value: 'name'})
        }
        if (bv !== null) {
            showList.push({label: `bv号屏蔽-视频bv=${bv}`, value: "bv", title: title})
        }
        eventEmitter.send('sheet-dialog', {
            title: "屏蔽选项",
            list: showList,
            optionsClick: (item) => {
                const {value} = item
                switch (value) {
                    case "uid":
                        if (uid === -1) {
                            eventEmitter.send('el-msg', "该页面数据不存在uid字段")
                            return;
                        }
                        const {status} = ruleUtil.addRulePreciseUid(uid);
                        if (status) {
                            data.maskingFunc();
                        }
                        break;
                    case "name":
                        ruleUtil.addRulePreciseName(name);
                        break;
                    case "bv":
                        console.log(data)
                        ruleUtil.addRulePreciseBv(bv);
                        break;
                    default:
                        // 用户名精确屏蔽
                        eventEmitter.invoke('el-confirm', '不推荐用户使用精确用户名来屏蔽，确定继续吗？').then(() => {
                            ruleUtil.addRulePreciseName(name)
                        })
                }
            }
        })
    })
}

//话题页面中视频项添加屏蔽按钮
const addTopicDetailVideoBlockButton = (data) => {
    addBlockButton(data, "gz_shielding_button");
}

const addTopicDetailContentsBlockButton = (data) => {
    const position = data.data.position;
    const loop = position !== undefined;
    addBlockButton(data, "gz_shielding_topic_detail_button", loop ? position : []);
}

//根据uid精确屏蔽
const blockUserUid = (uid) => {
    if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseUidArr(), uid)) {
        return {state: true, type: "精确uid"};
    }
    return returnTempVal;
}

/**
 * 根据uid检查是否是白名单
 * 调用处一般结束执行
 * @param uid {number}
 * @returns {boolean}
 */
export const blockCheckWhiteUserUid = (uid) => {
    return ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseUidWhiteArr(), uid);
}

/**
 * 执行精确、模糊和正则匹配的通用屏蔽检查函数
 * 根据提供的配置项依次执行三种类型的匹配检查，优先级为：精确 > 模糊 > 正则
 * @param val {string} 待匹配的字符串值
 * @param config {{}} 配置项对象
 * @param config.exactKey {string} 精确匹配规则在存储中的键名
 * @param config.exactTypeName {string} 精确匹配类型的显示名称
 * @param [config.exactRuleArr] {string[]|number[]} 精确匹配规则数组（可选，若未提供则通过exactKey从存储获取）
 * @param config.fuzzyKey {string} 模糊匹配规则在存储中的键名
 * @param config.fuzzyTypeName {string} 模糊匹配类型的显示名称
 * @param [config.fuzzyRuleArr] {string[]} 模糊匹配规则数组（可选，若未提供则通过fuzzyKey从存储获取）
 * @param config.regexKey {string} 正则匹配规则在存储中的键名
 * @param config.regexTypeName {string} 正则匹配类型的显示名称
 * @param [config.regexRuleArr] {string[]} 正则匹配规则数组（可选，若未提供则通过regexKey从存储获取）
 * @returns {{state: boolean, type: string, matching: string}|any}
 *          匹配成功返回包含状态、匹配类型和匹配值的对象；
 *          无匹配时返回returnTempVal（预定义的默认返回值对象）
 */
const blockExactAndFuzzyMatching = (val, config) => {
    if (!val) {
        return returnTempVal
    }
    const {
        exactKey, exactTypeName,
        exactRuleArr = gmUtil.getData(exactKey, [])
    } = config;
    if (exactKey) {
        if (ruleMatchingUtil.exactMatch(exactRuleArr, val)) {
            return {state: true, type: exactTypeName, matching: val}
        }
    }
    let matching;
    const {
        fuzzyKey, fuzzyTypeName,
        fuzzyRuleArr = gmUtil.getData(fuzzyKey, []),
    } = config;
    if (fuzzyKey) {
        matching = ruleMatchingUtil.fuzzyMatch(fuzzyRuleArr, val);
        if (matching) {
            return {state: true, type: fuzzyTypeName, matching}
        }
    }
    const {
        regexKey, regexTypeName,
        regexRuleArr = gmUtil.getData(regexKey, [])
    } = config;
    if (regexKey) {
        matching = ruleMatchingUtil.regexMatch(regexRuleArr, val);
        if (matching) {
            return {state: true, type: regexTypeName, matching}
        }
    }
    return returnTempVal
}

//根据评论检查屏蔽
export const blockComment = (comment) => {
    return blockExactAndFuzzyMatching(comment, {
        fuzzyKey: 'commentOn', fuzzyTypeName: '模糊评论',
        regexKey: 'commentOnCanonical', regexTypeName: '正则评论'
    })
}

//根据头像挂件名屏蔽
export const blockAvatarPendant = (name) => {
    return blockExactAndFuzzyMatching(name, {
        exactKey: 'precise_avatarPendantName',
        exactTypeName: '精确头像挂件名', fuzzyKey: 'avatarPendantName', fuzzyTypeName: '模糊头像挂件名'
    })
}

//异步根据头像挂件名屏蔽，匹配成功抛出异常
export const asyncBlockAvatarPendant = async (name) => {
    const res = blockAvatarPendant(name);
    if (res.state) return Promise.reject(res);
}

//根据用户签名屏蔽
export const blockSignature = (signature) => {
    return blockExactAndFuzzyMatching(signature, {
        fuzzyKey: 'signature', fuzzyTypeName: '模糊用户签名', regexKey: 'signatureCanonical', regexTypeName: '正则用户签名'
    })
}

//异步根据用户签名屏蔽，匹配成功抛出异常
export const asyncBlockSignature = async (signature) => {
    const res = blockSignature(signature);
    if (res.state) return Promise.reject(res);
}

//根据视频简介屏蔽
export const blockVideoDesc = (desc) => {
    return blockExactAndFuzzyMatching(desc, {
        fuzzyKey: 'videoDesc', fuzzyTypeName: '视频简介(模糊匹配)'
        , regexKey: 'videoDescCanonical', regexTypeName: '视频简介(正则匹配)'
    })
}

//异步根据视频简介屏蔽，匹配成功抛出异常
export const asyncBlockVideoDesc = async (desc) => {
    const res = blockVideoDesc(desc);
    if (res.state) return Promise.reject(res);
}


//根据性别屏蔽
export const blockGender = (gender) => {
    const val = localMKData.isGenderRadioVal();
    const state = val === gender && val !== '不处理';
    if (state) {
        return {state: true, type: '性别屏蔽', matching: val}
    }
    return returnTempVal;
}

//异步根据性别屏蔽，匹配成功抛出异常
export const asyncBlockGender = async (gender) => {
    const res = blockGender(gender);
    if (res.state) {
        return Promise.reject(res)
    }
}

//根据会员类型屏蔽
export const blockUserVip = (vipId) => {
    const val = localMKData.isVipTypeRadioVal();
    const vipMap = {
        0: '无',
        1: '月大会员',
        2: '年度及以上大会员'
    }
    if (val === vipMap[vipId]) {
        return {state: true, type: '会员类型屏蔽', matching: val}
    }
    return returnTempVal
}

//异步根据会员类型屏蔽，匹配成功抛出异常
export const asyncBlockUserVip = async (vipId) => {
    const res = blockUserVip(vipId);
    if (res.state) {
        return Promise.reject(res)
    }
}


//根据硬核会员屏蔽
export const blockSeniorMember = (num) => {
    if (num === 1 && localMKData.isSeniorMember()) {
        return {state: true, type: '屏蔽硬核会员'}
    }
    return returnTempVal
}

//异步根据硬核会员屏蔽，匹配成功抛出异常
export const asyncBlockSeniorMember = async (num) => {
    const res = blockSeniorMember(num);
    if (res.state) {
        return Promise.reject(res)
    }
}

//根据视频类型屏蔽，1原创，2转载
export const blockVideoCopyright = (num) => {
    const val = localMKData.isCopyrightRadio();
    const tempMap = {
        1: '原创',
        2: '转载'
    }
    if (val === tempMap[num]) {
        return {state: true, type: '视频类型屏蔽', matching: val}
    }
    return returnTempVal
}

//异步根据视频类型屏蔽，匹配成功抛出异常
export const asyncBlockVideoCopyright = async (num) => {
    const res = blockVideoCopyright(num);
    if (res.state) {
        return Promise.reject(res)
    }
}

//根据视频是否是竖屏屏蔽
export const blockVerticalVideo = (dimension) => {
    if (!localMKData.isBlockVerticalVideo()) {
        return returnTempVal
    }
    if (!dimension) {
        return returnTempVal
    }
    //当视频分辨率宽度小于高度，则判定为竖屏
    const vertical = dimension.width < dimension.height
    if (vertical) {
        return {state: true, type: '竖屏视频屏蔽', matching: vertical}
    }
    return returnTempVal
}

//异步根据视频是否是竖屏屏蔽，匹配成功抛出异常
export const asyncBlockVerticalVideo = async (dimension) => {
    const res = blockVerticalVideo(dimension);
    if (res.state) return Promise.reject(res);
}

//根据视频点赞率屏蔽
export const blockVideoLikeRate = (like, view) => {
    if (!like || !view || !localMKData.isVideoLikeRateBlockingStatus()) {
        return returnTempVal
    }
    //用户指定限制的点赞率
    const mk_likeRate = parseInt(localMKData.getVideoLikeRate() * 100);
    if (isNaN(mk_likeRate)) {
        return returnTempVal
    }
    //视频的点赞率
    const likeRate = defUtil.calculateLikeRate(like, view);
    if (likeRate <= mk_likeRate) {
        return {
            state: true, type: '视频点赞率屏蔽', matching: mk_likeRate + '%'
            , msg: `视频的点赞率为${likeRate}%，低于用户指定的限制${mk_likeRate}%，屏蔽该视频`
        }
    }
    return returnTempVal
}

//异步根据视频点赞率屏蔽，匹配成功抛出异常
export const asyncBlockVideoLikeRate = async (like, view) => {
    const res = blockVideoLikeRate(like, view);
    if (res.state) return Promise.reject(res);
}

/**
 * 根据视频互动率屏蔽
 * @param danmaku {number} 弹幕数
 * @param reply {number} 评论数
 * @param view {number} 播放数
 * @returns {{state: boolean}}
 */
export const blockVideoInteractiveRate = (danmaku, reply, view) => {
    if (!danmaku || !view || !localMKData.isInteractiveRateBlockingStatus()) {
        return returnTempVal
    }
    //用户指定限制的互动率
    const mk_interactionRate = parseInt(localMKData.getInteractiveRate() * 100)
    //视频的互动率
    const interactionRate = defUtil.calculateInteractionRate(danmaku, reply, view);
    if (interactionRate <= mk_interactionRate) {
        return {
            state: true, type: '视频互动率屏蔽', matching: mk_interactionRate + '%'
            , msg: `视频的互动率为${interactionRate}%，低于用户指定的限制${mk_interactionRate}%，屏蔽该视频`
        }
    }
    return returnTempVal
}

//异步根据视频互动率屏蔽，匹配成功抛出异常
export const asyncBlockVideoInteractiveRate = async (danmaku, reply, view) => {
    const res = blockVideoInteractiveRate(danmaku, reply, view);
    if (res.state) return Promise.reject(res);
}


//根据视频三连率屏蔽
export const blockVideoTripleRate = (favorite, coin, share, view) => {
    if (!favorite || !coin || !share || !view || !localMKData.isTripleRateBlockingStatus()) {
        return returnTempVal
    }
    //用户指定限制的三连率
    const mk_tripleRate = parseInt(localMKData.getTripleRate() * 100)
    //视频的三连率
    const tripleRate = defUtil.calculateTripleRate(favorite, coin, share, view);
    if (tripleRate <= mk_tripleRate) {
        return {
            state: true, type: '视频三连率屏蔽', matching: mk_tripleRate + '%'
            , msg: `视频的三连率为${tripleRate}%，低于用户指定的限制${mk_tripleRate}%，屏蔽该视频`
        }
    }
    return returnTempVal
}

//异步根据视频三连率屏蔽，匹配成功抛出异常
export const asyncBlockVideoTripleRate = async (favorite, coin, share, view) => {
    const res = blockVideoTripleRate(favorite, coin, share, view);
    if (res.state) return Promise.reject(res);
}

//根据视频投币/点赞比（内容价值）屏蔽
export const blockVideoCoinLikesRatioRate = (coin, like) => {
    if (!coin || !like || !localMKData.isCoinLikesRatioRateBlockingStatus()) {
        return returnTempVal
    }
    //用户指定限制的投币/点赞比（内容价值）
    const mk_coinLikesRatioRate = parseInt(localMKData.getCoinLikesRatioRate() * 100)
    //视频的投币/点赞比（内容价值）
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

//异步根据视频投币/点赞比（内容价值）屏蔽，匹配成功抛出异常
export const asyncBlockVideoCoinLikesRatioRate = async (coin, like) => {
    const res = blockVideoCoinLikesRatioRate(coin, like);
    if (res.state) return Promise.reject(res);
}

/**
 * 根据等级屏蔽
 * @param level {number} 用户等级
 * @returns {{state: boolean, type: string, matching:number }|any}
 */
export const blockByLevel = (level) => {
    if (!level) {
        return returnTempVal
    }
    const min = gmUtil.getData('nMinimumLevel', -1)
    if (min > level) {
        return {state: true, type: "最小用户等级过滤", matching: min};
    }
    const max = gmUtil.getData('nMaximumLevel', -1)
    if (max > level) {
        return {state: true, type: "最大用户等级过滤", matching: max};
    }
    return returnTempVal
}

//异步根据等级屏蔽，匹配成功抛出异常
export const asyncBlockByLevel = async (level) => {
    const res = blockByLevel(level);
    if (res.state) return Promise.reject(res);
}

//根据用户uid和name检查屏蔽，执行相关uid检查
export const blockUserUidAndName = (uid, name) => {
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

//异步根据用户uid和name检查屏蔽，执行相关uid检查，匹配成功则抛出reject
export const asyncBlockUserUidAndName = async (uid, name) => {
    const res = blockUserUidAndName(uid, name);
    if (res.state) {
        return Promise.reject(res)
    }
}

/**
 * 检查视频创作团队成员屏蔽
 * 只要有一个成员满足条件，则屏蔽该视频
 * @param teamMember {[]}
 */
export const blockVideoTeamMember = (teamMember) => {
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

//异步检查视频创作团队成员屏蔽，匹配成功则抛出reject
export const asyncBlockVideoTeamMember = async (teamMember) => {
    const res = blockVideoTeamMember(teamMember)
    if (res.state) return Promise.reject(res)
}

//根据用户名检查屏蔽
export const blockUserName = (name) => {
    return blockExactAndFuzzyMatching(name, {
        exactKey: 'precise_name',
        exactTypeName: '精确用户名', fuzzyKey: 'name', fuzzyTypeName: '模糊用户名',
        regexKey: 'nameCanonical', regexTypeName: '正则用户名'
    })
}

// 根据视频标题或其他标题检查屏蔽
export const blockVideoOrOtherTitle = (title) => {
    return blockExactAndFuzzyMatching(title, {
        fuzzyKey: 'title', fuzzyTypeName: '模糊标题',
        regexKey: 'titleCanonical', regexTypeName: '正则标题'
    })
}

/**
 * 检查视频tag执行屏蔽
 * @description 当没有设置相关tag屏蔽规则时，不执行，当videoData的bv没有且为-1时，不执行
 * @param tags {[string]} 当前视频的tags
 * @returns {{state:boolean,type:string|any,matching:string|any}} 结果对象，state为true时，匹配上结果，需要屏蔽该视频
 */
export const blockBasedVideoTag = (tags) => {
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

//异步检查视频tag执行屏蔽，匹配成功则抛出reject
export const asyncBlockBasedVideoTag = async (tags) => {
    const res = blockBasedVideoTag(tags);
    if (res.state) return Promise.reject(res);
}


//检查uid是否在范围屏蔽
export const blockByUidRange = (uid) => {
    if (!localMKData.isUidRangeMaskingStatus()) {
        return returnTempVal
    }
    const [head, tail] = localMKData.getUidRangeMasking();
    if (head >= uid <= tail) {
        return {state: true, type: "uid范围屏蔽", matching: `${head}=>${uid}<=${tail}`}
    }
    return returnTempVal
}

//根据uid检查所有相关uid流程屏蔽
export const blockUidWholeProcess = (uid) => {
    if (!uid || blockCheckWhiteUserUid(uid)) return returnTempVal
    let returnVal = blockUserUid(uid)
    if (returnVal.state) {
        return returnVal;
    }
    return blockByUidRange(uid)
}

//异步检查屏蔽已关注视频，匹配成则抛出reject
export const asyncBlockFollowedVideo = (following) => {
    if (following && localMKData.isBlockFollowed()) {
        return Promise.reject({state: true, type: '已关注'})
    }
}

//异步检查屏蔽充电专属视频
export const asyncBlockChargeVideo = (isUpOwnerExclusive) => {
    if (isUpOwnerExclusive && localMKData.isUpOwnerExclusive()) {
        return Promise.reject({state: true, type: '充电专属视频'})
    }
}

//检查时间范围屏蔽
export const blockTimeRangeMasking = (timestamp) => {
    if (!timestamp || !localMKData.isTimeRangeMaskingStatus()) {
        return returnTempVal
    }
    const timeRangeMaskingArr = localMKData.getTimeRangeMaskingArr();
    if (timeRangeMaskingArr.length === 0) {
        return returnTempVal;
    }
    for (let {status, r: [startTimestamp, endTimestamp]} of timeRangeMaskingArr) {
        if (!status) continue
        // 将时间戳转换为秒级时间戳，用于比较视频返回的时间戳格式
        const startSecondsTimestamp = Math.floor(startTimestamp / 1000)
        const endSecondsTimestamp = Math.floor(endTimestamp / 1000)
        if (startSecondsTimestamp >= timestamp <= endSecondsTimestamp) {
            const startToTime = new Date(startTimestamp).toLocaleString();
            const endToTime = new Date(endTimestamp).toLocaleString();
            const timestampToTime = new Date(timestamp * 1000).toLocaleString();
            return {state: true, type: "时间范围屏蔽", matching: `${startToTime}=>${timestampToTime}<=${endToTime}`}
        }
    }
    return returnTempVal
}

//异步检查时间范围屏蔽，匹配成功则抛出reject
export const asyncBlockTimeRangeMasking = async (timestamp) => {
    const res = blockTimeRangeMasking(timestamp)
    if (res.state) return Promise.reject(res);
}

//检查是否只看硬核会员
export const blockSeniorMemberOnly = (level) => {
    if (!isSeniorMemberOnly() || level === -1) {
        //未开启仅看硬核会员或未知等级-1时，直接返回
        return returnTempVal
    }
    if (level === 7) {
        return {state: true, type: '保留硬核会员'}
    }
    return {state: true, type: '非硬核会员'}
}

//检查粉丝数限制
const blockLimitationFanSum = (fansNum) => {
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

//异步检查粉丝数限制，匹配成功则抛出reject
export const asyncBlockLimitationFanSum = async (fansNum) => {
    const res = blockLimitationFanSum(fansNum)
    if (res.state) return Promise.reject(res);
}

//检查用户投稿视频数量限制屏蔽
export const blockUserVideoNumLimit = (num) => {
    if (!isLimitationVideoSubmitStatusGm()) return returnTempVal;
    const sumGm = getLimitationVideoSubmitSumGm();
    if (sumGm >= num) {
        return {state: true, type: '用户投稿视频数量限制', matching: `用户投稿视频数量[${num}],${sumGm}>=${num}`}
    }
    return returnTempVal
}
//异步检查用户投稿视频数量限制屏蔽，匹配成功则抛出reject
export const asyncBlockUserVideoNumLimit = async (num) => {
    const res = blockUserVideoNumLimit(num)
    if (res.state) return Promise.reject(res);
}

/**
 * 根据动态内容执行屏蔽检查，支持模糊匹配和正则匹配
 * 如传入动态视频标题，则前条件不成立时根据视频标题执行模糊匹配和正则匹配
 * @param content {string} 需要检查的动态内容文本
 * @param videoTitle {string|null} 视频标题
 * @param ruleArrMap {{}} 规则列表配置对象（可选）
 * @param [ruleArrMap.fuzzyRuleArr] {string[]} 模糊匹配规则数组（可选，若未提供则通过fuzzyKey从存储获取）
 * @param [ruleArrMap.regexRuleArr] {string[]} 正则匹配规则数组（可选，若未提供则通过regexKey从存储获取）
 * @returns {{state: boolean, type: string, matching: string}|any}
 *          匹配成功返回包含状态、匹配类型和匹配值的对象；
 *          无匹配时返回returnTempVal（预定义的默认返回值对象）
 */
export const blockDynamicItemContent = (content, videoTitle = null, ruleArrMap = {}) => {
    let res;
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
    return res
}

/**
 * 检查屏蔽动态列表中项的内容
 * @param dynamicData {{}} 动态内容
 * @returns {Object}
 * @property {boolean} state 是否屏蔽
 * @property {string} type 屏蔽类型
 * @property {string} matching 匹配到的规则
 */
export const checkDynamicItemContent = (dynamicData) => {
    const {
        content = "",
        el,
        title = null,
        tag = null
    } = dynamicData;
    let matching = null;
    if (content !== "") {
        const res = blockDynamicItemContent(content);
        if (res.state) {
            el?.remove();
            return res
        }
    }
    if (title !== null) {
        //模糊匹配标题
        matching = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getTitleArr(), title);
        if (matching !== null) {
            el?.remove();
            return {state: true, type: "模糊标题", matching};
        }
        //正则匹配标题
        matching = ruleMatchingUtil.regexMatch(ruleKeyListData.getTitleCanonicalArr(), title);
        if (matching !== null) {
            el?.remove();
            return {state: true, type: "正则标题", matching};
        }
    }
    if (tag !== null) {
        if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseTagArr(), tag)) {
            el?.remove();
            return {state: true, type: "精确话题tag"};
        }
        matching = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getTagArr(), tag);
        if (matching !== null) {
            el?.remove();
            return {state: true, type: "模糊话题tag", matching};
        }
        matching = ruleMatchingUtil.regexMatch(ruleKeyListData.getTagCanonicalArr(), tag);
        if (matching !== null) {
            el?.remove();
            return {state: true, type: "正则话题tag", matching};
        }
    }
    return returnTempVal
}

/**
 * 装饰过的屏蔽动态中的项
 * @param dynamicData {{}} 动态内容
 * @returns {Object}
 * @property {boolean} state 是否屏蔽了
 */
const shieldingDynamicDecorated = (dynamicData) => {
    const {state, type, matching} = checkDynamicItemContent(dynamicData);
    if (state) {
        const infoHtml = output_informationTab.getDynamicContentInfoHtml(type, matching, dynamicData);
        eventEmitter.send('打印信息', infoHtml)
    }
    return state;
}

/**
 * 惰性函数，间隔执行屏蔽视频列表
 * @param {function} func 执行屏蔽的函数
 * @param name {string} 执行的名称
 * @returns {{stop: stop, start: start}}
 */
const intervalExecutionStartShieldingVideoInert = (func, name = '') => {
    let i1 = -1;
    const start = () => {
        if (i1 !== -1) {
            return
        }
        console.log('开始执行屏蔽' + name)
        i1 = setInterval(() => {
            func()
            console.log(`执行屏蔽${name}列表-定时器正在执行`)
        }, 800);
    }
    const stop = () => {
        if (i1 === -1) {
            return
        }
        clearInterval(i1)
        console.log(`已停止执行屏蔽${name}列表`)
        i1 = -1
    }
    return {start, stop}
}

export default {
    shieldingDynamicDecorated,
    addTopicDetailVideoBlockButton,
    addTopicDetailContentsBlockButton,
    intervalExecutionStartShieldingVideoInert,
    addBlockButton
}
