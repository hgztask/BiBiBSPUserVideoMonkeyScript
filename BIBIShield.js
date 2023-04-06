// ==UserScript==
// @name         b站屏蔽增强器
// @namespace    http://tampermonkey.net/
// @license      MIT
// @version      1.1.31
// @description  根据用户名、uid、视频关键词、言论关键词和视频时长进行屏蔽和精简处理(详情看脚本主页描述)，针对github站内所有的链接都从新的标签页打开，而不从当前页面打开
// @author       byhgz
// @exclude      *://message.bilibili.com/pages/nav/header_sync
// @exclude      *://message.bilibili.com/pages/nav/index_new_pc_sync
// @exclude      *://live.bilibili.com/blackboard/dropdown-menu.html
// @exclude      *://live.bilibili.com/p/html/live-web-mng/*
// @exclude      *://www.bilibili.com/correspond/*
// @match        https://www.bilibili.com/v/channel/*?tab=multiple
// @match        *://search.bilibili.com/*
// @match        *://www.bilibili.com/v/food/*
// @match        *://www.bilibili.com/v/channel/*
// @match        *://message.bilibili.com/*
// @match        *://www.bilibili.com/read/*
// @match        *://www.bilibili.com/v/topic/detail/?topic_id=*
// @match        *://www.bilibili.com/v/kichiku/*
// @match        *://t.bilibili.com/*
// @match        *://space.bilibili.com/*
// @match        *://www.bilibili.com/video/*
// @match        *://live.bilibili.com/?spm_id_from=*
// @match        *://live.bilibili.com/p/eden/area-tags?*
// @match        *://live.bilibili.com/*
// @match        *://www.bilibili.com/opus/*
// @match        *://www.bilibili.com/*
// @match        *://www.youtube.com/*
// @match        *://github.com/*
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @icon         https://static.hdslb.com/images/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==


const rule = {
    ruleLength: function () {
        function setText(arr, id) {
            if (arr !== undefined && arr !== null) {
                $(id).text(arr.length);
            }
        }

        setText(localData.getArrName(), "#textUserName");
        setText(localData.getArrNameKey(), "#textUserNameKey");
        setText(localData.getArrUID(), "#textUserUID");
        setText(localData.getArrWhiteUID(), "#textUserBName");
        setText(localData.getArrTitle(), "#textUserTitle");
        setText(localData.getArrTitleKeyCanonical(), "#textUserTitleCanonical");
        setText(util.getData("commentOnKeyArr"), "#textContentOn");
        setText(localData.getArrContentOnKeyCanonicalArr(), "#textContentOnCanonical");
        setText(util.getData("fanCardArr"), "#textFanCard");
        setText(util.getData("contentColumnKeyArr"), "#textColumn");
    },
    showInfo: function () {
        const isDShielPanel = util.getData("isDShielPanel");
        const isAutoPlay = util.getData("autoPlay");
        const dShielPanel = $("#DShielPanel");
        const autoPlayCheckbox = $("#autoPlayCheckbox");
        if (isDShielPanel === null || isDShielPanel === undefined) {
            dShielPanel.attr("checked", false);
        } else {
            dShielPanel.attr("checked", isDShielPanel);
        }
        if (isAutoPlay === null || isAutoPlay === undefined) {
            autoPlayCheckbox.attr("checked", false);
        } else {
            autoPlayCheckbox.attr("checked", isAutoPlay);
        }


    },
    //视频参数
    videoData: {
        /**
         *设置时长最小值，单位秒
         * 设置为 0，则不需要根据视频时长过滤
         * 说明，比如我先过滤60秒以内的视频，即60以内的视频都会被屏蔽掉，限定允许出现的最小时长
         * 可以这样填写
         * 5*60
         * 上面例子意思就是5分钟，同理想要6分钟就6*60，想要精确控制到秒就填写对应秒数即可
         * @type {number}
         */
        filterSMin: 0,
        /**
         * 设置时长最大值，单位秒
         * 设置为 0，则不需要根据视频时长过滤
         * 说明，允许出现的最大视频时长，超出该时长的都会被屏蔽掉，限定允许出现的最大时长
         * 可以这样填写
         * 5*60
         * 上面例子意思就是5分钟，同理想要6分钟就6*60，想要精确控制到秒就填写对应秒数即可
         * @type {number}
         */
        filterSMax: 0,
        //设置播放量最小值，为0则不生效
        broadcastMin: 0,
        //设置播放量最大值，为0则不生效
        broadcastMax: 0,
        //设置弹幕量最小值，为0则不生效
        barrageQuantityMin: 0,
        //设置弹幕量最大值，为0则不生效
        barrageQuantityMax: 0,
        //是否移除播放页右侧的的布局，其中包括【视频作者】【弹幕列表】【视频列表】和右侧相关的广告
        isRhgthlayout: false,
        //是否要移除右侧播放页的视频列表
        isrigthVideoList: false,
        //是否移除评论区布局
        isCommentArea: false,
        //是否移除视频页播放器下面的标签，也就是Tag
        isTag: false,
        //是覅移除视频页播放器下面的简介
        isDesc: false,
        //是否移除视频播放完之后的，推荐视频
        isVideoEndRecommend: true,
        //是否取消对播放页右侧列表的视频内容过滤屏蔽处理，如果播放页出现，加载不出页面图片，情况建议开启该功能
        isRightVideo: false,
        //是否点击了水平翻转
        flipHorizontal: false,
        //是否点击了垂直翻转
        flipVertical: false
    },
    //动态相关配置信息
    trendsData: {
        //是否移除顶栏
        isTop: false,
        //是否移除右侧布局
        isRightLayout: false,
        //是覅移除话题布局上面的公告栏
        isBiliDynBanner: true,
    },
    /**
     *直播间的相关配置信息
     */
    liveData: {
        //是否移除直播间底部的全部信息，包括动态和主播公告和简介及荣誉
        bottomElement: true,
        //是否移除直播间顶部的信息（包括顶部标题栏）
        topElement: true,
        //是否移除直播间播放器头部的用户信息以及直播间基础信息
        isheadInfoVm: true,
        //是否移除直播间右侧的聊天布局
        isRightChatLayout: false,
        //是否移除直播间右侧的聊天内容
        isChatHistoryPanel: false,
        //是否移除右侧的聊天内容中的红色的系统提示
        isSystemRedTip: true,
        //是否移除右侧聊天内容中的用户进入房间提示
        isEnterLiveRoomTip: true,
        //是否移除左上角的b站直播logo
        topLeftLogo: true,
        //是否移除左上角的首页项目
        topLeftHomeTitle: true,
        //是否移除直播间底部的的简介和主播荣誉
        bottomIntroduction: false,
        //是否移除直播间的主播公告布局
        container: false,
        //是否移除直播首页右侧的悬浮按钮
        rightSuspendButton: true,
        //是否移除提示购物车
        isShoppingCartTip: true,
        //是否移除购物车
        isShoppingCart: true,
        //是否移除直播间的背景图
        isDelbackground: true,
        /**
         * 是否屏蔽直播间底部动态
         */
        liveFeed: false,
        //要移除顶部左侧的选项（不包括右侧），但必须要有该选项，比如下面例子的，赛事，就移除其，如需要添加别的在该数组后面添加即可，如["赛事","生活"]
        topLeftBar: ["赛事", "购物", "知识", "生活", "电台", "娱乐"],
        //是否移除礼物栏
        delGiftLayout: true,
        //是否移除立即上舰
        isEmbark: true,
        //是否移除礼物栏的的礼物部分
        isGift: true,
        //直播分区时屏蔽的类型，比如在手游直播界面里的全部中，会屏蔽对应的类型房间号
        classify: ["和平精英"],
        //是否移除悬浮的233娘
        is233Ma: true,
        //是否移除右侧悬浮靠边按钮-如实验-关注
        isRightSuspenBotton: true,
        //是否移除直播水印
        isLiveRoomWatermark: true

    }
}


//是否隐藏了面板
let myidClickIndex = true;
const home = {
    //首页下拉底部时依次加载视频的个数
    videoIndex: 20,
    background: {//主面板背景颜色及透明度
        r: 92,
        g: 80,
        b: 80,
        a: 1
    },
    /**
     *
     * @return {string|}
     */
    getPushType: function () {
        const data = util.getData("pushType");
        if (data === null || data === undefined) {
            return "专区";
        }
        return data;
    },
    setPushType: function (key) {
        util.setData("pushType", key);
    },
    getBackgroundStr: function () {
        return util.getRGBA(this.background.r, this.background.g, this.background.b, this.background.a);
    },
    //调整首页样式
    stypeBody: function () {
        document.querySelector(".bili-header__banner").remove()//删除首页顶部的图片位置的布局
        const interval = setInterval(() => {
            try {
                const headerChannelE = document.getElementsByClassName("bili-header__channel")[0];
                headerChannelE.style.padding = 0;//调整-首页header按钮栏
                headerChannelE.style.height = "auto";//调整其与下面控件的距离
                document.getElementsByClassName("bili-feed4-layout")[0].style.padding = 0;//调整视频列表左右边距为0

                document.querySelector("#i_cecream > div.bili-feed4 > div.bili-header.large-header > div.bili-header__bar").style.position = "inherit";//调整顶栏样式
                document.querySelector("#i_cecream > div.bili-feed4 > div.header-channel").remove();//调整往下滑动之后顶部的悬浮栏
                clearInterval(interval)
            } catch (e) {
                util.print("样式修改失败")
            }
        }, 500);
    },
    /**
     * 屏蔽首页对应的视频
     * @param {String} str 首页视频元素
     */
    startShieldMainVideo: function (str) {
        const interval = setInterval(() => {
            let list = document.getElementsByClassName(str);
            if (list.length === 0) {
                return;
            }
            while (true) {
                const tempLength = list.length;
                for (let v of list) {
                    let videoInfo, title, upName, upSpatialAddress, videoTime, playbackVolume;//可以一排定义
                    try {
                        videoInfo = v.getElementsByClassName("bili-video-card__info--right")[0];
                        //视频标题
                        title = videoInfo.getElementsByClassName("bili-video-card__info--tit")[0].getAttribute("title");
                        //用户名
                        upName = videoInfo.getElementsByClassName("bili-video-card__info--author")[0].getAttribute("title");
                        //用户空间地址
                        upSpatialAddress = videoInfo.getElementsByClassName("bili-video-card__info--owner")[0].getAttribute("href");
                        videoTime = v.getElementsByClassName("bili-video-card__stats__duration")[0].textContent;//视频的时间
                        const topInfo = v.getElementsByClassName("bili-video-card__stats--left")[0].getElementsByClassName("bili-video-card__stats--item");//1播放量2弹幕数
                        playbackVolume = topInfo[0].textContent;
                    } catch (e) {
                        v.remove();
                        // console.log("获取元素中，获取失败，下一行是该值的html");
                        // console.log(v)
                        continue;
                    }
                    let id = upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1);
                    if (isNaN(id)) {
                        v.remove();
                        // util.print("检测到不是正常视频样式，故删除该元素");
                        continue;
                    }
                    $(v).mouseenter((e) => {
                        const domElement = e.delegateTarget;//dom对象
                        const info = domElement.querySelector(".bili-video-card__info--right");
                        const videoTitle = info.querySelectorAll("[title]")[0].textContent;
                        const userName = info.querySelectorAll("[title]")[1].textContent;
                        let href = info.querySelector(".bili-video-card__info--owner").href;
                        href = href.substring(href.lastIndexOf("/") + 1);
                        util.showSDPanel(e, userName, href, videoTitle);
                    });
                    shieldVideo_userName_uid_title(v, upName, id, title, null, videoTime, playbackVolume);
                }
                list = document.getElementsByClassName(str);//删除完对应元素之后再检测一次，如果没有了就结束循环并结束定时器
                if (list.length !== tempLength) {//如果执行完之后关键元素长度还是没有变化，说明不需要在执行了
                    continue;
                }
                clearInterval(interval);
                return;
            }
        }, 1000);
    },
}


/**
 * 判断内容是否匹配上元素
 */
const shield = {
    /**
     * 根据用户提供的网页元素和对应的数组及key，精确匹配数组某个元素
     * @param arr 数组
     * @param key 唯一key
     * @returns {boolean}
     */
    arrKey: function (arr, key) {
        if (arr === null || arr === undefined) {
            return false;
        }
        return arr.includes(key);
    },
    /**
     * 根据用户提供的字符串集合，当content某个字符包含了了集合中的某个字符则返回对应的字符，模糊匹配
     * 反之返回null
     * @param {string[]}arr 字符串数组
     * @param {string}content 内容
     * @returns {null|string}
     */
    arrContent: function (arr, content) {
        if (arr === null || arr === undefined) {
            return null;
        }
        try {
            for (let str of arr) {
                if (content.toLowerCase().includes(str)) {//将内容中的字母转成小写进行比较
                    return str;
                }
            }
        } catch (e) {
            return null;
        }
        return null;
    },
    /**
     * 根据用户提供的字符串集合，与指定内容进行比较，当content某个字符包含了了集合中的某个正则匹配则返回对应的字符，正则匹配
     * 反之返回null
     * @param {string[]}arr 字符串数组
     * @param {string}content 内容
     * @return {null|string}
     */
    arrContentCanonical: function (arr, content) {
        if (arr === null || arr === undefined) {
            return null;
        }
        try {
            for (let str of arr) {
                if (content.search(new RegExp(str)) === -1) {
                    continue;
                }
                return str;
            }
        } catch (e) {
            return null;
        }
        return null;
    }
}

/**
 * 针对内容符合规则的删除元素并返回状态值
 */
const remove = {
    //是否是白名单用户
    isWhiteUserUID: function (uid) {
        const tempArr = localData.getArrWhiteUID();
        if (tempArr === null || tempArr === undefined) {
            return false;
        }
        return tempArr.includes(uid);
    },
    /**
     * 根据用户uid屏蔽元素
     * @param element
     * @param uid
     * @returns {boolean}
     */
    uid: function (element, uid) {
        if (shield.arrKey(localData.getArrUID(), parseInt(uid))) {
            element.remove();
            return true;
        }
        return false;
    }
    ,
    /**
     * 根据用户名屏蔽元素，当用户名完全匹配规则时屏蔽
     * @param element
     * @param name
     * @returns {boolean}
     */
    name: function (element, name) {
        if (shield.arrKey(localData.getArrName(), name)) {
            element.remove();
            return true;
        }
        return false;
    },
    /**
     * 根据用户名规则，当用规则字符包含用户名时返回对应的规则字符，反之null
     * @param element
     * @param name
     * @returns {String|null}
     */
    nameKey: function (element, name) {
        const shieldArrContent = shield.arrContent(localData.getArrNameKey(), name);
        if (shieldArrContent !== null) {
            element.remove();
        }
        return shieldArrContent;
    }
    ,
    /**
     * 根据标题屏蔽元素
     * @param element
     * @param title
     * @returns {String|null}
     */
    titleKey: function (element, title) {
        const shieldArrContent = shield.arrContent(localData.getArrTitle(), title);
        if (shieldArrContent !== null) {
            element.remove();
        }
        return shieldArrContent;
    },
    /**
     * 根据标题屏蔽元素
     * 正则表达式匹配模式
     * @param element
     * @param title
     * @return {string|null}
     */
    titleKeyCanonical: function (element, title) {
        const canonical = shield.arrContentCanonical(localData.getArrTitleKeyCanonical(), title);
        if (canonical !== null) {
            element.remove();
        }
        return canonical;
    },
    /**
     * 根据用户言论屏蔽元素
     * @param element
     * @param content
     * @returns {String|null}
     */
    contentKey: function (element, content) {
        const shieldArrContent = shield.arrContent(util.getData("commentOnKeyArr"), content);
        if (shieldArrContent !== null) {
            element.remove();
        }
        return shieldArrContent;
    }
    ,
    /**
     * 根据用户专栏内容关键词屏蔽元素
     * @param element
     * @param content
     * @returns {String|null}
     */
    columnContentKey: function (element, content) {
        const shieldArrContent = shield.arrContent(element, util.getData("contentColumnKeyArr"), content);
        if (shieldArrContent !== null) {
            element.remove();
        }
        return shieldArrContent;
    }
    ,
    /**
     * 根据用户粉丝牌进行屏蔽
     * @param element
     * @param key
     * @returns {boolean}
     */
    fanCard: function (element, key) {
        if (shield.arrKey(util.getData("fanCardArr"), key)) {
            element.remove();
            return true;
        }
        return false;
    }
    ,
    /**
     * 限制的视频时长最小值，低于该值的都屏蔽
     * 根据视频时长，过滤指定时长内的视频
     * @param element
     * @param {Number}key 秒数
     * @returns {boolean}
     */
    videoMinFilterS: function (element, key) {
        const min = rule.videoData.filterSMin;
        if (min === null) {
            return false;
        }
        if (min > key) {
            element.remove();
            return true;
        }
        return false;
    }
    ,
    /**
     * 限制可展示的视频时长最大值，高于该值的都屏蔽
     * @param element
     * @param {Number}key 秒数
     * @returns {boolean}
     */
    videoMaxFilterS: function (element, key) {
        const max = rule.videoData.filterSMax;
        if (max === 0 || max < rule.videoData.filterSMin || max === null) {//如果最大值为0，则不需要执行了，和当最小值大于最大值也不执行
            return false;
        }
        if (max < key) {
            element.remove();
            return true;
        }
        return false;
    }
    ,
    /**
     * 限制视频播放量最小值，低于该值的都屏蔽
     * 根据视频播放量，过滤低于指定播放量的视频
     * @param element
     * @param {number}key 播放量纯数字
     * @returns {boolean}
     */
    videoMinPlaybackVolume: function (element, key) {
        const min = rule.videoData.broadcastMin;
        if (min === null) {
            return false;
        }
        if (min > key) {
            element.remove();
            return true;
        }
        return false;
    }
    ,
    /**
     * 限制视频播放量最大值，高于该值的都屏蔽
     * 根据视频播放量，过滤高于指定播放量的视频
     * @param element
     * @param {number}key 播放量纯数字
     * @returns {boolean}
     */
    videoMaxPlaybackVolume: function (element, key) {
        const max = rule.videoData.broadcastMax;
        if (max === 0 || max < rule.videoData.broadcastMin || max === null) {//如果最大值为0，则不需要执行了，和当最小值大于最大值也不执行
            return false;
        }
        if (max < key) {
            element.remove();
            return true;
        }
        return false;
    }
    ,
    /**
     * 限制可暂时的视频弹幕量最小值，低于该值的都屏蔽
     * 根据视频弹幕量，过滤低于指定弹幕量的视频
     * @param element
     * @param {number}key 弹幕数量
     * @returns {boolean}
     */
    videoMinBarrageQuantity: function (element, key) {
        if (rule.videoData.barrageQuantityMin > key) {
            element.remove();
            return true;
        }
        return false;
    }
    ,
    /**
     * 限制可暂时的视频弹幕量最大值，高于该值的都屏蔽
     * 根据视频弹幕量，过滤高于指定弹幕量的视频
     * @param element
     * @param {number}key 弹幕数量
     * @returns {boolean}
     */
    videoMaxBarrageQuantity: function (element, key) {
        const max = rule.videoData.barrageQuantityMax;
        if (max === 0 || rule.videoData.barrageQuantityMin > max) {
            return false;
        }
        if (max > key) {
            element.remove();
            return true;
        }
        return false;
    }
}


