/**
 * 比较两个数组是否相等
 * 此方法通过统计元素出现次数来确保两个数组包含相同元素（包括重复元素）
 * @param arr1 {Array}
 * @param arr2 {Array}
 * @returns {boolean}
 */
const arraysLooseEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    const countMap = {};
    // 处理特殊值（如NaN）的键
    const getKey = (value) => {
        if (typeof value === 'number' && Number.isNaN(value)) return '__NaN';
        return JSON.stringify(value);
    };
    // 统计arr1的元素
    for (const elem of arr1) {
        const key = getKey(elem);
        countMap[key] = (countMap[key] || 0) + 1;
    }
    // 验证arr2的元素
    for (const elem of arr2) {
        const key = getKey(elem);
        if (!countMap[key]) return false; // 不存在或数量不足
        countMap[key]--;
    }

    return true;
}

/**
 * 判断数组a是否包含数组b
 * @param a {Array} 数组a
 * @param b {Array} 数组b
 * @returns {boolean}
 */
const arrayContains = (a, b) => {
    // 如果b是空数组，直接返回true
    if (b.length === 0) return true;
    // 如果a长度小于b，直接返回false
    if (a.length < b.length) return false;

    const countMap = {};
    // 生成唯一键（处理特殊值如NaN）
    const getKey = (value) => {
        if (typeof value === 'number' && Number.isNaN(value)) return '__NaN';
        return JSON.stringify(value);
    };

    // 统计a中每个元素的出现次数
    for (const elem of a) {
        const key = getKey(elem);
        countMap[key] = (countMap[key] || 0) + 1;
    }

    // 检查b中的每个元素是否都在a中存在且数量足够
    for (const elem of b) {
        const key = getKey(elem);
        // 如果不存在或数量不足，返回false
        if (!countMap[key] || countMap[key] <= 0) return false;
        countMap[key]--;
    }

    return true;
}

export default {
    arraysLooseEqual,
    arrayContains
}
