import elUtil from "../../core/util/elUtil.ts";
import defUtil from "../../core/util/defUtil.ts";
import strFormatUtil from '../../core/util/strFormatUtil.ts'
import {eventEmitter} from "../../core/EventEmitter.ts";
import video_shielding from "../../domain/shielding/video.ts";
import globalValue from "../../config/globalValue.ts";
import {
    getHomeFeedLoadAttemptsGm,
    getReleaseTypeCardsGm,
    isHideCarouselImageGm,
    isHideHomeTopHeaderBannerImageGm,
    isHideHomeTopHeaderChannelGm
} from "../../state/localMKData.ts";
import urlUtil from "../../core/util/urlUtil.ts";
import cssManager from "../../domain/cssManager.ts";

interface VideoData {
    title: string;
    name: string;
    el: HTMLElement;
    uid?: number;
    nDuration?: number;
    nBulletChat?: number;
    nPlayCount?: number;
    bv?: string | null;
    videoUrl?: string;
    userUrl?: string;
    insertionPositionEl?: Element | null;
    explicitSubjectEl?: Element | null;

    [key: string]: any;
}

// 判断是否是首页
const isHome = (url: any, title: any) => {
    if (title !== "哔哩哔哩 (゜-゜)つロ 干杯~-bilibili") {
        return false
    }
    if (url === 'https://www.bilibili.com/') {
        return true
    }
    return url.includes('https://www.bilibili.com/?spm_id_from=')
}

// 删除下载提示
const deDesktopDownloadTipEl = async () => {
    const el = await elUtil.findElement(".desktop-download-tip")
    el?.remove();
    const log = "已删除下载提示";
    console.log(log, el);
}

// 隐藏首页轮播图
const hideHomeCarouselImage = (hide: any, immediately: any = false) => {
    const selector = '.container.is-version8>.recommended-swipe';
    if (immediately) {
        try {
            const el = document.body.querySelector(selector);
            if (el) {
                el.style.display = hide ? 'none' : '';
            }
        } catch (e) {
            console.log("隐藏首页轮播图失败", e)
        }
        return
    }
    elUtil.findElement(selector).then(el => {
        if (el) {
            el.style.display = hide ? 'none' : '';
        }
    })
}

//隐藏首页顶部标题横幅图片
const hideHomeTopHeaderBannerImage = (hide: any) => {
    elUtil.findElement('.bili-header__banner').then(el => {
        if (!el) return;
        if (hide) {
            el.style.cssText = `
                visibility: hidden;
                height: 0 !important;
                min-height: 45px !important;
            `;
        } else {
            el.style.cssText = `
                visibility: visible;
                height: auto!important;
                min-height: 155px;
            `;
        }
    })
}

/**
 * 获取视频数据
 * @param el
 * @returns {{title, userUrl, name, uid, videoUrl, nPlayCount, nBulletChat, nDuration}}
 */
const getVideoData = (el: any) => {
    const title = el.querySelector(".bili-video-card__info--tit").title;
    const name = el.querySelector(".bili-video-card__info--author").textContent.trim();
    let nPlayCount: any = el.querySelector('.bili-video-card__stats--text')?.textContent.trim()
    nPlayCount = strFormatUtil.toPlayCountOrBulletChat(nPlayCount)
    let nBulletChat: any = el.querySelector('.bili-video-card__stats--text')?.textContent.trim()
    nBulletChat = strFormatUtil.toPlayCountOrBulletChat(nBulletChat)
    let nDuration: any = el.querySelector('.bili-video-card__stats__duration')?.textContent.trim()
    nDuration = strFormatUtil.timeStringToSeconds(nDuration)
    const userUrl = el.querySelector(".bili-video-card__info--owner").getAttribute("href");
    const uid = urlUtil.getUrlUID(userUrl);
    return {
        title,
        name,
        uid,
        nPlayCount,
        nBulletChat,
        nDuration,
        userUrl
    }
}