//专栏或者动态楼主评论规则
function getColumnOrDynamicReviewLandlord(v) {
    const info = v.getElementsByClassName("user")[0];//信息
    return {
        //用户信息的html元素
        userInfo: info,
        //楼主用户名
        name: info.getElementsByClassName("name")[0].textContent,
        //楼主UID
        uid: info.getElementsByTagName("a")[0].getAttribute("data-usercard-mid"),
        content: v.getElementsByClassName("text")[0].textContent//内容
    }
}

//专栏或者动态楼层评论规则
function getColumnOrDynamicReviewStorey(v) {
    const info = v.getElementsByClassName("user")[0];//信息
    return {
        //用户信息的html元素
        userInfo: info,
        //用户名
        name: info.getElementsByClassName("name")[0].textContent,
        //UID
        uid: info.getElementsByClassName("name")[0].getAttribute("data-usercard-mid"),
        content: v.getElementsByTagName("span")[0].textContent//内容
    }
}


/**
 * 根据规则删除专栏和动态的评论区
 * 针对于专栏和动态内容下面的评论区
 */
function delDReplay() {
    const interval = setInterval(() => {
        const list = document.getElementsByClassName("list-item reply-wrap");
        if (list === undefined) {
            return;
        }
        clearInterval(interval);
        for (let v of list) {
            const userData = getColumnOrDynamicReviewLandlord(v);
            if (startPrintShieldNameOrUIDOrContent(v, userData.name, userData.uid, userData.content)) {
                continue;
            }
            userData.userInfo.onmouseenter = (e) => {
                const element = e.srcElement;
                util.showSDPanel(e, element.getElementsByClassName("name")[0].textContent, element.getElementsByTagName("a")[0].getAttribute("data-usercard-mid"))
            };
            const replyItem = v.getElementsByClassName("reply-box")[0].getElementsByClassName("reply-item reply-wrap");//楼层成员
            for (let j of replyItem) {
                const tempData = getColumnOrDynamicReviewStorey(j);
                if (startPrintShieldNameOrUIDOrContent(j, tempData.name, tempData.uid, tempData.content)) {
                    continue;
                }
                j.onmouseenter = (e) => {
                    const element = e.srcElement;
                    util.showSDPanel(e, element.getElementsByClassName("name")[0].textContent, element.getElementsByTagName("a")[0].getAttribute("data-usercard-mid"));
                };
            }
        }
    }, 1000);
}


const httpUtil = {
    /**
     *封装get请求
     * @param {string}url 请求URL
     * @param {function}func 相应成功函数
     */
    get: function (url, func) {
        util.httpRequest({
            method: "get",
            url: url,
            headers: {
                "User-Agent": navigator.userAgent,
            }, onload: func//相应成功！
        })
    }
}


/**
 * 工具类
 */
const util = {
    //设置数据
    setData: function (key, content) {
        GM_setValue(key, content);
    },
    //读取数据
    getData: function (key) {
        return GM_getValue(key);
    },
    //删除数据
    delData: function (key) {
        GM_deleteValue(key);
    },
    //添加样式
    addStyle: function (cssStyleStr) {
        GM_addStyle(cssStyleStr);
    },
    /**
     * 发起http请求
     * @param {Object}x
     */
    httpRequest: function (x) {
        GM_xmlhttpRequest(x);
    },
    /**
     * 分割时分秒字符串
     * @param {String}time
     * @returns {{s: number, h: number, m: number}|{s: number, m: number}}
     */
    splitTimeHMS: function (time) {
        const split = time.split(":");
        if (split.length === 2) {//说明时长是在60分钟以内
            const tempM = parseInt(split[0]);//分
            const tempS = parseInt(split[1]);//秒
            return {
                m: tempM,
                s: tempS
            };
        } else {//说明时长是在一小时以上的
            const tempH = parseInt(split[0]);//时
            const tempM = parseInt(split[0]);//分
            const tempS = parseInt(split[1]);//秒
            return {
                h: tempH,
                m: tempM,
                s: tempS
            };
        }
    },
    /**
     * 根据字符串的时分秒转成秒
     * @param {String} time 时分秒字符串
     * @returns {number}总秒
     */
    getTimeTotalSeconds: function (time) {
        const demoTime = util.splitTimeHMS(time);
        if (demoTime.h === undefined) {//表示时长没有时
            if (demoTime.m === 0) {//时长低于60秒
                return demoTime.s;
            }
            return demoTime.m * 60 + demoTime.s;//求出剩下的分和秒的总秒
        }
        if (demoTime.h === 0) {//说明时长仅仅只有60分钟以内
            if (demoTime.m === 0) {//时长低于60秒
                return demoTime.s;
            }
            return demoTime.m * 60 + demoTime.s;//求出剩下的分和秒的总秒
        }
        //一小时有60分钟，一分钟有60秒，所以，
        return demoTime.h * 60 * 60 + demoTime.s;
    },
    /**
     * 将秒格式化转成时分秒字符串
     * @param {number}time
     * @return {string}
     */
    formateTime: function (time) {
        const h = parseInt(time / 3600)
        const minute = parseInt(time / 60 % 60)
        const second = Math.ceil(time % 60)
        const hours = h < 10 ? '0' + h : h
        const formatSecond = second > 59 ? 59 : second
        return `${hours > 0 ? `${hours}:` : ''}${minute < 10 ? '0' + minute : minute}:${formatSecond < 10 ? '0' + formatSecond : formatSecond}`
    },
    /**
     * 时间戳转换为时间
     * @param {number}timestamp
     * @return {string}
     */
    timestampToTime: function (timestamp) {
        timestamp = timestamp ? timestamp : null;
        let date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        let Y = date.getFullYear() + '-';
        let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
        let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
        let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
        let s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
        return Y + M + D + h + m + s;
    },
    /**
     * 转换字符串带万播放量或者弹幕量为数字
     * @param {String}str
     * @returns {number}
     */
    changeFormat: function (str) {
        if (str.includes("万")) {
            str = str.replace("万", "");
            if (str.includes(".")) {
                str = str.replace(".", "");
                return parseInt(str + "000");//已知b站视频的播放量或者弹幕量的播放量达到万以上时如果有小数点必然是一个数的，比如10.5万
            }
            return parseInt(str + "0000");//没有小数点却带有万字的情况下，直接在后面+四个零
        }//数字在1万以下的值
        return parseInt(str);
    },
    /**
     * 获取当前网页的url
     * @returns {string}
     */
    getWindowUrl: function () {
        return window.location.href;
    },
    /**
     * 封装好的定时器检测元素，检测到将删除对应元素，ID方式
     * @param {String}idName
     * @param {number}time
     * @param {String}tip
     */
    circulateID: function (idName, time, tip) {
        const interval = setInterval(() => {
            const elementById = document.getElementById(idName);
            if (elementById) {
                elementById.remove();
                clearInterval(interval);
                util.print(tip);
            }
        }, time);
    },
    /**
     * 封装好的定时器检测元素，检测到将删除对应元素，ID方式并且需要执行多次
     * @param {String}elementStr
     * @param {number}index
     * @param {number}time
     * @param {String}tip
     */
    circulateIDs: function (elementStr, index, time, tip) {
        let tempIndex = 0;
        const interval = setInterval(() => {
            const byElement = document.getElementById(elementStr);
            if (byElement) {
                byElement.remove();
                util.print(tip);
            }
            if (++tempIndex === index) {
                clearInterval(interval);
            }
        }, time);
    },
    //设置元素可自由拖动拖动
    suspensionBall: function (dragId, func) {
        let startEvt, moveEvt, endEvt;
        // 判断是否支持触摸事件
        if ("ontouchstart" in window) {
            startEvt = "touchstart";
            moveEvt = "touchmove";
            endEvt = "touchend";
        } else {
            startEvt = "mousedown";
            moveEvt = "mousemove";
            endEvt = "mouseup";
        }
        // 获取元素

        dragId.style.position = "absolute";
        dragId.style.cursor = "move";
        // 标记是拖曳还是点击
        let isClick = true;
        let disX, disY, left, top, starX, starY;

        dragId.addEventListener(startEvt, function (e) {
            // 阻止页面的滚动，缩放
            e.preventDefault();
            // 兼容IE浏览器
            e = e || window.event;
            isClick = true;
            // 手指按下时的坐标
            starX = e.touches ? e.touches[0].clientX : e.clientX;
            starY = e.touches ? e.touches[0].clientY : e.clientY;
            // 手指相对于拖动元素左上角的位置
            disX = starX - dragId.offsetLeft;
            disY = starY - dragId.offsetTop;
            // 按下之后才监听后续事件
            document.addEventListener(moveEvt, moveFun);
            document.addEventListener(endEvt, endFun);
        });

        function moveFun(e) {
            // 兼容IE浏览器
            e = e || window.event;
            // 防止触摸不灵敏，拖动距离大于20像素就认为不是点击，小于20就认为是点击跳转
            if (
                Math.abs(starX - (e.touches ? e.touches[0].clientX : e.clientX)) >
                20 ||
                Math.abs(starY - (e.touches ? e.touches[0].clientY : e.clientY)) > 20
            ) {
                isClick = false;
            }
            left = (e.touches ? e.touches[0].clientX : e.clientX) - disX;
            top = (e.touches ? e.touches[0].clientY : e.clientY) - disY;
            // 限制拖拽的X范围，不能拖出屏幕
            if (left < 0) {
                left = 0;
            } else if (
                left >
                document.documentElement.clientWidth - dragId.offsetWidth
            ) {
                left = document.documentElement.clientWidth - dragId.offsetWidth;
            }
            // 限制拖拽的Y范围，不能拖出屏幕
            if (top < 0) {
                top = 0;
            } else if (
                top >
                document.documentElement.clientHeight - dragId.offsetHeight
            ) {
                top = document.documentElement.clientHeight - dragId.offsetHeight;
            }
            dragId.style.left = left + "px";
            dragId.style.top = top + "px";
        }

        function endFun() {
            document.removeEventListener(moveEvt, moveFun);
            document.removeEventListener(endEvt, endFun);
            // 点击
            if (func === undefined) {
                return;
            }
            if (isClick) {
                func();
            }
        }
    },
    /**
     * 封装好的定时器检测元素，检测到将删除对应元素，class方式
     * @param elementStr
     * @param time
     * @param {String}tip
     */
    circulateClassName: function (elementStr, time, tip) {
        const interval = setInterval(() => {
            const byElement = document.getElementsByClassName(elementStr)[0];
            if (byElement) {
                byElement.remove();
                clearInterval(interval);
                util.print(tip);
            }
        }, time);
    },
    /**
     * 封装好的定时器检测元素，检测到将删除对应元素，class方式并且需要执行多次
     * @param {String}elementStr
     * @param {number}elementIndex
     * @param {number}index
     * @param {number}time
     * @param {String}tip
     */
    circulateClassNames: function (elementStr, elementIndex, index, time, tip) {
        let tempIndex = 0;
        const interval = setInterval(() => {
            const byElement = document.getElementsByClassName(elementStr)[elementIndex];
            if (byElement) {
                byElement.remove();
                util.print(tip);
            }
            if (++tempIndex === index) {
                clearInterval(interval);
            }
        }, time);
    },
    /**
     * 返回当前时间
     * @returns {String}
     */
    toTimeString: function () {
        return new Date().toLocaleString();
    },
    printElement: function (id, element) {
        $(id).prepend(element);
    },
    print: function (strContent) {
        this.printElement("#outputInfo", `<span>${this.toTimeString() + "\t\t" + strContent}</span><hr>`)
    },
    printRGBB: function (color, strContent) {
        this.printElement("#outputInfo", `<b style="color: ${color}; ">${this.toTimeString() + "\t\t" + strContent}</b><hr>`)
    },
    //获取格式化规则的内容
    getRuleFormatStr: function () {
        //温馨提示每个{}对象最后一个不可以有,符号
        const playbackSpeed = util.getData("playbackSpeed");
        return `{
    "用户名黑名单模式(精确匹配)": ${JSON.stringify(localData.getArrName())},
    "用户名黑名单模式(模糊匹配)": ${JSON.stringify(localData.getArrNameKey())},
    "用户uid黑名单模式(精确匹配)": ${JSON.stringify(localData.getArrUID())},
    "用户uid白名单模式(精确匹配)": ${JSON.stringify(localData.getArrWhiteUID())},
    "标题黑名单模式(模糊匹配)": ${JSON.stringify(localData.getArrTitle())},
    "标题黑名单模式(正则匹配)": ${JSON.stringify(localData.getArrTitleKeyCanonical())},
    "评论关键词黑名单模式(模糊匹配)": ${JSON.stringify(util.getData("commentOnKeyArr"))},
    "评论关键词黑名单模式(正则匹配)": ${JSON.stringify(localData.getArrContentOnKeyCanonicalArr())},
    "粉丝牌黑名单模式(精确匹配)": ${JSON.stringify(util.getData("fanCardArr"))},
    "专栏关键词内容黑名单模式(模糊匹配)": ${JSON.stringify(util.getData("contentColumnKeyArr"))},
    "禁用快捷悬浮屏蔽面板自动显示":${util.getData("isDShielPanel")},
    "视频参数": {
        "时长最小值": ${util.getData("filterSMin")},
        "时长最大值": ${util.getData("filterSMax")},
        "播放量最小值": ${util.getData("broadcastMin")},
        "播放量最大值": ${util.getData("broadcastMax")},
        "弹幕量最小值": ${util.getData("barrageQuantityMin")},
        "弹幕量最大值": ${util.getData("barrageQuantityMax")},
        "是否允许b站自动播放视频": ${util.getData("autoPlay")},
        "视频播放速度": ${isNaN(playbackSpeed) ? undefined : playbackSpeed},
        "是否移除播放页右侧的的布局": null,
        "是否要移除右侧播放页的视频列表": null,
        "是否移除评论区布局": null,
        "是否移除视频页播放器下面的标签": null,
        "是否移除视频页播放器下面的简介": null,
        "是否移除视频播放完之后的推荐视频": null,
        "是否取消对播放页右侧列表的视频内容过滤屏蔽处理": null
    },
    "动态相关配置信息": {
        "是否移除顶栏": null,
        "是否移除右侧布局": null,
        "是否移除话题布局上面的公告栏": null
    },
    "直播间的相关配置信息": {
        "是否移除直播间底部的全部信息": null,
        "是否移除直播间顶部的信息": null,
        "是否移除直播间播放器头部的用户信息以及直播间基础信息": null,
        "是否移除直播间右侧的聊天布局": null,
        "是否移除直播间右侧的聊天内容": null,
        "是否移除右侧的聊天内容中的红色的系统提示": null,
        "是否移除右侧聊天内容中的用户进入房间提示": null,
        "是否移除左上角的b站直播logo": null,
        "是否移除左上角的首页项目": null,
        "是否移除直播间底部的的简介和主播荣誉": null,
        "是否移除直播间的主播公告布局": null,
        "是否移除直播首页右侧的悬浮按钮": null,
        "是否移除提示购物车": null,
        "是否移除购物车": null,
        "是否移除直播间的背景图": null,
        "是否屏蔽直播间底部动态": null,
        "移除顶部左侧的选项（不包括右侧）": null,
        "是否移除礼物栏": null,
        "是否移除立即上舰": null,
        "是否移除礼物栏的的礼物部分": null,
        "直播分区时屏蔽的类型": null,
        "是否移除悬浮的233娘": null,
        "是否移除右侧悬浮靠边按钮": null,
        "是否移除直播水印": null
    }
    }`;
    },
    /**
     * 设置页面播放器的播放速度
     * @param {Number|String} index
     */
    setVideoBackSpeed: function (index) {
        const videoTag = $("video");
        if (videoTag.length === 0) {
            return;
        }
        try {
            for (const v of videoTag) {
                v.playbackRate = index;
            }
        } catch (error) {
            console.log("出现错误，当前页面疑似没有播放器或者其他问题=" + error);
        }
    },
    /**
     *
     * @param {String}xy x轴还是Y轴
     * @param {String|Number}index
     */
    setVideoRotationAngle: function (xy, index) {
        const videoV = $("video");
        if (videoV === null) {
            return false;
        }
        if (xy.toUpperCase() === "Y") {
            videoV.css("transform", "rotateY(" + index + "deg)");
            return true;
        }
        videoV.css("transform", "rotateX(" + index + "deg)");
        return true;
    },

    /**
     * 中心旋转视频画面
     * @param {String|number}index 角度
     * @return {boolean}
     */
    setVideoCenterRotation: function (index) {
        const videoV = $("video");
        if (videoV === null) {
            return false;
        }
        videoV.css("transform", "rotate(" + index + "deg)");
        return true;
    },
    /**
     * @param {string|number}r
     * @param {string|number}g
     * @param {string|number}b
     * @param {string|number}a 透明度，0到1，越小越透明
     * @return {string}
     */
    getRGBA: function (r, g, b, a) {
        return `rgba(${r},${g}, ${b}, ${a})`;
    },
    /**
     * 复制单行内容到粘贴板
     * content : 需要复制的内容
     * message : 复制完后的提示，不传则默认提示"复制成功"
     */
    copyToClip: function (content, message) {
        const aux = document.createElement("input");
        aux.setAttribute("value", content);
        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);
        if (message == null) {
            alert("复制成功");
        } else {
            alert(message);
        }
    },
    /**
     * 更新悬浮按钮的坐标
     * @param e 事件源
     */
    updateLocation: function (e) {
        const x = e.clientX;
        const y = e.clientY;
        //获取当前鼠标悬停的坐标轴
        $("#suspensionXY").text(`X:${x} Y:${y}`);
        if (!($("#quickLevitationShield").is(':checked'))) {
            return;
        }
        const suspensionDiv = $("#suspensionDiv");
        suspensionDiv.css("left", x + "px");
        suspensionDiv.css("top", y + "px");
    },
    dShielPanel: function () {

    },
    /**
     * 获取链接的域名
     * @param url 链接
     * @return {null|string}
     */
    getRealmName: function (url) {
        try {
            const domain = url.split("/");
            if (domain[2]) {
                return domain[2];
            } else {
                return null;
            }
        } catch (e) {
            return null;
        }
    },
    /**
     * 显示屏蔽面板
     * @param e 事件源
     * @param name 用户名
     * @param uid uid
     * @param title 标题
     */
    showSDPanel: function (e, name, uid, title) {
        const newVar = util.getData("isDShielPanel");
        if (newVar) {
            return;
        }
        $("#nameSuspensionDiv").text(name);
        const uidA = $("#uidSuspensionDiv");
        uidA.text(uid);
        uidA.attr("href", `https://space.bilibili.com/${uid}`);
        if (title !== undefined) {
            $("#suspensionTitle").text(title);
        }
        this.updateLocation(e);
        $("#suspensionDiv").css("display", "inline-block");
    },
    /**
     * 对UID后面带有其他符号的字符截取掉并保留UID返回
     * @param {string}uidStr
     * @return {number}
     */
    getSubUid: function (uidStr) {
        const indexOf = uidStr.indexOf("?");
        const uid = indexOf === -1 ? uidStr : uidStr.substring(0, indexOf);
        return parseInt(uid);
    }
}


