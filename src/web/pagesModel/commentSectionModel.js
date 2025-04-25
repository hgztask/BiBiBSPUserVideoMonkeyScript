import elUtil from "../utils/elUtil.js";
import shielding from "../model/shielding/shielding.js";
import defUtil from "../utils/defUtil.js";
import topicDetail from "./topicDetail.js";
import localMKData from "../data/localMKData.js";
import videoPlayModel from "./videoPlay/videoPlayModel.js";
import {eventEmitter} from "../model/EventEmitter.js";
import comments_shielding from "../model/shielding/comments_shielding.js";

/**
 * 评论添加屏蔽按钮
 * @param commentsData {{}}评论数据
 */
eventEmitter.on('评论添加屏蔽按钮', (commentsData) => {
    shielding.addBlockButton({
        data: commentsData,
        maskingFunc: startShieldingComments
    }, "gz_shielding_comment_button");
})


/**
 * 获取url中的用户等级
 * @param src {string}
 * @returns {number}
 */
const getUrlUserLevel = (src) => {
    const levelMath = src?.match(/level_(.+)\.svg/) || null;
    let level = -1
    if (levelMath !== null) {
        const levelRow = levelMath[1];
        if (levelRow === 'h') {
            level = 7;
        } else {
            level = parseInt(levelRow);
        }
    }
    return level;
}

/**
 * 获取旧版用户等级
 * 旧版本的布局需要传入元素进行匹配
 * @param iEl {Element}
 * @returns {number}
 */
const getOldUserLevel = (iEl) => {
    let level
    const levelCLassName = iEl.classList[1];
    if (levelCLassName === 'level-hardcore') {
        level = 7;
    } else {
        const levelMatch = levelCLassName.match(/level-(.+)/)?.[1] || ''
        level = parseInt(levelMatch)
    }
    return level
}


/**
 * 获取评论列表
 * @returns {Promise<*[]>}
 */
const getCommentSectionList = async () => {
    // await defUtil.wait(2000);
    const commentApp = await elUtil.findElementUntilFound("bili-comments",
        {interval: 500});
    const comments = await elUtil.findElementsUntilFound("#feed>bili-comment-thread-renderer",
        {doc: commentApp.shadowRoot, interval: 500});
    const commentsData = [];
    //是否加载完毕，如果评论内容不为空，说明内容已经加载完毕，用于解决评论内容未能加载完问题
    let isLoaded = false;
    for (let el of comments) {
        //楼主层
        const theOPEl = el.shadowRoot.getElementById("comment").shadowRoot;
        const theOPUserInfo = theOPEl.querySelector("bili-comment-user-info")
            .shadowRoot.getElementById("info");
        const userNameEl = theOPUserInfo.querySelector("#user-name>a");
        const userLevelSrc = theOPUserInfo.querySelector('#user-level>img')?.src || null
        const level = getUrlUserLevel(userLevelSrc)
        isLoaded = theOPEl.querySelector("#content>bili-rich-text")
            .shadowRoot.querySelector("#contents>*") !== null;
        if (!isLoaded) {
            break;
        }
        const theOPContentEl = theOPEl.querySelector("#content>bili-rich-text")
            .shadowRoot.querySelector("#contents");
        const theOPContent = theOPContentEl.textContent.trim();
        const userName = userNameEl.textContent.trim();
        const userUrl = userNameEl.href;
        const uid = elUtil.getUrlUID(userUrl);
        //楼中层内容
        const replies = [];
        commentsData.push({
            name: userName,
            userUrl,
            uid,
            level,
            content: theOPContent,
            replies,
            el,
            insertionPositionEl: theOPUserInfo,
            explicitSubjectEl: theOPEl.querySelector("#body"),
            contentsEl: theOPContentEl
        });
        //楼中层
        const inTheBuildingEls = el.shadowRoot.querySelector("bili-comment-replies-renderer")
            .shadowRoot.querySelectorAll("bili-comment-reply-renderer");
        for (let inTheBuildingEl of inTheBuildingEls) {
            const inTheContentEl = inTheBuildingEl.shadowRoot;
            const biliCommentUserInfo = inTheContentEl.querySelector("bili-comment-user-info");
            biliCommentUserInfo.style.display = 'block'
            const inTheBuildingUserInfo = biliCommentUserInfo.shadowRoot.getElementById("info");
            const inTheBuildingUserNameEl = inTheBuildingUserInfo.querySelector("#user-name>a");
            const inTheBuildingUserName = inTheBuildingUserNameEl.textContent.trim();
            const inTheBuildingUserUrl = inTheBuildingUserNameEl.href;
            const inTheBuildingUid = elUtil.getUrlUID(inTheBuildingUserUrl);
            //评论内容元素
            const biliRichTextEL = inTheContentEl.querySelector("bili-rich-text");
            const contentsEl = biliRichTextEL.shadowRoot.querySelector("#contents");
            const inTheBuildingContent = contentsEl.textContent.trim();
            const userLevelSrc = inTheBuildingUserInfo.querySelector('#user-level>img')?.src || null;
            const level = getUrlUserLevel(userLevelSrc)
            replies.push({
                name: inTheBuildingUserName,
                userUrl: inTheBuildingUserUrl,
                uid: inTheBuildingUid,
                level,
                content: inTheBuildingContent,
                el: inTheBuildingEl,
                insertionPositionEl: inTheBuildingUserInfo,
                explicitSubjectEl: inTheBuildingEl,
                contentsEl
            })
        }
    }
    if (!isLoaded) {
        await defUtil.wait(500);
        return getCommentSectionList()
    }
    return commentsData;
}

