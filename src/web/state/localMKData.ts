import type {
    TimeRangeMaskingItem,
    ExcludeURLItem,
    GloryLevelMappingItem,
    GloryLevelLimitItem,
    FansLevelLimitItem,
    CombinationRuleItem,
    CombinationRuleListItem,
} from "@/types/storage";

/** 设置面板边框颜色 */
const setBorderColor = (color: string): void => {
    GM_setValue("borderColor", color)
}

const defBorderColor: string = "rgb(0, 243, 255)"

/** 获取面板边框颜色，默认 rgb(0, 243, 255) */
const getBorderColor = (): string => {
    return GM_getValue("borderColor", defBorderColor)
}

/** 设置输出信息字体颜色 */
const setOutputInformationFontColor = (color: string): void => {
    GM_setValue("output_information_font_color", color)
}

const defOutputInformationFontColor: string = "rgb(119,128,248)"

/** 获取输出信息字体颜色，默认 rgb(119,128,248) */
const getOutputInformationFontColor = (): string => {
    return GM_getValue("output_information_font_color", defOutputInformationFontColor)
}

/** 设置高亮信息颜色 */
const setHighlightInformationColor = (color: string): void => {
    GM_setValue("highlight_information_color", color)
}

const defHighlightInformationColor: string = "rgb(234, 93, 93)"

/** 获取高亮信息颜色，默认 rgb(234, 93, 93) */
const getHighlightInformationColor = (): string => {
    return GM_getValue("highlight_information_color", defHighlightInformationColor)
}

/** 设置配置默认颜色（边框、输出字体、高亮信息） */
const setDefaultColorInfo = (): void => {
    setBorderColor(defBorderColor)
    setOutputInformationFontColor(defOutputInformationFontColor)
    setHighlightInformationColor(defHighlightInformationColor)
}

/** 获取是否只对首页屏蔽 */
const getBOnlyTheHomepageIsBlocked = (): boolean => {
    return GM_getValue("bOnlyTheHomepageIsBlocked", false)
}

/** 获取是否适配Bilibili-Gate脚本（原bilibili-app-recommend脚本） */
const getAdaptationBAppCommerce = (): boolean => {
    return GM_getValue<boolean>("adaptation-b-app-recommend", false) === true
}

/** 是否显示右上角主面板按钮开关，默认true */
const isShowRightTopMainButSwitch = (): boolean => {
    return GM_getValue<boolean>("showRightTopMainButSwitch", true) === true
}

/** 是否第一次完整显示外部开关主面板按钮 */
const isFirstFullDisplay = (): boolean => {
    return GM_getValue<boolean>('isFirstFullDisplay', true) === true
}

/** 是否初次显示后间隔半隐藏主面板开关按钮，默认true */
const isHalfHiddenIntervalAfterInitialDisplay = (): boolean => {
    return GM_getValue<boolean>('is_half_hidden_interval_after_initial_display', true) === true
}

/** 获取是否兼容BewlyBewly插件 */
const isCompatible_BEWLY_BEWLY = (): boolean => {
    return GM_getValue<boolean>("compatible_BEWLY_BEWLY", false) === true
}

/** 是否弃用旧版评论区处理 */
const isDiscardOldCommentAreas = (): boolean => {
    return GM_getValue<boolean>("discardOldCommentAreas", true) === true
}

/** 是否移除播放器页面右侧推荐列表 */
const isDelPlayerPageRightVideoList = (): boolean => {
    return GM_getValue<boolean>("isDelPlayerPageRightVideoList", false) === true
}

/** 是否模糊和正则匹配词转小写 */
const bFuzzyAndRegularMatchingWordsToLowercase = (): boolean => {
    return GM_getValue("bFuzzyAndRegularMatchingWordsToLowercase", false)
}

/** 获取请求频率，默认0.2秒 */
export const getRequestFrequencyVal = (): number => {
    return GM_getValue("requestFrequencyVal", 0.2)
}

/** 禁用根据bv号网络请求获取视频信息 */
const isDisableNetRequestsBvVideoInfo = (): boolean => {
    return GM_getValue('isDisableNetRequestsBvVideoInfo', false)
}

/** 是否屏蔽已关注UP主的视频 */
const isBlockFollowed = (): boolean => {
    return GM_getValue('blockFollowed', false)
}