const localData = {
    getArrUID: function () {
        return util.getData("userUIDArr");
    },
    setArrUID: function (key) {
        util.setData("userUIDArr", key);
    },
    getArrWhiteUID: function () {
        return util.getData("userWhiteUIDArr");
    },
    setArrWhiteUID: function (key) {
        util.setData("userWhiteUIDArr", key);
    },
    getArrName: function () {
        return util.getData("userNameArr");
    },
    setArrName: function (key) {
        util.setData("userNameArr", key);
    },
    getArrNameKey: function () {
        return util.getData("userNameKeyArr");
    },
    setArrNameKey: function (key) {
        util.setData("userNameKeyArr", key);
    },
    getArrTitle: function () {
        return util.getData("titleKeyArr");
    },
    setArrTitle: function (key) {
        util.setData("titleKeyArr", key);
    }, getArrTitleKeyCanonical: function () {
        return util.getData("titleKeyCanonicalArr");
    },
    setArrTitleKeyCanonical: function (key) {
        util.setData("titleKeyCanonicalArr", key);
    },
    getArrContentOnKeyCanonicalArr: function () {
        return util.getData("contentOnKeyCanonicalArr");
    },
    setArrContentOnKeyCanonicalArr: function (key) {
        util.setData("contentOnKeyCanonicalArr", key);
    },
    getVideo_zone: function () {
        const data = util.getData("video_zone");
        if (data === undefined || data === null) {
            return 1;
        }
        return parseInt(data);
    },
    setVideo_zone: function (key) {
        util.setData("video_zone", key);
    }


}

//添加元素
addElement = {
    homeVideoE: {
        /**
         *
         * @param {string}title 视频标题
         * @param {string}videoAddess 视频地址
         * @param {string}videoImage 视频封面
         * @param {string}userID 用户uid
         * @param {string}userName 用户名
         * @param {string}timeLong 视频时长
         * @param {string}ctime 发布时间
         * @param {string}view 播放量
         * @param {string}danmaku 弹幕量
         */
        getHtmlStr: function (title, videoAddess, videoImage, userID, userName, timeLong, ctime, view, danmaku) {
            return `<div class="bili-video-card is-rcmd" data-report="tianma.7-1-23.click" data-v-45e09777="">
    <div class="bili-video-card__skeleton hide">
        <div class="bili-video-card__skeleton--cover"></div>
        <div class="bili-video-card__skeleton--info">
            <div class="bili-video-card__skeleton--right"><p class="bili-video-card__skeleton--text"></p>
                <p class="bili-video-card__skeleton--text short"></p>
                <p class="bili-video-card__skeleton--light"></p></div>
        </div>
    </div>
    <div class="bili-video-card__wrap __scale-wrap"><a href=${videoAddess}
                                                       target="_blank" data-spmid="333.1007" data-mod="tianma.7-1-23"
                                                       data-idx="click">
        <div class="bili-video-card__image __scale-player-wrap">
            <div class="bili-video-card__image--wrap">
                <div class="bili-watch-later" style="display: none;">
                    <svg class="bili-watch-later__icon">
                        <use xlink:href="#widget-watch-later"></use>
                    </svg>
                    <span class="bili-watch-later__tip" style="display: none;"></span></div>
                <picture class="v-img bili-video-card__cover"><!---->
                    <source srcset=${videoImage.substring(videoImage.indexOf("//")) + "@672w_378h_1c_!web-home-common-cover.avif"}
                            type="image/avif">
                    <source srcset=${videoImage.substring(videoImage.indexOf("//")) + "@672w_378h_1c_!web-home-common-cover.webp"}
                            type="image/webp">
                    <img src=${videoImage.substring(videoImage.indexOf("//")) + "@672w_378h_1c_!web-home-common-cover"}
                         alt=${title} loading="eager" onload=""></picture>
                <div class="v-inline-player"></div>
            </div>
            <div class="bili-video-card__mask">
                <div class="bili-video-card__stats">
                    <div class="bili-video-card__stats--left"><span class="bili-video-card__stats--item"><svg
                            class="bili-video-card__stats--icon"><use xlink:href="#widget-video-play-count"></use></svg><span
                            class="bili-video-card__stats--text">${view}</span></span><span
                            class="bili-video-card__stats--item"><svg class="bili-video-card__stats--icon"><use
                            xlink:href="#widget-video-danmaku"></use></svg><span class="bili-video-card__stats--text">${danmaku}</span></span>
                    </div>
                    <span class="bili-video-card__stats__duration">${timeLong}</span></div>
            </div>
        </div>
    </a>
        <div class="bili-video-card__info __scale-disable"><!---->
            <div class="bili-video-card__info--right"><h3 class="bili-video-card__info--tit"
                                                          title=${title}><a
                    href=${videoAddess} target="_blank" data-spmid="333.1007"
                    data-mod="tianma.7-1-23" data-idx="click">${title}</a></h3>
                <div class="bili-video-card__info--bottom"><!----><a class="bili-video-card__info--owner"
                                                                     href=${"https://space.bilibili.com/" + userID}
                                                                     target="_blank" data-spmid="333.1007"
                                                                     data-mod="tianma.7-1-23" data-idx="click">
                    <svg class="bili-video-card__info--owner__up">
                        <use xlink:href="#widget-up"></use>
                    </svg>
                    <span class="bili-video-card__info--author" title=${userName}>-${userName}-</span><span
                        class="bili-video-card__info--date">· ${ctime}</span></a></div>
            </div>
        </div>
    </div>
</div>`;
        }
    }

}


//监听网络变化
function startMonitorTheNetwork() {
    const observer = new PerformanceObserver(perf_observer);
    observer.observe({entryTypes: ['resource']});
}


//规则的增删改查
const urleCrud = {
    /**
     * 单个元素进行添加
     * @param {Array} arr
     * @param {String,number} key
     * @param {String} ruleStrName
     */
    add: function (arr, key, ruleStrName) {
        arr.push(key);
        util.setData(ruleStrName, arr);
        util.printRGBB("#006400", `添加${ruleStrName}的值成功=${key}`);
        rule.ruleLength();
    },
    /**
     * 批量添加，要求以数组形式
     * @param {Array} arr
     * @param {Array} key
     * @param ruleStrName
     */
    addAll: function (arr, key, ruleStrName) {
        const setList = new Set(arr);
        const setListLength = setList.size;
        for (const v of key) {
            setList.add(v);
        }
        if (setListLength === setList.size) {
            util.print("内容长度无变化，可能是已经有了的值")
            return;
        }
        util.setData(ruleStrName, Array.from(setList));
        util.print("已添加该值=" + key)
        rule.ruleLength();
    },
    /**
     *
     * @param arr
     * @param key
     * @param ruleStrName
     * @return {boolean}
     */
    del: function (arr, key, ruleStrName) {
        const index = arr.indexOf(key);
        if (index === -1) {
            util.print("未有该元素！")
            return false;
        }
        arr.splice(index, 1);
        util.setData(ruleStrName, arr);
        util.print("已经删除该元素=" + key);
        rule.ruleLength();
        return true;
    }

}

const butLayEvent = {
    butaddName: function (ruleStr, contentV) {
        if (contentV === '') {
            util.print("请输入正确的内容")
            return;
        }
        if (!confirm(`您要添加的内容是？ 【${contentV}】 ，类型=${ruleStr}`)) {
            return;
        }
        let arrayList = util.getData(ruleStr);
        if (arrayList === null || arrayList === undefined) {
            urleCrud.add([], contentV, ruleStr);
            return;
        }
        if (arrayList.includes(contentV)) {
            util.print("当前已有该值！");
            return;
        }
        urleCrud.add(arrayList, contentV, ruleStr);
    },
    butaddAllName: function (ruleStr, contentV) {
        if (contentV === '') {
            util.print("请输入正确的内容")
            return;
        }
        let tempList;
        try {
            tempList = JSON.parse(contentV);
        } catch (error) {
            util.print("内容不正确！内容需要数组或者json格式！错误信息=" + error)
            return;
        }
        let arrayList = util.getData(ruleStr);
        if (arrayList === null || arrayList === undefined) {
            urleCrud.addAll([], tempList, ruleStr);
            return;
        }
        urleCrud.addAll(arrayList, tempList, ruleStr);
    },
    butDelName: function (ruleStr, contentV) {
        if (contentV === '' || contentV.includes(" ")) {
            util.print("请输入正确的内容")
            return false;
        }
        let arrayList = util.getData(ruleStr);
        if (arrayList === null || arrayList === undefined) {
            util.print("没有内容哟")
            return false;
        }
        if (!arrayList.includes(contentV)) {
            util.print("没有该内容哟=" + contentV)
            return false;
        }
        return urleCrud.del(arrayList, contentV, ruleStr);
    },
    butDelAllName: function (ruleStr) {
        const list = util.getData(ruleStr);
        if (list === null || list === undefined) {
            util.print("没有内容哟")
            return;
        }
        const b = confirm("您确定要全部删除吗？");
        if (!b) {
            return;
        }
        util.delData(ruleStr);
        util.print("已全部清除=" + ruleStr);
        rule.ruleLength();
    },
    //查询
    butFindKey: function (ruleStr, contentV) {
        if (contentV === '') {
            util.print("请输入正确的内容")
            return;
        }
        let arrayList = util.getData(ruleStr);
        if (arrayList === null || arrayList === undefined) {
            util.print("找不到该内容！");
            return;
        }
        if (arrayList.includes(contentV)) {
            util.print("搜索的值，已存在！");
            return;
        }
        util.print("找不到该内容！");
    },

    //修改
    butSetKey: function (ruleStr, oldKey, newKey) {
        if (oldKey === '' || oldKey.includes(" ") || newKey === "" || newKey.includes(" ")) {
            return;
        }
        if (oldKey === newKey) {
            util.print("请输入正确的内容，两者内容不能相同")
            return;
        }
        let arrayList = util.getData(ruleStr);
        if (arrayList === null || arrayList === undefined) {
            util.print("找不到该内容！");
            return;
        }
        if (!arrayList.includes(oldKey)) {
            util.print("找不到该内容！，无法替换！");
            return;
        }
        const index = arrayList.indexOf(oldKey);
        if (index === -1) {
            util.print("未有该元素！")
            return;
        }
        arrayList.splice(index, 1, newKey);
        util.setData(ruleStr, arrayList);
        util.printRGBB("green", "替换成功！旧元素=" + oldKey + " 新元素=" + newKey);
    }
}


/**
 * 针对言论内容根据name和uid进行屏蔽并打印消息
 * @param element 网页元素
 * @param name 用户名
 * @param uid 用户uid
 * @param content 言论内容
 * @returns {boolean}
 */
function startPrintShieldNameOrUIDOrContent(element, name, uid, content) {
    if (remove.isWhiteUserUID(uid)) {
        return false;
    }
    const key = remove.contentKey(element, content);
    if (key != null) {
        util.printRGBB("#00BFFF", "已通过言论关键词【" + key + "】屏蔽用户【" + name + "】uid=【" + uid + "】 原言论=" + content + " 用户空间地址=https://space.bilibili.com/" + uid);
        return true;
    }
    const isUid = remove.uid(element, uid);
    if (isUid) {
        util.printRGBB("yellow", "已通过uid=【" + uid + "】屏蔽黑名单用户【" + name + "】，言论=" + content + " 用户空间地址=https://space.bilibili.com/" + uid);
        return true;
    }
    const isName = remove.name(element, name);
    if (isName) {
        util.print("已通过用户名屏蔽指定黑名单用户【" + name + "】uid=【" + uid + "】，言论=" + content + " 用户空间地址=https://space.bilibili.com/" + uid);
        return true;
    }
    const isNameKey = remove.nameKey(element, name);
    if (isNameKey != null) {
        util.print("用户名=【" + name + "】包含了屏蔽词=【" + isNameKey + "】uid=【" + uid + "】 故将其屏蔽 言论=" + content + " 用户空间地址=https://space.bilibili.com/" + uid);
        return true;
    }
    return false;
}

/**
 *  屏蔽视频元素
 *  针对用户名、用户uid，视频标题
 * @param element 对应的视频元素
 * @param {String}name 用户名
 * @param {Number}uid 用户uid
 * @param {String}title 视频标题
 * @param{String}videoHref 视频地址
 * @param  {String}videoTime 视频时间
 * @param{String}videoPlaybackVolume 播放量
 * @returns {boolean} 是否执行完
 */
function shieldVideo_userName_uid_title(element, name, uid, title, videoHref, videoTime, videoPlaybackVolume) {
    if (remove.isWhiteUserUID(uid)) {
        return false;
    }
    if (videoHref == null) {
        videoHref = "暂无设定";
    }
    if (uid !== null) {
        const isUid = remove.uid(element, uid);
        if (isUid) {
            util.printRGBB("yellow", "已通过id=" + uid + " 屏蔽黑名单用户=" + name + " 视频=" + title + " 地址=" + videoHref + " 用户空间地址=https://space.bilibili.com/" + uid);
            return true;
        }
    }
    const isName = remove.name(element, name);
    if (isName) {
        util.print("已通过用户名屏蔽指定黑名单用户 " + name + " uid=" + uid + " 视频=" + title + " 地址=" + videoHref + " 用户空间地址=https://space.bilibili.com/" + uid);
        return true;
    }
    const isNameKey = remove.nameKey(element, name);
    if (isNameKey != null) {
        util.print("用户名=" + name + " uid=" + uid + " 因包含屏蔽规则=" + isNameKey + " 故屏蔽该用户,视频标题=" + title + " 地址=" + videoHref + " 用户空间地址=https://space.bilibili.com/" + uid);
        return true;
    }
    const videoTitle = remove.titleKey(element, title);
    if (videoTitle != null) {
        util.printRGBB("#66CCCC", "已通过视频标题关键词=" + videoTitle + " 屏蔽用户" + name + " uid=" + uid + " 视频=" + title + " 地址=" + videoHref + " 用户空间地址=https://space.bilibili.com/" + uid);
        return true;
    }
    const titleKeyCanonical = remove.titleKeyCanonical(element, title);
    if (titleKeyCanonical != null) {
        util.printRGBB("#66CCCC", "已通过视频标题正则表达式=" + titleKeyCanonical + " 屏蔽用户" + name + " uid=" + uid + " 视频=" + title + " 地址=" + videoHref + " 用户空间地址=https://space.bilibili.com/" + uid);
        return true;
    }
    if (videoPlaybackVolume !== null) {
        const change = util.changeFormat(videoPlaybackVolume);
        if (remove.videoMinPlaybackVolume(element, change)) {
            util.print("已滤视频播发量小于=" + rule.videoData.broadcastMin + "的视频 name=" + name + " uid=" + uid + " title=" + title + " 预估播放量=" + videoPlaybackVolume + " 地址=" + videoHref + " 用户空间地址=https://space.bilibili.com/" + uid);
            return true;
        }
        if (remove.videoMaxPlaybackVolume(element, change)) {
            util.print("已滤视频播发量大于=" + rule.videoData.broadcastMax + "的视频 name=" + name + " uid=" + uid + " title=" + title + " 预估播放量=" + videoPlaybackVolume + " 地址=" + videoHref + " 用户空间地址=https://space.bilibili.com/" + uid);
            return true;
        }
    }
    if (videoTime === null) {
        return false;
    }
    const timeTotalSeconds = util.getTimeTotalSeconds(videoTime);
    if (remove.videoMinFilterS(element, timeTotalSeconds)) {
        util.print("已通过视频时长过滤时长小于=" + rule.videoData.filterSMin + "秒的视频 视频=【" + title + " 地址=" + videoHref);
        return true;
    }
    if (remove.videoMaxFilterS(element, timeTotalSeconds)) {
        util.print("已通过视频时长过滤时长大于=" + rule.videoData.filterSMax + "秒的视频 视频=" + title + " 地址=" + videoHref);
        return true;
    }
    return false;
}

