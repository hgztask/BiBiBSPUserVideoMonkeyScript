import elUtil from "../core/elUtil.ts";
import urlUtil from "../core/urlUtil.ts";
import strFormatUtil from "../core/strFormatUtil.ts";
import video_shielding from "../domain/shielding_video.ts";
import shielding from "../domain/shielding_main.ts";

const getVideoDataList = async () => {
    return elUtil.findElements('.right-panel ul>.clearfix').then(els => {
        const dataList = []
        for (const el of els) {
            const titleAEl = el.querySelector('a.video-title') as HTMLAnchorElement | null;
            if (!titleAEl) continue;
            const title = titleAEl.textContent!.trim();
            const insertionPositionEl = el.querySelector('.video-item-box') as HTMLElement | null;
            if (!insertionPositionEl) continue;
            const videoStatsTdEls = insertionPositionEl.querySelectorAll('.video-stats td')
            const videoUrl = titleAEl.href ?? '';
            const bv = urlUtil.getUrlBV(videoUrl)
            const playCountEl = videoStatsTdEls[0]
            const bulletChatEl = videoStatsTdEls[1]
            const playCount = playCountEl!.textContent!.trim()
            const nPlayCount = strFormatUtil.toPlayCountOrBulletChat(playCount)
            const bulletChat = bulletChatEl!.textContent!.trim()
            const nBulletChat = strFormatUtil.toPlayCountOrBulletChat(bulletChat)
            const durationEl = el.querySelector('.video-duration')
            const durationStr = durationEl?.textContent?.trim() ?? ''
            const nDuration = strFormatUtil.timeStringToSeconds(durationStr)
            dataList.push({
                el,
                name: '',
                title,
                bv,
                nPlayCount,
                nBulletChat,
                videoUrl, nDuration, insertionPositionEl, explicitSubjectEl: el as HTMLElement
            })
        }
        return dataList
    })
}

const getCommentDataList = async () => {
    return elUtil.findElements('.bui-recommend-comments>.bui-comment').then(els => {
        return els.map(el => {
            const explicitSubjectEl = el.querySelector('.comment-main') as HTMLElement | null;
            const insertionPositionEl = explicitSubjectEl?.querySelector('.user-info') as HTMLElement | null;
            const vueData = el['__vue__'];
            const {comment} = vueData
            const name = comment.user_name;
            const user_level = comment.user_level;
            const uid = comment.uid;
            const content = comment.content;
            const replyList = []
            for (const replyEl of el.querySelectorAll('.reply-list>.bui-comment')) {
                const replyVueData = replyEl['__vue__'];
                const {reply} = replyVueData
                const replyUserId = reply.uid
                replyList.push({
                    el: replyEl,
                    vueData: replyVueData, name: reply.user_name,
                    user_level: reply.user_level,
                    uid: replyUserId,
                    content: reply.content,
                    userUrl: `https://space.bilibili.com/${replyUserId}`,
                    explicitSubjectEl: replyEl as HTMLElement,
                    insertionPositionEl: replyEl.querySelector('.comment-main>.user-info') as HTMLElement | null
                })
            }
            return {
                name, uid, replyList, userUrl: `https://space.bilibili.com/${uid}`,
                el, vueData, comment, user_level, content, explicitSubjectEl, insertionPositionEl
            }
        })
    })
}


const cssMap = {width: "100%"}

export default {
    isUrlPage(url: string) {
        return url.includes('https://www.biligame.com/detail/?id=');
    }, getCommentDataList,
    checkVideoList() {
        getVideoDataList().then(dataList => dataList.forEach(data => {
            (data as any).cssMap = cssMap;
            (data as any).bv = data.bv ?? undefined;
            video_shielding.shieldingVideoDecorated(data as any).catch(() => {
                shielding.addBlockButton({
                    data: data as any,
                    maskingFunc: this.checkVideoList.bind(this)
                }, "gz_shielding_button");
            })
        }))
    }
}