/** 是否屏蔽充电专属视频 */
const isUpOwnerExclusive = (): boolean => {
    return GM_getValue('is_up_owner_exclusive', false)
}

/** 性别屏蔽选项值，男、女、保密、不处理 */
const isGenderRadioVal = (): string => {
    return GM_getValue('genderRadioVal', '不处理')
}

/** 会员类型屏蔽选项值，无、月大会员、年度及以上大会员、不处理 */
const isVipTypeRadioVal = (): string => {
    return GM_getValue('vipTypeRadioVal', '不处理')
}

/** 是否屏蔽硬核会员 */
const isSeniorMember = (): boolean => {
    return GM_getValue('is_senior_member', false)
}

/** 视频类型屏蔽选项值，原创、转载、不处理 */
const isCopyrightRadio = (): string => {
    return GM_getValue('copyrightRadioVal', '不处理')
}

/** 是否移除底部评论区 */
const isDelBottomComment = (): boolean => {
    return GM_getValue('isDelBottomComment', false)
}

/** 是否屏蔽竖屏视频 */
const isBlockVerticalVideo = (): boolean => {
    return GM_getValue('blockVerticalVideo', false)
}

/** 是否检查视频创作团队中成员 */
const isCheckTeamMember = (): boolean => {
    return GM_getValue('checkTeamMember', false)
}

/** 获取视频点赞率屏蔽阈值，默认0.05(5%) */
const getVideoLikeRate = (): number => {
    return GM_getValue('video_like_rate', 0.05)
}

/** 是否启用视频点赞率屏蔽 */
const isVideoLikeRateBlockingStatus = (): boolean => {
    return GM_getValue('video_like_rate_blocking_status', false)
}

/** 是否启用视频投币/点赞比（内容价值）屏蔽 */
const isCoinLikesRatioRateBlockingStatus = (): boolean => {
    return GM_getValue('coin_likes_ratio_rate_blocking_status', false)
}

/** 获取视频投币/点赞比（内容价值）屏蔽阈值，默认0.05(5%) */
const getCoinLikesRatioRate = (): number => {
    return GM_getValue('coin_likes_ratio_rate', 0.05)
}

/** 是否禁用视频投币/点赞比（内容价值）屏蔽 */
const isCoinLikesRatioRateDisabled = (): boolean => {
    return GM_getValue('coin_likes_ratio_rate_blocking_status', false)
}

/** 是否启用互动率屏蔽 */
const isInteractiveRateBlockingStatus = (): boolean => {
    return GM_getValue('interactive_rate_blocking_status', false)
}

/** 获取互动率屏蔽阈值，默认0.05(5%) */
const getInteractiveRate = (): number => {
    return GM_getValue('interactive_rate', 0.05)
}

/** 是否启用视频三连率屏蔽 */
const isTripleRateBlockingStatus = (): boolean => {
    return GM_getValue('triple_rate_blocking_status', false)
}

/** 获取视频三连率屏蔽阈值，默认0.05(5%) */
const getTripleRate = (): number => {
    return GM_getValue('triple_rate', 0.05)
}

/** 获取uid范围屏蔽数组 [min, max] */
const getUidRangeMasking = (): number[] => {
    return GM_getValue('uid_range_masking', [0, 100])
}

/** 是否启用uid范围屏蔽 */
const isUidRangeMaskingStatus = (): boolean => {
    return GM_getValue('uid_range_masking_status', false)
}

/** 是否启用时间范围屏蔽 */
const isTimeRangeMaskingStatus = (): boolean => {
    return GM_getValue('time_range_masking_status', false)
}

/** 获取时间范围屏蔽数组，r中为13位毫秒级时间戳起止范围 */
const getTimeRangeMaskingArr = (): TimeRangeMaskingItem[] => {
    return GM_getValue('time_range_masking', [])
}

/** 是否屏蔽播放完推荐层 */
const isDelPlayerEndingPanel = (): boolean => {
    return GM_getValue('is_del_player_ending_panel', false)
}

/** localhost页面自动打开调试面板 */
export const isLocalhostPageAutomaticallyOpenTheMainPanelGm = (): boolean => {
    return GM_getValue("is_localhost_page_automatically_open_the_main_panel_gm", false)
}

/** 获取评论字数限制，默认-1不限制 */
const getCommentWordLimitVal = (): number => {
    return GM_getValue('comment_word_limit', -1)
}

