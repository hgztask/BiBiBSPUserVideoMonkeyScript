import defUtil from "../core/util/defUtil.ts";
import localMKData from "../state/localMKData";

interface LiveRoomCommentData {
    name: string
    uid: string | number
    content: string
}

interface LiveRoomData {
    name?: string | null
    uid?: string | number
    title: string
    liveUrl?: string
}

const outputInformationFontColor: string = localMKData.getOutputInformationFontColor();
const highlightInformationColor: string = localMKData.getHighlightInformationColor();

const getLiveRoomCommentInfoHtml = (type: string, matching: string | number | boolean | null, commentData: LiveRoomCommentData): string => {
    const toTimeString = defUtil.toTimeString();
    const {name, uid, content} = commentData;
    return `<b style="color: ${outputInformationFontColor}; " gz_bezel>
${toTimeString}-根据${type}-${matching ? `<b style="color: ${highlightInformationColor}">【${matching}】</b>` : ""}-屏蔽用户【${name}】uid=
            <a href="https://space.bilibili.com/${uid}" 
            style="color: ${highlightInformationColor}"
            target="_blank">【${uid}】</a>
            直播评论【${content}】
            </b>`
}

const getLiveRoomInfoHtml = (type: string, matching: string | number | boolean | null, liveRoomData: LiveRoomData): string => {
    const toTimeString = defUtil.toTimeString();
    const {name = null, uid = -1, title, liveUrl} = liveRoomData;
    return `<b style="color: ${outputInformationFontColor};" gz_bezel>
${toTimeString}-根据${type}${matching ? `<b style="color: ${highlightInformationColor}">【${matching}】</b>` : ""}-屏蔽用户【${name === null ? '' : name}】${uid === -1 ? "" : `uid=
            <a href="https://space.bilibili.com/${uid}"
            style="color: ${highlightInformationColor}"
            target="_blank">【${uid}】</a>`}
            直播间标题【<a href="${liveUrl}" target="_blank" style="color: ${highlightInformationColor}">${title}</a>】
</b>`
}

interface VideoDanmakuInfo {
    text: string
    /** 发送者信息（破解uid后查询得到，未破解成功时为空） */
    user?: { uid: string, name: string, level: number } | null
    /** uid 破解失败时保留的哈希，便于后续排查 */
    uhash?: string
}

const getVideoDanmakuInfoHtml = (type: string, matching: string | number | boolean | null, danmakuData: VideoDanmakuInfo): string => {
    const toTimeString = defUtil.toTimeString();
    const {text, user} = danmakuData;
    const userHtml = user
        ? `-用户【<a href="https://space.bilibili.com/${user.uid}"
            style="color: ${highlightInformationColor}"
            target="_blank">${user.name} Lv${user.level} uid=${user.uid}</a>】`
        : `-用户信息获取失败【uhash=${danmakuData.uhash ?? '未知'}】`;
    return `<b style="color: ${outputInformationFontColor};" gz_bezel>
${toTimeString}-根据${type}${matching ? `<b style="color: ${highlightInformationColor}">【${matching}】</b>` : ""}-屏蔽弹幕【${text}】${userHtml}
</b>`
}

export default {
    getLiveRoomCommentInfoHtml,
    getLiveRoomInfoHtml,
    getVideoDanmakuInfoHtml
}
