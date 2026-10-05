import elUtil from "../core/util/elUtil.ts";
import shielding from "../domain/shielding/main.ts";
import defUtil from "../core/util/defUtil.ts";
import topicDetail from "./topicDetail.ts";
import localMKData, {
    getCommentBlockButtonStyleGm,
    isCloseCommentBlockingGm
} from "../state/localMKData.ts";
import videoPlayModel from "./video/playModel.ts";
import {eventEmitter} from "../core/EventEmitter.ts";
import {elEventEmitter} from "../core/elEventEmitter.ts";
import comments_shielding from "../domain/shielding/comments.ts";
import urlUtil from "../core/util/urlUtil.ts";
import {valueCache} from "../core/cache/valueCache.ts";

/** 新版评论区已加载的评论数据缓存（用于设置切换时重分发，避免依赖易卡住的网络重扫） */
const cachedNewCommentList: any[] = [];

/** 楼中层评论后按钮的标记 class */
const COMMENT_AFTER_BUTTON_CLASS = 'gz_shielding_comment_after_button';

/**
 * 向楼中层评论内容后插入屏蔽按钮（#main 用户信息+正文之后、#footer 操作条之前，不破坏同行布局）
 * 悬停显隐逻辑与 addBlockButton 一致：悬停评论时显示、移出隐藏
 * @param commentsData 楼中层评论数据（el 为 bili-comment-reply-renderer）
 */
const addCommentAfterButton = (commentsData: any): void => {
    const el = commentsData.el;
    if (el?.tagName !== 'BILI-COMMENT-REPLY-RENDERER') return;
    const bodyEl = el.shadowRoot?.querySelector('#body');
    if (!bodyEl) return;
    const mainEl = bodyEl.querySelector('#main');
    if (!mainEl) return;
    // 幂等：已注入过则跳过
    if (bodyEl.querySelector('.' + COMMENT_AFTER_BUTTON_CLASS)) return;
    const buttonEL = document.createElement("button");
    buttonEL.className = COMMENT_AFTER_BUTTON_CLASS;
    buttonEL.textContent = "屏蔽";
    // 悬停显隐：初始隐藏，移入评论显示，移出评论隐藏
    buttonEL.style.display = "none";
    elEventEmitter.addEvent(bodyEl, "mouseout", () => buttonEL.style.display = "none");
    elEventEmitter.addEvent(bodyEl, "mouseover", () => {
        buttonEL.style.display = "";
    });
    buttonEL.addEventListener("click", (event) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        shielding.openBlockOptions({
            data: commentsData,
            maskingFunc: startShieldingComments
        });
    });
    mainEl.insertAdjacentElement('afterend', buttonEL as unknown as Element);
}

/**
 * 按位置选项调整楼中层用户名与评论内容的位置关系
 * - default(用户名后面)：楼中层需要块级布局（按钮内联在用户名后），设置 display: block
 * - 其余模式（hide/more/after）：按钮不在用户名后，恢复 B 站原生同行布局，移除 display
 * @param commentsData 楼中层评论数据（el 为 bili-comment-reply-renderer）
 * @param style 当前评论屏蔽按钮位置
 */
const applyReplyLayoutByStyle = (commentsData: any, style: string): void => {
    const el = commentsData.el;
    if (el?.tagName !== 'BILI-COMMENT-REPLY-RENDERER') return;
    const userInfoEl = el.shadowRoot?.querySelector('bili-comment-user-info');
    if (!userInfoEl) return;
    if (style === 'default') {
        userInfoEl.style.display = 'block';
    } else {
        userInfoEl.style.removeProperty('display');
    }
}

