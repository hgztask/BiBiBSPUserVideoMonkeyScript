import type { BlockResult } from "./shielding"

/** 页面中提取的视频基本数据，用于快速同步屏蔽检查 */
export interface VideoData {
    /** 视频标题 */
    title: string;
    /** up主uid */
    uid?: number;
    /** up主名称 */
    name: string;
    /** 视频时长 */
    nDuration?: number;
    /** 弹幕数 */
    nBulletChat?: number;
    /** 播放量 */
    nPlayCount?: number;
    /** 视频BV号 */
    bv?: string | null;
    /** 视频对应的DOM元素 */
    el: HTMLElement;

    [key: string]: any;
}

/** 通过API请求获取的视频详细信息结果，用于屏蔽链异步检查 */
export interface VideoShieldData {
    /** 视频标签列表 */
    tags: string[];
    /** 用户信息 */
    userInfo: {
        /** 用户uid */
        uid: number;
        /** 用户名称 */
        name: string;
        /** 粉丝数 */
        follower: number;
        /** 是否硬核会员 */
        is_senior_member: boolean;
        /** 创作团队成员id */
        mid?: any;
        /** 当前等级 */
        current_level?: number;
        /** 性别 */
        sex?: string;
        /** 会员信息 */
        vip?: any;
        /** 投稿视频数量 */
        archive_count?: number;
        /** 头像挂件信息 */
        pendant?: any;
        /** 用户签名 */
        sign?: string;
        /** 是否已关注该用户 */
        following?: boolean;
        [key: string]: any;
    };
    /** 视频信息 */
    videoInfo: {
        /** 视频分辨率 */
        dimension?: any;
        /** 版权类型，1原创2转载 */
        copyright?: number;
        /** 是否充电专属视频 */
        is_upower_exclusive?: boolean;
        /** 是否已关注该UP主 */
        following?: boolean;
        /** 点赞数 */
        like: number;
        /** 播放数 */
        view: number;
        /** 弹幕数 */
        danmaku: number;
        /** 评论数 */
        reply: number;
        /** 收藏数 */
        favorite: number;
        /** 投币数 */
        coin: number;
        /** 分享数 */
        share: number;
        /** 发布时间戳 */
        pubdate?: number;
        /** 视频简介 */
        desc?: string;
        /** 争议警告消息 */
        argue_msg?: string;
        [key: string]: any;
    };

    [key: string]: any;
}

/** 屏蔽视频元素事件数据 */
export interface ShieldVideoEventData {
    /** 屏蔽检查结果 */
    res: BlockResult;
    /** 屏蔽方式，remove或hide */
    method: string;
    /** 视频基本数据 */
    videoData: VideoData;
}