//消息中心
const message = {
    /**
     * 删除消息中心的回复我的规则
     */
    delMessageReply: function () {
        const list = document.getElementsByClassName("reply-item");
        for (let v of list) {
            const info = v.getElementsByClassName("name-field")[0];
            const name = info.textContent;//用户名
            const indess = info.getElementsByTagName("a")[0].getAttribute("href");
            const uid = parseInt(indess.substring(indess.lastIndexOf("/") + 1));
            const content = v.getElementsByClassName("text string")[0].textContent;//消息内容
            startPrintShieldNameOrUIDOrContent(v, name, uid, content);
        }
    },
    /**
     * 删除消息中的艾特我的规则
     */
    delMessageAT: function () {
        for (let v of document.getElementsByClassName("at-item")) {
            const userInfo = v.getElementsByClassName("name-field")[0].getElementsByTagName("a")[0];
            const href = userInfo.getAttribute("href");
            const userName = userInfo.textContent;
            const uid = parseInt(href.substring(href.lastIndexOf("/") + 1));
            const content = v.getElementsByClassName("content-list")[0].textContent;
            startPrintShieldNameOrUIDOrContent(v, userName, uid, content);
        }
    }
}

/**
 * 针对视频播放页的相关方法
 */
const videoFun = {
    //移除右侧悬浮按钮
    rightSuspendButton: function () {
        util.circulateClassNames("storage-box", 0, 2, 2000, "已移除右侧的【返回旧版】【新版反馈】【客服】");//针对新版界面

    },
    delRightE: function () {
        const video = rule.videoData;
        if (video.isRhgthlayout) {
            util.circulateClassNames("right-container is-in-large-ab", 0, 3, 1500, "已移除视频播放器右侧的布局");
            return;
        }
        util.circulateClassNames("video-page-special-card-small", 0, 2, 2000, "移除播放页右上角的其他推广");
        util.circulateClassNames("vcd", 0, 2, 2000, "已移除右上角的广告");
        util.circulateClassName("video-page-game-card-small", 2000, "移除播放页右上角的游戏推广");
        util.circulateIDs("right-bottom-banner", 2, 1500, "删除右下角的活动推广");
        util.circulateClassName("pop-live-small-mode part-undefined", 1000, "删除右下角的直播推广")
        util.circulateClassNames("ad-report video-card-ad-small", 0, 3, 2000, "已删除播放页右上角的广告内容");
        if (video.isrigthVideoList) {
            util.circulateID("reco_list", 2000, "已移除播放页右侧的视频列表");
            return;
        }
        if (!video.isRightVideo) {
            setTimeout(() => {
                document.getElementsByClassName("rec-footer")[0].addEventListener("click", () => {
                    util.print("用户点击了右侧的展开")
                    videoFun.rightVideo().then(() => {
                    });
                })
            }, 4000);
        }
    },
    //对视频页的播放器下面的进行处理
    delBottonE: function () {
        this.commentArea();//处理评论区
        util.circulateIDs("bannerAd", 10, 2500, "已移除播放器底部的广告");
        util.circulateID("activity_vote", 2500, "已移除播放器底部的活动广告");
        util.circulateClassName("reply-notice", 2000, "已移除播放器底部的橙色横幅通知");
        util.circulateClassName("ad-floor-cover b-img", 2000, "已移除播放器底部的图片广告");
        if (rule.videoData.isTag) {
            util.circulateID("v_tag", 2000, "已移除播放器底部的tag栏");
        }
        if (rule.videoData.isDesc) {
            util.circulateID("v_desc", 2000, "已移除播放器底部的简介");
        }
    }
    ,
    commentArea: function () {
        const videoData = rule.videoData;
        if (videoData.isCommentArea) {
            util.circulateID("comment", 1500, "已移除评论区");
        }
    }
    ,
//针对视频播放页右侧的视频进行过滤处理。该界面无需用时长过滤，视频数目较少
    rightVideo: async function () {//异步形式执行，避免阻塞主线程
        for (let e of document.getElementsByClassName("video-page-card-small")) {//获取右侧的页面的视频列表
            const videoInfo = e.getElementsByClassName("info")[0];
            //用户名
            const name = videoInfo.getElementsByClassName("name")[0].textContent;
            //视频标题
            const videoTitle = videoInfo.getElementsByClassName("title")[0].textContent;
            //用户空间地址
            const upSpatialAddress = e.getElementsByClassName("upname")[0].getElementsByTagName("a")[0].getAttribute("href");
            const id = upSpatialAddress.substring(upSpatialAddress.lastIndexOf("com/") + 4, upSpatialAddress.length - 1);
            const playInfo = e.getElementsByClassName("playinfo")[0];
            playInfo.getElementsByClassName("")
            shieldVideo_userName_uid_title(e, name, id, videoTitle, null, null, null);
        }
    }
    ,
//点击播放器的宽屏按钮
    click_playerCtrlWhid: function () {
        const interval = setInterval(() => {
            try {
                document.getElementsByClassName("bpx-player-ctrl-btn bpx-player-ctrl-wide")[0].click()
                util.print("已自动点击播放器的宽屏")
                clearInterval(interval);
            } catch (e) {
            }
        }, 1000);
    }
}


//获取频道界面单个的视频信息
function getChannelVideoRules(element) {
    const videoInfo = element.getElementsByClassName("video-name")[0];
    //空间地址
    const upSpatialAddress = element.getElementsByClassName("up-name")[0].getAttribute("href");
    const lastIndexOf = upSpatialAddress.lastIndexOf("/") + 1;
    const topInfo = element.getElementsByClassName("video-card__info")[0].getElementsByClassName("count");
    return {
        //用户名
        upName: element.getElementsByClassName("up-name__text")[0].textContent,
        //视频标题
        title: videoInfo.textContent.trim(),
        //视频地址
        videohref: "https:" + videoInfo.getAttribute("href"),
        //视频时长
        videoTime: element.getElementsByClassName("play-duraiton")[0].textContent,
        //空间地址
        upSpatialAddress: upSpatialAddress,
        //UID
        uid: upSpatialAddress.substring(lastIndexOf),
        //播放量
        playbackVolume: topInfo[0].textContent.trim(),
        //弹幕量
        barrageQuantity: topInfo[1].textContent.trim()
    };
}


