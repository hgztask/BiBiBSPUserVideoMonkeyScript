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
    return gmUtil.getData("showRightTopMainButSwitch", false) === true;
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


export default {
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
}
