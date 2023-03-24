// ==UserScript==
// @name         b站屏蔽增强器
// @namespace    http://tampermonkey.net/
// @license      MIT
// @version      1.1.10
// @description  根据用户名、uid、视频关键词、言论关键词和视频时长进行屏蔽和精简处理(详情看脚本主页描述)，
// @author       byhgz
// @exclude      *://message.bilibili.com/pages/nav/header_sync
// @exclude      *://message.bilibili.com/pages/nav/index_new_pc_sync
// @exclude      *://live.bilibili.com/blackboard/dropdown-menu.html
// @exclude      *://live.bilibili.com/p/html/live-web-mng/*
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
// @match        https://www.bilibili.com/
// @require      https://code.jquery.com/jquery-3.5.1.min.js
// @icon         https://static.hdslb.com/images/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// ==/UserScript==


//规则
const rule = {
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
        //是否允许b站视频自动播放
        autoPlay: false,
        //控制视频播放速度
        playbackSpeed: 0,
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
//===========================================上面的的相关参数用户可以执行修改=========================================================================
const ruleKey = ["userNameArr", "userNameKeyArr", "userUIDArr", "userWhiteUIDArr", "titleKeyArr", "commentOnKeyArr", "fanCardArr", "contentColumnKeyArr", "filterSMin", "filterSMax", "broadcastMin", "broadcastMax", "barrageQuantityMin", "barrageQuantityMax"];


//是否屏蔽首页=左侧大图的轮播图,反之false
const homePicBool = true;
//是否屏蔽首页右侧悬浮的按钮，其中包含反馈，内测等等之类的,反之false
const paletteButtionBool = true;
//是否隐藏了面板
let myidClickIndex = true;
const home = {
    background: {//主面板背景颜色及透明度
        r: 92,
        g: 80,
        b: 80,
        a: 1
    },
    getBackgroundStr: function () {
        return util.getRGBA(this.background.r, this.background.g, this.background.b, this.background.a);
    },
    //是否正在执行清理首页中的零散的直播间元素函数，该值不需要修改
    boolShieldLive: false,
    //清理首页零散无用的推送,如个别直播推送，综艺，赛事等，零散的掺杂在视频列表中
    startShieldMainAFloorSingle: function () {
        const interval = setInterval(() => {
            let list = document.getElementsByClassName("floor-single-card");
            if (list.length === 0) {
                return;
            }
            while (true) {
                for (let v of list) {
                    v.remove();
                }
                list = document.getElementsByClassName("floor-single-card");//删除完对应元素之后再检测一次，如果没有了就结束循环并结束定时器
                if (list.length === 0) {
                    util.print("清理首页零散无用的推送")
                    clearInterval(interval);
                    return;
                }
            }
        }, 1000);
    },
    //清理首页中的零散的直播间元素
    startShieldMainlive: function () {
        if (home.boolShieldLive === true) {//避免同一时间多个执行！，只能执行完一个再执行下一个，反之其他统统拒绝
            return;
        }
        home.boolShieldLive = true;
        const interval = setInterval(() => {
            const list = document.getElementsByClassName("bili-live-card is-rcmd");
            if (list.length === 0) {
                return;
            }
            for (let v of list) {
                v.remove();
            }
            util.print("已清理零散的直播元素");
            clearInterval(interval);
            home.boolShieldLive = false;
        }, 500);
    },
    //屏蔽首页左侧的轮播大图
    startShieldLeftPic: function () {
        if (homePicBool) {
            const interval = setInterval(() => {
                try {
                    document.getElementsByClassName("recommended-swipe grid-anchor")[0].style.display = "none"
                    util.print("执行了屏蔽首页轮播图")
                    clearInterval(interval);
                } catch (e) {
                }
            }, 1000);
        }
    },
    //屏蔽首页顶部推荐视频
    startShieldVideoTop: function () {
        home.startShieldMainVideo("feed-card");
    },
    //调整首页样式
    stypeBody: function () {
        const interval = setInterval(() => {
            try {
                const headerChannelE = document.getElementsByClassName("bili-header__channel")[0];
                headerChannelE.style.padding = 0;//调整-首页header按钮栏
                headerChannelE.style.height = "auto";//调整其与下面控件的距离
                document.getElementsByClassName("bili-feed4-layout")[0].style.padding = 0;//调整视频列表左右边距为0
                //调整换一换按钮位置
                document.querySelector("#i_cecream > div.bili-feed4 > main > div.feed2 > div > div.feed-roll-btn").style.left = "97%";//调整位置的左距
                document.querySelector("#i_cecream > div.bili-feed4 > main > div.feed2 > div > div.feed-roll-btn").style.top = "10%";//调整位置的顶距
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
                        console.log("获取元素中，获取失败，下一行是该值的html");
                        console.log(v)
                        continue;
                    }
                    let id = upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1);
                    if (isNaN(id)) {
                        v.remove();
                        util.print("检测到不是正常视频样式，故删除该元素");
                        continue;
                    }
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


//删除元素
const remove = {
    /**
     * 根据用户提供的网页元素和对应的数组及key，判断数组里是否完全等于key元素本身，进行屏蔽元素
     * @param element
     * @param arr 数组
     * @param key 唯一key
     * @returns {boolean}
     */
    shieldArrKey: function (element, arr, key) {
        if (arr == null) {
            return false;
        }
        if (arr.includes(key)) {
            element.remove();
            return true;
        }
        return false;
    },
    /**
     * 根据用户提供的字符串集合，与指定内容进行比较屏蔽，当content某个字符包含了了集合中的某个字符则返回对应的字符
     * 反之返回null
     * @param element 网页元素
     * @param arr 字符串数组
     * @param content 内容
     * @returns {null|String}
     */
    shieldArrContent: function (element, arr, content) {
        try {
            for (let str of arr) {
                if (content.toLowerCase().includes(str)) {//将内容中的字母转成小写进行比较
                    element.remove();
                    return str;
                }
            }
        } catch (e) {
            return null;
        }
        return null;
    }
}

const shield = {
    //是否是白名单用户
    isWhiteUserUID: function (uid) {
        const userWhiteUIDArr = util.getData("userWhiteUIDArr");
        if (userWhiteUIDArr === null || userWhiteUIDArr === undefined) {
            return false;
        }
        return userWhiteUIDArr.includes(uid);
    },
    /**
     * 根据用户uid屏蔽元素
     * @param element
     * @param uid
     * @returns {boolean}
     */
    uid: function (element, uid) {
        return remove.shieldArrKey(element, util.getData("userUIDArr"), parseInt(uid));
    }
    ,
    /**
     * 根据用户名屏蔽元素，当用户名完全匹配规则时屏蔽
     * @param element
     * @param name
     * @returns {boolean}
     */
    name: function (element, name) {
        return remove.shieldArrKey(element, util.getData("userNameArr"), name);
    },
    /**
     * 根据用户名规则，当用规则字符包含用户名时返回对应的规则字符，反之null
     * @param element
     * @param name
     * @returns {String|null}
     */
    nameKey: function (element, name) {
        return remove.shieldArrContent(element, util.getData("userNameKeyArr"), name)
    }
    ,
    /**
     * 根据标题屏蔽元素
     * @param element
     * @param title
     * @returns {String|null}
     */
    titleKey: function (element, title) {
        return remove.shieldArrContent(element, util.getData("titleKeyArr"), title)
    }
    ,
    /**
     * 根据用户言论屏蔽元素
     * @param element
     * @param content
     * @returns {String|null}
     */
    contentKey: function (element, content) {
        return remove.shieldArrContent(element, util.getData("commentOnKeyArr"), content);
    }
    ,
    /**
     * 根据用户专栏内容关键词屏蔽元素
     * @param element
     * @param content
     * @returns {String|null}
     */
    columnContentKey: function (element, content) {
        return remove.shieldArrContent(element, util.getData("contentColumnKeyArr"), content);
    }
    ,
    /**
     * 根据用户粉丝牌进行屏蔽
     * @param element
     * @param key
     * @returns {boolean}
     */
    fanCard: function (element, key) {
        return remove.shieldArrKey(element, util.getData("fanCardArr"), key);
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
    const list = document.getElementsByClassName("list-item reply-wrap");
    for (let v of list) {
        const userData = getColumnOrDynamicReviewLandlord(v);
        console.log("已进入评论区")
        if (startPrintShieldNameOrUIDOrContent(v, userData.name, userData.uid, userData.content)) {
            continue;
        }
        userData.userInfo.onmouseenter = (e) => {
            const element = e.srcElement;
            const uid = element.getElementsByTagName("a")[0].getAttribute("data-usercard-mid");
            const name = element.getElementsByClassName("name")[0].textContent;
            $("#nameSuspensionDiv").text(name);
            $("#uidSuspensionDiv").text(uid);
            util.updateLocation(e);
            $("#suspensionDiv").css("display", "inline-block");
        };
        const replyItem = v.getElementsByClassName("reply-box")[0].getElementsByClassName("reply-item reply-wrap");//楼层成员
        for (let j of replyItem) {
            const tempData = getColumnOrDynamicReviewStorey(j);
            if (startPrintShieldNameOrUIDOrContent(j, tempData.name, tempData.uid, tempData.content)) {
                continue;
            }
            j.onmouseenter = (e) => {
                const element = e.srcElement;
                const uid = element.getElementsByTagName("a")[0].getAttribute("data-usercard-mid");
                const name = element.getElementsByClassName("name")[0].textContent;
                $("#nameSuspensionDiv").text(name);
                $("#uidSuspensionDiv").text(uid);
                util.updateLocation(e);
                $("#suspensionDiv").css("display", "inline-block");
            };


        }
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
    print: function name(strContent) {
        $("#outputInfo").prepend(`<span>${this.toTimeString() + "\t\t" + strContent}</span><hr>`);
    },
    getRuleFormatStr: function (userNameArr, userNameKeyArr, userUIDArr, userWhiteUIDArr, titleKeyArr, commentOnKeyArr, fanCardArr, contentColumnKeyArr,
                                filterSMin, videoDurationMax, broadcastMin, broadcastMax, barrageQuantityMin, barrageQuantityMax) {
        //温馨提示每个{}对象最后一个不可以有,符号
        return `{
    "用户名黑名单模式(精确匹配)": ${JSON.stringify(userNameArr)},
    "用户名黑名单模式(模糊匹配)": ${JSON.stringify(userNameKeyArr)},
    "用户uid黑名单模式(精确匹配)": ${JSON.stringify(userUIDArr)},
    "用户uid白名单模式(精确匹配)": ${JSON.stringify(userWhiteUIDArr)},
    "标题黑名单模式(模糊匹配)": ${JSON.stringify(titleKeyArr)},
    "评论关键词黑名单模式(模糊匹配)": ${JSON.stringify(commentOnKeyArr)},
    "粉丝牌黑名单模式(精确匹配)": ${JSON.stringify(fanCardArr)},
    "专栏关键词内容黑名单模式(模糊匹配)": ${JSON.stringify(contentColumnKeyArr)},
    "视频参数": {
        "时长最小值": ${filterSMin},
        "时长最大值": ${videoDurationMax},
        "播放量最小值": ${broadcastMin},
        "播放量最大值": ${broadcastMax},
        "弹幕量最小值": ${barrageQuantityMin},
        "弹幕量最大值": ${barrageQuantityMax},
        "是否允许b站自动播放视频": null,
        "视频播放速度": null,
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
    //获取格式化规则的内容
    getUrleToStringFormat: function () {
        return this.getRuleFormatStr(util.getData("userNameArr"), util.getData("userNameKeyArr"), util.getData("userUIDArr"), util.getData("userWhiteUIDArr"),
            util.getData("titleKeyArr"), util.getData("commentOnKeyArr"), util.getData("fanCardArr"), util.getData("contentColumnKeyArr"), util.getData("filterSMin"),
            util.getData("filterSMax"), util.getData("broadcastMin"),util.getData("broadcastMax"),util.getData("barrageQuantityMin"), util.getData("barrageQuantityMax"));
    },
    /**
     * 打印内存变量中的规则信息
     * @returns {string}
     */
    getRuleInternalStorage: function () {
        return "未定"
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
    }
}


//规则的增删改查
const urleCrud = {
    /**
     * 单个元素进行添加
     * @param {Array} arr
     * @param {String} key
     * @param {String} rule
     */
    add: function (arr, key, rule) {
        arr.push(key);
        util.setData(rule, arr);
        util.print("已添加该值=" + key)
    },
    /**
     * 批量添加，要求以数组形式
     * @param {Array} arr
     * @param {Array} key
     * @param rule
     */
    addAll: function (arr, key, rule) {
        const setList = new Set(arr);
        const setListLength = setList.size;
        for (const v of key) {
            setList.add(v);
        }
        if (setListLength === setList.size) {
            util.print("内容长度无变化，可能是已经有了的值")
            return;
        }
        util.setData(rule, Array.from(setList));
        util.print("已添加该值=" + key)
    },
    del: function (arr, key, rule) {
        const index = arr.indexOf(key);
        if (index === -1) {
            util.print("未有该元素！")
            return;
        }
        if (arr.length === 1) {
            delete localStorage[rule];
            util.print("已经删除该元素=" + key)
            return;
        }
        arr.splice(index, 1);
        util.setData(rule, arr);
        util.print("已经删除该元素=" + key)
    }

}

const butLayEvent = {
    butaddName: function (ruleStr, contentV) {
        if (contentV === '' || contentV.includes(" ")) {
            util.print("请输入正确的内容")
            return;
        }
        if (!confirm(`您要添加的内容是？ 【${contentV}】 ，类型=${ruleStr}`)) {
            return;
        }
        let arrayList = util.getData(ruleStr);
        if (arrayList === null) {
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
        if (arrayList === null) {
            urleCrud.addAll([], tempList, ruleStr);
            return;
        }
        urleCrud.addAll(arrayList, tempList, ruleStr);
    },
    butDelName: function (ruleStr, contentV) {
        if (contentV === '' || contentV.includes(" ")) {
            util.print("请输入正确的内容")
            return;
        }
        let arrayList = util.getData(ruleStr);
        if (arrayList === null) {
            util.print("没有内容哟")
            return;
        }
        if (!arrayList.includes(contentV)) {
            util.print("没有该内容哟=" + contentV)
            return;
        }
        urleCrud.del(arrayList, contentV, ruleStr);
    },
    butDelAllName: function (ruleStr) {
        if (util.getData(ruleStr) === null) {
            util.print("没有内容哟")
            return;
        }
        const b = confirm("您确定要全部删除吗？");
        if (!b) {
            return;
        }
        util.delData(ruleStr);
        util.print("已全部清除=" + ruleStr);
    },
    //查询
    butFindKey: function (ruleStr, contentV) {
        if (contentV === '' || contentV.includes(" ")) {
            util.print("请输入正确的内容")
            return;
        }
        let arrayList = util.getData(ruleStr);
        if (arrayList === null) {
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
            util.print("请输入正确的内容")
            return;
        }
        if (oldKey === newKey) {
            util.print("请输入正确的内容，两者内容不能相同")
            return;
        }
        let arrayList = util.getData(ruleStr);
        if (arrayList === null) {
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
        util.print("替换成功！旧元素=" + oldKey + " 新元素=" + newKey);
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
    if (shield.isWhiteUserUID(uid)) {
        return false;
    }
    const key = shield.contentKey(element, content);
    if (key != null) {
        util.print("已通过言论关键词【" + key + "】屏蔽用户【" + name + "】uid=【" + uid + "】 原言论=" + content + " 用户空间地址=https://space.bilibili.com/" + uid);
        return true;
    }
    const isUid = shield.uid(element, uid);
    if (isUid) {
        util.print("已通过uid=【" + uid + "】屏蔽黑名单用户【" + name + "】，言论=" + content + " 用户空间地址=https://space.bilibili.com/" + uid);
        return true;
    }
    const isName = shield.name(element, name);
    if (isName) {
        util.print("已通过用户名屏蔽指定黑名单用户【" + name + "】uid=【" + uid + "】，言论=" + content + " 用户空间地址=https://space.bilibili.com/" + uid);
        return true;
    }
    const isNameKey = shield.nameKey(element, name);
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
    if (shield.isWhiteUserUID(uid)) {
        return false;
    }
    if (videoHref == null) {
        videoHref = "暂无设定";
    }
    if (uid !== null) {
        const isUid = shield.uid(element, uid);
        if (isUid) {
            util.print("已通过id=" + uid + " 屏蔽黑名单用户=" + name + " 视频=" + title + " 地址=" + videoHref + " 用户空间地址=https://space.bilibili.com/" + uid);
            return true;
        }
    }
    const isName = shield.name(element, name);
    if (isName) {
        util.print("已通过用户名屏蔽指定黑名单用户 " + name + " uid=" + uid + " 视频=" + title + " 地址=" + videoHref + " 用户空间地址=https://space.bilibili.com/" + uid);
        return true;
    }
    const isNameKey = shield.nameKey(element, name);
    if (isNameKey != null) {
        util.print("用户名=" + name + " uid=" + uid + " 因包含屏蔽规则=" + isNameKey + " 故屏蔽该用户,视频标题=" + title + " 地址=" + videoHref + " 用户空间地址=https://space.bilibili.com/" + uid);
        return true;
    }
    const videoTitle = shield.titleKey(element, title);
    if (videoTitle != null) {
        util.print("已通过视频标题关键词=" + videoTitle + " 屏蔽用户" + name + " uid=" + uid + " 视频=" + title + " 地址=" + videoHref + " 用户空间地址=https://space.bilibili.com/" + uid);
    }
    if (videoPlaybackVolume !== null) {
        const change = util.changeFormat(videoPlaybackVolume);
        if (shield.videoMinPlaybackVolume(element, change)) {
            util.print("已滤视频播发量小于=" + rule.videoData.broadcastMin + "的视频 name=" + name + " uid=" + uid + " title=" + title + " 预估播放量=" + videoPlaybackVolume + " 地址=" + videoHref + " 用户空间地址=https://space.bilibili.com/" + uid);
            return true;
        }
        if (shield.videoMaxPlaybackVolume(element, change)) {
            util.print("已滤视频播发量大于=" + rule.videoData.broadcastMax + "的视频 name=" + name + " uid=" + uid + " title=" + title + " 预估播放量=" + videoPlaybackVolume + " 地址=" + videoHref + " 用户空间地址=https://space.bilibili.com/" + uid);
            return true;
        }
    }
    if (videoTime === null) {
        return false;
    }
    const timeTotalSeconds = util.getTimeTotalSeconds(videoTime);
    if (shield.videoMinFilterS(element, timeTotalSeconds)) {
        util.print("已通过视频时长过滤时长小于=" + rule.videoData.filterSMin + "秒的视频 视频=【" + title + " 地址=" + videoHref);
        return true;
    }
    if (shield.videoMaxFilterS(element, timeTotalSeconds)) {
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
    data: {},

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
                    $("#nameSuspensionDiv").text(data.upName);
                    $("#uidSuspensionDiv").text(data.uid);
                    util.updateLocation(e);
                    $("#suspensionDiv").css("display", "inline-block");
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
            if (shield.fanCard(v, fansMeda)) {
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
            if (shield.name(v, name)) {
                util.print("已通过用户名=" + name + " 屏蔽直播间 直播分类=" + type + " 房间标题=" + title + " 人气=" + index)
                continue;
            }
            const nameKey = shield.nameKey(v, name);
            if (nameKey != null) {
                util.print("用户名=" + name + " 包含了=屏蔽词=" + nameKey + " 故屏蔽该直播间 分类=" + type + " 房间标题=" + title + " 人气=" + index)
                continue;
            }
            if (shield.titleKey(v, title)) {
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
                    $("#nameSuspensionDiv").text(data.name);
                    $("#uidSuspensionDiv").text(data.uid);
                    util.updateLocation(e);
                    $("#suspensionDiv").css("display", "inline-block");
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
            $("#home_layout").css({
                "background": `${home.getBackgroundStr()}`,
                "margin": "0px",
                "height": "85%",
                "width": "90%",
                "max-height": "85%",
                "position": "fixed",
                "z-index": "2000",
                "inset": "5% 5% 50%",
                "overflow-y": "auto"
            });
            $("#gridLayout").css({
                "display": "grid",
                "grid-template-columns": "50% auto"
            });
            $("button").css({
                "height": "40px"
            });
            $("#suspensionDiv").css({
                "position": "fixed",
                "display": "none",
                "z-index": "1900",
                "background": "rgb(149, 156, 135)",
                "height": "30%",
                "width": "10%",
                "top": "50%",
                "left": "85%"
            })

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
  <h1>测试</h1>
  <button id="writeData">写入数据</button>
  <button id="readData">读取数据</button>
</div>
          
            <div>
              <h1>面板设置</h1>
              <div>
                <span>背景透明度</span>
                <input id="backgroundPellucidityRange" type="range" value="1" min="0.1" max="1" step="0.1">
                <span id="backgroundPelluciditySpan">1</span>
              </div>
            </div>
            <hr>
            <div>
              <h1 style="display: inline;">规则增删改查</h1>
              <span>当前页面为(暂时未写)</span>
            </div>
            <div id="tableBody">
              <select id="model">
                <option value="name">用户名黑名单模式(精确匹配)</option>
                <option value="nameKey">用户名黑名单模式(模糊匹配)</option>
                <option value="uid">用户uid黑名单模式(精确匹配)</option>
                <option value="bName">用户白名单模式(精确匹配)</option>
                <option value="title">标题黑名单模式(模糊匹配)</option>
                <option value="contentOn">
                  评论关键词黑名单模式(模糊匹配)
                </option>
                <option value="fanCard">粉丝牌黑名单模式(精确匹配)</option>
                <option value="column">
                  专栏关键词内容黑名单模式(模糊匹配)
                </option>
              </select>
              <div>
                <select id="singleDoubleModel">
                  <option value="one">单个</option>
                  <option value="batch">批量</option>
                </select>
              </div>
              <input style="width: 29%;height: 20px;" type="text" id="inputModel"  maxlength="30"/>
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
            <hr>
            <h2>视频参数</h2>
            <div>
              <h3>视频播放速度</h3>
            拖动更改页面视频播放速度
              <input id="rangePlaySpeed" type="range" value="voice" min="0.1" max="16" step="0.01">
              <span id="playbackSpeed">1.0x</span>
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
            </div>
            </div>
            <h3>播放画面翻转</h3>
           <button id="flipHorizontal">水平翻转</button>
           <button id="flipVertical">垂直翻转</button>
           <div>
            自定义角度
            <input id="axleRange" type="range" value="0" min="0" max="180" step="1"><span id="axleSpan">0%</span>
           </div>
            <h3>其他</h3>
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
            <hr>
            <div>
              <h1>规则导入导出</h1>
              <div>
                导出
                <button id="outFIleRule">导出规则</button>
                <button id="outRuleCopy">导出到剪贴板</button>
              </div>
              <div>
                导入
                <button id="inputFIleRule">确定导入</button>
              </div>
              <textarea
                id="ruleEditorInput"
                placeholder="请填写导出多的规则内容"
                style="resize: none; height: 300px; width: 60%"
              ></textarea>
            </div>
            <hr>
            <div>
              <h1>快捷键</h1>
              <p> 显示隐藏面板 快捷键\`</p>
              <p>选中取消快捷悬浮屏蔽按钮跟随鼠标 快捷键1</p>
              <p>隐藏快捷悬浮屏蔽按钮 快捷键2</p>
            </div>
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
            <button onclick="document.querySelector('#outputInfo').innerHTML = '';">清空信息</button>
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
         <span id="nameSuspensionDiv">测试用户名</span>
        </p>
        <p>
          用户UID：
          <span id="uidSuspensionDiv">1433223</span>
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


function perf_observer(list, observer) {
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
                    $("#nameSuspensionDiv").text(data.name);
                    $("#uidSuspensionDiv").text(data.uid);
                    util.updateLocation(e);
                    $("#suspensionDiv").css("display", "inline-block");
                };
                for (let j of subReplyList.getElementsByClassName("sub-reply-item")) {
                    const data = getVideoCommentAreaOrTrendsStorey(j);
                    if (startPrintShieldNameOrUIDOrContent(j, data.name, data.uid, data.content)) {
                        continue;
                    }
                    j.onmouseenter = (e) => {
                        const element = e.srcElement;
                        const data = getVideoCommentAreaOrTrendsStorey(element);
                        $("#nameSuspensionDiv").text(data.name);
                        $("#uidSuspensionDiv").text(data.uid);
                        util.updateLocation(e);
                        $("#suspensionDiv").css("display", "inline-block");
                    };
                }
            }
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd?y_num=5&fresh_type=3&feed_version=V8&fresh_idx_1h=2&fetch_row=1&fresh_idx=2&brush=0&homepage_ver=1&ps=10&last_y_num=5&outside_trigger=&w_rid=")) {
            //首页带有换一换一栏的视频列表
            home.startShieldVideoTop();
            console.log("首页带有换一换一栏的视频列表")
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd?y_num=4&fresh_type=4&feed_version=V8&fresh_idx_1h=")) {//首页换一换推送下面的视频
            home.startShieldMainVideo("bili-video-card is-rcmd");
            home.startShieldMainAFloorSingle();
            home.startShieldMainlive();
            continue;

        }
        if (url.includes("api.bilibili.com/x/web-show/wbi/res/locs?pf=")) {//首页赛事相关
            home.startShieldMainAFloorSingle();
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
        }
        if (url.includes("app.bilibili.com/x/topic/web/details/cards?topic_id=") && windowUrl.includes("www.bilibili.com/v/topic/detail/?topic_id=")) {//话题页面数据加载
            subjectOfATalk.deltopIC();
            continue;
        }
        if (url.includes("api.live.bilibili.com/xlive/web-interface/v1/second/getList?platform=web")) {//直播间列表，目前依旧还有点小问题，暂时不考虑维护了，后面再考虑
            liveDel.delLiveRoom();
            continue;
        }

        if (url.includes("api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd?y_num=")) {//该api应该是首页可通过换一换是推荐下面的视频内容
            console.log("不确定api链接！")
        }
        if (url.includes("api.bilibili.com/x/web-interface/popular")
            || url.includes("api.bilibili.com/x/copyright-music-publicity/toplist/music_list?csrf=")
            && windowUrl.includes("www.bilibili.com/v/popular")) {//热门
            greatDemand.delVideo();
        }
        if (url.includes("api.bilibili.com/x/web-interface/ranking") || url.includes("api.bilibili.com/x/web-interface/dynamic")) {//首页分区类的api
            home.startShieldMainVideo("bili-video-card");
        }
    }
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
        if (shield.isWhiteUserUID(uid)) {
            continue;
        }
        if (shield.uid(v, uid)) {
            util.print("已通过uid【" + uid + "】，屏蔽用户【" + name + "】，专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
            continue;
        }
        if (shield.name(v, name)) {
            util.print("已通过黑名单用户【" + name + "】，屏蔽处理，专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
            continue;
        }
        const isNameKey = shield.nameKey(v, name);
        if (isNameKey != null) {
            util.print("用户【" + name + "】的用户名包含屏蔽词【" + isNameKey + "】 故进行屏蔽处理 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid)
            continue;
        }
        const isTitleKey = shield.titleKey(v, title);
        if (isTitleKey != null) {
            util.print("通过标题关键词屏蔽用户【" + name + "】 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
            continue;
        }
        const key = shield.columnContentKey(v, textContent);
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
    if (href.includes("www.bilibili.com/v/food/")) {
        home.startShieldMainVideo("bili-video-card");
        try {
            document.getElementById("biliMainFooter").remove();
            util.print("已移除页脚信息")
        } catch (e) {
        }
    }

}

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
}

(function () {
    'use strict';
    let href = util.getWindowUrl();
    util.print("当前网页url= " + href);
    console.log("当前网页url=" + href);
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


    document.getElementById("mybut").addEventListener("click", function () {
        hideDisplayHomeLaylout();
    })


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
        $("#playbackSpeed").text(vaule + "x");//修改对应标签的文本显示
    });


    $('#playbackSpeedModel').change(() => {//监听模式下拉列表--下拉列表-视频播放倍数
        util.setVideoBackSpeed($('#playbackSpeedModel').val())
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
        butLayEvent.butaddName("userUIDArr", uid);
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
                butLayEvent.butaddName("userUIDArr", content);
                break;
            case "bName":
                butLayEvent.butaddName("userWhiteUIDArr", content);
                break;
            case "title":
                butLayEvent.butaddName("titleKeyArr", content);
                break;
            case "contentOn":
                butLayEvent.butaddName("commentOnKeyArr", content);
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
                butLayEvent.butaddAllName("userUIDArr", content);
                break;
            case "bName":
                butLayEvent.butaddAllName("userWhiteUIDArr", content);
                break;
            case "title":
                butLayEvent.butaddAllName("titleKeyArr", content);
                break;
            case "contentOn":
                butLayEvent.butaddAllName("commentOnKeyArr", content);
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
                butLayEvent.butDelName("userUIDArr", content);
                break;
            case "bName":
                butLayEvent.butDelName("userWhiteUIDArr", content);
                break;
            case "title":
                butLayEvent.butDelName("titleKeyArr", content);
                break;
            case "contentOn":
                butLayEvent.butDelName("commentOnKeyArr", content);
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
            case "contentOn":
                butLayEvent.butDelAllName("commentOnKeyArr");
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
                butLayEvent.butSetKey("userUIDArr", oldContent, newContent);
                break;
            case "bName":
                butLayEvent.butSetKey("userWhiteUIDArr", oldContent, newContent);
                break;
            case "title":
                butLayEvent.butSetKey("titleKeyArr", oldContent, newContent);
                break;
            case "contentOn":
                butLayEvent.butSetKey("commentOnKeyArr", oldContent, newContent);
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
                butLayEvent.butFindKey("userUIDArr", content);
                break;
            case "bName":
                butLayEvent.butFindKey("userWhiteUIDArr", content);
                break;
            case "title":
                butLayEvent.butFindKey("titleKeyArr", content);
                break;
            case "contentOn":
                butLayEvent.butFindKey("commentOnKeyArr", content);
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
        fileDownload(util.getUrleToStringFormat(), "规则.json");
    });


    $("#outRuleCopy").click(function () {//导出到剪切板
        util.copyToClip(util.getUrleToStringFormat());
    })


//打印当前页面规则信息
    $("#butPrintAllInfo").click(() => {
        util.print(util.getUrleToStringFormat());
    })



    //导入规则按钮事件
    $("#inputFIleRule").click(function () {
        const content = $("#ruleEditorInput").val();
        if (content === "" || content === " ") {
            util.print("请填写正确的规则样式！");
            return;
        }
        const b = confirm("需要注意的是，这一步操作会覆盖你先前的规则！您确定要导入吗？");
        if (!b) {
            return;
        }
        let jsonRule = [];
        try {
            jsonRule = JSON.parse(content);
        } catch (error) {
            util.print("内容格式错误！" + error)
            return;
        }
        let list = jsonRule["用户名黑名单模式(精确匹配)"];
        if (!(list === null || list.length === 0)) {
            util.setData("userNameArr", list);
        }
        list = jsonRule["用户名黑名单模式(模糊匹配)"];
        if (!(list === null || list.length === 0)) {
            util.setData("userNameKeyArr", list);
        }
        list = jsonRule["用户uid黑名单模式(精确匹配)"];
        if (!(list === null || list.length === 0)) {
            util.setData("userUIDArr", list);
        }
        list = jsonRule["用户uid白名单模式(精确匹配)"];
        if (!(list === null || list.length === 0)) {
            util.setData("userWhiteUIDArr", list);
        }
        list = jsonRule["标题黑名单模式(模糊匹配)"];
        if (!(list === null || list.length === 0)) {
            util.setData("titleKeyArr", list);
        }
        list = jsonRule["评论关键词黑名单模式(模糊匹配)"];
        if (!(list === null || list.length === 0)) {
            util.setData("commentOnKeyArr", list);
        }
        list = jsonRule["粉丝牌黑名单模式(精确匹配)"];
        if (!(list === null || list.length === 0)) {
            util.setData("fanCardArr", list);
        }
        list = jsonRule["专栏关键词内容黑名单模式(模糊匹配)"];
        if (!(list === null || list.length === 0)) {
            util.setData("contentColumnKeyArr", list);
        }
        util.print("已导入");
    })


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


//监听网络变化
    const observer = new PerformanceObserver(perf_observer);
    observer.observe({entryTypes: ['resource']});

    ruleList(href)//正常加载网页时执行

    setInterval(function () {//每秒监听网页中的url
        const tempUrl = util.getWindowUrl();
        if (href === tempUrl) {//没有变化就结束本轮
            return;
        }//有变化就执行对应事件
        console.log("页面url发生变化了，原=" + href + " 现=" + tempUrl);
        href = tempUrl;//更新url
        ruleList(href);//网页url发生变化时执行
    }, 1000);

    if (href.includes("bilibili.com")) {
        bilibili(href);
    }
})
();

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
                if (videoData.autoPlay === false) {
                    videoElement.pause();
                    util.print("已自动暂定视频播放");
                }
                const playbackSpeed = videoData.playbackSpeed;
                if (playbackSpeed !== 0) {
                    //播放视频速度
                    videoElement.playbackRate = playbackSpeed;
                    util.print("已设置播放器的速度=" + playbackSpeed);
                }
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
            $("#nameSuspensionDiv").text(element.text.trim());
            $("#uidSuspensionDiv").text(adHref.substring(adHref.lastIndexOf("/") + 1));
            util.updateLocation(e);
            $("#suspensionDiv").css("display", "inline-block");
        };

        //click_playerCtrlWhid();
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
    }

    if (href.includes("www.bilibili.com/v/topic/detail/?topic_id=")) {//话题
        subjectOfATalk.deltopIC();
    }
    if (href === "https://www.bilibili.com/") { //首页
        home.startShieldLeftPic();
        home.stypeBody();
        if (paletteButtionBool) {
            setTimeout(() => {
                document.getElementsByClassName("palette-button-wrap")[0].style.display = "none";
            }, 2000);
        }
        document.querySelector("#i_cecream > div.bili-feed4 > div.bili-header.large-header > div.bili-header__banner").remove()//删除首页顶部的图片位置的布局
        document.getElementsByClassName("left-entry")[0].style.visibility = "hidden"//删除首页左上角的导航栏，并继续占位
        const interval = setInterval(() => {
            try {
                document.getElementsByClassName("banner-link")[0].remove();//删除首页顶部图片的跳转链接
                clearInterval(interval)
            } catch (e) {
            }
        }, 2000);
        home.startShieldMainAFloorSingle();
        home.startShieldVideoTop();
    }
    if (href.includes("www.bilibili.com/v/popular")) {//热门
        greatDemand.delVideo();
        try {
            document.getElementsByClassName("international-footer")[0].remove();
        } catch (e) {
            console.log("屏蔽热门底部元素出错！" + e);
        }
    }
    if (href.includes("t.bilibili.com/?spm_id_from=")) {//动态的首页
        trends.topCssDisply.body();
        trends.topCssDisply.topTar();
        trends.topCssDisply.rightLayout();
    }
    if (href.includes("www.bilibili.com/v/kichiku/")) {
        util.circulateID("biliMainFooter", 2000, "已移除底部信息");
        util.circulateClassName("primary-btn feedback visible", 2000, "已移除右侧悬浮按钮");
        util.circulateClassNames("eva-banner", 0, 10, 1500, "已移除界面中的横幅广告");
        util.circulateClassNames("eva-banner", 1, 10, 1500, "已移除界面中的横幅广告");
        util.circulateClassNames("eva-banner", 2, 10, 1500, "已移除界面中的横幅广告");
    }
}

/**
 精简处理的地方有：
 搜索页面右侧悬浮按钮（貌似是新版的，没留意）
 搜索页面底部信息
 视频播放界面右侧个别悬浮按钮
 */
/*****
 获取用户所有关注的思路：
 不确定js有没有相关可以发起请求的库，以java的为例，请求带上cookie，和referer，
 且用该api发起请求
 https://api.bilibili.com/x/relation/followings?vmid=UID号&pn=页数，从1开始&ps=20&order=desc&order_type=attention&jsonp=jsonp&callback=__jp5
 其中referer值=https://space.bilibili.com/用户UID/fans/follow
 正常情况就可以得到内容了，根据总的关注数量，除以20，且除余就得出需要循环获取多少次了页数

 这里写一下，避免下次还得用搜索引擎查找，目前已知match的网址规则可以这样填写，就匹配到了    *://message.bilibili.com/*

 */