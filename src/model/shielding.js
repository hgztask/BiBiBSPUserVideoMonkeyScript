import ruleMatchingUtil from "../utils/ruleMatchingUtil.js";
import ruleKeyListData from "../data/ruleKeyListData.js";
import {Tip} from "../utils/Tip.js";
import elUtil from "../utils/elUtil.js";
import ruleUtil from "../utils/ruleUtil.js";
import commentSectionModel from "../pagesModel/commentSectionModel.js";
import output_informationTab from "../layout/output_informationTab.js";
import gmUtil from "../utils/gmUtil.js";

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
        elUtil.addEventListenerWithTracking(explicitSubjectEl, "mouseout", () => buttonEL.style.display = "none");
        elUtil.addEventListenerWithTracking(explicitSubjectEl, "mouseover", () => buttonEL.style.display = "");
    }
    insertionPositionEl.appendChild(buttonEL);
    buttonEL.addEventListener("click", (event) => {
        event.stopImmediatePropagation(); // 阻止事件冒泡和同一元素上的其他事件处理器
        event.preventDefault(); // 阻止默认行为
        const {uid, name} = data.data;
        console.log("该选项数据:", data);
        xtip.sheet({
            btn: [`uid精确屏蔽-用户uid=${uid}-name=${name}`, `用户名精确屏蔽(不推荐)-用户name=${name}`],
            btn1: () => {
                if (uid === -1) {
                    Tip.error("该页面数据不存在uid字段");
                    return;
                }
                ruleUtil.addRule(uid, "precise_uid").then(msg => {
                    xtip.msg(msg);
                    data.maskingFunc();
                }).catch(msg => {
                    xtip.alert(msg, {icon: 'e'});
                })
            },
            btn2: () => {
                if (!name) {
                    alert("该页面数据不存在name字段" + name)
                    return;
                }
                if (!window.confirm('不推荐用户使用精确用户名来屏蔽，确定继续吗？')) return
                ruleUtil.addRulePreciseName(name)
            },
        });
    })
}


/**
 * 视频添加屏蔽按钮和指令
 * @param data {Object}
 * @param data.data {{}} 视频数据
 * @param data.maskingFunc {function} 屏蔽函数
 */
const addVideoBlockButton = (data) => {
    addBlockButton(data, "gz_shielding_button", ["right"]);
}

/**
 * 添加热门视频屏蔽按钮
 * @param data{Object}
 * @param data.data {Object} 评论数据
 * @param data.maskingFunc {function} 屏蔽函数
 */
const addPopularVideoBlockButton = (data) => {
    addBlockButton(data, "gz_shielding_button", ["right", "bottom"]);
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


/**
 * 评论添加屏蔽按钮
 * @param commentsData {{}}评论数据
 */
const addCommentBlockButton = (commentsData) => {
    const data = {
        data: commentsData,
        maskingFunc: commentSectionModel.startShieldingComments
    }
    addBlockButton(data, "gz_shielding_comment_button");
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
        return {state: true, type: "精确匹配uid"};
    }
    let matching = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getTitleArr(), title);
    if (matching !== null) {
        return {state: true, type: "模糊匹配标题", matching};
    }
    matching = ruleMatchingUtil.regexMatch(ruleKeyListData.getTitleCanonicalArr(), title);
    if (matching !== null) {
        return {state: true, type: "正则匹配标题", matching};
    }
    if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseNameArr(), name)) {
        return {state: true, type: "精确匹配用户名"};
    }
    matching = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getNameArr(), name);
    if (matching !== null) {
        return {state: true, type: "模糊匹配用户名", matching};
    }
    matching = ruleMatchingUtil.regexMatch(ruleKeyListData.getNameCanonical(), name);
    if (matching !== null) {
        return {state: true, type: "正则用户名", matching};
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
        Tip.successBottomRight("屏蔽了视频");
        const videoInfoHtml = output_informationTab.getVideoInfoHtml(type, matching, videoData);
        output_informationTab.addInfo(videoInfoHtml);
    }
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
            return {state: true, type: "评论模糊内容", matching};
        }
        matching = ruleMatchingUtil.regexMatch(ruleKeyListData.getCommentOnCanonicalArr(), content);
        if (matching !== null) {
            el?.remove();
            return {state: true, type: "评论正则内容", matching};
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
            return {state: true, type: "精确tag"};
        }
        matching = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getTagArr(), tag);
        if (matching !== null) {
            el?.remove();
            return {state: true, type: "模糊tag", matching};
        }
        matching = ruleMatchingUtil.regexMatch(ruleKeyListData.getTagCanonicalArr(), tag);
        if (matching !== null) {
            el?.remove();
            return {state: true, type: "正则tag", matching};
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
        Tip.successBottomRight("屏蔽了视频")
        output_informationTab.addInfo(output_informationTab.getDynamicContentInfoHtml(type, matching, dynamicData));
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
        return {state: true, type: "精确匹配uid"};
    }
    if (ruleMatchingUtil.exactMatch(ruleKeyListData.getPreciseNameArr(), name)) {
        return {state: true, type: "精确用户名"};
    }
    let matching = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getNameArr(), name);
    if (matching !== null) {
        return {state: true, type: "模糊匹配用户名", matching};
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
        const min = gmUtil.getData('nMinimumLevel', -1)
        if (min > level) {
            return {state: true, type: "评论区最小用户等级过滤", matching: min};
        }
        const max = gmUtil.getData('nMaximumLevel', -1)
        if (max > level) {
            return {state: true, type: "评论区最大用户等级过滤", matching: max};
        }
    }
    return {state: false};
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
        Tip.successBottomRight("屏蔽了评论")
        output_informationTab.addInfo(output_informationTab.getCommentInfoHtml(type, matching, commentsData));
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
        Tip.successBottomRight("屏蔽了直播间评论")
    }
    if (type) {
        output_informationTab.addInfo(output_informationTab.getLiveRoomCommentInfoHtml(type, matching, liveRoomContent));
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
        addCommentBlockButton(commentsData);
        //当楼主层执行通过后，检查楼中层
        const {replies = []} = commentsData;
        if (replies.length === 0) continue;
        for (let reply of replies) {
            if (shieldingCommentDecorated(reply)) continue;
            addCommentBlockButton(reply);
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
        Tip.successBottomRight("屏蔽了直播间")
        output_informationTab.addInfo(output_informationTab.getLiveRoomInfoHtml(type, matching, liveRoomData));
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
        }, 1500);
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
    shieldingVideoDecorated,
    shieldingDynamicDecorated,
    shieldingCommentDecorated,
    shieldingLiveRoomDecorated,
    shieldingComments,
    addVideoBlockButton,
    addCommentBlockButton,
    shieldingLiveRoomContentDecorated,
    addLiveContentBlockButton,
    addPopularVideoBlockButton,
    addTopicDetailVideoBlockButton,
    addTopicDetailContentsBlockButton,
    intervalExecutionStartShieldingVideoInert,
    addBlockButton
}
