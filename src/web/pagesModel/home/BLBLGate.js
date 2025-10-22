import elUtil from "../../utils/elUtil.js";
import globalValue from "../../data/globalValue.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import defUtil from "../../utils/defUtil.js";
import video_shielding from "../../model/shielding/video_shielding.js";
import {bGateClearListNonVideoGm} from "../../data/localMKData.js";

/**
 * 获取Bilibili-Gate脚本下的首页其脚本自带的激活的选项卡
 * @returns {Promise<string>}
 */
const getGateActivatedTab = async () => {
    const el = await elUtil.findElement(".ant-radio-group>.ant-radio-button-wrapper-checked")
    return el?.textContent.trim();
}


/**
 * 检查页面的 bilibili-gate 兼容性
 * @returns {null|Promise<any>}
 */
const check_bilibili_gate_compatibility = async () => {
    const el = await elUtil.findElement('.bilibili-gate-root', {interval: 300, timeout: 5000})
    if (el) {
        if (!globalValue.adaptationBAppCommerce) {
            eventEmitter.send('el-alert', "检测到使用bilibili_gate脚本但未开启兼容选项，需要启用相关兼容选项才可正常使用");
        } else {
            eventEmitter.send('el-notify', {
                title: "tip",
                message: '启用兼容bilibili-gate脚本'
            })
        }
        return
    }
    if (globalValue.adaptationBAppCommerce) {
        eventEmitter.send('el-alert', "检测到未使用bilibili_gate脚本却开启了兼容选项，请关闭兼容选项或启用bilibili_gate脚本后再启用相关兼容选项");
    }
}

const bGateClearListNonVideoV = bGateClearListNonVideoGm();

/**
 * 获取Bilibili-Gate脚本下的首页视频列表
 * @returns {Promise<[{}]>}
 */
const getGateDataList = async () => {
    const elList = await elUtil.findElements(".bilibili-gate-video-grid>[data-bvid].bili-video-card")
    const list = [];
    for (let el of elList) {
        //红色标签，非视频类，如纪录片
        const redTag = el.querySelector(".css-1atx64h");
        if (redTag && bGateClearListNonVideoV) {
            el.remove();
            continue;
        }
        if (redTag) continue;
        const tempData = homeCommon.getVideoData(el)
        const videoUrl = el.querySelector("a.css-feo88y")?.href;
        const bv = elUtil.getUrlBV(videoUrl)
        const insertionPositionEl = el.querySelector(".bili-video-card__info--owner");
        list.push({
            ...tempData, ...{
                videoUrl,
                el,
                bv,
                insertionPositionEl,
                explicitSubjectEl: el
            }
        })
    }
    return list;
}


const startShieldingGateVideoList = async () => {
    const list = await getGateDataList()
    for (let videoData of list) {
        video_shielding.shieldingVideoDecorated(videoData, "hide").catch(() => {
            eventEmitter.send('视频添加屏蔽按钮', {data: videoData, maskingFunc: startShieldingGateVideoList})
        })
    }
}

/**
 * 每秒检测是否需要屏蔽首页中视频列表(适配BAppcommerce脚本)
 */
const startIntervalShieldingGateVideoList = () => {
    const throttle = defUtil.throttle(startShieldingGateVideoList, 2000);
    setInterval(async () => {
        await getGateActivatedTab();
        throttle();
    }, 1500);
}


export default {
    check_bilibili_gate_compatibility,
    startIntervalShieldingGateVideoList
}
