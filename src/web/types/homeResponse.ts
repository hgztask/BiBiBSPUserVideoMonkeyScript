/** 首页推荐响应中支持的业务卡片类型 */
export type HomeItemKind = 'ad' | 'video' | 'live' | 'release' | 'unknown';

/** 首页推荐响应中的基础视频数据 */
export interface HomeFeedVideoData {
    title: string;
    name: string;
    uid: number;
    bv: string;
    nDuration: number;
    nBulletChat: number;
    nPlayCount: number;
}

/** 首页推荐响应中的直播房间数据 */
export interface HomeFeedLiveData {
    title: string;
    name: string;
    uid: number;
    roomId: number | string;
    partition?: string;
}

/** 油猴沙箱与页面 world 之间传递的首页条目 */
export interface HomeFilterItem {
    index: number;
    kind: HomeItemKind;
    item: unknown;
    video?: HomeFeedVideoData;
    live?: HomeFeedLiveData;
    releaseType?: string;
}
