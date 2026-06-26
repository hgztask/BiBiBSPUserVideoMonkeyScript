import elUtil from "../../core/util/elUtil.ts";
import strFormatUtil from '../../core/util/strFormatUtil.ts'
import {eventEmitter} from "../../core/EventEmitter.ts";
import video_shielding from "../../domain/shielding/video.ts";
import urlUtil from "../../core/util/urlUtil.ts";


const generalUrl = [
    "popular/rank/all",
    "popular/rank/douga",
    "popular/rank/music",
    "popular/rank/dance",
    "popular/rank/game",
    "popular/rank/knowledge",
    "popular/rank/tech",
    "popular/rank/sports",
    "popular/rank/car",
    "popular/rank/life",
    "popular/rank/food",
    "popular/rank/animal",
    "popular/rank/kichiku",
    "popular/rank/fashion",
    "popular/rank/ent",
    "popular/rank/cinephile",
    "popular/rank/origin",
    "popular/rank/rookie"
];


/**
 * 判断是否为入站必刷页面
 * @param url {string}
 */
const isPopularHistory = (url: any) => {
    return url.includes("popular/history")
}

/**
 * 判断地址是否是热门页中的综合热门
 * @param url {string}
 */
const isPopularAllPage = (url: any) => {
    return url.includes("www.bilibili.com/v/popular/all");
}

/**
 * 判断url是否是热门周榜页面
 * @param url {string}
 */
const isPopularWeeklyPage = (url: any) => {
    return url.includes("www.bilibili.com/v/popular/weekly");
}


/**
 * 判断url是否是热门页中的排行榜的通用页面
 * @param url {string}
 */
const isGeneralPopularRank = (url: any) => {
    return generalUrl.some(itemUrl => url.includes(itemUrl));
}

/**
 * 获取视频数据列表
 * @returns {Promise<[{}]>}
 */
const getVideoDataList = async () => {
    const elList = await elUtil.findElements(".rank-list>li")
    const list: any[] = [];
    for (let el of elList) {
        const titleEl = el.querySelector(".title");
        if (!titleEl) continue;
        const title = titleEl.textContent?.trim() ?? '';

        const detailLinkEl = el.querySelector(".detail>a");
        if (!detailLinkEl) continue;
        const userUrl = detailLinkEl.href;

        const uid = urlUtil.getUrlUID(userUrl ?? '');

        const upNameEl = el.querySelector(".up-name");
        if (!upNameEl) continue;
        const name = upNameEl.textContent?.trim() ?? '';

        const detailStateEls = el.querySelectorAll('.detail-state>.data-box');
        let nPlayCount: any = detailStateEls[0].textContent?.trim() ?? ''
        nPlayCount = strFormatUtil.toPlayCountOrBulletChat(nPlayCount)
        let nBulletChat: any = detailStateEls[1].textContent?.trim() ?? ''
        nBulletChat = strFormatUtil.toPlayCountOrBulletChat(nBulletChat)
        const videoUrl = el.querySelector('.img>a')?.href ?? '';
        const bv = urlUtil.getUrlBV(videoUrl);
        const data: Record<string, any> = {
            title,
            userUrl,
            uid,
            name,
            videoUrl,
            bv,
            nPlayCount,
            nBulletChat,
            nDuration: -1,
            el,
            insertionPositionEl: el.querySelector(".detail-state"),
            explicitSubjectEl: el.querySelector(".info")
        };
        const otherVideosSelectEl = el.querySelector('.more-data.van-popover__reference');
        if (otherVideosSelectEl) {
            data.cssMap = {'bottom': '44px'};
        }
        list.push(data)
    }
    return list;
}


// 屏蔽排行榜中的视频
const startShieldingRankVideoList = async () => {
    const list = await getVideoDataList();
    for (let videoData of list) {
        video_shielding.shieldingVideoDecorated(videoData).catch(() => {
            eventEmitter.send('添加热门视频屏蔽按钮', {data: videoData, maskingFunc: startShieldingRankVideoList})
        })
    }
}


export default {
    isPopularHistory,
    isPopularAllPage,
    isGeneralPopularRank,
    isPopularWeeklyPage,
    startShieldingRankVideoList,
}
