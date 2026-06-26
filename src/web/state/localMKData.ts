interface TimeRangeMaskingItem {
    status: boolean
    r: [number, number]
}

interface ExcludeURLItem {
    state: boolean
    regularURL: string
    desc: string
}

interface GloryLevelMappingItem {
    level: number
    src: string
}

interface GloryLevelLimitItem {
    roomId: number | string
    limitLevel: number
    status: boolean
}

interface FansLevelLimitItem {
    name: string
    limitLevel: number
    status: boolean
}

interface CombinationRuleItem {
    key: string
    mode: string
    value: string
}

interface CombinationRuleListItem {
    status: boolean
    name: string
    ruleList: CombinationRuleItem[]
}

const setBorderColor = (color: string): void => {
    GM_setValue("borderColor", color)
}

const defBorderColor: string = "rgb(0, 243, 255)"

const getBorderColor = (): string => {
    return GM_getValue("borderColor", defBorderColor)
}

const setOutputInformationFontColor = (color: string): void => {
    GM_setValue("output_information_font_color", color)
}

const defOutputInformationFontColor: string = "rgb(119,128,248)"

const getOutputInformationFontColor = (): string => {
    return GM_getValue("output_information_font_color", defOutputInformationFontColor)
}

const setHighlightInformationColor = (color: string): void => {
    GM_setValue("highlight_information_color", color)
}

const defHighlightInformationColor: string = "rgb(234, 93, 93)"

const getHighlightInformationColor = (): string => {
    return GM_getValue("highlight_information_color", defHighlightInformationColor)
}

const setDefaultColorInfo = (): void => {
    setBorderColor(defBorderColor)
    setOutputInformationFontColor(defOutputInformationFontColor)
    setHighlightInformationColor(defHighlightInformationColor)
}

const getBOnlyTheHomepageIsBlocked = (): boolean => {
    return GM_getValue("bOnlyTheHomepageIsBlocked", false)
}

const getAdaptationBAppCommerce = (): boolean => {
    return GM_getValue<boolean>("adaptation-b-app-recommend", false) === true
}

const isShowRightTopMainButSwitch = (): boolean => {
    return GM_getValue<boolean>("showRightTopMainButSwitch", true) === true
}

const isFirstFullDisplay = (): boolean => {
    return GM_getValue<boolean>('isFirstFullDisplay', true) === true
}

const isHalfHiddenIntervalAfterInitialDisplay = (): boolean => {
    return GM_getValue<boolean>('is_half_hidden_interval_after_initial_display', true) === true
}

const isCompatible_BEWLY_BEWLY = (): boolean => {
    return GM_getValue<boolean>("compatible_BEWLY_BEWLY", false) === true
}

const isDiscardOldCommentAreas = (): boolean => {
    return GM_getValue<boolean>("discardOldCommentAreas", true) === true
}

const isDelPlayerPageRightVideoList = (): boolean => {
    return GM_getValue<boolean>("isDelPlayerPageRightVideoList", false) === true
}

const bFuzzyAndRegularMatchingWordsToLowercase = (): boolean => {
    return GM_getValue("bFuzzyAndRegularMatchingWordsToLowercase", false)
}

export const getRequestFrequencyVal = (): number => {
    return GM_getValue("requestFrequencyVal", 0.2)
}

const isDisableNetRequestsBvVideoInfo = (): boolean => {
    return GM_getValue('isDisableNetRequestsBvVideoInfo', false)
}

const isBlockFollowed = (): boolean => {
    return GM_getValue('blockFollowed', false)
}

const isUpOwnerExclusive = (): boolean => {
    return GM_getValue('is_up_owner_exclusive', false)
}

const isGenderRadioVal = (): string => {
    return GM_getValue('genderRadioVal', '不处理')
}

const isVipTypeRadioVal = (): string => {
    return GM_getValue('vipTypeRadioVal', '不处理')
}

const isSeniorMember = (): boolean => {
    return GM_getValue('is_senior_member', false)
}

const isCopyrightRadio = (): string => {
    return GM_getValue('copyrightRadioVal', '不处理')
}

const isDelBottomComment = (): boolean => {
    return GM_getValue('isDelBottomComment', false)
}

const isBlockVerticalVideo = (): boolean => {
    return GM_getValue('blockVerticalVideo', false)
}

const isCheckTeamMember = (): boolean => {
    return GM_getValue('checkTeamMember', false)
}

