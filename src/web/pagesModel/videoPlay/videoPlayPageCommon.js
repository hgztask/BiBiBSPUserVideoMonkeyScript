import sFormatUtil from '../../utils/sFormatUtil.js'
import elUtil from "../../utils/elUtil.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import ruleUtil from "../../utils/ruleUtil.js";

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

const getRightVideoDataList = (elList) => {
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

// 获取视频页播放器下方的标签
const getVideoTags = () => {
    const el = document.body.querySelector('.video-tag-container')
    const vueData = el['__vue__'];
    const list = []
    for (const v of vueData['tagList']) {
        if (v['tag_type'] === "bgm") {
            continue;
        }
        list.push(v['tag_name']);
    }
    return list
}

/**
 * 插入选择标签屏蔽按钮
 * @returns {Promise<void>|null}
 */
const insertTagShieldButton = async () => {
    const el = await elUtil.findElement('.video-tag-container');
    const butEl = document.createElement('button');
    butEl.setAttribute('gz_type', '');
    butEl.textContent = '屏蔽标签';
    butEl.style.display = 'none';
    el.firstElementChild.appendChild(butEl);
    el.addEventListener('mouseout', () => butEl.style.display = 'none')
    el.addEventListener('mouseover', () => butEl.style.display = '');
    butEl.addEventListener('click', () => {
        const list = [];
        for (let tag of getVideoTags()) {
            list.push({label: tag, value: tag})
        }
        eventEmitter.send('sheet-dialog', {
            contents: ['默认精确类型，不包括bgm类型tag'],
            list, title: '选择标签',
            optionsClick({value}) {
                const res = ruleUtil.addRule(value, 'precise_videoTag');
                eventEmitter.send('el-notify', {
                    title: '添加精确标签操作提示',
                    message: res.res,
                    type: res.status ? 'success' : 'error'
                })
                res.status && eventEmitter.send('通知屏蔽')
            }
        });
    })
}

/**
 * 视频页通用函数
 * 目前适用于稍后再看播放页和收藏的视频播放页
 */
export default {getRightVideoDataList, insertTagShieldButton}
