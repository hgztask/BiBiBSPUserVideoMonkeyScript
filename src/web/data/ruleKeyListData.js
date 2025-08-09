import gmUtil from "../utils/gmUtil.js";
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
    return gmUtil.getData("name", []);
}

/**
 * 获取用户名黑名单数组(精确匹配)
 * @returns {string[]}
 */
const getPreciseNameArr = () => {
    return gmUtil.getData("precise_name", []);
}

/**
 *获取用户名黑名单数组(正则匹配)
 * @returns {[]|string}
 */
const getNameCanonical = () => {
    return gmUtil.getData("nameCanonical", []);
}

/**
 * 获取用户uid黑名单数组(精确匹配)
 * @returns {number[]}
 */
const getPreciseUidArr = () => {
    return gmUtil.getData("precise_uid", []);
}

/**
 * 获取用户uid白名单数组(精确匹配)
 * @returns {string[]}
 */
const getPreciseUidWhiteArr = () => {
    return gmUtil.getData("precise_uid_white", []);
}

/**
 * 获取标题黑名单数组(模糊匹配)
 * @returns {string[]}
 */
const getTitleArr = () => {
    return gmUtil.getData("title", []);
}

/**
 * 获取标题黑名单数组(正则匹配)
 * @returns {string[]}
 */
const getTitleCanonicalArr = () => {
    return gmUtil.getData("titleCanonical", []);
}

/**
 * 获取评论关键词黑名单数组(模糊匹配)
 * @returns {string[]}
 */
const getCommentOnArr = () => {
    return gmUtil.getData("commentOn", []);
}

/**
 * 获取评论关键词黑名单数组(正则匹配)
 * @returns {string[]}
 */
const getCommentOnCanonicalArr = () => {
    return gmUtil.getData("commentOnCanonical", []);
}
/**
 * 获取话题tag标签黑名单数组(精确匹配)
 * @returns {[]|string}
 */
const getPreciseTagArr = () => {
    return gmUtil.getData("precise_tag", []);
}

/**
 * 获取话题tag标签黑名单数组(模糊匹配)
 * @returns {[]|string}
 */
const getTagArr = () => {
    return gmUtil.getData("tag", []);
}

/**
 * 获取话题tag标签黑名单数组(正则匹配)
 * @returns {[]|string}
 */
const getTagCanonicalArr = () => {
    return gmUtil.getData("tagCanonical", []);
}

/**
 * 获取粉丝牌黑名单数组(精确匹配)
 * @returns {[]|string}
 */
const getPreciseFanCardArr = () => {
    return gmUtil.getData("precise_fanCard", []);
}

/**
 *获取直播分区黑名单数组(精确匹配)
 * @returns {[]|string}
 */
const getPrecisePartitionArr = () => {
    return gmUtil.getData("precise_partition", []);
}

/**
 * 获取视频tag黑名单数组(模糊匹配)
 * @returns {[string]}
 */
const getVideoTagArr = () => {
    return gmUtil.getData("videoTag", []);
}

/**
 * 获取视频tag黑名单数组(精确匹配)
 * @returns {[string]}
 */
const getPreciseVideoTagArr = () => {
    return gmUtil.getData("precise_videoTag", []);
}

/**
 * 获取视频tag黑名单数组(正则匹配)
 * @returns {[string]}
 */
const getVideoTagCanonicalArr = () => {
    return gmUtil.getData("videoTagCanonical", []);
}

/**
 * 热搜关键词(模糊匹配)
 * @returns {string[]}
 */
const getHotSearchKeyArr = () => {
    return gmUtil.getData("hotSearchKey", []);
}

/**
 * 热搜关键词(正则匹配)
 * @returns {string[]}
 */
const getHotSearchKeyCanonicalArr = () => {
    return gmUtil.getData("hotSearchKeyCanonical", []);
}


/**
 *移除指定key类型的规则
 * @param ruleKey {string} mk-key值
 */
const clearKeyItem = (ruleKey) => {
    gmUtil.delData(ruleKey)
}

/**
 * 获取视频tag(组合精确匹配)数组
 * @returns {[[string]]}
 */
const getVideoTagPreciseCombination = () => {
    return gmUtil.getData("videoTag_preciseCombination", []);
}

/**
 * 设置视频tag(组合精确匹配)数组
 * @param list {Array}
 */
const setVideoTagPreciseCombination = (list) => {
    gmUtil.setData("videoTag_preciseCombination", list);
}

/**
 * 获取视频bv(精确匹配)数组
 * @returns {string[]}
 */
const getPreciseVideoBV = () => {
    return gmUtil.getData("precise_video_bv", []);
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