const getVideoLikeRate = (): number => {
    return GM_getValue('video_like_rate', 0.05)
}

const isVideoLikeRateBlockingStatus = (): boolean => {
    return GM_getValue('video_like_rate_blocking_status', false)
}

const isCoinLikesRatioRateBlockingStatus = (): boolean => {
    return GM_getValue('coin_likes_ratio_rate_blocking_status', false)
}

const getCoinLikesRatioRate = (): number => {
    return GM_getValue('coin_likes_ratio_rate', 0.05)
}

const isCoinLikesRatioRateDisabled = (): boolean => {
    return GM_getValue('coin_likes_ratio_rate_blocking_status', false)
}

const isInteractiveRateBlockingStatus = (): boolean => {
    return GM_getValue('interactive_rate_blocking_status', false)
}

const getInteractiveRate = (): number => {
    return GM_getValue('interactive_rate', 0.05)
}

const isTripleRateBlockingStatus = (): boolean => {
    return GM_getValue('triple_rate_blocking_status', false)
}

const getTripleRate = (): number => {
    return GM_getValue('triple_rate', 0.05)
}

const getUidRangeMasking = (): number[] => {
    return GM_getValue('uid_range_masking', [0, 100])
}

const isUidRangeMaskingStatus = (): boolean => {
    return GM_getValue('uid_range_masking_status', false)
}

const isTimeRangeMaskingStatus = (): boolean => {
    return GM_getValue('time_range_masking_status', false)
}

const getTimeRangeMaskingArr = (): TimeRangeMaskingItem[] => {
    return GM_getValue('time_range_masking', [])
}

const isDelPlayerEndingPanel = (): boolean => {
    return GM_getValue('is_del_player_ending_panel', false)
}

export const isLocalhostPageAutomaticallyOpenTheMainPanelGm = (): boolean => {
    return GM_getValue("is_localhost_page_automatically_open_the_main_panel_gm", false)
}

const getCommentWordLimitVal = (): number => {
    return GM_getValue('comment_word_limit', -1)
}

export const getSubstituteWordsArr = (): string[] => {
    return GM_getValue('substitute_words', [])
}

export const isClearCommentEmoticons = (): boolean => {
    return GM_getValue('is_clear_comment_emoticons', false)
}

export const isReplaceCommentSearchTerms = (): boolean => {
    return GM_getValue('is_replace_comment_search_terms', false)
}

export const enableReplacementProcessing = (): boolean => {
    return GM_getValue('enable_replacement_processing', false)
}

export const isEffectiveUIDShieldingOnlyVideo = (): boolean => {
    return GM_getValue('is_effective_uid_shielding_only_video', false)
}

export const isSeniorMemberOnly = (): boolean => {
    return GM_getValue('is_senior_member_only', false)
}

export const isExcludeURLSwitchGm = (): boolean => {
    return GM_getValue('is_exclude_url_switch_gm', false)
}

export const getExcludeURLsGm = (): ExcludeURLItem[] => {
    return GM_getValue('exclude_urls_gm', [])
}

export const isHideHotSearchesPanelGm = (): boolean => {
    return GM_getValue('is_hide_hot_searches_panel_gm', false)
}

export const isHideSearchHistoryPanelGm = (): boolean => {
    return GM_getValue('is_hide_search_history_panel_gm', false)
}

export const isCloseCommentBlockingGm = (): boolean => {
    return GM_getValue('is_close_comment_blocking_gm', false)
}

export const isHideCarouselImageGm = (): boolean => {
    return GM_getValue('is_hide_carousel_image_gm', false)
}

export const isHideHomeTopHeaderBannerImageGm = (): boolean => {
    return GM_getValue('is_hide_home_top_header_banner_image_gm', false)
}

export const isHideHomeTopHeaderChannelGm = (): boolean => {
    return GM_getValue('is_hide_home_top_header_channel_gm', false)
}

export const getLimitationFanSumGm = (): number => {
    return GM_getValue('limitation_fan_sum_gm', -1)
}

export const isFansNumBlockingStatusGm = (): boolean => {
    return GM_getValue('is_fans_num_blocking_status_gm', false)
}

export const getLimitationVideoSubmitSumGm = (): number => {
    return GM_getValue('limitation_video_submit_sum_gm', 0)
}

