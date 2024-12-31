import elUtil from "../../utils/elUtil.js";
import defUtil from "../../utils/defUtil.js";

// 缓存数据
const cacheData = {
    isPersonalHomepage: null,
}

//是否个人主页
const isPersonalHomepage = async () => {
    if (cacheData.isPersonalHomepage !== null) {
        // 缓存，当前页面是个人主页，且没有刷新，则直接返回
        return cacheData.isPersonalHomepage;
    }
    const {state} = await elUtil.findElementWithTimeout(".h-action", {timeout: 2000, interval: 200});
    const res = !state;
    cacheData.isPersonalHomepage = res;
    return res;
}

//是否个人主页防抖
const isThrottleAsyncPersonalHomepage = defUtil.throttleAsync(isPersonalHomepage,2000);


export default {
    isThrottleAsyncPersonalHomepage,
}
