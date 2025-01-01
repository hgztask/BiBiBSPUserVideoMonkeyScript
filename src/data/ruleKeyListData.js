import gmUtil from "../utils/gmUtil.js";

/**
 * 规则key列表
 */
const ruleKeyListData = [
    {
        key: "name",
        name: "用户名黑名单(模糊匹配)",
        oldKey: "userNameKeyArr",
        oldName: "用户名黑名单模式(模糊匹配)"
    },
    {
        key: "precise_name",
        name: "用户名黑名单(精确匹配)",
        oldKey: "userNameArr",
        oldName: "用户名黑名单模式(精确匹配)"
    }, {
        key: "nameCanonical",
        name: "用户名黑名单(正则匹配)"
    },
    {
        key: "precise_uid",
        name: "用户uid黑名单(精确匹配)",
        oldKey: "userUIDArr",
        oldName: "用户uid黑名单模式(精确匹配)"
    },
    {
        key: "precise_uid_white",
        name: "用户uid白名单(精确匹配)",
        oldKey: "userWhiteUIDArr",
        oldName: "用户uid白名单模式(精确匹配)"
    }, {
        key: "title",
        name: "标题黑名单(模糊匹配)",
        oldKey: "titleKeyArr",
        oldName: "标题黑名单模式(模糊匹配)"
    }, {
        key: "titleCanonical",
        name: "标题黑名单(正则匹配)",
        oldKey: "titleKeyCanonicalArr",
        oldName: "标题黑名单模式(正则匹配)"
    }, {
        key: "commentOn",
        name: "评论关键词黑名单(模糊匹配)",
        oldKey: "commentOnKeyArr",
        oldName: "评论关键词黑名单模式(模糊匹配)"
    }, {
        key: "commentOnCanonical",
        name: "评论关键词黑名单(正则匹配)",
        oldKey: "contentOnKeyCanonicalArr",
        oldName: "评论关键词黑名单模式(正则匹配)"
    }, {
        key: "contentOn",
        name: "评论内容黑名单(模糊匹配)",
        oldKey: "contentOnKeyArr",
        oldName: "评论内容黑名单模式(模糊匹配)"
    }, {
        key: "precise_fanCard",
        name: "粉丝牌黑名单(精确匹配)",
        oldKey: "fanCardArr",
        oldName: "粉丝牌黑名单模式(精确匹配)"
    }, {
        key: "dynamic",
        name: "动态关键词黑名单(模糊匹配)",
        oldKey: "dynamicArr",
        oldName: "动态关键词内容黑名单模式(模糊匹配)"
    }, {
        key: "precise_tag",
        name: "话题tag标签黑名单(精确匹配)",
    }
    , {
        key: "tag",
        name: "话题tag标签黑名单(模糊匹配)",
    }, {
        key: "tagCanonical",
        name: "话题tag标签黑名单(正则匹配)"
    }, {
        key: "precise_partition",
        name: "直播分区黑名单(精确匹配)"
    }
]

/**
 * 获取规则key列表
 * @returns {[]}
 */
const getRuleKeyListData = () => {
    return ruleKeyListData;
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
 * @returns {string[]}
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
const getPrecisePartitionArr=()=>{
    return gmUtil.getData("precise_partition", []);
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
    getPrecisePartitionArr
}