export const isLimitationVideoSubmitStatusGm = (): boolean => {
    return GM_getValue('is_limitation_video_submit_status_gm', false)
}

export const enableDynamicItemsContentBlockingGm = (): boolean => {
    return GM_getValue('enable_dynamic_items_content_blocking_gm', false)
}

export const hideBlockButtonGm = (): boolean => {
    return GM_getValue('hide_block_button_gm', false)
}

export const isCheckNestedDynamicContentGm = (): boolean => {
    return GM_getValue('is_check_nested_dynamic_content_gm', false)
}

export const isBlockRepostDynamicGm = (): boolean => {
    return GM_getValue('is_block_repost_dynamic_gm', false)
}

export const isBlockAppointmentDynamicGm = (): boolean => {
    return GM_getValue('is_block_appointment_dynamic_gm', false)
}

export const isBlockVoteDynamicGm = (): boolean => {
    return GM_getValue('is_block_vote_dynamic_gm', false)
}

export const isBlockUPowerLotteryDynamicGm = (): boolean => {
    return GM_getValue('is_block_u_power_lottery_dynamic_gm', false)
}

export const isBlockGoodsDynamicGm = (): boolean => {
    return GM_getValue('is_block_goods_dynamic_gm', false)
}

export const isBlockSpecialColumnForChargingDynamicGm = (): boolean => {
    return GM_getValue('is_block_special_column_for_charging_dynamic_gm', false)
}

export const isBlockVideoChargingExclusiveDynamicGm = (): boolean => {
    return GM_getValue('is_block_video_charging_exclusive_dynamic_gm', false)
}

export const getDrawerShortcutKeyGm = (): string => {
    return GM_getValue('drawer_shortcut_key_gm', '`')
}

export const getExpiresMaxAgeGm = (): number => {
    return GM_getValue('expires_max_age_gm', 7)
}

export const isClearLiveCardGm = (): boolean => {
    return GM_getValue('is_clear_live_card_gm', false)
}

export const getMinimumUserLevelVideoGm = (): number => {
    return GM_getValue('minimum_user_level_video_gm', 0)
}

export const getMaximumUserLevelVideoGm = (): number => {
    return GM_getValue('maximum_user_level_video_gm', 1)
}

export const getMinimumUserLevelCommentGm = (): number => {
    return GM_getValue('minimum_user_level_comment_gm', 0)
}

export const getMaximumUserLevelCommentGm = (): number => {
    return GM_getValue('maximum_user_level_comment_gm', 0)
}

export const isEnableMinimumUserLevelVideoGm = (): boolean => {
    return GM_getValue('is_enable_minimum_user_level_video_gm', false)
}

export const isEnableMaximumUserLevelVideoGm = (): boolean => {
    return GM_getValue('is_enable_maximum_user_level_video_gm', false)
}

export const isEnableMinimumUserLevelCommentGm = (): boolean => {
    return GM_getValue('is_enable_minimum_user_level_comment_gm', false)
}

export const isEnableMaximumUserLevelCommentGm = (): boolean => {
    return GM_getValue('is_enable_maximum_user_level_comment_gm', false)
}

export const getMinimumPlayGm = (): number => {
    return GM_getValue('minimum_play_gm', 100)
}

export const getMaximumPlayGm = (): number => {
    return GM_getValue('maximum_play_gm', 10000)
}

export const isMinimumPlayGm = (): boolean => {
    return GM_getValue('is_minimum_play_gm', false)
}

export const isMaximumPlayGm = (): boolean => {
    return GM_getValue('is_maximum_play_gm', false)
}

export const getMinimumBarrageGm = (): number => {
    return GM_getValue('minimum_barrage_gm', 20)
}

export const getMaximumBarrageGm = (): number => {
    return GM_getValue('maximum_barrage_gm', 1000)
}

export const isMinimumBarrageGm = (): boolean => {
    return GM_getValue('is_minimum_barrage_gm', false)
}

export const isMaximumBarrageGm = (): boolean => {
    return GM_getValue('is_maximum_barrage_gm', false)
}

export const getMinimumDurationGm = (): number => {
    return GM_getValue('minimum_duration_gm', 30)
}

export const getMaximumDurationGm = (): number => {
    return GM_getValue('maximum_duration_gm', 3000)
}

export const isMinimumDurationGm = (): boolean => {
    return GM_getValue('is_minimum_duration_gm', false)
}

