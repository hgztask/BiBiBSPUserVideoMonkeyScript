import gmUtil from "../utils/gmUtil.js";

/**
 * 设置边框颜色
 * @param color {string}
 */
const setBorderColor = (color) => {
    gmUtil.setData("borderColor", color);
}


const defBorderColor="rgb(0, 243, 255)"

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

const defOutputInformationFontColor="rgb(119,128,248)";
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

const defHighlightInformationColor="rgb(234, 93, 93)";

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
const setDefaultColorInfo=()=>{
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
//获取是否隐藏主面板按钮开关
const isHideMainButSwitch = () => {
    return gmUtil.getData("hideMainButSwitch", false) === true;
}

//设置是否隐藏主面板按钮开关
const setHideMainButSwitch = (bool) => {
    gmUtil.setData("hideMainButSwitch", bool === true)
}

// 是否隐藏右上角主面板按钮开关，默认为true
const isHideRightTopMainButSwitch = () => {
    return gmUtil.getData("hideRightTopMainButSwitch", true) === true;
}

// 设置是否隐藏右上角主面板按钮开关
const setHideRightTopMainButSwitch = (bool) => {
    gmUtil.setData("hideRightTopMainButSwitch", bool === true)
}

/**
 * 获取是否兼容BewlyBewly插件
 * @returns {boolean}
 */
const isCompatible_BEWLY_BEWLY=()=>{
    return gmUtil.getData("compatible_BEWLY_BEWLY", false) === true;
}

/**
 * 设置是否兼容BewlyBewly插件
 * @param bool
 */
const setCompatible_BEWLY_BEWLY=(bool)=>{
    gmUtil.setData("compatible_BEWLY_BEWLY", bool === true)
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
    isHideMainButSwitch,
    setHideMainButSwitch,
    isCompatible_BEWLY_BEWLY,
    setCompatible_BEWLY_BEWLY
}