//首页中的视频列表，包括换一换中的视频列表
const getHomeVideoELList = async (): Promise<VideoData[]> => {
    const elList = await elUtil.findElements(".container.is-version8>.feed-card,.container.is-version8>.bili-feed-card");
    const list: VideoData[] = [];
    for (const el of elList) {
        try {
            const tempData = getVideoData(el);
            const {userUrl} = tempData
            //过滤非视频内容
            if (!userUrl.includes("//space.bilibili.com/")) {
                el?.remove();
                const log = "遍历换一换视频列表下面列表时检测到异常内容，已将该元素移除";
                eventEmitter.send('打印信息', log)
                console.log(log, el);
                continue;
            }

            const videoUrl = el.querySelector(".bili-video-card__info--tit>a")?.href
            const items: VideoData = {
                ...tempData,
                videoUrl,
                el,
                insertionPositionEl: el.querySelector(".bili-video-card__info--bottom"),
                explicitSubjectEl: el.querySelector(".bili-video-card__info")
            };
            if (videoUrl?.includes('www.bilibili.com/video')) {
                items.bv = urlUtil.getUrlBV(videoUrl)
            }

            list.push(items)
        } catch (e) {
            el?.remove();
            console.log("遍历视频列表中检测到异常内容，已将该元素移除;");
        }
    }
    return list;
}

/**
 * 检测清理首页中视频列表里多余的内容，如直播，番剧推荐等
 */
const startClearExcessContentList = () => {
    //如果开启适配BAppcommerce脚本，则不执行此功能
    if (globalValue.adaptationBAppCommerce) return;
    //右侧小卡片和大卡片的广告
    document.querySelectorAll('.adcard,.fixed-card').forEach(el => el.remove());
    const releaseTypeCards = getReleaseTypeCardsGm();
    for (let el of document.querySelectorAll(".floor-single-card")) {
        const badgeEl = el.querySelector('.cover-container .badge>.floor-title');
        if (badgeEl === null) {
            continue;
        }
        const badge = badgeEl.textContent.trim()
        if (releaseTypeCards.includes(badge)) {
            continue;
        }
        el?.remove();
        console.log(`已清除视频列表中的${badge}类卡片`, el)
    }
}


//开始屏蔽首页中的视频列表
const startShieldingHomeVideoList = async () => {
    const homeVideoELList = await getHomeVideoELList();
    for (const videoData of homeVideoELList) {
        video_shielding.shieldingVideoDecorated(videoData).catch(() => {
            eventEmitter.send('视频添加屏蔽按钮', {data: videoData, maskingFunc: startShieldingHomeVideoList})
        })
    }
    startClearExcessContentList()
}

//屏蔽首页中换一换下面的视频列表的防抖
const startDebounceShieldingHomeVideoList: Function = defUtil.debounce(startShieldingHomeVideoList, 300);

/**
 * 获取首页视频列表的加载状态
 */
interface HomeFeedLoadState {
    realCardCount: number;
    skeletonCount: number;
    visibleSkeletonCount: number;
    listBottom: number;
    viewportBottom: number;
}

const getHomeFeedLoadState = (): HomeFeedLoadState | null => {
    const list = document.querySelector('.container.is-version8') as HTMLElement | null;
    if (!list) return null;
    const cards = [...list.querySelectorAll(':scope>div')];
    const realCardCount = cards.filter(el =>
        el.classList.contains('feed-card') || el.classList.contains('bili-feed-card')
    ).length;
    const skeletons = cards.flatMap(el =>
        [...el.querySelectorAll('.bili-video-card__skeleton')]
    );
    const viewportBottom = window.innerHeight;
    const visibleSkeletonCount = skeletons.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.height > 0 && rect.top < viewportBottom + 160 && rect.bottom > 0;
    }).length;
    return {
        realCardCount,
        skeletonCount: skeletons.length,
        visibleSkeletonCount,
        listBottom: list.getBoundingClientRect().bottom,
        viewportBottom,
    };
};

const isHomeFeedUnderfilled = (state: HomeFeedLoadState | null): boolean => {
    if (!state) return false;
    return state.visibleSkeletonCount > 0 ||
        (state.realCardCount > 0 && state.listBottom <= state.viewportBottom + 160);
};

const hasHomeFeedProgressed = (before: HomeFeedLoadState, after: HomeFeedLoadState): boolean => {
    return after.realCardCount > before.realCardCount ||
        after.skeletonCount < before.skeletonCount ||
        after.visibleSkeletonCount !== before.visibleSkeletonCount ||
        after.listBottom !== before.listBottom;
};

/**
 * 在同一任务中触发首页原生滚动检查，再立即恢复用户位置。
 * 页面自身的 scroll 监听会在恢复前看到底部位置，但浏览器来不及绘制中间位置。
 */
