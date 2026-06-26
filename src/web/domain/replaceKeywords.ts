import {
    enableReplacementProcessing,
    getSubstituteWordsArr,
    isClearCommentEmoticons,
    isReplaceCommentSearchTerms
} from "../state/localMKData.ts"
import {eventEmitter} from "../core/EventEmitter.ts"
import {returnTempVal} from "../config/globalValue.ts"

interface ReplaceKeywordItem {
    findVal: string
    replaceVal: string
    actionScopes: string[]
}

interface ReplaceResult {
    state: boolean
    content?: string
    model?: string
}

const replaceKeywords = (arr: any[], actionScope: string, content: string): ReplaceResult => {
    if (arr.length === 0 || !enableReplacementProcessing()) return returnTempVal
    for (const v of arr) {
        if (!content.includes(v.findVal)) continue
        if (!v.actionScopes.some((aItem: string) => aItem === actionScope)) continue
        return {
            state: true,
            content: content.replaceAll(v.findVal, v.replaceVal)
        }
    }
    return returnTempVal
}

const replaceEmoticons = (arr: any[], el: Element | null, alt: string): ReplaceResult => {
    if (arr.length === 0 || !enableReplacementProcessing()) return returnTempVal
    for (const v of arr) {
        if (!v.actionScopes.some((aItem: string) => aItem === '评论表情')) continue
        if (v.findVal !== alt) continue
        if (v.replaceVal === '') {
            el?.remove()
            return {state: true, model: 'del', content: alt}
        }
        return {
            state: true,
            model: 'subStr',
            content: v.replaceVal
        }
    }
    return returnTempVal
}

interface CommentsData {
    contentsEl: Element
    name: string
    uid: string
}

eventEmitter.on('event-评论通知替换关键词', (commentsData: CommentsData): void => {
    const {contentsEl, name, uid} = commentsData
    if (!contentsEl) return
    const spanEls = contentsEl.querySelectorAll('span')
    const imgEls = contentsEl.querySelectorAll('img')
    const aEls = contentsEl.querySelectorAll('a')
    const substituteWordsArr = getSubstituteWordsArr()
    if (isClearCommentEmoticons()) {
        for (let imgEl of imgEls) {
            imgEl?.remove()
            eventEmitter.send('打印信息', `已清除${name}的评论中的表情`)
        }
    } else {
        for (let imgEl of imgEls) {
            if (imgEl.getAttribute('replace') !== null) continue
            const alt = imgEl.getAttribute('alt')
            imgEl.setAttribute('replace', '')
            if (alt === null) continue
            imgEl.setAttribute('title', alt)
            const {state, model, content} = replaceEmoticons(substituteWordsArr, imgEl, alt)
            if (!state) continue
            if (model === 'del') {
                eventEmitter.send('打印信息', `已清除用户${name}的评论中的表情`)
                continue
            }
            if (model === 'subStr') {
                imgEl.outerHTML = `<span replace>${content}</span>`
                eventEmitter.send('打印信息', `已替换用户${name}的评论中的表情:`)
            }
        }
    }
    if (isReplaceCommentSearchTerms()) {
        for (let aEl of aEls) {
            const text = aEl.textContent
            aEl.outerHTML = `<span replace>${text}</span>`
            eventEmitter.send('打印信息', `已替换用户${name}的评论中的搜索跳转关键词:`)
        }
    }
    for (let spanEl of spanEls) {
        if (spanEl.getAttribute('replace') !== null) continue
        const elContent = spanEl.textContent || ''
        const {state, content} = replaceKeywords(substituteWordsArr, '评论内容', elContent)
        if (!state) continue
        spanEl.textContent = content || ''
        spanEl.setAttribute('replace', '')
        eventEmitter.send('打印信息', `已替换用户${name}的评论内容:原\n${elContent}现\n${content}`)
    }
})
