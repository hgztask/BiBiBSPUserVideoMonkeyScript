/**
 * 设置边框颜色
 * @param color {string}
 */
const setBorderColor = (color) => {
    GM_setValue("borderColor", color);
}

const defBorderColor = "rgb(0, 243, 255)"

/**
 * 获取边框颜色
 * @returns {string}
 */
const getBorderColor = () => {
    return GM_getValue("borderColor", defBorderColor)
}

/**
 * 设置输出信息字体颜色
 * @param color {string}
 */
const setOutputInformationFontColor = (color) => {
    GM_setValue("output_information_font_color", color);
}

const defOutputInformationFontColor = "rgb(119,128,248)";
/**
 * 获取输出信息字体颜色
 * @returns {string}
 */
const getOutputInformationFontColor = () => {
    return GM_getValue("output_information_font_color", defOutputInformationFontColor)
}

/**
 * 设置高亮信息颜色
 * @param color {string}
 */
const setHighlightInformationColor = (color) => {
    GM_setValue("highlight_information_color", color);
}

const defHighlightInformationColor = "rgb(234, 93, 93)";

/**
 * 获取高亮信息颜色
 * @returns {string}
 */
const getHighlightInformationColor = () => {
    return GM_getValue("highlight_information_color", defHighlightInformationColor);
}


/**
 * 设置配置默认颜色
 */
const setDefaultColorInfo = () => {
    setBorderColor(defBorderColor);
    setOutputInformationFontColor(defOutputInformationFontColor);
    setHighlightInformationColor(defHighlightInformationColor);
}

/**
 * 获取是否只对首页屏蔽
 * @returns {boolean}
 */
const getBOnlyTheHomepageIsBlocked = () => {
    return GM_getValue("bOnlyTheHomepageIsBlocked", false);
}

/**
 * 获取是否适配Bilibili-Gate脚本，原bilibili-app-recommend脚本
 * @returns {boolean}
 */
const getAdaptationBAppCommerce = () => {
    return GM_getValue("adaptation-b-app-recommend", false) === true;
}

// 是否显示右上角主面板按钮开关，默认为true
const isShowRightTopMainButSwitch = () => {
    return GM_getValue("showRightTopMainButSwitch", true) === true;
}

/**
 * 是否第一次完整显示外部开关主面板按钮
 * @returns {boolean}
 */
const isFirstFullDisplay = () => {
    return GM_getValue('isFirstFullDisplay', true) === true
}

/**
 * 是否初次显示后间隔半隐藏主面板开关按钮，默认true
 * @returns {boolean}
 */
const isHalfHiddenIntervalAfterInitialDisplay = () => {
    return GM_getValue('is_half_hidden_interval_after_initial_display', true) === true
}

/**
 * 获取是否兼容BewlyBewly插件
 * @returns {boolean}
 */
const isCompatible_BEWLY_BEWLY = () => {
    return GM_getValue("compatible_BEWLY_BEWLY", false) === true;
}

/**
 * 是否弃用旧版评论区处理
 * @returns {boolean}
 */
const isDiscardOldCommentAreas = () => {
    return GM_getValue("discardOldCommentAreas", false) === true;
}

/**
 * 是否移除播放器页面右侧推荐列表
 * @returns {boolean}
 */
const isDelPlayerPageRightVideoList = () => {
    return GM_getValue("isDelPlayerPageRightVideoList", false) === true
}

/**
 * 是否模糊和正则匹配词转小写
 * @returns {boolean}
 */
const bFuzzyAndRegularMatchingWordsToLowercase = () => {
    return GM_getValue("bFuzzyAndRegularMatchingWordsToLowercase", false)
}

/**
 * 获取请求频率，默认0.2，单位秒
 * @returns {number}
 */
export const getRequestFrequencyVal = () => {
    return GM_getValue("requestFrequencyVal", 0.2)
}

/**
 * 禁用根据bv号网络请求获取视频信息
 * @returns {boolean}
 */
const isDisableNetRequestsBvVideoInfo = () => {
    return GM_getValue('isDisableNetRequestsBvVideoInfo', false)
}

// 是否屏蔽已关注用户
const isBlockFollowed = () => {
    return GM_getValue('blockFollowed', false)
}

// 是否屏蔽充电专属视频
const isUpOwnerExclusive = () => {
    return GM_getValue('is_up_owner_exclusive', false)
}

// 性别屏蔽
const isGenderRadioVal = () => {
    return GM_getValue('genderRadioVal', '不处理');
}

// 会员类型屏蔽
const isVipTypeRadioVal = () => {
    return GM_getValue('vipTypeRadioVal', '不处理');
}

