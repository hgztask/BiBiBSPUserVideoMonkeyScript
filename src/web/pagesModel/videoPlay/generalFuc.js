import sFormatUtil from '../../utils/sFormatUtil.js'
import elUtil from "../../utils/elUtil.js";

const getPlayCountAndBulletChatAndDuration = (el) => {
    const playInfo = el.querySelector('.playinfo').innerHTML.trim();
    let nPlayCount = playInfo.match(/<\/svg>(.*)<svg/s)?.[1].trim()
    nPlayCount = sFormatUtil.toPlayCountOrBulletChat(nPlayCount)
    let nBulletChat = playInfo.match(/class="dm-icon".+<\/svg>(.+)$/s)?.[1].trim()
    nBulletChat = sFormatUtil.toPlayCountOrBulletChat(nBulletChat)
    let nDuration = el.querySelector('.duration')?.textContent.trim()
    nDuration = sFormatUtil.timeStringToSeconds(nDuration)
    return {
        nPlayCount, nBulletChat, nDuration
    }
}

const getRightVideoDataList=(elList)=>{
    const list = []
    for (let el of elList) {
        const title = el.querySelector(".title").textContent.trim();
        const userInfoEl = el.querySelector(".upname");
        const name = userInfoEl.querySelector(".name").textContent.trim();
        const userUrl = userInfoEl.href;
        const uid = elUtil.getUrlUID(userUrl);
        const videoUrl = el.querySelector(".info>a").href;
        const bv = elUtil.getUrlBV(videoUrl);
        list.push({
            ...getPlayCountAndBulletChatAndDuration(el), ...{
                title,
                name,
                userUrl,
                videoUrl,
                uid,
                bv,
                el,
                insertionPositionEl: el.querySelector(".playinfo"),
                explicitSubjectEl: el.querySelector(".info")
            }
        })
    }
    return list;
}


/**
 * 视频页通用函数
 * 目前适用于稍后再看播放页和收藏的视频播放页
 */
export default {getRightVideoDataList}
