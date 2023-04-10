// ==UserScript==
// @name         b站屏蔽增强器
// @namespace    http://tampermonkey.net/
// @license      MIT
// @version      1.1.34
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
// @require      https://greasyfork.org/scripts/462234-message/code/Message.js?version=1170653
// @icon         https://static.hdslb.com/images/favicon.ico
// @connect      bilibili.com
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
        const pushTypeSelect = $("#pushTypeSelect");
        const videoZoneSelect = $("#video_zoneSelect");
        const pushType = home.getPushType();
        pushTypeSelect.val(pushType);
        if (pushType === "分区") {
            loadPartition();
            videoZoneSelect.val(localData.getVideo_zone());
        } else if (pushType === "频道") {
            const tempSortTypeSelect = $("#sort_typeSelect");
            const tempSortType = frequencyChannel.getSort_type();
            loadChannel();
            videoZoneSelect.val(frequencyChannel.getChannel_id());
            tempSortTypeSelect.val(tempSortType);
            tempSortTypeSelect.css("display", "inline")
        } else {
            Qmsg.error("初始化时出现了不该出现的结果");
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
    data: {
        //分区rid对应的类型
        video_zoneList: JSON.parse(`{"1":"动画(主分区)","3":"音乐(主分区)","4":"游戏(主分区)","5":"娱乐(主分区)","11":"电视剧(主分区)","13":"番剧(主分区)","17":"单机游戏","19":"Mugen","20":"宅舞","21":"日常","22":"鬼畜调教","23":"电影(主分区)","24":"MAD·AMV","25":"MMD·3D","26":"音MAD","27":"综合","28":"原创音乐","29":"音乐现场","30":"VOCALOID·UTAU","31":"翻唱","32":"完结动画","33":"连载动画","36":"知识(主分区)","37":"人文·历史","47":"短片·手书·配音","51":"资讯","59":"演奏","65":"网络游戏","71":"综艺","75":"动物综合","76":"美食制作( 原[生活]->[美食圈] )","83":"其他国家","85":"小剧场","86":"特摄","95":"数码( 原手机平板 )","119":"鬼畜(主分区)","121":"GMV","122":"野生技术协会","124":"社科·法律·心理( 原社科人文、原趣味科普人文 )","126":"人力VOCALOID","127":"教程演示","129":"舞蹈(主分区)","130":"音乐综合","136":"音游","137":"明星综合","138":"搞笑","145":"欧美电影","146":"日本电影","147":"华语电影","152":"官方延伸","153":"国产动画","154":"舞蹈综合","155":"时尚(主分区)","156":"舞蹈教程","157":"美妆护肤","158":"穿搭","159":"时尚潮流","160":"生活(主分区)","161":"手工","162":"绘画","164":"健身","167":"国创(主分区)","168":"国产原创相关","169":"布袋戏","170":"资讯","171":"电子竞技","172":"手机游戏","173":"桌游棋牌","176":"汽车生活","177":"纪录片(主分区)","178":"科学·探索·自然","179":"军事","180":"社会·美食·旅行","181":"影视(主分区)","182":"影视杂谈","183":"影视剪辑","184":"预告·资讯","185":"国产剧","187":"海外剧","188":"科技(主分区)","193":"MV","195":"动态漫·广播剧","198":"街舞","199":"明星舞蹈","200":"中国舞","201":"科学科普","202":"资讯(主分区)","203":"热点","204":"环球","205":"社会","206":"综合","207":"财经商业","208":"校园学习","209":"职业职场","210":"手办·模玩","211":"美食(主分区)","212":"美食侦探","213":"美食测评","214":"田园美食","215":"美食记录","216":"鬼畜剧场","217":"动物圈(主分区)","218":"喵星人","219":"汪星人","220":"大熊猫","221":"野生动物","222":"爬宠","223":"汽车(主分区)","227":"购车攻略","228":"人文历史","229":"设计·创意","230":"软件应用","231":"计算机技术","232":"科工机械 ( 原工业·工程·机械 )","233":"极客DIY","234":"运动(主分区)","235":"篮球","236":"竞技体育","237":"运动文化","238":"运动综合","239":"家居房产","240":"摩托车","241":"娱乐杂谈","242":"粉丝创作","243":"乐评盘点","244":"音乐教学","245":"赛车","246":"改装玩车","247":"新能源车","248":"房车","249":"足球","250":"出行","251":"三农","252":"仿妆cos","253":"动漫杂谈"}`)
    },
    /**
     *
     * @return {string}
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
                Print.ln("样式修改失败")
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
                        Qmsg.info("清理异常元素");
                        // console.log("获取元素中，获取失败，下一行是该值的html");
                        // console.log(v)
                        continue;
                    }
                    let id = upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1);
                    if (isNaN(id)) {
                        v.remove();
                        Qmsg.info("清理非正常视频样式");
                        // Print.ln("检测到不是正常视频样式，故删除该元素");
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
                    if (shieldVideo_userName_uid_title(v, upName, id, title, null, videoTime, playbackVolume)) {
                        Qmsg.info("屏蔽视频！");
                    }
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
                if (content.search(str) === -1) {
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
                Qmsg.info("屏蔽了言论！！");
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
                    Qmsg.info("屏蔽了言论！！");
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


const HttpUtil = {
    httpRequest: function (method, url, headers, resolve, reject) {
        util.httpRequest({
            method: method,
            url: url,
            headers: headers,
            onload: resolve,
            onerror: reject
        });
    },
    /**
     *封装get请求
     * @param {string}url 请求URL
     * @param {function}resolve 相应成功
     * @param {function}reject 相应失败
     */
    get: function (url, resolve, reject) {
        this.httpRequest("get", url, {
            "User-Agent": navigator.userAgent,
        }, resolve, reject);
    },
    /**
     *携带cookioie发起get请求
     * @param url
     * @param {string}cookie
     * @param resolve
     * @param reject
     */
    getCookie: function (url, cookie, resolve, reject) {
        this.httpRequest("get",url,{
            "User-Agent": navigator.userAgent,
            "cookie": cookie
        },resolve, reject);
    }
}


const htmlStr = {
    /**
     *返回用户卡片基础信息面板布局
     * @param uid{number} uid
     * @param userName{string} 用户名
     * @param level 用户等级
     * @param sign{string} 签名
     * @param image{string} 头像
     * @param gz{string} 关注量
     * @param fs{string}  粉丝数量
     * @param hz {string} 获赞
     * @return {string}
     */
    getUserCard: function (uid, userName, level, sign, image, gz, fs, hz) {
        return ` <div id="popDiv" style=" border-radius: 8px; display: none;background-color: rgb(152, 152, 152);z-index: 11;width: 374px; height: 35%; position: fixed; 
left: 0;  bottom: 0;">
      <img src="http://i0.hdslb.com/bfs/space/768cc4fd97618cf589d23c2711a1d1a729f42235.png@750w_240h.webp"/>
      <img src="${image}@96w_96h.webp" alt="头像" style="width: 48px; height: 48px; border-radius: 50%" />
      <div class="info">
      <p class="user"><a class="name" style=" color: rgb(251, 114, 153); --darkreader-inline-color: #fb6b94;" href="//space.bilibili.com/${uid}" target="_blank"data-darkreader-inline-color="">${userName}</a>
          <a href="//www.bilibili.com/html/help.html#k_${level}" target="_blank">
          <img class="level"src="//s1.hdslb.com/bfs/seed/jinkela/commentpc/static/img/ic_user level_6.64b9440.svg"/>
          </a>
        </p>
        <p class="social">
         <span>${gz}</span><span>关注</span>
            <span>${fs}</span><span class="gray-text"> 粉丝</span>
          <span>${hz}</span><span class="gray-text"> 获赞</span>
        </p>
        <p class="verify"></p>
        <p class="sign">${sign}</p>
      </div>
      <button style="position: absolute;top: 0;right: 0;" onclick="document.querySelector('#popDiv').remove()">关闭</button>
    </div>`;
    }

}


const Print = {
    ln: function (content) {
        util.printElement("#outputInfo", `<dd>${content}</dd>`);
    },
    video: function (color, content, name, uid, title, videoHref) {
        util.printElement("#outputInfo", `
        <dd><b
            style="color: ${color}; ">${util.toTimeString()}${content}屏蔽用户【${name}】uid=<a href="https://space.bilibili.com/${uid}" target="_blank">【${uid}】</a>标题【<a href="${videoHref}" target="_blank">${title}</a>】</b>
        </dd>`);
    }, commentOn: function (color, content, name, uid, primaryContent) {
        util.printElement("#outputInfo", `
        <dd>
        <b  style="color: ${color}; ">${util.toTimeString()}${content} 屏蔽用户【${name}】uid=<a href="https://space.bilibili.com/${uid}" target="_blank">【${uid}】</a>
   原言论=【${primaryContent}】</b>
</dd>`);
    }
};


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
     * 获取当前网页cookie
     * @return {string}
     */
    getCookie: function () {
        return document.cookie;
    },
    /**
     * 获取当前网页cookie，已键值对形式对象返回
     * @return {{}}
     */
    getCookieList: function () {
        const arrCookie = {};
        const cookie = this.getCookie();
        if (cookie === "") {
            return arrCookie;
        }
        if (!cookie.includes(";")) {
            return arrCookie;
        }
        const split = cookieStr.split(";");
        for (const v of split) {
            const tempV = v.split("=");
            arrCookie[tempV[0]] = tempV[1];
        }
        return arrCookie;

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
                Print.ln(tip);
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
                Print.ln(tip);
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

        dragId.style.position = "fixed";
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
                Print.ln(tip);
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
                Print.ln(tip);
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
        Qmsg.success(`添加${ruleStrName}的值成功=${key}`);
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
            Print.ln("内容长度无变化，可能是已经有了的值")
            return;
        }
        util.setData(ruleStrName, Array.from(setList));
        Print.ln("已添加该值=" + key)
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
            Print.ln("未有该元素！")
            return false;
        }
        arr.splice(index, 1);
        util.setData(ruleStrName, arr);
        Print.ln("已经删除该元素=" + key);
        rule.ruleLength();
        return true;
    }

}