// 是否屏蔽硬核会员
const isSeniorMember = () => {
    return GM_getValue('is_senior_member', false)
}

// 视频类型，原创，转载，不处理
const isCopyrightRadio = () => {
    return GM_getValue('copyrightRadioVal', '不处理');
}

// 是否移除底部评论区
const isDelBottomComment = () => {
    return GM_getValue('isDelBottomComment', false)
}

// 是否屏蔽竖屏视频
const isBlockVerticalVideo = () => {
    return GM_getValue('blockVerticalVideo', false)
}

// 检查创作团队中成员
const isCheckTeamMember = () => {
    return GM_getValue('checkTeamMember', false)
}

/**
 * 获取视频点赞率屏蔽，默认0.05
 * @returns {number}
 */
const getVideoLikeRate = () => {
    return GM_getValue('video_like_rate', 0.05)
}

// 是否启用视频屏蔽点赞率
const isVideoLikeRateBlockingStatus = () => {
    return GM_getValue('video_like_rate_blocking_status', false)
}

// 是否启用视频投币/点赞比（内容价值）屏蔽
const isCoinLikesRatioRateBlockingStatus = () => {
    return GM_getValue('coin_likes_ratio_rate_blocking_status', false)
}

// 获取视频投币/点赞比（内容价值）屏蔽，默认0.05
const getCoinLikesRatioRate = () => {
    return GM_getValue('coin_likes_ratio_rate', 0.05)
}

// 是否禁用视频投币/点赞比（内容价值）屏蔽
const isCoinLikesRatioRateDisabled = () => {
    return GM_getValue('coin_likes_ratio_rate_blocking_status', false)
}

// 是否启用互动率屏蔽
const isInteractiveRateBlockingStatus = () => {
    return GM_getValue('interactive_rate_blocking_status', false)
}

// 获取互动率屏蔽，默认0.05
const getInteractiveRate = () => {
    return GM_getValue('interactive_rate', 0.05)
}

// 是否启用视频三连率屏蔽
const isTripleRateBlockingStatus = () => {
    return GM_getValue('triple_rate_blocking_status', false)
}

// 获取视频三连率屏蔽，默认0.05
const getTripleRate = () => {
    return GM_getValue('triple_rate', 0.05)
}

// 获取uid范围屏蔽数组
const getUidRangeMasking = () => {
    return GM_getValue('uid_range_masking', [0, 100])
}

// 是否启用uid范围屏蔽
const isUidRangeMaskingStatus = () => {
    return GM_getValue('uid_range_masking_status', false)
}

// 是否启用时间范围屏蔽
const isTimeRangeMaskingStatus = () => {
    return GM_getValue('time_range_masking_status', false)
}

/**
 * 获取时间范围屏蔽数组
 * 获取时间范围屏蔽数组，其数组内值为时间戳，单位毫秒，位数13
 * 如要比较，请留意比较方是否是以毫秒单位的时间戳，10位的是秒单位的时间戳
 * @returns {[{status:boolean, r:[number,number]}]}
 */
const getTimeRangeMaskingArr = () => {
    return GM_getValue('time_range_masking', [])
}

// 是否屏蔽播放完推荐层
const isDelPlayerEndingPanel = () => {
    return GM_getValue('is_del_player_ending_panel', false)
}

// localhost页面自动打开调试面板
export const isLocalhostPageAutomaticallyOpenTheMainPanelGm = () => {
    return GM_getValue("is_localhost_page_automatically_open_the_main_panel_gm", false)
}

// 获取评论字数限制
const getCommentWordLimitVal = () => {
    return GM_getValue('comment_word_limit', -1)
}

// 获取替换词
export const getSubstituteWordsArr = () => {
    return GM_getValue('substitute_words', [])
}

// 是否清除评论表情
export const isClearCommentEmoticons = () => {
    return GM_getValue('is_clear_comment_emoticons', false)
}

// 是否替换评论搜索词
export const isReplaceCommentSearchTerms = () => {
    return GM_getValue('is_replace_comment_search_terms', false)
}

// 是否开启替换处理功能
export const enableReplacementProcessing = () => {
    return GM_getValue('enable_replacement_processing', false)
}

//  是否仅生效UID屏蔽(限视频)
export const isEffectiveUIDShieldingOnlyVideo = () => {
    return GM_getValue('is_effective_uid_shielding_only_video', false)
}

//仅看硬核会员
export const isSeniorMemberOnly = () => {
    return GM_getValue('is_senior_member_only', false)
}

// 是否启用排除URL总开关
export const isExcludeURLSwitchGm = () => {
    return GM_getValue('is_exclude_url_switch_gm', false)
}