/** 按"评论屏蔽按钮位置"设置向单条新版评论分发入口（default按钮 / hide无 / more菜单项 / after楼中层评论后） */
const addCommentBlockEntryByStyle = (commentsData: any): void => {
    const style = getCommentBlockButtonStyleGm();
    // 楼中层用户名与评论内容的位置关系随位置选项调整：仅"用户名后面"模式需要块级布局（按钮内联在用户名后），
    // 其余模式保持 B 站原生同行布局，避免破坏用户名与评论的位置
    if (commentsData.el?.tagName === 'BILI-COMMENT-REPLY-RENDERER') {
        applyReplyLayoutByStyle(commentsData, style);
    }
    if (style === 'hide') return;
    if (style === 'more') {
        addCommentMoreMenuEntry(commentsData);
        return;
    }
    if (style === 'after') {
        // 楼中层：按钮放评论内容后；楼主层：保持用户名后按钮现状
        if (commentsData.el?.tagName === 'BILI-COMMENT-REPLY-RENDERER') {
            addCommentAfterButton(commentsData);
            return;
        }
        shielding.addBlockButton({
            data: commentsData,
            maskingFunc: startShieldingComments
        }, "gz_shielding_comment_button", [], true);
        return;
    }
    shielding.addBlockButton({
        data: commentsData,
        maskingFunc: startShieldingComments
    }, "gz_shielding_comment_button", [], true);
}

/**
 * 评论添加屏蔽按钮
 * 根据"评论屏蔽按钮位置"设置分发（仅新版评论区生效）：
 * - default: 用户名后内联按钮（保留现状）
 * - hide:    不创建任何入口
 * - more:    注入到原生三点菜单
 * 旧版评论区、直播间排行榜、消息回复列表等旧式结构不受影响，保持用户名后按钮
 * @param commentsData {{}}评论数据
 */
eventEmitter.on('评论添加屏蔽按钮', (commentsData) => {
    // 新版评论区自定义元素 tag 以 BILI-COMMENT 开头（bili-comment-thread-renderer / bili-comment-reply-renderer），
    // 旧式结构（.reply-item / .list-item 等）不受位置选项影响
    const elTag = commentsData.el?.tagName ?? '';
    if (!elTag.startsWith('BILI-COMMENT')) {
        shielding.addBlockButton({
            data: commentsData,
            maskingFunc: startShieldingComments
        }, "gz_shielding_comment_button", [], true);
        return;
    }
    // 缓存已加载的新版评论数据，供设置切换时重分发
    cachedNewCommentList.push(commentsData);
    addCommentBlockEntryByStyle(commentsData);
})

/** 注入到三点菜单的菜单项标记 class */
const COMMENT_MORE_ENTRY_CLASS = 'gz-shielding-comment-menu-entry';

/**
 * 定位评论的三点菜单项容器 ul#options
 * 新版评论区结构（楼主层与楼中楼一致）：
 * el -> shadowRoot -> #comment(bili-comment-renderer) -> shadowRoot -> #body
 *    -> bili-comment-action-buttons-renderer -> shadowRoot -> #more > bili-comment-menu
 *    -> shadowRoot -> ul#options
 * @param el 评论元素（楼主层为 bili-comment-thread-renderer，楼中楼为 bili-comment-reply-renderer）
 * @returns 菜单项容器 ul#options，未找到时返回 null
 */
const getCommentMenuOptionsUl = (el: any): HTMLElement | null => {
    if (!el?.shadowRoot) return null;
    // 楼中楼：el 即 bili-comment-reply-renderer，其 shadowRoot 下直接是 #body
    // 楼主层：el 是 bili-comment-thread-renderer，shadowRoot 下是 #comment(bili-comment-renderer)，再一层 shadowRoot 才是 #body
    const bodyEl = el.shadowRoot.querySelector('#body')
        ?? el.shadowRoot.querySelector('#comment')?.shadowRoot?.querySelector('#body');
    if (!bodyEl) return null;
    const actionButtonsEl = bodyEl.querySelector('bili-comment-action-buttons-renderer');
    if (!actionButtonsEl?.shadowRoot) return null;
    const menuEl = actionButtonsEl.shadowRoot.querySelector('#more>bili-comment-menu');
    if (!menuEl?.shadowRoot) return null;
    return menuEl.shadowRoot.querySelector('ul#options') ?? null;
}

/**
 * 向评论原生三点菜单注入"屏蔽该评论"菜单项
 * @param commentsData {{}}评论数据
 */
