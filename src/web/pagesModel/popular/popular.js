import elUtil from "../../utils/elUtil.js";
import sFormatUtil from '../../utils/sFormatUtil.js'
import {eventEmitter} from "../../model/EventEmitter.js";
import video_shielding from "../../model/shielding/video_shielding.js";


const generalUrl=[
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
const isPopularHistory = (url) => {
    return url.includes("popular/history")
}

/**
 * 判断地址是否是热门页中的综合热门
 * @param url {string}
 */
const isPopularAllPage = (url) => {
    return url.includes("www.bilibili.com/v/popular/all");
}

/**
 * 判断url是否是热门周榜页面
 * @param url {string}
 */
const isPopularWeeklyPage = (url) => {
    return url.includes("www.bilibili.com/v/popular/weekly");
}


/**
 * 判断url是否是热门页中的排行榜的通用页面
 * @param url {string}
 */
const isGeneralPopularRank=(url)=>{
    return generalUrl.some(itemUrl => url.includes(itemUrl));
}

/**
 * 获取视频数据列表
 * @returns {Promise<[{}]>}
 */
const getVideoDataList = async () => {
    const elList = await elUtil.findElements(".rank-list>li")
    const list = [];
    for (let el of elList) {
        const title = el.querySelector(".title").textContent.trim();
        const userUrl = el.querySelector(".detail>a").href;
        const uid = elUtil.getUrlUID(userUrl);
        const name = el.querySelector(".up-name").textContent.trim();
        const detailStateEls = el.querySelectorAll('.detail-state>.data-box');
        let nPlayCount = detailStateEls[0].textContent.trim()
        nPlayCount = sFormatUtil.toPlayCountOrBulletChat(nPlayCount)
        let nBulletChat = detailStateEls[1].textContent.trim()
        nBulletChat = sFormatUtil.toPlayCountOrBulletChat(nBulletChat)
        const videoUrl = el.querySelector('.img>a')?.href || null;
        const bv = elUtil.getUrlBV(videoUrl);
        list.push({
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
        })
    }
    return list;
}



// 屏蔽排行榜中的视频
const startShieldingRankVideoList = async () => {
    const list = await getVideoDataList();
    for (let videoData of list) {
        if (video_shielding.shieldingVideoDecorated(videoData)) {
            continue;
        }
        eventEmitter.send('添加热门视频屏蔽按钮', {data: videoData, maskingFunc: startShieldingRankVideoList})
    }
}


export default {
    isPopularHistory,
    isPopularAllPage,
    isGeneralPopularRank,
    isPopularWeeklyPage,
    startShieldingRankVideoList,
}
