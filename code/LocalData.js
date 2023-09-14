const LocalData = {
    getSESSDATA() {
        const data = Util.getData("SESSDATA");
        if (data === undefined || data === null || data === "") {
            return null;
        }
        return "SESSDATA=" + data;
    },
    setSESSDATA(key) {
        Util.setData("SESSDATA", key);
    },
    getWebBili_jct() {
        const data = Util.getCookieList()["bili_jct"];
        if (data === undefined) {
            return null;
        }
        return data;
    },
    getBili_jct() {
        const data = Util.getData("bili_jct");
        if (data === undefined || data === null === "") {
            return null;
        }
        return data;
    },
    setBili_jct(key) {
        Util.setData("bili_jct", key);
    },
    temp(key) {
        const data = Util.getData(key);
        if (data === undefined || data === null) {
            return [];
        }
        return data;
    },
    getArrUID() {
        return this.temp("userUIDArr");
    },
    setArrUID(key) {
        Util.setData("userUIDArr", key);
    },
    getArrWhiteUID() {
        return this.temp("userWhiteUIDArr");
    },
    setArrWhiteUID(key) {
        Util.setData("userWhiteUIDArr", key);
    },
    getArrName() {
        return this.temp("userNameArr");
    },
    setArrName(key) {
        Util.setData("userNameArr", key);
    },
    getArrNameKey() {
        return this.temp("userNameKeyArr");
    },
    setArrNameKey(key) {
        Util.setData("userNameKeyArr", key);
    },
    getArrTitle() {
        return this.temp("titleKeyArr");
    },
    setArrTitle(key) {
        Util.setData("titleKeyArr", key);
    },
    getArrTitleKeyCanonical() {//标题黑名单模式(正则匹配)
        return this.temp("titleKeyCanonicalArr");
    },
    setArrTitleKeyCanonical(key) {//标题黑名单模式(正则匹配)
        Util.setData("titleKeyCanonicalArr", key);
    },
    getArrContentOnKeyCanonicalArr() {//获取评论关键词黑名单模式(正则匹配)
        return this.temp("contentOnKeyCanonicalArr");
    },
    getCommentOnKeyArr() {//获取评论关键词黑名单模式(模糊匹配)
        return this.temp("commentOnKeyArr");
    },
    setCommentOnKeyArr(data) {//设置评论关键词黑名单模式(模糊匹配)
        return Util.setData("commentOnKeyArr", data);
    },
    setArrContentOnKeyCanonicalArr(key) {//设置评论关键词黑名单模式(正则匹配)
        Util.setData("contentOnKeyCanonicalArr", key);
    },
    getDynamicArr() {//获取动态页屏蔽项目规则--模糊匹配
        return this.temp("dynamicArr");
    },
    setDynamicArr(key) {//设置动态页屏蔽项目规则-模糊匹配
        Util.setData("dynamicArr", key);
    },
    getDynamicCanonicalArr() {//获取动态页屏蔽项目规则--正则匹配
        return this.temp("dynamicCanonicalArr");
    },
    setDynamicCanonicalArr(key) {//设置动态页屏蔽项目规则-正则匹配
        Util.setData("dynamicCanonicalArr", key);
    },//粉丝牌
    getFanCardArr() {
        return this.temp("fanCardArr");
    },//粉丝牌
    setFanCardArr(key) {
        Util.setData("fanCardArr", key);
    },//专栏关键词内容黑名单模式(模糊匹配)
    getContentColumnKeyArr() {
        return this.temp("contentColumnKeyArr");
    },//专栏关键词内容黑名单模式(模糊匹配)
    setContentColumnKeyArr(key) {
        Util.setData("contentColumnKeyArr", key);
    },
    getVideo_zone() {
        const data = this.temp("video_zone");
        if (data === undefined || data === null) {
            return 1;
        }
        return parseInt(data);
    },
    setVideo_zone(key) {
        Util.setData("video_zone", key);
    },
    getWatchedArr() {//获取已观看的视频数组
        return this.temp("watchedArr");
    },
    setWatchedArr(key) {//设置已观看的视频
        Util.setData("watchedArr", key);
    },
    getLookAtItLaterArr() {//获取稍后再看列表
        return this.temp("lookAtItLaterArr");
    },
    setLookAtItLaterArr(arr) {//设置稍后再看列表
        Util.setData("lookAtItLaterArr", arr)
    },
    getHideVideoButtonCommentSections() {//是否隐藏视频底部评论区布局
        return Util.getData("isCommentArea") === true;
    },
    setHideVideoButtonCommentSections(key) {//是隐藏视频底部评论区布局
        Util.setData("isCommentArea", key === true);
    },
    setPrivacyMode(key) {
        Util.setData("isPrivacyMode", key === true);
    },
    getPrivacyMode() {//隐私模式
        return Util.getData("isPrivacyMode") === true;
    },
    setBWebNone(key) {//不可见模式
        Util.setData("isBWebNone", key === true);
    },
    getBWebNone() {//不可见模式
        return Util.getData("isBWebNone") === true;
    },
    getVideoInt(rule) {
        const data = Util.getData(rule);
        if (data === undefined || data === null) {
            return 0;
        }
        return parseInt(data);
    },
    video: {
        getFilterSMin() {//获取限制时长最小值
            return LocalData.getVideoInt("filterSMin");
        },
        getfilterSMax() {//获取时长最大值，为0则不生效
            return LocalData.getVideoInt("filterSMax");
        },
        getBroadcastMin() {//获取播放量最大值，为0则不生效
            return LocalData.getVideoInt("broadcastMin");
        },
        getBroadcastMax() {//获取播放量最大值，为0则不生效
            return LocalData.getVideoInt("broadcastMax");
        },
        getBarrageQuantityMin() {//获取弹幕量最小值，为0则不生效
            return LocalData.getVideoInt("barrageQuantityMin");
        },
        getBarrageQuantityMax() {//设置弹幕量最大值，为0则不生效
            return LocalData.getVideoInt("barrageQuantityMax");
        },
        getHideVideoRightLayout() {//是否隐藏视频右侧布局
            return Util.getData("isHideVideoRightLayout") === true;
        },
        setHideVideoRightLayout(key) {//是否隐藏视频右侧布局
            Util.setData("isHideVideoRightLayout", key === true);
        },
        getHideVideoTopTitleInfoLayout() {
            return Util.getData("isHideVideoTopTitleInfoLayout") === true;
        },
        setHideVideoTopTitleInfoLayout(key) {
            Util.setData("isHideVideoTopTitleInfoLayout", key === true);
        },
    },
    AccountCenter: {
        getInfo() {//读取本地账户信息
            const data = Util.getData("AccountCenterInfo");
            if (data === undefined || data === null) {
                return {};
            }
            return data;
        }, setInfo(key) {//设置本地账户信息
            Util.setData("AccountCenterInfo", key);
        }
    },
    getIsMainVideoList() {//获取是否使用脚本自带的针对于首页的处理效果状态值
        const data = Util.getData("isMainVideoList");
        if (data === null) {
            return false;
        }
        return Util.isBoolean(data);

    },
    setIsMainVideoList(bool) {//设置是否使用脚本自带的针对于首页的处理效果状态值
        Util.setData("isMainVideoList", Util.isBoolean(bool));
    },
    isDShieldPanel() {//是否开启禁用快捷悬浮屏蔽面板自动显示
        return Util.getData("isDShieldPanel") === true;
    },
    setDShieldPanel(v) {//设置禁用快捷悬浮屏蔽面板自动显示
        Util.setData("isDShieldPanel", v === true)
    },
    LockScreen: {
        setState(bool) {
            Util.setData("LockScreenState", bool === true);
        },
        getState() {//返回是否开启锁屏
            return Util.getData("LockScreenState", false);
        },
        setIntervalTime(timeInt) {
            Util.setData("LockScreenIntervalTime", timeInt);
        },
        getIntervalTime() {//返回锁屏间隔时间戳
            return Util.getData("LockScreenIntervalTime", 0);
            ;
        },
        setPwd(pwd) {
            Util.setData("LockScreenPwd", pwd);
        },
        getPwd() {
            return Util.getData("LockScreenPwd", null);
        },
        getTLastTimestamp() {//返回最后记录的时间戳
            return Util.getData("LockScreenLastTimestamp", 0);
        },
        setTLastTimestamp(timeNov) {
            Util.setData("LockScreenLastTimestamp", timeNov);
        }
    },
}