const butLayEvent = {
    butaddName: function (ruleStr, contentV) {
        if (contentV === '') {
            Print.ln("请输入正确的内容")
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
            Print.ln("当前已有该值！");
            return;
        }
        urleCrud.add(arrayList, contentV, ruleStr);
    },
    butaddAllName: function (ruleStr, contentV) {
        if (contentV === '') {
            Print.ln("请输入正确的内容")
            return;
        }
        let tempList;
        try {
            tempList = JSON.parse(contentV);
        } catch (error) {
            Qmsg.error("内容不正确！内容需要数组或者json格式！错误信息=" + error);
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
            Print.ln("请输入正确的内容")
            return false;
        }
        let arrayList = util.getData(ruleStr);
        if (arrayList === null || arrayList === undefined) {
            Print.ln("没有内容哟")
            return false;
        }
        if (!arrayList.includes(contentV)) {
            Print.ln("没有该内容哟=" + contentV)
            return false;
        }
        return urleCrud.del(arrayList, contentV, ruleStr);
    },
    butDelAllName: function (ruleStr) {
        const list = util.getData(ruleStr);
        if (list === null || list === undefined) {
            Print.ln("没有内容哟")
            return;
        }
        const b = confirm("您确定要全部删除吗？");
        if (!b) {
            return;
        }
        util.delData(ruleStr);
        Print.ln("已全部清除=" + ruleStr);
        rule.ruleLength();
    },
    //查询
    butFindKey: function (ruleStr, contentV) {
        if (contentV === '') {
            Print.ln("请输入正确的内容")
            return;
        }
        let arrayList = util.getData(ruleStr);
        if (arrayList === null || arrayList === undefined) {
            Print.ln("找不到该内容！");
            return;
        }
        if (arrayList.includes(contentV)) {
            Print.ln("搜索的值，已存在！");
            return;
        }
        Print.ln("找不到该内容！");
    },

    //修改
    butSetKey: function (ruleStr, oldKey, newKey) {
        if (oldKey === '' || oldKey.includes(" ") || newKey === "" || newKey.includes(" ")) {
            return;
        }
        if (oldKey === newKey) {
            Print.ln("请输入正确的内容，两者内容不能相同")
            return;
        }
        let arrayList = util.getData(ruleStr);
        if (arrayList === null || arrayList === undefined) {
            Print.ln("找不到该内容！");
            return;
        }
        if (!arrayList.includes(oldKey)) {
            Print.ln("找不到该内容！，无法替换！");
            return;
        }
        const index = arrayList.indexOf(oldKey);
        if (index === -1) {
            Print.ln("未有该元素！")
            return;
        }
        arrayList.splice(index, 1, newKey);
        util.setData(ruleStr, arrayList);
        Qmsg.success("替换成功！旧元素=" + oldKey + " 新元素=" + newKey);
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
        Print.commentOn("#00BFFF", `已通过言论关键词了【${key}】`, name, uid, content);
        return true;
    }
    const isUid = remove.uid(element, uid);
    if (isUid) {
        Print.commentOn("#yellow", `已通过UID屏蔽`, name, uid, content);
        return true;
    }
    const isName = remove.name(element, name);
    if (isName) {
        Print.commentOn(null, `已通过指定用户名【${isName}】`, name, uid, content);
        return true;
    }
    const isNameKey = remove.nameKey(element, name);
    if (isNameKey != null) {
        Print.commentOn(null, `已通过指定用户名模糊规则【${isNameKey}】`, name, uid, content);
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
    if (uid !== null) {
        const isUid = remove.uid(element, uid);
        if (isUid) {
            Print.video("yellow", "已通过UID屏蔽", name, uid, title, videoHref);
            return true;
        }
    }
    const isName = remove.name(element, name);
    if (isName) {
        Print.video(null, "已通过用户名屏蔽", name, uid, title, videoHref);
        return true;
    }
    const isNameKey = remove.nameKey(element, name);
    if (isNameKey != null) {
        Print.video(null, `已通过用户名模糊屏蔽规则=【${isNameKey}】`, name, uid, title, videoHref)
        return true;
    }
    const videoTitle = remove.titleKey(element, title);
    if (videoTitle != null) {
        Print.video("#66CCCC", `已通过标题模糊屏蔽规则=【${videoTitle}】`, name, uid, title, videoHref);
        return true;
    }
    const titleKeyCanonical = remove.titleKeyCanonical(element, title);
    if (titleKeyCanonical != null) {
        Print.video("#66CCCC", `已通过标题正则表达式屏蔽规则=${titleKeyCanonical}`, name, uid, title, videoHref);
        return true;
    }
    if (videoPlaybackVolume !== null) {
        const change = util.changeFormat(videoPlaybackVolume);
        if (remove.videoMinPlaybackVolume(element, change)) {
            Print.video(null, `已过滤视频播放量小于=【${rule.videoData.broadcastMin}】的视频`, name, uid, title, videoHref);
            return true;
        }
        if (remove.videoMaxPlaybackVolume(element, change)) {
            Print.video(null, `已过滤视频播放量大于=【${rule.videoData.broadcastMax}】的视频`, name, uid, title, videoHref);
            return true;
        }
    }
    if (videoTime === null) {
        return false;
    }
    const timeTotalSeconds = util.getTimeTotalSeconds(videoTime);
    if (remove.videoMinFilterS(element, timeTotalSeconds)) {
        Print.video(null, `已通过视频时长过滤时长小于=【${rule.videoData.filterSMin}】秒的视频`, name, uid, title, videoHref);
        return true;
    }
    if (remove.videoMaxFilterS(element, timeTotalSeconds)) {
        Print.video(null, `已过滤时长大于=【${rule.videoData.filterSMax}】秒的视频`, name, uid, title, videoHref);
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
            if (startPrintShieldNameOrUIDOrContent(v, name, uid, content)) {
                Qmsg.info("屏蔽了言论！！");
            }
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
            if (startPrintShieldNameOrUIDOrContent(v, userName, uid, content)) {
                Qmsg.info("屏蔽了言论！！");
            }
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
                    Print.ln("用户点击了右侧的展开")
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
            if (shieldVideo_userName_uid_title(e, name, id, videoTitle, null, null, null)) {
                Qmsg.info("屏蔽了视频！！");
            }
        }
    }
    ,
//点击播放器的宽屏按钮
    click_playerCtrlWhid: function () {
        const interval = setInterval(() => {
            try {
                document.getElementsByClassName("bpx-player-ctrl-btn bpx-player-ctrl-wide")[0].click()
                Print.ln("已自动点击播放器的宽屏")
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
        //需要给出个初始值，之后可以迭代生成，如果为空字符串则为从顶部内容获取
        offsetData: {
            //k是频道id，v是当时加载的坐标
        },
        channel_idList: JSON.parse(`{"32154017":"铃芽之旅","28612663":"绝望主夫","26649160":"OPPO Reno系列","26598150":"万里归途","26493662":"红发歌姬","25712509":"分手的决心","24991047":"穿靴子的猫2","24837361":"尘白禁区","24797875":"吴海嫄","24709355":"保你平安","24622360":"张圭珍","24234843":"瞬息全宇宙","24142652":"荣耀Magic4","24011272":"华硕天选3","23903809":"隐入尘烟","23784795":"哥，你好","23472254":"OPPO Find X5","23128970":"OPPOFindN","23111206":"坏蛋联盟","23069590":"长空之王","23012765":"惠普暗影精灵8","22692325":"特级英雄黄继光","22405153":"舞千年","22360063":"宇宙探索编辑部","21910538":"OPPO Reno8","21813182":"重启之深渊疑冢","21744669":"崩坏：星穹铁道","21716895":"NMIXX","21532737":"SULLYOON","21296875":"一加9RT","21035961":"JINNI","20994127":"iPad Air 5","20834278":"IXFORM","20539337":"惠普暗影精灵7","20473564":"华为MatePad11","20321738":"这个杀手不太冷静","20307965":"红米K50","20223881":"突如其来的假期","19943077":"红米note系列","19745832":"90婚介所","19730584":"ROG幻16","19497246":"INTO1","19435281":"荣耀50","19364474":"海的尽头是草原","19355660":"我的音乐你听吗","19343572":"三星S22","19314402":"iPhone 13 Pro Max","19273662":"小米平板5Pro","19260443":"黑白魔女库伊拉","19191975":"联想R9000P","19173782":"边缘行者","18980818":"真我GT Neo","18881813":"我和我的父辈","18800082":"戴尔G15","18781771":"OPPO Find系列","18713957":"夏日友晴天","18702977":"新神榜杨戬","18637623":"段星星","18461688":"iQOONeo5","18385266":"孙滢皓","18291899":"iPad Pro 2021","18131330":"华硕天选2","18096401":"蛋仔派对","18063440":"尹浩宇","18038215":"拜年纪","17742752":"少女前线：云图计划","17703835":"魔法满屋","17701752":"赞多","17681251":"世间有她","17532495":"乃琳Queen","17532493":"向晚大魔王","17532492":"珈乐Carol","17532491":"贝拉kira","17532487":"嘉然今天吃什么","17495108":"爱很美味","17326659":"丁真","17309798":"RTX3050","17291794":"时光代理人","17118359":"aespa","16920302":"到了30岁还是处男，似乎会变成魔法师","16915022":"尼康Z9","16815381":"雄狮少年","16760361":"恐鬼症","16569298":"刘彰","16565023":"萨勒芬妮","16517835":"全员恶玉","16371649":"女王的棋局","16286545":"黎明觉醒:生机","16230013":"黑神话悟空","16215530":"花束般的恋爱","16206465":"松下S5","16051534":"金刚川","16048272":"外太空的莫扎特","15864005":"歪嘴战神","15843383":"凡尔赛文学","15775524":"必剪创作","15545355":"硬糖少女303","15485817":"超猎都市","15396883":"尼康Z5","15303231":"红米K40","14971139":"THE9","14930011":"iPhone 13 Pro","14889376":"张嘉元","14763345":"华为P50","14684850":"Helltaker","14644759":"糖豆人","14586712":"佳能R6","14478476":"刺客信条：英灵殿","14447810":"小米12","14377864":"说唱新世代","14350779":"唇泥","14206339":"三国志幻想大陆","14137182":"大威天龙","14006162":"黑人抬棺","13899485":"黄绿合战5th-绿队应援","13898921":"淡黄的长裙，蓬松的头发","13882551":"黄绿合战5th-黄队应援","13771460":"华硕天选","13650742":"心灵奇旅","13565555":"郑乃馨","13497041":"VALORANT","13374029":"网抑云","13256029":"罗一舟","13227355":"小米平板5","13128843":"富士XT4","12966836":"新型冠状病毒肺炎","12908731":"小麻薯","12900282":"诸葛大力","12839538":"ROG幻14","12798880":"松下GH6","12779915":"风犬少年的天空","12769132":"B站跨年晚会","12620189":"异度侵入","12615391":"国王排名","12614370":"永劫无间","12494013":"白神遥Haruka","12364750":"LPL全明星","12361985":"独行月球","12291142":"荣耀Magic系列","12247979":"港诡实录","12244365":"禁止套娃","12238584":"哈利波特魔法觉醒","12193316":"我和你荡秋千","12101103":"绯赤艾莉欧","12095773":"危机合约","12075986":"明月照我心","12058043":"不止不休","12050439":"时代少年团","11956030":"钢铁洪流进行曲","11932853":"高卿尘","11874831":"大田后生仔","11847238":"动物狂想曲","11844018":"红晓音Akane","11817907":"三国志·战略版","11782259":"健身环大冒险","11744330":"DRX","11545680":"窝窝头一块钱四个","11485295":"周柯宇","11364186":"剑与远征","11312447":"动感视频","11302041":"妄想破绽","11264602":"乔碧萝","11154180":"野狼disco","10959020":"韩美娟","10876266":"云顶之弈","10866186":"BANG DREAM","10795681":"R1SE","10792874":"联想Y7000P","10776794":"重生细胞","10703999":"漫威超级战争","10693945":"绿豆传","10665758":"雨女无瓜","10661492":"解神者","10654559":"鲨鱼夹","10639865":"阴阳师妖怪屋","10615728":"人类迷惑行为","10558065":"艾因Eine","10462022":"美食纪","10404390":"德鲁纳酒店","10341766":"部落与弯刀","10294120":"和平精英","10258098":"UNINE","10206956":"赵让","10168179":"悬崖之上","10137307":"华为P40","10074413":"AB6IX","10026108":"Phigros","9997553":"iPhone13","9990565":"神楽七奈","9972781":"Among Us","9964268":"我们离婚了","9963814":"iPhone 12","9962627":"有娜","9957165":"彩领","9955064":"双生视界","9942751":"坎公骑冠剑","9926699":"宝可梦剑盾","9881291":"阴阳师：百闻牌","9799759":"马里奥制造2","9751395":"正念冥想","9741441":"流浪地球2","9734740":"APEX英雄","9681631":"李佳琦","9677800":"轮到你了","9601977":"助眠音乐","9572398":"哪吒之魔童降世","9229031":"自走棋","9226744":"刀塔自走棋","9183946":"人潮汹涌","9175940":"威神V","9175551":"疾速追杀4","9167687":"犬山玉姬","9139179":"李彩演","9119431":"影音设备","9086461":"隐形守护者","9061851":"龙族幻想","9057499":"金采源","9045711":"阿梓从小就很可爱","9034851":"乐评盘点","9010971":"元龙","9003961":"姚昱辰","9002442":"李振宁","8980226":"穿戴甲","8975578":"天外世界","8967933":"因为太怕痛就全点防御力了","8890222":"巴斯克蛋糕","8877740":"一条小团团","8861115":"奥比岛手游","8775876":"谢可寅","8751822":"hololive","8731911":"蔡程昱","8717390":"高天鹤","8703278":"余宇涵","8646504":"机动战姬：聚变","8623556":"五等分的新娘","8607584":"崔叡娜","8593145":"荣耀手表","8583026":"天使降临到我身边","8517908":"K/DA","8509591":"毒液2","8505910":"礼志","8491410":"神探大战","8486440":"黑袍纠察队","8477796":"朱志鑫","8404892":"包桑","8402119":"战斗吧歌姬","8359677":"白蛇缘起","8314661":"刘扬扬","8249031":"DWG","8228054":"湊あくあ","8227542":"蚁人3","8203176":"索尼A7M4","8190619":"童禹坤","8187638":"陈天润","8186374":"张极","8164028":"mur猫","8129516":"建厚","8122256":"苏新皓","8122205":"穆祉丞","8069134":"2019拜年祭","8010631":"魅族18","7990197":"对王之王","7984793":"妻子的味道","7945544":"原神","7936717":"唐九洲","7917965":"炎炎消防队","7897308":"大王不高兴","7873955":"我的起源","7850505":"任敏","7784727":"肖宇梁","7761795":"本间向日葵","7751160":"黄冠亨","7744030":"肖俊","7740510":"鬼畜剧场","7709426":"苹果MacBook","7703005":"假面骑士时王","7700690":"战双帕弥什","7699988":"搞笑挑战","7662506":"曺柔理","7660345":"赵小棠","7646054":"金子涵","7619886":"宿伞之魂","7614030":"太吾绘卷","7589109":"翟潇闻","7562902":"神楽めあ","7556105":"沙雕新闻","7549675":"许愿神龙","7528653":"火箭少女101","7520997":"潘大帅","7515820":"沙雕动画","7497510":"金珉周","7475190":"刘宇宁","7473181":"MUSEDASH","7458282":"公主连结","7452435":"乐言","7445930":"假面骑士zio","7439509":"雷神4","7433905":"赤井心","7433507":"雀魂","7424663":"仁王2","7417100":"只狼","7416210":"对马岛之魂","7416144":"留真","7414788":"夏色祭","7407694":"忍者必须死3","7401538":"人生大事","7360534":"CFHD","7355391":"白上吹雪","7335684":"韩商言","7322971":"姜惠元","7315974":"NBA2K19","7308895":"徐穗珍","7295336":"元歌","7268790":"宋继扬","7241942":"张元英","7235148":"李彩燕","7144106":"宋制汉服","7133808":"GIAO哥","7131448":"小可学妹","7116756":"沙雕广告","7076806":"水果吃法","7076332":"范闲","7054552":"云视听小电视","7040396":"好莱坞往事","7011428":"总之就是非常可爱","6976876":"奈布","6973898":"使命召唤手游","6969906":"罗布奥特曼","6955654":"王牌战士","6947904":"叶舒华","6945542":"(G)I-DLE","6865534":"约战：精灵再临","6855974":"侏罗纪世界3","6844730":"段奥娟","6826050":"NINEPERCENT","6815716":"起泡胶","6778342":"闪耀暖暖","6775630":"猫宫日向","6773882":"一起来捉妖","6627240":"周诗雨","6624022":"有线耳机","6622258":"沙雕图","6621182":"少年的你","6617838":"SKY光遇","6579446":"傅菁","6572048":"租借女友","6530230":"特鲁索娃","6512894":"火影忍者秋风","6497596":"咒术回战","6471826":"赵美延","6465118":"乃万","6438848":"宋雨琦","6400036":"面筋哥","6396980":"扬名立万","6385102":"狂野飙车9","6377252":"佳能M50","6372852":"改革春风吹满地","6344342":"拆盲盒","6344192":"节奏光剑","6340008":"丁禹兮","6339084":"5G手机","6243646":"哥斯拉大战金刚","6205506":"安宥真","6159224":"小众香水","6140096":"非自然死亡","6100642":"姚琛","6090816":"施柏宇","6054582":"冬泳怪鸽","6046582":"柠檬鸡爪","6029204":"pr转场","6017226":"言冰云","6012204":"明星舞蹈","5994176":"乐华七子","5946444":"王琳凯","5903376":"木子洋","5858250":"虎皮鸡爪","5844584":"全面战争：三国","5831238":"Cytus II","5826120":"Rich Brian","5822794":"陈立农","5817842":"林彦俊","5817586":"王怡人","5809396":"四小天盒","5790520":"椰子鸡汤","5788774":"林雨申","5776586":"权恩菲","5727642":"校园vlog","5685176":"中国机长","5681110":"动物森友会","5674016":"时乃空","5673848":"毕雯珺","5648988":"邓佳鑫","5638580":"丁泽仁","5626748":"黄新淳","5617802":"他人即地狱","5513956":"律化娜","5502986":"灵魂能力6","5500126":"FGO街机","5498808":"呆妹儿小霸王","5478148":"杀戮尖塔","5476512":"范丞丞","5418114":"裤子推荐","5417240":"PRODUCE48","5405434":"军运会","5398202":"王子异","5390284":"亿万僵尸","5388752":"无限法则","5368254":"李泽言","5327740":"失控玩家","5303604":"致我们暖暖的小时光","5268164":"和班尼特福迪一起攻克难关","5262544":"早稻叽","5147396":"豫章书院","5095854":"催眠麦克风","5080738":"伯远","5053314":"理科综合","5045872":"Queendom","5035590":"金昇玟","5035588":"梁精寅","5028520":"黄铉辰","5023002":"方灿","5022520":"徐彰彬","5021650":"智勋","5016258":"韩知城","5012736":"平凡英雄","4970994":"沙雕游戏","4922634":"张颜齐","4887644":"寄明月","4866254":"公孙离","4854888":"战斗天赋解析系统","4844668":"洪世贤","4820530":"重装战姬","4813036":"非人学园","4798332":"Stray Kids","4792148":"截断式眼妆","4790540":"鸡蛋做法","4785500":"王冰冰","4743152":"刘隽","4730180":"紫菜蛋花汤","4730016":"病名为爱","4727322":"决战平安京","4687696":"希林娜依高","4671660":"快速入睡","4668516":"八方旅人","4618594":"八佰","4610466":"明日方舟","4585786":"脆皮五花肉","4527048":"钢铁意志","4478110":"BOYSTORY","4434646":"灵笼","4429874":"虚拟UP主","4425434":"毒舌律师","4302942":"抖肩舞","4235094":"仝卓","4233904":"金在奂","4231380":"罗浮生","4200922":"医学专业","4200866":"百香果茶","4083902":"旭凤","4083900":"锦觅","4083898":"润玉","4054560":"头号玩家","4005150":"紫宁","3957654":"创造与魔法","3956954":"假面骑士BUILD","3955656":"显示器支架","3948192":"周棋洛","3948190":"许墨","3927278":"拖米","3926626":"人生一串","3896988":"黄旼炫","3873106":"恋与制作人","3853450":"朱星杰","3847232":"刘端端","3823788":"你要跳舞吗","3792166":"刘耀文","3789156":"惠普暗影精灵","3787668":"周震南","3774218":"回廊亭","3768654":"Havana","3740404":"WANNAONE","3737600":"异灵术","3733536":"阿冷","3724824":"毛不易","3722108":"邕圣祐","3691312":"王鹤棣","3687316":"仙某某","3683252":"荒野乱斗","3669046":"百里玄策","3658400":"怪物猎人世界","3653542":"胡一天","3623232":"华为P系列","3607931":"键盘轴","3605758":"4K显示器","3591145":"捷德奥特曼","3584781":"交换人生","3570562":"洗脸巾","3570424":"仙王的日常生活","3567139":"盾之勇者成名录","3566718":"蒜蓉小龙虾","3550779":"第五人格","3532062":"一梦江湖","3528773":"JDG","3521284":"桃源恋歌","3519626":"金廷祐","3519133":"汉服推荐","3509868":"农学","3503159":"宝石之国","3495562":"NBA2K18","3491296":"百里守约","3491241":"张泽禹","3485924":"爱情神话","3473118":"法考","3467981":"楚留香手游","3467541":"天才枪手","3466323":"李权哲","3463206":"致我们单纯的小美好","3462905":"少女歌剧","3462699":"图拉夫","3460928":"李旻浩","3457223":"永远的七日之都","3451649":"裴珍映","3451253":"朴志训","3443356":"陆柯燃","3442446":"姜丹尼尔","3441282":"阿轲","3438063":"QGhappy","3437846":"本特利","3433921":"朴佑镇","3426520":"左航","3420833":"敢达争锋对决","3418579":"尹智圣","3417915":"尤长靖","3414029":"徐正溪","3404908":"千层套路","3400804":"刘宇","3392467":"河成云","3376057":"黄旭熙","3373630":"复仇者联盟4","3365006":"达康书记","3349682":"何洛洛","3349680":"孙亦航","3349658":"易安音乐社","3346000":"命运2","3342542":"香蜜沉沉烬如霜","3335365":"Minnie","3327666":"鞋子推荐","3327368":"秦霄贤","3320110":"柳会胜","3310624":"7SENSES","3307585":"史诗战争模拟器","3303821":"寻梦环游记","3301050":"骆歆","3299496":"李大辉","3296688":"阴阳怪气","3294748":"朱正廷","3287269":"黄明昊","3287181":"赖冠霖","3267800":"深海迷航","3240712":"杨超越","3233847":"元气骑士","3232987":"A.I.Channel","3232159":"使命召唤14","3222257":"芒种","3213005":"唐制汉服","3206041":"明日战记","3196073":"华为平板","3192224":"末日铁拳","3185248":"Bin","3178287":"你的婚礼","3176401":"尚九熙","3173885":"林墨","3166607":"折叠屏手机","3149869":"李诞","3114739":"跳舞的线","3107685":"鬼灭之刃","3106811":"陈星旭","3103832":"约定的梦幻岛","3088294":"奥利给","3084968":"第一炉香","3082148":"杨芸晴","3053790":"Tian","3053588":"烤面筋","3049131":"金韶情","3047615":"迪玛希","3046801":"守岛人","3042908":"是，首相","3041514":"奶块","3038799":"兽娘动物园","3035050":"PRISTIN","3033823":"雾山五行","3032493":"刺客伍六七","3023780":"桌游棋牌","3019069":"炖排骨","3013173":"Letme","2999678":"大唐荣耀","2996689":"双镜","2995383":"22/7","2993242":"王慧侦","2990460":"惊雷","2988407":"梁世灿","2983903":"阿云嘎","2980540":"符华","2960639":"王奕","2957633":"JIWOO","2949428":"焰灵姬","2940555":"宿舍好物","2936731":"KARD","2936428":"大话西游游戏","2935179":"五条人","2922647":"面包做法","2915763":"中国式家长","2914344":"百妖谱","2908447":"碧蓝航线","2907234":"运动裤","2904309":"张新成","2901885":"最后生还者2","2894465":"周六野","2890529":"知否知否","2852414":"索尼Xperia系列","2841289":"游戏王：决斗链接","2840132":"李寿根","2823919":"苹果平板","2804942":"郑云龙","2803954":"赖美云","2803738":"文科综合","2801146":"孤存","2795142":"红烧猪蹄","2790530":"浓缩咖啡","2784499":"雷狮","2772390":"萧平旌","2765046":"陈钰琪","2758126":"吊带裙","2757061":"3dmax建模","2756323":"虞书欣","2746180":"Karsa","2744306":"梁靖康","2719650":"野钓","2718281":"the shy","2713856":"炫神","2700267":"食物语","2699874":"陈卓璇","2690426":"英雄联盟手游","2676001":"手办模玩","2674764":"李天泽","2672508":"袁一琦","2659029":"PPAP","2658411":"无线鼠标","2656362":"ONER","2647282":"陈飞宇","2644907":"KPL","2633912":"李子璇","2624426":"中国乒乓","2623729":"犬王","2622126":"脸红的思春期","2621800":"赵露思","2618715":"J.Fla","2612346":"Knight","2610734":"微胖穿搭","2609655":"李楷灿","2600739":"鱼的做法","2597902":"airpods","2588258":"半身裙","2582371":"卤面","2579034":"Krist","2579030":"Singto","2573761":"Felix","2569359":"MacBook Pro","2568232":"X玖少年团","2561575":"龚俊","2561468":"excel","2559972":"防晒衣","2556751":"小猪佩奇","2553825":"电视剧解说","2553696":"橘猫","2547812":"罗渽民","2547811":"朴志晟","2547810":"黄仁俊","2547809":"李帝努","2544632":"天官赐福","2538993":"Rookie","2538125":"shroud","2537364":"SF9","2533863":"李子柒","2532831":"N.Flying","2529888":"Doinb","2529416":"开学穿搭","2527991":"switch","2526877":"芒果冰","2525720":"NCT DREAM","2525559":"Beyonce","2520684":"freestyle","2517524":"ps教程","2515404":"查杰","2514240":"Taylor Swift","2513408":"iwanna","2513004":"procreate","2512541":"iPhone","2511718":"Ariana Grande","2511282":"vlog","2510920":"夏季穿搭","2510804":"孟美岐","2510690":"iKON","2502324":"汉服配饰","2502136":"sans","2498756":"Fate","2496782":"Red Velvet","2495417":"冰淇淋制作","2494311":"吴宣仪","2494280":"Duang","2492412":"Rihanna","2491596":"Korea相关","2489706":"YERI","2487027":"竹鼠","2486527":"lolita","2486427":"SHINee","2485620":"张九龄","2485583":"阿凡达2","2485137":"姜Gary","2484328":"Aimer","2483415":"Re：从零开始的异世界生活","2482768":"蒜香排骨","2482673":"NCT127","2482344":"JENNIE","2479909":"嘉德罗斯","2433660":"这么多年","2403573":"男生穿搭","2337661":"富士相机","2287121":"清蒸鱼","2271078":"包包推荐","2255402":"佳能相机","2214961":"华语现场","2210094":"战狼2","2190062":"MOMOLAND","2187258":"战舰联盟","2126326":"建军大业","2108450":"全面战争模拟器","2098656":"人类一败涂地","2073345":"客制化键盘","2012954":"沈巍","2012952":"赵云澜","1853276":"水果茶","1853158":"烤茄子","1851001":"朱广权","1805799":"PENTAGON","1802787":"排骨汤","1775550":"刘学义","1771846":"喻言","1768384":"高考政治","1767238":"一起同过窗","1765149":"刘些宁","1760362":"连淮伟","1759671":"夏日饮品","1756757":"李一桐","1755728":"冥想音乐","1751888":"侯明昊","1751795":"张铭恩","1749296":"BLACKPINK","1740982":"熊梓淇","1737239":"死亡搁浅","1734103":"人间世","1732829":"SofM","1731930":"看门狗2","1728359":"国风音乐","1727225":"茨木童子","1722232":"金路云","1718137":"余小C","1708821":"黄绿合战","1706779":"高考历史","1698817":"荷兰弟","1696501":"精灵宝可梦日月","1693136":"3DMAX教程","1690944":"战地1","1688874":"白灼虾","1685027":"齐木楠雄的灾难","1684958":"奥尔加","1684679":"一人之下","1682183":"黄恩妃","1681663":"金在德","1679326":"欧布奥特曼","1677610":"德丽莎","1677467":"漂发","1677308":"马冬梅","1674133":"金请夏","1673963":"全昭弥","1673845":"极乐净土","1671408":"蕾姆","1669303":"金光瑶","1669085":"内双眼妆","1669084":"单眼皮眼妆","1667658":"姜东昊","1666331":"舞法天女","1666216":"减脂餐","1665976":"粉霜","1664750":"吴谨言","1663773":"BEJ48","1663337":"还是觉得你最好","1662923":"小林家的龙女仆","1661887":"MLXG","1660794":"华硕ROG","1660558":"猫和老鼠手游","1658728":"姜昇润","1658727":"李昇勋","1657069":"王九龙","1656926":"周九良","1650732":"雄兵连","1650232":"小米手表","1647661":"钱锟","1646669":"文泰一","1646668":"郑在玹","1645475":"徐梦洁","1645154":"DIY染发","1643561":"GNZ48","1640990":"李泰容","1639589":"NCT U","1639194":"I.O.I","1637921":"江澄","1637397":"王者荣耀花木兰","1634877":"金宇硕","1631094":"全昭妍","1624519":"徐英浩","1623014":"游戏显示器","1621455":"具晙会","1621360":"孔雪儿","1621267":"刘雨昕","1621198":"魏无羡","1621194":"蓝忘机","1620256":"崩坏3","1619372":"薛洋","1615603":"晓星尘","1615209":"ROOMTOUR","1614795":"金世正","1614756":"耳饰","1612939":"雪娥","1605755":"恩熙","1604272":"刺客列传","1599602":"配饰","1597831":"宋旻浩","1597173":"李兰迪","1594382":"清洁面膜","1593182":"洁面","1590425":"马嘉祺","1589079":"李昇基","1588309":"星露谷物语","1583639":"便携显示器","1583317":"程潇","1581262":"孤岛惊魂5","1581005":"青云志","1579263":"三国志14","1577361":"王晰","1573317":"正道的光","1566710":"宋亚轩","1565324":"眼妆教程","1564714":"火鸡面","1564410":"唇釉","1562795":"高瀚宇","1562513":"格瑞","1558469":"男生发型","1557554":"上海迪士尼","1555709":"高考语文","1550817":"天鹅臂","1548279":"盗贼之海","1546934":"骨传导耳机","1546292":"李马克","1545392":"杨九郎","1545325":"何九华","1545256":"周洁琼","1544288":"董思成","1543807":"苞娜","1542724":"张真源","1542723":"严浩翔","1539089":"DC电影","1538830":"贝果","1538786":"滚动的天空","1534556":"气垫粉底","1527914":"紫罗兰永恒花园","1527593":"车银优","1527081":"蹦迪","1525327":"皇室战争","1523841":"邢菲","1523046":"高考地理","1521388":"无线键盘","1519748":"贺峻霖","1518432":"EXCEL教程","1518250":"NCT","1506015":"起床战争","1500251":"蒸汽波","1499499":"曾舜晞","1498706":"东北大鹌鹑","1497944":"彭昱畅","1489415":"植物大战僵尸1","1487092":"X特遣队","1486920":"宇宙少女","1483890":"逃离塔科夫","1483761":"动物派对","1482612":"孟鹤堂","1481907":"PRODUCE101","1478561":"高考英语","1477109":"男士香水","1472657":"金秦禹","1470872":"本田仁美","1469519":"探店","1469000":"神奇动物在哪里","1468896":"宋威龙","1468687":"段艺璇","1466243":"你的名字","1464743":"袁冰妍","1463475":"增肌","1462727":"包菜","1461066":"EVERGLOW","1456591":"SING女团","1456318":"鲁班七号","1456296":"夏之光","1456064":"彭楚粤","1456063":"郭子凡","1455428":"黑暗欺骗","1452715":"越界","1452208":"伍嘉成","1452021":"明制汉服","1451673":"焉栩嘉","1451590":"2K显示器","1450880":"肖战","1449446":"高考生物","1447910":"费沁源","1446710":"谷嘉诚","1445512":"疯狂动物城","1443813":"徐慧潾","1439702":"美股","1437806":"王大娘","1434903":"黄景瑜","1434902":"许魏洲","1432618":"爱宠大机密","1431684":"咖啡制作","1430280":"茶杯头","1430120":"韩国美妆","1427060":"燃烧吧少年","1426033":"我家大师兄脑子有坑","1423903":"金高银","1422623":"土豆炖牛肉","1422260":"刘飞儿","1418350":"楚乔传","1414022":"新宝岛","1413410":"尼尔机械纪元","1412402":"底特律变人","1410830":"穿越火线手游","1410225":"唇妆","1410028":"ITZY","1404375":"王者荣耀","1403904":"朴志效","1402093":"平井桃","1402092":"凑崎纱夏","1399750":"名井南","1396950":"影之诗","1396864":"金容仙","1395461":"荒野行动","1394554":"英国留学","1393143":"传说之下","1389366":"白噪音","1385136":"麦克雷","1382944":"沈月","1375873":"军师联盟","1371681":"汉服发型","1370737":"法学","1361639":"铁血的奥尔芬斯","1360622":"金道英","1359657":"拳皇14","1353160":"联想拯救者","1353146":"戳爷","1352963":"华莎","1352961":"辉人","1350313":"刘也","1346695":"赵今麦","1344205":"姜成勋","1343714":"宋昕冉","1342449":"明诚","1340644":"熊叔实验室","1339688":"蔡徐坤","1339014":"骨傲天","1338842":"博人传","1337755":"嗨氏","1335015":"宋民国","1333288":"玟星","1332502":"小黄人大眼萌","1330216":"防晒霜","1328031":"欅坂46","1327158":"天海祐希","1323937":"李圣经","1323100":"AQOURS","1322743":"汤面","1318588":"酱油炒饭","1318032":"金艺琳","1317766":"入耳式耳机","1316400":"天行九歌","1308325":"孙彩瑛","1308100":"林娜琏","1308099":"俞定延","1307556":"鸡蛋羹","1302892":"鬼畜大赏","1301876":"唇蜜","1298731":"大理寺日志","1297229":"沈梦瑶","1293757":"小米粥","1293264":"哪吒","1291155":"造梦西游3","1288454":"火影忍者手游","1288297":"超级马里奥制造","1288280":"佘诗曼","1285747":"丁恩妃","1285745":"崔俞娜","1285744":"金艺源","1285676":"周子瑜","1281706":"女流66","1278695":"夏洛特烦恼","1274965":"徐明浩","1273356":"洪知秀","1273120":"朴正花","1271438":"全圆佑","1271393":"荒原","1269344":"郑艺琳","1269250":"文俊辉","1267729":"权顺荣","1267478":"普拉提","1266597":"荣耀战魂","1266451":"夫胜宽","1264176":"金珉奎","1263686":"金鸡奖","1262982":"崔胜澈","1260792":"垫底辣妹","1260083":"冯建宇","1259589":"柠檬茶","1258411":"星动亚洲","1256831":"尹净汉","1256812":"李知勋","1255892":"龙马精神","1254904":"美丽芭蕾","1254839":"球球大作战","1254774":"申东熙","1252194":"虾滑","1248461":"BDF","1239469":"四海","1237033":"王大陆","1236718":"摩卡","1236676":"朱婷","1236089":"宫崎英高","1234724":"哪吒传奇","1234670":"游戏鼠标","1234235":"影视解说","1234161":"冲出地球","1233929":"染发","1230927":"埃罗芒阿老师","1228022":"少女前线","1227044":"牛角包","1224627":"黑暗之魂3","1224378":"陈瑶","1224377":"韩东君","1221797":"全景视频","1221581":"互动视频","1221579":"许率智","1218245":"金宰铉","1218243":"车勋","1218242":"李承协","1217733":"购物分享","1216888":"杨冰怡","1216464":"马东","1213072":"山泥若","1205111":"方舟生存进化","1204185":"昆特牌","1200789":"全昭旻","1199791":"韦神","1199590":"黄焖鸡","1197062":"MONSTA X","1196089":"奇迹暖暖","1187005":"布洛妮娅","1180937":"Are you OK","1178961":"TWICE","1178061":"凉鞋","1174481":"是在下输了","1173898":"寅子","1172858":"最好的我们","1171742":"非正式会谈","1170904":"印度美食","1169259":"邓伦","1166589":"侠客风云传","1162495":"表志勋","1161117":"电影解说","1152599":"高考物理","1151729":"百褶裙","1147004":"参鸡汤","1142567":"高考化学","1139735":"穿搭","1139423":"街头美食","1138380":"郑合惠子","1137082":"莫吉托","1132582":"阿水","1130307":"偶像梦幻祭","1130210":"朴草娥","1130206":"周二珂","1128093":"种草","1124980":"普通DISCO","1124484":"中本悠太","1121730":"油焖大虾","1112287":"都市天际线","1111341":"发型教程","1106005":"金硕珍","1106004":"闵玧其","1103589":"电脑配置","1103381":"张昕","1102712":"申惠晶","1099778":"彩虹社","1099151":"如果声音不记得","1097738":"宋家三胞胎","1094330":"宫脇咲良","1093613":"张云雷","1092695":"华为手表","1090508":"教育学","1090382":"手帐","1089748":"金雪炫","1087556":"日本豆腐","1087534":"白鹿","1082258":"张大仙","1081956":"郑号锡","1081955":"朴智旻","1081940":"金南俊","1080328":"偶像运动会","1074753":"大龙虾","1074231":"如懿传","1067350":"血小板","1066492":"德云色","1065905":"朴叙俊","1058463":"迷你厨房","1057045":"李晟敏","1056021":"麻辣小龙虾","1054498":"SEULGI","1050978":"申智珉","1050648":"韩语学习","1048177":"宋轶","1044947":"粉底","1044946":"底妆","1044288":"牵丝戏","1040180":"豆腐汤","1040026":"三日月宗近","1039059":"鹤丸国永","1038521":"收纳","1035275":"张天爱","1034765":"编发","1032214":"王博文","1029373":"张水院","1029372":"水晶男孩","1021498":"大圣归来","1020403":"周雨彤","1020279":"朴宝剑","1020034":"GFRIEND","1019881":"张予曦","1018272":"星际战甲","1017641":"刀剑乱舞","1014344":"罗云熙","1014045":"钵仔糕","1011490":"马甲线","1005496":"刘敏涛","1005465":"你好世界","1004975":"LCK","1001997":"白宇","999385":"影视杂谈","994518":"垃圾佬","994090":"FGO","988556":"干物妹小埋","987582":"张雨鑫","987568":"王司徒","986177":"宝塚","984842":"神超","983293":"连城璧","979033":"朴素妍","977612":"陆婷","975288":"街霸5","973929":"丁程鑫","970789":"拍照手机","970732":"可塑性记忆","966586":"李洪基","964575":"曹承衍","964574":"李汶翰","951674":"琪亚娜","950841":"约瑟夫","949470":"吴夏荣","949469":"金南珠","948239":"空洞骑士","947331":"周依然","943873":"侏罗纪世界","943131":"孙芮","942929":"崔珉起","937793":"许杨玉琢","935320":"迷你世界","934788":"卡戴珊","930932":"LOVELYZ","930635":"朱一龙","928449":"ZICO","926988":"守望先锋","921323":"古风舞","918398":"李现","917992":"赵粤","917244":"空气炸锅","915594":"惊奇队长","914587":"复仇者联盟3","912869":"洪真英","912494":"任嘉伦","911336":"李居丽","911249":"王迅","911124":"敖子逸","908970":"HANI","906753":"郑业成","904950":"波澜哥","903111":"全宝蓝","902875":"减肥餐","902804":"美国留学","902725":"冯提莫","902215":"王一博","902214":"UNIQ","902193":"仿妆","900798":"无主之地3","898995":"金多贤","898091":"彩虹六号围攻","891482":"FPX","887323":"刘诗雯","884531":"孤影","882598":"影视混剪","880337":"烤猪蹄","880335":"卤猪蹄","879358":"杀手2","879244":"万丽娜","879243":"冯薪朵","878348":"OVERLORD","873733":"韩非","873562":"油豆腐","872789":"疾速追杀","868709":"一个人的武林","866683":"郑粲右","863753":"血源诅咒","861311":"PR教程","856481":"林一","848567":"咸恩静","847845":"穿普拉达的女王","840887":"露营","840219":"金孝渊","840218":"黄美英","840163":"张若昀","839005":"MAMAMOO","838789":"学习方法","837899":"金韩彬","837378":"古董局中局","833300":"宋尹亨","832569":"美妆","831374":"金振焕","825482":"面膜","823256":"荒野大镖客2","822462":"粉底液","822420":"金所炫","821151":"张钧甯","820876":"游戏手机","820148":"朴秀荣","819952":"玩具熊的五夜后宫","819719":"尹正","819718":"成毅","819467":"古剑奇谭游戏","817374":"芜湖大司马","814910":"炸鸡腿","811810":"声优广播","808938":"慕斯蛋糕","805733":"红烧鱼","802163":"野生技术协会","796840":"金泰亨","796838":"田柾国","795012":"烤土豆","794862":"马思唯","794385":"李顺圭","793071":"源氏","791829":"4AM","789870":"NUEST","788691":"俄剧","784170":"一周的偶像","783535":"严斌","780558":"金钟铉","780447":"周淑怡","779262":"午餐肉","778339":"于朦胧","777092":"LINUSTECHTIPS","773822":"白敬亭","772031":"鸡胸肉","766151":"片寄凉太","762312":"张彬彬","760121":"自杀小队","759049":"李栋旭","756847":"手抓饼","753867":"季肖冰","752983":"南柱赫","752249":"张碧晨","751970":"周深","750669":"苹果手表","749860":"夏至未至","748338":"老师好","748238":"碧蓝幻想","737629":"于晓光","737461":"金珉锡","736573":"扫地机器人","735503":"李泰民","732271":"焖饭","725992":"吴倩","720912":"林在范","719063":"月圆之夜","716691":"堡垒之夜","715800":"防晒","714393":"门锁","713926":"搜救","712595":"坦克世界闪电战","706486":"动漫资讯","703941":"李荣浩","700392":"崔荣宰","700391":"朴珍荣","700389":"段宜恩","700388":"金有谦","700387":"王嘉尔","696751":"古力娜扎","693473":"安图恩","692758":"水煮鱼","690640":"魏大勋","689147":"王境泽","686151":"皮蛋瘦肉粥","684608":"金厉旭","683752":"球鞋","682032":"择天记","678144":"JUNGKOOK","676424":"马里奥制造","675872":"小松菜奈","673903":"宝蓝","672893":"李永","671689":"民宿","671156":"我只喜欢你","663765":"姜虎东","661600":"宋祖儿","660189":"美食侦探","659917":"忍者必须死","656109":"女人我最大","655995":"李承鄞","653892":"刘昊然","651301":"李斯丹妮","649117":"家居","645936":"口红","645812":"漫威电影","644870":"小米平板","641414":"斋藤飞鸟","641033":"国内综艺","637832":"自驾游","634695":"哥谭","634219":"朴春","630567":"房车","629601":"刘国梁","629081":"金晨","625249":"水濑祈","625117":"田径","623790":"美甲","621640":"生死狙击","620958":"可乐鸡翅","620762":"乐童音乐家","617079":"任豪","615664":"谭松韵","615194":"尹普美","615193":"朴初珑","615192":"孙娜恩","613680":"朴孝敏","613025":"卡布奇诺","612671":"金唱片","612086":"护肤","612073":"李多喜","610195":"H1Z1","605361":"数据可视化","604596":"真三国无双8","603338":"汽车评测","603074":"宠物医院","602557":"英语口语","602418":"杀戮天使","601839":"奥拉星","600160":"无限火力","600144":"EDG","599663":"请问您今天要来点兔子吗","599064":"东京奥运会","598696":"米卡","598440":"咒","598357":"日常妆","597654":"辣子鸡","596132":"梅根","595451":"韩国美食","592857":"秦俊杰","592627":"上官婉儿","591125":"金圣圭","590630":"四月是你的谎言","590624":"路人女主的养成方法","589268":"关晓彤","588111":"徐海乔","586269":"欧阳娜娜","581189":"VIXX","579454":"RNG","579165":"丸子头","578683":"梅长苏","578320":"黄婷婷","578222":"麻薯","577900":"张峻豪","577535":"5G","576152":"明凯","575706":"美式咖啡","574887":"BTOB","574006":"西卡","573045":"葱油饼","572556":"洞主","571888":"眼影","571533":"澳门风云","570860":"调酒","570258":"矢吹奈子","570166":"许凯","569515":"高马尾","567623":"宣美","566210":"拌面","565581":"涛妹","565481":"篮球鞋","564757":"钟辰乐","564621":"金钟大","563816":"无线耳机","563711":"腊肠","563196":"黑店百地","562579":"气象","562511":"魔女2","559363":"头戴式耳机","556840":"朴智妍","553693":"APINK","553302":"一年生","552737":"门徒","544762":"樊振东","544761":"丁宁","544672":"光盘行动","543181":"汽车模型","540875":"一周的朋友","540461":"伊野尾慧","539854":"沉睡魔咒","536516":"林秀香","536400":"橘右京","536395":"防弹少年团","535925":"JYP","535923":"BAMBAM","535922":"GOT7","535884":"华尔街之狼","535650":"王鸥","535299":"辛德勒的名单","534014":"几何冲刺","532013":"金材昱","531208":"大侠卢小鱼","530918":"动漫杂谈","529643":"无心","528969":"宣璐","526460":"秋瓷炫","526392":"PS5","525659":"鱼香肉丝","521731":"知否知否应是绿肥红瘦","521337":"电竞赛事","520050":"沫子","520000":"瑞克和莫蒂","519896":"化妆品","519316":"武磊","518596":"檀健次","516500":"秀场","515827":"易嘉爱","515826":"李艺彤","515169":"殷志源","515117":"星际穿越","514412":"崩坏学园2","513708":"超神学院","513171":"黄轩","512372":"摄影教程","510520":"土豆丝","510215":"一步之遥","510021":"岳岳","506528":"成果","504679":"时装周","504597":"环球旅行","504355":"螺蛳粉","502706":"烤串","501905":"小虎","500019":"奥奇传说","499816":"彩妆","498800":"生田绘梨花","497398":"辐射4","497221":"鬼畜调教","496473":"凉面","495416":"天谕","493569":"赏金术士","492464":"马龙","492395":"扫黑行动","491845":"窦骁","490990":"桥本环奈","490923":"花样年华","490608":"试吃","489375":"陆星材","488659":"糖醋排骨","487255":"理财","486385":"徐贤","486085":"酸菜鱼","484358":"池昌旭","482921":"曺圭贤","482902":"吴昕","482275":"刘涛","481901":"王耀庆","481489":"扬州炒饭","480470":"徐子轩","480264":"煲汤","479818":"AOA","479227":"靳东","476829":"风暴英雄","476115":"金希澈","475516":"拿铁","474681":"眼妆","474020":"西野七濑","472990":"明日之后","471583":"朴炯植","471091":"手链","470877":"倪妮","470666":"鞠婧祎","470665":"林思意","469388":"孔刘","469196":"力丸","467082":"BML","462608":"断桥","460348":"粉饼","460090":"张子枫","459007":"EDM","458852":"微微一笑很倾城","457916":"造梦西游","457385":"电子产品","454809":"甜品","453608":"连衣裙","452343":"温流","451792":"中国舞","451654":"安崎","450716":"土豆饼","449518":"都暻秀","448718":"戚风蛋糕","448443":"烤箱","446907":"埼玉","446505":"雷佳音","445152":"FAKER","444760":"赛博朋克2077","443303":"野外生存","442514":"李沁","438585":"洼田正孝","435985":"刘宪华","435569":"IRENE","435407":"金钟仁","435406":"金俊勉","435405":"吴世勋","435404":"边伯贤","435403":"朴灿烈","433844":"全境封锁","433824":"模拟人生4","431937":"郑恩地","428970":"蛋糕制作","428529":"消逝的光芒","426077":"新奥特曼","425410":"银河护卫队","424714":"新警察故事","424331":"灵能百分百","423627":"机箱","423036":"曾卓君","420821":"孔孝真","417852":"电饭煲","416482":"郭京飞","416376":"迪丽热巴","416375":"高伟光","415431":"索尼相机","414968":"文豪野犬","413678":"装机","409944":"流放之路","409754":"白石麻衣","405162":"背带裤","404647":"小李子","404504":"战地5","404044":"七日杀","400668":"华晨宇","397891":"助眠","397672":"松饼","397670":"一人食","397404":"男刀","395596":"旅拍","394549":"红烧排骨","394538":"吃鸡","392845":"民族舞","391556":"金木研","390737":"金智媛","390219":"猪蹄","389537":"西葫芦","389510":"处处吻","389490":"虾","389440":"租房","385801":"娱乐百分百","385333":"吐司","384852":"酸梅汤","384798":"王雷","384363":"武状元苏乞儿","383910":"超轻粘土","383680":"金明洙","380426":"德牧","380387":"拆弹专家","379680":"黄少天","378659":"荔枝","378278":"林允儿","378048":"伪装者","377209":"食戟之灵","377088":"八重樱","376775":"起风了","374686":"龙俊亨","374620":"玉泽演","372889":"强仁","372799":"考研","372675":"燕小六","372423":"许昕","372420":"张继科","371512":"崔秀英","370017":"粥","369699":"赶海","369641":"神偷奶爸","369126":"部落冲突","367456":"WINNER","366980":"巧克力蛋糕","366532":"最终幻想15","365736":"巫师3","365677":"泰坦陨落","364848":"仁王","363113":"吕珍九","361796":"植物大战僵尸2","360877":"沈昌珉","360876":"郑允浩","360005":"英语学习","356796":"游戏人生","356262":"萌娃","353057":"智能手表","351678":"键帽","350360":"橡皮章","349128":"欧洲卡车模拟2","349001":"鬼鬼吴映洁","348953":"茅子俊","347055":"路人王","345363":"西西里的美丽传说","341391":"朴宰范","341369":"拉丁舞","340020":"盲女","338050":"时崎狂三","337310":"AE教程","335752":"PS教程","334910":"金秀贤","334517":"恶灵附身","333943":"天涯明月刀OL","333528":"野良神","332847":"荞麦面","332531":"最后生还者","332416":"姿态","331863":"利威尔","329830":"黑暗之魂2","329261":"王子变青蛙","328981":"日本留学","328122":"姜大声","325309":"境界的彼方","324091":"洗碗机","323144":"意大利面","322961":"金俊秀","322960":"崔始源","322239":"新科娘","322082":"歪果仁","321905":"中华田园犬","321258":"恶之花","320487":"三明治","318756":"炉石传说","318664":"金泰妍","318570":"影视剪辑","318397":"万茜","318078":"张晋","317896":"小龙虾","317609":"沙海","316679":"吴秀波","315748":"手撕鸡","315352":"LPL","313718":"服饰","313458":"郑秀晶","313457":"郑秀妍","312534":"焦俊艳","312200":"崔胜铉","311144":"烤肠","310775":"赵丽颖","309568":"排骨","309518":"隐形人","309290":"魔术教学","308052":"革命机VALVRAVE","306663":"星际公民","306139":"王子文","306138":"周冬雨","306137":"杨颖","305918":"尼坤","305155":"雅思","304696":"新蝙蝠侠","304169":"珠宝","304105":"叶修","302709":"言叶之庭","300744":"纸人","300697":"艺声","299685":"游戏本","299641":"虎神","299611":"张良","298482":"戴萌","298303":"贾玲","298164":"穷游","297206":"吴哲晗","296818":"黄旭东","296288":"我要我们在一起","296203":"钱蓓婷","296112":"马丽","296111":"沈腾","294354":"莫寒","294275":"张语格","291921":"一剪梅","290291":"冥想","290069":"爵士舞","289460":"梅菜扣肉","289315":"川菜","289033":"鸡汤","288405":"剑雨","287870":"蒋欣","287380":"李准基","286910":"韩信","286512":"主持人大赛","286464":"九九八十一","285109":"上海地铁","285044":"女神异闻录5","284724":"刘畊宏","284682":"七大罪","284496":"赵磊","282866":"郑亨敦","282453":"人类观察","282435":"作画MAD","281878":"EXID","281864":"乔杉","281638":"许佳琪","280531":"节奏大师","279840":"李胜贤","279790":"孔肖吟","279760":"英语六级","276236":"薛之谦","275992":"坠落","274802":"PDD","274013":"IZONE","272235":"秦岚","268705":"排球少年","266892":"英语四级","266190":"鱿鱼","266119":"李健","265488":"剑宗","264846":"日本旅游","264440":"崩坏学园","264301":"罗宋汤","264029":"红烧肉","263089":"游戏集锦","261355":"化妆教程","261233":"JK制服","260652":"饥荒","259991":"GEN","257412":"帕梅拉","257162":"文彩元","257161":"宋仲基","256731":"瘟疫公司","256508":"井柏然","256276":"番茄炒蛋","255784":"陈晓","255603":"少年派","255087":"劫","254615":"金智秀","254068":"约会大作战","254027":"英魂之刃","253801":"古装剧","253448":"RWBY","252406":"陈伟霆","252274":"捡垃圾","252081":"吕秀才","251928":"菠萝赛东","251843":"布偶猫","251059":"双十一","250444":"狮子狗","250067":"影流之主","249842":"文明6","248948":"DIA","248805":"断网","248004":"秦昊","248003":"马思纯","243120":"重庆话","242903":"项链","242864":"300英雄","241712":"新裤子","241699":"安宰贤","241337":"利特","240874":"西兰花","240347":"玛格丽特","239855":"厨艺","238261":"狼人杀","237069":"古风翻唱","236831":"音游","236568":"西甲","236135":"陈赫","236068":"紧急救援","235021":"麻辣鸡","233677":"李光洙","233619":"魏晨","233344":"欢乐斗地主","233111":"冰雪奇缘","233003":"金泫雅","232159":"满江红","230405":"G2","230186":"李惠利","229190":"村上信五","229073":"狄仁杰","228455":"肖申克的救赎","227424":"文森特","226146":"烹饪","225507":"权志龙","224773":"重装上阵","224415":"灭霸","223653":"李东海","223615":"安田章大","223047":"老陈","221917":"有冈大贵","220476":"李易峰","220450":"山崎贤人","220187":"奢侈品","219887":"崔雪莉","219886":"崔珉豪","218956":"张怡宁","218836":"英语语法","218245":"烘焙","218167":"弱音HAKU","217923":"吉良吉影","217699":"薮宏太","216971":"李宗伟","216914":"BAE","216283":"谭晶","216260":"军事科技","215841":"我们结婚了","215500":"尹斗俊","215499":"李赫宰","214414":"小水","214370":"乐正龙牙","214233":"奇异博士","214030":"张艺兴","213040":"环太平洋","212821":"孙杨","212661":"王俊凯","212660":"王源","212197":"战争雷霆","211065":"热带鱼","210946":"腾格尔","210691":"流浪地球","210501":"张含韵","210351":"鸡爪","209672":"流星花园","207892":"虚拟歌手","207781":"篮球教学","206950":"张雨绮","206943":"4K","206466":"高以翔","206465":"陈乔恩","206464":"张翰","206405":"七朵组合","206371":"MSI","206115":"舞力全开","205756":"SISTAR","205372":"木工","204909":"芽衣","204682":"环境音","204442":"唇膏","203752":"德州扑克","203360":"赵又廷","202470":"流水","201841":"张娜拉","201609":"GAI","201481":"乐正绫","201462":"机械键盘","200691":"烤鱼","199397":"口水鸡","198975":"上坂堇","198482":"姬子","198427":"宋小宝","197990":"郭麒麟","197897":"丸山隆平","197035":"天涯明月刀","196296":"吴磊","195492":"信条","194934":"YG","194342":"权侑莉","194288":"英雄连2","192335":"杨戬","191549":"傅红雪","191239":"吴青峰","191238":"黄子韬","191033":"鹿晗","191032":"EXO","190723":"麻辣烫","189985":"福原爱","189223":"杨蓉","189215":"无敌破坏王","189181":"我的青春恋爱物语果然有问题","188464":"看门狗","188042":"NBA2K","187787":"亚索","187095":"德莱文","186562":"乔振宇","186559":"舒畅","186426":"杨紫","185237":"宇智波鼬","185233":"FNC","185181":"美瞳","184905":"虾仁","184527":"莴笋","182801":"游戏王YGOCORE","182316":"诺克萨斯之手","181133":"裴秀智","180653":"赵敏","180212":"东永裴","180184":"刘星","179850":"周笔畅","179812":"张扬","179187":"刘仁娜","179103":"泰剧","179080":"唐嫣","178862":"星海","178172":"阿信","176807":"MAMA","175905":"卡莲","175335":"洋葱","175174":"黑镜","174458":"武则天","174045":"拜仁","173262":"杰尼斯","172837":"斗破苍穹","172195":"花粥","171796":"王凯","171662":"SNH48","171505":"GENERATIONS","171332":"郭芙蓉","171290":"古琴","170997":"北京奥运会","170646":"戏曲","170377":"撒贝宁","169523":"医学","169485":"以撒的结合","168822":"T-ARA","168516":"白冰","167015":"凹凸世界","166738":"热血无赖","166550":"托福","166338":"边江","165956":"SN","165546":"锐雯","165210":"广场舞","165014":"地理","164146":"桐人","163736":"BOBBY","163369":"黄龄","163192":"黑豹2","161860":"梁逸峰","161375":"夺冠","161357":"装修","161247":"古典舞","161137":"枪神纪","160442":"朴有天","160298":"跨年演唱会","160097":"刀妹","159571":"韩舞","159190":"张智尧","159059":"CLC","158255":"玄彬","158202":"陈星汉","158189":"冰菓","157951":"抖森","157930":"有吉弘行","157821":"天生一对","157146":"白金DISCO","157087":"舞蹈教学","156230":"牛排","155880":"笑笑","153954":"杨洋","153951":"林黛玉","152882":"明道","152673":"王师傅","152655":"沙盒游戏","152330":"妲己","151950":"米津玄师","151642":"SKT","151542":"TF家族","151521":"贾宝玉","151514":"博德之门","150694":"张鹤伦","150416":"空中浩劫","150342":"低俗小说","149838":"HKT48","149532":"戚薇","149531":"大张伟","149330":"卢克","149066":"S.H.E","149065":"郑元畅","148937":"电棍","148898":"林更新","148760":"董卿","148556":"那年那兔那些事儿","148414":"牛仔裤","148242":"内存条","148171":"鸡蛋饼","148123":"编舞","147600":"佟湘玉","147289":"韩雪","147058":"伊芙琳","147026":"双肩包","147016":"无人机","146730":"乃木坂46","146628":"泰国电影","146059":"牛肉","145883":"模型制作","145808":"微单","145696":"鸟鸣","145656":"金毛","145436":"TXT","144956":"魔术揭秘","144654":"JYJ","144292":"四川话","143893":"章子怡","143751":"手机评测","143665":"孤独的美食家","142904":"艾伦秀","142726":"恶作剧之吻","142339":"知念侑李","141870":"宋茜","141407":"巴菲特","140992":"变形计","140503":"杨丞琳","140364":"年度盘点","139012":"自然科学","138600":"漫威","137793":"张韶涵","135668":"啦啦啦德玛西亚","135212":"街球","134721":"宇智波斑","133641":"黄磊","133622":"高木雄也","133353":"金陵十三钗","133257":"生物","130863":"天津话","130159":"姚晨","129697":"SUPER JUNIOR","129641":"言和","128786":"泠鸢YOUSA","127846":"罗翔","127837":"刃牙","127279":"火力少年王","126954":"插画","125578":"翼装飞行","124649":"狼群","124135":"洛克王国","123465":"KPOP","123146":"S10","119973":"包包","119702":"江华","119640":"速度与激情","119392":"深海","118386":"まふまふ","116606":"阿卡丽","116535":"匪我思存","116480":"张召忠","116364":"泡面","116267":"卡牌游戏","116059":"韩庚","116044":"围攻","116013":"王大锤","115092":"编曲","114612":"黑子的篮球","114604":"金光布袋戏","114088":"户外","113512":"黄圣依","113431":"黎姿","113054":"BJD","112832":"草薙京","112758":"雨声","112139":"尤克里里","111865":"电子音乐","111817":"韩语","111405":"巡音LUKA","111377":"影评","111037":"宫本武藏","110784":"李佳薇","110511":"开箱","110347":"张一山","110331":"无名","109721":"蔡少芬","109540":"日语学习","109161":"松冈祯丞","108939":"荒岛求生","108907":"手表","108744":"白色相簿2","108296":"孙俪","107974":"大鹏","107840":"忠犬八公","107839":"杀死比尔","107783":"潘粤明","107717":"杀破狼","107668":"TEN","106299":"GOPRO","105794":"小马宝莉","105768":"宋智孝","105765":"池石镇","105764":"刘在石","105763":"金钟国","105669":"全智贤","105286":"国家宝藏","105130":"自我介绍","105019":"杨梅","104929":"搞笑一家人","104812":"高达EXVS","104537":"PS4","104427":"薇恩","104037":"海鲜","103817":"摩尔庄园","103594":"董洁","103593":"张嘉译","103406":"书法","103076":"彭于晏","103074":"杀生丸","102935":"索隆","102841":"宁静","102666":"齐舞","102361":"盲僧","102317":"李佳航","101694":"破坏之王","101392":"贾斯汀比伯","101365":"使命召唤OL","101333":"烤鸡翅","101287":"拳皇98","101263":"英语听力","100925":"鸡肉","100759":"战斗法师","100475":"田馥甄","100163":"豪车","99842":"CS:GO","99697":"朴敏英","99344":"利物浦","99264":"飞盘","98890":"C4D","98842":"灾难","98414":"派大星","98053":"2NE1","98016":"古川雄辉","97613":"林心如","97199":"战舰世界","96579":"爸爸去哪儿","96514":"娄艺潇","96498":"锅包肉","96308":"陆军","96197":"QQ飞车","96107":"巴萨","96007":"小枫","95691":"巴啦啦小魔仙","95670":"终极三国","95153":"运动鞋","95071":"伊莉雅","94982":"经济","94971":"手指舞","94571":"我是大哥大","94460":"雷军","94375":"小黄人","94365":"土豆泥","94337":"家常菜","94281":"灰太狼","94247":"帆布鞋","93250":"金星","93217":"王思聪","92708":"吴尊","91251":"潮流","90804":"芹菜","90439":"游戏攻略","89976":"高桥南","89808":"礼物","89694":"金在中","89358":"生化危机6","89203":"林依晨","87922":"泰国广告","87677":"韩红","87376":"胡夏","87121":"吉他弹唱","86917":"鲸鱼","86845":"杨幂","86776":"室内设计","86573":"逆战","85689":"日文翻唱","85651":"街机游戏","85317":"张智霖","85149":"宋慧乔","85111":"裙子","84875":"张伟","84657":"象棋","83553":"八乙女光","83550":"小嶋阳菜","83294":"山田凉介","83104":"一美","82945":"诺贝尔奖","82518":"X1","82141":"汪东城","81867":"韩国电影","81618":"航天","81372":"YYF","81265":"日本综艺","81222":"SEVENTEEN","80946":"罪恶王冠","80914":"美女与野兽","80600":"刘备","80446":"风云雄霸天下","80372":"滑雪","80371":"陈坤","80309":"炎亚纶","80129":"3DMAX","79809":"石原里美","79795":"朴宝英","79484":"贺来贤人","79402":"黑手党","79245":"喜剧片","79034":"素描","78992":"喜剧之王","78868":"终结者2","78711":"张靓颖","78484":"李敏镐","78415":"面条","78160":"西线无战事","77733":"章鱼哥","77680":"冯绍峰","77679":"黄渤","77557":"李晨","77556":"张译","77401":"夜宵","77388":"旭旭宝宝","77083":"阿杰","76626":"动物之森","76615":"F(X)","76435":"番茄","75847":"林丹","75803":"蔡康永","75002":"生化危机7","74927":"贞德","74605":"爱丽丝梦游仙境","74529":"菜单","73621":"朴树","73516":"寿司","73475":"孤岛惊魂","73404":"杏仁豆腐","73139":"武装突袭3","72926":"吕子乔","72672":"UZI","72303":"游泳","72140":"饮料","72138":"原创歌曲","71898":"焦恩俊","71897":"刘烨","71875":"汪峰","71686":"WENDY","71602":"张杰","71273":"相叶雅纪","71221":"煎蛋","71175":"白展堂","71124":"孙尚香","70720":"吉尔伽美什","70718":"横山裕","70561":"陈道明","70024":"泰拉瑞亚","69943":"六小龄童","69811":"邓紫棋","69736":"赵雅芝","69434":"钉钉","68637":"苏有朋","68539":"林志颖","68393":"赛文奥特曼","68321":"毕业季","68270":"香水","68112":"张家辉","68042":"2PM","67482":"监狱风云","67201":"BEAST","66872":"黑金","66849":"财经","66834":"关8","66611":"情侣","66594":"高晓松","66209":"现代舞","66188":"汪苏泷","64842":"安以轩","64475":"辩论","64457":"蓝拳","64397":"微电影","64343":"威廉","64254":"古筝","64207":"黎明","64022":"张震","63887":"许嵩","63715":"吴彦祖","63711":"巴比伦","63265":"黑道圣徒","63185":"复仇者联盟","63096":"恐龙","63073":"经济学","63019":"暮光之城","63017":"魔戒","63002":"天策","62939":"郑伊健","62937":"郭富城","62411":"德甲","62330":"英超","61963":"管理学","61575":"柯基","61512":"景甜","61511":"孙红雷","61382":"大仓忠义","61300":"警察故事","61044":"卸妆","61021":"东方神起","60730":"陈豪","60624":"高铁","60513":"未闻花名","60399":"小龙女","60323":"少女与战车","60181":"逃学威龙","59990":"刺猬索尼克","59930":"凉粉","59920":"赌圣","59861":"莫文蔚","59846":"农村","59624":"LOLITA FASHION","59535":"张柏芝","59534":"谢霆锋","59457":"茅野爱衣","59337":"红色警戒2","59062":"赌侠","58615":"邓超","58562":"西游降魔篇","58512":"海上钢琴师","58495":"诛仙","58261":"特斯拉","58230":"围棋","58228":"郑容和","58226":"朴信惠","58218":"公路车","57834":"航母","57684":"镇魂街","57448":"弹丸论破","57220":"印度电影","57156":"POPPING","56738":"雷欧奥特曼","56723":"八神","56504":"范伟","56408":"内马尔","56406":"小吃","55920":"钟汉良","55739":"唐伯虎点秋香","55152":"大S","55079":"小S","55054":"周迅","54904":"胡一菲","54593":"爱杀宝贝","54574":"GARY","54532":"张敬轩","54206":"单反","54046":"九品芝麻官","53885":"维吉尔","53873":"相机","53731":"李宇春","53667":"山地车","53580":"印度歌舞","53473":"搞笑配音","53445":"大野智","53206":"羽毛球","53105":"小叮当","53056":"韩剧","52718":"延时摄影","52314":"孔侑","52179":"纪实","52126":"王心凌","51540":"大乔","51532":"沙溢","51447":"狮子","51330":"诸葛亮","50944":"哈尔的移动城堡","50787":"凡人修仙传","50654":"李孝利","50614":"UFC","50488":"佐藤健","50345":"艾薇儿","50331":"战神4","50158":"彩虹六号","49874":"想见你","49741":"奥运会","49478":"IU","49439":"投影仪","49422":"TED","49079":"牧场物语","49009":"李云龙","49008":"亮剑","48961":"饺子","48934":"梅艳芳","48590":"上古卷轴5","48485":"千与千寻","48326":"二宫和也","48271":"吴京","48233":"海豹","48206":"橙子","47996":"冷知识","47988":"我的世界","47896":"斗地主","47863":"杨迪","47708":"高跟鞋","47637":"豪宅","47481":"职场","47404":"沙拉","47282":"日本料理","47079":"欧冠","47034":"DOTA2","46977":"下午茶","46929":"斯诺克","46723":"梁朝伟","46722":"张曼玉","46419":"侏罗纪公园","46188":"梁家辉","46183":"人工智能","46133":"冰淇淋","46126":"股票","46123":"周慧敏","45996":"机动战士高达00","45968":"星尘","45945":"菊次郎的夏天","45614":"金刚","45576":"吴奇隆","45566":"马天宇","45565":"霍建华","45564":"刘诗诗","45490":"大鱼海棠","45081":"伊藤润二","45077":"CL","44665":"武装突袭","44392":"ROSE","44381":"菅田将晖","44220":"折纸","44171":"刘慈欣","44129":"香取慎吾","44128":"中居正广","43766":"圣歌","43693":"驯龙高手","43303":"歌剧","42949":"欢乐颂","42739":"谢娜","42738":"何炅","42390":"黑暗之魂","42361":"陈小春","42348":"半泽直树","42279":"李克勤","42253":"短裤","42208":"维多利亚的秘密","42015":"排球","41928":"曾小贤","41917":"心理学","41861":"哥斯拉","41752":"王小明","41593":"咖啡","41573":"PSV","41194":"金庸","41103":"体育","40872":"手风琴","40855":"潘玮柏","40787":"VR","40737":"人文","40649":"镜音RIN","40374":"恶魔之魂","40323":"袁咏仪","40298":"长野博","40082":"HAHA","39999":"下山","39704":"IG","39591":"波风水门","39326":"羽生结弦","39295":"短裙","39164":"鸡蛋","39118":"鬼畜全明星","39107":"金融","39062":"鼠标","38731":"三体","38714":"传送门","38360":"BLG","38329":"奶茶","38199":"德语","38138":"锦户亮","37887":"孙策","37800":"岚","37660":"三森铃子","37558":"稻垣吾郎","37557":"SMAP","37497":"INFINITE","37364":"刘亦菲","37254":"阿甘正传","37242":"健康","37127":"芭蕾","36893":"早餐","36877":"LOVE LIVE!","36477":"堂本光一","36292":"太宰治","35859":"胡歌","35826":"让子弹飞","35807":"梦幻西游","35730":"周润发","35602":"葛优","35575":"坦克世界","35505":"甜点","35504":"蛋糕","35272":"姜文","35258":"木吉他","34631":"坎巴拉太空计划","34321":"黑科技","34155":"东方栀子","33963":"WE","33862":"王菲","33818":"TOKIO","33730":"法语","33623":"楚留香","33467":"逆水寒","33450":"独立游戏","33360":"林俊杰","33072":"航空","33034":"松本润","32944":"蹦极","32881":"超级战队","32813":"吴宗宪","32811":"赵本山","32788":"中岛裕翔","32767":"古典音乐","32613":"面试","32586":"水浒传","32517":"李玉刚","32461":"徐峥","32454":"汉服","32318":"邓萃雯","32301":"王力宏","32284":"惊声尖笑","31878":"翻跳","31864":"公开课","31861":"枪声音乐","31806":"刘醒","31762":"罗永浩","31093":"悠悠球","30951":"东北话","30815":"蚁人","30580":"长泽雅美","30550":"眉毛","30508":"梦幻模拟战","30239":"柴犬","30124":"赛罗奥特曼","29871":"黑亚当","29788":"教父","29722":"剑灵","29671":"尔康","29668":"空军","29661":"阿卡贝拉","29622":"功夫熊猫","29603":"刀剑神域","29597":"工藤新一","29415":"二次元鬼畜","29276":"汉堡","29138":"烧烤","29105":"水彩","29044":"美国队长","28784":"编程","28759":"BEATBOX","28683":"文明","28668":"美国电影","28631":"张卫健","28628":"吴孟达","28555":"OMG","28421":"刘德华","28321":"范冰冰","28195":"黑寡妇","28096":"甄子丹","28074":"魔法少女小圆","27955":"曼联","27866":"C罗","27398":"马化腾","27269":"山田孝之","27268":"小栗旬","27217":"梁非凡","27022":"死侍","27021":"绿巨人","26977":"洗面奶","26909":"王祖贤","26856":"镜音LEN","26583":"拳击","26582":"洛基","26517":"动画短片","26516":"奥斯卡","26390":"林青霞","26277":"全职猎人","26251":"盖聂","26249":"樱井翔","26180":"人力VOCALOID","26038":"暗黑破坏神","25955":"骑马与砍杀","25898":"跑车","25885":"陈奕迅","25758":"暗黑破坏神3","25560":"轩辕剑","25483":"GMV","25450":"摄影","25395":"国家地理","25376":"魔兽争霸3","25337":"黑豹","25327":"三笠","24935":"火柴人","24908":"卫宫士郎","24870":"蛋炒饭","24789":"英剧","24762":"阿拉斯加","24467":"岳云鹏","24386":"康熙来了","24304":"战斗机","24236":"跳水","23995":"航拍","23901":"互联网","23877":"风之谷","23661":"小罗伯特唐尼","23605":"汉尼拔","23580":"贝吉塔","23430":"霸王别姬","23369":"LGD","23331":"粽子","23306":"炸鸡","23208":"平板电脑","23182":"武汉","23002":"柏木由纪","22984":"三浦春马","22919":"大熊猫","22657":"罗志祥","22654":"小说","22551":"漫展","22534":"ADC","22525":"这个杀手不太冷","22338":"BW","22317":"乌龟","22269":"瑜伽","21873":"泰拳","21854":"SUV","21646":"指弹吉他","21609":"饼","21534":"闪电侠","21382":"如龙","21337":"月饼","21325":"美人鱼","21297":"嘻哈","21295":"鬼步舞","21216":"显示器","21187":"剑网3","21079":"土豆","20986":"蛋挞","20805":"减肥","20804":"跑步","20795":"神奇女侠","20744":"日麻","20736":"EXCEL","20706":"赛尔号","20684":"五月天","20495":"滑板","20479":"笛子","20459":"鬼泣5","20439":"萨摩耶","20327":"射击游戏","20215":"美食","20098":"冲浪","20057":"魔兽争霸","20042":"昆虫","20002":"TRPG","19956":"包子","19890":"游戏解说","19877":"美军","19860":"郭敬明","19794":"黄晓明","19703":"零食","19539":"灰原哀","19382":"披萨","19258":"阿森纳","19047":"李连杰","19042":"台风","18970":"和珅","18969":"纪晓岚","18966":"张国立","18902":"跑团","18879":"小王子","18874":"跑跑卡丁车","18755":"硬盘","18669":"陈汉典","18537":"DRAMA","18505":"最终幻想7","18447":"鲨鱼","18423":"摩托车","18330":"卫庄","18277":"曹操","18086":"棒球","18056":"面包","17941":"恐怖游戏","17940":"红蝶","17739":"布丁","17690":"黄子华","17683":"单机游戏","17625":"悲惨世界","17539":"摔角","17418":"贝斯","17390":"行尸走肉","17365":"NASA","17332":"马云","17299":"谢耳朵","17246":"魔方","17231":"神秘海域","17098":"剑道","17034":"欧美音乐","17013":"霍比特人","16992":"盗梦空间","16807":"龟梨和也","16724":"穿越火线","16599":"馒头","16474":"红白歌会","16332":"冷兵器","16262":"口琴","16097":"乒乓球","16093":"军训","15958":"哈士奇","15942":"史莱姆","15846":"鸡翅","15845":"清唱","15808":"李钟硕","15751":"黄瓜","15746":"少女时代","15491":"鸣人","15478":"头文字D","15414":"台球","15342":"天文","15296":"英文翻唱","15265":"架子鼓","15227":"中岛美嘉","15204":"孙悟空","15187":"TFBOYS","15186":"易烊千玺","14958":"导弹","14932":"程序员","14913":"拳皇97","14898":"TES","14826":"琵琶","14704":"乐器","14583":"佐助","14469":"木村拓哉","14426":"电音","14379":"PR","14117":"贾静雯","14107":"新垣结衣","14080":"加勒比海盗","13996":"不知火舞","13896":"发型","13893":"交响乐","13881":"超级英雄","13879":"X战警","13878":"金刚狼","13848":"小品","13784":"迪迦奥特曼","13760":"汽车","13715":"STEAM","13683":"民谣","13584":"地狱少女","13509":"文学","13490":"定格动画","13450":"科幻片","13370":"机械舞","13267":"RADWIMPS","13175":"化妆","13098":"万智牌","13004":"国产凌凌漆","12988":"动物世界","12882":"跑酷","12843":"魔女","12837":"擎天柱","12816":"于谦","12784":"开口跪","12732":"猫头鹰","12675":"皇马","12644":"猪肉","12625":"小游戏","12407":"张超","12341":"UFO","12157":"BIGBANG","12134":"炒饭","12097":"回魂夜","12078":"陈冠希","11936":"恐怖片","11920":"三国志","11824":"网球王子","11715":"马拉多纳","11687":"综艺","11684":"LISA","11666":"战锤40K","11564":"铠甲勇士","11559":"音乐剧","11526":"樱井孝宏","11434":"黄家驹","11387":"喜羊羊","11376":"公益","11291":"最终幻想14","11265":"手工","11259":"民乐","11212":"玩具","11208":"堂本刚","11142":"寂静岭","11109":"FIFA","11100":"荒野求生","10710":"黑暗料理","10699":"ARASHI","10657":"泰坦尼克号","10613":"跳舞机","10427":"歌姬计划","10387":"TVB","10384":"真三国无双","10325":"战神","10282":"容嬷嬷","10216":"中村悠一","10071":"植物大战僵尸","9969":"板绘","9962":"巨石强森","9955":"汪星人","9924":"怪盗基德","9920":"老虎","9887":"战锤","9826":"鬼泣4","9783":"迈克尔杰克逊","9711":"胡萝卜","9683":"关羽","9605":"幽灵公主","9600":"星座","9533":"冰箱","9505":"毛利兰","9500":"宅舞","9476":"鲁邦三世","9458":"高考数学","9435":"蜘蛛侠","9374":"HIPHOP","9366":"新番介绍","9264":"宇宙","9222":"英雄联盟","9177":"PHOTOSHOP","9145":"企鹅","8964":"哈利波特","8947":"贝爷","8892":"郭德纲","8881":"名侦探柯南","8876":"极限运动","8859":"考试","8816":"英语","8785":"钢铁侠","8740":"高考","8734":"耳机","8729":"极品飞车","8669":"麻婆豆腐","8564":"洛天依","8562":"中国风","8522":"布袋戏","8470":"狙击手","8422":"生化危机2","8401":"婚礼","8316":"飞机","8314":"指原莉乃","8259":"光之美少女","8227":"古风","8172":"健身操","8142":"激战2","8099":"SNL","8043":"中文翻唱","7993":"摇滚","7991":"张国荣","7976":"古墓丽影","7950":"成龙","7949":"三国杀","7944":"铃村健一","7849":"解放军","7782":"三国演义","7781":"新三国","7712":"白客","7678":"龙之谷","7634":"求生之路","7620":"豆腐","7583":"陈浩民","7501":"吴邪","7500":"张起灵","7457":"宫野真守","7384":"樱桃小丸子","7258":"街霸","7257":"中岛美雪","7205":"黑执事","7172":"吕布","7161":"妖精的尾巴","7158":"JOY","7114":"乐队","7074":"小提琴","7062":"精灵宝可梦","7029":"GMOD","7007":"手机","6947":"吱星人","6943":"萌宠","6942":"吃货","6888":"上古卷轴","6728":"超越","6694":"鹦鹉","6609":"舞台剧","6603":"求生之路2","6578":"计算机","6572":"旅游","6466":"阅兵","6453":"RPG","6446":"苏打绿","6348":"水果","6346":"原曲不使用","6332":"黑塔利亚","6225":"一方通行","6213":"显卡","6212":"CPU","6107":"李小龙","6106":"街头霸王","6088":"龙族","6052":"世界奇妙物语","6048":"乐高","6035":"蔡依林","6033":"堺雅人","6028":"模拟人生","6019":"洗衣机","5963":"火锅","5911":"福山润","5909":"诹访部顺一","5892":"生田斗真","5882":"死亡空间","5858":"命运石之门","5794":"美国","5784":"功夫","5783":"相声","5781":"刺客信条","5722":"千本樱","5663":"狮子王","5633":"鬼泣","5632":"电台","5597":"芒果","5590":"法律","5574":"街舞","5563":"国庆","5558":"死神","5555":"山下智久","5540":"正义联盟","5461":"路飞","5417":"科普","5401":"合金装备","5374":"虐杀原形","5341":"眼镜","5312":"机动战士高达SEED","5282":"卡卡西","5251":"科幻","5249":"神谷浩史","5220":"塞尔达传说","5216":"そらる","5195":"京剧","5192":"误解向","5152":"机械","5108":"魔卡少女樱","5069":"兔子","5033":"DNF","5023":"育碧","4968":"生化危机3","4958":"宝莲灯","4916":"黑客帝国","4890":"OST","4835":"荒野大镖客","4772":"费玉清","4759":"钉宫理惠","4747":"生化危机4","4672":"JOJO的奇妙冒险","4585":"坂田银时","4577":"OSU","4486":"泰罗奥特曼","4346":"脱口秀","4344":"健身","4306":"犬夜叉","4296":"宫崎骏","4274":"龙与虎","4248":"钓鱼","4200":"张学友","4199":"浪客剑心","4198":"海贼王","4187":"克苏鲁","4083":"花样滑冰","4072":"龙猫","4053":"博丽灵梦","4052":"梅西","3988":"武器","3986":"艾尔之光","3985":"EVE","3982":"LIA","3981":"恶魔城","3973":"泽野弘之","3965":"机动战士高达UC","3875":"逆转裁判","3828":"貂蝉","3737":"悠木碧","3620":"DIY","3569":"春晚","3553":"广播剧","3531":"星际争霸2","3504":"英国","3502":"空之境界","3492":"方言","3344":"家庭教师","3238":"GTA","3220":"上海话","3189":"俄罗斯","3185":"吉他","3151":"配音","3138":"勇者斗恶龙","3125":"南条爱乃","3086":"日语","3079":"警察","3023":"超级玛丽","3006":"模型","2999":"赛车","2968":"周杰伦","2953":"光环","2947":"特摄","2904":"GUMI","2902":"幽灵","2894":"阴阳师","2874":"JAZZ","2870":"铁血战士","2869":"异形","2861":"新海诚","2825":"DC","2810":"星球大战","2800":"绘画","2739":"演讲","2696":"反恐精英","2633":"印度","2630":"钢琴","2600":"大岛优子","2599":"渡边麻友","2598":"前田敦子","2592":"AKB48","2531":"SAI","2496":"铃木达央","2453":"IPAD","2383":"暴雪","2359":"水树奈奈","2355":"恋爱循环","2349":"游戏王","2337":"太鼓达人","2332":"杉田智和","2296":"魔兽世界","2259":"秒速五厘米","2231":"ASTRO","2199":"王宝强","2069":"假面骑士","2052":"西瓜","2027":"某科学的超电磁炮","1988":"方便面","1961":"灌篮高手","1951":"DOTA","1938":"国足","1885":"小野大辅","1833":"搞笑","1758":"漫才","1730":"粤语","1726":"轻音少女","1669":"萝卜","1654":"战地","1645":"声优","1630":"KAITO","1616":"螃蟹","1599":"红白机","1562":"喵星人","1555":"同人游戏","1552":"现代战争","1547":"便当","1546":"上条当麻","1541":"英雄","1520":"二胡","1476":"SABER","1462":"半条命","1429":"久石让","1426":"天空之城","1405":"阿凡达","1364":"科学","1356":"金坷垃","1339":"电脑","1338":"笔记本","1329":"十六夜咲夜","1311":"茄子","1281":"DJ","1257":"最终幻想","1246":"无主之地","1238":"魂斗罗","1210":"手绘","1172":"都市传说","1149":"花泽香菜","1141":"羊驼","1134":"KEY","1126":"MMD","1110":"冒险岛","1087":"使命召唤","1068":"柯南","1022":"蜡笔小新","1009":"任天堂","994":"新世纪福音战士","980":"高达","963":"奥特曼","959":"葛平","949":"仙剑奇侠传","930":"FC","882":"哆啦A梦","869":"我爱你","860":"日本","857":"短片","853":"蝙蝠侠","804":"LILY","803":"生化危机","788":"火星","776":"俄语","718":"魔法禁书目录","702":"蘑菇","678":"御坂美琴","674":"合金弹头","627":"同人音乐","610":"皮卡丘","608":"手书","597":"雾雨魔理沙","596":"上海","589":"哲学","584":"足球","564":"机器人","548":"泰语","547":"泰国","529":"说唱","516":"初音未来","513":"灰姑娘","483":"怪物猎人","442":"马里奥","436":"命令与征服","434":"键盘","426":"凉宫春日","416":"叶问","404":"CLANNAD","403":"红色警戒3","398":"周星驰","396":"麻将","391":"AMV","386":"翻唱","379":"古天乐","373":"演奏","372":"电吉他","368":"技术宅","366":"拳皇","364":"格斗","363":"MUGEN","342":"XBOX","341":"PS3","310":"德国","290":"VOCALOID","281":"MAD","254":"变形金刚","246":"RAP","232":"红色警戒","221":"历史","167":"猫和老鼠","166":"东方","133":"雷神","116":"韩国","112":"星际争霸","88":"COSPLAY","77":"偶像大师","68":"鬼畜","21":"万恶之源"}`)
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
    //设置频道推送的类型，热门还是以播放量亦或者最新
    setSort_type: function (typeStr) {
        util.setData("sort_type", typeStr);
    },
    //获取频道推送的类型，热门还是以播放量亦或者最新
    getSort_type: function () {
        const data = util.getData("sort_type");
        return data === undefined || data === null ? "hot" : data;//默认返回热门
    },
    /**
     *
     * @param id 频道id
     * @param typeStr 频道对应的排序类型
     * @param s 具体的内容
     */
    setOffset: function (id, typeStr, s) {
        if (this.data.offsetData[id] === undefined) {
            this.data.offsetData[id] = {};
        }
        this.data.offsetData[id][typeStr] = s;
    },
    /**
     * 偏移量
     * @param id 频道id
     * @param typeStr 频道对应的排序类型
     * @return {string|}
     */
    getOffset: function (id, typeStr) {
        const data = this.data.offsetData[id];
        if (data === undefined || data === null) {
            return "";
        }
        const tempData = data[typeStr];
        if (tempData === undefined || tempData === null) {
            return "";
        }
        return data[typeStr];
    },
    // 频道排行榜规则
    listRules: function () {
        let list = document.getElementsByClassName("rank-video-card");
        if (list.length !== 0 && frequencyChannel.startExtracted(list)) {
            Qmsg.info("屏蔽了视频！！");
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
            if (frequencyChannel.startExtracted(list)) {
                Qmsg.info("屏蔽了视频！！");
            }
            if (list.length === tempLength) {
                //Print.ln("页面元素没有变化了，故退出循环")
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
                    Print.ln("已点击展开列表并移除收起按钮")
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
            Print.ln("已调整频道界面的左右边距")
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
                Print.ln("已移除直播间顶部的信息（包括顶部标题栏）")
            } catch (e) {
                Print.ln("已移除直播间顶部的信息（包括顶部标题栏）-出错")
            }
            return;
        }
        if (rule.liveData.topLeftBar.length !== 0) {
            for (const element of rule.liveData.topLeftBar) {
                try {
                    document.getElementsByClassName(element)[0].remove();
                    Print.ln("已移除该项目=" + element)
                } catch (e) {
                    Print.ln("不存在该项目！=" + element)
                }
            }
        }
        if (rule.liveData.topLeftLogo) {
            document.getElementsByClassName("entry_logo")[0].remove();
            Print.ln("已移除左上角的b站直播logo信息")
        }
        if (rule.liveData.topLeftHomeTitle) {
            document.getElementsByClassName("entry-title")[0].remove();
            Print.ln("已移除左上角的首页项目")
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
                    Print.ln("已移除直播间头部的用户信息");
                } catch (e) {
                }
            }, 2000);
        }
    },
    //针对于直播间底部的屏蔽处理
    bottomElement: function () {
        document.getElementById("link-footer-vm").remove();
        Print.ln("已移除底部的页脚信息")
        if (rule.liveData.bottomElement) {
            document.getElementById("sections-vm").remove();
            Print.ln("已移除直播间底部的全部信息")
            return;
        }
        if (rule.liveData.bottomIntroduction) {
            document.getElementsByClassName("section-block f-clear z-section-blocks")[0].getElementsByClassName("left-container")[0].remove();
            Print.ln("已移除直播间底部的的简介和主播荣誉")
        } else {
            if (rule.liveData.liveFeed) {
                const interval = setInterval(() => {
                    try {
                        document.getElementsByClassName("room-feed")[0].remove();
                        clearInterval(interval)
                        Print.ln("已移除页面底部动态部分")
                    } catch (e) {
                    }
                }, 2500);
            }
        }
        if (rule.liveData.container) {
            document.getElementsByClassName("right-container")[0].remove();
            Print.ln("已移除直播间的主播公告")
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
                    Print.ln("移除立即上舰")
                }
            }, 2000);
        }
        if (rule.liveData.isGift) {
            const temp = setInterval(() => {
                const element = document.getElementsByClassName("gift-presets p-relative t-right")[0];
                if (element) {
                    element.remove();
                    clearInterval(temp);
                    Print.ln("移除礼物栏的的礼物部分")
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
                Qmsg.info("屏蔽了言论！！");
                continue;
            }
            if (remove.fanCard(v, fansMeda)) {
                Print.ln("已通过粉丝牌【" + fansMeda + "】屏蔽用户【" + userName + "】 言论=" + content);
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
                    Print.ln("移除直播间右侧的聊天布局")
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
                    Print.ln("已移除直播间右侧的聊天内容");
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
                    Print.ln("已移除聊天布局的系统提示")
                }
            }, 2000);
        }
        if (liveData.isEnterLiveRoomTip) {
            const interval = setInterval(() => {//移除右侧聊天内容中的用户进入房间提示
                try {
                    document.getElementById("brush-prompt").remove();
                    clearInterval(interval);
                    Print.ln("移除右侧聊天内容中的用户进入房间提示")
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
                    Print.ln("已移除2333娘")
                } catch (e) {
                }
            }, 2000);
        }
        if (liveData.isRightSuspenBotton) {
            const interval = setInterval(() => {
                try {
                    document.getElementsByClassName("side-bar-cntr")[0].remove();
                    Print.ln("已移除右侧悬浮靠边按钮-如实验-关注")
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
                    Print.ln("已移除直播水印")
                } catch (e) {
                }
            }, 2000);
        }
        if (liveData.isShoppingCartTip) {
            const interval = setInterval(() => {
                try {
                    document.getElementsByClassName("shop-popover")[0].remove();//是否移除提示购物车
                    clearInterval(interval);
                    Print.ln("已移除提示购物车")
                } catch (e) {
                }
            }, 2000);
        }
        if (liveData.isShoppingCart) {
            const interval = setInterval(() => {
                try {
                    document.getElementsByClassName("ecommerce-entry gift-left-part")[0].remove();//是否移除购物车
                    clearInterval(interval);
                    Print.ln("已移除购物车")
                } catch (e) {
                }
            }, 2000);
        }
        if (liveData.isDelbackground) {
            const interval = setInterval(() => {
                try {
                    document.getElementsByClassName("room-bg webp p-fixed")[0].remove(); //移除直播背景图
                    clearInterval(interval);
                    Print.ln("已移除直播背景图")
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
                Print.ln("已屏蔽直播分类为=" + type + " 的直播间 用户名=" + name + " 房间标题=" + title + " 人气=" + index)
                continue;
            }
            if (remove.name(v, name)) {
                Print.ln("已通过用户名=" + name + " 屏蔽直播间 直播分类=" + type + " 房间标题=" + title + " 人气=" + index)
                continue;
            }
            const nameKey = remove.nameKey(v, name);
            if (nameKey != null) {
                Print.ln("用户名=" + name + " 包含了=屏蔽词=" + nameKey + " 故屏蔽该直播间 分类=" + type + " 房间标题=" + title + " 人气=" + index)
                continue;
            }
            if (remove.titleKey(v, title)) {
                Print.ln("已通过直播间标题=【" + title + "】屏蔽该房间 用户名=" + name + " 分类=" + type + " 人气=" + index);
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
                if (shieldVideo_userName_uid_title(v, name, null, title, null, null, time)) {
                    Qmsg.info("屏蔽了视频！！");
                }
            }
            return;
        }
        for (let v of list) {
            //页面暂时没法获取uid，可能是我的技术问题，至少暂时先这样
            const title = v.getElementsByClassName("video-name")[0].textContent;//标题
            const name = v.getElementsByClassName("up-name__text")[0].textContent;//用户名
            const play = v.getElementsByClassName("play-text")[0].textContent.trim();//播放量
            //const like = v.getElementsByClassName("like-text")[0].textContent.trim();//弹幕量
            if (shieldVideo_userName_uid_title(v, name, null, title, null, play)) {
                Qmsg.info("屏蔽了视频！！");
            }
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
            uid: util.getSubUid(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1)),
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
                    v.remove();
                    continue;
                }
                const videoTime = v.getElementsByClassName("bili-video-card__stats__duration")[0].textContent;//视频的时间
                const topInfo = v.getElementsByClassName("bili-video-card__stats--left")[0].getElementsByClassName("bili-video-card__stats--item");//1播放量2弹幕数
                let id = upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1);
                if (shieldVideo_userName_uid_title(v, name, id, title, null, videoTime, topInfo[0].textContent)) {
                    Qmsg.info("屏蔽了视频！！");
                    continue;
                }
                v.onmouseenter = (e) => {
                    const data = search.getDataV(e.srcElement);
                    util.showSDPanel(e, data.name, data.uid);
                };
            } catch (e) {
                v.remove();
                //console.log("错误信息=" + e + " 删除该元素" + v)
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
                if (startPrintShieldNameOrUIDOrContent(v, name, uid, content)) {
                    Qmsg.info("屏蔽了言论！！");
                }
                continue;
            }//如果内容是视频样式
            const videoInfo = info.getElementsByClassName("bili-dyn-card-video")[0];
            const videoTime = videoInfo.getElementsByClassName("bili-dyn-card-video__duration")[0].textContent;
            const title = videoInfo.getElementsByClassName("bili-dyn-card-video__title bili-ellipsis")[0].textContent;
            if (shieldVideo_userName_uid_title(v, name, uid, title, null, videoTime, null)) {
                Qmsg.info("屏蔽了视频！！");
            }
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
                    Print.ln("已调整动态界面布局");
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
                        Print.ln("已移除右侧布局并调整中间动态容器布局宽度")
                    } catch (e) {
                    }
                }, 1000);
                return;
            }
            if (trendsData.isBiliDynBanner) {
                const interval = setInterval(() => {
                    try {
                        document.getElementsByClassName("bili-dyn-banner")[0].style.display = "none";
                        Print.ln("已移除公告栏布局")
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
            #gridLayout button{
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
              #sort_typeSelect{
               display: none;
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
                <option value="checkTheIngredients">查成分</option>
              </select>
              <div>
                <select id="singleDoubleModel">
                  <option value="one">单个</option>
                  <option value="batch">批量</option>
                </select>
              </div>
              <input style="width: 42.5%;height: 20px;" type="text" id="inputModel"  maxlength="50"/>
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
                <button id="printRuleBut">打印规则信息</button>
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
              <hr>
              <h3>首页推荐视频</h3>
              <span>指定推送</span>
              <select id="pushTypeSelect">
                <option value="分区">分区</option>
                <option value="频道">频道</option>
              </select>
               <select id="sort_typeSelect">
                <option value="hot">近期热门</option>
                <option value="view">播放最多（近30天投稿）</option>
                <option value="new">最新投稿</option>
              </select>
              <select id="video_zoneSelect">
                <option value="1">下拉选择</option>
              </select>
              <button id="okButton">确定</button>
              <div>
               id<input type="checkbox" id="isIdCheckbox"><input type="text" placeholder="查询的类型关键词" id="typeInput">
               <button id="findButon">查询</button>
             </div>
             <hr>
              </div>
              <h3>播放画面翻转</h3>
             <button id="flipHorizontal">水平翻转</button>
             <button id="flipVertical">垂直翻转</button>
             <div>
              自定义角度
              <input id="axleRange" type="range" value="0" min="0" max="360" step="1"><span id="axleSpan">0%</span>
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
             <div>
              <button id="butClearMessage">清空信息</button>
              二次确认
              <input type="checkbox" checked="checked">
            </div>
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
          <span>按钮跟随鼠标</span>
          <input id="quickLevitationShield" type="checkbox">
        </div>
        <p>
          标题:
          <span id="suspensionTitle"></span>
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
        <button id="findUserInfo">查询基本信息</button>
        <button id="findUserComposition" title="通过最近动态和关注列表进行判断">查成分</button>
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
                    Qmsg.info("屏蔽了言论！！");
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
                        Qmsg.info("屏蔽了言论！！");
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
                        Print.ln(`已通过标题黑名单关键词屏蔽【${isTitle}】标题【${title}】`);
                        q.remove();
                        continue;
                    }
                    const isTitleCanonical = shield.arrContentCanonical(localData.getArrTitleKeyCanonical(), title);
                    if (isTitleCanonical != null) {
                        Print.ln(`已通过标题正则黑名单关键词屏蔽【${isTitleCanonical}】标题【${title}】`);
                        q.remove();
                    }
                }
            }
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/wbi/search/type?")) {//搜索界面
            Qmsg.info("检测到搜索的接口");
            //search.searchRules();
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
            Print.ln("已通过uid【" + uid + "】，屏蔽用户【" + name + "】，专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
            continue;
        }
        if (remove.name(v, name)) {
            Print.ln("已通过黑名单用户【" + name + "】，屏蔽处理，专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
            continue;
        }
        const isNameKey = remove.nameKey(v, name);
        if (isNameKey != null) {
            Print.ln("用户【" + name + "】的用户名包含屏蔽词【" + isNameKey + "】 故进行屏蔽处理 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid)
            continue;
        }
        const isTitleKey = remove.titleKey(v, title);
        if (isTitleKey != null) {
            Print.ln("通过标题关键词屏蔽用户【" + name + "】 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
            continue;
        }
        const titleKeyCanonical = remove.titleKeyCanonical(v, title);
        if (titleKeyCanonical != null) {
            Print.ln(`通过标题正则表达式=【${titleKeyCanonical}】屏蔽用户【${name}】专栏预览内容=${textContent} 用户空间地址=https://space.bilibili.com/${uid}`);
            continue;
        }
        const key = remove.columnContentKey(v, textContent);
        if (key !== null) {
            Print.ln("已通过专栏内容关键词【" + key + "】屏蔽用户【" + name + "】 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
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
                const list = document.getElementsByClassName("col_xs_1_5 col_md_2 col_xl_1_7 mb_x40");
                const tempListLength = list.length;
                search.searchRules(list);
                if (tempListLength === list.length) {
                    clearInterval(interval);
                    //Print.ln("页面元素没有变化，故退出循环")
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
        return;
    }
    if (href.includes("www.bilibili.com/v/")) {
        home.startShieldMainVideo("bili-video-card");
        console.log("通过URL变动执行屏蔽首页分区视频");
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


/**
 * 加载下拉框中的分区
 */
function loadPartition() {
    const tempVar = home.data.video_zoneList;
    for (const v in tempVar) {
        $("#video_zoneSelect").append(`<option value=${v}>${tempVar[v]}</option>`);
    }
}

/**
 * 加载下拉框中的频道信息
 */
function loadChannel() {
    const list = frequencyChannel.data.channel_idList;
    for (const v in list) {
        $("#video_zoneSelect").append(`<option value=${v}>${list[v]}</option>`);
    }
}


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

    util.suspensionBall(document.getElementById("suspensionDiv"));


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
        Print.ln("已保存播放速度数据=" + val);
    });

    $("#preservePlaySpeed").click(() => {//保存拖动条中的值的播放数据
        const val = $("#rangePlaySpeed").val();
        util.setData("rangePlaySpeed", parseFloat(val));
        Print.ln("已保存播放速度数据=" + val);
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
    $("#findUserInfo").click(() => {
        const uid = $("#uidSuspensionDiv").text();
        if (uid === "") {
            Qmsg.error("未检测到UID！")
            return;
        }
        const loading = Qmsg.loading("正在获取中！");
        HttpUtil.get(`https://api.bilibili.com/x/web-interface/card?mid=${uid}&photo=false`, (res) => {
            const body = JSON.parse(res.responseText);
            if (body["code"] !== 0) {
                Qmsg.error("请求失败！");
                loading.close();
                return;
            }
            loading.close();
            const cradInfo = body["data"]["card"];
            const uid = cradInfo["mid"];//uid
            const sex = cradInfo["sex"];//性别
            const userName = cradInfo["name"];
            const fans = cradInfo["fans"];//粉丝数
            const sign = cradInfo["sign"];//个性签名信息
            const face = cradInfo["face"];//头像
            const current_level = cradInfo["level_info"]["current_level"];//当前用户b站等级
            const friend = cradInfo["friend"];//关注量
            const follower = body["data"]["follower"];//粉丝量
            const like_num = body["data"]["like_num"];//点赞量
            const userCardHtml = htmlStr.getUserCard(uid, userName, current_level, sign, face, friend, follower, like_num);
            if ($("#popDiv").length === 0) {
                $("body").append(userCardHtml);
            } else {
                $("#popDiv").remove();
                $("body").append(userCardHtml);
            }
            $("#popDiv").css("display", "inline");
        });
    });
    $("#findUserComposition").click(() => {
        const uid = $("#uidSuspensionDiv").text();
        if (uid === "") {
            Qmsg.error("未检测到UID！")
            return;
        }
        const loading = Qmsg.loading("正在获取中！");
        HttpUtil.get("https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?&host_mid=" + uid, (res) => {//根据动态
            const body = JSON.parse(res.responseText);
            if (body["code"] === undefined || body["code"] !== 0) {
                loading.close();
                Qmsg.error("获取数据失败！");
                return;
            }
            const arrList = body["data"]["items"];
            if (arrList === undefined || arrList === null || arrList.length === 0) {
                Qmsg.error("该用户获取不到动态！");
                loading.close();
                return;
            }
            loading.close();
            for (const v of arrList) {
                const stringify = JSON.stringify(v);
                if (!stringify.includes("原神")) {
                    continue;
                }
                Qmsg.success("查询当前用户动态有原神关键词！");
                return;
            }
            Qmsg.error("未查询到指定类型的动态信息!");
        }, (err) => {
            loading.clone();
            Qmsg.error("请求失败=" + err);
        });
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
        Print.ln("已设置" + name + "的值");
    });

    $("#butClearMessage").click(() => {
        if ($("#butClearMessage+input:first").is(":checked")) {
            if (!confirm("是要清空消息吗？")) {
                return;
            }
        }
        document.querySelector('#outputInfo').innerHTML = '';
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
    });


    $("#printRuleBut").click(() => {
        Print.ln(util.getRuleFormatStr());
    });


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


    const tempPushTypeSelect = $('#pushTypeSelect');
    tempPushTypeSelect.change(() => {//监听模式下拉列表--下拉列表-指定推送类型-分区亦或者频道
        const tempVar = tempPushTypeSelect.val();
        const tempSortTypeSelect = $("#sort_typeSelect");
        $("#video_zoneSelect>option:not(:first)").remove();//清空下拉选择器内的元素（除第一个）
        if (tempVar === "分区") {
            loadPartition();
            tempSortTypeSelect.css("display", "none");
            return;
        }
        tempSortTypeSelect.css("display", "inline");
        tempSortTypeSelect.val(frequencyChannel.getSort_type());
        loadChannel();
    });

    const tempVideoZoneSelect = $('#video_zoneSelect');
    $("#okButton").click(() => {//确定首页指定推送视频
        const pushType = $("#pushTypeSelect").val();
        const selectVar = parseInt(tempVideoZoneSelect.val());
        home.setPushType(pushType);
        if (pushType === "分区") {
            Print.ln("选择了分区" + home.data.video_zoneList[selectVar] + " uid=" + selectVar);
            localData.setVideo_zone(selectVar);
        } else {
            const tempSortTypeSelect = $("#sort_typeSelect");
            const tempVar = tempSortTypeSelect.val();
            Print.ln("选择了" + tempSortTypeSelect.text() + "的频道" + frequencyChannel.data.channel_idList[selectVar] + " uid=" + selectVar);
            frequencyChannel.setChannel_id(selectVar);
            frequencyChannel.setSort_type(tempVar)
        }
        alert("已设置！")
    });

    const tempIdCheckbox = $("#isIdCheckbox");
    const temoTypeInput = $("#typeInput");
    tempIdCheckbox.click(() => {//切换首页推送视频编辑框输入类型
        if (tempIdCheckbox.is(":checked")) {
            temoTypeInput.attr("type", "number");
        } else {
            temoTypeInput.attr("type", "text");
        }
    });
    $("#findButon").click(() => {
        const tempContent = temoTypeInput.val();

        function tempFunc(typeStr, tempContent) {
            const list = typeStr === "分区" ? home.data.video_zoneList : frequencyChannel.data.channel_idList;
            if (tempIdCheckbox.is(":checked")) {//通过ID方式查找
                if (tempContent in list) {
                    tempVideoZoneSelect.val(tempContent);
                    Print.ln(`通过ID方式找到该值！=${list[tempContent]}`);
                    return;
                }
            } else {
                for (let v in list) {//通过遍历字典中的value，该值包含于tempContent时成立
                    if (!list[v].includes(tempContent)) {
                        continue;
                    }
                    tempVideoZoneSelect.val(v);
                    Print.ln(`通过value找到该值！=${tempContent}`);
                    return;
                }
            }
            Qmsg.error("未找到该值！");
        }

        if (tempPushTypeSelect.val() === "分区") {
            tempFunc("分区", tempContent);
        } else {
            tempFunc("频道", tempContent);
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
                    Print.ln("已设置播放器的速度=" + data);
                }

                setVideoSpeedInfo();
                videoElement.addEventListener('ended', () => {//播放器结束之后事件
                    Print.ln("播放结束");
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
                    Print.ln("已移除页脚信息")
                    clearInterval(interval02);
                }
            }, 2000);
            if (rule.liveData.rightSuspendButton) {
                const interval = setInterval(() => {
                    const classNameElement = document.getElementsByClassName("live-sidebar-ctnr a-move-in-left ts-dot-4")[0];
                    if (classNameElement) {
                        clearInterval(interval);
                        classNameElement.remove();
                        Print.ln("已移除直播首页右侧的悬浮按钮");
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
            Print.ln("已删除搜索底部信息和右侧悬浮按钮")
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
                if (tempFunc(author_id, title, author_name, bvid, duration, "", view_count, danmaku === undefined ? 0 : danmaku, cover)) {
                    Qmsg.info("过滤了视频！！");
                }
            }
        };

        //加载频道视频数据
        function loadingVideoZE() {
            const tempChannelId = frequencyChannel.getChannel_id();
            const tempSortType = frequencyChannel.getSort_type();//频道推送的类型，热门还是以播放量亦或者最新
            const tempOffset = frequencyChannel.getOffset(tempChannelId, tempSortType);//视频列表偏移量
            const loading = Qmsg.loading("正在加载数据！");
            HttpUtil.get(`https://api.bilibili.com/x/web-interface/web/channel/multiple/list?channel_id=${tempChannelId}&sort_type=${tempSortType}&offset=${tempOffset}&page_size=30`, function (res) {
                const body = JSON.parse(res.responseText);//频道页一次最多加载30条数据
                if (body["code"] !== 0) {
                    alert("未获取到频道视频数据");
                    loading.close();
                    return;
                }
                const bodyList = body["data"]["list"];
                $(".container.is-version8").html("");
                if (tempOffset === "" && tempSortType === "hot") {
                    ergodicList(bodyList[0]["items"]);
                    ergodicList(bodyList.slice(1));
                } else {
                    ergodicList(bodyList);
                }
                frequencyChannel.setOffset(tempChannelId, tempSortType, body["data"]["offset"]);
                loading.close();
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
                Print.video("yellow", "已通过UID屏蔽", userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`)
                return true;
            }
            const isNameKey = shield.arrContent(localData.getArrNameKey(), userName);
            if (isNameKey != null) {
                Print.video(null, `已通过用户名模糊屏蔽规则【${isNameKey}】`, userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`)
                return true;
            }
            const isTitleKey = shield.arrContent(localData.getArrTitle(), videoTitle);
            if (isTitleKey != null) {
                Print.video("#66CCCC", `已通过标题模糊屏蔽规则=【${isTitleKey}】`, userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`);
                return true;
            }
            const isTitleKeyCanonical = shield.arrContentCanonical(localData.getArrTitleKeyCanonical(), videoTitle);
            if (isTitleKeyCanonical != null) {
                Print.video("#66CCCC", `已通过标题正则表达式屏蔽规则=${isTitleKeyCanonical}`, userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`);
                return true;
            }
            $(".container.is-version8").append(
                addElement.homeVideoE.getHtmlStr(
                    videoTitle, "https://www.bilibili.com/" + bvid, pic, uid, userName, duration, ctimeStr,
                    view, danmaku)
            );
            home.startShieldMainVideo("bili-video-card is-rcmd");
            $("div[class='bili-video-card is-rcmd']:last").mouseenter((e) => {
                const domElement = e.delegateTarget;//dom对象
                const title = domElement.querySelector(".bili-video-card__info--tit").textContent;
                const userInfo = domElement.querySelector(".bili-video-card__info--owner");
                const userHref = userInfo.href;
                const uerName = domElement.querySelector(".bili-video-card__info--author").textContent;
                util.showSDPanel(e, uerName, userHref.substring(userHref.lastIndexOf("/") + 1), title);
            });
        }

        //加载分区视频数据
        function loadingVideoE(ps) {
            const loading = Qmsg.loading("正在加载数据！");
            HttpUtil.get(`https://api.bilibili.com/x/web-interface/dynamic/region?ps=${ps}&rid=${localData.getVideo_zone()}`, function (res) {
                const bodyJson = JSON.parse(res.responseText);
                if (bodyJson["code"] !== 0) {
                    alert("未获取到视频数据！");
                    loading.close();
                    return;
                }
                const archives = bodyJson["data"]["archives"];
                $(".container.is-version8").html("");
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
                    if (tempFunc(uid, videoTitle, name, bvid, duration, util.formateTime(ctimeStr), view, danmaku, picUil)) {
                        Qmsg.info("过滤了视频！！");
                    }
                }
                loading.close();
            });
        }


        $(".recommended-container_floor-aside").prepend(`<div style="display: flex; flex-direction: row-reverse">
<button class="primary-btn roll-btn" id="replaceItBut" style="  height: 38px;position: fixed;    z-index: 100; background-color: #17181A; "><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style="--darkreader-inline-fill:currentColor;" data-darkreader-inline-fill=""><path d="M8.624933333333333 13.666666666666666C8.624933333333333 14.011849999999999 8.345125 14.291666666666666 7.999933333333333 14.291666666666666C4.525166666666666 14.291666666666666 1.7082933333333332 11.474791666666665 1.7082933333333332 8C1.7082933333333332 6.013308333333333 2.629825 4.2414233333333335 4.066321666666667 3.089385C4.335603333333333 2.8734283333333335 4.728959999999999 2.9166533333333335 4.944915 3.1859349999999997C5.160871666666666 3.4552099999999997 5.1176466666666665 3.848573333333333 4.848366666666666 4.0645283333333335C3.694975 4.98953 2.9582933333333328 6.40852 2.9582933333333328 8C2.9582933333333328 10.784416666666667 5.215528333333333 13.041666666666666 7.999933333333333 13.041666666666666C8.345125 13.041666666666666 8.624933333333333 13.321483333333333 8.624933333333333 13.666666666666666zM11.060475 12.810558333333333C10.844225000000002 12.541558333333331 10.887033333333335 12.148125 11.156041666666667 11.931875C12.306858333333333 11.006775 13.041599999999999 9.589424999999999 13.041599999999999 8C13.041599999999999 5.215561666666666 10.784408333333332 2.958333333333333 7.999933333333333 2.958333333333333C7.6548083333333325 2.958333333333333 7.374933333333333 2.6785083333333333 7.374933333333333 2.333333333333333C7.374933333333333 1.9881533333333332 7.6548083333333325 1.7083333333333333 7.999933333333333 1.7083333333333333C11.474725000000001 1.7083333333333333 14.291599999999999 4.525206666666667 14.291599999999999 8C14.291599999999999 9.984108333333333 13.372483333333332 11.753958333333332 11.939225 12.906125C11.670166666666663 13.122375 11.276725 13.079625 11.060475 12.810558333333333z" fill="currentColor" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"></path><path d="M1.375 3.4130866666666666C1.375 3.0679066666666666 1.654825 2.7880866666666666 2 2.7880866666666666L4.333333333333333 2.7880866666666666C4.862608333333333 2.7880866666666666 5.291666666666666 3.2171449999999995 5.291666666666666 3.7464199999999996L5.291666666666666 6.079753333333334C5.291666666666666 6.424928333333334 5.011841666666666 6.704736666666666 4.666666666666666 6.704736666666666C4.321491666666667 6.704736666666666 4.041666666666666 6.424928333333334 4.041666666666666 6.079753333333334L4.041666666666666 4.038086666666667L2 4.038086666666667C1.654825 4.038086666666667 1.375 3.7582616666666664 1.375 3.4130866666666666z" fill="currentColor" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"></path><path d="M14.625 12.5864C14.625 12.931591666666666 14.345183333333333 13.2114 14 13.2114L11.666666666666666 13.2114C11.137408333333335 13.2114 10.708333333333332 12.782383333333332 10.708333333333332 12.253066666666665L10.708333333333332 9.919733333333333C10.708333333333332 9.574608333333334 10.98815 9.294733333333333 11.333333333333332 9.294733333333333C11.678516666666667 9.294733333333333 11.958333333333332 9.574608333333334 11.958333333333332 9.919733333333333L11.958333333333332 11.9614L14 11.9614C14.345183333333333 11.9614 14.625 12.241275000000002 14.625 12.5864z" fill="currentColor" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"></path></svg>
<span>换一换</span></button>
</div>`);

        $("#replaceItBut").click(() => {
            const temp = home.getPushType();
            if (home.videoIndex <= 50 && temp === "分区") {
                home.videoIndex += 10;
            }
            if (temp === "分区") {
                loadingVideoE(home.videoIndex);
            } else {
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
            setTimeout(() => {
                $(".feed-roll-btn").remove();//移除换一换
                console.log("移除换一换");
            }, 1500);
        }, 100);
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