const addCommentMoreMenuEntry = (commentsData: any): void => {
    const optionsUl = getCommentMenuOptionsUl(commentsData.el);
    if (!optionsUl) return;
    // 幂等：避免重复注入
    if (optionsUl.querySelector('.' + COMMENT_MORE_ENTRY_CLASS)) return;
    const li = document.createElement('li');
    li.className = COMMENT_MORE_ENTRY_CLASS;
    li.textContent = '屏蔽该评论';
    li.addEventListener('click', (event) => {
        event.stopImmediatePropagation();
        event.preventDefault();
        // 注入项不继承原生的"点击关闭菜单"，需手动收起
        const rootNode = optionsUl.getRootNode();
        const menuHost = rootNode instanceof ShadowRoot ? rootNode.host : null;
        (menuHost as HTMLElement | null)?.style?.setProperty?.('--bili-comment-menu-display', 'none');
        shielding.openBlockOptions({
            data: commentsData,
            maskingFunc: startShieldingComments
        });
    });
    optionsUl.insertAdjacentElement('beforeend', li as unknown as Element);
}

/**
 * 清理已注入的评论屏蔽入口（用户名后按钮、楼中层评论后按钮与三点菜单项）
 * 按钮插入位置是 bili-comment-user-info 的 shadowRoot 内 #info 或楼中层 #main 后，菜单项在 action-buttons 菜单内，
 * 两者都在多层 shadowRoot 内，需按已知结构逐层遍历
 */
const removeCommentButtonEntries = (): void => {
    // 移除单条评论的用户名后按钮（bili-comment-user-info -> shadowRoot -> #info 内）
    const removeButtonInUserInfo = (commentShadow: any): void => {
        commentShadow?.querySelectorAll('bili-comment-user-info').forEach((userInfoEl: any) => {
            userInfoEl.shadowRoot?.querySelectorAll('.gz_shielding_comment_button').forEach((buttonEl: Element) => buttonEl.remove());
        });
    };
    // 移除单个评论的菜单注入项
    const removeMenuEntry = (el: any): void => {
        const optionsUl = getCommentMenuOptionsUl(el);
        optionsUl?.querySelectorAll('li.' + COMMENT_MORE_ENTRY_CLASS)
            .forEach((li) => li.remove());
    };
    // 移除楼中层评论后按钮（#body 内）
    const removeAfterButton = (commentShadow: any): void => {
        commentShadow?.querySelectorAll('.' + COMMENT_AFTER_BUTTON_CLASS).forEach((buttonEl: Element) => buttonEl.remove());
    };
    document.querySelectorAll('bili-comments').forEach((commentsEl: any) => {
        const sr = commentsEl.shadowRoot;
        if (!sr) return;
        sr.querySelectorAll('bili-comment-thread-renderer').forEach((threadEl: any) => {
            const threadShadow = threadEl.shadowRoot;
            if (!threadShadow) return;
            // 楼主层
            const commentShadow = threadShadow.querySelector('#comment')?.shadowRoot;
            removeButtonInUserInfo(commentShadow);
            removeMenuEntry(threadEl);
            // 楼中楼
            const repliesRenderer = threadShadow.querySelector('bili-comment-replies-renderer');
            repliesRenderer?.shadowRoot?.querySelectorAll('bili-comment-reply-renderer')
                .forEach((replyEl: any) => {
                    removeButtonInUserInfo(replyEl.shadowRoot);
                    removeMenuEntry(replyEl);
                    removeAfterButton(replyEl.shadowRoot);
                });
        });
    });
}

/** 评论屏蔽按钮位置设置变更：清理旧形态入口，并用已加载的评论缓存按新模式重新分发（不依赖易卡住的网络重扫） */
eventEmitter.on('event-评论屏蔽按钮样式变更', () => {
    removeCommentButtonEntries();
    for (let commentsData of cachedNewCommentList) {
        addCommentBlockEntryByStyle(commentsData);
    }
})

/**
 * 获取url中的用户等级
 * 硬核会员等级为7，原h转换为7
 * @param src {string}
 * @returns {number}
 */
