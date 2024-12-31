/**
 * 格式化播放量内容或弹幕量转成个数，如时间的为秒，弹幕量为个数
 * 如果str 为空，则返回 -1
 * @param str {string}
 * @returns {number}
 */
const toPlayCountOrBulletChat = (str) => {
    if (!str) {
        return -1
    }
    //去除空格
    str = str.split(/[\t\r\f\n\s]*/g).join("")
    // 正则表达式匹配非数字字符并替换为空
    const replace = str.replace(/[^\d.]/g, '');
    if (str.endsWith('万') || str.endsWith('万次') || str.endsWith('万弹幕')) {
        return parseFloat(replace) * 10000;
    }
    if (str.endsWith('次') || str.endsWith('弹幕')) {
        return parseInt(replace);
    }
    //没有万则直接转成数字
    return parseInt(str)
}


/**
 * 将时间字符串转换为秒，如果时间字符串为空，则返回 -1
 * @param timeStr {string}
 */
const timeStringToSeconds = (timeStr) => {
    if (!timeStr) {
        return -1
    }
    // 按冒号分割字符串
    const parts = timeStr.split(':');
    // 根据冒号的数量决定如何转换
    switch (parts.length) {
        case 1: // 只有秒
            return Number(parts[0]);
        case 2: // 分钟和秒
            return Number(parts[0]) * 60 + Number(parts[1]);
        case 3: // 小时、分钟和秒
            return Number(parts[0]) * 3600 + Number(parts[1]) * 60 + Number(parts[2]);
        default:
            throw new Error('Invalid time format');
    }
}
/**
 * 字符串处理
 */
export default {
    toPlayCountOrBulletChat,
    timeStringToSeconds
}
