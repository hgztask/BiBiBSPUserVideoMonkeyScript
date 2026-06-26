import {getExcludeURLsGm, isExcludeURLSwitchGm} from "../state/localMKData";
import {returnTempVal} from "../config/globalValue";

interface ExcludePageResult {
    state: boolean
    regularURL?: string
}

const checkAndExcludePageTest = (url: string): ExcludePageResult => {
    const arr = getExcludeURLsGm();
    if (arr.length === 0) return returnTempVal;
    for (const v of arr) {
        if (!v.state) continue;
        if (url.search(v.regularURL) !== -1) {
            return {state: true, regularURL: v.regularURL};
        }
    }
    return returnTempVal;
}

export const checkAndExcludePage = (url: string): boolean => {
    if (!isExcludeURLSwitchGm()) return false;
    const {state, regularURL} = checkAndExcludePageTest(url)
    if (state) {
        console.log("排除页面", regularURL)
    }
    return state
}
