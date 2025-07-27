import {getExcludeURLsGm, isExcludeURLSwitchGm} from "../data/localMKData.js";
import {returnTempVal} from "../data/globalValue.js";

/**
 * 测试检查url是否排除页面
 * @param url {string}
 * @returns {{state: boolean, regularURL: string}|{state: boolean}}
 */
const checkAndExcludePageTest = (url) => {
    const arr = getExcludeURLsGm();
    if (arr.length === 0) return returnTempVal;
    for (let v of arr) {
        if (!v.state) continue;
        if (url.search(v.regularURL) !== -1) {
            return {state: true, regularURL: v.regularURL};
        }
    }
    return returnTempVal;
}

/**
 * 检查是否排除页面
 * @param url {string}
 * @returns {boolean}
 */
export const checkAndExcludePage = (url) => {
    if (!isExcludeURLSwitchGm()) return false;
    const {state, regularURL} = checkAndExcludePageTest(url)
    if (state) {
        console.log("排除页面", regularURL)
    }
    return state
}
