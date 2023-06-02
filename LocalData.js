const LocalData = {
    getSESSDATA: function () {
        const data = Util.getData("SESSDATA");
        if (data === undefined || data === null || data === "") {
            return null;
        }
        return "SESSDATA=" + data;
    },
    setSESSDATA: function (key) {
        Util.setData("SESSDATA", key);
    },
    getWebBili_jct: function () {
        const data = Util.getCookieList()["bili_jct"];
        if (data === undefined) {
            return null;
        }
        return data;
    },
    getBili_jct: function () {
        const data = Util.getData("bili_jct");
        if (data === undefined || data === null === "") {
            return null;
        }
        return data;
    },
    setBili_jct: function (key) {
        Util.setData("bili_jct", key);
    },
    temp: function (key) {
        const data = Util.getData(key);
        if (data === undefined || data === null) {
            return [];
        }
        return data;
    },
    getArrUID: function () {
        return this.temp("userUIDArr");
    },
    setArrUID: function (key) {
        Util.setData("userUIDArr", key);
    },
    getArrWhiteUID: function () {
        return this.temp("userWhiteUIDArr");
    },
    setArrWhiteUID: function (key) {
        Util.setData("userWhiteUIDArr", key);
    },
    getArrName: function () {
        return this.temp("userNameArr");
    },
    setArrName: function (key) {
        Util.setData("userNameArr", key);
    },
    getArrNameKey: function () {
        return this.temp("userNameKeyArr");
    },
    setArrNameKey: function (key) {
        Util.setData("userNameKeyArr", key);
    },
    getArrTitle: function () {
        return this.temp("titleKeyArr");
    },
    setArrTitle: function (key) {
        Util.setData("titleKeyArr", key);
    }, getArrTitleKeyCanonical: function () {
        return this.temp("titleKeyCanonicalArr");
    },
    setArrTitleKeyCanonical: function (key) {
        Util.setData("titleKeyCanonicalArr", key);
    },//获取评论关键词黑名单模式(正则匹配)
    getArrContentOnKeyCanonicalArr: function () {
        return this.temp("contentOnKeyCanonicalArr");
    },//设置评论关键词黑名单模式(正则匹配)
    setArrContentOnKeyCanonicalArr: function (key) {
        Util.setData("contentOnKeyCanonicalArr", key);
    },//获取动态页屏蔽项目规则--模糊匹配
    getDynamicArr: function () {
        return this.temp("dynamicArr");
    }, //设置动态页屏蔽项目规则-模糊匹配
    setDynamicArr: function (key) {
        Util.setData("dynamicArr", key);
    }, //粉丝牌
    getFanCardArr: function () {
        return this.temp("fanCardArr");
    },//粉丝牌
    setFanCardArr: function (key) {
        Util.setData("fanCardArr", key);
    },//专栏关键词内容黑名单模式(模糊匹配)
    getContentColumnKeyArr: function () {
        return this.temp("contentColumnKeyArr");
    },//专栏关键词内容黑名单模式(模糊匹配)
    setContentColumnKeyArr: function (key) {
        Util.setData("contentColumnKeyArr", key);
    },
    getVideo_zone: function () {
        const data = this.temp("video_zone");
        if (data === undefined || data === null) {
            return 1;
        }
        return parseInt(data);
    },
    setVideo_zone: function (key) {
        Util.setData("video_zone", key);
    },//获取已观看的视频数组
    getWatchedArr: function () {
        return this.temp("watchedArr");
    },//设置已观看的视频
    setWatchedArr: function (key) {
        Util.setData("watchedArr", key);
    },//获取已观看的视频
    getRuleApi: function () {
        const data = Util.getData("ruleApiUrl");
        if (data === undefined || data === null) {
            return null;
        }
        return data;
    }, setRuleApi: function (url) {
        Util.setData("ruleApiUrl", url);
    },
    getDelVideoCommentSections: function () {//是否移除评论区布局
        const data = Util.getData("isCommentArea");
        return data === true;

    },
    setDelVideoCommentSections: function (key) {//是否移除评论区布局
        Util.setData("isCommentArea", key === true ? true : false);
    },
    setPrivacyMode: function (key) {
        Util.setData("isPrivacyMode", key === true);
    },
    getPrivacyMode: function () {
        return Util.getData("isPrivacyMode") === true;
    },
    getVideoInt: function (rule) {
        const data = Util.getData(rule);
        if (data === undefined || data === null) {
            return 0;
        }
        return parseInt(data);
    },
    video: {
        getFilterSMin: function () {//获取限制时长最小值
            return LocalData.getVideoInt("filterSMin");
        },
        getfilterSMax: function () {//获取时长最大值，为0则不生效
            return LocalData.getVideoInt("filterSMax");
        },
        getBroadcastMin: function () {//获取播放量最大值，为0则不生效
            return LocalData.getVideoInt("broadcastMin");
        },
        getBroadcastMax: function () {//获取播放量最大值，为0则不生效
            return LocalData.getVideoInt("broadcastMax");
        },
        getBarrageQuantityMin: function () {//获取弹幕量最小值，为0则不生效
            return LocalData.getVideoInt("barrageQuantityMin");
        },
        getBarrageQuantityMax: function () {//设置弹幕量最大值，为0则不生效
            return LocalData.getVideoInt("barrageQuantityMax");
        }
    },
    AccountCenter: {
        getInfo: function () {//读取本地账户信息
            const data = Util.getData("AccountCenterInfo");
            if (data === undefined || data === null) {
                return {};
            }
            return data;
        }, setInfo: function (key) {//设置本地账户信息
            Util.setData("AccountCenterInfo", key);
        },
        info: {}

    }
}