/** 获取替换词数组 */
export const getSubstituteWordsArr = (): string[] => {
    return GM_getValue('substitute_words', [])
}

/** 是否清除评论表情 */
export const isClearCommentEmoticons = (): boolean => {
    return GM_getValue('is_clear_comment_emoticons', false)
}

/** 是否替换评论搜索词 */
export const isReplaceCommentSearchTerms = (): boolean => {
    return GM_getValue('is_replace_comment_search_terms', false)
}

/** 是否开启替换处理功能 */
export const enableReplacementProcessing = (): boolean => {
    return GM_getValue('enable_replacement_processing', false)
}

/** 是否仅生效UID屏蔽（限视频） */
export const isEffectiveUIDShieldingOnlyVideo = (): boolean => {
    return GM_getValue('is_effective_uid_shielding_only_video', false)
}

/** 仅看硬核会员（level=7保留，其他屏蔽） */
export const isSeniorMemberOnly = (): boolean => {
    return GM_getValue('is_senior_member_only', false)
}

/** 是否启用排除URL总开关 */
export const isExcludeURLSwitchGm = (): boolean => {
    return GM_getValue('is_exclude_url_switch_gm', false)
}

/** 获取排除URL列表，regularURL为正则表达式字符串 */
export const getExcludeURLsGm = (): ExcludeURLItem[] => {
    return GM_getValue('exclude_urls_gm', [])
}

/** 是否隐藏顶部搜索框热搜面板 */
export const isHideHotSearchesPanelGm = (): boolean => {
    return GM_getValue('is_hide_hot_searches_panel_gm', false)
}

/** 是否隐藏顶部搜索框历史记录面板 */
export const isHideSearchHistoryPanelGm = (): boolean => {
    return GM_getValue('is_hide_search_history_panel_gm', false)
}

/** 是否关闭评论区屏蔽 */
export const isCloseCommentBlockingGm = (): boolean => {
    return GM_getValue('is_close_comment_blocking_gm', false)
}

/** 是否隐藏首页左上角的轮播图 */
export const isHideCarouselImageGm = (): boolean => {
    return GM_getValue('is_hide_carousel_image_gm', false)
}

/** 是否隐藏首页顶部标题横幅图片 */
export const isHideHomeTopHeaderBannerImageGm = (): boolean => {
    return GM_getValue('is_hide_home_top_header_banner_image_gm', false)
}

/** 是否隐藏视频列表上方的动态、热门、频道栏一整行 */
export const isHideHomeTopHeaderChannelGm = (): boolean => {
    return GM_getValue('is_hide_home_top_header_channel_gm', false)
}

/** 获取限制粉丝数数量，默认-1不限制 */
export const getLimitationFanSumGm = (): number => {
    return GM_getValue('limitation_fan_sum_gm', -1)
}

/** 限制粉丝数数量是否启用 */
export const isFansNumBlockingStatusGm = (): boolean => {
    return GM_getValue('is_fans_num_blocking_status_gm', false)
}

/** 获取用户投稿视频数量限制，默认0 */
export const getLimitationVideoSubmitSumGm = (): number => {
    return GM_getValue('limitation_video_submit_sum_gm', 0)
}

/** 用户投稿视频数量限制是否启用 */
export const isLimitationVideoSubmitStatusGm = (): boolean => {
    return GM_getValue('is_limitation_video_submit_status_gm', false)
}

/** 是否启用动态首页中动态项的内容屏蔽 */
export const enableDynamicItemsContentBlockingGm = (): boolean => {
    return GM_getValue('enable_dynamic_items_content_blocking_gm', false)
}

/** 是否隐藏屏蔽按钮 */
export const hideBlockButtonGm = (): boolean => {
    return GM_getValue('hide_block_button_gm', false)
}

/** 是否检查嵌套动态内容 */
export const isCheckNestedDynamicContentGm = (): boolean => {
    return GM_getValue('is_check_nested_dynamic_content_gm', false)
}

/** 是否屏蔽转发类的动态 */
export const isBlockRepostDynamicGm = (): boolean => {
    return GM_getValue('is_block_repost_dynamic_gm', false)
}

/** 是否屏蔽预约类的动态 */
export const isBlockAppointmentDynamicGm = (): boolean => {
    return GM_getValue('is_block_appointment_dynamic_gm', false)
}

