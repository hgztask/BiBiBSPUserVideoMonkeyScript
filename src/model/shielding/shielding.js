import ruleMatchingUtil from "../../utils/ruleMatchingUtil.js";
import ruleKeyListData from "../../data/ruleKeyListData.js";
import ruleUtil from "../../utils/ruleUtil.js";
import output_informationTab from "../../layout/output_informationTab.js";
import gmUtil from "../../utils/gmUtil.js";
import bFetch from '../bFetch.js';
import {videoInfoCache} from "../cache/videoInfoCache.js";
import bvDexie from "../bvDexie.js";
import {eventEmitter} from "../EventEmitter.js";
import {elEventEmitter} from "../elEventEmitter.js";
import {requestIntervalQueue} from "../asynchronousIntervalQueue.js";
import localMKData from "../../data/localMKData.js";
import defUtil from "../../utils/defUtil.js";

//默认返回值-不符合屏蔽条件-{state: false}
const returnTempVal = {state: false}


/**
 * 添加屏蔽按钮
 * @param data {{}}
 * @param data.data {{}} 数据
 * @param data.maskingFunc {function} 屏蔽函数
 * @param data.css {string|null} css
 * @param tagCss {string} 标记css，用于标记是否已添加
 * @param position {[]} 位置
 */
const addBlockButton = (data, tagCss = '', position = []) => {
    //插入位置元素,显隐主体元素,主el元素
    const {insertionPositionEl, explicitSubjectEl, css} = data.data;
    if (tagCss !== '') {
        if (insertionPositionEl.querySelector("." + tagCss)) return;
    }
    const buttonEL = document.createElement("button")
    buttonEL.setAttribute("gz_type", "")
    if (tagCss !== '') {
        buttonEL.className = tagCss;
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
        const {uid, name} = data.data;
        eventEmitter.send('sheet-dialog', {
            title: "屏蔽选项",
            list: [
                {
                    label: `uid精确屏蔽-用户uid=${uid}-name=${name}`,
                    value: "uid"
                }, {
                    label: `用户名精确屏蔽(不推荐)-用户name=${name}`,
                    value: 'name'
                }
            ],
            optionsClick: (item) => {
                const {value} = item
                if (value === 'uid') {
                    // uid精确屏蔽
                    if (uid === -1) {
                        eventEmitter.send('el-msg', "该页面数据不存在uid字段")
                        return;
                    }
                    const {status, res} = ruleUtil.addRulePreciseUid(uid, false);
                    if (status) {
                        data.maskingFunc();
                    }
                    eventEmitter.send('el-alert', res)
                    return;
                }
                // 用户名精确屏蔽
                if (!name) {
                    eventEmitter.send('el-alert', "该页面数据不存在name字段" + name)
                    return;
                }
                eventEmitter.invoke('el-confirm', '不推荐用户使用精确用户名来屏蔽，确定继续吗？').then(() => {
                    ruleUtil.addRulePreciseName(name)
                })
            }
        })
    })
}

/**
 * 视频添加屏蔽按钮和指令
 * @param data {Object}
 * @param data.data {{}} 视频数据
 * @param data.maskingFunc {function} 屏蔽函数
 */
eventEmitter.on('视频添加屏蔽按钮', (data) => {
    addBlockButton(data, "gz_shielding_button", ["right"]);
})

/**
 * 对视频添加屏蔽按钮和指令-BewlyBewly
 * @param data {Object}
 * @param data.data {{}} 视频数据
 * @param data.maskingFunc {function} 屏蔽函数
 */
eventEmitter.on('视频添加屏蔽按钮-BewlyBewly', (data) => {
    addBlockButton(data, "gz_shielding_button", ['right', 'bottom']);
})


/**
 * 添加热门视频屏蔽按钮
 * @param data{Object}
 * @param data.data {Object} 评论数据
 * @param data.maskingFunc {function} 屏蔽函数
 */
eventEmitter.on('添加热门视频屏蔽按钮', (data) => {
    addBlockButton(data, "gz_shielding_button", ["right", "bottom"]);
})