/**
 * 获取排除URL
 * @returns {[{state:boolean,regularURL:string,desc:string}]}
 */
export const getExcludeURLsGm = () => {
    return GM_getValue('exclude_urls_gm', [])
}

//是否隐藏顶部搜索框热搜面板
export const isHideHotSearchesPanelGm = () => {
    return GM_getValue('is_hide_hot_searches_panel_gm', false)
}

//是否隐藏顶部搜索框历史记录面板
export const isHideSearchHistoryPanelGm = () => {
    return GM_getValue('is_hide_search_history_panel_gm', false)
}

//是否关闭评论区屏蔽
export const isCloseCommentBlockingGm = () => {
    return GM_getValue('is_close_comment_blocking_gm', false)
}

//是否隐藏首页左上角的轮播图
export const isHideCarouselImageGm = () => {
    return GM_getValue('is_hide_carousel_image_gm', false)
}

//是否隐藏首页顶部标题横幅图片
export const isHideHomeTopHeaderBannerImageGm = () => {
    return GM_getValue('is_hide_home_top_header_banner_image_gm', false)
}

//是否隐藏视频列表上方的动态、热门、频道栏一整行
export const isHideHomeTopHeaderChannelGm = () => {
    return GM_getValue('is_hide_home_top_header_channel_gm', false)
}

//获取限制粉丝数数量
export const getLimitationFanSumGm = () => {
    return GM_getValue('limitation_fan_sum_gm', -1)
}

//限制粉丝数数量是否启用
export const isFansNumBlockingStatusGm = () => {
    return GM_getValue('is_fans_num_blocking_status_gm', false)
}

//获取投稿数限制数量
export const getLimitationVideoSubmitSumGm = () => {
    return GM_getValue('limitation_video_submit_sum_gm', 0)
}

//投稿数限制数量是否启用
export const isLimitationVideoSubmitStatusGm = () => {
    return GM_getValue('is_limitation_video_submit_status_gm', false)
}

//是否启用动态首页中动态项的内容屏蔽
export const enableDynamicItemsContentBlockingGm = () => {
    return GM_getValue('enable_dynamic_items_content_blocking_gm', false)
}
// 是否隐藏屏蔽按钮
export const hideBlockButtonGm = () => {
    return GM_getValue('hide_block_button_gm', false)
}

//是否检查嵌套动态内容
export const isCheckNestedDynamicContentGm = () => {
    return GM_getValue('is_check_nested_dynamic_content_gm', false)
}

//是否屏蔽转发类的动态
export const isBlockRepostDynamicGm = () => {
    return GM_getValue('is_block_repost_dynamic_gm', false)
}

//是否屏蔽预约类的动态
export const isBlockAppointmentDynamicGm = () => {
    return GM_getValue('is_block_appointment_dynamic_gm', false)
}

//是否屏蔽投票类的动态
export const isBlockVoteDynamicGm = () => {
    return GM_getValue('is_block_vote_dynamic_gm', false)
}

//是否屏蔽充电专属抽奖动态
export const isBlockUPowerLotteryDynamicGm = () => {
    return GM_getValue('is_block_u_power_lottery_dynamic_gm', false)
}

//是否屏蔽商品类的动态
export const isBlockGoodsDynamicGm = () => {
    return GM_getValue('is_block_goods_dynamic_gm', false)
}

//是否屏蔽充电专属专栏动态
export const isBlockSpecialColumnForChargingDynamicGm = () => {
    return GM_getValue('is_block_special_column_for_charging_dynamic_gm', false)
}

//是否屏蔽充电专属视频动态
export const isBlockVideoChargingExclusiveDynamicGm = () => {
    return GM_getValue('is_block_video_charging_exclusive_dynamic_gm', false)
}

//获取主面板展开关闭快捷键
export const getDrawerShortcutKeyGm = () => {
    return GM_getValue('drawer_shortcut_key_gm', '`')
}

//获取视频缓存最长保存时间
export const getExpiresMaxAgeGm = () => {
    return GM_getValue('expires_max_age_gm', 7)
}

//是否清除搜索页综合选项卡下视频列表中推荐的直播卡片
export const isClearLiveCardGm = () => {
    return GM_getValue('is_clear_live_card_gm', false)
}

//获取最小用户等级限制-视频类
export const getMinimumUserLevelVideoGm = () => {
    return GM_getValue('minimum_user_level_video_gm', 0)
}

//获取最大用户等级限制-视频类
export const getMaximumUserLevelVideoGm = () => {
    return GM_getValue('maximum_user_level_video_gm', 1)
}