//频道
const frequencyChannel = {
    data: {
        //排序的方式 hot热门
        sort_type: "hot",
        //需要给出个初始值，之后可以迭代生成，如果为空字符串则为从顶部内容获取
        offsetData: {
            //k是频道id，v是当时加载的坐标
        },
        channel_idList: {
            7700690: "战双帕弥什",
            7295336: "元歌",
            17941: "恐怖游戏",
            1833:"搞笑",
            17683:"单机游戏",
            2908447:"碧蓝航线",
            9734740:"apex英雄",
            47988:"我的世界",
            152655:"沙盒游戏",
            391:"AMV",
            47996:"冷知识",
            1562:"喵星人",
            497221:"鬼畜调教",
            6578:"计算机",
            68:"鬼畜",
            530918:"动漫杂谈"
        }
    },
    //设置当前频道的id
    setChannel_id: function (id) {
        util.setData("channel_id", parseInt(id));
    },
    //获取当前频道的id
    getChannel_id: function () {
        const data = util.getData("channel_id");
        if (data === undefined || data == null) {
            return 17941;//默认返回恐怖游戏的频道
        }
        return parseInt(data);
    },
    setSort_type: function (typeStr) {
        this.data.sort_type = typeStr;
    },
    getSort_type: function () {
        return this.data.sort_type;
    },
    setOffset: function (id,s) {
        this.data.offsetData[id]=s;
    },
    getOffset: function (id) {
        const data = this.data.offsetData[id];
        if (data === undefined||data===null) {
            return "";
        }
        return data;
    },
    // 频道排行榜规则
    listRules: function () {
        let list = document.getElementsByClassName("rank-video-card");
        if (list.length !== 0 && frequencyChannel.startExtracted(list)) {
            console.log("已检测到频道综合的排行榜")
        }
    },
    /**
     * 频道精选视频等其他视频规则
     * 已针对个别情况没有删除对应元素，做了个循环处理
     */
    videoRules: function () {
        while (true) {
            const list = document.getElementsByClassName("video-card");
            const tempLength = list.length;
            if (tempLength === 0) {
                break;
            }
            frequencyChannel.startExtracted(list)
            if (list.length === tempLength) {
                //util.print("页面元素没有变化了，故退出循环")
                break;
            }
        }
    },
    //展开频道爬排行榜中的展开
    delDevelop: function () {
        const interval = setInterval(() => {
            const toggleClass = document.getElementsByClassName("toggle")[0];
            try {
                const str = toggleClass.textContent.trim();
                if (str !== "收起") {//控制每次收缩时自动点击，使其展开列表
                    toggleClass.click();
                    toggleClass.remove();
                    clearInterval(interval);
                    this.data.develop = true;
                    util.print("已点击展开列表并移除收起按钮")
                }
            } catch (e) {
                clearInterval(interval);
            }
        }, 50);
    },
    /**
     * 频道
     * 隐藏对应元素的视频
     * @param vdoc 视频列表
     * @returns {boolean}
     */
    startExtracted: function (vdoc) {
        let temp = false;
        try {
            for (let element of vdoc) {
                element.onmouseenter = (e) => {
                    const element = e.srcElement;
                    const data = getChannelVideoRules(element);
                    util.showSDPanel(e, data.upName, data.uid);
                };
                element.style.margin = "0px 5px 0px 0px";//设置元素边距
                const data = getChannelVideoRules(element);
                temp = shieldVideo_userName_uid_title(element, data.upName, data.uid, data.title, data.videohref, data.videoTime, data.playbackVolume);
            }
        } catch (e) {
            return temp;
        }
        return temp;
    },
    cssStyle: {
        tempVar: {
            //是否执行了调整页面边距
            backGaugeBool: false,
        },
        backGauge: function () {
            if (this.tempVar.backGaugeBool) {
                return;
            }
            this.tempVar.backGaugeBool = true;
            document.getElementsByClassName("detail-panels")[0].style.width = "auto";//调整其页面左右边距
            util.print("已调整频道界面的左右边距")
        }
    }
}
//直播间
const liveDel = {
    //针对于直播间顶部的屏蔽处理
    topElement: function () {
        if (rule.liveData.topElement) {
            try {
                document.getElementsByClassName("link-navbar-ctnr z-link-navbar w-100 p-fixed p-zero ts-dot-4 z-navbar contain-optimize")[0].remove();
                util.print("已移除直播间顶部的信息（包括顶部标题栏）")
            } catch (e) {
                util.print("已移除直播间顶部的信息（包括顶部标题栏）-出错")
            }
            return;
        }
        if (rule.liveData.topLeftBar.length !== 0) {
            for (const element of rule.liveData.topLeftBar) {
                try {
                    document.getElementsByClassName(element)[0].remove();
                    util.print("已移除该项目=" + element)
                } catch (e) {
                    util.print("不存在该项目！=" + element)
                }
            }
        }
        if (rule.liveData.topLeftLogo) {
            document.getElementsByClassName("entry_logo")[0].remove();
            util.print("已移除左上角的b站直播logo信息")
        }
        if (rule.liveData.topLeftHomeTitle) {
            document.getElementsByClassName("entry-title")[0].remove();
            util.print("已移除左上角的首页项目")
        }
    },
    //针对直播间播放器头部的用户信息，举例子，，某某用户直播，就会显示器的信息和直播标题等
    hreadElement: function () {
        const liveData = rule.liveData;
        if (liveData.isheadInfoVm) {
            const interval = setInterval(() => {
                try {
                    document.getElementById("head-info-vm").remove()
                    clearInterval(interval);
                    util.print("已移除直播间头部的用户信息");
                } catch (e) {
                }
            }, 2000);
        }
    },
    //针对于直播间底部的屏蔽处理
    bottomElement: function () {
        document.getElementById("link-footer-vm").remove();
        util.print("已移除底部的页脚信息")
        if (rule.liveData.bottomElement) {
            document.getElementById("sections-vm").remove();
            util.print("已移除直播间底部的全部信息")
            return;
        }
        if (rule.liveData.bottomIntroduction) {
            document.getElementsByClassName("section-block f-clear z-section-blocks")[0].getElementsByClassName("left-container")[0].remove();
            util.print("已移除直播间底部的的简介和主播荣誉")
        } else {
            if (rule.liveData.liveFeed) {
                const interval = setInterval(() => {
                    try {
                        document.getElementsByClassName("room-feed")[0].remove();
                        clearInterval(interval)
                        util.print("已移除页面底部动态部分")
                    } catch (e) {
                    }
                }, 2500);
            }
        }
        if (rule.liveData.container) {
            document.getElementsByClassName("right-container")[0].remove();
            util.print("已移除直播间的主播公告")
        }
    },
    //礼物栏的布局处理
    delGiftBar: function () {
        if (rule.liveData.delGiftLayout) {
            util.circulateIDs("gift-control-vm", 5, 1500, "已移除礼物栏")
            return;
        }
        if (rule.liveData.isEmbark) {
            const temp = setInterval(() => {
                const tempClass = document.getElementsByClassName("m-guard-ent gift-section guard-ent")[0];
                if (tempClass) {
                    tempClass.remove();
                    clearInterval(temp);
                    util.print("移除立即上舰")
                }
            }, 2000);
        }
        if (rule.liveData.isGift) {
            const temp = setInterval(() => {
                const element = document.getElementsByClassName("gift-presets p-relative t-right")[0];
                if (element) {
                    element.remove();
                    clearInterval(temp);
                    util.print("移除礼物栏的的礼物部分")
                }
            }, 2000);
        }
        if (rule.liveData.isEmbark && rule.liveData.isGift) {//如果立即上舰和礼物栏的部分礼物移除了就对其位置调整
            const interval = setInterval(() => {
                try {
                    document.getElementById("gift-control-vm").style.height = "auto";
                    document.getElementsByClassName("gift-control-panel f-clear b-box p-relative")[0].style.height = "40px";
                    clearInterval(interval);
                } catch (e) {
                }
            }, 1500);
        }
    },
    /**
     * 屏蔽直播间对应的言论
     * 暂时测试打印下效果
     */
    demo: function () {
        const chatItems = document.getElementById("chat-items");
        const list = chatItems.getElementsByClassName("chat-item danmaku-item");
        for (let v of list) {
            const userName = v.getAttribute("data-uname");
            const uid = v.getAttribute("data-uid");
            const content = v.getAttribute("data-danmaku");
            let fansMeda = "这是个个性粉丝牌子";
            try {
                fansMeda = v.getElementsByClassName("fans-medal-content")[0].textContent;
            } catch (e) {
            }
            if (startPrintShieldNameOrUIDOrContent(v, userName, uid, content)) {
                continue;
            }
            if (remove.fanCard(v, fansMeda)) {
                util.print("已通过粉丝牌【" + fansMeda + "】屏蔽用户【" + userName + "】 言论=" + content);
            }
        }
    },
    //移除右侧的聊天布局
    delRightChatLayout: function () {
        const liveData = rule.liveData;
        if (liveData.isRightChatLayout) {
            const interval = setInterval(() => {
                const id = document.getElementById("aside-area-vm");
                if (id) {
                    id.remove();
                    clearInterval(interval);
                    util.print("移除直播间右侧的聊天布局")
                    document.getElementsByClassName("player-ctnr")[0].style.width = "100%";//移除完之后调整其布局位置
                }
            }, 2000);
            return;
        }
        if (liveData.isChatHistoryPanel) {
            const interval = setInterval(() => {
                const tempClass = document.getElementsByClassName("chat-history-panel")[0];
                if (tempClass) {
                    tempClass.remove();
                    clearInterval(interval);
                    util.print("已移除直播间右侧的聊天内容");
                    document.getElementById("aside-area-vm").style.height = "0px";//移除之后调整下布局
                }
            }, 2000);
            return;
        }
        if (liveData.isSystemRedTip) {
            const interval = setInterval(() => {//移除右侧的聊天布局系统提示
                const tempE = document.getElementsByClassName("chat-item  convention-msg border-box")[0];
                if (tempE) {
                    tempE.remove();
                    clearInterval(interval);
                    util.print("已移除聊天布局的系统提示")
                }
            }, 2000);
        }
        if (liveData.isEnterLiveRoomTip) {
            const interval = setInterval(() => {//移除右侧聊天内容中的用户进入房间提示
                try {
                    document.getElementById("brush-prompt").remove();
                    clearInterval(interval);
                    util.print("移除右侧聊天内容中的用户进入房间提示")
                } catch (e) {
                }
            }, 2000);
        }
    },
    delOtherE: function () {
        const liveData = rule.liveData;
        if (liveData.is233Ma) {
            const interval = setInterval(() => {
                try {
                    document.getElementById("my-dear-haruna-vm").remove();
                    clearInterval(interval);
                    util.print("已移除2333娘")
                } catch (e) {
                }
            }, 2000);
        }
        if (liveData.isRightSuspenBotton) {
            const interval = setInterval(() => {
                try {
                    document.getElementsByClassName("side-bar-cntr")[0].remove();
                    util.print("已移除右侧悬浮靠边按钮-如实验-关注")
                    clearInterval(interval);
                } catch (e) {
                }
            }, 2000);
        }
        if (liveData.isLiveRoomWatermark) {
            const interval = setInterval(() => {
                try {
                    document.getElementsByClassName("web-player-icon-roomStatus")[0].remove();//移除播放器左上角的哔哩哔哩直播水印
                    clearInterval(interval);
                    util.print("已移除直播水印")
                } catch (e) {
                }
            }, 2000);
        }
        if (liveData.isShoppingCartTip) {
            const interval = setInterval(() => {
                try {
                    document.getElementsByClassName("shop-popover")[0].remove();//是否移除提示购物车
                    clearInterval(interval);
                    util.print("已移除提示购物车")
                } catch (e) {
                }
            }, 2000);
        }
        if (liveData.isShoppingCart) {
            const interval = setInterval(() => {
                try {
                    document.getElementsByClassName("ecommerce-entry gift-left-part")[0].remove();//是否移除购物车
                    clearInterval(interval);
                    util.print("已移除购物车")
                } catch (e) {
                }
            }, 2000);
        }
        if (liveData.isDelbackground) {
            const interval = setInterval(() => {
                try {
                    document.getElementsByClassName("room-bg webp p-fixed")[0].remove(); //移除直播背景图
                    clearInterval(interval);
                    util.print("已移除直播背景图")
                } catch (e) {
                }
            }, 2000);
        }
        const interval01 = setInterval(() => {
            try {
                document.getElementsByClassName("web-player-icon-feedback")[0].remove();//移除播放器右上角的问号图标
                clearInterval(interval01);
            } catch (e) {
            }
        }, 2000);


    },
    //过滤直播间列表，该功能目前尚未完善，暂时用着先
    delLiveRoom: function () {
        const list = document.getElementsByClassName("index_3Uym8ODI");
        for (let v of list) {
            const title = v.getElementsByClassName("Item_2GEmdhg6")[0].textContent.trim();
            const type = v.getElementsByClassName("Item_SI0N7ecx")[0].textContent;//分区类型
            const name = v.getElementsByClassName("Item_QAOnosoB")[0].textContent.trim();
            const index = v.getElementsByClassName("Item_3Iz_3buh")[0].textContent.trim();//直播间人气
            if (rule.liveData.classify.includes(type)) {
                v.remove();
                util.print("已屏蔽直播分类为=" + type + " 的直播间 用户名=" + name + " 房间标题=" + title + " 人气=" + index)
                continue;
            }
            if (remove.name(v, name)) {
                util.print("已通过用户名=" + name + " 屏蔽直播间 直播分类=" + type + " 房间标题=" + title + " 人气=" + index)
                continue;
            }
            const nameKey = remove.nameKey(v, name);
            if (nameKey != null) {
                util.print("用户名=" + name + " 包含了=屏蔽词=" + nameKey + " 故屏蔽该直播间 分类=" + type + " 房间标题=" + title + " 人气=" + index)
                continue;
            }
            if (remove.titleKey(v, title)) {
                util.print("已通过直播间标题=【" + title + "】屏蔽该房间 用户名=" + name + " 分类=" + type + " 人气=" + index);
            }
        }
    }
}
//热门
const greatDemand = {
    delVideo: function () {
        let list = document.getElementsByClassName("video-card");
        if (list.length === 0) {
            list = document.getElementsByClassName("_card_1kuml_6");
            for (let v of list) {
                const title = v.getElementsByClassName("title")[1].textContent;
                const name = v.getElementsByClassName("upName")[0].textContent;
                const time = v.getElementsByClassName("time")[0].textContent;
                shieldVideo_userName_uid_title(v, name, null, title, null, null, time);
            }
            return;
        }
        for (let v of list) {
            //页面暂时没法获取uid，可能是我的技术问题，至少暂时先这样
            const title = v.getElementsByClassName("video-name")[0].textContent;//标题
            const name = v.getElementsByClassName("up-name__text")[0].textContent;//用户名
            const play = v.getElementsByClassName("play-text")[0].textContent.trim();//播放量
            //const like = v.getElementsByClassName("like-text")[0].textContent.trim();//弹幕量
            shieldVideo_userName_uid_title(v, name, null, title, null, play);
        }
    }
}
//搜索
const search = {
    getDataV: function (v) {
        let info = v.getElementsByClassName("bili-video-card__info--right")[0];
        let userInfo = info.getElementsByClassName("bili-video-card__info--owner")[0];
        //用户空间地址
        let upSpatialAddress = userInfo.getAttribute("href");
        const topInfo = v.getElementsByClassName("bili-video-card__stats--left")[0].getElementsByClassName("bili-video-card__stats--item");//1播放量2弹幕数
        return {
            //用户名
            name: userInfo.getElementsByClassName("bili-video-card__info--author")[0].textContent,
            //标题
            title: info.getElementsByClassName("bili-video-card__info--tit")[0].getAttribute("title"),
            upSpatialAddress: upSpatialAddress,
            uid: upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1),
            //视频的时间
            videoTime: v.getElementsByClassName("bili-video-card__stats__duration")[0].textContent,
            //播放量
            playbackVolume: topInfo[0],
            //弹幕量
            barrageQuantity: topInfo[1]
        }
    },
    /**
     * 保准页面加载了本脚本之后只会触发一次该判断
     * 用于搜索页面的专栏按钮监听。且只会加载一次
     * @type {boolean}
     */
    searchColumnBool: false,
    /**
     * 删除搜索页面的视频元素
     * @param videoList
     */
    searchRules: function (videoList) {
        for (let v of videoList) {
            try {
                let info = v.getElementsByClassName("bili-video-card__info--right")[0];
                let userInfo = info.getElementsByClassName("bili-video-card__info--owner")[0];
                //用户名
                let name = userInfo.getElementsByClassName("bili-video-card__info--author")[0].textContent;
                //视频标题
                let title = info.getElementsByClassName("bili-video-card__info--tit")[0].getAttribute("title");
                //用户空间地址
                let upSpatialAddress = userInfo.getAttribute("href");
                if (!upSpatialAddress.startsWith("//space.bilibili.com/")) {
                    console.log("检测到不是正常视频内容，故隐藏该元素")
                    //如果获取的类型不符合规则则结束本轮
                    v.parentNode.remove();
                    continue;
                }
                const videoTime = v.getElementsByClassName("bili-video-card__stats__duration")[0].textContent;//视频的时间
                const topInfo = v.getElementsByClassName("bili-video-card__stats--left")[0].getElementsByClassName("bili-video-card__stats--item");//1播放量2弹幕数
                let id = upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1);
                if (shieldVideo_userName_uid_title(v.parentNode, name, id, title, null, videoTime, topInfo[0].textContent)) {
                    continue;
                }
                v.parentNode.onmouseenter = (e) => {
                    const data = search.getDataV(e.srcElement);
                    util.showSDPanel(e, data.name, data.uid);
                };
            } catch (e) {
                v.parentNode.remove();
                console.log("错误信息=" + e + " 删除该元素" + v)
            }
        }
    },
}
//话题
const subjectOfATalk = {
    /**
     * 针对b站话题
     */
    deltopIC: function () {
        for (let v of document.getElementsByClassName("list__topic-card")) {
            const info = v.getElementsByClassName("bili-dyn-content__orig")[0];
            const name = v.getElementsByClassName("bili-dyn-title")[0].textContent.trim();
            const uid = parseInt(v.getElementsByClassName("bili-dyn-item__following")[0].getAttribute("data-mid"));
            if (info.getElementsByClassName("bili-dyn-content__orig__desc").length === 1) {
                const content = info.textContent;
                startPrintShieldNameOrUIDOrContent(v, name, uid, content);
                continue;
            }//如果内容是视频样式
            const videoInfo = info.getElementsByClassName("bili-dyn-card-video")[0];
            const videoTime = videoInfo.getElementsByClassName("bili-dyn-card-video__duration")[0].textContent;
            const title = videoInfo.getElementsByClassName("bili-dyn-card-video__title bili-ellipsis")[0].textContent;
            shieldVideo_userName_uid_title(v, name, uid, title, null, videoTime, null);
        }
    }
}
//动态
const trends = {
    topCssDisply: {
        //针对于整体布局的细调整
        body: function () {
            const interval = setInterval(() => {
                try {
                    document.getElementsByClassName("bili-dyn-home--member")[0].style.justifyContent = 'space-between';
                    document.getElementsByTagName("main")[0].style.width = "70%";
                    document.getElementsByClassName("bili-dyn-my-info")[0].style.display = "none";//移除左侧中的个人基础面板信息
                    util.print("已调整动态界面布局");
                    clearInterval(interval)
                } catch (e) {
                }
            });
        },
        //针对顶部的处理
        topTar: function () {
            const trends = rule.trendsData;
            if (trends.isTop) {
                const interval = setInterval(() => {
                        try {
                            document.getElementById("bili-header-container").remove();//移除顶部栏
                            clearInterval(interval);
                        } catch (e) {
                        }
                    }
                );
            }
        }, rightLayout: function () {
            const trendsData = rule.trendsData;
            if (trendsData.isRightLayout) {
                const interval = setInterval(() => {
                    try {
                        document.getElementsByClassName("right")[0].style.display = "none";//隐藏右侧布局
                        document.getElementsByTagName("main")[0].style.width = "85%";//调整中间动态容器布局宽度
                        clearInterval(interval);
                        util.print("已移除右侧布局并调整中间动态容器布局宽度")
                    } catch (e) {
                    }
                }, 1000);
                return;
            }
            if (trendsData.isBiliDynBanner) {
                const interval = setInterval(() => {
                    try {
                        document.getElementsByClassName("bili-dyn-banner")[0].style.display = "none";
                        util.print("已移除公告栏布局")
                        clearInterval(interval)
                    } catch (e) {
                    }
                });
            }
        }
    },
}

const layout = {
    css: {
        home: function () {
            util.addStyle(`
            #home_layout{
                background: ${home.getBackgroundStr()};
                margin: 0px;
                height: 100%;
                width: 90%;
                max-height: 100%;
                position: fixed;
                z-index: 2023;
                left:5%;
                overflow-y: auto;
                border: 3px solid green;
            }
            #gridLayout{
            display: grid;
            grid-template-columns: 30% auto; 
            }
            button{
             height: 40px;
             }
             #suspensionDiv{
              position: fixed;
                display: none;
                z-index: 1900;
                background: rgb(149, 156, 135);
                height: 30%;
                width: 10%;
                top: 50%;
                left: 85%;
                 border: 3px solid green;
             }
            `);
        }
    },
    loading: {
        home: function () {
            $("body").prepend(`
          <!-- 分割home_layout -->
      <div id="home_layout" style="display: none">
        <div id="gridLayout">
          <div>

            <div>
              <h1>面板设置</h1>
              <div>
                <span>背景透明度</span>
                <input id="backgroundPellucidityRange" type="range" value="1" min="0.1" max="1" step="0.1">
                <span id="backgroundPelluciditySpan">1</span>
              </div>
              <div>
                <span>高度</span>
                <input id="heightRange" type="range" value="100" min="20" max="100" step="0.1">
                <span id="heightSpan">100%</span>
              </div>
              <div>
                <span>宽度</span>
                <input id="widthRange" type="range" value="90" min="20" max="90" step="0.1">
                <span id="widthSpan">90%</span>
              </div>

              <h2>快捷悬浮面板</h2>
              <span>禁用快捷悬浮屏蔽面板自动显示</span> <input type="checkbox" id="DShielPanel">(提示:快捷键2可隐藏该快捷悬浮屏蔽面板)
            </div>
            <hr>
            <details open>
              <summary>规则增删改查</summary>
              <div id="tableBody">
              <select id="model">
                <option value="name">用户名黑名单模式(精确匹配)</option>
                <option value="nameKey">用户名黑名单模式(模糊匹配)</option>
                <option value="uid">用户uid黑名单模式(精确匹配)</option>
                <option value="bName">用户白名单模式(精确匹配)</option>
                <option value="title">标题黑名单模式(模糊匹配)</option>
                <option value="titleCanonical">标题黑名单模式(正则匹配)</option>
                <option value="contentOn">评论关键词黑名单模式(模糊匹配)</option>
                <option value="contentOnCanonical">评论关键词黑名单模式(正则匹配)</option>
                <option value="fanCard">粉丝牌黑名单模式(精确匹配)</option>
                <option value="column">专栏关键词内容黑名单模式(模糊匹配)</option>
              </select>
              <div>
                <select id="singleDoubleModel">
                  <option value="one">单个</option>
                  <option value="batch">批量</option>
                </select>
              </div>
              <input style="width: 42.5%;height: 20px;" type="text" id="inputModel"  maxlength="30"/>
              <textarea
                id="inputTextAreaModel"
                style="resize: none; width: 40%; height: 100px; display: none"
              ></textarea>
              <div id="replace">
                替换(修改)
                <input style="width: 29%;height: 20px;" type="text" id="newInputModel"   maxlength="30" />
              </div>
              <div>
                <button id="butadd">增加</button>
                <button id="butaddAll" style="display: none">批量增加</button>
                <button id="butdel">删除</button>
                <button id="butdelAll" style="display: none">全部删除</button>
                <button id="butSet">修改</button>
                <button id="butFind">查询</button>
                <button id="butPrintAllInfo">打印规则信息</button>
              </div>
            </div>
            </details>
            <hr>
            <details open>
              <summary>视频参数</summary>
              <div>
                <span>禁止打开b站视频时的自动播放</span><input type="checkbox" id="autoPlayCheckbox">
                <div>
                  <span>视频画中画</span><input type="checkbox" id="fenestruleCheckbox">
                </div>
                <h3>视频播放速度</h3>
              拖动更改页面视频播放速度
                <input id="rangePlaySpeed" type="range" value="1.0" min="0.1" max="16" step="0.01">
                <span id="playbackSpeedModel">1.0x</span>
                <button id="preservePlaySpeed">保存</button>
                <div>固定视频播放速度值
                  <select id="playbackSpeedModel">
                  <option value="1">1.0x</option>
                  <option value="0.25">0.25x</option>
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="0.9">0.9x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.35">1.35x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
                <button id="preservePlaybackSpeedModel">保存</button>
              </div>
              <h3>首页推荐视频</h3>
              <span>指定推送</span>
              <select id="pushTypeSelect">
                <option value="分区">分区</option>
                <option value="频道">频道</option>
              </select>
              <select id="video_zoneSelect">
                <option value="1">下拉选择</option>
              </select>
              </div>
              <h3>播放画面翻转</h3>
             <button id="flipHorizontal">水平翻转</button>
             <button id="flipVertical">垂直翻转</button>
             <div>
              自定义角度
              <input id="axleRange" type="range" value="0" min="0" max="180" step="1"><span id="axleSpan">0%</span>
             </div>
            </details>
            <hr>
           <details>
            <summary>其他</summary> 
            <input min="0" style="width: 29%;height: 20px;" type="number" id="inputVideo" />
            <select id="selectVideo">
              <option value="filterSMin">时长最小值(单位秒)</option>
              <option value="filterSMax">时长最大值(单位秒)</option>
              <option value="broadcastMin">播放量最小值</option>
              <option value="broadcastMax">播放量最大值</option>
              <option value="barrageQuantityMin">弹幕量最小值</option>
              <option value="barrageQuantityMax">弹幕量最大值</option>
            </select>
            <button id="butSelectVideo">确定</button>
            <div>
              <button onclick="document.documentElement.scrollTop=0;">页面置顶</button>
            </div>
           </details>
            <hr>
            <details>
              <summary>规则信息</summary>
              <div>
                <p>用户名黑名单模式(精确匹配)个数:
                  <span id="textUserName" style="color: yellow;"></span>个
                </p>  
                <p>用户名黑名单模式(模糊匹配)个数:
                  <span id="textUserNameKey" style="color: yellow;"></span>个
                </p>
                <p>用户uid黑名单模式(精确匹配)个数:
                  <span id="textUserUID" style="color: yellow;"></span>个
                </p>
                <p>用户白名单模式(精确匹配)个数:
                  <span id="textUserBName" style="color: yellow;"></span>个
                </p>
                <p>标题黑名单模式(模糊匹配)个数:
                  <span id="textUserTitle" style="color: yellow;"></span>个
                </p>
                <p>标题黑名单模式(正则匹配)个数:
                  <span id="textUserTitleCanonical" style="color: yellow;"></span>个
                </p>
                <p>评论关键词黑名单模式(模糊匹配)个数:
                  <span id="textContentOn" style="color: yellow;"></span>个
                </p>
                <p>评论关键词黑名单模式(正则匹配)个数:
                  <span id="textContentOnCanonical" style="color: yellow;"></span>个
                </p>
                <p>粉丝牌黑名单模式(精确匹配)个数:
                  <span id="textFanCard" style="color: yellow;"></span>个
                </p>
                <p>专栏关键词内容黑名单模式(模糊匹配)个数:
                <span id="textColumn" style="color: yellow;"></span>个
                </p>
              </div>
            </details>
            <hr>
            <details>
              <summary>规则导入导出</summary>
              <div>
                <div>
                  导出
                  <button id="outFIleRule">导出全部规则</button>
                  <button id="outRuleCopy">导出全部规则到剪贴板</button>
                  <button id="outUIDFIleRule">导出全部UID规则</button>
                  <button id="outShieldingSettings" title="当前b站账号下的针对于视频内的弹幕屏蔽规则">导出b站弹幕屏蔽规则</button>
                </div>
                <div>
                  导入
                  <button id="inputFIleRule">确定导入</button>
                  <button title="与本地的黑名单UID合并" id="inputMergeUIDRule">确定合并导入UID规则</button>
                  <button id="inputShieldingSettings" title="当前b站账号下的针对于视频内的弹幕屏蔽规则">导入本地b站弹幕屏蔽规则</button>
                </div>
                <textarea
                  id="ruleEditorInput"
                  placeholder="请填写导出多的规则内容"
                  style="resize: none; height: 300px; width: 60%"
                ></textarea>
              </div>
            </details>
            <hr>
            <details>
              <summary>快捷键</summary>
              <div>
              <h1>快捷键</h1>
              <p> 显示隐藏面板 快捷键\`</p>
              <p>选中取消快捷悬浮屏蔽按钮跟随鼠标 快捷键1</p>
              <p>隐藏快捷悬浮屏蔽按钮 快捷键2</p>
            </div>
            </details>
            <hr>
            <div>
              <h1>
                反馈问题
              </h1>
              <p>
                作者b站：
                <span>
                  <a href="https://space.bilibili.com/473239155" target="_blank">点我进行传送！</a>
                </span>
              </p>
              <p>
                本脚本gf反馈页
                <span>
                  <a href="https://greasyfork.org/zh-CN/scripts/461382-b%E7%AB%99%E5%B1%8F%E8%94%BD%E5%A2%9E%E5%BC%BA%E5%99%A8/feedback" target="_blank">点我进行传送！</a>
                </span>
              </p>

            </div>
          </div>
          <div>
            <h1>输出信息</h1>
            <button id="butClearMessage">清空信息</button>
            <div id="outputInfo">
            </div>
          </div>
        </div>
      </div>
      <!-- 分割home_layout -->
      <!-- 悬浮屏蔽按钮 -->
      <div id="suspensionDiv">坐标:
        <span id="suspensionXY">xy</span>
        <div>
          <span>快捷悬浮屏蔽按钮跟随鼠标</span>
          <input id="quickLevitationShield" type="checkbox">
        </div>
        <p>
          标题(如有则显示):
          <span id="suspensionTitle">占位符</span>
        </p>
        <p>
          用户名：
         <span id="nameSuspensionDiv"></span>
        </p>
        <p>
          用户UID：
          <a id="uidSuspensionDiv" href="#" target="_blank">用户地址</a>
        </p>
        <button id="butShieldName">add屏蔽用户名</button>
        <button id="butShieldUid">add屏蔽用户名UID</button>
      </div>
     <!-- 悬浮屏蔽按钮 -->
    `);
        }
    }
}