/** 是否屏蔽投票类的动态 */
export const isBlockVoteDynamicGm = (): boolean => {
    return GM_getValue('is_block_vote_dynamic_gm', false)
}

/** 是否屏蔽充电专属抽奖动态 */
export const isBlockUPowerLotteryDynamicGm = (): boolean => {
    return GM_getValue('is_block_u_power_lottery_dynamic_gm', false)
}

/** 是否屏蔽商品类的动态 */
export const isBlockGoodsDynamicGm = (): boolean => {
    return GM_getValue('is_block_goods_dynamic_gm', false)
}

/** 是否屏蔽充电专属专栏动态 */
export const isBlockSpecialColumnForChargingDynamicGm = (): boolean => {
    return GM_getValue('is_block_special_column_for_charging_dynamic_gm', false)
}

/** 是否屏蔽充电专属视频动态 */
export const isBlockVideoChargingExclusiveDynamicGm = (): boolean => {
    return GM_getValue('is_block_video_charging_exclusive_dynamic_gm', false)
}

/** 获取主面板展开关闭快捷键，默认 ` 键 */
export const getDrawerShortcutKeyGm = (): string => {
    return GM_getValue('drawer_shortcut_key_gm', '`')
}

/** 获取视频缓存最长保存时间（天），默认7天 */
export const getExpiresMaxAgeGm = (): number => {
    return GM_getValue('expires_max_age_gm', 7)
}

/** 是否清除搜索页综合选项卡下视频列表中推荐的直播卡片 */
export const isClearLiveCardGm = (): boolean => {
    return GM_getValue('is_clear_live_card_gm', false)
}

/** 获取最小用户等级限制-视频类 */
export const getMinimumUserLevelVideoGm = (): number => {
    return GM_getValue('minimum_user_level_video_gm', 0)
}

/** 获取最大用户等级限制-视频类 */
export const getMaximumUserLevelVideoGm = (): number => {
    return GM_getValue('maximum_user_level_video_gm', 1)
}

/** 获取最小用户等级限制-评论类 */
export const getMinimumUserLevelCommentGm = (): number => {
    return GM_getValue('minimum_user_level_comment_gm', 0)
}

/** 获取最大用户等级限制-评论类 */
export const getMaximumUserLevelCommentGm = (): number => {
    return GM_getValue('maximum_user_level_comment_gm', 0)
}

/** 是否启用最小用户等级限制-视频类 */
export const isEnableMinimumUserLevelVideoGm = (): boolean => {
    return GM_getValue('is_enable_minimum_user_level_video_gm', false)
}
/** 是否启用最大用户等级限制-视频类 */
export const isEnableMaximumUserLevelVideoGm = (): boolean => {
    return GM_getValue('is_enable_maximum_user_level_video_gm', false)
}
/** 是否启用最小用户等级限制-评论类 */
export const isEnableMinimumUserLevelCommentGm = (): boolean => {
    return GM_getValue('is_enable_minimum_user_level_comment_gm', false)
}
/** 是否启用最大用户等级限制-评论类 */
export const isEnableMaximumUserLevelCommentGm = (): boolean => {
    return GM_getValue('is_enable_maximum_user_level_comment_gm', false)
}

/** 获取最小播放数限制，默认100 */
export const getMinimumPlayGm = (): number => {
    return GM_getValue('minimum_play_gm', 100)
}

/** 获取最大播放数限制，默认10000 */
export const getMaximumPlayGm = (): number => {
    return GM_getValue('maximum_play_gm', 10000)
}