//话题页面中视频项添加屏蔽按钮
const addTopicDetailVideoBlockButton = (data) => {
    addBlockButton(data, "gz_shielding_button");
}

const addTopicDetailContentsBlockButton = (data) => {
    const position = data.data.position;
    const loop = position !== undefined;
    addBlockButton(data, "gz_shielding_topic_detail_button", loop ? position : []);
}

/**
 * 直播间弹幕添加屏蔽按钮
 * @param commentsData
 */
const addLiveContentBlockButton = (commentsData) => {
    addBlockButton(commentsData, "gz_shielding_live_danmaku_button");
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
const checkWhiteUserUid = (uid) => {
    return ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseUidWhiteArr(), uid);
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
    if (checkWhiteUserUid(uid)) {
        return returnTempVal;
    }
    let returnVal = blockUserUid(uid);
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
    if (name) {
        returnVal = blockUserName(name)
        if (returnVal.state) {
            return returnVal;
        }
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
 * 精确匹配和模糊匹配屏蔽
 * @param val {string} 待匹配的值
 * @param config {{}} 配置项
 * @param config.exactKey {string} 精确类型的规则键
 * @param config.exactTypeName {string} 精确显示的名称
 * @param config.fuzzyKey {string} 模糊类型的规则键
 * @param config.fuzzyTypeName {string} 模糊显示的名称
 * @param config.regexKey {string} 正则类型的规则键
 * @param config.regexTypeName {string} 正则显示的名称
 */
const blockExactAndFuzzyMatching = (val, config) => {
    if (config.exactKey) {
        if (ruleMatchingUtil.exactMatch(gmUtil.getData(config.exactKey, []), val)) {
            return {state: true, type: config.exactTypeName, matching: val}
        }
    }
    let matching;
    if (config.fuzzyKey) {
        matching = ruleMatchingUtil.fuzzyMatch(gmUtil.getData(config.fuzzyKey, []), val);
        if (matching) {
            return {state: true, type: config.fuzzyTypeName, matching}
        }
    }
    if (config.regexKey) {
        matching = ruleMatchingUtil.regexMatch(gmUtil.getData(config.regexKey, []), val);
        if (matching) {
            return {state: true, type: config.regexTypeName, matching}
        }
    }
    return returnTempVal
}

//根据头像挂件名屏蔽
const blockAvatarPendant = (name) => {
    return blockExactAndFuzzyMatching(name, {
        exactKey: 'precise_avatarPendantName',
        exactTypeName: '精确头像挂件名', fuzzyKey: 'avatarPendantName', fuzzyTypeName: '模糊头像挂件名'
    })
}
//根据用户签名屏蔽
const blockSignature = (signature) => {
    return blockExactAndFuzzyMatching(signature, {
        fuzzyKey: 'signature', fuzzyTypeName: '模糊用户签名', regexKey: 'signatureCanonical', regexTypeName: '正则用户签名'
    })
}

//根据视频简介屏蔽
const blockVideoDesc = (desc) => {
    return blockExactAndFuzzyMatching(desc, {
        fuzzyKey: 'videoDesc', fuzzyTypeName: '视频简介(模糊匹配)'
        , regexKey: 'videoDescCanonical', regexTypeName: '视频简介(正则匹配)'
    })
}

//根据性别屏蔽
const blockGender = (gender) => {
    const val = localMKData.isGenderRadioVal();
    const state = val === gender && val !== '不处理';
    if (state) {
        return {state: true, type: '性别屏蔽', matching: val}
    }
    return returnTempVal;
}

//根据会员类型屏蔽
const blockUserVip = (vipId) => {
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

//根据硬核会员屏蔽
const blockSeniorMember = (num) => {
    if (num === 1 && localMKData.isSeniorMember()) {
        return {state: true, type: '屏蔽硬核会员'}
    }
    return returnTempVal
}

//根据视频类型屏蔽，1原创，2转载
const blockVideoCopyright = (num) => {
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

//根据视频是否是竖屏屏蔽
const blockVerticalVideo = (dimension) => {
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

//根据视频点赞率屏蔽
const blockVideoLikeRate = (like, view) => {
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

//根据用户uid和name检查屏蔽
const blockUserUidAndName = (uid, name) => {
    if (!uid || !name) {
        return returnTempVal
    }

    let returnVal = blockUserUid(uid)
    if (returnVal.state) {
        return returnVal
    }
    returnVal = blockUserName(name)
    if (returnVal.state) {
        return returnVal
    }
    return returnTempVal
}

/**
 * 检查视频创作团队成员屏蔽
 * 只要有一个成员满足条件，则屏蔽该视频
 * @param teamMember {[]}
 */
const blockVideoTeamMember = (teamMember) => {
    if (!teamMember) {
        return returnTempVal
    }
    for (let u of teamMember) {
        if (checkWhiteUserUid(u.mid)) {
            continue
        }
        const returnVal = blockUserUidAndName(u.mid, u.name)
        if (returnVal.state) {
            return returnVal
        }
    }
    return returnTempVal
}

//根据用户名检查屏蔽
const blockUserName = (name) => {
    return blockExactAndFuzzyMatching(name, {
        exactKey: 'precise_name',
        exactTypeName: '精确用户名', fuzzyKey: 'name', fuzzyTypeName: '模糊用户名',
        regexKey: 'nameCanonical', regexTypeName: '正则用户名'
    })
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
    returnValue = shieldingByLevel(currentLevel);
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
    //根据性别屏蔽
    returnValue = blockGender(userInfo?.sex)
    if (returnValue.state) {
        return returnValue
    }
    //根据会员类型屏蔽
    returnValue = blockUserVip(userInfo.vip.type)
    if (returnValue.state) {
        return returnValue
    }
    //根据硬核会员屏蔽
    returnValue = blockSeniorMember(userInfo.is_senior_member)
    if (returnValue.state) {
        return returnValue
    }
    //根据视频类型屏蔽，1原创，2转载
    returnValue = blockVideoCopyright(videoInfo.copyright)
    if (returnValue.state) {
        return returnValue
    }
    //根据视频是否是竖屏屏蔽
    returnValue = blockVerticalVideo(videoInfo.dimension)
    if (returnValue.state) {
        return returnValue
    }
    returnValue = blockVideoTeamMember(videoInfo.staff)
    if (returnValue.state) {
        return returnValue
    }
    returnValue = blockVideoLikeRate(videoInfo.like, videoInfo.view)
    if (returnValue.state) {
        console.log(returnValue.msg);
        return returnValue
    }
}

/**
 * 检查视频tag执行屏蔽
 * @description 当没有设置相关tag屏蔽规则时，不执行，当videoData的bv没有且为-1时，不执行
 * @param tags {[string]} 当前视频的tags
 * @returns {{state:boolean,type:string|any,matching:string|any}} 结果对象，state为true时，匹配上结果，需要屏蔽该视频
 */
const blockBasedVideoTag = (tags) => {
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
 * 屏蔽动态中的项
 * @param dynamicData {{}} 动态内容
 * @returns {Object}
 * @property {boolean} state 是否屏蔽
 * @property {string} type 屏蔽类型
 * @property {string} matching 匹配到的规则
 */
const shieldingDynamic = (dynamicData) => {
    const {
        content = null,
        el,
        title = null,
        tag = null
    } = dynamicData;
    let matching = null;
    if (content !== null) {
        matching = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getCommentOnArr(), content);
        if (matching !== null) {
            el?.remove();
            return {state: true, type: "模糊评论内容", matching};
        }
        matching = ruleMatchingUtil.regexMatch(ruleKeyListData.getCommentOnCanonicalArr(), content);
        if (matching !== null) {
            el?.remove();
            return {state: true, type: "正则评论内容", matching};
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
    const {state, type, matching} = shieldingDynamic(dynamicData);
    if (state) {
        const infoHtml = output_informationTab.getDynamicContentInfoHtml(type, matching, dynamicData);
        eventEmitter.send('打印信息', infoHtml)
    }
    return state;
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
    if (checkWhiteUserUid(uid)) {
        return returnTempVal;
    }
    let returnVal = blockUserUid(uid)
    if (returnVal.state) {
        return returnVal
    }
    if (name) {
        returnVal = blockUserName(name)
        if (returnVal.state) {
            return returnVal
        }
    }
    let matching = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getCommentOnArr(), content);
    if (matching !== null) {
        return {state: true, type: "模糊评论内容", matching};
    }
    matching = ruleMatchingUtil.regexMatch(ruleKeyListData.getCommentOnCanonicalArr(), content);
    if (matching !== null) {
        return {state: true, type: "正则评论内容", matching};
    }
    if (level !== -1) {
        return shieldingByLevel(level);
    }
    return returnTempVal;
}

/**
 * 根据等级屏蔽
 * @param level {number} 用户等级
 * @returns {{state: boolean, type: string, matching:number }|any}
 */
const shieldingByLevel = (level) => {
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

/**
 * 装饰过的屏蔽评论,屏蔽单个评论项
 * @param commentsData {{}}
 * @returns {Object}
 * @property {boolean} state 是否屏蔽
 * @type {function}
 */
const shieldingCommentDecorated = (commentsData) => {
    const {state, type, matching} = shieldingComment(commentsData);
    if (state) {
        commentsData.el?.remove()
        eventEmitter.send('屏蔽评论信息', type, matching, commentsData)
    }
    return state;
}

/**
 * 装饰过的屏蔽直播间评论
 * @param liveRoomContent {*} 评论数据
 * @returns {boolean}
 * @type {function}
 */
const shieldingLiveRoomContentDecorated = (liveRoomContent) => {
    let {state, type, matching} = shieldingComment(liveRoomContent);
    const {el, fansMedal} = liveRoomContent;
    if (fansMedal !== null) {
        if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseFanCardArr(), fansMedal)) {
            el?.remove();
            state = true;
            type = "精确粉丝牌";
        }
    }
    if (state) {
        el?.remove()
    }
    if (type) {
        const infoHtml = output_informationTab.getLiveRoomCommentInfoHtml(type, matching, liveRoomContent);
        eventEmitter.send('打印信息', infoHtml)
    }
    return state;
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


// 屏蔽直播间
const shieldingLiveRoom = (liveRoomData) => {
    const {name, title, partition, uid = -1} = liveRoomData;
    if (uid !== -1) {
        if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseUidWhiteArr(), uid)) {
            return returnTempVal;
        }
        if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseUidArr(), uid)) {
            return {state: true, type: "精确用户uid"};
        }
    }
    let matching;
    if (name) {
        if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseNameArr(), name)) {
            return {state: true, type: "精确用户名"};
        }
        matching = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getNameArr(), name);
        if (matching) {
            return {state: true, type: "模糊用户名", matching};
        }
    }
    matching = ruleMatchingUtil.exactMatch(ruleKeyListData.getTitleArr(), title);
    if (matching) {
        return {state: true, type: "模糊标题", matching};
    }
    matching = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getTitleCanonicalArr(), title);
    if (matching) {
        return {state: true, type: "正则标题", matching};
    }
    if (partition) {
        if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPrecisePartitionArr(), partition)) {
            return {state: true, type: "精确直播分区"};
        }
    }
    return returnTempVal;
}

/**
 * 装饰过的屏蔽直播间
 * @param liveRoomData {{}} 直播间数据
 * @returns {boolean}
 */
const shieldingLiveRoomDecorated = (liveRoomData) => {
    const {state, type, matching = null} = shieldingLiveRoom(liveRoomData);
    if (state) {
        liveRoomData.el?.remove();
        const infoHtml = output_informationTab.getLiveRoomInfoHtml(type, matching, liveRoomData);
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
    shieldingVideo,
    shieldingVideoDecorated,
    shieldingDynamicDecorated,
    shieldingCommentDecorated,
    shieldingLiveRoomDecorated,
    shieldingComments,
    shieldingLiveRoomContentDecorated,
    addLiveContentBlockButton,
    addTopicDetailVideoBlockButton,
    addTopicDetailContentsBlockButton,
    intervalExecutionStartShieldingVideoInert,
    addBlockButton
}