//获取动态页面-评论区信息-单个元素信息-楼主
function getVideoCommentAreaOrTrendsLandlord(v) {
    const userInfo = v.getElementsByClassName("user-info")[0];
    return {
        name: userInfo.getElementsByClassName("user-name")[0].textContent,
        uid: userInfo.getElementsByClassName("user-name")[0].getAttribute("data-user-id"),
        content: v.getElementsByClassName("reply-content")[0].parentNode.textContent
    }
}

//获取动态页面-评论区信息-单个元素信息-楼层
function getVideoCommentAreaOrTrendsStorey(j) {
    return {
        name: j.getElementsByClassName("sub-user-name")[0].textContent,
        uid: j.getElementsByClassName("sub-user-name")[0].getAttribute("data-user-id"),
        content: j.getElementsByClassName("reply-content-container sub-reply-content")[0].textContent
    }
}


function perf_observer() {
    const entries = performance.getEntriesByType('resource');
    const windowUrl = util.getWindowUrl();
    for (let entry of entries) {
        const url = entry.name;
        const initiatorType = entry.initiatorType;
        if (initiatorType === "img" || initiatorType === "css" || initiatorType === "link" || initiatorType === "beacon") {
            continue;
        }
        //只要json类的
        if (url.includes("api.bilibili.com/x/web-interface/web/channel") && windowUrl.includes("www.bilibili.com/v/channel")) {
            //针对于频道界面的综合视频和频道界面的精选视频
            frequencyChannel.videoRules();
            frequencyChannel.listRules();
            continue;
        }
        if (url.includes("https://api.bilibili.com/x/v2/reply/main?csrf=") ||
            url.includes("api.bilibili.com/x/v2/reply/reply?csrf=") &&
            windowUrl.includes("https://www.bilibili.com/video") &&
            !rule.videoData.isCommentArea) {
            //如果是视频播放页的话，且接收到评论的相应请求
            for (let v of document.getElementsByClassName("reply-item")) {//针对于评论区
                const data = getVideoCommentAreaOrTrendsLandlord(v);
                const subReplyList = v.getElementsByClassName("sub-reply-list")[0];//楼主下面的评论区
                if (startPrintShieldNameOrUIDOrContent(v, data.name, data.uid, data.content)) {
                    continue;
                }
                v.onmouseenter = (e) => {
                    const element = e.srcElement;
                    const data = getVideoCommentAreaOrTrendsLandlord(element);
                    util.showSDPanel(e, data.name, data.uid);
                };
                for (let j of subReplyList.getElementsByClassName("sub-reply-item")) {
                    const data = getVideoCommentAreaOrTrendsStorey(j);
                    if (startPrintShieldNameOrUIDOrContent(j, data.name, data.uid, data.content)) {
                        continue;
                    }
                    j.onmouseenter = (e) => {
                        const element = e.srcElement;
                        const data = getVideoCommentAreaOrTrendsStorey(element);
                        util.showSDPanel(e, data.name, data.uid);
                    };
                }
            }
            continue;
        }
        if (url.includes("api.bilibili.com/x/msgfeed/reply?platform=") || url.includes("api.bilibili.com/x/msgfeed/reply?id=")) {//第一次加载对应json信息和后续添加的json信息
            message.delMessageReply();
            continue;
        }
        if (url.includes("api.bilibili.com/x/article/metas?ids=")) {
            searchColumn();
            continue;
        }
        if (url.includes("api.bilibili.com/x/msgfeed/at?build=")) {//消息中心的 @我的
            message.delMessageAT();
            continue;
        }

        //后面一个条件限制为仅仅是专栏页面的该api，消息中心的api疑似也是这个，后续在测试看下
        if (url.includes("api.bilibili.com/x/v2/reply/main?callback=jQuery") || url.includes("api.bilibili.com/x/v2/reply/reply?callback=jQuery")) {
            if (windowUrl.includes("www.bilibili.com/read")) {
                delDReplay();
                continue;
            }
            if (windowUrl.includes("t.bilibili.com")) {
                console.log("接收到了动态的评论区api")
                delDReplay();
                continue;
            }
            if (windowUrl.includes("www.bilibili.com/v/topic/detail/?topic_id=")) {//话题界面的楼层评论
                console.log("话题界面的api")
            }
            if (windowUrl.search("space.bilibili.com/.*dynamic") !== -1) {
                delDReplay();
            }
        }
        if (url.includes("app.bilibili.com/x/topic/web/details/cards?topic_id=") && windowUrl.includes("www.bilibili.com/v/topic/detail/?topic_id=")) {//话题页面数据加载
            subjectOfATalk.deltopIC();
            continue;
        }
        if (url.includes("api.live.bilibili.com/xlive/web-interface/v1/second/getList?platform=web")) {//直播间列表，目前依旧还有点小问题，暂时不考虑维护了，后面再考虑
            liveDel.delLiveRoom();
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/popular")
            || url.includes("api.bilibili.com/x/copyright-music-publicity/toplist/music_list?csrf=")
            && windowUrl.includes("www.bilibili.com/v/popular")) {//热门
            greatDemand.delVideo();
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/dynamic/region?ps=")) {//首页分区类的api
            home.startShieldMainVideo("bili-video-card");
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/ranking/region?")) {//首页分区排行榜
            for (let v of document.querySelectorAll(".bili-rank-list-video__list.video-rank-list")) {//遍历每个排行榜
                for (let q of v.querySelectorAll("li[class='bili-rank-list-video__item']")) {//遍历某个排行榜中的项目
                    const title = q.querySelector("[title]").textContent;
                    const isTitle = shield.arrContent(localData.getArrTitle(), title);
                    if (isTitle != null) {
                        util.print(`已通过标题黑名单关键词屏蔽【${isTitle}】标题【${title}】`);
                        q.remove();
                        continue;
                    }
                    const isTitleCanonical = shield.arrContentCanonical(localData.getArrTitleKeyCanonical(), title);
                    if (isTitleCanonical != null) {
                        util.print(`已通过标题正则黑名单关键词屏蔽【${isTitleCanonical}】标题【${title}】`);
                        q.remove();
                    }
                }
            }
        }
    }
    performance.clearResourceTimings();//清除资源时间
}


/**
 * 根据规则屏蔽搜索专栏项目
 */
