import gmUtil from "../utils/gmUtil.js";

/**
 * 设置边框颜色
 * @param color {string}
 */
const setBorderColor = (color) => {
    gmUtil.setData("borderColor", color);
}


const defBorderColor = "rgb(0, 243, 255)"

/**
 * 获取边框颜色
 * @returns {string}
 */
const getBorderColor = () => {
    return gmUtil.getData("borderColor", defBorderColor)
}

/**
 * 设置输出信息字体颜色
 * @param color {string}
 */
const setOutputInformationFontColor = (color) => {
    gmUtil.setData("output_information_font_color", color);
}

const defOutputInformationFontColor = "rgb(119,128,248)";
/**
 * 获取输出信息字体颜色
 * @returns {string}
 */
const getOutputInformationFontColor = () => {
    return gmUtil.getData("output_information_font_color", defOutputInformationFontColor)
}

/**
 * 设置高亮信息颜色
 * @param color {string}
 */
const setHighlightInformationColor = (color) => {
    gmUtil.setData("highlight_information_color", color);
}

const defHighlightInformationColor = "rgb(234, 93, 93)";

/**
 * 获取高亮信息颜色
 * @returns {string}
 */
const getHighlightInformationColor = () => {
    return gmUtil.getData("highlight_information_color", defHighlightInformationColor);
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
 * 设置是否只对首页屏蔽
 * @param bool {boolean}
 */
const setBOnlyTheHomepageIsBlocked = (bool) => {
    gmUtil.setData("bOnlyTheHomepageIsBlocked", bool === true);
}

/**
 * 获取是否只对首页屏蔽
 * @returns {boolean}
 */
const getBOnlyTheHomepageIsBlocked = () => {
    return gmUtil.getData("bOnlyTheHomepageIsBlocked", false);
}


/**
 * 获取是否适配Bilibili-Gate脚本，原bilibili-app-recommend脚本
 * @returns {boolean}
 */
const getAdaptationBAppCommerce = () => {
    return gmUtil.getData("adaptation-b-app-recommend", false) === true;
}

/**
 * 设置是否适配Bilibili-Gate脚本，原bilibili-app-recommend脚本
 * @param bool
 */
export const setAdaptationBAppCommerce = (bool) => {
    gmUtil.setData("adaptation-b-app-recommend", bool === true)
}

// 是否显示右上角主面板按钮开关，默认为true
const isShowRightTopMainButSwitch = () => {
    return gmUtil.getData("showRightTopMainButSwitch", true) === true;
}

// 设置是否显示右上角主面板按钮开关
const setShowRightTopMainButSwitch = (bool) => {
    gmUtil.setData("showRightTopMainButSwitch", bool === true)
}

/**
 * 是否第一次完整显示外部开关主面板按钮
 * @returns {boolean}
 */
const isFirstFullDisplay = () => {
    return gmUtil.getData('isFirstFullDisplay', true) === true
}

/**
 * 设置是否第一次完整显示外部开关主面板按钮
 * @param bool {boolean}
 */
export const setFirstFullDisplay = (bool) => {
    gmUtil.setData('isFirstFullDisplay', bool === true)
}

/**
 * 是否初次显示后间隔半隐藏主面板开关按钮，默认true
 * @returns {boolean}
 */
const isHalfHiddenIntervalAfterInitialDisplay = () => {
    return gmUtil.getData('is_half_hidden_interval_after_initial_display', true) === true
}


/**
 * 设置初次显示后间隔半隐藏主面板开关按钮
 * @param bool {boolean}
 */
const setHalfHiddenIntervalAfterInitialDisplay = (bool) => {
    gmUtil.setData('is_half_hidden_interval_after_initial_display', bool === true)
}

/**
 * 获取是否兼容BewlyBewly插件
 * @returns {boolean}
 */
const isCompatible_BEWLY_BEWLY = () => {
    return gmUtil.getData("compatible_BEWLY_BEWLY", false) === true;
}

/**
 * 设置是否兼容BewlyBewly插件
 * @param bool
 */
const setCompatible_BEWLY_BEWLY = (bool) => {
    gmUtil.setData("compatible_BEWLY_BEWLY", bool === true)
}

/**
 * 设置弃用旧版评论区处理
 * @param bool {boolean}
 */
const setDiscardOldCommentAreas = (bool) => {
    gmUtil.setData("discardOldCommentAreas", bool === true)
}

/**
 * 是否弃用旧版评论区处理
 * @returns {boolean}
 */
const isDiscardOldCommentAreas = () => {
    return gmUtil.getData("discardOldCommentAreas", false) === true;
}

/**
 * 是否移除播放器页面右侧推荐列表
 * @returns {boolean}
 */
const isDelPlayerPageRightVideoList = () => {
    return gmUtil.getData("isDelPlayerPageRightVideoList", false) === true
}

/**
 * 是否模糊和正则匹配词转小写
 * @returns {boolean}
 */
const bFuzzyAndRegularMatchingWordsToLowercase = () => {
    return gmUtil.getData("bFuzzyAndRegularMatchingWordsToLowercase", true) === true
}

/**
 * 设置是否模糊和正则匹配词转小写
 * @param bool {boolean}
 */
const setFuzzyAndRegularMatchingWordsToLowercase = (bool) => {
    gmUtil.setData("bFuzzyAndRegularMatchingWordsToLowercase", bool === true)
}

/**
 * 获取请求频率，默认0.2，单位秒
 * @returns {number}
 */
const isRequestFrequencyVal = () => {
    return gmUtil.getData("requestFrequencyVal", 0.2)
}

/**
 * 禁用根据bv号网络请求获取视频信息
 * @returns {boolean}
 */
const isDisableNetRequestsBvVideoInfo = () => {
    return gmUtil.getData('isDisableNetRequestsBvVideoInfo', false)
}

/**
 * 设置是否禁用根据bv号网络请求获取视频信息
 * @param b {boolean}
 */
const setDisableNetRequestsBvVideoInfo = (b) => {
    gmUtil.setData('isDisableNetRequestsBvVideoInfo', b)
}

// 是否屏蔽已关注用户
const isBlockFollowed = () => {
    return gmUtil.getData('blockFollowed', false)
}

// 是否屏蔽充电专属视频
const isUpOwnerExclusive = () => {
    return gmUtil.getData('is_up_owner_exclusive', false)
}

// 性别屏蔽
const isGenderRadioVal = () => {
    return gmUtil.getData('genderRadioVal', '不处理');
}

// 会员类型屏蔽
const isVipTypeRadioVal = () => {
    return gmUtil.getData('vipTypeRadioVal', '不处理');
}

// 是否屏蔽硬核会员
const isSeniorMember = () => {
    return gmUtil.getData('is_senior_member', false)
}

// 视频类型，原创，转载，不处理
const isCopyrightRadio = () => {
    return gmUtil.getData('copyrightRadioVal', '不处理');
}

// 是否移除底部评论区
const isDelBottomComment = () => {
    return gmUtil.getData('isDelBottomComment', false)
}

// 是否屏蔽竖屏视频
const isBlockVerticalVideo = () => {
    return gmUtil.getData('blockVerticalVideo', false)
}

// 检查创作团队中成员
const isCheckTeamMember = () => {
    return gmUtil.getData('checkTeamMember', false)
}

/**
 * 获取视频点赞率屏蔽，默认0.05
 * @returns {number}
 */
const getVideoLikeRate = () => {
    return gmUtil.getData('video_like_rate', 0.05)
}

// 是否启用视频屏蔽点赞率
const isVideoLikeRateBlockingStatus = () => {
    return gmUtil.getData('video_like_rate_blocking_status', false)
}

// 是否启用视频投币/点赞比（内容价值）屏蔽
const isCoinLikesRatioRateBlockingStatus = () => {
    return gmUtil.getData('coin_likes_ratio_rate_blocking_status', false)
}

// 获取视频投币/点赞比（内容价值）屏蔽，默认0.05
const getCoinLikesRatioRate = () => {
    return gmUtil.getData('coin_likes_ratio_rate', 0.05)
}

// 是否禁用视频投币/点赞比（内容价值）屏蔽
const isCoinLikesRatioRateDisabled = () => {
    return gmUtil.getData('coin_likes_ratio_rate_blocking_status', false)
}

// 是否启用互动率屏蔽
const isInteractiveRateBlockingStatus = () => {
    return gmUtil.getData('interactive_rate_blocking_status', false)
}

// 获取互动率屏蔽，默认0.05
const getInteractiveRate = () => {
    return gmUtil.getData('interactive_rate', 0.05)
}

// 是否启用视频三连率屏蔽
const isTripleRateBlockingStatus = () => {
    return gmUtil.getData('triple_rate_blocking_status', false)
}

// 获取视频三连率屏蔽，默认0.05
const getTripleRate = () => {
    return gmUtil.getData('triple_rate', 0.05)
}

// 获取uid范围屏蔽数组
const getUidRangeMasking = () => {
    return gmUtil.getData('uid_range_masking', [0, 100])
}

// 是否启用uid范围屏蔽
const isUidRangeMaskingStatus = () => {
    return gmUtil.getData('uid_range_masking_status', false)
}

// 是否启用时间范围屏蔽
const isTimeRangeMaskingStatus = () => {
    return gmUtil.getData('time_range_masking_status', false)
}

/**
 * 获取时间范围屏蔽数组
 * 获取时间范围屏蔽数组，其数组内值为时间戳，单位毫秒，位数13
 * 如要比较，请留意比较方是否是以毫秒单位的时间戳，10位的是秒单位的时间戳
 * @returns {[{status:boolean, r:[number,number]}]}
 */
const getTimeRangeMaskingArr = () => {
    return gmUtil.getData('time_range_masking', [])
}

// 是否屏蔽播放完推荐层
const isDelPlayerEndingPanel = () => {
    return gmUtil.getData('is_del_player_ending_panel', false)
}

// 是否开启开发者模式
export const isOpenDev = () => {
    return gmUtil.getData('open-dev', false)
}

// 设置是否开启开发者模式
export const setOpenDev = (bool) => {
    gmUtil.setData('open-dev', bool)
}

// 获取评论字数限制
const getCommentWordLimitVal = () => {
    return gmUtil.getData('comment_word_limit', -1)
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
    setBOnlyTheHomepageIsBlocked,
    getBOnlyTheHomepageIsBlocked,
    getAdaptationBAppCommerce,
    setAdaptationBAppCommerce,
    setDefaultColorInfo,
    isCompatible_BEWLY_BEWLY,
    setCompatible_BEWLY_BEWLY,
    setDiscardOldCommentAreas,
    isDiscardOldCommentAreas,
    isShowRightTopMainButSwitch,
    setShowRightTopMainButSwitch,
    isFirstFullDisplay,
    setFirstFullDisplay,
    isHalfHiddenIntervalAfterInitialDisplay,
    setHalfHiddenIntervalAfterInitialDisplay,
    isDelPlayerPageRightVideoList,
    bFuzzyAndRegularMatchingWordsToLowercase,
    setFuzzyAndRegularMatchingWordsToLowercase,
    isRequestFrequencyVal,
    isDisableNetRequestsBvVideoInfo,
    setDisableNetRequestsBvVideoInfo,
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
