import {
    enableReplacementProcessing,
    getSubstituteWordsArr,
    isClearCommentEmoticons,
    isReplaceCommentSearchTerms
} from "../data/localMKData.js";
import {eventEmitter} from "./EventEmitter.js";
import {returnTempVal} from "../data/globalValue.js";

/**
 * 检查替换关键词
 * @param arr {[{}]} 替换关键词数组
 * @param actionScope {string} 作用域
 * @param content {string} 内容
 * @returns {{state: boolean, content: string}|{state: boolean}}
 */
const replaceKeywords = (arr, actionScope, content) => {
    if (arr.length === 0 || !enableReplacementProcessing()) return returnTempVal;
    for (const v of arr) {
        if (!content.includes(v.findVal)) continue;
        if (!v.actionScopes.some(aItem => aItem === actionScope)) continue;
        return {
            state: true,
            content: content.replaceAll(v.findVal, v.replaceVal)
        }
    }
    return returnTempVal
}

/**
 * 评论表情替换操作
 */
const replaceEmoticons = (arr, el, alt) => {
    if (arr.length === 0 || !enableReplacementProcessing()) return returnTempVal;
    for (const v of arr) {
        if (!v.actionScopes.some(aItem => aItem === '评论表情')) continue;
        if (v.findVal !== alt) continue;
        if (v.replaceVal === '') {
            el?.remove();
            return {state: true, model: 'del', content: alt};
        }
        return {
            state: true,
            model: 'subStr',
            content: v.replaceVal
        }
    }
    return returnTempVal
}

/**
 * 话题页面下的评论关键词替换操作后续安排
 */
eventEmitter.on('event-评论通知替换关键词', (commentsData) => {
    const {contentsEl, name, uid} = commentsData;
    if (!contentsEl) return;
    const spanEls = contentsEl.querySelectorAll('span');
    const imgEls = contentsEl.querySelectorAll('img');
    const aEls = contentsEl.querySelectorAll('a');
    const substituteWordsArr = getSubstituteWordsArr();
    if (isClearCommentEmoticons()) {
        for (let imgEl of imgEls) {
            imgEl?.remove();
            eventEmitter.send('打印信息', `已清除${name}的评论中的表情`)
        }
    } else {
        for (let imgEl of imgEls) {
            if (imgEl.getAttribute('replace') !== null) continue;
            //当表情不存在alt属性时，这里估计是那个搜索小图标，就评论里蓝色的关键词，点击会跳转搜索页搜索该关键词
            const alt = imgEl.getAttribute('alt');
            imgEl.setAttribute('replace', '');
            if (alt === null) continue;
            imgEl.setAttribute('title', alt);
            const {state, model, content} = replaceEmoticons(substituteWordsArr, imgEl, alt)
            if (!state) continue;
            if (model === 'del') {
                eventEmitter.send('打印信息', `已清除用户${name}的评论中的表情`)
                continue;
            }
            if (model === 'subStr') {
                imgEl.outerHTML = `<span replace>${content}</span>`;
                eventEmitter.send('打印信息', `已替换用户${name}的评论中的表情:`)
            }
        }
    }
    if (isReplaceCommentSearchTerms()) {
        for (let aEl of aEls) {
            const text = aEl.textContent;
            aEl.outerHTML = `<span replace>${text}</span>`;
            eventEmitter.send('打印信息', `已替换用户${name}的评论中的搜索跳转关键词:`)
        }
    }
    for (let spanEl of spanEls) {
        if (spanEl.getAttribute('replace') !== null) continue;
        const elContent = spanEl.textContent;
        const {state, content} = replaceKeywords(substituteWordsArr, '评论内容', elContent);
        if (!state) continue;
        spanEl.textContent = content;
        spanEl.setAttribute('replace', '');
        eventEmitter.send('打印信息', `已替换用户${name}的评论内容:原\n${elContent}现\n${content}`)
    }
})
