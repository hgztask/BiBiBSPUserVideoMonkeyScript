//{"weight":1}
const LocalData = {
    getSESSDATA() {
        const data = Util.getData("SESSDATA", null);
        if (data === null) return null;
        return "SESSDATA=" + data;
    },
    setSESSDATA(key) {
        Util.setData("SESSDATA", key);
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
    getBvBlacklistArr() {
        return Util.getData("bvBlacklistArr", []);
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
    getLookAtItLaterArr() {//获取稍后再看列表
        return Util.getData("lookAtItLaterArr", []);
    },
    setLookAtItLaterArr(arr) {//设置稍后再看列表
        Util.setData("lookAtItLaterArr", arr)
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
        isVideoEndRecommend() {//是否播放完视频后移除视频推荐
            return Util.getData("videoEndRecommend", false);
        },
        setVideoEndRecommend(bool) {//设置是否播放完视频后移除视频推荐
            Util.setData("videoEndRecommend", bool);
        },
        isSubItemButShow() {//是否要展开视频页右侧的相关悬浮按钮
            return Util.getData("subItemButShow", true);
        },
        setSubItemButShow(bool) {//展开视频页右侧的相关悬浮按钮
            Util.setData("subItemButShow", bool === true);
        },
    },
    AccountCenter: {
        getInfo() {//读取本地账户信息
            return Util.getData("AccountCenterInfo", {});
        }, setInfo(key) {//设置本地账户信息
            Util.setData("AccountCenterInfo", key);
        }
    },
    isDShieldPanel() {//是否开启禁用快捷悬浮屏蔽面板自动显示
        return Util.getData("isDShieldPanel") === true;
    },
    setDShieldPanel(v) {//设置禁用快捷悬浮屏蔽面板自动显示
        Util.setData("isDShieldPanel", v === true)
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
    },
    localKeyCode: {//获取设置按键值
        __getKCArr() {
            const tempKCArr = [];
            if (tempKCArr.length !== 0) return tempKCArr;
            tempKCArr.push(this.getDHMainPanel_KC());
            tempKCArr.push(this.getQFlBBFollowsTheMouse_KC());
            tempKCArr.push(this.getFixedQuickSuspensionPanelValue_KC());
            tempKCArr.push(this.getDTQFSPToTriggerDisplay_KC());
            return tempKCArr;
        },
        __defGet(defValue, key) {
            return Util.getData(key, defValue);
        },
        __defSet(key, name) {
            if (this.__getKCArr().includes(key)) {
                return false;
            }
            Util.setData(name, key);
            return true;
        },
        getDHMainPanel_KC() {//获取显隐主面板按键
            return this.__defGet(`\``, "DHMainPanel_KC");
        },
        setDHMainPanel_KC(keyCode) {//设置显隐主面板按键
            return this.__defSet(keyCode, "DHMainPanel_KC");
        },
        getQFlBBFollowsTheMouse_KC() {//获取悬浮球跟随鼠标移动的按键
            return this.__defGet("1", "QFlBBFollowsTheMouse_KC");
        },
        setQFlBBFollowsTheMouse_KC(keyCode) {//设置悬浮球跟随鼠标移动的按键
            return this.__defSet(keyCode, "QFlBBFollowsTheMouse_KC");
        },
        getFixedQuickSuspensionPanelValue_KC() {//获取固定悬浮屏蔽面板值的按键
            return this.__defGet("2", "FixedQuickSuspensionPanelValue_KC");
        },
        setFixedQuickSuspensionPanelValue_KC(keyCode) {//设置固定悬浮屏蔽面板值的按键
            return this.__defSet(keyCode, "FixedQuickSuspensionPanelValue_KC");
        },
        getHideQuickSuspensionBlockButton_KC() {//获取主动隐藏隐藏快捷悬浮面板的按键
            return this.__defGet("3", "HideQuickSuspensionBlockButton_KC");
        },
        setHideQuickSuspensionBlockButton_KC(key) {//设置主动隐藏快捷悬浮面板的按键
            return this.__defSet(key, "HideQuickSuspensionBlockButton_KC");
        },
        getDTQFSPToTriggerDisplay_KC() {//获取切换快捷悬浮屏蔽面板自动显示状态的按键
            return this.__defGet("4", "DTQFSPToTriggerDisplay_KC");
        },
        setDTQFSPToTriggerDisplay_KC(keyCode) {//设置切换快捷悬浮屏蔽面板自动显示状态的按键
            return this.__defSet(keyCode, "DTQFSPToTriggerDisplay_KC");
        }
    },
    disableKeyboardShortcuts: {//禁用快捷键配置
        getHSMainPanel() {//获取禁用显隐主面板按键
            return Util.getData("HSMainPanel_DK", false);
        },
        getDShieldPanel() {//获取禁用快捷悬浮屏蔽面板自动显示
            return Util.getData("DShieldPanel_DK", false);
        },
    }
}
