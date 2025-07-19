import gmUtil from "../utils/gmUtil.js";

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
    for (let {name, key} of ruleKeyListData) {
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
 * 规则key列表
 */
const ruleKeyListData = [{
    key: "name",
    name: "用户名(模糊匹配)",
    oldKey: "userNameKeyArr",
    oldName: "用户名黑名单模式(模糊匹配)"
}, {
    key: "precise_name",
    name: "用户名(精确匹配)",
    oldKey: "userNameArr",
    oldName: "用户名黑名单模式(精确匹配)"
}, {
    key: "nameCanonical",
    name: "用户名(正则匹配)"
}, {
    key: "precise_uid",
    name: "用户uid(精确匹配)",
    oldKey: "userUIDArr",
    oldName: "用户uid黑名单模式(精确匹配)"
}, {
    key: "precise_uid_white",
    name: "用户uid白名单(精确匹配)",
    oldKey: "userWhiteUIDArr",
    oldName: "用户uid白名单模式(精确匹配)"
}, {
    key: "title",
    name: "标题(模糊匹配)",
    oldKey: "titleKeyArr",
    oldName: "标题黑名单模式(模糊匹配)"
}, {
    key: "titleCanonical",
    name: "标题(正则匹配)",
    oldKey: "titleKeyCanonicalArr",
    oldName: "标题黑名单模式(正则匹配)"
}, {
    key: "commentOn",
    name: "评论关键词(模糊匹配)",
    oldKey: "commentOnKeyArr",
    oldName: "评论关键词黑名单模式(模糊匹配)"
}, {
    key: "commentOnCanonical",
    name: "评论关键词(正则匹配)",
    oldKey: "contentOnKeyCanonicalArr",
    oldName: "评论关键词黑名单模式(正则匹配)"
}, {
    key: "precise_fanCard",
    name: "粉丝牌(精确匹配)",
    oldKey: "fanCardArr",
    oldName: "粉丝牌黑名单模式(精确匹配)"
}, {
    key: "dynamic",
    name: "动态关键词(模糊匹配)",
    oldKey: "dynamicArr",
    oldName: "动态关键词内容黑名单模式(模糊匹配)"
}, {
    key: "dynamicCanonical",
    name: "动态关键词(正则匹配)",
}, {
    key: "precise_tag",
    name: "话题tag标签(精确匹配)",
}, {
    key: "tag",
    name: "话题tag标签(模糊匹配)",
}, {
    key: "tagCanonical",
    name: "话题tag标签(正则匹配)"
}, {
    key: "precise_partition",
    name: "直播分区(精确匹配)"
}, {
    key: 'videoTag',
    name: '视频tag(模糊匹配)',
}, {
    key: 'precise_videoTag',
    name: '视频tag(精确匹配)',
}, {
    key: 'videoTagCanonical',
    name: '视频tag(正则匹配)',
}, {
    key: 'videoTag_preciseCombination',
    name: '视频tag(组合精确匹配)'
}, {
    key: 'hotSearchKey',
    name: '热搜关键词(模糊匹配)',
}, {
    key: 'hotSearchKeyCanonical',
    name: '热搜关键词(正则匹配)'
}, {
    key: 'precise_avatarPendantName',
    name: '头像挂件名(精确匹配)'
}, {
    key: 'avatarPendantName',
    name: '头像挂件名(模糊匹配)'
}, {
    key: 'signature',
    name: '用户签名(模糊匹配)'
}, {
    key: 'signatureCanonical',
    name: '用户签名(正则匹配)'
}, {
    key: 'videoDesc',
    name: '视频简介(模糊匹配)'
}, {
    key: 'videoDescCanonical',
    name: '视频简介(正则匹配)'
}, {
    key: 'precise_video_bv',
    name: '视频bv号(精确匹配)'
}
]

//其他参数规则列表
const otherKeyListData = [
    {
        name: '最小播放量',
        value: 'nMinimumPlay',
        //关联
        associated: 'nMaximumPlayback',
        defVal: -1
    },
    {
        name: '最大播放量',
        value: 'nMaximumPlayback',
        associated: 'nMinimumPlay',
        //最大
        bLarge: true,
        defVal: -1
    },
    {
        name: '最小弹幕数',
        value: 'nMinimumBarrage',
        associated: 'nMaximumBarrage',
        defVal: -1
    },
    {
        name: '最大弹幕数',
        value: 'nMaximumBarrage',
        associated: 'nMinimumBarrage',
        bLarge: true,
        defVal: -1
    },
    {
        name: '最小时长',
        value: 'nMinimumDuration',
        associated: 'nMaximumDuration',
        defVal: -1
    },
    {
        name: '最大时长',
        value: 'nMaximumDuration',
        associated: 'nMinimumDuration',
        bLarge: true,
        defVal: -1
    },
    {
        name: '最小用户等级过滤',
        value: 'nMinimumLevel',
        associated: 'nMaximumLevel',
        defVal: -1
    },
    {
        name: '最大用户等级过滤',
        value: 'nMaximumLevel',
        associated: 'nMinimumLevel',
        bLarge: true,
        defVal: -1
    }
]


/**
 * 获取完整规则k-v列表数据
 * @returns {[]}
 */
const getRuleKeyListData = () => {
    return ruleKeyListData;
}

/**
 * 获取规则key列表，只获取key，不获取value
 * @returns {[string]} key列表，数组里每一项为key
 */
const getRuleKeyList = () => {
    return ruleKeyListData.map(item => {
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
    otherKeyListData,
    clearKeyItem,
    getSelectOptions,
    getVideoTagPreciseCombination,
    setVideoTagPreciseCombination,
    getRuleKeyList,
    getPreciseVideoBV
}