//获取最小用户等级限制-评论类
export const getMinimumUserLevelCommentGm = () => {
    return GM_getValue('minimum_user_level_comment_gm', 0)
}

//获取最大用户等级限制-评论类
export const getMaximumUserLevelCommentGm = () => {
    return GM_getValue('maximum_user_level_comment_gm', 0)
}

//是否启用最小用户等级限制-视频类
export const isEnableMinimumUserLevelVideoGm = () => {
    return GM_getValue('is_enable_minimum_user_level_video_gm', false)
}
//是否启用最大用户等级限制-视频类
export const isEnableMaximumUserLevelVideoGm = () => {
    return GM_getValue('is_enable_maximum_user_level_video_gm', false)
}
//是否启用最小用户等级限制-评论类
export const isEnableMinimumUserLevelCommentGm = () => {
    return GM_getValue('is_enable_minimum_user_level_comment_gm', false)
}
//是否启用最大用户等级限制-评论类
export const isEnableMaximumUserLevelCommentGm = () => {
    return GM_getValue('is_enable_maximum_user_level_comment_gm', false)
}

//获取最小播放数限制
export const getMinimumPlayGm = () => {
    return GM_getValue('minimum_play_gm', 100)
}

//获取最大播放数限制
export const getMaximumPlayGm = () => {
    return GM_getValue('maximum_play_gm', 10000)
}

//获取最小播放数限制是否启用
export const isMinimumPlayGm = () => {
    return GM_getValue('is_minimum_play_gm', false)
}
//获取最大播放数限制是否启用
export const isMaximumPlayGm = () => {
    return GM_getValue('is_maximum_play_gm', false)
}
//获取最小弹幕数限制
export const getMinimumBarrageGm = () => {
    return GM_getValue('minimum_barrage_gm', 20)
}
//获取最大弹幕数限制
export const getMaximumBarrageGm = () => {
    return GM_getValue('maximum_barrage_gm', 1000)
}
//获取最小弹幕数限制是否启用
export const isMinimumBarrageGm = () => {
    return GM_getValue('is_minimum_barrage_gm', false)
}
//获取最大弹幕数限制是否启用
export const isMaximumBarrageGm = () => {
    return GM_getValue('is_maximum_barrage_gm', false)
}
//获取最小视频时长限制
export const getMinimumDurationGm = () => {
    return GM_getValue('minimum_duration_gm', 30)
}
//获取最大视频时长限制
export const getMaximumDurationGm = () => {
    return GM_getValue('maximum_duration_gm', 3000)
}
//获取最小视频时长限制是否启用
export const isMinimumDurationGm = () => {
    return GM_getValue('is_minimum_duration_gm', false)
}
//获取最大视频时长限制是否启用
export const isMaximumDurationGm = () => {
    return GM_getValue('is_maximum_duration_gm', false)
}

//是否隐藏动态首页左上角个人资料卡
export const hidePersonalInfoCardGm = () => {
    return GM_getValue('hide_personal_info_card_gm', false)
}

//是否屏蔽视频类-视频内精选评论区
export const isVideosInFeaturedCommentsBlockedGm = () => {
    return GM_getValue('is_videos_in_featured_comments_blocked_gm', false)
}

//是否屏蔽视频类-关注7天以上的人可发评论类视频
export const isFollowers7DaysOnlyVideosBlockedGm = () => {
    return GM_getValue('is_followers_7_days_only_videos_blocked_gm', false)
}

//是否屏蔽视频类-禁止评论类视频
export const isCommentDisabledVideosBlockedGm = () => {
    return GM_getValue('is_comment_disabled_videos_blocked_gm', false)
}

export const getReleaseTypeCardsGm = () => {
    return GM_getValue('release_type_cards_gm', [])
}

export const isAutomaticScrollingGm = () => {
    return GM_getValue('is_automatic_scrolling_gm', true)
}

export const isRoomListAdaptiveGm = () => {
    return GM_getValue('is_room_list_adaptive_gm', false)
}

export const isDelLivePageRightSidebarGm = () => {
    return GM_getValue('is_del_live_page_right_sidebar_gm', true)
}

export const isRoomBackgroundHideGm = () => {
    return GM_getValue('is_room_background_hide_gm', false)
}

export const isHideLiveGiftPanelGm = () => {
    return GM_getValue('is_room_background_hide_gm', false)
}

//是否屏蔽B-gete脚本中非视频类
export const bGateClearListNonVideoGm = () => {
    return GM_getValue('b_gate_clear_list_non_video_gm', false)
}

export const isDelLiveBottomBannerAdGm = () => {
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
    getCommentWordLimitVal
}