const getUrlUserLevel = (src: any) => {
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
const getOldUserLevel = (iEl: any) => {
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

//装扮数据
const decorateData = valueCache.set("decorateData", {});
const getDecorate = (el: any, uid: any, name: any) => {
    const newVar: Record<string, any> = {dressUpId: -1, collectionActId: -1, decoratePic: null}
    if (el === null || el === undefined) return newVar
    const decorateShadowRoot = el.shadowRoot;
    if (!decorateShadowRoot) return newVar
    const decoratePicEl = decorateShadowRoot.querySelector("img")
    if (decoratePicEl === null || decoratePicEl === undefined) return newVar
    //装扮图片url
    newVar.decoratePic = decoratePicEl.src;
    const decorateAEl = decorateShadowRoot.querySelector("a")
    if (!decorateAEl) return newVar
    const decorateHref = decorateAEl.href;
    const parseUrl = urlUtil.parseUrl(decorateHref);
    //装扮id，如是收藏集均为0
    const itemIdStr = parseUrl.queryParams['item_id'];
    if (itemIdStr) {
        newVar.dressUpId = parseInt(itemIdStr)
    }
    //收藏集活动id
    const actIdStr = parseUrl.queryParams['act_id'];
    if (actIdStr) {
        newVar.collectionActId = parseInt(actIdStr)
    }
    newVar.name = name;
    decorateData[uid] = newVar
    return newVar
}

interface AtMemberInfo {
    /** 被@的成员名（不含@符号） */
    name: string
    /** 被@的成员uid */
    uid: number
    /** 被@的成员主页地址 */
    userUrl: string
}

/**
 * 提取评论富文本中 a 标签形式的@用户数据
 * 非 a 标签显示的"@xxxx"只是普通文本内容，不算@数据
 * @param contentsEl {Element} 评论内容容器（新版为 bili-rich-text 下的 #contents，旧版为 .reply-content）
 * @returns {AtMemberInfo[]} 同一评论内按uid去重，无@时返回空数组
 */
const getAtMembers = (contentsEl: any): AtMemberInfo[] => {
    const result: AtMemberInfo[] = [];
    const seenUids = new Set<number>();
    for (let atEl of contentsEl.querySelectorAll('a')) {
        const href: string = atEl.href || '';
        if (!href.includes('space.bilibili.com')) continue;
        const uid = urlUtil.getUrlUID(href);
        if (isNaN(uid) || uid <= 0 || seenUids.has(uid)) continue;
        seenUids.add(uid);
        result.push({
            name: atEl.textContent?.replace(/^@/, '').trim() ?? '',
            uid,
            userUrl: `https://space.bilibili.com/${uid}`
        });
    }
    return result;
}

/**
 * 获取评论列表
 * @returns {Promise<*[]>}
 */
const getCommentSectionList = async () => {
    // await defUtil.wait(2000);
    const commentApps = await elUtil.findElements("bili-comments",
        {interval: 500});
    const commentsData = [];
    for (let commentApp of commentApps) {
        const shadowRoot = commentApp.shadowRoot;
        if (!shadowRoot) continue;
        const comments = await elUtil.findElements("#feed>bili-comment-thread-renderer",
            {doc: shadowRoot, interval: 500});
        //是否加载完毕，如果评论内容不为空，说明内容已经加载完毕，用于解决评论内容未能加载完问题
        let isLoaded = false;
        for (let el of comments) {
            //楼主层
            const elShadowRoot = el.shadowRoot;
            if (!elShadowRoot) continue;
            const commentEl = elShadowRoot.getElementById("comment");
            if (!commentEl?.shadowRoot) continue;
            const theOPEl = commentEl.shadowRoot;
            const commentUserInfo = theOPEl.querySelector("bili-comment-user-info");
            if (!commentUserInfo?.shadowRoot) continue;
            const theOPUserInfo = commentUserInfo.shadowRoot.getElementById("info");
            if (!theOPUserInfo) continue;
            const userNameEl = theOPUserInfo.querySelector("#user-name>a");
            if (!userNameEl) continue;
            const userLevelSrc = theOPUserInfo.querySelector('#user-level>img')?.src ?? null
            const level = getUrlUserLevel(userLevelSrc)
            const contentRichText = theOPEl.querySelector("#content>bili-rich-text");
            if (!contentRichText?.shadowRoot) continue;
            isLoaded = contentRichText.shadowRoot.querySelector("#contents>*") !== null;
            if (!isLoaded) {
                break;
            }
            const theOPContentEl = contentRichText.shadowRoot.querySelector("#contents");
            if (!theOPContentEl) continue;
            const theOPContent = theOPContentEl.textContent?.trim() ?? '';
            const userName = userNameEl.textContent?.trim() ?? '';
            const userUrl = userNameEl.href ?? '';
            const uid = urlUtil.getUrlUID(userUrl);
            const decorateEl = theOPEl.querySelector("#ornament>bili-comment-user-sailing-card")
            const {dressUpId, collectionActId, decoratePic} = getDecorate(decorateEl, uid, userName)
            //楼中层内容
            const replies: any[] = [];
            commentsData.push({
                name: userName, userUrl, uid, level, dressUpId, collectionActId, decoratePic,
                content: theOPContent,
                atMembers: getAtMembers(theOPContentEl),
                replies,
                el,
                insertionPositionEl: theOPUserInfo,
                explicitSubjectEl: theOPEl.querySelector("#body"),
                contentsEl: theOPContentEl
            });
            //楼中层
            const repliesRenderer = elShadowRoot.querySelector("bili-comment-replies-renderer");
            if (!repliesRenderer?.shadowRoot) continue;
            const inTheBuildingEls = repliesRenderer.shadowRoot.querySelectorAll("bili-comment-reply-renderer");
            for (let inTheBuildingEl of inTheBuildingEls) {
                const inTheContentEl = inTheBuildingEl.shadowRoot;
                if (!inTheContentEl) continue;
                const biliCommentUserInfo = inTheContentEl.querySelector("bili-comment-user-info");
                if (!biliCommentUserInfo) continue;
                // 楼中层用户名与评论内容的位置关系由 addCommentBlockEntryByStyle 按位置选项决定，
                // 仅在"用户名后面"模式下才设置块级布局，此处不再无条件设置
                if (!biliCommentUserInfo.shadowRoot) continue;
                const inTheBuildingUserInfo = biliCommentUserInfo.shadowRoot.getElementById("info");
                if (!inTheBuildingUserInfo) continue;
                const inTheBuildingUserNameEl = inTheBuildingUserInfo.querySelector("#user-name>a");
                if (!inTheBuildingUserNameEl) continue;
                const inTheBuildingUserName = inTheBuildingUserNameEl.textContent?.trim() ?? '';
                const inTheBuildingUserUrl = inTheBuildingUserNameEl.href ?? '';
                const inTheBuildingUid = urlUtil.getUrlUID(inTheBuildingUserUrl);
                //评论内容元素
                const biliRichTextEL = inTheContentEl.querySelector("bili-rich-text");
                if (!biliRichTextEL?.shadowRoot) continue;
                const contentsEl = biliRichTextEL.shadowRoot.querySelector("#contents");
                if (!contentsEl) continue;
                const inTheBuildingContent = contentsEl.textContent?.trim() ?? '';
                const userLevelSrc = inTheBuildingUserInfo.querySelector('#user-level>img')?.src ?? null;
                const level = getUrlUserLevel(userLevelSrc)
                const decorateDatum = decorateData[inTheBuildingUid];
                let dressUpId = -1, collectionActId = -1, decoratePic = null;
                if (decorateDatum) {
                    dressUpId = decorateDatum.dressUpId;
                    collectionActId = decorateDatum.collectionActId;
                    decoratePic = decorateDatum.decoratePic;
                }
                replies.push({
                    name: inTheBuildingUserName,
                    userUrl: inTheBuildingUserUrl,
                    uid: inTheBuildingUid, dressUpId, collectionActId, decoratePic,
                    level,
                    content: inTheBuildingContent,
                    atMembers: getAtMembers(contentsEl),
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
    }
    return commentsData;
}

//获取旧评论列表，适用于旧版本评论区，新版评论区使用shadowRoot
const getOldCommentSectionList = async () => {
    let results = await elUtil.findElements(".reply-list>.reply-item", {timeout: 5000});
    /**
     *
     * @type {[{}]}
     */
    const commentsData = [];
    for (let el of results) {
        //楼主层
        const theOPEl = el.querySelector(".root-reply-container");
        if (!theOPEl) continue;
        const theOPUserInfoEl = theOPEl.querySelector(".user-name");
        if (!theOPUserInfoEl) continue;
        const userName = theOPUserInfoEl.textContent?.trim() ?? '';
        const uid = parseInt(theOPUserInfoEl.getAttribute("data-user-id") ?? '');
        const userUrl = `https://space.bilibili.com/${uid}`;
        const theOPContentEl = theOPEl.querySelector(".reply-content");
        if (!theOPContentEl) continue;
        const theOPContent = theOPContentEl.textContent?.trim() ?? '';
        const userInfoEl = el.querySelector(".user-info");
        if (!userInfoEl) continue;
        const iEl = userInfoEl.querySelector('i');
        const level = getOldUserLevel(iEl)
        const replies: any[] = [];
        commentsData.push({
            name: userName,
            userUrl,
            uid,
            content: theOPContent,
            atMembers: getAtMembers(theOPContentEl),
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
            if (!subUserNameEl) continue;
            const uid = parseInt(subUserNameEl.getAttribute("data-user-id") ?? '');
            const userName = subUserNameEl.textContent?.trim() ?? '';
            const userUrl = `https://space.bilibili.com/${uid}`;
            const subContentEl = inTheBuildingEl.querySelector(".reply-content");
            if (!subContentEl) continue;
            const subContent = subContentEl.textContent?.trim() ?? '';
            const subUserInfoEl = inTheBuildingEl.querySelector(".sub-user-info");
            if (!subUserInfoEl) continue;
            const iEl = subUserInfoEl.querySelector('i');
            const level = getOldUserLevel(iEl)
            const replyContentContainerEl = inTheBuildingEl.querySelector('span.reply-content-container');
            if (replyContentContainerEl) {
                replyContentContainerEl.style.display = 'block'
            }
            replies.push({
                name: userName,
                userUrl,
                uid,
                level,
                content: subContent,
                atMembers: getAtMembers(subContentEl),
                el: inTheBuildingEl,
                insertionPositionEl: subUserInfoEl,
                explicitSubjectEl: inTheBuildingEl
            })
        }
    }
    return commentsData;
}

//获取直播间排行榜底部评论
const getLiveRankingsCommentSectionList = async () => {
    const elList = await elUtil.findElements('.comment-list>.list-item')
    const commentsData = [];
    for (let el of elList) {
        const nameEl = el.querySelector('.user>.name')
        if (!nameEl) continue
        const uid = parseInt(nameEl.getAttribute('data-usercard-mid') ?? '')
        const name = nameEl.textContent?.trim() ?? ''
        const levelEl = el.querySelector('.level-link>.level')
        if (!levelEl) continue
        const level = parseInt(levelEl.classList[1]?.charAt(1) ?? '');
        const contentsEl = el.querySelector('.con>.text');
        if (!contentsEl) continue
        const content = contentsEl.textContent?.trim() ?? ''
        const insertionPositionEl = el.querySelector('.user')
        const replies: any[] = [];
        commentsData.push({
            name, uid, content, level, el, replies,
            insertionPositionEl, contentsEl,
            explicitSubjectEl: insertionPositionEl
        })
        for (let replyEl of el.querySelectorAll('.reply-box>.reply-item')) {
            const replyNameEl = replyEl.querySelector('.name');
            if (!replyNameEl) continue
            const name = replyNameEl.textContent?.trim() ?? ''
            const uid = parseInt(replyNameEl.getAttribute('data-usercard-mid') ?? '');
            const replyLevelEl = replyEl.querySelector('.level')
            if (!replyLevelEl) continue
            const level = parseInt(replyLevelEl.classList[1]?.charAt(1) ?? '');
            const contentsEl = replyEl.querySelector('.text-con');
            if (!contentsEl) continue
            const content = contentsEl.textContent?.trim() ?? ''
            const insertionPositionEl = replyEl.querySelector('.user')
            replies.push({
                name, el: replyEl, uid, content, level,
                insertionPositionEl, contentsEl,
                explicitSubjectEl: replyEl
            })
        }
    }
    return commentsData;
}

//检查直播间排行榜底部评论
const checkLiveRankingsCommentSectionList = async () => {
    await comments_shielding.shieldingCommentsAsync(await getLiveRankingsCommentSectionList());
}

//执行屏蔽评论
const startShieldingComments = async () => {
    /*
    1.如果当前是视频播放页并且配置了移除底部评论区时不执行该页的屏蔽评论功能
    2.如果开启了关闭评论区屏蔽功能，则不执行屏蔽评论功能
     */
    if (videoPlayModel.isVideoPlayPage() && localMKData.isDelBottomComment() || isCloseCommentBlockingGm()) {
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
    comments_shielding.shieldingCommentsAsync(list);
}

eventEmitter.on('event-检查评论区屏蔽', () => {
    startShieldingComments()
})


/**
 * 评论区模块
 */
export default {
    checkLiveRankingsCommentSectionList
}

// 供 WebSocket 热测试通道验证列表项字段使用
export {getCommentSectionList}
