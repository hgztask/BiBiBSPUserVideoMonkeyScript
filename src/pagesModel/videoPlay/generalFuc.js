import sFormatUtil from '../../utils/sFormatUtil.js'

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

//视频页通用函数
export default {getPlayCountAndBulletChatAndDuration}
