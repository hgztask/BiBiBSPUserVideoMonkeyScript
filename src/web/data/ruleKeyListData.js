import ruleKeyListDataJson from '../res/ruleKeyListDataJson.json';

/**
 * 获取选项
 */
const getSelectOptions = () => {
    const options = [
        {
            value: '模糊匹配',
            label: '模糊匹配',
            children: []
        },
        {
            value: '正则匹配',
            label: '正则匹配',
            children: []
        },
        {
            value: '多重匹配',
            label: '多重匹配',
            children: []
        },
        {
            value: '精确匹配',
            label: '精确匹配',
            children: []
        }
    ]
    for (let {name, key} of ruleKeyListDataJson) {
        let children;
        if (name.includes('(模糊匹配)')) {
            children = options[0].children
        }
        if (name.includes('(正则匹配)')) {
            children = options[1].children
        }
        if (name.includes('(组合精确匹配)')) {
            children = options[2].children
        }
        if (name.includes('(精确匹配)')) {
            children = options[3].children
        }
        children.push({
            value: key,
            label: name
        })
    }
    return options
}


/**
 * 获取完整规则k-v列表数据
 * @returns {[]}
 */
const getRuleKeyListData = () => {
    return ruleKeyListDataJson;
}

/**
 * 获取规则key列表，只获取key，不获取value
 * @returns {[string]} key列表，数组里每一项为key
 */
const getRuleKeyList = () => {
    return ruleKeyListDataJson.map(item => {
        return item.key
    })
}


/**
 * 获取用户名黑名单数组(模糊匹配)
 * @returns {string[]}
 */
const getNameArr = () => {
    return GM_getValue("name", []);
}

/**
 * 获取用户名黑名单数组(精确匹配)
 * @returns {string[]}
 */
const getPreciseNameArr = () => {
    return GM_getValue("precise_name", []);
}

/**
 *获取用户名黑名单数组(正则匹配)
 * @returns {[]|string}
 */
const getNameCanonical = () => {
    return GM_getValue("nameCanonical", []);
}

/**
 * 获取用户uid黑名单数组(精确匹配)
 * @returns {number[]}
 */
const getPreciseUidArr = () => {
    return GM_getValue("precise_uid", []);
}

/**
 * 获取用户uid白名单数组(精确匹配)
 * @returns {string[]}
 */
const getPreciseUidWhiteArr = () => {
    return GM_getValue("precise_uid_white", []);
}

/**
 * 获取标题黑名单数组(模糊匹配)
 * @returns {string[]}
 */
const getTitleArr = () => {
    return GM_getValue("title", []);
}

/**
 * 获取标题黑名单数组(正则匹配)
 * @returns {string[]}
 */
const getTitleCanonicalArr = () => {
    return GM_getValue("titleCanonical", []);
}

/**
 * 获取评论关键词黑名单数组(模糊匹配)
 * @returns {string[]}
 */
const getCommentOnArr = () => {
    return GM_getValue("commentOn", []);
}

/**
 * 获取评论关键词黑名单数组(正则匹配)
 * @returns {string[]}
 */
const getCommentOnCanonicalArr = () => {
    return GM_getValue("commentOnCanonical", []);
}
/**
 * 获取话题tag标签黑名单数组(精确匹配)
 * @returns {[]|string}
 */
const getPreciseTagArr = () => {
    return GM_getValue("precise_tag", []);
}

/**
 * 获取话题tag标签黑名单数组(模糊匹配)
 * @returns {[]|string}
 */
const getTagArr = () => {
    return GM_getValue("tag", []);
}

/**
 * 获取话题tag标签黑名单数组(正则匹配)
 * @returns {[]|string}
 */
const getTagCanonicalArr = () => {
    return GM_getValue("tagCanonical", []);
}

/**
 * 获取粉丝牌黑名单数组(精确匹配)
 * @returns {[]|string}
 */
const getPreciseFanCardArr = () => {
    return GM_getValue("precise_fanCard", []);
}

/**
 *获取直播分区黑名单数组(精确匹配)
 * @returns {[]|string}
 */
const getPrecisePartitionArr = () => {
    return GM_getValue("precise_partition", []);
}

/**
 * 获取视频tag黑名单数组(模糊匹配)
 * @returns {[string]}
 */
const getVideoTagArr = () => {
    return GM_getValue("videoTag", []);
}

/**
 * 获取视频tag黑名单数组(精确匹配)
 * @returns {[string]}
 */
const getPreciseVideoTagArr = () => {
    return GM_getValue("precise_videoTag", []);
}

/**
 * 获取视频tag黑名单数组(正则匹配)
 * @returns {[string]}
 */
const getVideoTagCanonicalArr = () => {
    return GM_getValue("videoTagCanonical", []);
}

/**
 * 热搜关键词(模糊匹配)
 * @returns {string[]}
 */
const getHotSearchKeyArr = () => {
    return GM_getValue("hotSearchKey", []);
}

/**
 * 热搜关键词(正则匹配)
 * @returns {string[]}
 */
const getHotSearchKeyCanonicalArr = () => {
    return GM_getValue("hotSearchKeyCanonical", []);
}


/**
 *移除指定key类型的规则
 * @param ruleKey {string} mk-key值
 */
const clearKeyItem = (ruleKey) => {
    GM_deleteValue(ruleKey)
}

/**
 * 获取视频tag(组合精确匹配)数组
 * @returns {[[string]]}
 */
const getVideoTagPreciseCombination = () => {
    return GM_getValue("videoTag_preciseCombination", []);
}

/**
 * 设置视频tag(组合精确匹配)数组
 * @param list {Array}
 */
const setVideoTagPreciseCombination = (list) => {
    GM_setValue("videoTag_preciseCombination", list);
}

/**
 * 获取视频bv(精确匹配)数组
 * @returns {string[]}
 */
const getPreciseVideoBV = () => {
    return GM_getValue("precise_video_bv", []);
}


export default {
    getNameArr,
    getPreciseNameArr,
    getNameCanonical,
    getPreciseUidArr,
    getPreciseUidWhiteArr,
    getTitleArr,
    getTitleCanonicalArr,
    getCommentOnArr,
    getCommentOnCanonicalArr,
    getRuleKeyListData,
    getPreciseTagArr,
    getTagArr,
    getTagCanonicalArr,
    getPreciseFanCardArr,
    getPrecisePartitionArr,
    getVideoTagArr,
    getPreciseVideoTagArr,
    getVideoTagCanonicalArr,
    getHotSearchKeyArr,
    getHotSearchKeyCanonicalArr,
    clearKeyItem,
    getSelectOptions,
    getVideoTagPreciseCombination,
    setVideoTagPreciseCombination,
    getRuleKeyList,
    getPreciseVideoBV
}