export const isMaximumDurationGm = (): boolean => {
    return GM_getValue('is_maximum_duration_gm', false)
}

export const hidePersonalInfoCardGm = (): boolean => {
    return GM_getValue('hide_personal_info_card_gm', false)
}

export const isVideosInFeaturedCommentsBlockedGm = (): boolean => {
    return GM_getValue('is_videos_in_featured_comments_blocked_gm', false)
}

export const isFollowers7DaysOnlyVideosBlockedGm = (): boolean => {
    return GM_getValue('is_followers_7_days_only_videos_blocked_gm', false)
}

export const isCommentDisabledVideosBlockedGm = (): boolean => {
    return GM_getValue('is_comment_disabled_videos_blocked_gm', false)
}

export const getReleaseTypeCardsGm = (): string[] => {
    return GM_getValue('release_type_cards_gm', [])
}

export const isAutomaticScrollingGm = (): boolean => {
    return GM_getValue('is_automatic_scrolling_gm', true)
}

export const isRoomListAdaptiveGm = (): boolean => {
    return GM_getValue('is_room_list_adaptive_gm', false)
}

export const isDelLivePageRightSidebarGm = (): boolean => {
    return GM_getValue('is_del_live_page_right_sidebar_gm', true)
}

export const isRoomBackgroundHideGm = (): boolean => {
    return GM_getValue('is_room_background_hide_gm', false)
}

export const isHideLiveGiftPanelGm = (): boolean => {
    return GM_getValue('is_room_background_hide_gm', false)
}

export const bGateClearListNonVideoGm = (): boolean => {
    return GM_getValue('b_gate_clear_list_non_video_gm', false)
}

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
    isHideAddSeeLater(): boolean {
        return GM_getValue('is_hide_add_see_later', false)
    },
    isDynamicHomeRightLayHide(): boolean {
        return GM_getValue('is_dynamic_home_right_lay_hide', false)
    },
    hideBackToOldVersionButGm(): boolean {
        return GM_getValue('hide_back_to_old_version_but_gm', false)
    },
    isShowBackToTopBtn(): boolean {
        return GM_getValue('is_show_back_to_top_btn', false)
    },
    isHideChargingDedicatedVideos(): boolean {
        return GM_getValue('is_hide_charging_dedicated_videos', false)
    },
    isLiveReplayVideosHide(): boolean {
        return GM_getValue('is_live_replay_videos_hide_gm', false)
    },
    getGamePartitionTagOnlyShowList(): string[] {
        return GM_getValue('online_game_list_gm', [])
    },
    getMobileGamePartitionTagOnlyShowList(): string[] {
        return GM_getValue('mobile_game_list_gm', [])
    },
    getSingleGamePartitionTagOnlyShowList(): string[] {
        return GM_getValue('console_game_list_gm', [])
    },
    isGamePartitionTagOnlyShowStatus(): boolean {
        return GM_getValue('online_game_status_gm', false)
    },
    isMobileGamePartitionTagOnlyShowStatus(): boolean {
        return GM_getValue('mobile_game_status_gm', false)
    },
    isSingleGamePartitionTagOnlyShowStatus(): boolean {
        return GM_getValue('console_game_status_gm', false)
    },
    getHideTheLeftTopColumnsGm(): string[] {
        return GM_getValue('hide_the_left_top_columns_gm', [])
    },
    isTopBarColumnShieldingStatusGm(): boolean {
        return GM_getValue('top_bar_column_shielding_status_gm', false)
    },
    getGloryLevelMappingListGm(): GloryLevelMappingItem[] {
        return GM_getValue('glory_level_mapping_list_gm', [])
    },
    getGloryLevelLimitListGm(): GloryLevelLimitItem[] {
        const defV: GloryLevelLimitItem = {roomId: 0, limitLevel: 10, status: false}
        const listGm: GloryLevelLimitItem[] = GM_getValue('glory_level_limit_list_gm', [defV])
        if (!listGm.some(item => item.roomId === 0 || item.roomId === '0')) {
            listGm.unshift(defV)
        }
        return listGm
    },
    getFansLevelLimitListGm(): FansLevelLimitItem[] {
        return GM_getValue('fans_level_limit_list_gm', [])
    },
    getCombinationRuleListGm(): CombinationRuleListItem[] {
        return GM_getValue('combination_rule_list_gm', [])
    }
}