//获取旧评论列表，适用于旧版本评论区，新版评论区使用shadowRoot
const getOldCommentSectionList = async () => {
    let results
    try {
        results = await elUtil.findElementsUntilFound(".reply-list>.reply-item", {timeout: 5000});
    } catch (e) {
        return []
    }
    /**
     *
     * @type {[{}]}
     */
    const commentsData = [];
    for (let el of results) {
        //楼主层
        const theOPEl = el.querySelector(".root-reply-container");
        const theOPUserInfoEl = theOPEl.querySelector(".user-name");
        const userName = theOPUserInfoEl.textContent.trim();
        const uid = parseInt(theOPUserInfoEl.getAttribute("data-user-id"));
        const userUrl = `https://space.bilibili.com/${uid}`;
        const theOPContent = theOPEl.querySelector(".reply-content").textContent.trim();
        const userInfoEl = el.querySelector(".user-info");
        const iEl = userInfoEl.querySelector('i');
        const level = getOldUserLevel(iEl)
        const replies = [];
        commentsData.push({
            name: userName,
            userUrl,
            uid,
            content: theOPContent,
            level,
            replies,
            el,
            insertionPositionEl: userInfoEl,
            explicitSubjectEl: el.querySelector(".content-warp")
        });
        //楼中层内容
        const inTheBuildingEls = el.querySelectorAll(".sub-reply-container>.sub-reply-list>.sub-reply-item");
        for (let inTheBuildingEl of inTheBuildingEls) {
            const subUserNameEl = inTheBuildingEl.querySelector(".sub-user-name");
            const uid = parseInt(subUserNameEl.getAttribute("data-user-id"));
            const userName = subUserNameEl.textContent.trim();
            const userUrl = `https://space.bilibili.com/${uid}`;
            const subContent = inTheBuildingEl.querySelector(".reply-content").textContent.trim();
            const subUserInfoEl = inTheBuildingEl.querySelector(".sub-user-info");
            const iEl = subUserInfoEl.querySelector('i');
            const level = getOldUserLevel(iEl)
            const replyContentContainerEl = inTheBuildingEl.querySelector('span.reply-content-container');
            replyContentContainerEl.style.display = 'block'
            replies.push({
                name: userName,
                userUrl,
                uid,
                level,
                content: subContent,
                el: inTheBuildingEl,
                insertionPositionEl: subUserInfoEl,
                explicitSubjectEl: inTheBuildingEl
            })
        }
    }
    return commentsData;
}


//执行屏蔽评论
const startShieldingComments = async () => {
    //如果当前是视频播放页并且配置了移除底部评论区时不执行该页的屏蔽评论功能
    if (videoPlayModel.isVideoPlayPage() && localMKData.isDelBottomComment()) {
        return
    }
    let list;
    const href = window.location.href;
    if (localMKData.isDiscardOldCommentAreas()) {
        //新版评论区
        list = await getCommentSectionList();
    } else if (href.includes("https://space.bilibili.com/") || topicDetail.isTopicDetailPage(href)) {
        //评论_旧版本，适用于部分旧版评论区
        list = await getOldCommentSectionList();
    } else {
        //新版评论区
        list = await getCommentSectionList();
    }
    comments_shielding.shieldingComments(list);
}

/**
 * 评论区模块
 */
export default {
    startShieldingComments
}