/** 获取最小播放数限制是否启用 */
export const isMinimumPlayGm = (): boolean => {
    return GM_getValue('is_minimum_play_gm', false)
}
/** 获取最大播放数限制是否启用 */
export const isMaximumPlayGm = (): boolean => {
    return GM_getValue('is_maximum_play_gm', false)
}
/** 获取最小弹幕数限制，默认20 */
export const getMinimumBarrageGm = (): number => {
    return GM_getValue('minimum_barrage_gm', 20)
}
/** 获取最大弹幕数限制，默认1000 */
export const getMaximumBarrageGm = (): number => {
    return GM_getValue('maximum_barrage_gm', 1000)
}
/** 获取最小弹幕数限制是否启用 */
export const isMinimumBarrageGm = (): boolean => {
    return GM_getValue('is_minimum_barrage_gm', false)
}
/** 获取最大弹幕数限制是否启用 */
export const isMaximumBarrageGm = (): boolean => {
    return GM_getValue('is_maximum_barrage_gm', false)
}
/** 获取最小视频时长限制，默认30秒 */
export const getMinimumDurationGm = (): number => {
    return GM_getValue('minimum_duration_gm', 30)
}
/** 获取最大视频时长限制，默认3000秒 */
export const getMaximumDurationGm = (): number => {
    return GM_getValue('maximum_duration_gm', 3000)
}
/** 获取最小视频时长限制是否启用 */
export const isMinimumDurationGm = (): boolean => {
    return GM_getValue('is_minimum_duration_gm', false)
}
/** 获取最大视频时长限制是否启用 */
export const isMaximumDurationGm = (): boolean => {
    return GM_getValue('is_maximum_duration_gm', false)
}

/** 是否隐藏动态首页左上角个人资料卡 */
export const hidePersonalInfoCardGm = (): boolean => {
    return GM_getValue('hide_personal_info_card_gm', false)
}

/** 是否屏蔽视频类-视频内精选评论区 */
export const isVideosInFeaturedCommentsBlockedGm = (): boolean => {
    return GM_getValue('is_videos_in_featured_comments_blocked_gm', false)
}

/** 是否屏蔽视频类-关注7天以上的人可发评论类视频 */
export const isFollowers7DaysOnlyVideosBlockedGm = (): boolean => {
    return GM_getValue('is_followers_7_days_only_videos_blocked_gm', false)
}

/** 是否屏蔽视频类-禁止评论类视频 */
export const isCommentDisabledVideosBlockedGm = (): boolean => {
    return GM_getValue('is_comment_disabled_videos_blocked_gm', false)
}

/** 获取发布类型缓存卡片列表 */
export const getReleaseTypeCardsGm = (): string[] => {
    return GM_getValue('release_type_cards_gm', [])
}

/** 是否启用自动滚动 */
export const isAutomaticScrollingGm = (): boolean => {
    return GM_getValue('is_automatic_scrolling_gm', true)
}

/** 是否启用直播间列表自适应布局 */
export const isRoomListAdaptiveGm = (): boolean => {
    return GM_getValue('is_room_list_adaptive_gm', false)
}

/** 是否移除直播页面右侧侧边栏，默认true */
export const isDelLivePageRightSidebarGm = (): boolean => {
    return GM_getValue('is_del_live_page_right_sidebar_gm', true)
}

/** 是否隐藏直播间背景 */
export const isRoomBackgroundHideGm = (): boolean => {
    return GM_getValue('is_room_background_hide_gm', false)
}

/** 是否隐藏直播间礼物面板 */
export const isHideLiveGiftPanelGm = (): boolean => {
    return GM_getValue('is_room_background_hide_gm', false)
}

/** 是否屏蔽Bilibili-Gate脚本中非视频类 */
export const bGateClearListNonVideoGm = (): boolean => {
    return GM_getValue('b_gate_clear_list_non_video_gm', false)
}

/** 是否移除直播间底部横幅广告，默认true */
export const isDelLiveBottomBannerAdGm = (): boolean => {
    return GM_getValue('is_del_live_bottom_banner_ad_val_gm', true)
}

