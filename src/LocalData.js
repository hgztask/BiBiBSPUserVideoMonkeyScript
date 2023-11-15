const LocalData = {
    getSESSDATA() {
        const data = Util.getData("SESSDATA", null);
        if (data === null) return null;
        return "SESSDATA=" + data;
    },
    setSESSDATA(key) {
        Util.setData("SESSDATA", key);
    },
    getWebBili_jct() {
        const data = Util.getCookieList()["bili_jct"];
        if (data === undefined) return null;
        return data;
    },
    getBili_jct() {
        return Util.getData("bili_jct", null);
    },
    setBili_jct(key) {
        Util.setData("bili_jct", key);
    },
    getArrUID() {
        return Util.getData("userUIDArr", []);
    },
    setArrUID(key) {
        Util.setData("userUIDArr", key);
    },
    getArrWhiteUID() {
        return Util.getData("userWhiteUIDArr", []);
    },
    getArrName() {
        return Util.getData("userNameArr", []);
    },
    getArrNameKey() {
        return Util.getData("userNameKeyArr", []);
    },
    getArrTitle() {
        return Util.getData("titleKeyArr", []);
    },
    getArrTitleKeyCanonical() {//标题黑名单模式(正则匹配)
        return Util.getData("titleKeyCanonicalArr", []);
    },
    getCommentOnKeyArr() {//获取评论关键词黑名单模式(模糊匹配)
        return Util.getData("commentOnKeyArr", []);
    },
    getDynamicArr() {//获取动态页屏蔽项目规则--模糊匹配
        return Util.getData("dynamicArr", []);
    },
    getDynamicCanonicalArr() {//获取动态页屏蔽项目规则--正则匹配
        return Util.getData("dynamicCanonicalArr", []);
    },
    //粉丝牌
    getFanCardArr() {
        return Util.getData("fanCardArr", []);
    },
//专栏关键词内容黑名单模式(模糊匹配)
    getContentColumnKeyArr() {
        return Util.getData("contentColumnKeyArr", []);
    },//专栏关键词内容黑名单模式(模糊匹配)
    setContentColumnKeyArr(key) {
        Util.setData("contentColumnKeyArr", key);
    },
    getVideo_zone() {
        return parseInt(Util.getData("video_zone", 1));
    },
    setVideo_zone(key) {
        Util.setData("video_zone", key);
    },
    getWatchedArr() {//获取已观看的视频数组
        return Util.getData("watchedArr", []);
    },
    setWatchedArr(key) {//设置已观看的视频
        Util.setData("watchedArr", key);
    },
    getLookAtItLaterArr() {//获取稍后再看列表
        return Util.getData("lookAtItLaterArr", []);
    },
    setLookAtItLaterArr(arr) {//设置稍后再看列表
        Util.setData("lookAtItLaterArr", arr)
    },
    setPrivacyMode(key) {
        Util.setData("isPrivacyMode", key === true);
    },
    getPrivacyMode() {//隐私模式
        return Util.getData("isPrivacyMode") === true;
    },
    getVideoInt(rule) {
        const data = Util.getData(rule, 0);
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
        isHideVideoRightLayout() {//是否隐藏视频右侧布局
            return Util.getData("isHideVideoRightLayout") === true;
        },
        setHideVideoRightLayout(key) {//是否隐藏视频右侧布局
            Util.setData("isHideVideoRightLayout", key === true);
        },
        isHideVideoTopTitleInfoLayout() {
            return Util.getData("isHideVideoTopTitleInfoLayout") === true;
        },
        setHideVideoTopTitleInfoLayout(key) {
            Util.setData("isHideVideoTopTitleInfoLayout", key === true);
        },
        isHideVideoButtonCommentSections() {//是否隐藏视频底部评论区布局
            return Util.getData("isCommentArea") === true;
        },
        setHideVideoButtonCommentSections(key) {//是隐藏视频底部评论区布局
            Util.setData("isCommentArea", key === true);
        },
        isAutoPlay() {
            return Util.getData("autoPlay", false);
        },
        setAutoPlay(v) {
            Util.setData("autoPlay", v === true)
        },
        getRangePlaySpeed() {
            const data = Util.getData("rangePlaySpeed", 1);
            if (isNaN(data)) {
                return 1;
            }
            return data;
        },
        setRangePlaySpeed(v) {
            Util.setData("rangePlaySpeed", v);
        },
        isVideoEndRecommend() {//是否播放完视频后移除视频推荐
            return Util.getData("videoEndRecommend", false);
        },
        setVideoEndRecommend(bool) {//设置是否播放完视频后移除视频推荐
            Util.setData("videoEndRecommend", bool);
        }
    },
    AccountCenter: {
        getInfo() {//读取本地账户信息
            return Util.getData("AccountCenterInfo", {});
        }, setInfo(key) {//设置本地账户信息
            Util.setData("AccountCenterInfo", key);
        }
    },
    getIsMainVideoList() {//获取是否使用脚本自带的针对于首页的处理效果状态值
        const data = Util.getData("isMainVideoList", false);
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
        getIntervalTime() {//返回锁屏间隔时间戳，默认返回5分钟的时间戳
            return Util.getData("LockScreenIntervalTime", 60000 * 5);
        },
        setPwd(pwd) {
            Util.setData("LockScreenPwd", pwd);
        },
        getPwd() {
            return Util.getData("LockScreenPwd", null);
        },
        getTLastTimestamp() {//返回最后锁屏解锁的时间戳
            return Util.getData("LockScreenLastTimestamp", Date.now());
        },
        setTLastTimestamp(timeNov) {//设置最后锁屏解锁的时间戳
            Util.setData("LockScreenLastTimestamp", timeNov);
        }
    },
    setEnableShortcutKeys(is) {
        Util.setData("enableShortcutKeys", is);
    },
    isEnableShortcutKeys() {//获取是否启用了快捷键功能
        return Util.getData("enableShortcutKeys", true);
    },
    isMyButSHow() {//获取显示控制面板悬浮球值
        return Util.getData("isMyButShow", true);
    },
    setMyButShow(bool) {//设置显示控制面板悬浮球值
        Util.setData("isMyButShow", bool === true)
    }
}