const triggerHomeNativeLoad = (): void => {
    const originalScrollY = window.scrollY;
    const previousMinHeight = document.body.style.minHeight;
    const minimumHeight = `${Math.max(document.body.scrollHeight, window.innerHeight + 200)}px`;
    document.body.style.minHeight = minimumHeight;
    window.scrollTo({top: document.body.scrollHeight, behavior: 'auto'});
    window.dispatchEvent(new Event('scroll'));
    window.scrollTo({top: originalScrollY, behavior: 'auto'});
    window.setTimeout(() => {
        document.body.style.minHeight = previousMinHeight;
    }, 100);
};

const waitForHomeFeedProgress = async (before: HomeFeedLoadState): Promise<HomeFeedLoadState | null> => {
    const deadline = Date.now() + 3500;
    while (Date.now() < deadline) {
        await defUtil.wait(150);
        const current = getHomeFeedLoadState();
        if (current && hasHomeFeedProgressed(before, current)) {
            return current;
        }
    }
    return getHomeFeedLoadState();
};

let homeFeedLoadRecoveryStarted = false;

/**
 * 处理屏蔽后首页列表高度不足的问题，不改变用户滚动位置，也不制造假骨架卡片。
 */
const startHomeFeedLoadRecovery = (): void => {
    if (homeFeedLoadRecoveryStarted || globalValue.adaptationBAppCommerce || globalValue.compatibleBEWLYBEWLY) return;
    const maxAttempts = getHomeFeedLoadAttemptsGm();
    if (maxAttempts <= 0) return;
    homeFeedLoadRecoveryStarted = true;

    let running = false;
    let attempts = 0;
    let scheduled = false;
    const schedule = (): void => {
        if (scheduled) return;
        scheduled = true;
        window.setTimeout(() => {
            scheduled = false;
            void recover();
        }, 120);
    };
    const recover = async (): Promise<void> => {
        if (running) return;
        const before = getHomeFeedLoadState();
        if (!isHomeFeedUnderfilled(before)) {
            attempts = 0;
            return;
        }
        if (attempts >= maxAttempts) return;
        running = true;
        attempts += 1;
        triggerHomeNativeLoad();
        const after = await waitForHomeFeedProgress(before as HomeFeedLoadState);
        running = false;
        if (!after || !hasHomeFeedProgressed(before as HomeFeedLoadState, after)) return;
        if (isHomeFeedUnderfilled(after)) {
            schedule();
        } else {
            attempts = 0;
        }
    };

    const observer = new MutationObserver(schedule);
    // 首页列表可能在首次路由执行后才挂载，监听 body 可以覆盖列表首次出现和后续替换。
    observer.observe(document.body, {childList: true, subtree: true});
    window.addEventListener('scroll', schedule, {passive: true});
    schedule();
};


const run = () => {
    deDesktopDownloadTipEl();
    if (isHideCarouselImageGm()) {
        hideHomeCarouselImage(true);
    }
    if (isHideHomeTopHeaderBannerImageGm()) {
        hideHomeTopHeaderBannerImage(true)
    }
    if (isHideHomeTopHeaderChannelGm()) {
        cssManager.hideHomeTopHeaderChannel(true)
    }
    GM_addStyle(`
    .recommended-container_floor-aside .container>*:nth-of-type(7) {
  /* 这里值改成auto，该视频选项卡对其其他视频*/
  /* 原先是0，会导致该视频对不齐其他视频选项卡*/
    margin-top: auto !important;
}
/*原先值为40px,该css声明样式会导致前几个高度异常，效果同上*/
@media (min-width: 1560px) and (max-width: 2059.9px) {
    .recommended-container_floor-aside .container>*:nth-of-type(n + 8) {
        margin-top: auto !important;
    }
}
    `);
    GM_deleteValue('is_automatic_scrolling_gm');
    if (!(globalValue.adaptationBAppCommerce || globalValue.compatibleBEWLYBEWLY)) {
        window.setTimeout(startHomeFeedLoadRecovery, 1400);
    }
}

//b站首页相关辅助逻辑
export default {
    isHome,
    startDebounceShieldingHomeVideoList,
    getVideoData,
    hideHomeCarouselImage,
    hideHomeTopHeaderBannerImage,
    run
}
