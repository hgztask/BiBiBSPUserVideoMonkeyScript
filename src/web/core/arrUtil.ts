/**
 * 比较两个数组是否相等
 * 此方法通过统计元素出现次数来确保两个数组包含相同元素（包括重复元素）
 * @param arr1 {Array}
 * @param arr2 {Array}
 * @returns {boolean}
 */
const arraysLooseEqual = <T = any>(arr1: T[], arr2: T[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    const countMap: Record<string, number> = {};
    const getKey = (value: T): string => {
        if (typeof value === 'number' && Number.isNaN(value)) return '__NaN';
        return JSON.stringify(value);
    };
    for (const elem of arr1) {
        const key = getKey(elem);
        countMap[key] = (countMap[key] || 0) + 1;
    }
    for (const elem of arr2) {
        const key = getKey(elem);
        if (!countMap[key]) return false;
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
const arrayContains = <T = any>(a: T[], b: T[]): boolean => {
    if (b.length === 0) return true;
    if (a.length < b.length) return false;

    const countMap: Record<string, number> = {};
    const getKey = (value: T): string => {
        if (typeof value === 'number' && Number.isNaN(value)) return '__NaN';
        return JSON.stringify(value);
    };

    for (const elem of a) {
        const key = getKey(elem);
        countMap[key] = (countMap[key] || 0) + 1;
    }

    for (const elem of b) {
        const key = getKey(elem);
        if (!countMap[key] || countMap[key] <= 0) return false;
        countMap[key]--;
    }

    return true;
}

export default {
    arraysLooseEqual,
    arrayContains
}