export default {
    getTripleRate,
    isTripleRateBlockingStatus,
    setBorderColor,
    getBorderColor,
    setOutputInformationFontColor,
    getOutputInformationFontColor,
    setHighlightInformationColor,
    getHighlightInformationColor,
    getBOnlyTheHomepageIsBlocked,
    getAdaptationBAppCommerce,
    setDefaultColorInfo,
    isCompatible_BEWLY_BEWLY,
    isDiscardOldCommentAreas,
    isShowRightTopMainButSwitch,
    isFirstFullDisplay,
    isHalfHiddenIntervalAfterInitialDisplay,
    isDelPlayerPageRightVideoList,
    bFuzzyAndRegularMatchingWordsToLowercase,
    isDisableNetRequestsBvVideoInfo,
    isBlockFollowed,
    isUpOwnerExclusive,
    isGenderRadioVal,
    isVipTypeRadioVal,
    isSeniorMember,
    isCopyrightRadio,
    isDelBottomComment,
    isBlockVerticalVideo,
    isCheckTeamMember,
    getVideoLikeRate,
    isVideoLikeRateBlockingStatus,
    isCoinLikesRatioRateBlockingStatus,
    getCoinLikesRatioRate,
    isCoinLikesRatioRateDisabled,
    isInteractiveRateBlockingStatus,
    getInteractiveRate,
    getUidRangeMasking,
    isUidRangeMaskingStatus,
    isTimeRangeMaskingStatus,
    isDelPlayerEndingPanel,
    getTimeRangeMaskingArr,
    getCommentWordLimitVal,
    /** 是否隐藏添加稍后再看按钮 */
    isHideAddSeeLater(): boolean {
        return GM_getValue('is_hide_add_see_later', false)
    },
    /** 是否隐藏动态首页右侧布局 */
    isDynamicHomeRightLayHide(): boolean {
        return GM_getValue('is_dynamic_home_right_lay_hide', false)
    },
    /** 是否隐藏回到旧版按钮 */
    hideBackToOldVersionButGm(): boolean {
        return GM_getValue('hide_back_to_old_version_but_gm', false)
    },
    /** 是否显示回到顶部按钮 */
    isShowBackToTopBtn(): boolean {
        return GM_getValue('is_show_back_to_top_btn', false)
    },
    /** 是否隐藏用户主页投稿选项卡中的充电专属视频 */
    isHideChargingDedicatedVideos(): boolean {
        return GM_getValue('is_hide_charging_dedicated_videos', false)
    },
    /** 是否隐藏用户主页投稿选项卡中直播回放视频 */
    isLiveReplayVideosHide(): boolean {
        return GM_getValue('is_live_replay_videos_hide_gm', false)
    },
    /** 获取网游分区顶部tag仅显示列表 */
    getGamePartitionTagOnlyShowList(): string[] {
        return GM_getValue('online_game_list_gm', [])
    },
    /** 获取手游分区顶部tag仅显示列表 */
    getMobileGamePartitionTagOnlyShowList(): string[] {
        return GM_getValue('mobile_game_list_gm', [])
    },
    /** 获取单机游戏区分区顶部tag仅显示列表 */
    getSingleGamePartitionTagOnlyShowList(): string[] {
        return GM_getValue('console_game_list_gm', [])
    },
    /** 网游分区tag仅显示状态 */
    isGamePartitionTagOnlyShowStatus(): boolean {
        return GM_getValue('online_game_status_gm', false)
    },
    /** 手游分区tag仅显示状态 */
    isMobileGamePartitionTagOnlyShowStatus(): boolean {
        return GM_getValue('mobile_game_status_gm', false)
    },
    /** 单机游戏区分区tag仅显示状态 */
    isSingleGamePartitionTagOnlyShowStatus(): boolean {
        return GM_getValue('console_game_status_gm', false)
    },
    /** 获取隐藏首页左侧顶部栏目列表 */
    getHideTheLeftTopColumnsGm(): string[] {
        return GM_getValue('hide_the_left_top_columns_gm', [])
    },
    /** 是否启用顶栏栏目屏蔽状态 */
    isTopBarColumnShieldingStatusGm(): boolean {
        return GM_getValue('top_bar_column_shielding_status_gm', false)
    },
    /** 获取荣耀等级映射列表，level为等级，src为图标URL */
    getGloryLevelMappingListGm(): GloryLevelMappingItem[] {
        return GM_getValue('glory_level_mapping_list_gm', [])
    },
    /** 获取荣耀等级限制列表，默认包含roomId=0的兜底全局配置 */
    getGloryLevelLimitListGm(): GloryLevelLimitItem[] {
        const defV: GloryLevelLimitItem = {roomId: 0, limitLevel: 10, status: false}
        const listGm: GloryLevelLimitItem[] = GM_getValue('glory_level_limit_list_gm', [defV])
        if (!listGm.some(item => item.roomId === 0 || item.roomId === '0')) {
            listGm.unshift(defV)
        }
        return listGm
    },
    /** 获取粉丝牌等级限制列表 */
    getFansLevelLimitListGm(): FansLevelLimitItem[] {
        return GM_getValue('fans_level_limit_list_gm', [])
    },
    /** 获取组合规则方案列表 */
    getCombinationRuleListGm(): CombinationRuleListItem[] {
        return GM_getValue('combination_rule_list_gm', [])
    }
}
