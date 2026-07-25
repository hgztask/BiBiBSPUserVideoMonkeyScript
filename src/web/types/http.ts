/** 弹幕屏蔽规则，type为0文本、1正则、2屏蔽用户 */
export interface BarrageRule {
    /** 规则类型：0文本、1正则、2屏蔽用户 */
    type: number
    /** 屏蔽词内容 */
    filter: string
    /** 创建时间戳 */
    ctime: number
}

/** 弹幕屏蔽词获取结果 */
export interface BarrageBlockingResult {
    /** 请求是否成功 */
    state: boolean
    /** 原始响应数据 */
    data?: any
    /** 过滤后的屏蔽规则列表 */
    list?: BarrageRule[]
    /** 响应消息 */
    msg: string
}

/** 关注信息获取结果 */
export interface AttentionResult {
    /** 请求是否成功 */
    state: boolean
    /** 关注关系数据 */
    data?: any
    /** 响应消息 */
    msg: string
    /** 错误信息 */
    error?: any
}

/** 视频统计数据（播放、弹幕、评论、收藏、投币、分享、点赞） */
export interface VideoStat {
    /** 播放数 */
    view: number
    /** 弹幕数 */
    danmaku: number
    /** 评论数 */
    reply: number
    /** 收藏数 */
    favorite: number
    /** 投币数 */
    coin: number
    /** 分享数 */
    share: number
    /** 点赞数 */
    like: number
}

/** B站API返回的视频信息 */
export interface VideoInfo {
    /** 合作成员列表，非合作视频没有此项 */
    staff?: any[]
    /** 子分区名称 */
    tname: string
    /** 子分区名称v2 */
    tname_v2: string
    /** 视频简介 */
    desc: string
    /** 发布时间 */
    pubdate: number
    /** 用户投稿时间 */
    ctime: number
    /** 版权类型，1原创2转载 */
    copyright: number
    /** 是否为充电专属视频 */
    is_upower_exclusive: boolean
    /** 视频时长（秒） */
    duration: number
    /** 播放数 */
    view: number
    /** 弹幕数 */
    danmaku: number
    /** 评论数 */
    reply: number
    /** 收藏数 */
    favorite: number
    /** 投币数 */
    coin: number
    /** 分享数 */
    share: number
    /** 分词信息 */
    participle: any
    /** 视频分辨率 */
    dimension: any
    /** 点赞数 */
    like: number
    /** 争议警告消息 */
    argue_msg: string
}

/** B站API返回的用户信息 */
export interface UserInfo {
    /** 粉丝数 */
    follower: number
    /** 关注数 */
    friend: number
    /** 获赞数 */
    like_num: number
    /** 投稿视频数量 */
    archive_count: number
    /** 专栏数量 */
    article_count: number
    /** 认证信息对象 */
    Official: any
    /** 是否有认证 */
    official_verify: any
    /** 会员信息对象 */
    vip: any
    /** 用户uid */
    uid: number
    /** 用户名称 */
    name: string
    /** 性别 */
    sex: string
    /** 当前等级 */
    current_level: number
    /** 头像挂件信息对象 */
    pendant: any
    /** 勋章信息对象 */
    nameplate: any
    /** 是否关注此用户 */
    following: boolean
    /** 用户签名 */
    sign: string
    /** 是否为硬核会员 */
    is_senior_member: boolean
}

/** B站视频信息API返回的完整结果，包含视频详情、用户信息和标签 */
export interface FetchVideoInfoResult {
    /** 请求是否成功 */
    state: boolean
    /** 响应消息 */
    msg: string
    /** 视频完整数据 */
    data?: {
        /** 视频详情 */
        videoInfo: VideoInfo
        /** 用户详情 */
        userInfo: UserInfo
        /** 视频标签列表 */
        tags: string[]
    }
}

/** 视频评论输入框描述结果 */
export interface ReplyBoxResult {
    /** 请求是否成功 */
    state: boolean
    /** 响应消息 */
    message: string
    /** 输入框提示文本，如"关注7天以上可评论"等 */
    childText?: string
    /** 评论是否被禁用 */
    disabled?: boolean
    /** 异常错误信息 */
    e?: any
}
