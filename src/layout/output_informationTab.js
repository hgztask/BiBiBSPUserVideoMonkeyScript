import defUtil from "../utils/defUtil.js";
import localMKData from "../data/localMKData.js";

// 输出信息字体颜色
const outputInformationFontColor = localMKData.getOutputInformationFontColor();
// 高亮信息字体颜色
const highlightInformationColor = localMKData.getHighlightInformationColor();


/**
 *
 * @param type {string} 屏蔽的类型
 * @param matching {string|number|null}
 * @param commentData {{}} 直播评论数据
 * @returns string
 */
const getLiveRoomCommentInfoHtml = (type, matching, commentData) => {
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


/**
 * 获取动态html格式化排版信息
 * @param type {string} 屏蔽的类型
 * @param matching {string|number|null}
 * @param dynamicData {{}} 动态数据
 * @returns string
 */
const getDynamicContentInfoHtml = (type, matching, dynamicData) => {
    const toTimeString = defUtil.toTimeString();
    const {name, uid, content} = dynamicData;
    return `<b style="color: ${outputInformationFontColor}; " gz_bezel>
${toTimeString}-根据${type}-${matching ? `<b style="color: ${highlightInformationColor}">【${matching}】</b>` : ""}-屏蔽用户【${name}】uid=
            <a href="https://space.bilibili.com/${uid}" 
            style="color: ${highlightInformationColor}"
            target="_blank">【${uid}】</a>
            动态【${content}】
            </b>`
}

/**
 * 获取直播间房间html格式化排版信息
 * @param type {string} 屏蔽类型
 * @param matching {string|number|null} 屏蔽的值
 * @param liveRoomData {{}} 直播间数据
 * @returns string
 */
const getLiveRoomInfoHtml = (type, matching, liveRoomData) => {
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


export default {
    getLiveRoomCommentInfoHtml,
    getDynamicContentInfoHtml,
    getLiveRoomInfoHtml
}