function searchColumn() {
    const list = document.getElementsByClassName("col_6 mb_x40");
    for (let v of list) {
        const userInfo = v.getElementsByClassName("flex_start flex_inline text3")[0];
        const title = v.getElementsByClassName("text1")[0].textContent;
        const textContent = v.getElementsByClassName("atc-desc b_text text_ellipsis_2l text3 fs_5")[0].textContent;//搜索专栏中的预览部分
        const name = userInfo.textContent;
        const upSpatialAddress = userInfo.getAttribute("href");
        const uid = parseInt(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1));
        if (remove.isWhiteUserUID(uid)) {
            continue;
        }
        if (remove.uid(v, uid)) {
            util.print("已通过uid【" + uid + "】，屏蔽用户【" + name + "】，专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
            continue;
        }
        if (remove.name(v, name)) {
            util.print("已通过黑名单用户【" + name + "】，屏蔽处理，专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
            continue;
        }
        const isNameKey = remove.nameKey(v, name);
        if (isNameKey != null) {
            util.print("用户【" + name + "】的用户名包含屏蔽词【" + isNameKey + "】 故进行屏蔽处理 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid)
            continue;
        }
        const isTitleKey = remove.titleKey(v, title);
        if (isTitleKey != null) {
            util.print("通过标题关键词屏蔽用户【" + name + "】 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
            continue;
        }
        const titleKeyCanonical = remove.titleKeyCanonical(v, title);
        if (titleKeyCanonical != null) {
            util.print(`通过标题正则表达式=【${titleKeyCanonical}】屏蔽用户【${name}】专栏预览内容=${textContent} 用户空间地址=https://space.bilibili.com/${uid}`);
            continue;
        }
        const key = remove.columnContentKey(v, textContent);
        if (key !== null) {
            util.print("已通过专栏内容关键词【" + key + "】屏蔽用户【" + name + "】 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
        }
    }
}

/**
 * 根据网页url指定不同的逻辑
 * @param href{String} url链接
 */
function ruleList(href) {
    if (href.includes("https://search.bilibili.com/all") || href.includes("search.bilibili.com/video")) {//搜索页面-综合-搜索界面-视频
        const interval = setInterval(() => {
            while (true) {
                const list = document.getElementsByClassName("bili-video-card");
                const tempListLength = list.length;
                if (tempListLength === 0) {
                    break;
                }
                try {//删除搜索到的精确结果元素
                    document.getElementsByClassName("activity-game-list i_wrapper search-all-list")[0].remove();
                    util.print("删除搜索到的精确结果元素")
                } catch (e) {
                }
                try {//删除搜索到的精确用户结果元素
                    document.getElementsByClassName("user-list search-all-list")[0].remove();
                    util.print("删除搜索到的精确用户结果元素")
                } catch (e) {
                }
                search.searchRules(list);
                if (tempListLength === list.length) {
                    clearInterval(interval);
                    //util.print("页面元素没有变化，故退出循环")
                    break;
                }
            }
        }, 500);
    }
    if (href.includes("message.bilibili.com/#/at") || href.includes("message.bilibili.com/?spm_id_from=..0.0#/at")) {//消息中心-艾特我的
        message.delMessageAT();
        return;
    }
    if (href.includes("message.bilibili.com/#/reply") || href.includes("message.bilibili.com/?spm_id_from=..0.0#/reply")) {
        message.delMessageReply();
        return;
    }
    if (href.search("www.bilibili.com/v/channel/.*?tab=.*") !== -1) {//频道 匹配到频道的精选列表，和综合的普通列表
        frequencyChannel.videoRules();
        frequencyChannel.delDevelop();
        frequencyChannel.cssStyle.backGauge();
    }
    if (href.includes("www.bilibili.com/v/")) {
        home.startShieldMainVideo("bili-video-card");
        console.log("通过URL变动执行屏蔽首页分区视频")
        homePrefecture();

    }

};

/**
 * 隐藏显示面板
 */
function hideDisplayHomeLaylout() {
    const home_layout = document.getElementById("home_layout");
    if (myidClickIndex) {
        home_layout.style.display = "block";
        myidClickIndex = false;
        return;
    }
    home_layout.style.display = "none";
    myidClickIndex = true;
};

//分区rid对应的类型
const video_zoneList = {
    1: "动画(主分区)",
    13: "番剧(主分区)",
    167: "国创(主分区)",
    3: "音乐(主分区)",
    129: "舞蹈(主分区)",
    4: "游戏(主分区)",
    36: "知识(主分区)",
    188: "科技(主分区)",
    234: "运动(主分区)",
    223: "汽车(主分区)",
    160: "生活(主分区)",
    211: "美食(主分区)",
    217: "动物圈(主分区)",
    119: "鬼畜(主分区)",
    155: "时尚(主分区)",
    202: "资讯(主分区)",
    5: "娱乐(主分区)",
    181: "影视(主分区)",
    177: "纪录片(主分区)",
    23: "电影(主分区)",
    11: "电视剧(主分区)"
};


(() => {
    'use strict';
    let href = util.getWindowUrl();
    console.log("当前网页url=" + href);
    if (href.includes("github.com")) {
        github(href);
        return;
    }
    //加载布局
    layout.loading.home();
    layout.css.home();
    $("body").prepend('<button id="mybut">按钮</button>');
    $("#mybut").css({
        "position": "fixed",
        "z-index": "50",
        "width": "50px",
        "height": " 50px",
        "left": "96%",
        "bottom": "85%",
        "background": "rgb(67, 67, 124)",
        "color": "white",
        "border": "none",
        "border-radius": "50%"
    });


    rule.ruleLength();
    rule.showInfo();
    $("#mybut").click(() => {
        hideDisplayHomeLaylout();
    });


    $(document).keyup(function (event) {//单按键监听-按下之后松开事件
        const keycode = event.keyCode;
        if (keycode === 192) {//按下`按键显示隐藏面板
            hideDisplayHomeLaylout();
        }
        if (keycode === 49) {//选中快捷悬浮屏蔽按钮跟随鼠标 键盘上的1
            const q = $("#quickLevitationShield");
            q.prop("checked", !q.is(':checked'));
        }
        if (keycode === 50) {//隐藏快捷悬浮屏蔽按钮 键盘上的2
            $("#suspensionDiv").css("display", "none");
        }
    });


    $('#model').change(() => {//监听模式下拉列表
        const modelStr = $('#model').val();
        if (modelStr === "uid") {
            document.getElementById("inputModel").type = "number";
            return;
        }
        document.getElementById("inputModel").type = "text";
    });
    $('#singleDoubleModel').change(() => {//监听模式下拉列表
        const modelStr = $('#singleDoubleModel').val();
        const inputTextAreaModel = $('#inputTextAreaModel');
        const inputModel = $('#inputModel');
        const butadd = $('#butadd');
        const butdel = $('#butdel');
        const butaddAll = $('#butaddAll');
        const butdelAll = $('#butdelAll');
        const butSet = $('#butSet');
        const butFind = $('#butFind');
        const replace = $('#replace');
        if (modelStr === "one") {//如果中的是单个
            inputTextAreaModel.css("display", "none");
            inputModel.css("display", "block");
            //暂时显示对应的按钮
            butadd.css("display", "inline");
            butdel.css("display", "inline");
            butSet.css("display", "inline");
            butFind.css("display", "inline");
            replace.css("display", "inline");
            butaddAll.css("display", "none");
            butdelAll.css("display", "none");
            return;
        }//如果选择的是批量
        inputModel.css("display", "none");
        inputTextAreaModel.css("display", "block");

        butaddAll.css("display", "inline");
        butdelAll.css("display", "inline");
        //暂时隐藏别的按钮先
        butadd.css("display", "none");
        butdel.css("display", "none");
        butSet.css("display", "none");
        butFind.css("display", "none");
        replace.css("display", "none");

    });

    $("#rangePlaySpeed").bind("input propertychange", function (event) {//监听拖动条值变化-视频播放倍数拖动条
        const vaule = $("#rangePlaySpeed").val();//获取值
        util.setVideoBackSpeed(vaule);
        $("#playbackSpeedSpan").text(vaule + "x");//修改对应标签的文本显示
    });


    $('#playbackSpeedModel').change(() => {//监听模式下拉列表--下拉列表-视频播放倍数
        util.setVideoBackSpeed($('#playbackSpeedModel').val())
    });


    $("#preservePlaybackSpeedModel").click(() => {//保存固定值中的播放数据
        const val = $('#playbackSpeedModel').val();
        util.setData("playbackSpeed", parseFloat(val));
        util.print("已保存播放速度数据=" + val);
    });

    $("#preservePlaySpeed").click(() => {//保存拖动条中的值的播放数据
        const val = $("#rangePlaySpeed").val();
        util.setData("rangePlaySpeed", parseFloat(val));
        util.print("已保存播放速度数据=" + val);
    });


    $("#flipHorizontal").click(function () {//水平翻转视频
        const videoData = rule.videoData;
        if (videoData.flipHorizontal) {
            if (util.setVideoRotationAngle("Y", 0)) {
                videoData.flipHorizontal = false;
            }
            return;
        }
        if (util.setVideoRotationAngle("Y", 180)) {
            videoData.flipHorizontal = true;
        }
    });

    $("#flipVertical").click(function () {//垂直翻转视频
        const videoV = $("video");
        if (videoV === null) {
            return;
        }
        const videoData = rule.videoData;
        if (videoData.flipVertical) {
            if (util.setVideoRotationAngle("X", 0)) {
                videoData.flipVertical = false;
            }
            return;
        }
        if (util.setVideoRotationAngle("X", 180)) {
            videoData.flipVertical = true;
        }
    });


    $("#butShieldName").click(() => {//悬浮小窗体-添加屏蔽用户名
        const name = $("#nameSuspensionDiv").text();
        butLayEvent.butaddName("userNameArr", name);
    });
    $("#butShieldUid").click(() => {//悬浮小窗体-添加屏蔽uid
        const uid = $("#uidSuspensionDiv").text();
        butLayEvent.butaddName("userUIDArr", parseInt(uid));
    });


    $("#axleRange").bind("input propertychange", function (event) {//监听拖动条值变化-视频播放器旋转角度拖动条
        const value = $("#axleRange").val();//获取值
        util.setVideoCenterRotation(value);
        $("#axleSpan").text(value + "%");//修改对应标签的文本显示
    });

    $("#backgroundPellucidityRange").bind("input propertychange", function (event) {//监听拖动条值变化-面板背景透明度拖动条
        const value = $("#backgroundPellucidityRange").val();//获取值
        $("#backgroundPelluciditySpan").text(value);//修改对应标签的文本显示
        const back = home.background;
        $("#home_layout").css("background", util.getRGBA(back.r, back.g, back.b, value));
    });
    $("#heightRange").bind("input propertychange", function (event) {//监听拖动条值变化-面板高度拖动条
        const value = $("#heightRange").val();//获取值
        $("#heightSpan").text(value + "%");//修改对应标签的文本显示
        $("#home_layout").css("height", `${value}%`);
    });
    $("#widthRange").bind("input propertychange", function (event) {//监听拖动条值变化-面板宽度拖动条
        const value = $("#widthRange").val();//获取值
        $("#widthSpan").text(value + "%");//修改对应标签的文本显示
        $("#home_layout").css("width", `${value}%`);
    });


    $("#DShielPanel").click(() => {//点击禁用快捷悬浮屏蔽面板自动显示
        util.setData("isDShielPanel", $("#DShielPanel").is(":checked"));
    });

    $("#autoPlayCheckbox").click(() => {//点击禁止打开b站视频时的自动播放
        util.setData("autoPlay", $("#autoPlayCheckbox").is(":checked"));
    });


    $("#butSelectVideo").click(function () {//确定时长播放量弹幕
        const selectVideo = $("#selectVideo");
        const typeV = selectVideo.val();
        let inputVideoV = $("#inputVideo").val();
        if (inputVideoV === "") {
            return;
        }
        const name = selectVideo.find("option:selected").text();
        inputVideoV = parseInt(inputVideoV);
        switch (typeV) {
            case "filterSMin":
                util.setData("filterSMin", inputVideoV);
                break;
            case "videoDurationMax":
                util.setData("filterSMin", inputVideoV);
                break;
            case "broadcastMin":
                util.setData("broadcastMin", inputVideoV);
                break;
            case "broadcastMax":
                util.setData("broadcastMax", inputVideoV);
                break;
            case "barrageQuantityMin":
                util.setData("barrageQuantityMin", inputVideoV);
                break;
            case "barrageQuantityMax":
                util.setData("barrageQuantityMax", inputVideoV);
                break;
            default:
                alert("出现意外的值！")
                return;
        }
        util.print("已设置" + name + "的值");
    });

    $("#butClearMessage").click(() => {
        if (confirm("是要清空消息吗？")) {
            document.querySelector('#outputInfo').innerHTML = '';
        }
    });


//增
    $("#butadd").click(function () {
        const typeVal = $("#model option:selected").val();
        const content = $("#inputModel").val();
        switch (typeVal) {
            case "name":
                butLayEvent.butaddName("userNameArr", content);
                break;
            case "nameKey":
                butLayEvent.butaddName("userNameKeyArr", content);
                break;
            case "uid":
                butLayEvent.butaddName("userUIDArr", parseInt(content));
                break;
            case "bName":
                butLayEvent.butaddName("userWhiteUIDArr", parseInt(content));
                break;
            case "title":
                butLayEvent.butaddName("titleKeyArr", content);
                break;
            case "titleCanonical":
                butLayEvent.butaddName("titleKeyCanonicalArr", content);
                break;
            case "contentOn":
                butLayEvent.butaddName("commentOnKeyArr", content);
                break;
            case "contentOnCanonical":
                butLayEvent.butaddName("contentOnKeyCanonicalArr", content);
                break;
            case "fanCard":
                butLayEvent.butaddName("fanCardArr", content);
                break;
            case "column":
                butLayEvent.butaddName("contentColumnKeyArr", content);
                break;
            default:
                console.log("butadd出现错误了的结果")
                break;
        }
    })


    $("#butaddAll").click(function () {
        const typeVal = $("#model option:selected").val();
        const content = $("#inputTextAreaModel").val();
        switch (typeVal) {
            case "name":
                butLayEvent.butaddAllName("userNameArr", content);
                break;
            case "nameKey":
                butLayEvent.butaddAllName("userNameKeyArr", content);
                break;
            case "uid":
                butLayEvent.butaddAllName("userUIDArr", parseInt(content));
                break;
            case "bName":
                butLayEvent.butaddAllName("userWhiteUIDArr", parseInt(content));
                break;
            case "title":
                butLayEvent.butaddAllName("titleKeyArr", content);
                break;
            case "titleCanonical":
                butLayEvent.butaddAllName("titleKeyCanonicalArr", content);
                break;
            case "contentOn":
                butLayEvent.butaddAllName("commentOnKeyArr", content);
                break;
            case "contentOnCanonical":
                butLayEvent.butaddAllName("contentOnKeyCanonicalArr", content);
                break;
            case "fanCard":
                butLayEvent.butaddAllName("fanCardArr", content);
                break;
            case "column":
                butLayEvent.butaddAllName("contentColumnKeyArr", content);
                break;
            default:
                console.log("butadd出现错误了的结果")
                break;
        }

    })

//删
    $("#butdel").click(function () {
        const typeVal = $("#model option:selected").val();
        const content = $("#inputModel").val();
        switch (typeVal) {
            case "name":
                butLayEvent.butDelName("userNameArr", content);
                break;
            case "nameKey":
                butLayEvent.butDelName("userNameKeyArr", content);
                break;
            case "uid":
                butLayEvent.butDelName("userUIDArr", parseInt(content));
                break;
            case "bName":
                butLayEvent.butDelName("userWhiteUIDArr", parseInt(content));
                break;
            case "title":
                butLayEvent.butDelName("titleKeyArr", content);
                break;
            case "titleCanonical":
                butLayEvent.butDelName("titleKeyCanonicalArr", content);
                break;
            case "contentOn":
                butLayEvent.butDelName("commentOnKeyArr", content);
                break;
            case "contentOnCanonical":
                butLayEvent.butDelName("contentOnKeyCanonicalArr", content);
                break;
            case "fanCard":
                butLayEvent.butDelName("fanCardArr", content);
                break;
            case "column":
                butLayEvent.butDelName("contentColumnKeyArr", content);
                break;
            default:
                console.log("butdel出现错误了的结果")
                break;
        }
    })

//删
    $("#butdelAll").click(function () {
        const typeVal = $("#model option:selected").val();
        switch (typeVal) {
            case "name":
                butLayEvent.butDelAllName("userNameArr");
                break;
            case "nameKey":
                butLayEvent.butDelAllName("userNameKeyArr");
                break;
            case "uid":
                butLayEvent.butDelAllName("userUIDArr");
                break;
            case "bName":
                butLayEvent.butDelAllName("userWhiteUIDArr");
                break;
            case "title":
                butLayEvent.butDelAllName("titleKeyArr");
                break;
            case "titleCanonical":
                butLayEvent.butDelAllName("titleKeyCanonicalArr");
                break;
            case "contentOn":
                butLayEvent.butDelAllName("commentOnKeyArr");
                break;
            case "contentOnCanonical":
                butLayEvent.butDelAllName("contentOnKeyCanonicalArr");
                break;
            case "fanCard":
                butLayEvent.butDelAllName("fanCardArr");
                break;
            case "column":
                butLayEvent.butDelAllName("contentColumnKeyArr");
                break;
            default:
                console.log("butdelAll出现错误了的结果")
                break;
        }
    })

    $("#butSet").click(() => {
        const typeVal = $("#model option:selected").val();
        const oldContent = $("#inputModel").val();
        const newContent = $("#newInputModel").val();
        switch (typeVal) {
            case "name":
                butLayEvent.butSetKey("userNameArr", oldContent, newContent);
                break;
            case "nameKey":
                butLayEvent.butSetKey("userNameKeyArr", oldContent, newContent);
                break;
            case "uid":
            case "bName":
                alert("暂时不支持修改UID");
                break;
            case "title":
                butLayEvent.butSetKey("titleKeyArr", oldContent, newContent);
                break;
            case "titleCanonical":
                butLayEvent.butSetKey("titleKeyCanonicalArr", oldContent, newContent);
                break;
            case "contentOn":
                butLayEvent.butSetKey("commentOnKeyArr", oldContent, newContent);
                break;
            case "contentOnCanonical":
                butLayEvent.butSetKey("contentOnKeyCanonicalArr", oldContent, newContent);
                break;
            case "fanCard":
                butLayEvent.butSetKey("fanCardArr", oldContent, newContent);
                break;
            case "column":
                butLayEvent.butSetKey("contentColumnKeyArr", oldContent, newContent);
                break;
            default:
                console.log("butSet出现错误了的结果")
                break;
        }
    });

//查
    $("#butFind").click(function () {
        const typeVal = $("#model option:selected").val();
        const content = $("#inputModel").val();
        switch (typeVal) {
            case "name":
                butLayEvent.butFindKey("userNameArr", content);
                break;
            case "nameKey":
                butLayEvent.butFindKey("userNameKeyArr", content);
                break;
            case "uid":
                butLayEvent.butFindKey("userUIDArr", parseInt(content));
                break;
            case "bName":
                butLayEvent.butFindKey("userWhiteUIDArr", parseInt(content));
                break;
            case "title":
                butLayEvent.butFindKey("titleKeyArr", content);
                break;
            case "titleCanonical":
                butLayEvent.butFindKey("titleKeyCanonicalArr", content);
                break;
            case "contentOn":
                butLayEvent.butFindKey("commentOnKeyArr", content);
                break;
            case "contentOnCanonical":
                butLayEvent.butFindKey("contentOnKeyCanonicalArr", content);
                break;
            case "fanCard":
                butLayEvent.butFindKey("fanCardArr", content);
                break;
            case "column":
                butLayEvent.butFindKey("contentColumnKeyArr", content);
                break;
            default:
                console.log("butdel出现错误了的结果")
                break;
        }
    })


//点击导出规则事件
    $("#outFIleRule").click(() => {
        let s = prompt("保存为", "规则");
        if (s.includes(" ") || s === "" || s.length === 0) {
            s = "规则";
        }
        fileDownload(util.getRuleFormatStr(), s + ".json");
    });


    $("#outRuleCopy").click(function () {//导出到剪切板
        util.copyToClip(util.getRuleFormatStr());
    })

    //点击导出UID规则事件
    $("#outUIDFIleRule").click(() => {
        const list = localData.getArrUID();
        fileDownload(JSON.stringify(list), `UID规则-${list.length}个.json`);
    });
    $("#outShieldingSettings").click(() => {//导出当前b站登录账号针对弹幕的屏蔽设定
//已经登录b站账号的前提下，打开该api
//https://api.bilibili.com/x/dm/filter/user
//即可获取到该账号下的b站云端最新的屏蔽词内容

//type类型
//0 屏蔽文本
//1 屏蔽正则
//2 屏蔽用户
        /**
         * filter 规则内容
         */
        /**
         *opened 是否启用
         */
        const item = window.localStorage.getItem("bpx_player_profile");
        if (item === null || item === undefined) {
            alert("找不到当前账号的屏蔽设定规则，请确定进行登录了并进行加载了弹幕的屏蔽设定");
            return;
        }
        const arrList = JSON.parse(item)["blockList"];
        if (arrList === undefined || arrList === null || arrList.length === 0) {
            alert("当前账号的屏蔽设定规则没有屏蔽设定规则哟，请确定进行登录了并加载了弹幕的屏蔽设定");
            return;
        }
        const list = [];
        for (const arrListElement of arrList) {
            const type = arrListElement["type"];
            const filter = arrListElement["filter"];
            const opened = arrListElement["opened"];
            const id = arrListElement["id"];
            if (type === 2) {
                continue;
            }
            list.push(arrListElement);
        }
        fileDownload(JSON.stringify(list), "b站账号弹幕屏蔽设定规则.json");
    });


//打印当前页面规则信息
    $("#butPrintAllInfo").click(() => {
        util.print(util.getRuleFormatStr());
    })


    //导入规则按钮事件
    $("#inputFIleRule").click(function () {
        let content = $("#ruleEditorInput").val();
        if (content === "" || content === " ") {
            alert("请填写正确的规则样式！");
            return;
        }
        const b = confirm("需要注意的是，这一步操作会覆盖你先前的规则！您确定要导入吗？");
        if (!b) {
            return;
        }
        let jsonRule = [];
        try {
            content = content.replaceAll("undefined", "null");
            jsonRule = JSON.parse(content);
        } catch (error) {
            alert("内容格式错误！" + error)
            return;
        }
        let list = jsonRule["用户名黑名单模式(精确匹配)"];
        if (!(list === null || list.length === 0)) {
            localData.setArrName(list);
        }
        list = jsonRule["用户名黑名单模式(模糊匹配)"];
        if (!(list === null || list.length === 0)) {
            localData.setArrNameKey(list);
        }
        list = jsonRule["用户uid黑名单模式(精确匹配)"];
        if (!(list === null || list.length === 0)) {
            localData.setArrUID(list)
        }
        list = jsonRule["用户uid白名单模式(精确匹配)"];
        if (!(list === null || list.length === 0)) {
            localData.setArrWhiteUID(list);
        }
        list = jsonRule["标题黑名单模式(模糊匹配)"];
        if (!(list === null || list.length === 0)) {
            localData.setArrTitle(list);
        }
        list = jsonRule["标题黑名单模式(正则匹配)"];
        if (!(list === null || list.length === 0)) {
            localData.setArrTitleKeyCanonical(list);
        }
        list = jsonRule["评论关键词黑名单模式(模糊匹配)"];
        if (!(list === null || list.length === 0)) {
            util.setData("commentOnKeyArr", list);
        }
        list = jsonRule["评论关键词黑名单模式(正则匹配)"];
        if (!(list === null || list.length === 0)) {
            localData.setArrContentOnKeyCanonicalArr(list);
        }
        list = jsonRule["粉丝牌黑名单模式(精确匹配)"];
        if (!(list === null || list.length === 0)) {
            util.setData("fanCardArr", list);
        }
        list = jsonRule["专栏关键词内容黑名单模式(模糊匹配)"];
        if (!(list === null || list.length === 0)) {
            util.setData("contentColumnKeyArr", list);
        }
        alert("已导入");
    })


    $("#inputMergeUIDRule").click(function () {
        const content = $("#ruleEditorInput").val();
        let uidList;
        try {
            uidList = JSON.parse(content)
            if (!(uidList instanceof Array)) {
                throw new Error("错误信息，导入的类型不是数组！");
            }
        } catch (e) {
            alert("类型错误，导入的内容不是jsoN")
            return;
        }
        for (let i = 0; i < uidList.length; i++) {
            try {
                uidList[i] = parseInt(uidList[i]);
            } catch (e) {
                alert("数组中存在非数字内容")
                return;
            }
        }
        if (uidList.length === 0) {
            alert("该数组长度为0！")
            return;
        }
        const data = localData.getArrUID();
        if (data === undefined || data === null || !(data instanceof Array) || data.length === 0) {
            if (confirm("未检测到本地的UID规则，是否要覆盖或者直接添加？")) {
                localData.setArrUID(uidList);
                alert("添加成功！")
            }
            return;
        }
        let index = 0;
        for (const v of uidList) {
            if (data.includes(v)) {
                continue;
            }
            index++;
            data.push(v);
        }
        if (index === 0) {
            alert("内容没有变化！，可能是原先的规则里已经有了");
            return;
        }
        alert(`已新增${index}个UID规则`);
        localData.setArrUID(data);
    })

    $("#inputShieldingSettings").click(() => {//导入本地b站弹幕屏蔽规则
        alert("暂时未写")
    });


    /**
     * 内容导出为文件
     * @param {String}content 内容
     * @param {String}fileName 文件名
     */
    function fileDownload(content, fileName) {
        // 获取导出文件内容
        // 创建隐藏的下载文件链接
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', fileName);
        element.style.display = 'none';
        document.body.appendChild(element);
        // 手动触发下载
        element.click();
        // 清理dom
        document.body.removeChild(element);
    }

    $("#fenestruleCheckbox").change(function () {
        if ($("#fenestruleCheckbox").is(":checked")) {//如果是选中状态
            try {
                for (const v of $("video")) {
                    v.requestPictureInPicture();//进入画中画
                }
            } catch (e) {
                alert("未找到视频播放器！")
            }
        } else {
            try {
                for (const v of $("video")) {
                    v.exitPictureInPicture();//退出画中画
                }
            } catch (e) {
                alert("未找到视频播放器！")
            }
        }
    });


    function addVideo_zoneListE() {
        for (const v in video_zoneList) {
            $("#video_zoneSelect").append(`<option value=${v}>${video_zoneList[v]}</option>`);
        }
    }

    addVideo_zoneListE();
    $('#pushTypeSelect').change(() => {//监听模式下拉列表--下拉列表-指定推送类型-分区亦或者频道
        const tempVar = $('#pushTypeSelect').val();
        $("#video_zoneSelect>option:not(:first)").remove();//清空下拉选择器内的元素（除第一个）
        home.setPushType(tempVar);
        if (tempVar === "分区") {
            addVideo_zoneListE();
            return;
        }
        const list = frequencyChannel.data.channel_idList;
        for (const v in list) {
            $("#video_zoneSelect").append(`<option value=${v}>${list[v]}</option>`);
        }
    });

    $('#video_zoneSelect').change(() => {//监听模式下拉列表--下拉列表-首页推荐视频分区亦或者频道
        const tempVar = parseInt($('#video_zoneSelect').val());
        if ($('#pushTypeSelect').val() === "分区") {
            util.print("选择了分区" + video_zoneList[tempVar] + " uid=" + tempVar);
            localData.setVideo_zone(tempVar);
        } else {
            util.print("选择了频道" + frequencyChannel.data.channel_idList[tempVar] + " uid=" + tempVar);
            frequencyChannel.setChannel_id(tempVar);
        }
    });


    ruleList(href)//正常加载网页时执行
    //每秒监听网页标题URL
    setInterval(function () {//每秒监听网页中的url
        const tempUrl = util.getWindowUrl();
        if (href === tempUrl) {//没有变化就结束本轮
            return;
        }//有变化就执行对应事件
        console.log("页面url发生变化了，原=" + href + " 现=" + tempUrl);
        href = tempUrl;//更新url
        ruleList(href);//网页url发生变化时执行
        bilibili(href);
    }, 1000);


    if (href.includes("bilibili.com")) {
        bilibili(href);
        startMonitorTheNetwork();
    }
})
();

/**
 *
 * @param {string}href
 */
function youtube(href) {

}

function github(href) {
    setInterval(() => {//github站内所有的链接都从新的标签页打开，而不从当前页面打开
        $("a").attr("target", "_blank");
    }, 1000);
}


function bilibili(href) {
    if (href.includes("https://www.bilibili.com/video")) {//如果是视频播放页的话
        const videoData = rule.videoData;
        const interval = setInterval(() => {
            try {
                const videoElement = document.getElementsByTagName("video")[0];
                if (videoElement === undefined) {
                    return;
                }
                clearInterval(interval);
                const autoPlay = util.getData("autoPlay");
                if (autoPlay === true) {
                    const intervalAutoPlay = setInterval(() => {
                        const au = $("input[aria-label='自动开播']");
                        if (au.length === 0) {
                            return;
                        }
                        videoElement.pause();
                        if (au.is(":checked")) {
                            au.attr("checked", false);
                            console.log(au.is(":checked"));
                        } else {
                            clearInterval(intervalAutoPlay);
                            console.log("退出intervalAutoPlay")
                            console.log("已自动暂定视频播放");
                        }
                    }, 800);
                }

                function setVideoSpeedInfo() {
                    const data = util.getData("playbackSpeed");
                    if (data === undefined) {
                        return;
                    }
                    if (data === 0 || data < 0.1) {
                        return;
                    }
                    //播放视频速度
                    videoElement.playbackRate = data;
                    util.print("已设置播放器的速度=" + data);
                }

                setVideoSpeedInfo();
                videoElement.addEventListener('ended', () => {//播放器结束之后事件
                    util.print("播放结束");
                    if (videoData.isVideoEndRecommend) {
                        util.circulateClassName("bpx-player-ending-content", 2000, "已移除播放完视频之后的视频推荐");
                    }
                }, false);
            } catch (e) {
            }
        }, 1000);
        if (!videoData.isrigthVideoList && !videoData.isRhgthlayout && !videoData.isRightVideo) {//如果删除了右侧视频列表和右侧布局就不用监听该位置的元素了
            const interval = setInterval(() => {
                if (document.getElementsByClassName("duration")[0]) {//先检测是否存在时间
                    console.log("检测到右侧视频列表中符合条件")
                    document.getElementById("reco_list").addEventListener("DOMSubtreeModified", () => {
                        setTimeout(() => {
                            videoFun.rightVideo().then(() => {
                            });
                        }, 1500);
                    });
                    clearInterval(interval)
                }
            }, 3500);
        }
        videoFun.delRightE();
        videoFun.delBottonE();
        videoFun.rightSuspendButton();

        const upInfo = document.querySelector("#v_upinfo > div.up-info_right > div.name > a.username");
        upInfo.onmouseenter = (e) => {
            const element = e.srcElement;
            const adHref = element.href;
            util.showSDPanel(e, element.text.trim(), adHref.substring(adHref.lastIndexOf("/") + 1));
        };
        //click_playerCtrlWhid();
        return;
    }
    if (href.includes("https://live.bilibili.com/?spm_id_from") || href === "https://live.bilibili.com/") {//直播首页
        console.log("进入直播首页了")
        const interval01 = setInterval(() => {
            const videoElement = document.getElementsByTagName("video")[0];
            if (videoElement) {
                videoElement.pause();//暂停视频
                //删除直播首页顶部无用直播间（包括占用大屏幕的，还其右侧的直播间列表）
                const bigPlayerClass = document.getElementsByClassName("player-area-ctnr border-box p-relative t-center")[0];
                if (bigPlayerClass) {
                    bigPlayerClass.remove();
                    clearInterval(interval01);
                }
            }
            const interval02 = setInterval(() => {
                const classNameElement = document.getElementsByClassName("link-footer-ctnr")[0];
                if (classNameElement) {
                    classNameElement.remove();
                    util.print("已移除页脚信息")
                    clearInterval(interval02);
                }
            }, 2000);
            if (rule.liveData.rightSuspendButton) {
                const interval = setInterval(() => {
                    const classNameElement = document.getElementsByClassName("live-sidebar-ctnr a-move-in-left ts-dot-4")[0];
                    if (classNameElement) {
                        clearInterval(interval);
                        classNameElement.remove();
                        util.print("已移除直播首页右侧的悬浮按钮");
                    }
                }, 2000);
            }

        }, 800);
        return;
    }
    if (href.includes("live.bilibili.com/p/eden/area-tags")) {
        console.log("直播专区")
        liveDel.delLiveRoom();
        return;
    }
    if (href.includes("//live.bilibili.com/")) {
        console.log("当前界面疑似是直播间")
        liveDel.topElement();
        liveDel.hreadElement();
        liveDel.bottomElement();
        liveDel.delGiftBar();
        liveDel.delRightChatLayout();
        liveDel.delOtherE();
        try {
            document.getElementById("chat-items").addEventListener("DOMSubtreeModified", () => {
                liveDel.demo();
            });
            console.log("定义了监听器=chat-items")
        } catch (e) {
            console.log("测试，没找着id")
        }
        return;
    }

    if (href.includes("search.bilibili.com") && search.searchColumnBool === false) {
        try {
            document.getElementById("biliMainFooter").remove();
            document.getElementsByClassName("side-buttons flex_col_end p_absolute")[0].remove();
            util.print("已删除搜索底部信息和右侧悬浮按钮")
        } catch (e) {
        }
        search.searchColumnBool = true;
        const interval = setInterval(() => {
            try {
                document.getElementsByClassName("vui_tabs--nav-link")[5].addEventListener("click", () => {//监听用户点击了专栏选项卡
                    setTimeout(() => {
                        console.log("用户点击了专栏")
                        searchColumn();
                    }, 500);
                });
                clearInterval(interval);
            } catch (e) {
            }
        }, 1000);
        return;
    }

    if (href.includes("www.bilibili.com/v/topic/detail/?topic_id=")) {//话题
        subjectOfATalk.deltopIC();
        return;
    }
    if (href === "https://www.bilibili.com/" || href.includes("www.bilibili.com/?spm_id_from") || href.includes("www.bilibili.com/index.html")) {//首页
        console.log("进入了首页");

        //针对频道api中的数据遍历处理并添加进去网页元素
        function ergodicList(list) {
            for (const v of list) {
                const av = v["id"];//视频av号
                const title = v["name"];//标题
                const cover = v["cover"];//封面
                const view_count = v["view_count"];//播放量
                const like_count = v["like_count"];//点赞量
                const danmaku = v["danmaku"];//弹幕量
                const duration = v["duration"];//时长【格式化之后的时分秒】
                const author_name = v["author_name"];//用户名
                const author_id = v["author_id"];//用户UID
                const bvid = v["bvid"];//视频bv号
                tempFunc(author_id, title, author_name, bvid, duration, "", view_count, danmaku, cover);
            }
        };

        //加载频道视频数据
        function loadingVideoZE() {
            const tempChannelId = frequencyChannel.getChannel_id();
            httpUtil.get(`https://api.bilibili.com/x/web-interface/web/channel/multiple/list?channel_id=${tempChannelId}&sort_type=${frequencyChannel.getSort_type()}&offset=${frequencyChannel.getOffset(tempChannelId)}&page_size=30`, function (res) {
                const body = JSON.parse(res.responseText);//频道页一次最多加载30条数据
                if (body["code"] !== 0) {
                    console.log("没有获取到值");
                    return;
                }
                const bodyList = body["data"]["list"];
                if (frequencyChannel.getOffset(tempChannelId) === "") {
                    ergodicList(bodyList[0]["items"]);
                    ergodicList(bodyList.slice(1));
                } else {
                    ergodicList(bodyList);
                }
                frequencyChannel.setOffset(tempChannelId,body["data"]["offset"]);
            });
        };

        /**
         *
         * @param uid uid
         * @param videoTitle 标题
         * @param userName 用户名
         * @param bvid by号
         * @param duration  视频时长
         * @param ctimeStr 发布时间
         * @param view 播放量
         * @param danmaku 弹幕量
         * @param pic 封面
         */
        function tempFunc(uid, videoTitle, userName, bvid, duration, ctimeStr, view, danmaku, pic) {
            if (shield.arrKey(localData.getArrUID(), uid)) {
                util.print(`已通过黑名单UID=【${uid}】屏蔽该用户【${userName}】标题【${videoTitle}】`);
                return;
            }
            const isNameKey = shield.arrContent(localData.getArrNameKey(), userName);
            if (isNameKey != null) {
                util.print(`已通过黑名单用户名关键词【${isNameKey}】屏蔽用户【${userName}】UID【u${uid}】标题【${videoTitle}】`);
                return;
            }
            const isTitleKey = shield.arrContent(localData.getArrTitle(), videoTitle);
            if (isTitleKey != null) {
                util.print(`已通过黑名单标题关键词【${isTitleKey}】屏蔽用户【${userName}】UID【${uid}】标题【${videoTitle}】`)
                return;
            }
            const isTitleKeyCanonical = shield.arrContentCanonical(localData.getArrTitleKeyCanonical(), videoTitle);
            if (isTitleKeyCanonical != null) {
                util.print(`已通过黑名单正则标题【${isTitleKeyCanonical}】屏蔽用户【${userName}】UID【${uid}】标题【${videoTitle}】`);
                return;
            }
            $(".container.is-version8").append(
                addElement.homeVideoE.getHtmlStr(
                    videoTitle, "https://www.bilibili.com/" + bvid, pic, uid, userName, duration, ctimeStr,
                    view, danmaku)
            );
            $("div[class='bili-video-card is-rcmd']:last").mouseenter((e) => {
                const domElement = e.delegateTarget;//dom对象
                const title = domElement.querySelector(".bili-video-card__info--tit").textContent;
                const userInfo = domElement.querySelector(".bili-video-card__info--owner");
                const userHref = userInfo.href;
                const uerName = domElement.querySelector(".bili-video-card__info--author").textContent;
                util.showSDPanel(e, uerName, userHref.substring(userHref.lastIndexOf("/") + 1), title);
                //console.log(tempElement);
            });
        }

        //加载分区视频数据
        function loadingVideoE(ps) {
            httpUtil.get(`https://api.bilibili.com/x/web-interface/dynamic/region?ps=${ps}&rid=${localData.getVideo_zone()}`, function (res) {
                const bodyJson = JSON.parse(res.responseText);
                if (bodyJson["code"] !== 0) {
                    return;
                }
                const archives = bodyJson["data"]["archives"];
                for (const v of archives) {
                    const picUil = v["pic"];
                    const videoTitle = v["title"];
                    let bvid = v["bvid"];
                    const uid = v["owner"]["mid"];
                    const name = v["owner"]["name"];
                    const view = v["stat"]["view"];//播放量
                    const danmaku = v["stat"]["danmaku"];//弹幕量
                    const aid = v["stat"]["aid"];//av号
                    const ctime = v["ctime"];//视频审核时间时间戳
                    const pubdate = v["pubdate"];//视频上传时间时间戳
                    const ctimeStr = util.timestampToTime(ctime * 1000);//发布时间
                    const duration = v["duration"];//视频时长秒
                    const bvidSub = bvid.substring(0, bvid.indexOf("?"));
                    bvid = (bvidSub === "" ? bvid : bvidSub);
                    tempFunc(uid, videoTitle, name, bvid, duration, util.formateTime(ctimeStr), view, danmaku, picUil);
                }
            });
        }


        //监听页面触底
        $(window).scroll(function () {
            if ($(this).scrollTop() + $(this).height() === $(document).height()) {//到达底部之后加载
                console.log("触底了")
                //loadingVideoE(home.videoIndex);
                const temp = home.getPushType();
                if (home.videoIndex <= 50 && temp === "分区") {
                    home.videoIndex += 10;
                }
                if (temp === "分区") {
                    loadingVideoE(home.videoIndex);
                    return;
                }
                loadingVideoZE();
            }
        });
        const interval = setInterval(() => {
            const homeGrid = $(".container.is-version8");
            if (homeGrid === null || homeGrid === undefined || homeGrid.children().length === 0) {
                return;
            }
            clearInterval(interval);
            homeGrid.html("");//先清空该标签的内容
            if (home.getPushType() === "分区") {
                loadingVideoE(25);
            } else {
                loadingVideoZE();
            }
            // //首页
            home.stypeBody();
            document.getElementsByClassName("left-entry")[0].style.visibility = "hidden"//删除首页左上角的导航栏，并继续占位
            $(".feed-roll-btn").remove();//移除换一换
        }, 500);
        return;
    }
    if (href.includes("www.bilibili.com/v/popular")) {//热门
        greatDemand.delVideo();
        try {
            document.getElementsByClassName("international-footer")[0].remove();
        } catch (e) {
            console.log("屏蔽热门底部元素出错！" + e);
        }
        return;
    }
    if (href.includes("t.bilibili.com/?spm_id_from=")) {//动态的首页
        trends.topCssDisply.body();
        trends.topCssDisply.topTar();
        trends.topCssDisply.rightLayout();
        return;
    }
    if (href.includes("www.bilibili.com/v/")) {
        homePrefecture();
        return;
    }
    if (href.includes("space.bilibili.com/")) {//个人主页
        const hrefUID = util.getSubUid(href.split("/")[3]);
        console.log(hrefUID);
        if (shield.arrKey(localData.getArrUID(), hrefUID)) {
            setTimeout(() => {
                alert("当前用户时是黑名单！UID=" + hrefUID)
            }, 4500);
        }
        console.log("个人主页")
    }
}

/**
 * 中中针对于分区的广告页脚信息屏蔽
 */
function homePrefecture() {
    util.circulateID("biliMainFooter", 2000, "已移除底部信息");
    util.circulateClassName("primary-btn feedback visible", 2000, "已移除右侧悬浮按钮");
    for (let v of document.querySelectorAll(".eva-banner")) {
        v.remove();
        console.log("已移除界面中的横幅广告");
    }
}
/*****
 获取用户所有关注的思路：
 不确定js有没有相关可以发起请求的库，以java的为例，请求带上cookie，和referer，
 且用该api发起请求
 https://api.bilibili.com/x/relation/followings?vmid=UID号&pn=页数，从1开始&ps=20&order=desc&order_type=attention&jsonp=jsonp&callback=__jp5
 其中referer值=https://space.bilibili.com/用户UID/fans/follow
 正常情况就可以得到内容了，根据总的关注数量，除以20，且除余就得出需要循环获取多少次了页数

 这里写一下，避免下次还得用搜索引擎查找，目前已知match的网址规则可以这样填写，就匹配到了    *://message.bilibili.com/*

 */