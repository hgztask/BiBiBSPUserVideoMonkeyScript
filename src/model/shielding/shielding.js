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
    //如果是白名单uid，则不处理
    if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseUidWhiteArr(), uid)) {
        return {state: false};
    }
    if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseUidArr(), uid)) {
        return {state: true, type: "精确uid"};
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
        if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseNameArr(), name)) {
            return {state: true, type: "精确用户名"};
        }
        matching = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getNameArr(), name);
        if (matching !== null) {
            return {state: true, type: "模糊用户名", matching};
        }
        matching = ruleMatchingUtil.regexMatch(ruleKeyListData.getNameCanonical(), name);
        if (matching !== null) {
            return {state: true, type: "正则用户名", matching};
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
    return {state: false};
}

/**
 * 精确匹配和模糊匹配屏蔽
 * @param val {string} 待匹配的值
 * @param config {{}} 配置项
 * @param config.exactKey {string} 精确类型的规则键
 * @param config.exactTypeName {string} 显示的名称
 * @param config.fuzzyKey {string} 模糊类型的规则键
 * @param config.fuzzyTypeName {string} 显示的名称
 * @param config.regexKey {string} 正则类型的规则键
 * @param config.regexTypeName {string} 显示的名称
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
    return {state: false}
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
    debugger
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
        return {state: false}
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
    return {state: false}
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
    return {state: false}
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
    //如果是白名单uid，则不处理
    if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseUidWhiteArr(), uid)) {
        return {state: false};
    }
    if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseUidArr(), uid)) {
        return {state: true, type: "精确uid"};
    }
    if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseNameArr(), name)) {
        return {state: true, type: "精确用户名"};
    }
    let matching = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getNameArr(), name);
    if (matching !== null) {
        return {state: true, type: "模糊用户名", matching};
    }
    matching = ruleMatchingUtil.regexMatch(ruleKeyListData.getNameCanonical(), name);
    if (matching !== null) {
        return {state: true, type: "正则用户名", matching};
    }
    matching = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getCommentOnArr(), content);
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
    return {state: false};
}

/**
 * 根据等级屏蔽
 * @param level {number} 用户等级
 * @returns {{state: boolean, type: string, matching:number }|any}
 */
const shieldingByLevel = (level) => {
    const def = {state: false}
    if (!level) {
        return def
    }
    const min = gmUtil.getData('nMinimumLevel', -1)
    if (min > level) {
        return {state: true, type: "最小用户等级过滤", matching: min};
    }
    const max = gmUtil.getData('nMaximumLevel', -1)
    if (max > level) {
        return {state: true, type: "最大用户等级过滤", matching: max};
    }
    return def
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
            return {state: false};
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
    return {state: false};
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
