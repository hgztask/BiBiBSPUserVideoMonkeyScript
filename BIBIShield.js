// ==UserScript==
// @name         b站屏蔽增强器
// @namespace    http://tampermonkey.net/
// @license      MIT
// @version      1.1.49
// @description  支持动态屏蔽、评论区过滤屏蔽，视频屏蔽（标题、用户、uid等）、蔽根据用户名、uid、视频关键词、言论关键词和视频时长进行屏蔽和精简处理(详情看脚本主页描述)，针对github站内所有的链接都从新的标签页打开，而不从当前页面打开
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

const Rule = {
    ruleLength: function () {
        function setText(arr, id) {
            if (arr !== undefined && arr !== null) {
                $(id).text(arr.length);
            }
        }

        setText(LocalData.getArrName(), "#textUserName");
        setText(LocalData.getArrNameKey(), "#textUserNameKey");
        setText(LocalData.getArrUID(), "#textUserUID");
        setText(LocalData.getArrWhiteUID(), "#textUserBName");
        setText(LocalData.getArrTitle(), "#textUserTitle");
        setText(LocalData.getArrTitleKeyCanonical(), "#textUserTitleCanonical");
        setText(Util.getData("commentOnKeyArr"), "#textContentOn");
        setText(LocalData.getArrContentOnKeyCanonicalArr(), "#textContentOnCanonical");
        setText(LocalData.getFanCardArr(), "#textFanCard");
        setText(LocalData.getContentColumnKeyArr(), "#textColumn");
        setText(LocalData.getDynamicArr(), "#textDynamicArr");
    },
    showInfo: function () {
        const isDShielPanel = Util.getData("isDShielPanel");
        const isAutoPlay = Util.getData("autoPlay");
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
        const pushType = Home.getPushType();
        pushTypeSelect.val(pushType);
        switch (pushType) {
            case "频道":
                const tempSortTypeSelect = $("#sort_typeSelect");
                const tempSortType = frequencyChannel.getSort_type();
                loadChannel();
                videoZoneSelect.val(frequencyChannel.getChannel_id());
                tempSortTypeSelect.val(tempSortType);
                tempSortTypeSelect.css("display", "inline")
                break;
            default:
                loadPartition();
                videoZoneSelect.val(LocalData.getVideo_zone());
                break;
        }
        $("#delVideoCommentSectionsCheackBox").prop('checked', LocalData.getDelVideoCommentSections());//设置
        $("#openPrivacyModeCheckbox").prop("checked", LocalData.getPrivacyMode());
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
const Home = {
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
        const data = Util.getData("pushType");
        if (data === null || data === undefined) {
            return "分区";
        }
        return data;
    },
    setPushType: function (key) {
        Util.setData("pushType", key);
    },
    getBackgroundStr: function () {
        return Util.getRGBA(this.background.r, this.background.g, this.background.b, this.background.a);
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
            let list = document.querySelectorAll(str);
            if (list.length === 0) {
                return;
            }
            while (true) {
                const tempLength = list.length;
                for (let v of list) {
                    let videoInfo, title, upName, upSpatialAddress, videoTime, playbackVolume;//可以一排定义
                    try {
                        videoInfo = v.querySelector(".bili-video-card__info--right");
                        //视频标题
                        title = videoInfo.querySelector(".bili-video-card__info--tit").getAttribute("title");
                        //用户名
                        upName = videoInfo.querySelector(".bili-video-card__info--author").getAttribute("title");
                        //用户空间地址
                        upSpatialAddress = videoInfo.querySelector(".bili-video-card__info--owner").getAttribute("href");
                        videoTime = v.querySelector(".bili-video-card__stats__duration").textContent;//视频的时间
                        const topInfo = v.querySelectorAll(".bili-video-card__stats--left .bili-video-card__stats--item");//1播放量2弹幕数
                        playbackVolume = topInfo[0].textContent;
                    } catch (e) {
                        v.remove();
                        Qmsg.info("清理异常元素");
                        // console.log("获取元素中，获取失败，下一行是该值的html");
                        // console.log(v)
                        continue;
                    }
                    let id = parseInt(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1));
                    if (isNaN(id)) {
                        v.remove();
                        Qmsg.info("清理非正常视频样式");
                        continue;
                    }
                    if (shieldVideo_userName_uid_title(v, upName, id, title, null, videoTime, playbackVolume)) {
                        Qmsg.info("屏蔽视频！");
                        continue;
                    }
                    const jqE = $(v);
                    if (Util.isEventJq(jqE, "mouseover")) {
                        continue;
                    }
                    jqE.mouseenter((e) => {
                        const domElement = e.delegateTarget;//dom对象
                        const info = domElement.querySelector(".bili-video-card__info--right");
                        const videoTitle = info.querySelectorAll("[title]")[0].textContent;
                        const userName = info.querySelectorAll("[title]")[1].textContent;
                        let href = info.querySelector(".bili-video-card__info--owner").href;
                        href = href.substring(href.lastIndexOf("/") + 1);
                        Util.showSDPanel(e, userName, href, videoTitle);
                    });
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

const Live = {
    shield: function (list) {
        for (let v of list) {
            const userName = v.getAttribute("data-uname");
            const uid = v.getAttribute("data-uid");
            const content = v.getAttribute("data-danmaku");
            let fansMeda = "这是个个性粉丝牌子";
            try {
                fansMeda = v.querySelector(".fans-medal-content").text;
            } catch (e) {
            }
            if (startPrintShieldNameOrUIDOrContent(v, userName, uid, content)) {
                Qmsg.info("屏蔽了言论！！");
                continue;
            }
            if (Remove.fanCard(v, fansMeda)) {
                Print.ln("已通过粉丝牌【" + fansMeda + "】屏蔽用户【" + userName + "】 言论=" + content);
                continue;
            }
            const jqE = $(v);
            if (Util.isEventJq(jqE, "mouseover")) {
                continue;
            }
            jqE.mouseenter((e) => {
                const domElement = e.delegateTarget;//dom对象
                const name = domElement.getAttribute("data-uname");
                const uid = domElement.getAttribute("data-uid");
                Util.showSDPanel(e, name, uid);
            });
        }
    }
};


/**
 * 判断内容是否匹配上元素
 */
const Shield = {
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
const Remove = {
    //是否是白名单用户
    isWhiteUserUID: function (uid) {
        const tempArr = LocalData.getArrWhiteUID();
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
        if (Shield.arrKey(LocalData.getArrUID(), parseInt(uid))) {
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
        if (Shield.arrKey(LocalData.getArrName(), name)) {
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
        const shieldArrContent = Shield.arrContent(LocalData.getArrNameKey(), name);
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
        const shieldArrContent = Shield.arrContent(LocalData.getArrTitle(), title);
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
        const canonical = Shield.arrContentCanonical(LocalData.getArrTitleKeyCanonical(), title);
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
        const shieldArrContent = Shield.arrContent(Util.getData("commentOnKeyArr"), content);
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
        const shieldArrContent = Shield.arrContent(element, LocalData.getContentColumnKeyArr(), content);
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
        if (Shield.arrKey(LocalData.getFanCardArr(), key)) {
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
        const min = Rule.videoData.filterSMin;
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
        const max = Rule.videoData.filterSMax;
        if (max === 0 || max < Rule.videoData.filterSMin || max === null) {//如果最大值为0，则不需要执行了，和当最小值大于最大值也不执行
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
        const min = Rule.videoData.broadcastMin;
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
        const max = Rule.videoData.broadcastMax;
        if (max === 0 || max < Rule.videoData.broadcastMin || max === null) {//如果最大值为0，则不需要执行了，和当最小值大于最大值也不执行
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
        if (Rule.videoData.barrageQuantityMin > key) {
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
        const max = Rule.videoData.barrageQuantityMax;
        if (max === 0 || Rule.videoData.barrageQuantityMin > max) {
            return false;
        }
        if (max > key) {
            element.remove();
            return true;
        }
        return false;
    }
}


/**
 * 根据规则删除专栏和动态的评论区
 * 针对于专栏和动态内容下面的评论区
 */
function delDReplay() {
    const interval = setInterval(() => {
        const list = document.querySelectorAll(".comment-list.has-limit>*");
        if (list.length === 0) {
            return;
        }
        clearInterval(interval);
        for (let v of list) {
            const rootUserinfo = v.querySelector(".user>.name");
            const rootName = rootUserinfo.textContent;
            const rootUid = rootUserinfo.getAttribute("data-usercard-mid");
            const rootContent = v.querySelector(".text").textContent;
            if (startPrintShieldNameOrUIDOrContent(v, rootName, parseInt(rootUid), rootContent)) {
                Qmsg.info("屏蔽了言论！！");
                continue;
            }
            const jqE = $(rootUserinfo);
            if (!Util.isEventJq(jqE, "mouseover")) {
                jqE.mouseenter((e) => {
                    const domElement = e.delegateTarget;//dom对象
                    const name = domElement.textContent;
                    const uid = domElement.getAttribute("data-usercard-mid");
                    Util.showSDPanel(e, name, uid);
                });
            }
            const replyItem = v.querySelectorAll(".reply-box>.reply-item.reply-wrap");//楼层成员
            if (replyItem.length === 0) {
                continue;
            }
            for (let j of replyItem) {
                const subUserInfo = j.querySelector(".user>.name");
                const subName = subUserInfo.textContent;
                const subUid = subUserInfo.getAttribute("data-usercard-mid");
                const subContent = j.querySelector(".text-con").textContent;
                if (startPrintShieldNameOrUIDOrContent(j, subName, parseInt(subUid), subContent)) {
                    Qmsg.info("屏蔽了言论！！");
                    continue;
                }
                const jqE = $(j);
                if (Util.isEventJq(jqE, "mouseover")) {
                    continue;
                }
                jqE.mouseenter((e) => {
                    const domElement = e.delegateTarget;//dom对象
                    const name = domElement.querySelector(".name").textContent;
                    const uid = domElement.querySelector("a").getAttribute("data-usercard-mid");
                    Util.showSDPanel(e, name, uid);
                });
            }
        }
    }, 60);
}


const HttpUtil = {
    httpRequest: function (method, url, headers, resolve, reject) {
        let tempHraders = {
            "User-Agent": navigator.userAgent
        };
        if (headers !== null || headers !== undefined) {
            tempHraders = Object.assign({}, tempHraders, headers)
        }
        Util.httpRequest({
            method: method,
            url: url,
            headers: tempHraders,
            onload: resolve,
            onerror: reject
        });
    },
    httpRequestPost: function (url, data, headers, resolve, reject) {
        let temp = {
            "Content-Type": "application/json"
        };
        if (headers !== null || headers !== undefined) {
            temp = headers;
        }
        Util.httpRequest({
            method: "POST",
            url: url,
            headers: temp,
            data: JSON.stringify(data),
            onload: resolve,
            onerror: reject
        });

    },
    post: function (url, data, headers, resolve, reject) {

        if (headers === null) {
            this.httpRequest("POST", url, tempOld, resolve, reject);
            return;
        }

        this.httpRequest("POST", url, headers, resolve, reject);
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
        this.httpRequest("get", url, {
            "User-Agent": navigator.userAgent,
            "cookie": cookie
        }, resolve, reject);
    },
    /**
     * 发送请求获取视频的基本信息
     * @param {string|number}bvOrAv
     * @param {function}resolve
     * @param {function}reject
     */
    getVideoInfo: function (bvOrAv, resolve, reject) {
        let url = "https://api.bilibili.com/x/player/pagelist?";
        if (bvOrAv + "".startsWith("BV")) {
            url = url + "bvid=" + bvOrAv;//需要带上BV号
        } else {
            url = url + "aid=" + bvOrAv;//不需要带上AV号
        }
        this.get(url, resolve, reject);
    },
    /**
     * 发送请求获取直播间基本信息
     * @param id 直播间房间号
     * @param resolve
     * @param reject
     */
    getLiveInfo: function (id, resolve, reject) {
        this.get("https://api.live.bilibili.com/room/v1/Room/get_info?room_id=" + id, resolve, reject);
    },
    /**
     * 获取用户关注的用户直播列表
     * @param cookie
     * @param page 页数，每页最多29个
     * @param resolve
     * @param reject
     */
    getUsersFollowTheLiveList: function (cookie, page, resolve, reject) {
        this.getCookie(`https://api.live.bilibili.com/xlive/web-ucenter/user/following?page=${page}&page_size=29`, cookie, resolve, reject);
    },
    /**
     * 获取指定分区下的用户直播列表
     * @param parent_id 父级分区
     * @param id 子级分区
     * @param page 页数
     * @param sort 排序-如综合或者最新，最新live_time 为空着综合
     */
    getLiveList: function (parent_id, id, page, sort, resolve, reject) {
        //https://api.live.bilibili.com/xlive/web-interface/v1/second/getList?platform=web&parent_area_id=3&area_id=0&sort_type=sort_type_121&page=3
        this.get(`https://api.live.bilibili.com/xlive/web-interface/v1/second/getList?platform=web&parent_area_id=${parent_id}&area_id=${id}&sort_type=${sort}&page=${page}`, resolve, reject);
    }
};


const HtmlStr = {
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
      <img src="http://i0.hdslb.com/bfs/space/768cc4fd97618cf589d23c2711a1d1a729f42235.png@750w_240h.webp" alt=""/>
      <img src="${image}@96w_96h.webp" alt="头像" style="width: 48px; height: 48px; border-radius: 50%" />
      <div class="info">
      <p class="user"><a class="name" style=" color: rgb(251, 114, 153); --darkreader-inline-color: #fb6b94;" href="//space.bilibili.com/${uid}" target="_blank"data-darkreader-inline-color="">${userName}</a>
          <a href="//www.bilibili.com/html/help.html#k_${level}" target="_blank">
          <img class="level"src="//s1.hdslb.com/bfs/seed/jinkela/commentpc/static/img/ic_user level_6.64b9440.svg" alt=""/>
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
    },
    /**
     * 获取直播列表布局
     */
    getLiveList: function (typeTitle) {
        return $(`<div class="bili-dyn-live-users">
        <div class="bili-dyn-live-users__header">
            <div class="bili-dyn-live-users__title">
                ${typeTitle}(<span>0</span>)<!--直播人数-->
            </div>
        </div>
        <hr>
        <div class="bili-dyn-live-users__body" style="display: grid;grid-template-columns: auto auto auto;">
        <!--列表中的项目-->
        </div>
    </div>`);
    },
    /**
     *
     * @param name 用户名
     * @param uid 用户UID
     * @param liveID 用户直播间房号
     * @param image 用户头像
     * @param title 直播间标题
     * @returns {string}
     */
    getLiveItem: function (name, uid, liveID, image, title) {
        return $(` <div class="bili-dyn-live-users__item" title="点击用户名打开直播间,点击用户头像打开用户主页">
                <div class="bili-dyn-live-users__item__left">
                    <div class="bili-dyn-live-users__item__face-container">
                        <div class="bili-dyn-live-users__item__face">
                            <div class="b-img--face b-img">
                                <picture class="b-img__inner">
                                <a href="https://space.bilibili.com/${uid}" target="_blank">
                                <img src="${image}@76w_76h_!web-dynamic.webp"
                                        loading="lazy" onload="bmgCmptOnload(this)" alt="图片异常">
                                </a>
                                </picture>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bili-dyn-live-users__item__right">
                    <a href="https://live.bilibili.com/${liveID}" target="_blank">
                        <div class="bili-dyn-live-users__item__uname bili-ellipsis">${name}</div>
                    </a>
                    <div class="bili-dyn-live-users__item__title bili-ellipsis" title=${title}>${title}</div>
                </div>
            </div>`);
    },
    postRuleApi: function (data) {
        HttpUtil.httpRequest()
    }
}


const Print = {
    ln: function (content) {
        Util.printElement("#outputInfo", `<dd>${content}</dd>`);
    },
    video: function (color, content, name, uid, title, videoHref) {
        Util.printElement("#outputInfo", `
        <dd><b
            style="color: ${color}; ">${Util.toTimeString()}${content}屏蔽用户【${name}】uid=<a href="https://space.bilibili.com/${uid}" target="_blank">【${uid}】</a>标题【<a href="${videoHref}" target="_blank">${title}</a>】</b>
        </dd>`);
    }, commentOn: function (color, content, name, uid, primaryContent) {
        Util.printElement("#outputInfo", `
        <dd>
        <b  style="color: ${color}; ">${Util.toTimeString()}${content} 屏蔽用户【${name}】uid=<a href="https://space.bilibili.com/${uid}" target="_blank">【${uid}】</a>
   原言论=【${primaryContent}】</b>
</dd>`);
    }
};


/**
 * 工具类
 */
const Util = {
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
        const split = cookie.split(";");
        for (const v of split) {
            const tempV = v.split("=");
            arrCookie[tempV[0].trimStart()] = tempV[1];
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
        const demoTime = Util.splitTimeHMS(time);
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
        if (str = "".includes("万")) {
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
     * 将视频播放量和弹幕量格式化输出
     * 不超出4位数的按原数字返回字符串
     * 反之截取只保留万返回字符串
     * @param {string|number}strNumber
     * @returns {string}
     */
    getNumberFormat: function (strNumber) {
        strNumber += "";
        const length = strNumber.length;
        if (length <= 4) {
            return strNumber;
        }
        if (length === 5) {
            const start = strNumber.substring(0, 1);
            const end = strNumber.substring(1, 2);
            return start + "." + end + "万";
        }
        const start = strNumber.substring(0, length - 4);
        const end = strNumber.substring(length - 3, 4);
        return start + "." + end + "万";
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
        return `{"用户名黑名单模式(精确匹配)": ${JSON.stringify(LocalData.getArrName())},"用户名黑名单模式(模糊匹配)": ${JSON.stringify(LocalData.getArrNameKey())},
    "用户uid黑名单模式(精确匹配)": ${JSON.stringify(LocalData.getArrUID())},"用户uid白名单模式(精确匹配)": ${JSON.stringify(LocalData.getArrWhiteUID())},
    "标题黑名单模式(模糊匹配)": ${JSON.stringify(LocalData.getArrTitle())},"标题黑名单模式(正则匹配)": ${JSON.stringify(LocalData.getArrTitleKeyCanonical())},
    "评论关键词黑名单模式(模糊匹配)": ${JSON.stringify(Util.getData("commentOnKeyArr"))},"评论关键词黑名单模式(正则匹配)": ${JSON.stringify(LocalData.getArrContentOnKeyCanonicalArr())},
    "粉丝牌黑名单模式(精确匹配)": ${JSON.stringify(LocalData.getFanCardArr())},"专栏关键词内容黑名单模式(模糊匹配)": ${JSON.stringify(LocalData.getContentColumnKeyArr())},
    "动态关键词内容黑名单模式(模糊匹配)": ${JSON.stringify(LocalData.getDynamicArr())},"禁用快捷悬浮屏蔽面板自动显示":${Util.getData("isDShielPanel")}}`;
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
        const newVar = Util.getData("isDShielPanel");
        if (newVar) {
            return;
        }
        if ($("#fixedPanelValueCheckbox").is(':checked')) {
            return;
        }
        $("#nameSuspensionDiv").text(name);
        let uidA = $("#uidSuspensionDiv");
        uid = Util.getSubUid(uid);
        uidA.text(uid);
        uidA.attr("href", `https://space.bilibili.com/${uid}`);
        if (title !== undefined || title !== null) {
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
        uidStr = uidStr + "";
        const indexOf = uidStr.indexOf("?");
        const uid = indexOf === -1 ? uidStr : uidStr.substring(0, indexOf);
        return parseInt(uid);
    },
    /**
     * 截取网页的BV号
     * @param url
     * @return {null|string}
     */
    getUrlBVID: function (url) {
        const arr = url.split("/");
        if (arr.length <= 0) {
            return null;
        }
        const bvid = arr[4];
        if (bvid === undefined) {
            return null;
        }
        if (!bvid.startsWith("BV")) {
            return null;
        }
        return bvid;
    },
    /**
     * 截取网页中的Url直播间的ID
     * @param {string}url
     * @returns {string|null}
     */
    getUrlLiveID: function (url) {
        let id;
        try {
            url = url + "".split("/")[3];
            id = url.substring(0, url.indexOf("?"));
        } catch (e) {
            return null;
        }
        if (isNaN(id)) {
            return null;
        }
        return id;
    },
    /**
     * 判断指定jq网页元素对象是否有某个事件
     * @param element jq网页元素对象
     * @param {string} eventName 事件名
     * @returns {boolean}
     */
    isEventJq: function (element, eventName) {
        const tempData = $._data(element[0], "events");
        if (tempData === undefined) {
            return false;
        }
        return Object.keys(tempData).includes(eventName);
    },
    openWindow(url) {
        window.open(url, 'target', '');
    },
    /**
     获取数组中所有对象的不同键集合
     @param {Object[]} arr - 包含对象的数组
     @return {string[]} - 包含不同键的数组 */
    getDistinctKeys: function (arr) {
        let keysSet = new Set();
        arr.forEach(obj => {
            Object.keys(obj).forEach(key => keysSet.add(key));
        });
        return [...keysSet];
    }
}


const HoverBlockList = {
    /**
     *匹配符合条件的数组
     * @param arr 数组
     * @param key 匹配元素键中的key
     * @param search 符合上面参数，且包含该关键字的匹配
     * @returns Array
     */
    searchAndInitList: function (arr, key, search = '') {
        const searchStr = search.toString().toLowerCase();
        const result = [];

        function omitKey(obj, key, search) {
            const newItem = Object.assign({}, obj);
            delete newItem[key];
            newItem[key] = search;
            return newItem;
        }

        for (let i = 0, len = arr.length; i < len; i++) {
            const item = arr[i];
            if (item.hasOwnProperty(key) && item[key].toString().toLowerCase().includes(searchStr)) {
                const existingItemIndex = result.findIndex(r => r.uid === item.uid);

                if (existingItemIndex === -1) {
                    const newItem = {
                        uid: item.uid,
                        show: item[$("#show-select").val()],
                        items: [omitKey(item, key, search)]
                    };

                    result.push(newItem);
                } else {
                    result[existingItemIndex].items.push(omitKey(item, key, search));
                }
            }
        }
        return result;
    },
    /**
     *数据例子
     * [
     *         {"uid": 1, "name": "张三", "age": 20, "title": "标题"},
     *         {"uid": 2, "name": "李四", "age": 25},
     *         {"uid": 3, "name": "王四", "age": 30}
     *     ];
     * @param list 数据
     * @param typeName 要显示在项目的值
     * @param func 点击获取选中事件
     */
    init: function (list, typeName = "name", func) {
        const pop_ListLayout = $("pop-ListLayout");
        if (pop_ListLayout.length > 0) {
            alert("请先关闭现有悬浮列表！");
            return;
        }
        $("body").append(`<div id="pop-ListLayout" style="
position: fixed;
z-index: 2000;
    left: 76%;
    top: 9%;
    background: cornflowerblue;">
    <div style="display: flex;
    flex-direction: row-reverse;
">
        <button  id="clone-popLayoutList">关闭</button>
    </div>
    <label>筛选条件:
        <select id="search-select"></select>
    </label>
    <label>显示条件
        <select id="show-select"></select>
    </label>
    <br>
    <label>搜索内容:</label>
    <input id="search-input" type="text">
    <ul id="popList" style="list-style: none;padding: 0;overflow-y: auto;height: 350px; list-style: none;padding: 0;">
    </ul>
    <button id="getSelectedCheckboxItem">获取选中的数据</button>
</div>`);

        for (let v of Util.getDistinctKeys(list)) {
            $("#search-select").append(`<option value=${v}>${v}</option>`);
            $("#show-select").append(`<option value=${v}>${v}</option>`);
        }

        HoverBlockList.initList(list, typeName);
        $("#getSelectedCheckboxItem").click(() => {
            // 获取所有选中的项
            const checkedItems = $('#popList input[type="checkbox"]:checked');
            if (checkedItems.length === 0) {
                return;
            }
            const tempArrID = [];
            // 遍历选中的元素并打印它们的值
            checkedItems.each(function () {
                tempArrID.push(parseInt($(this).val()));
            });
            if (tempArrID.length === 0) {
                return;
            }
            func(tempArrID);
        });

        // 监听 input 的 value 变化
        $('#search-input').on('input', function () {
            const content = $(this).val();
            if (content === "" || content.includes(" ")) {
                return;
            }
            const search_selectV = $("#search-select").val();
            HoverBlockList.initList(list, search_selectV, content);
        });
        $("#clone-popLayoutList").click(() => {//点击关闭，则删掉悬浮列表下面的所有jq添加的事件并删除列表元素
            const popMain = $("#pop-ListLayout");
            popMain.off();
            popMain.remove();
            $("#OpenTheFilteredList").show();
        });

    },
    /**
     *
     * @param dataList 数据列表
     * @param itemKey 匹配元素键中的key
     * @param search 搜索的关键词
     * @returns {boolean}
     */
    initList: function (dataList, itemKey, search = "") {
        const keyArr = HoverBlockList.searchAndInitList(dataList, itemKey, search);
        if (keyArr.length === 0) {
            return false;
        }
        const popList = $("#popList");
        popList.children().remove();
        keyArr.forEach((value) => {
            popList.append($(`<li><label><input type="checkbox" value=${value.uid}>${value.show}</label></li>`));
        });
        return true;
    }
};


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
        Util.setData(ruleStrName, arr);
        Qmsg.success(`添加${ruleStrName}的值成功=${key}`);
        Rule.ruleLength();
        return true;
    },
    /**
     * 批量添加，要求以数组形式
     * @param {Array} arr
     * @param {Array} key
     * @param ruleStrName
     */
    addAll: function (arr, key, ruleStrName) {
        let tempLenSize = 0;
        const set = new Set();
        for (let v of key) {
            if (arr.includes(v)) {
                continue;
            }
            tempLenSize++;
            arr.push(v);
            set.add(v);
        }

        if (tempLenSize === 0) {
            Print.ln("内容长度无变化，可能是已经有了的值")
            return;
        }
        Util.setData(ruleStrName, arr);
        Print.ln(`已添加个数${tempLenSize}，新内容为【${JSON.stringify(Array.from(set))}】`)
        Rule.ruleLength();
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
        Util.setData(ruleStrName, arr);
        Print.ln("已经删除该元素=" + key);
        Rule.ruleLength();
        return true;
    }

}

const butLayEvent = {
    butaddName: function (ruleStr, contentV) {
        if (contentV === '') {
            Qmsg.error("请输入正确的内容");
            return false;
        }
        if (!confirm(`您要添加的内容是？ 【${contentV}】 ，类型=${ruleStr}`)) {
            return false;
        }
        let arrayList = Util.getData(ruleStr);
        if (arrayList === null || arrayList === undefined) {
            urleCrud.add([], contentV, ruleStr);
            return false;
        }
        if (arrayList.includes(contentV)) {
            Qmsg.error("当前已有该值！")
            return false;
        }
        return urleCrud.add(arrayList, contentV, ruleStr);
        ;
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
        let arrayList = Util.getData(ruleStr);
        if (arrayList === null || arrayList === undefined) {
            urleCrud.addAll([], tempList, ruleStr);
            return;
        }
        urleCrud.addAll(arrayList, tempList, ruleStr);
    },
    butDelName: function (ruleStr, contentV) {
        let arrayList = Util.getData(ruleStr);
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
        const list = Util.getData(ruleStr);
        if (list === null || list === undefined) {
            Print.ln("没有内容哟")
            return;
        }
        const b = confirm("您确定要全部删除吗？");
        if (!b) {
            return;
        }
        Util.delData(ruleStr);
        Print.ln("已全部清除=" + ruleStr);
        Rule.ruleLength();
    },
    //查询
    butFindKey: function (ruleStr, contentV) {
        if (contentV === '') {
            Print.ln("请输入正确的内容")
            return;
        }
        let arrayList = Util.getData(ruleStr);
        if (arrayList === null || arrayList === undefined) {
            Print.ln("找不到该内容！");
            return;
        }
        if (arrayList.includes(contentV)) {
            const info = `搜索的值【${contentV}】，已存在！`;
            Print.ln(info);
            Qmsg.success(info);
            return;
        }
        const info = `找不到该内容！【${contentV}】`;
        Print.ln(info);
        Qmsg.error(info);
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
        let arrayList = Util.getData(ruleStr);
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
        Util.setData(ruleStr, arrayList);
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
    if (Remove.isWhiteUserUID(uid)) {
        return false;
    }
    const key = Remove.contentKey(element, content);
    if (key != null) {
        Print.commentOn("#00BFFF", `已通过言论关键词了【${key}】`, name, uid, content);
        return true;
    }
    const isUid = Remove.uid(element, uid);
    if (isUid) {
        Print.commentOn("#yellow", `已通过UID屏蔽`, name, uid, content);
        return true;
    }
    const isName = Remove.name(element, name);
    if (isName) {
        Print.commentOn(null, `已通过指定用户名【${isName}】`, name, uid, content);
        return true;
    }
    const isNameKey = Remove.nameKey(element, name);
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
    if (Remove.isWhiteUserUID(uid)) {
        return false;
    }
    if (uid !== null) {
        const isUid = Remove.uid(element, uid);
        if (isUid) {
            Print.video("yellow", "已通过UID屏蔽", name, uid, title, videoHref);
            return true;
        }
    }
    const isName = Remove.name(element, name);
    if (isName) {
        Print.video(null, "已通过用户名屏蔽", name, uid, title, videoHref);
        return true;
    }
    const isNameKey = Remove.nameKey(element, name);
    if (isNameKey != null) {
        Print.video(null, `已通过用户名模糊屏蔽规则=【${isNameKey}】`, name, uid, title, videoHref)
        return true;
    }
    const videoTitle = Remove.titleKey(element, title);
    if (videoTitle != null) {
        Print.video("#66CCCC", `已通过标题模糊屏蔽规则=【${videoTitle}】`, name, uid, title, videoHref);
        return true;
    }
    const titleKeyCanonical = Remove.titleKeyCanonical(element, title);
    if (titleKeyCanonical != null) {
        Print.video("#66CCCC", `已通过标题正则表达式屏蔽规则=${titleKeyCanonical}`, name, uid, title, videoHref);
        return true;
    }
    if (videoPlaybackVolume !== null) {
        const change = Util.changeFormat(videoPlaybackVolume);
        if (Remove.videoMinPlaybackVolume(element, change)) {
            Print.video(null, `已过滤视频播放量小于=【${Rule.videoData.broadcastMin}】的视频`, name, uid, title, videoHref);
            return true;
        }
        if (Remove.videoMaxPlaybackVolume(element, change)) {
            Print.video(null, `已过滤视频播放量大于=【${Rule.videoData.broadcastMax}】的视频`, name, uid, title, videoHref);
            return true;
        }
    }
    if (videoTime === null) {
        return false;
    }
    const timeTotalSeconds = Util.getTimeTotalSeconds(videoTime);
    if (Remove.videoMinFilterS(element, timeTotalSeconds)) {
        Print.video(null, `已通过视频时长过滤时长小于=【${Rule.videoData.filterSMin}】秒的视频`, name, uid, title, videoHref);
        return true;
    }
    if (Remove.videoMaxFilterS(element, timeTotalSeconds)) {
        Print.video(null, `已过滤时长大于=【${Rule.videoData.filterSMax}】秒的视频`, name, uid, title, videoHref);
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
        Util.circulateClassNames("storage-box", 0, 2, 2000, "已移除右侧的【返回旧版】【新版反馈】【客服】");//针对新版界面

    },
    delRightE: function () {
        const video = Rule.videoData;
        if (video.isRhgthlayout) {
            Util.circulateClassNames("right-container is-in-large-ab", 0, 3, 1500, "已移除视频播放器右侧的布局");
            return;
        }
        Util.circulateClassNames("video-page-special-card-small", 0, 2, 2000, "移除播放页右上角的其他推广");
        Util.circulateClassNames("vcd", 0, 2, 2000, "已移除右上角的广告");
        Util.circulateClassName("video-page-game-card-small", 2000, "移除播放页右上角的游戏推广");
        Util.circulateIDs("right-bottom-banner", 2, 1500, "删除右下角的活动推广");
        Util.circulateClassName("pop-live-small-mode part-undefined", 1000, "删除右下角的直播推广")
        Util.circulateClassNames("ad-report video-card-ad-small", 0, 3, 2000, "已删除播放页右上角的广告内容");
        if (video.isrigthVideoList) {
            Util.circulateID("reco_list", 2000, "已移除播放页右侧的视频列表");
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
        Util.circulateIDs("bannerAd", 10, 2500, "已移除播放器底部的广告");
        Util.circulateID("activity_vote", 2500, "已移除播放器底部的活动广告");
        Util.circulateClassName("reply-notice", 2000, "已移除播放器底部的橙色横幅通知");
        Util.circulateClassName("ad-floor-cover b-img", 2000, "已移除播放器底部的图片广告");
        if (Rule.videoData.isTag) {
            Util.circulateID("v_tag", 2000, "已移除播放器底部的tag栏");
        }
        if (Rule.videoData.isDesc) {
            Util.circulateID("v_desc", 2000, "已移除播放器底部的简介");
        }
    }
    ,
    commentArea: function () {
        if (LocalData.getDelVideoCommentSections()) {
            Util.circulateID("comment", 1500, "已移除评论区");
        }
    }
    ,
//针对视频播放页右侧的视频进行过滤处理。该界面无需用时长过滤，视频数目较少
    rightVideo: async function () {//异步形式执行，避免阻塞主线程
        const interval = setInterval(() => {
            let list;
            try {
                list = document.querySelectorAll(".video-page-card-small");
            } catch (e) {
                return;
            }
            if (list.length === 0) {
                return;
            }
            clearInterval(interval);
            for (let v of list) {//获取右侧的页面的视频列表
                //用户名
                const name = v.querySelector(".name").textContent;
                //视频标题
                const videoTitle = v.querySelector(".title").textContent;
                //用户空间地址
                const upSpatialAddress = v.querySelector(".upname>a").href;
                const id = upSpatialAddress.substring(upSpatialAddress.lastIndexOf("com/") + 4, upSpatialAddress.length - 1);
                if (shieldVideo_userName_uid_title(v, name, parseInt(id), videoTitle, null, null, null)) {
                    Qmsg.info("屏蔽了视频！！");
                    continue;
                }
                $(v).mouseenter((e) => {
                    const domElement = e.delegateTarget;//dom对象
                    const name = domElement.querySelector(".name").textContent;
                    const title = domElement.querySelector(".title").textContent;
                    const upSpatialAddress = domElement.querySelector(".upname>a").href;
                    const id = upSpatialAddress.substring(upSpatialAddress.lastIndexOf("com/") + 4, upSpatialAddress.length - 1);
                    Util.showSDPanel(e, name, id, title);
                });
            }
        }, 1000);
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
    const lastIndexOf = upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1);
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
        uid: Util.getSubUid(lastIndexOf),
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
        Util.setData("channel_id", parseInt(id));
    },
    //获取当前频道的id
    getChannel_id: function () {
        const data = Util.getData("channel_id");
        if (data === undefined || data == null) {
            return 17941;//默认返回恐怖游戏的频道
        }
        return parseInt(data);
    },
    //设置频道推送的类型，热门还是以播放量亦或者最新
    setSort_type: function (typeStr) {
        Util.setData("sort_type", typeStr);
    },
    //获取频道推送的类型，热门还是以播放量亦或者最新
    getSort_type: function () {
        const data = Util.getData("sort_type");
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
                    Util.showSDPanel(e, data.upName, data.uid);
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
        if (Rule.liveData.topElement) {
            try {
                document.getElementsByClassName("link-navbar-ctnr z-link-navbar w-100 p-fixed p-zero ts-dot-4 z-navbar contain-optimize")[0].remove();
                Print.ln("已移除直播间顶部的信息（包括顶部标题栏）")
            } catch (e) {
                Print.ln("已移除直播间顶部的信息（包括顶部标题栏）-出错")
            }
            return;
        }
        if (Rule.liveData.topLeftBar.length !== 0) {
            for (const element of Rule.liveData.topLeftBar) {
                try {
                    document.getElementsByClassName(element)[0].remove();
                    Print.ln("已移除该项目=" + element)
                } catch (e) {
                    Print.ln("不存在该项目！=" + element)
                }
            }
        }
        if (Rule.liveData.topLeftLogo) {
            document.getElementsByClassName("entry_logo")[0].remove();
            Print.ln("已移除左上角的b站直播logo信息")
        }
        if (Rule.liveData.topLeftHomeTitle) {
            document.getElementsByClassName("entry-title")[0].remove();
            Print.ln("已移除左上角的首页项目")
        }
    },
    //针对直播间播放器头部的用户信息，举例子，，某某用户直播，就会显示器的信息和直播标题等
    hreadElement: function () {
        const liveData = Rule.liveData;
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
        if (Rule.liveData.bottomElement) {
            document.getElementById("sections-vm").remove();
            Print.ln("已移除直播间底部的全部信息")
            return;
        }
        if (Rule.liveData.bottomIntroduction) {
            document.getElementsByClassName("section-block f-clear z-section-blocks")[0].getElementsByClassName("left-container")[0].remove();
            Print.ln("已移除直播间底部的的简介和主播荣誉")
        } else {
            if (Rule.liveData.liveFeed) {
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
        if (Rule.liveData.container) {
            document.getElementsByClassName("right-container")[0].remove();
            Print.ln("已移除直播间的主播公告")
        }
    },
    //礼物栏的布局处理
    delGiftBar: function () {
        if (Rule.liveData.delGiftLayout) {
            Util.circulateIDs("gift-control-vm", 5, 1500, "已移除礼物栏")
            return;
        }
        if (Rule.liveData.isEmbark) {
            const temp = setInterval(() => {
                const tempClass = document.getElementsByClassName("m-guard-ent gift-section guard-ent")[0];
                if (tempClass) {
                    tempClass.remove();
                    clearInterval(temp);
                    Print.ln("移除立即上舰")
                }
            }, 2000);
        }
        if (Rule.liveData.isGift) {
            const temp = setInterval(() => {
                const element = document.getElementsByClassName("gift-presets p-relative t-right")[0];
                if (element) {
                    element.remove();
                    clearInterval(temp);
                    Print.ln("移除礼物栏的的礼物部分")
                }
            }, 2000);
        }
        if (Rule.liveData.isEmbark && Rule.liveData.isGift) {//如果立即上舰和礼物栏的部分礼物移除了就对其位置调整
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
    //移除右侧的聊天布局
    delRightChatLayout: function () {
        const liveData = Rule.liveData;
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
        const liveData = Rule.liveData;
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
            if (Rule.liveData.classify.includes(type)) {
                v.remove();
                Print.ln("已屏蔽直播分类为=" + type + " 的直播间 用户名=" + name + " 房间标题=" + title + " 人气=" + index)
                continue;
            }
            if (Remove.name(v, name)) {
                Print.ln("已通过用户名=" + name + " 屏蔽直播间 直播分类=" + type + " 房间标题=" + title + " 人气=" + index)
                continue;
            }
            const nameKey = Remove.nameKey(v, name);
            if (nameKey != null) {
                Print.ln("用户名=" + name + " 包含了=屏蔽词=" + nameKey + " 故屏蔽该直播间 分类=" + type + " 房间标题=" + title + " 人气=" + index)
                continue;
            }
            if (Remove.titleKey(v, title)) {
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
        let info = v.querySelector(".bili-video-card__info--right");
        let userInfo = info.querySelector(".bili-video-card__info--owner");
        //用户空间地址
        let upSpatialAddress = userInfo.getAttribute("href");
        const topInfo = v.querySelector(".bili-video-card__stats--left").querySelectorAll(".bili-video-card__stats--item");//1播放量2弹幕数
        return {
            //用户名
            name: userInfo.querySelector(".bili-video-card__info--author").textContent,
            //标题
            title: info.querySelector(".bili-video-card__info--tit").getAttribute("title"),
            upSpatialAddress: upSpatialAddress,
            uid: Util.getSubUid(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1)),
            //视频的时间
            videoTime: v.querySelector(".bili-video-card__stats__duration").textContent,
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
        if (videoList === undefined || videoList === null) {
            return;
        }
        for (let v of videoList) {
            try {
                let info = v.querySelector(".bili-video-card__info--right");
                let userInfo = info.querySelector(".bili-video-card__info--owner");
                //用户名
                let name = userInfo.querySelector(".bili-video-card__info--author").textContent;
                //视频标题
                let title = info.querySelector(".bili-video-card__info--tit").title;
                //用户空间地址
                let upSpatialAddress = userInfo.getAttribute("href");
                if (!upSpatialAddress.includes("//space.bilibili.com/")) {
                    Qmsg.info("检测到不是正常视频内容，故隐藏该元素");
                    //如果获取的类型不符合规则则结束本轮
                    v.remove();
                    continue;
                }
                const videoTime = v.querySelector(".bili-video-card__stats__duration").textContent;//视频的时间
                const topInfo = v.querySelector(".bili-video-card__stats--left").querySelectorAll(".bili-video-card__stats--item");//1播放量2弹幕数
                let id = upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1);
                if (shieldVideo_userName_uid_title(v, name, id, title, null, videoTime, topInfo[0].textContent)) {
                    Qmsg.info("屏蔽了视频！！");
                    continue;
                }
                const jqE = $(v);
                if (Util.isEventJq(jqE, "mouseover")) {
                    continue;
                }
                jqE.mouseenter((e) => {
                    const domElement = e.delegateTarget;//dom对象
                    const data = search.getDataV(domElement);
                    Util.showSDPanel(e, data.name, data.uid);
                });
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
    data: {
        /**
         * 关注用户直播列表页数
         */
        concernPage: 1,
        /**
         * 关注用户直播-是否获取完列表item
         */
        concernBool: false,

        partition: {},
        /**
         * 分区列表页数
         */
        getPartitionPage: function (key) {
            const data = this.partition[key + "Page"];
            if (data == undefined || data == null) {
                return 1;
            }
            return data;
        },
        /**
         * 分区列表页数
         */
        setPartitionPage: function (key, value) {
            this.partition[key + "Page"] = value;
        },
        /**
         * 分区用户直播-是否获取完列表item
         */
        setPartitionBool: function (key, value) {
            this.partition[key + "Bool"] = value;
        }, /**
         * 分区用户直播-是否获取完列表item
         */
        getPartitionBool: function (key) {
            const data = this.partition[key + "Bool"];
            if (data == undefined || data == null || data === false) {
                return false;
            }
            return true;
        },
        partitionPage: 1,
        partitionBool: false,
        partitionEndTypeLiveName: ""

    },
    topCssDisply: {
        //针对于整体布局的细调整
        body: function () {
            const sessdata = LocalData.getSESSDATA();
            const interval = setInterval(() => {
                try {
                    document.querySelector(".bili-dyn-home--member").style.justifyContent = 'space-between';
                    document.querySelector(".bili-dyn-my-info").style.display = "none";//移除左侧中的个人基础面板信息
                    if (sessdata !== null) {
                        const leftLiveLay = document.querySelector(".left");
                        if (leftLiveLay.length === 0) {
                            return;
                        }
                        leftLiveLay.style.display = "none";//当用户已经设置了sessdata值时，隐藏右侧的直播列表
                        document.querySelector("main").style.width = "84%";
                    } else {
                        document.querySelector("main").style.width = "70%";
                    }
                    Print.ln("已调整动态界面布局");
                    clearInterval(interval)
                } catch (e) {
                }
            });
            const interval02 = setInterval(() => {
                const e = document.querySelectorAll(".bili-dyn-sidebar>*:nth-child(-n+2)");
                if (e.length === 0) {
                    return;
                }
                clearInterval(interval02);
                e.forEach((value, key) => {
                    value.remove();
                });
                console.log("已尝试移除个别多余的悬浮按钮");
            }, 500);
        },
        //针对顶部的处理
        topTar: function () {
            const trends = Rule.trendsData;
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
            const trendsData = Rule.trendsData;
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
            //移除话题上面的广告
            const interval01 = setInterval(() => {
                const bili_dyn_ads = $(".bili-dyn-ads");
                if (bili_dyn_ads.length === 0) {
                    return;
                }
                clearInterval(interval01);
                bili_dyn_ads.remove();
                console.log("已移除话题上面的广告");
            }, 1000);


        }
    },
}

const layout = {
    css: {
        home: function () {
            Util.addStyle(`
            #home_layout{
                background: ${Home.getBackgroundStr()};
                margin: 0px;
                height: 100%;
                width: 100%;
                max-height: 100%;
                position: fixed;
                z-index: 2023;
                overflow-y: auto;
                border: 3px solid green;
            }
            
     /* 隐藏标签布局，除了“active”的标签布局 */
    .tab {
      display: none;
    }

    .tab.active {
      display: block;
    }
    ul {
      /* 隐藏ul标签的默认符号 */
      list-style: none;
    }
             /* 悬浮屏蔽布局 */
             #suspensionDiv{
              position: fixed;
                display: none;
                z-index: 2024;
                background: rgb(149, 156, 135);
                overflow-y: auto;
                height: 30%;
                width: 10%;
                top: 70%;
                left: 90%;
                 border: 3px solid green;
             }
             
             #suspensionDiv p {
  margin-top: 10px;
}
#suspensionDiv button {
  margin-top: 10px;
  padding: 5px 10px;
  border: none;
  background-color: #4CAF50;
  color: #fff;
  cursor: pointer;
}
#suspensionDiv button:hover {
  background-color: #3E8E41;
}
             
             /* 悬浮屏蔽布局 */
              #sort_typeSelect{
               display: none;
               }
          #mybut{
        position: fixed;
        z-index: 2024;
        width: 50px;
        height:50px;
        left: 96%;
        bottom: 85%;
        background: rgb(67, 67, 124);
        color: white;
        border: none;
        border-radius: 50%;
    }
            `);
        }
    },
    getPanelSetsTheLayout: function () {//面板设置
        return `<div style="display: flex;flex-wrap: wrap;justify-content: flex-start;">
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
        <input id="widthRange" type="range" value="100" min="20" max="100" step="0.1">
        <span id="widthSpan">90%</span>
      </div>
    </div>
    <h1>快捷悬浮面板</h1>
    <input type="checkbox" id="DShielPanel"><span>禁用快捷悬浮屏蔽面板自动显示(提示:快捷键3可隐藏该快捷悬浮屏蔽面板)</span>
    <h1>悬浮屏蔽筛选列表面板</h1>
        <button id="OpenTheFilteredList" style="">打开筛选列表</button>`;
    },
    getRuleCRUDLayout: function () {
        return `<div id="tableBody">
        <select id="singleDoubleModel">
          <option value="one">单个</option>
          <option value="batch">批量</option>
        </select>
        <select id="model">
          <option value="userNameArr">用户名黑名单模式(精确匹配)</option>
          <option value="userNameKeyArr">用户名黑名单模式(模糊匹配)</option>
          <option value="userUIDArr">用户uid黑名单模式(精确匹配)</option>
          <option value="userWhiteUIDArr">用户白名单模式(精确匹配)</option>
          <option value="titleKeyArr">标题黑名单模式(模糊匹配)</option>
          <option value="titleKeyCanonicalArr">标题黑名单模式(正则匹配)</option>
          <option value="commentOnKeyArr">评论关键词黑名单模式(模糊匹配)</option>
          <option value="contentOnKeyCanonicalArr">评论关键词黑名单模式(正则匹配)</option>
          <option value="fanCardArr">粉丝牌黑名单模式(精确匹配)</option>
          <option value="contentColumnKeyArr">专栏关键词内容黑名单模式(模糊匹配)</option>
          <option value="dynamicArr">动态关键词内容黑名单模式(模糊匹配)</option>
        </select>
        <textarea id="inputTextAreaModel" style="resize: none; width: 40%; height: 100px; display: none"></textarea>
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
     </details>`;
    },
    getHomePageLayout: function () {
        return ` <details open>
      <summary>首页</summary>
      <h3>首页推荐视频</h3>
      <span>指定推送</span>
      <input type="checkbox">
      <select id="pushTypeSelect" style="display: block">
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
      <div style="display: flex;flex-direction: row;justify-content: flex-end;align-items: center;padding-right: 2%;">
      <input type="checkbox" id="isIdCheckbox">
      <span>id</span>
      <button id="findButon" style="padding-right: 20px;padding-left: 10px;">查询</button>
      <button id="okButton">确定</button>
      </div>
      </details>`;
    },
    getVideo_params_layout: function () {
        return `<div>
                <input type="checkbox" id="autoPlayCheckbox"><span>禁止打开b站视频时的自动播放</span>
                <div>
                  <input type="checkbox" id="fenestruleCheckbox"><span>视频画中画</span>
                </div>
                <h3>视频播放速度</h3>
              拖动更改页面视频播放速度
                <input id="rangePlaySpeed" type="range" value="1.0" min="0.1" max="16" step="0.01">
                <span id="playbackSpeedText">1.0x</span>
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
              <div>
              </div>
              </div>
              <h3>播放画面翻转</h3>
             <button id="flipHorizontal">水平翻转</button>
             <button id="flipVertical">垂直翻转</button>
             <div>
              自定义角度
              <input id="axleRange" type="range" value="0" min="0" max="360" step="1"><span id="axleSpan">0%</span>
             </div>
             <div style="display: flex;">
             <input type="checkbox" id="delVideoCommentSectionsCheackBox">移除视频播放页底下的评论区
</div>
`;
    },
    getRuleInfoLayout: function () {
        return `<div>
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
      <p>动态关键词内容黑名单模式(模糊匹配)个数：
       <span id="textDynamicArr" style="color: yellow;"></span>个
      </p>
    </div>
    <div>
    <h1>规则导入导出</h1>
    <button id="setRuleApiAddress">设置api地址</button>
      <div>
  <select id="outRuleSelect">
  <option>全部规则到文件</option>
  <option>全部规则到剪贴板</option>
  <option>全部UID规则到文件</option>
  <option>b站弹幕屏蔽规则</option>
  <option>全部规则到云端api</option>
  <option>全部UID规则到云端api</option>
</select>
<button id="outExport">导出</button>
</div>
<div>
  <select id="inputRuleSelect">
  <option value="">全部规则</option>
  <option value="">确定合并导入UID规则</option>
</select>
<button id="inputExport">导入</button>
</div>
    <textarea id="ruleEditorInput" placeholder="请填导入的规则内容" style="resize: none; height: 300px; width: 100%; font-size: 14px;"></textarea>
</div>
`;
    },
    getOutputInfoLayout: function () {
        return `<div>
      <button id="butClearMessage">清空信息</button>
      <input type="checkbox" checked="checked">
      <span>二次确认</span>
    </div>
    <div id="outputInfo">
    </div>`;
    },
    getOtherLayout: function () {
        return `<div>
      <button onclick="document.documentElement.scrollTop=0;">页面置顶</button>
    </div>
    <details>
      <summary>快捷键</summary>
      <div>
        <h1>快捷键</h1>
        <p> 显示隐藏面板 快捷键\`</p>
        <p>选中取消快捷悬浮屏蔽面板跟随鼠标 快捷键1</p>
        <p>选中固定快捷相符屏蔽面板的固定面板值 快捷键2</p>
        <p>隐藏快捷悬浮屏蔽面板 快捷键3</p>
      </div>
    </details>
    <hr>
    <details>
      <summary>b站SESSDATA</summary>
      <p>该数据一些b站api需要用到，一般情况下不用设置，以下的设置和读取均是需要用户自行添加b站对应的SESSDATA值，读取时候也是读取用户自己添加进去的SESSDATA值，脚本本身不获取b站登录的SESSDATA</p>
      <P>提示：为空字符串则取消移除SESSDATA，不可带有空格</P>
      <div style="display: flex; justify-content: space-between;" id="sgSessdata">
        <button title="为空字符串则取消">设置SESSDATA</button>
        <button>读取SESSDATA</button>
      </div>
      <div style=" display: flex;justify-content: space-between;" id="bili_jctDiv">
        <button>设置bili_jct</button>
        <button>设置b站登录的bili_jct</button>
        <button>读取b站登录的bili_jct</button>
        <button>读取bili_jct</button>
      </div>
    </details>
    <div style="display: flex">
    <input type="checkbox" id="openPrivacyModeCheckbox">开启隐私模式
</div>
    <hr>
    <div>
      <h1> 反馈问题</h1>
      <p>作者b站：<span><a href="https://space.bilibili.com/473239155" target="_blank">点我进行传送！</a></span></p>
      <p>本脚本gf反馈页<span>
          <a href="https://greasyfork.org/zh-CN/scripts/461382-b%E7%AB%99%E5%B1%8F%E8%94%BD%E5%A2%9E%E5%BC%BA%E5%99%A8/feedback" target="_blank">点我进行传送！</a>
        </span>
      </p>
    </div>`;
    },
    getSuspensionDiv: function () {
        return `<!-- 悬浮屏蔽布局 -->
      <div id="suspensionDiv">坐标:
        <span id="suspensionXY">xy</span>
        <div>
          <span>按钮跟随鼠标</span>
          <input id="quickLevitationShield" type="checkbox">
        </div>
       <div>
       <span>固定面板值</span>
       <input id="fixedPanelValueCheckbox" type="checkbox">
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
        <button id="getVideoDanMueBut" style="display: none">获取视频弹幕</button>
        <button id="getVideoCommentArea" style="display: none" title="获取评论区目前页面可见得内容">获取评论区列表内容</button>
        <button id="getLiveHighEnergyListBut" style="display: none">获取高能用户列表</button>
        <button id="getLiveDisplayableBarrageListBut" style="display: none">获取当前可显示的弹幕列表</button>
      </div>
     <!-- 悬浮屏蔽按钮 -->`;
    },
    getFilter_queue: function () {//个人主页悬浮屏蔽按钮
        return $(`<div style="position: fixed;z-index: 2022;  top: 25%; left: 4%; width: 50px; height: 50px; border-radius: 25px; background-color: #FFA500; color: #FFF; font-size: 20px; text-align: center; line-height: 50px;">屏蔽</div>
`);
    },
    getDonateLayout: function () {//捐赠页面
        return $(`
   <div style="border: 3px solid #000;">
            <div style="display: flex;align-items: center;">
                <h2>零钱赞助</h2>
                <ul>
                    <li>1元不嫌少，10元不嫌多哦！感谢支持！</li>
                    <li>生活不易，作者叹息</li>
                    <li>您的支持是我最大的更新动力</li>
                </ul>
            </div>
            <hr>
        <div style="display: flex;justify-content: center;">
            <div>
                <img src="data:image/jpeg;base64,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5ibSWe/bvzMbjSRnmZD6iPbrVar5qGpyuVKKtTUAAaz4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABjl5qvga69ko+Ku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e+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3w28ie+NwBkXm6Bu8z5fsTsNu3kT3wG4B8yeboG7zPl+xOwAADcNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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" alt="支付宝打赏支持" style="max-height: 500px;">
                <span style="display: flex;justify-content: center;">支付宝赞助</span>
            </div>
            <div>
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA38AAAN/CAYAAABut2GPAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAACAASURBVHic7N15eFTV/T/w972zZCfJZN+AkLAECARIWINADbIoASlQtaI+tai1uCu28KgVxG8RcftaKyJYFAEVEarsIlAKCGERCQkkQIAkZCELmWyz398f/Ga+M5kJkMwMWeb9ep4+j7135p4zm953zjmfI0RFRUkgIiIiIiKiTk1s6w4QERERERGR+zH8EREREREReQCGPyIiIiIiIg/A8EdEREREROQBGP6IiIiIiIg8AMMfERERERGRB2D4IyIiIiIi8gAMf0RERERERB6A4Y+IiIiIiMgDMPwRERERERF5AIY/IiIiIiIiD8DwR0RERERE5AEY/oiIiIiIiDwAwx8REREREZEHYPgjIiIiIiLyAHJXXUgURQQEBGDYiHSMHJmOmJhYCIKA4ivFOHzoAH4+dADXrlXDZDK5qkkiIiIiIqIO63ZnKCEqKkpy9iIKhQKDh6Th3ukzEde1m8PHlJWWYMM363E06zB0Op2zTRIREREREXVYbZGhZAEBAX9z5gKiKCI1bRhmP/wHhEdEQhAEh4/z9w9A7z5JqL5WheKiQkiS05mTiIiIiIiow2mrDOX0tM8uXbpg5qz7ERysuuljAwODMH36LOSdOYOystIWtTNocGpru0hEREREROQ2J44fbdHjb1eGasrpgi9Dh49CVHTMLT8+PCISQ4ePdLZZIiIiIiKiDqmtMpTTI38jR6a3+DlpacPw/eaNLXpOS9M0ERERERFRe3S7MlRTTo/8xcTEtvg50S1IuURERERERJ1JW2Uop8Nfc4sTXf0cIiIiIiKizqCtMpTT4a/4SnGLn1NSWuJss0RERERERB1SW2Uop8Pf4UMHWvyco1mHnW2WiIiIiIioQ2qrDOV0+Dt44D8oaUFyLS8rxaED+51tloiIiIiIqENqqwzldPhTq9XY+O3XqKm5dtNNB+vqavHvzRtRUVnhbLNEREREREQdUltlKFlAQMDfnLmAJEkoKytF9bUqREfHoEuXQIePKy8vw7ffrMfBA/+FXq9zpkkiIiIiIqIOq60ylBAVFXXjqHmLZDIZQkJDMWz4KKSlDUN0dAwEQUBJaQmOZh3GkZ8Poqy8DEaDwRXNERERERERdWi3O0O5LPwRERERERFR++X0mj8iIiIiIiJq/xj+iIiIiIiIPADDHxERERERkQdg+CMiIiIiIvIADH9EREREREQegOGPiIiIiIjIAzD8EREREREReQCGPyIiIiIiIg/A8EdEREREROQBGP6IiIiIiIg8AMMfERERERGRB3Bp+Bs0OBWDBqe68pJEREREREQexx3ZiiN/REREREREHoDhj4iIiIiIyAMw/BEREREREXkAhj8iIiIiIiIPwPBHRERERETkARj+iIiIiIiIPADDHxERERERkQdg+CMiIiIiIvIADH9EREREREQegOGPiIiIiIjIAzD8EREREREReQCGPyIiIiIiIg/A8EdEREREROQBGP6IiIiIiIg8AMMfERERERGRB2D4IyIiIiIi8gAMf0RERERERB6A4Y+IiIiIiMgDMPwRERERERF5AIY/IiIiIiIiD8DwR0RERERE5AEY/oiIiIiIiDwAwx8REREREZEHYPgjIiIiIiLyAAx/REREREREHoDhj4iIiIiIyAMw/BEREREREXkAhj8iIiIiIiIPwPBHRERERETkARj+iIiIiIiIPADDHxERERERkQdg+CMiIiIiIvIADH9EREREREQegOGPiIiIiIjIAzD8EREREREReQCGPyIiIiIiIg/A8EdEREREROQBGP6IiIiIiIg8AMMfERERERGRB2D4IyIiIiIi8gAMf0RERERERB6A4Y+IiIiIiMgDMPwRERERERF5AIY/IiIiIiIiD8DwR0RERERE5AEY/oiIiIiIiDwAwx8REREREZEHYPgjIiIiIiLyAAx/REREREREHoDhj4iIiIiIyAMw/BEREREREXkAhj8iIiIiIiIPwPBHRERERETkARj+iIiIiIiIPADDHxERERERkQdg+CMiIiIiIvIADH9EREREREQegOGPiIiIiIjIAzD8EREREREReQCGPyIiIiIiIg/A8EdEREREROQBGP6IiIiIiIg8AMMfERERERGRB2D4IyIiIiIi8gAMf0RERERERB6A4Y+IiIiIiMgDMPwRERERERF5AIY/IiIiIiIiD8DwR0RERERE5AEY/oiIiIiIiDwAwx8REREREZEHYPgjIiIiIiLyAAx/REREREREHoDhj4iIiIiIyAMw/BEREREREXkAhj8iIiIiIiIPwPBHRERERETkARj+iIiIiIiIPADDHxER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ZpYXn/gZrN5ueFpvhrPhSn1ppsXdBZ+7C76uOzHy+ldmLTOtWfLX8HbeNv2zLF44KB0fQHzsJUT6t5X9J0Y6MYxQz2MI9TwGR916uFtvgqN+I0xmV2Y2sXEznI2bUbP4Qxh4/mMlj1WMpqahylPTj0tXVxVtdXA2Xl1yTOZz/PmcroWI6O2K4Y+IKMese/oEEXb/GthrVmWWh3q6YHY0A4IJguiA1bdMr6ZZPQ2AmvN47jQ1hXR8ABZ354wtKlQpjFS4B+GTvyoahiqRTgxljq+p0DQV0BRomgJVjkCO9iEy8EfEh3edzds4v7JFSDR11iZpqgf22jWZn3N2OACoEhRpClKkF9GB7UiMv1LyFInxPfC0/8nMEyOdGIUUOY5kcB/iw88hnRic01uQwkcxcfAoJg5+B86ma+Buvg6OwHoIogNy7FTB+wsT46+i5tKPYGbwU6Qg5MgJJEMHkRh9ac6FhRITe5CY2AOT2Q13681wNV8Lm28ZAAHxAtczU+j4zyDaapFO5BegkcJH0b/jTyu6Bjk2u5hOhgolOYZkcD9Cx35axcw8EdHCIPT+4d1n942DiMhgRJsfdv862GqWw+pZgqneLUiMvXyhLwuC2QXBZIUgCNA0DdDUzH2K8zUTJ4gXzaxeMaItAFvNMgCAHO2/KL7cN17+ADRNhRw7DSlyAqngPqQTI+fsfCaLF+5F70U6MZJXkTZX/ZovQhBtSMeHIEV7kQodhBw7dc6uyepbCnfLjQj1PFr5vbNnQRAdMNvrAUGEIJigaQo0VYKSHCs7a0hEtJAx/BERERERERmA6UJfABEREREREZ17DH9EREREREQGwPBHRERERERkAAx/REREREREBsDwR0REREREZAAMf0RERERERAbA8EdERERERGQADH9EREREREQGwPBHRERERERkAAx/REREREREBsDwR0REREREZAAMf0RERERERAbA8EdERERERGQADH9EREREREQGwPBHRERERERkAAx/REREREREBsDwR0REREREZAAMf0RERERERAbA8EdERERERGQADH9EREREREQGwPBHRERERERkAAx/REREREREBsDwR0REREREZAAMf0RERERERAbA8EdERERERGQADH9EREREREQGwPBHRERERERkAAx/REREREREBsDwR0REREREZAAMf0RERERERAbA8EdERERERGQADH9EREREREQGwPBHRERERERkAAx/REREREREBsDwR0REREREZAAMf0RERERERAbA8EdERERERGQADH9EREREREQGwPBHRERERERkAAx/REREREREBsDwR0REREREZAAMf0RERERERAbA8EdERERERGQADH9EREREREQGwPBHRERERERkAAx/REREREREBsDwR0REREREZAAMf0RERERERAbA8EdERERERGQADH9EREREREQG8P98HyaSzeiamgAAAABJRU5ErkJggg==" alt="微信打赏支持" style="max-height: 500px;">
                <span style="display: flex;justify-content: center;">微信赞助</span>
            </div>
        </div>
        <hr>
        <h1 style=" display: flex; justify-content: center;">打赏点猫粮</h1>
    </div>
`);
    },
    loading: {
        home: function () {
            $("body").prepend(`
      <div id="home_layout" style="display: none">
        <!-- 标签栏 -->
  <ul style="display: flex;justify-content: space-around;padding-top: 10px;" id="tabUl">
    <!-- 每个标签都有一个唯一的ID，可以在后面的标签布局中使用 -->
    <li><button value="panelSetsTheLayout">面板设置</button></li>
    <li><button value="ruleCRUDLayout">规则增删改查</button></li>
    <li><button value="homePageLayout">首页</button></li>
    <li><button value="video_params_layout">视频参数</button></li>
    <li><button value="liveLayout">直播列表</button></li>
    <li><button value="ruleInfoLayout">规则信息与导出导入</button></li>
    <li><button value="outputInfoLayout">输出信息</button></li>
    <li><button value="otherLayout">其他</button></li>
    <li><button value="donateLayout">支持打赏作者</button></li>
  </ul>
  <!-- 标签布局 -->
  <div class="tab" id="panelSetsTheLayout"></div><!-- 面板设置布局 -->
  <div class="tab" id="ruleCRUDLayout"></div><!-- 规则增删改查布局 -->
  <div class="tab" id="homePageLayout"></div><!-- 首页布局 -->
  <div class="tab" id="ruleInfoLayout"></div><!-- 规则信息布局 -->
  <div class="tab active" id="outputInfoLayout"></div><!-- 输出信息布局 -->
  <div class="tab" id="otherLayout"></div><!-- 其他布局 -->
  <div class="tab" id="liveLayout"></div><!-- 直播列表布局 -->
  <div class="tab" id="video_params_layout"><!-- 视频参数布局 --></div>
  <div class="tab" id="donateLayout"><!-- 捐赠布局 --></div>
      </div>
<!-- 分割home_layout -->
    `);
            $("#panelSetsTheLayout").append(layout.getPanelSetsTheLayout());
            $("#ruleCRUDLayout").append(layout.getRuleCRUDLayout());
            $("#homePageLayout").append(layout.getHomePageLayout());
            $("#video_params_layout").append(layout.getVideo_params_layout());
            $("#ruleInfoLayout").append(layout.getRuleInfoLayout());
            $("#outputInfoLayout").append(layout.getOutputInfoLayout());
            $("#otherLayout").append(layout.getOtherLayout());
            $("#donateLayout").append(layout.getDonateLayout());
            $("body").append(layout.getSuspensionDiv());
        }
    }
}

//获取动态页面-评论区信息-单个元素信息-楼主
function getVideoCommentAreaOrTrendsLandlord(v) {
    const userInfo = v.querySelector(".user-info");
    return {
        name: userInfo.querySelector(".user-name").textContent,
        uid: userInfo.querySelector(".user-name").getAttribute("data-user-id"),
        content: v.querySelector(".reply-content").parentNode.textContent
    }
}

//获取动态页面-评论区信息-单个元素信息-楼层
function getVideoCommentAreaOrTrendsStorey(j) {
    return {
        name: j.querySelector(".sub-user-name").textContent,
        uid: j.querySelector(".sub-user-name").getAttribute("data-user-id"),
        content: j.querySelector(".reply-content").textContent
    }
}


function perf_observer() {
    const entries = performance.getEntriesByType('resource');
    const windowUrl = Util.getWindowUrl();
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
            !LocalData.getDelVideoCommentSections()) {
            //如果是视频播放页的话，且接收到评论的相应请求
            const list = document.querySelectorAll(".reply-list>.reply-item");
            for (let v of list) {//针对于评论区
                const data = getVideoCommentAreaOrTrendsLandlord(v);
                const subReplyList = v.querySelectorAll(".sub-reply-container>.sub-reply-list>.sub-reply-item");//楼主下面的评论区
                if (startPrintShieldNameOrUIDOrContent(v, data.name, data.uid, data.content)) {
                    Qmsg.info("屏蔽了言论！！");
                    continue;
                }
                const jqE = $(v);
                if (!Util.isEventJq(jqE, "mouseover")) {
                    jqE.mouseenter((e) => {
                        const domElement = e.delegateTarget;//dom对象
                        const data = getVideoCommentAreaOrTrendsLandlord(domElement);
                        Util.showSDPanel(e, data.name, data.uid);
                    });
                }
                if (subReplyList.length === 0) {
                    continue;
                }
                for (let j of subReplyList) {
                    const data = getVideoCommentAreaOrTrendsStorey(j);
                    if (startPrintShieldNameOrUIDOrContent(j, data.name, data.uid, data.content)) {
                        Qmsg.info("屏蔽了言论！！");
                        continue;
                    }
                    const jqE = $(j);
                    if (Util.isEventJq(jqE, "mouseover")) {
                        continue;
                    }
                    jqE.mouseenter((e) => {
                        const domElement = e.delegateTarget;//dom对象
                        const data = getVideoCommentAreaOrTrendsStorey(domElement);
                        Util.showSDPanel(e, data.name, data.uid);
                    });
                }
            }
            continue;
        }
        if (url.includes("api.bilibili.com/x/msgfeed/reply?platform=") || url.includes("api.bilibili.com/x/msgfeed/reply?id=")) {//第一次加载对应json信息和后续添加的json信息
            message.delMessageReply();
            continue;
        }
        if (url.includes("api.bilibili.com/x/article/metas?ids=")) {//搜索专栏
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
            Home.startShieldMainVideo(".bili-video-card");
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/ranking/region?")) {//首页分区排行榜
            for (let v of document.querySelectorAll(".bili-rank-list-video__list.video-rank-list")) {//遍历每个排行榜
                for (let q of v.querySelectorAll("li[class='bili-rank-list-video__item']")) {//遍历某个排行榜中的项目
                    const title = q.querySelector("[title]").textContent;
                    const isTitle = Shield.arrContent(LocalData.getArrTitle(), title);
                    if (isTitle != null) {
                        Print.ln(`已通过标题黑名单关键词屏蔽【${isTitle}】标题【${title}】`);
                        q.remove();
                        continue;
                    }
                    const isTitleCanonical = Shield.arrContentCanonical(LocalData.getArrTitleKeyCanonical(), title);
                    if (isTitleCanonical != null) {
                        Print.ln(`已通过标题正则黑名单关键词屏蔽【${isTitleCanonical}】标题【${title}】`);
                        q.remove();
                    }
                }
            }
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/wbi/search/type?")) {//搜索界面
            if (windowUrl.includes("search.bilibili.com/video") || windowUrl.includes("search.bilibili.com/all")) {
                search.searchRules($(".video-list").children());
                continue;
            }
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
    const interval = setInterval(() => {
        const list = $(".media-list.row.mt_lg").children();
        if (list.length === 0) {
            return;
        }
        clearInterval(interval);
        for (let v of list) {
            const userInfo = v.querySelector(".flex_start.flex_inline.text3");
            const title = v.querySelector(".text1").textContent;
            const textContent = v.querySelector(".atc-desc.b_text.text_ellipsis_2l.text3.fs_5").textContent;//搜索专栏中的预览部分
            const name = userInfo.text;
            const upSpatialAddress = userInfo.href;
            const uid = parseInt(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1));
            if (Remove.isWhiteUserUID(uid)) {
                continue;
            }
            if (Remove.uid(v, uid)) {
                Print.ln("已通过uid【" + uid + "】，屏蔽用户【" + name + "】，专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
                continue;
            }
            if (Remove.name(v, name)) {
                Print.ln("已通过黑名单用户【" + name + "】，屏蔽处理，专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
                continue;
            }
            const isNameKey = Remove.nameKey(v, name);
            if (isNameKey != null) {
                Print.ln("用户【" + name + "】的用户名包含屏蔽词【" + isNameKey + "】 故进行屏蔽处理 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid)
                continue;
            }
            const isTitleKey = Remove.titleKey(v, title);
            if (isTitleKey != null) {
                Print.ln("通过标题关键词屏蔽用户【" + name + "】 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
                continue;
            }
            const titleKeyCanonical = Remove.titleKeyCanonical(v, title);
            if (titleKeyCanonical != null) {
                Print.ln(`通过标题正则表达式=【${titleKeyCanonical}】屏蔽用户【${name}】专栏预览内容=${textContent} 用户空间地址=https://space.bilibili.com/${uid}`);
                continue;
            }
            const key = Remove.columnContentKey(v, textContent);
            if (key !== null) {
                Print.ln("已通过专栏内容关键词【" + key + "】屏蔽用户【" + name + "】 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
                continue;
            }
            $(v).mouseenter((e) => {
                const domElement = e.delegateTarget;//dom对象
                console.log(domElement);
                const title = domElement.querySelector(".text1").textContent;
                const info = domElement.querySelector(".flex_start.flex_inline.text3");
                const name = info.querySelector(".lh_xs").text;
                const userHref = info.href;
                const uid = userHref.substring(userHref.lastIndexOf("/") + 1);
                Util.showSDPanel(e, name, uid, title);
            });
        }
    }, 1000);
}

/**
 * 根据网页url指定不同的逻辑
 * @param href{String} url链接
 */
function ruleList(href) {
    if (href.includes("live.bilibili.com/p/eden/area-tags")) {
        console.log("直播专区")
        liveDel.delLiveRoom();
        return;
    }
    if (href.includes("https://www.bilibili.com/video")) {//如果是视频播放页的话
        const videoData = Rule.videoData;
        const interval = setInterval(() => {
            try {
                const videoElement = document.getElementsByTagName("video")[0];
                if (videoElement === undefined) {
                    return;
                }
                clearInterval(interval);
                const autoPlay = Util.getData("autoPlay");
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
                    const data = Util.getData("playbackSpeed");
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
                        Util.circulateClassName("bpx-player-ending-content", 2000, "已移除播放完视频之后的视频推荐");
                    }
                }, false);
            } catch (e) {
            }
        }, 1000);
        if (!videoData.isrigthVideoList && !videoData.isRhgthlayout && !videoData.isRightVideo) {//如果删除了右侧视频列表和右侧布局就不用监听该位置的元素了
            const interval = setInterval(() => {
                const list = document.querySelectorAll(".video-page-card-small");
                if (list.length === 0) {
                    return;
                }
                videoFun.rightVideo();
                console.log("检测到右侧视频列表中符合条件");
                clearInterval(interval)

            }, 2000);
        }
        videoFun.delRightE();
        videoFun.delBottonE();
        videoFun.rightSuspendButton();

        const interval01 = setInterval(() => {
            const upInfo = document.querySelector(".up-detail-top");
            if (upInfo.length === 0) {
                return;
            }
            clearInterval(interval01);
            $(upInfo).mouseenter((e) => {
                const domElement = e.delegateTarget;//dom对象
                const adHref = domElement.href;
                Util.showSDPanel(e, domElement.text.trim(), adHref.substring(adHref.lastIndexOf("/") + 1));
            });
        }, 2000);
        return;
    }
    if (href.includes("search.bilibili.com/all") || href.includes("search.bilibili.com/video")) {//搜索页面-综合-搜索界面-视频
        const interval = setInterval(() => {
            const list = $(".video-list").children();
            const tempListLength = list.length;
            if (list.length === 0) {
                return;
            }
            if (list[0].textContent === "") {
                return;
            }
            search.searchRules(list);
            if (tempListLength === list.length) {
                clearInterval(interval);
                //Print.ln("页面元素没有变化，故退出循环")
            }
        }, 10);
        return;
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
        Home.startShieldMainVideo(".bili-video-card");
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
    const tempVar = Home.data.video_zoneList;
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

// 点击标签时执行此函数
function openTab(e) {
    // 获取所有标签布局
    const tabs = document.getElementsByClassName("tab");
    // 循环遍历每个标签布局
    for (let i = 0; i < tabs.length; i++) {
        // 从所有标签布局中删除“active”类，使它们不可见
        tabs[i].classList.remove("active");
    }
    // 将指定的标签布局添加到“active”类，使它可见
    const tempId = document.getElementById(e);
    tempId.classList.add("active");

};


(() => {
    'use strict';
    let href = Util.getWindowUrl();
    console.log("当前网页url=" + href);

    if (href.includes("github.com")) {
        github(href);
        return;
    }
    //加载布局
    layout.loading.home();
    $("body").prepend('<button id="mybut">按钮</button>');
    layout.css.home();

    $("#tabUl>li>button").click((e) => {
        const domElement = e.delegateTarget;//dom对象
        document.querySelectorAll("#tabUl>li>button").forEach((value, key, parent) => {
            $(value).css("color", "");
        })
        domElement.style.color = "yellow";
        openTab(domElement.value);
    });

    Util.suspensionBall(document.getElementById("suspensionDiv"));

    Rule.ruleLength();
    Rule.showInfo();
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
            const q = $("#fixedPanelValueCheckbox");
            q.prop("checked", !q.is(':checked'));
        }
        if (keycode === 51) {//隐藏快捷悬浮屏蔽按钮 键盘上的3
            $("#suspensionDiv").css("display", "none");
        }
    });

    $('#singleDoubleModel').change(() => {//监听模式下拉列表
        const modelStr = $('#singleDoubleModel').val();
        const inputTextAreaModel = $('#inputTextAreaModel');
        const butadd = $('#butadd');
        const butdel = $('#butdel');
        const butaddAll = $('#butaddAll');
        const butdelAll = $('#butdelAll');
        const butSet = $('#butSet');
        const butFind = $('#butFind');
        if (modelStr === "one") {//如果中的是单个
            inputTextAreaModel.css("display", "none");
            //暂时显示对应的按钮
            butadd.css("display", "inline");
            butdel.css("display", "inline");
            butSet.css("display", "inline");
            butFind.css("display", "inline");
            butaddAll.css("display", "none");
            butdelAll.css("display", "none");
            return;
        }//如果选择的是批量
        inputTextAreaModel.css("display", "block");

        butaddAll.css("display", "inline");
        butdelAll.css("display", "inline");
        //暂时隐藏别的按钮先
        butadd.css("display", "none");
        butdel.css("display", "none");
        butSet.css("display", "none");
        butFind.css("display", "none");
    });

    $("#rangePlaySpeed").bind("input propertychange", function (event) {//监听拖动条值变化-视频播放倍数拖动条
        const vaule = $("#rangePlaySpeed").val();//获取值
        Util.setVideoBackSpeed(vaule);
        $("#playbackSpeedText").text(vaule + "x");//修改对应标签的文本显示
    });

    $('#playbackSpeedModel').change(() => {//监听模式下拉列表--下拉列表-视频播放倍数
        Util.setVideoBackSpeed($('#playbackSpeedModel').val())
    });


    $("#preservePlaybackSpeedModel").click(() => {//保存固定值中的播放数据
        const val = $('#playbackSpeedModel').val();
        Util.setData("playbackSpeed", parseFloat(val));
        Print.ln("已保存播放速度数据=" + val);
    });

    $("#preservePlaySpeed").click(() => {//保存拖动条中的值的播放数据
        const val = $("#rangePlaySpeed").val();
        Util.setData("rangePlaySpeed", parseFloat(val));
        Print.ln("已保存播放速度数据=" + val);
    });

    $("#flipHorizontal").click(function () {//水平翻转视频
        const videoData = Rule.videoData;
        if (videoData.flipHorizontal) {
            if (Util.setVideoRotationAngle("Y", 0)) {
                videoData.flipHorizontal = false;
            }
            return;
        }
        if (Util.setVideoRotationAngle("Y", 180)) {
            videoData.flipHorizontal = true;
        }
    });

    $("#flipVertical").click(function () {//垂直翻转视频
        const videoV = $("video");
        if (videoV === null) {
            return;
        }
        const videoData = Rule.videoData;
        if (videoData.flipVertical) {
            if (Util.setVideoRotationAngle("X", 0)) {
                videoData.flipVertical = false;
            }
            return;
        }
        if (Util.setVideoRotationAngle("X", 180)) {
            videoData.flipVertical = true;
        }
    });

    $("#butShieldName").click(() => {//悬浮小窗体-添加屏蔽用户名
        const name = $("#nameSuspensionDiv").text();
        butLayEvent.butaddName("userNameArr", name);
    });
    $("#butShieldUid").click(() => {//悬浮小窗体-添加屏蔽uid
        const uid = $("#uidSuspensionDiv").text();
        const tempLoop = butLayEvent.butaddName("userUIDArr", parseInt(uid));
        if (!tempLoop) {
            return;
        }
        const title = document.title;
        const url = Util.getWindowUrl();
        if (title === "哔哩哔哩 (゜-゜)つロ 干杯~-bilibili") {
            Home.startShieldMainVideo(".bili-video-card.is-rcmd");
            return;
        }
        if (title.includes("-哔哩哔哩_Bilibili") && (url.includes("search.bilibili.com/all") || url.includes("search.bilibili.com/video"))) {//用于避免个别情况搜索界面屏蔽不生效问题
            search.searchRules($(".video-list").children());
            return;
        }
        if (href.includes("//live.bilibili.com/") && title.includes("哔哩哔哩直播，二次元弹幕直播平台")) {
            Live.shield($("#chat-items").children());
            return;
        }
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
            const userCardHtml = HtmlStr.getUserCard(uid, userName, current_level, sign, face, friend, follower, like_num);
            if ($("#popDiv").length === 0) {
                $("body").append(userCardHtml);
            } else {
                $("#popDiv").remove();
                $("body").append(userCardHtml);
            }
            $("#popDiv").css("display", "inline");
        });
    });

    $("#getVideoDanMueBut").click(() => {//打开当前视频弹幕列表
        const windowUrl = Util.getWindowUrl();
        if (!windowUrl.includes("www.bilibili.com/video")) {
            alert("当前不是播放页!");
            return;
        }
        const urlBVID = Util.getUrlBVID(windowUrl);
        if (urlBVID === null) {
            alert("获取不到BV号!");
            return;
        }
        if (!confirm(`当前视频BV号是 ${urlBVID} 吗`)) {
            return;
        }
        const loading = Qmsg.loading("正在获取数据中!");
        HttpUtil.getVideoInfo(urlBVID, (res) => {
            const body = JSON.parse(res.responseText);
            const code = body["code"];
            const message = body["message"];
            if (code !== 0) {
                Qmsg.error("获取失败!" + message);
                loading.close();
                return;
            }
            let data;
            try {
                data = body["data"][0];
            } catch (e) {
                Qmsg.error("获取数据失败!" + e);
                loading.close();
                return;
            }
            if (data === null || data === undefined) {
                Qmsg.error("获取到的数据为空的!");
                loading.close();
                return;
            }
            loading.close();
            const cid = data["cid"];
            Qmsg.success("cid=" + cid);
            Util.openWindow(`https://comment.bilibili.com/${cid}.xml`);
        }, (err) => {
            loading.close();
            Qmsg.error("错误状态!");
            Qmsg.error(err);
        });
    });

    $("#getVideoCommentArea").click(() => {//获取视频的评论区列表可见的内容
        const list = document.querySelectorAll(".reply-list>.reply-item");
        if (list.length === 0) {
            Qmsg.error("未获取评论区内容，可能是当前并未有人评论！");
            return;
        }
        const arr = [];
        for (let v of list) {
            const rootName = v.querySelector(".user-name").textContent;
            const rootUid = v.querySelector(".user-name").getAttribute("data-user-id");
            const rootContent = v.querySelector(".root-reply .reply-content").textContent;
            const subList = v.querySelectorAll(".sub-reply-list>.sub-reply-item");
            const data = {
                name: rootName,
                uid: parseInt(rootUid),
                content: rootContent,
            };
            if (subList.length === 0) {
                arr.push(data);
                continue;
            }
            const subArr = [];
            for (let j of subList) {
                const subName = j.querySelector(".sub-user-name").textContent;
                const subUid = j.querySelector(".sub-user-name").getAttribute("data-user-id");
                const subContent = j.querySelector(".reply-content").textContent;
                const subData = {
                    name: subName,
                    uid: parseInt(subUid),
                    content: subContent
                };
                subArr.push(subData);
            }
            data["sub"] = subArr;
            arr.push(data);
        }
        fileDownload(JSON.stringify(arr), "评论区列表-" + Util.toTimeString());
        Qmsg.success("已获取成功！");
    });

    $("#getLiveHighEnergyListBut").click(() => {//获取直播间的高能用户列表-需要用户先展开高能用户列表才可以识别到
        const title = document.title;
        const url = Util.getWindowUrl();
        if (!(title.includes("- 哔哩哔哩直播，二次元弹幕直播平台") && url.includes("live.bilibili.com"))) {
            Qmsg.error("错误的引用了该功能！");
            return;
        }
        const list = document.querySelectorAll(".list-body>.list>*>.name");
        if (list.length === 0) {
            Qmsg.info("未获取到高能用户列表，当前长度微0，说明没有高能用户存在！");
            return;
        }
        const array = [];
        for (let v of list) {
            const name = v.textContent;
            array.push(name);
        }
        fileDownload(JSON.stringify(array), Util.toTimeString() + "直播间高能用户列表.json");
    });

    $("#getLiveDisplayableBarrageListBut").click(() => {//获取可直播间可显示的弹幕列表
        if (!(document.title.includes("- 哔哩哔哩直播，二次元弹幕直播平台") && Util.getWindowUrl().includes("live.bilibili.com"))) {
            Qmsg.error("错误的引用了该功能！");
            return;
        }
        const list = document.querySelectorAll("#chat-items>*");
        if (list.length === 0) {
            Qmsg.error("未检测到弹幕内容！");
            return;
        }
        const arrData = [];
        for (let v of list) {
            const name = v.getAttribute("data-uname");
            const uid = v.getAttribute("data-uid");
            const timeDate = parseInt(v.getAttribute("data-ts"));//时间戳-秒
            const content = v.getAttribute("data-danmaku");
            /**
             * 弹幕类型
             * 0 正常弹幕消息
             * 1 表情包弹幕消息
             * @type {string}
             */
            const type = v.getAttribute("data-type");
            const data = {
                name: name,
                uid: uid,
                content: content,
                timeDate: timeDate,
                toTime: Util.timestampToTime(timeDate * 1000)
            };
            if (type === "1") {
                data["imge"] = v.getAttribute("data-image");
            }
            arrData.push(data);
        }
        fileDownload(JSON.stringify(arrData), Util.toTimeString() + "_直播间弹幕内容.json");
        Qmsg.success("获取成功并执行导出内容");
    });

    const openTheFilteredList = $("#OpenTheFilteredList");
    openTheFilteredList.click(() => {
        Qmsg.info("该功能暂未完善");
        openTheFilteredList.hide();
        const windowsTitle = document.title;
        const windowUrl = Util.getWindowUrl();
        HoverBlockList.init([
            {"uid": 1, "name": "张三", "age": 20, "title": "标题"},
            {"uid": 2, "name": "李四", "age": 25},
            {"uid": 3, "name": "王四", "age": 30}
        ], "name", (data) => {
            console.log(data);
        });
        console.log(href);
    });

    $("#axleRange").bind("input propertychange", function () {//监听拖动条值变化-视频播放器旋转角度拖动条
        const value = $("#axleRange").val();//获取值
        Util.setVideoCenterRotation(value);
        $("#axleSpan").text(value + "%");//修改对应标签的文本显示
    });

    const tempdelBox = $("#delVideoCommentSectionsCheackBox");
    tempdelBox.click(() => {
        LocalData.setDelVideoCommentSections(tempdelBox.is(':checked'));
    });

    $("#backgroundPellucidityRange").bind("input propertychange", function () {//监听拖动条值变化-面板背景透明度拖动条
        const value = $("#backgroundPellucidityRange").val();//获取值
        $("#backgroundPelluciditySpan").text(value);//修改对应标签的文本显示
        const back = Home.background;
        $("#home_layout").css("background", Util.getRGBA(back.r, back.g, back.b, value));
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
        Util.setData("isDShielPanel", $("#DShielPanel").is(":checked"));
    });

    $("#autoPlayCheckbox").click(() => {//点击禁止打开b站视频时的自动播放
        Util.setData("autoPlay", $("#autoPlayCheckbox").is(":checked"));
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
                Util.setData("filterSMin", inputVideoV);
                break;
            case "videoDurationMax":
                Util.setData("filterSMin", inputVideoV);
                break;
            case "broadcastMin":
                Util.setData("broadcastMin", inputVideoV);
                break;
            case "broadcastMax":
                Util.setData("broadcastMax", inputVideoV);
                break;
            case "barrageQuantityMin":
                Util.setData("barrageQuantityMin", inputVideoV);
                break;
            case "barrageQuantityMax":
                Util.setData("barrageQuantityMax", inputVideoV);
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

    $("#butadd").click(function () {//增
        const typeVal = $("#model option:selected").val();
        const content = prompt("请填写要添加的值");
        if (content === null) {
            return;
        }
        if (content === "") {
            Qmsg.error("请输入正确的内容！");
            return;
        }
        if (typeVal === "userUIDArr" || typeVal === "userWhiteUIDArr") {
            butLayEvent.butaddName(typeVal, parseInt(content));
            return;
        }
        butLayEvent.butaddName(typeVal, content);
    })

    $("#butaddAll").click(function () {
        const typeVal = $("#model option:selected").val();
        const content = $("#inputTextAreaModel").val();
        if (content === null) {
            return;
        }
        if (content === "") {
            Qmsg.error("请输入正确的内容！");
            return;
        }
        if (typeVal === "userUIDArr" || typeVal === "userWhiteUIDArr") {
            alert("暂不支持uid和白名单uid");
            return;
        }
        butLayEvent.butaddAllName(typeVal, content);
    })
    $("#butdel").click(function () {//删
        const typeVal = $("#model option:selected").val();
        const content = prompt("请输入你要删除的单个元素规则");
        if (content === null) {
            return;
        }
        if (content === "") {
            Qmsg.error("请输入正确的内容！");
            return;
        }
        if (typeVal === "userUIDArr" || typeVal === "userWhiteUIDArr") {
            butLayEvent.butDelName(typeVal, parseInt(content));
            return;
        }
        butLayEvent.butDelName(typeVal, content);
    })
    $("#butdelAll").click(function () {//指定规则全删
        const typeVal = $("#model option:selected").val();
        butLayEvent.butDelAllName(typeVal);
    })

    $("#butSet").click(() => {
        const oldContent = prompt("请输入你要修改的单个元素规则");
        const content = prompt("请输入修改之后的值");
        if (content === null || oldContent === null) {
            return;
        }
        if (content === "" || oldContent === "") {
            Qmsg.error("请填写正常的内容");
            return;
        }
        const typeVal = $("#model option:selected").val();
        if (typeVal === "userUIDArr" || typeVal === "userWhiteUIDArr") {
            butLayEvent.butSetKey(typeVal, parseInt(oldContent), parseInt(content));
            return;
        }
        butLayEvent.butSetKey(typeVal, oldContent, content);
    });
    $("#butFind").click(function () {//查
        const typeVal = $("#model option:selected").val();
        const content = prompt("请输入你要查询的单个元素规则");
        if (content === null) {
            return;
        }
        if (content === "") {
            Qmsg.error("请输入正确的内容！");
            return;
        }
        if (typeVal === "userUIDArr" || typeVal === "userWhiteUIDArr") {
            butLayEvent.butFindKey(typeVal, parseInt(content));
            return;
        }
        butLayEvent.butFindKey(typeVal, content);
    });

    $("#printRuleBut").click(() => {
        Print.ln(Util.getRuleFormatStr());
    });

    $("#sgSessdata>button:eq(0)").click(() => {
        const content = prompt("请输入要保存的SESSDATA值");
        if (content === null) {
            return;
        }
        if (content === "") {
            LocalData.setSESSDATA(null);
            return;
        }
        if (content.includes(" ") || content.includes("=")) {
            Qmsg.error("内容中包含空格或者=，请去除相关符号！");
            return;
        }
        if (!confirm(`要保存的SESSDATA是\n${content}`)) {
            return;
        }
        LocalData.setSESSDATA(content);
        Qmsg.success("已设置SESSDATA的值！");
    });

    $("#bili_jctDiv>button:eq(0)").click(() => {
        const content = prompt("设置bili_jct值为：");
        if (content === null) {
            return;
        }
        if (content === "" | content.includes(" ")) {
            Qmsg.error("内容有误，请正确书写！");
            return;
        }
        LocalData.setBili_jct(content);
        Qmsg.success(`已设置bili_jct的值为\n${content}`);
    });
    $("#bili_jctDiv>button:eq(1)").click(() => {
        const data = LocalData.getWebBili_jct();
        if (data === null) {
            Qmsg.error(`获取不到存储在网页中的bili_jct值:`);
            return;
        }
        if (!confirm("确定要将存储在网页中的bili_jct值并设置存储在油猴脚本bili_jct值吗？")) {
            return;
        }
        LocalData.setBili_jct(data);
        Qmsg.success(`已读取存储在网页中的bili_jct值并设置存储在脚本bili_jct的值为\n${data}`);
    });
    $("#bili_jctDiv>button:eq(2)").click(() => {
        const data = LocalData.getWebBili_jct();
        if (data === null) {
            Qmsg.error(`获取不到存储在网页中的bili_jct值:`);
            return;
        }
        Qmsg.success("已获取到存储在网页中的bili_jct值，已输出到面板上");
        Print.ln(data);
    });
    $("#bili_jctDiv>button:eq(3)").click(() => {
        const biliJct = LocalData.getBili_jct();
        if (biliJct === null) {
            Qmsg.error(`用户未设置bili_jct值`);
            return;
        }
        Qmsg.success("获取成功！，已将bili_jct值输出到面板上");
    });
    $("#sgSessdata>button:eq(1)").click(() => {
        const data = LocalData.getSESSDATA();
        if (data === null) {
            const tip = '用户未添加SESSDATA或者已删除存储在脚本的SESSDATA';
            Qmsg.error(tip);
            alert(tip);
            return;
        }
        Qmsg.success("已将值输出到脚本面板的输出信息上！");
        Print.ln("用户存储在脚本中的SESSDATA，如上一条：");
        Print.ln(data);
    });

    const openPrivacyModeCheckbox = $("#openPrivacyModeCheckbox");
    openPrivacyModeCheckbox.click(() => {
        const isbool = openPrivacyModeCheckbox.is(":checked");
        LocalData.setPrivacyMode(isbool);
    });


    $("#outExport").click(() => {//点击导出规则事件
        const selectedText = $('#outRuleSelect option:selected').text();
        if (selectedText === "全部规则到文件") {
            let s = prompt("保存为", "规则-" + Util.toTimeString());
            if (s === null) {
                return;
            }
            if (s.includes(" ") || s === "" || s.length === 0) {
                s = "规则";
            }
            fileDownload(Util.getRuleFormatStr(), s + ".json");
            return;
        }
        if (selectedText === "全部规则到剪贴板") {
            Util.copyToClip(Util.getRuleFormatStr());
            return;
        }
        if (selectedText === "全部UID规则到文件") {
            const list = LocalData.getArrUID();
            fileDownload(JSON.stringify(list), `UID规则-${list.length}个.json`);
            return;
        }
        if (selectedText === "全部UID规则到云端") {//需要配置云端api网址
            alert("11111111111")
            return;
        }
        if (selectedText === "b站弹幕屏蔽规则") {
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
        }
        if (selectedText === "全部规则到云端api") {

        }
    });

    //导入按钮事件
    $("#inputExport").click(function () {
        const selectedText = $('#inputRuleSelect option:selected').text();
        if (selectedText === "全部规则") {
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
            LocalData.setArrName(list);
            list = jsonRule["用户名黑名单模式(模糊匹配)"];
            LocalData.setArrNameKey(list);
            list = jsonRule["用户uid黑名单模式(精确匹配)"];
            LocalData.setArrUID(list)
            list = jsonRule["用户uid白名单模式(精确匹配)"];
            LocalData.setArrWhiteUID(list);
            list = jsonRule["标题黑名单模式(模糊匹配)"];
            LocalData.setArrTitle(list);
            list = jsonRule["标题黑名单模式(正则匹配)"];
            LocalData.setArrTitleKeyCanonical(list);
            list = jsonRule["评论关键词黑名单模式(模糊匹配)"];
            Util.setData("commentOnKeyArr", list);
            list = jsonRule["评论关键词黑名单模式(正则匹配)"];
            LocalData.setArrContentOnKeyCanonicalArr(list);
            list = jsonRule["粉丝牌黑名单模式(精确匹配)"];
            LocalData.setFanCardArr(list)
            list = jsonRule["专栏关键词内容黑名单模式(模糊匹配)"];
            LocalData.setContentColumnKeyArr(list)
            list = jsonRule["动态关键词内容黑名单模式(模糊匹配)"];
            LocalData.setDynamicArr(list);
            Rule.ruleLength();
            alert("已导入");
            return;
        }
        if (selectedText === "确定合并导入UID规则") {
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
            const data = LocalData.getArrUID();
            if (data === undefined || data === null || !(data instanceof Array) || data.length === 0) {
                if (confirm("未检测到本地的UID规则，是否要覆盖或者直接添加？")) {
                    LocalData.setArrUID(uidList);
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
            LocalData.setArrUID(data);
            return;
        }
        if (selectedText === "本地b站弹幕屏蔽规则") {
            alert("暂时未写")
            return;
        }
    });

    $("#setRuleApiAddress").click(() => {
        const p = prompt("请设置api地址！");
        if (p === null || p.includes(" ")) {
            return;
        }
        if (!p.startsWith("http")) {
            alert("请正确填写地址！");
            return;
        }
        LocalData.setRuleApi(p);
        Qmsg.success("已设置=" + LocalData.getRuleApi());
    });

    $('#inputRuleSelect').change(() => {//监听模式下拉列表
        const selectedText = $('#inputRuleSelect option:selected').text();
        const editorInput = $("#ruleEditorInput");
        if (selectedText === "全部规则" || selectedText === "确定合并导入UID规则") {
            editorInput.show();
            return;
        }
        editorInput.hide();
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
        Home.setPushType(pushType);
        if (pushType === "分区") {
            Print.ln("选择了分区" + Home.data.video_zoneList[selectVar] + " uid=" + selectVar);
            LocalData.setVideo_zone(selectVar);
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
    $("#findButon").click(() => {
        const tempContent = prompt("查询的类型关键词");
        if (tempContent === null || tempContent === "" || tempContent.includes(" ")) {
            Qmsg.error("请正确输入内容");
            return;
        }

        function tempFunc(typeStr, tempContent) {
            const list = typeStr === "分区" ? Home.data.video_zoneList : frequencyChannel.data.channel_idList;
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
        const tempUrl = Util.getWindowUrl();
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
        bilibiliOne(href, document.title);
        startMonitorTheNetwork();
    }
})
();


function github(href) {
    setInterval(() => {//github站内所有的链接都从新的标签页打开，而不从当前页面打开
        $("a").attr("target", "_blank");
    }, 1000);
}

/**
 *
 * 首次加载时只会加载一次
 * @param {string}href
 * @param {string}windonsTitle
 */
function bilibiliOne(href, windonsTitle) {
    const interval01 = setInterval(() => {
        const nav_search_input = $(".nav-search-input,.search-input-el");
        if (nav_search_input.length === 0) {
            return;
        }
        clearInterval(interval01);
        nav_search_input.click(() => {
            console.log("点击了");
            const interval01 = setInterval(() => {
                const list = document.querySelectorAll(".trendings-double .trending-item");
                if (list.length === 0) {
                    return;
                }
                clearInterval(interval01);
                list.forEach((value, key, parent) => {
                    const content = value.querySelector(".trending-text").textContent;
                    const titleKey = Remove.titleKey(value, content);
                    if (titleKey !== null) {
                        const info = `已通过标题关键词【${titleKey}】屏蔽热搜榜项目内容【${content}】`;
                        Qmsg.info(info);
                        Print.ln(info);
                        return;
                    }
                    const titleKeyCanonical = Remove.titleKeyCanonical(value, content);
                    if (titleKeyCanonical !== null) {
                        const info = `已通过标题正则关键词【${titleKeyCanonical}】屏蔽热搜榜项目内容【${content}】`;
                        Qmsg.info(info);
                        Print.ln(info);
                        return;
                    }
                    const contentKey = Remove.contentKey(value, content);
                    if (contentKey !== null) {
                        const info = `已通过标内容关键词【${contentKey}】屏蔽热搜榜项目内容【${content}】`;
                        Qmsg.info(info);
                        Print.ln(info);
                    }
                });
                // nav_search_input.unbind();//删除该元素的所有jq添加的事件
            }, 50);
        });
    }, 1000);
    if (LocalData.getPrivacyMode()) {//
        const interval02 = setInterval(() => {
            const tempE01 = document.querySelector(".right-entry") || document.querySelector(".nav-user-center");
            if (tempE01 === null) {
                return;
            }
            // clearInterval(interval02);
            tempE01.style.visibility = "hidden";//隐藏元素继续占位
        }, 1000);
    }
    if (href.includes("space.bilibili.com/")) {//个人主页
        const hrefUID = Util.getSubUid(href.split("/")[3]);
        if (Shield.arrKey(LocalData.getArrUID(), hrefUID)) {
            setTimeout(() => {
                alert("当前用户时是黑名单！UID=" + hrefUID)
            }, 4500);
            return;
        }
        const temp = layout.getFilter_queue();
        $("body").append(temp);
        temp.click(() => {
            butLayEvent.butaddName("userUIDArr", parseInt(hrefUID));
        });
        return;
    }
    if (href.includes("www.bilibili.com/v/topic/detail/?topic_id=")) {//话题
        subjectOfATalk.deltopIC();
        return;
    }
    if (href.includes("www.bilibili.com/video")) {
        $("#getVideoDanMueBut").css("display", "inline");
        $("#getVideoCommentArea").css("display", "inline");
        return;
    }
    if ((href.includes("https://live.bilibili.com/?spm_id_from") || href === "https://live.bilibili.com/") && windonsTitle === "哔哩哔哩直播，二次元弹幕直播平台") {//直播首页
        console.log("进入直播首页了");
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
            if (Rule.liveData.rightSuspendButton) {
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
    if (href.includes("//live.bilibili.com/") && windonsTitle.includes("哔哩哔哩直播，二次元弹幕直播平台")) {//直播间房间-该判断要低于上面的直播首页判断
        console.log("当前界面疑似是直播间");
        $("#getLiveHighEnergyListBut").css("display", "inline");//显示获取高能用户列表按钮
        $("#getLiveDisplayableBarrageListBut").css("display", "inline");//显示获取当前可显示的弹幕列表
        liveDel.topElement();
        liveDel.hreadElement();
        liveDel.bottomElement();
        liveDel.delGiftBar();
        liveDel.delRightChatLayout();
        liveDel.delOtherE();
        const interval01 = setInterval(() => {
            const chat_items = $("#chat-items");
            if (chat_items.length === 0) {
                return;
            }
            clearInterval(interval01);

            chat_items.bind("DOMNodeInserted", () => {
                const list = $("#chat-items").children();
                if (list.length === 0) {
                    return;
                }
                if (list.length >= 100) {
                    for (let i = 0; i < 50; i++) {
                        list[i].remove();
                    }
                    Qmsg.info("当前弹幕内容达到100个，已自动进行截取，保留50个");
                    return;
                }
                Live.shield(list);
            });
            console.log("定义了监听器!");
        }, 1000);
        return;
    }
    if (href.includes("t.bilibili.com") ||
        href.includes("search.bilibili.com") ||
        href.includes("www.bilibili.com/v") ||
        href.includes("www.bilibili.com/anime") ||
        href.includes("www.bilibili.com/guochuang") ||
        href.includes("message.bilibili.com") ||
        href.includes("space.bilibili.com")) {//移除该三个个界面的部分顶栏信息
        const interval01 = setInterval(() => {
            const left_entry = $(".left-entry");
            if (left_entry.length === 0) {
                return;
            }
            const v_popover_wrap = $(".v-popover-wrap:contains('下载'),.v-popover-wrap:contains('会员购'),.v-popover-wrap:contains('赛事'),.v-popover-wrap:contains('漫画')");
            if (v_popover_wrap.length === 0) {
                return;
            }
            clearInterval(interval01);
            v_popover_wrap.remove();
            console.log("移除标题栏的下载");
        }, 1000);
        const interval02 = setInterval(() => {
            const logo = $(".mini-header__logo");
            if (logo.length === 0) {
                return;
            }
            clearInterval(interval02);
            logo.remove();
            console.log("已移除顶栏左侧的logo");
        }, 1000);
    }
    if (href.includes("t.bilibili.com") && windonsTitle === "动态首页-哔哩哔哩") {
        console.log("动态页面")
        const interval01 = setInterval(() => {
            const login = $(".bili-dyn-login-register");
            if (login.length === 0) {
                return;
            }
            clearInterval(interval01);
            login.remove();
            console.log("已移除动态页面中的提示登录");
        }, 1000);
        //.bili-dyn-ads
        trends.topCssDisply.body();
        trends.topCssDisply.topTar();
        trends.topCssDisply.rightLayout();

        function followListLive() {
            const tempE = $("#liveLayout .bili-dyn-live-users__body:eq(0)");
            HttpUtil.getUsersFollowTheLiveList(sessdata, trends.data.concernPage++, (res) => {
                const body = JSON.parse(res.responseText);
                const code = body["code"];
                const message = body["message"];
                if (code !== 0) {
                    const info = "获取当前用户正在直播的用户错误！" + message;
                    Qmsg.error(info);
                    console.log(info);
                    return;
                }
                /**
                 *
                 * @type {Array}
                 */
                const list = body["data"]["list"];
                if (list === undefined || list === null || list.length === 0) {
                    const info = "未获取到当前用户关注的直播用户列表信息";
                    Qmsg.info(info);
                    console.log(info);
                    return;
                }
                for (let v of list) {
                    /**
                     *直播状态
                     * 0：未开播
                     * 1：直播中
                     * 2：轮播中
                     */
                    const live_status = v["live_status"];
                    if (live_status === 0) {
                        trends.data.concernBool = true;
                        break;
                    }
                    if (live_status !== 1) {
                        continue;
                    }
                    const roomid = v["roomid"];
                    const uid = v["uid"];
                    const uname = v["uname"];
                    const title = v["title"];
                    const face = v["face"];
                    const liveItem = HtmlStr.getLiveItem(uname, uid, roomid, face, title);
                    tempE.append(liveItem);
                }
                const tempIndex = tempE.children().length;
                if (tempIndex === 0) {
                    Qmsg.info("未获取到关注中正在直播的用户");
                    return;
                }
                if (!trends.data.concernBool) {
                    followListLive();
                    return;
                }
                $("#liveLayout .bili-dyn-live-users__title>span:eq(0)").text(`${tempIndex}`);
                Qmsg.success(`已获取到${tempIndex}个直播间`);
            }, (err) => {
                Qmsg.error("出现错误");
                Qmsg.error(err);
            });
        }

        const liveLayout = $("#liveLayout");
        liveLayout.append(HtmlStr.getLiveList("关注列表在中正在直播的用户-"));
        liveLayout.append(`<hr>`);
        const okBut = $(`<button>确定</button>`);
        const openBut = $(`<button>打开页面</button>`);
        const findBut = $(`<button>查询</button>`);
        const select_parent_name = $(`<select></select>`);
        const select_name = $(`<select></select>`);
        const jsonArr = JSON.parse(`{"手游":[{"parent_name":"手游","parent_id":3,"name":"全部","id":0},{"parent_name":"手游","parent_id":3,"name":"原神","id":321},{"parent_name":"手游","parent_id":3,"name":"欢乐斗地主","id":719},{"parent_name":"手游","parent_id":3,"name":"DNF手游","id":343},{"parent_name":"手游","parent_id":3,"name":"新游评测","id":274},{"parent_name":"手游","parent_id":3,"name":"黎明觉醒：生机","id":479},{"parent_name":"手游","parent_id":3,"name":"宝可梦大集结","id":493},{"parent_name":"手游","parent_id":3,"name":"幻塔","id":550},{"parent_name":"手游","parent_id":3,"name":"三国志战棋版","id":756},{"parent_name":"手游","parent_id":3,"name":"明日之后","id":189},{"parent_name":"手游","parent_id":3,"name":"百闻牌","id":286},{"parent_name":"手游","parent_id":3,"name":"阴阳师","id":36},{"parent_name":"手游","parent_id":3,"name":"第五人格","id":163},{"parent_name":"手游","parent_id":3,"name":"战双帕弥什","id":293},{"parent_name":"手游","parent_id":3,"name":"FIFA足球世界","id":641},{"parent_name":"手游","parent_id":3,"name":"跃迁旅人","id":717},{"parent_name":"手游","parent_id":3,"name":"空之要塞：启航","id":718},{"parent_name":"手游","parent_id":3,"name":"火影忍者手游","id":292},{"parent_name":"手游","parent_id":3,"name":"Fate/GO","id":37},{"parent_name":"手游","parent_id":3,"name":"CF手游","id":333},{"parent_name":"手游","parent_id":3,"name":"游戏王","id":303},{"parent_name":"手游","parent_id":3,"name":"重返未来：1999 ","id":761},{"parent_name":"手游","parent_id":3,"name":"哈利波特：魔法觉醒 ","id":474},{"parent_name":"手游","parent_id":3,"name":"玛娜希斯回响","id":644},{"parent_name":"手游","parent_id":3,"name":" 东方归言录","id":538},{"parent_name":"手游","parent_id":3,"name":"无期迷途","id":675},{"parent_name":"手游","parent_id":3,"name":"光遇","id":687},{"parent_name":"手游","parent_id":3,"name":"少女前线：云图计划","id":525},{"parent_name":"手游","parent_id":3,"name":"黑色沙漠手游","id":615},{"parent_name":"手游","parent_id":3,"name":"雀姬","id":214},{"parent_name":"手游","parent_id":3,"name":"时空猎人3","id":643},{"parent_name":"手游","parent_id":3,"name":"明日方舟","id":255},{"parent_name":"手游","parent_id":3,"name":"猫咪公寓2","id":736},{"parent_name":"手游","parent_id":3,"name":"QQ飞车手游","id":154},{"parent_name":"手游","parent_id":3,"name":"古魂","id":759},{"parent_name":"手游","parent_id":3,"name":"航海王热血航线","id":504},{"parent_name":"手游","parent_id":3,"name":"和平精英","id":256},{"parent_name":"手游","parent_id":3,"name":"暗黑破坏神：不朽","id":492},{"parent_name":"手游","parent_id":3,"name":"蛋仔派对","id":571},{"parent_name":"手游","parent_id":3,"name":"JJ斗地主","id":724},{"parent_name":"手游","parent_id":3,"name":"香肠派对","id":689},{"parent_name":"手游","parent_id":3,"name":"跑跑卡丁车手游","id":265},{"parent_name":"手游","parent_id":3,"name":"梦幻模拟战","id":178},{"parent_name":"手游","parent_id":3,"name":"APEX手游","id":506},{"parent_name":"手游","parent_id":3,"name":"综合棋牌","id":354},{"parent_name":"手游","parent_id":3,"name":"以闪亮之名","id":755},{"parent_name":"手游","parent_id":3,"name":"恋爱养成游戏","id":576},{"parent_name":"手游","parent_id":3,"name":"漫威超级战争","id":478},{"parent_name":"手游","parent_id":3,"name":"暗区突围","id":502},{"parent_name":"手游","parent_id":3,"name":"狼人杀","id":41},{"parent_name":"手游","parent_id":3,"name":"盾之勇者成名录：浪潮","id":704},{"parent_name":"手游","parent_id":3,"name":"荒野乱斗","id":469},{"parent_name":"手游","parent_id":3,"name":"猫和老鼠手游","id":269},{"parent_name":"手游","parent_id":3,"name":"LOL手游","id":395},{"parent_name":"手游","parent_id":3,"name":"战火勋章","id":765},{"parent_name":"手游","parent_id":3,"name":"深空之眼","id":598},{"parent_name":"手游","parent_id":3,"name":"碧蓝航线","id":113},{"parent_name":"手游","parent_id":3,"name":"坎公骑冠剑","id":442},{"parent_name":"手游","parent_id":3,"name":"摩尔庄园手游","id":464},{"parent_name":"手游","parent_id":3,"name":"非人学园","id":212},{"parent_name":"手游","parent_id":3,"name":"崩坏3","id":40},{"parent_name":"手游","parent_id":3,"name":"天地劫：幽城再临","id":448},{"parent_name":"手游","parent_id":3,"name":"弹弹堂","id":734},{"parent_name":"手游","parent_id":3,"name":"300大作战","id":688},{"parent_name":"手游","parent_id":3,"name":"解密游戏","id":42},{"parent_name":"手游","parent_id":3,"name":"使命召唤手游","id":386},{"parent_name":"手游","parent_id":3,"name":"猫之城","id":645},{"parent_name":"手游","parent_id":3,"name":"长安幻想","id":738},{"parent_name":"手游","parent_id":3,"name":"少女前线","id":39},{"parent_name":"手游","parent_id":3,"name":"游戏王：决斗链接","id":407},{"parent_name":"手游","parent_id":3,"name":"梦幻西游手游","id":342},{"parent_name":"手游","parent_id":3,"name":"其他手游","id":98},{"parent_name":"手游","parent_id":3,"name":"决战！平安京","id":140},{"parent_name":"手游","parent_id":3,"name":"三国杀移动版","id":352},{"parent_name":"手游","parent_id":3,"name":"影之诗","id":156},{"parent_name":"手游","parent_id":3,"name":"公主连结Re:Dive","id":330},{"parent_name":"手游","parent_id":3,"name":"王者荣耀","id":35},{"parent_name":"手游","parent_id":3,"name":"忍者必须死3","id":203},{"parent_name":"手游","parent_id":3,"name":"BanG Dream","id":258},{"parent_name":"手游","parent_id":3,"name":"休闲小游戏","id":679},{"parent_name":"手游","parent_id":3,"name":"金铲铲之战","id":514},{"parent_name":"手游","parent_id":3,"name":"环形战争","id":725},{"parent_name":"手游","parent_id":3,"name":"天涯明月刀手游","id":389},{"parent_name":"手游","parent_id":3,"name":"漫威对决","id":511},{"parent_name":"手游","parent_id":3,"name":"奥比岛手游","id":661},{"parent_name":"手游","parent_id":3,"name":"奇点时代","id":762},{"parent_name":"手游","parent_id":3,"name":"部落冲突:皇室战争","id":50},{"parent_name":"手游","parent_id":3,"name":"重返帝国","id":613},{"parent_name":"手游","parent_id":3,"name":"小动物之星","id":473}],"赛事":[{"parent_name":"赛事","parent_id":13,"name":"全部","id":0},{"parent_name":"赛事","parent_id":13,"name":"体育赛事","id":562},{"parent_name":"赛事","parent_id":13,"name":"游戏赛事","id":561},{"parent_name":"赛事","parent_id":13,"name":"赛事综合","id":563}],"生活":[{"parent_name":"生活","parent_id":10,"name":"全部","id":0},{"parent_name":"生活","parent_id":10,"name":"手工绘画","id":627},{"parent_name":"生活","parent_id":10,"name":"时尚","id":378},{"parent_name":"生活","parent_id":10,"name":"影音馆","id":33},{"parent_name":"生活","parent_id":10,"name":"生活分享","id":646},{"parent_name":"生活","parent_id":10,"name":"萌宠","id":369},{"parent_name":"生活","parent_id":10,"name":"美食","id":367},{"parent_name":"生活","parent_id":10,"name":"搞笑","id":624},{"parent_name":"生活","parent_id":10,"name":"运动","id":628}],"娱乐":[{"parent_name":"娱乐","parent_id":1,"name":"全部","id":0},{"parent_name":"娱乐","parent_id":1,"name":"视频唱见","id":21},{"parent_name":"娱乐","parent_id":1,"name":"户外","id":123},{"parent_name":"娱乐","parent_id":1,"name":"萌宅领域","id":530},{"parent_name":"娱乐","parent_id":1,"name":"情感","id":706},{"parent_name":"娱乐","parent_id":1,"name":"视频聊天","id":145},{"parent_name":"娱乐","parent_id":1,"name":"日常","id":399},{"parent_name":"娱乐","parent_id":1,"name":"聊天室","id":740},{"parent_name":"娱乐","parent_id":1,"name":"舞见","id":207}],"电台":[{"parent_name":"电台","parent_id":5,"name":"全部","id":0},{"parent_name":"电台","parent_id":5,"name":"配音","id":193},{"parent_name":"电台","parent_id":5,"name":"唱见电台","id":190},{"parent_name":"电台","parent_id":5,"name":"聊天电台","id":192}],"网游":[{"parent_name":"网游","parent_id":2,"name":"全部","id":0},{"parent_name":"网游","parent_id":2,"name":"诛仙世界","id":654},{"parent_name":"网游","parent_id":2,"name":"街头篮球","id":649},{"parent_name":"网游","parent_id":2,"name":"洛克王国","id":669},{"parent_name":"网游","parent_id":2,"name":"剑灵","id":505},{"parent_name":"网游","parent_id":2,"name":"堡垒之夜","id":164},{"parent_name":"网游","parent_id":2,"name":"枪神纪","id":251},{"parent_name":"网游","parent_id":2,"name":"逃离塔科夫","id":252},{"parent_name":"网游","parent_id":2,"name":"吃鸡行动","id":80},{"parent_name":"网游","parent_id":2,"name":"坦克世界","id":115},{"parent_name":"网游","parent_id":2,"name":"VRChat","id":656},{"parent_name":"网游","parent_id":2,"name":"新游前瞻","id":298},{"parent_name":"网游","parent_id":2,"name":"星际战甲","id":249},{"parent_name":"网游","parent_id":2,"name":"战争雷霆","id":316},{"parent_name":"网游","parent_id":2,"name":"英雄联盟","id":86},{"parent_name":"网游","parent_id":2,"name":"超击突破","id":680},{"parent_name":"网游","parent_id":2,"name":"其他网游","id":107},{"parent_name":"网游","parent_id":2,"name":"创世战车","id":705},{"parent_name":"网游","parent_id":2,"name":"最终幻想14","id":102},{"parent_name":"网游","parent_id":2,"name":"跑跑卡丁车","id":664},{"parent_name":"网游","parent_id":2,"name":"梦三国","id":710},{"parent_name":"网游","parent_id":2,"name":"古剑奇谭OL","id":173},{"parent_name":"网游","parent_id":2,"name":"永恒轮回","id":459},{"parent_name":"网游","parent_id":2,"name":"激战2","id":607},{"parent_name":"网游","parent_id":2,"name":"奇迹MU","id":683},{"parent_name":"网游","parent_id":2,"name":"怀旧网游","id":288},{"parent_name":"网游","parent_id":2,"name":"APEX英雄","id":240},{"parent_name":"网游","parent_id":2,"name":"FIFA ONLINE 4","id":388},{"parent_name":"网游","parent_id":2,"name":"使命召唤:战区","id":318},{"parent_name":"网游","parent_id":2,"name":"反恐精英Online","id":629},{"parent_name":"网游","parent_id":2,"name":"阿尔比恩","id":639},{"parent_name":"网游","parent_id":2,"name":"星际争霸2","id":93},{"parent_name":"网游","parent_id":2,"name":"星际公民","id":658},{"parent_name":"网游","parent_id":2,"name":"CS:GO","id":89},{"parent_name":"网游","parent_id":2,"name":"天涯明月刀","id":596},{"parent_name":"网游","parent_id":2,"name":"炉石传说","id":91},{"parent_name":"网游","parent_id":2,"name":"生死狙击2","id":575},{"parent_name":"网游","parent_id":2,"name":"彩虹岛","id":686},{"parent_name":"网游","parent_id":2,"name":"武装突袭","id":634},{"parent_name":"网游","parent_id":2,"name":"魔兽争霸3","id":181},{"parent_name":"网游","parent_id":2,"name":"问道","id":670},{"parent_name":"网游","parent_id":2,"name":"剑网3","id":82},{"parent_name":"网游","parent_id":2,"name":"造梦西游","id":668},{"parent_name":"网游","parent_id":2,"name":"NBA2KOL2","id":581},{"parent_name":"网游","parent_id":2,"name":"星战前夜：晨曦","id":331},{"parent_name":"网游","parent_id":2,"name":"英魂之刃","id":690},{"parent_name":"网游","parent_id":2,"name":"永恒之塔","id":684},{"parent_name":"网游","parent_id":2,"name":"艾尔之光","id":651},{"parent_name":"网游","parent_id":2,"name":"大话西游","id":652},{"parent_name":"网游","parent_id":2,"name":"洛奇","id":663},{"parent_name":"网游","parent_id":2,"name":"风暴英雄","id":114},{"parent_name":"网游","parent_id":2,"name":"新天龙八部","id":653},{"parent_name":"网游","parent_id":2,"name":"骑士精神2","id":650},{"parent_name":"网游","parent_id":2,"name":"赛尔号","id":667},{"parent_name":"网游","parent_id":2,"name":"300英雄","id":84},{"parent_name":"网游","parent_id":2,"name":"封印者","id":300},{"parent_name":"网游","parent_id":2,"name":"新世界","id":544},{"parent_name":"网游","parent_id":2,"name":"战争与抉择","id":729},{"parent_name":"网游","parent_id":2,"name":"人间地狱","id":677},{"parent_name":"网游","parent_id":2,"name":"剑网3缘起","id":499},{"parent_name":"网游","parent_id":2,"name":"魔兽世界","id":83},{"parent_name":"网游","parent_id":2,"name":"泡泡堂","id":737},{"parent_name":"网游","parent_id":2,"name":"战舰世界","id":248},{"parent_name":"网游","parent_id":2,"name":"Squad战术小队","id":659},{"parent_name":"网游","parent_id":2,"name":"逆战","id":487},{"parent_name":"网游","parent_id":2,"name":"QQ飞车","id":610},{"parent_name":"网游","parent_id":2,"name":"穿越火线","id":88},{"parent_name":"网游","parent_id":2,"name":"洛奇英雄传","id":599},{"parent_name":"网游","parent_id":2,"name":"超激斗梦境","id":519},{"parent_name":"网游","parent_id":2,"name":"龙之谷","id":112},{"parent_name":"网游","parent_id":2,"name":"无畏契约","id":329},{"parent_name":"网游","parent_id":2,"name":"传奇","id":695},{"parent_name":"网游","parent_id":2,"name":"冒险岛","id":574},{"parent_name":"网游","parent_id":2,"name":"猎杀对决","id":600},{"parent_name":"网游","parent_id":2,"name":"流放之路","id":551},{"parent_name":"网游","parent_id":2,"name":"命运方舟","id":590},{"parent_name":"网游","parent_id":2,"name":"综合射击","id":601},{"parent_name":"网游","parent_id":2,"name":"黑色沙漠","id":632},{"parent_name":"网游","parent_id":2,"name":"刀塔自走棋","id":239},{"parent_name":"网游","parent_id":2,"name":"DNF","id":78},{"parent_name":"网游","parent_id":2,"name":"战意","id":383},{"parent_name":"网游","parent_id":2,"name":"守望先锋","id":87},{"parent_name":"网游","parent_id":2,"name":"DOTA2","id":92},{"parent_name":"网游","parent_id":2,"name":"FPS沙盒","id":633},{"parent_name":"网游","parent_id":2,"name":"风暴奇侠","id":648},{"parent_name":"网游","parent_id":2,"name":"幻想全明星","id":176},{"parent_name":"网游","parent_id":2,"name":"铁甲雄兵","id":691},{"parent_name":"网游","parent_id":2,"name":"三国杀","id":81},{"parent_name":"网游","parent_id":2,"name":"永劫无间","id":666},{"parent_name":"网游","parent_id":2,"name":"CFHD ","id":472},{"parent_name":"网游","parent_id":2,"name":"QQ三国","id":685},{"parent_name":"网游","parent_id":2,"name":"装甲战争","id":642}],"虚拟主播":[{"parent_name":"虚拟主播","parent_id":9,"name":"全部","id":0},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟Singer","id":744},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟Gamer","id":745},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟声优","id":746},{"parent_name":"虚拟主播","parent_id":9,"name":"TopStar","id":743},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟日常","id":371}],"单机游戏":[{"parent_name":"单机游戏","parent_id":6,"name":"全部","id":0},{"parent_name":"单机游戏","parent_id":6,"name":"原子之心","id":750},{"parent_name":"单机游戏","parent_id":6,"name":"以撒","id":219},{"parent_name":"单机游戏","parent_id":6,"name":"荒野大镖客2","id":226},{"parent_name":"单机游戏","parent_id":6,"name":"双人成行","id":446},{"parent_name":"单机游戏","parent_id":6,"name":"刺客信条","id":227},{"parent_name":"单机游戏","parent_id":6,"name":"霍格沃茨之遗","id":747},{"parent_name":"单机游戏","parent_id":6,"name":"狂野之心","id":748},{"parent_name":"单机游戏","parent_id":6,"name":"独立游戏","id":283},{"parent_name":"单机游戏","parent_id":6,"name":"怀旧游戏","id":237},{"parent_name":"单机游戏","parent_id":6,"name":"格斗游戏","id":433},{"parent_name":"单机游戏","parent_id":6,"name":"胡闹厨房","id":507},{"parent_name":"单机游戏","parent_id":6,"name":"怪物猎人","id":578},{"parent_name":"单机游戏","parent_id":6,"name":"重生细胞","id":426},{"parent_name":"单机游戏","parent_id":6,"name":"盗贼之海","id":341},{"parent_name":"单机游戏","parent_id":6,"name":"暖雪","id":582},{"parent_name":"单机游戏","parent_id":6,"name":"NBA2K","id":362},{"parent_name":"单机游戏","parent_id":6,"name":"消逝的光芒2","id":586},{"parent_name":"单机游戏","parent_id":6,"name":"恋爱模拟游戏","id":592},{"parent_name":"单机游戏","parent_id":6,"name":"饥荒","id":218},{"parent_name":"单机游戏","parent_id":6,"name":"策略游戏","id":570},{"parent_name":"单机游戏","parent_id":6,"name":"卧龙：苍天陨落","id":700},{"parent_name":"单机游戏","parent_id":6,"name":"全面坦克战略官","id":758},{"parent_name":"单机游戏","parent_id":6,"name":"弹幕互动玩法","id":460},{"parent_name":"单机游戏","parent_id":6,"name":"暗黑破坏神","id":535},{"parent_name":"单机游戏","parent_id":6,"name":"全境封锁2","id":243},{"parent_name":"单机游戏","parent_id":6,"name":"禁闭求生","id":707},{"parent_name":"单机游戏","parent_id":6,"name":"帝国时代4","id":548},{"parent_name":"单机游戏","parent_id":6,"name":"边境","id":763},{"parent_name":"单机游戏","parent_id":6,"name":"战神","id":579},{"parent_name":"单机游戏","parent_id":6,"name":"全面战争：战锤3","id":594},{"parent_name":"单机游戏","parent_id":6,"name":"无主之地3","id":273},{"parent_name":"单机游戏","parent_id":6,"name":"辐射76","id":220},{"parent_name":"单机游戏","parent_id":6,"name":"红色警戒2","id":693},{"parent_name":"单机游戏","parent_id":6,"name":"不羁联盟","id":764},{"parent_name":"单机游戏","parent_id":6,"name":"糖豆人","id":357},{"parent_name":"单机游戏","parent_id":6,"name":"霓虹序列","id":766},{"parent_name":"单机游戏","parent_id":6,"name":"战锤40K:暗潮","id":723},{"parent_name":"单机游戏","parent_id":6,"name":"Dread Hunger","id":591},{"parent_name":"单机游戏","parent_id":6,"name":"森林之子","id":751},{"parent_name":"单机游戏","parent_id":6,"name":"聚会游戏","id":636},{"parent_name":"单机游戏","parent_id":6,"name":"生化危机","id":721},{"parent_name":"单机游戏","parent_id":6,"name":"方舟","id":295},{"parent_name":"单机游戏","parent_id":6,"name":"艾尔登法环","id":555},{"parent_name":"单机游戏","parent_id":6,"name":"歧路旅人2","id":752},{"parent_name":"单机游戏","parent_id":6,"name":"Roblox","id":753},{"parent_name":"单机游戏","parent_id":6,"name":"只狼","id":245},{"parent_name":"单机游戏","parent_id":6,"name":"风帆纪元","id":739},{"parent_name":"单机游戏","parent_id":6,"name":"其他单机","id":235},{"parent_name":"单机游戏","parent_id":6,"name":"游戏速通","id":678},{"parent_name":"单机游戏","parent_id":6,"name":"恐怖游戏","id":276},{"parent_name":"单机游戏","parent_id":6,"name":"恐鬼症","id":387},{"parent_name":"单机游戏","parent_id":6,"name":"使命召唤19","id":282},{"parent_name":"单机游戏","parent_id":6,"name":"我的世界","id":216},{"parent_name":"单机游戏","parent_id":6,"name":"仁王2","id":313},{"parent_name":"单机游戏","parent_id":6,"name":"THE FINALS","id":754},{"parent_name":"单机游戏","parent_id":6,"name":"FORZA 极限竞速","id":302},{"parent_name":"单机游戏","parent_id":6,"name":"全面战争","id":257},{"parent_name":"单机游戏","parent_id":6,"name":"塞尔达传说","id":308},{"parent_name":"单机游戏","parent_id":6,"name":"鬼泣5","id":244},{"parent_name":"单机游戏","parent_id":6,"name":"法外枭雄:滚石城","id":757},{"parent_name":"单机游戏","parent_id":6,"name":"SIFU","id":587},{"parent_name":"单机游戏","parent_id":6,"name":"FIFA23","id":708},{"parent_name":"单机游戏","parent_id":6,"name":"命运2","id":277},{"parent_name":"单机游戏","parent_id":6,"name":"精灵宝可梦","id":228},{"parent_name":"单机游戏","parent_id":6,"name":"文字游戏","id":583},{"parent_name":"单机游戏","parent_id":6,"name":"主机游戏","id":236},{"parent_name":"单机游戏","parent_id":6,"name":"植物大战僵尸","id":309},{"parent_name":"单机游戏","parent_id":6,"name":"人类一败涂地","id":270},{"parent_name":"单机游戏","parent_id":6,"name":"战地风云","id":597},{"parent_name":"单机游戏","parent_id":6,"name":"骑马与砍杀","id":326},{"parent_name":"单机游戏","parent_id":6,"name":"泰拉瑞亚","id":593},{"parent_name":"单机游戏","parent_id":6,"name":"体育游戏","id":500},{"parent_name":"单机游戏","parent_id":6,"name":"宝可梦集换式卡牌游戏","id":720},{"parent_name":"单机游戏","parent_id":6,"name":"斯普拉遁3","id":694},{"parent_name":"单机游戏","parent_id":6,"name":"枪火重生","id":364}],"知识":[{"parent_name":"知识","parent_id":11,"name":"全部","id":0},{"parent_name":"知识","parent_id":11,"name":"科学科普","id":701},{"parent_name":"知识","parent_id":11,"name":"社科法律心理","id":376},{"parent_name":"知识","parent_id":11,"name":"职场·技能","id":377},{"parent_name":"知识","parent_id":11,"name":"科技","id":375},{"parent_name":"知识","parent_id":11,"name":"人文历史","id":702},{"parent_name":"知识","parent_id":11,"name":"校园学习","id":372}]}`);
        const parent_nameArr = Object.keys(jsonArr);
        for (let v of jsonArr["手游"]) {
            const id = v["id"];
            const name = v["name"];
            select_name.append(`<option value="${id}">${name}</option>`);
        }
        const map = new Map();
        for (let v of parent_nameArr) {
            const id = jsonArr[v][0]["parent_id"];
            const name = jsonArr[v][0]["parent_name"];
            map.set(id, name);
        }

        map.forEach((value, key, map) => {
            select_parent_name.append($(`<option value=${key}>${value}</option>`));
        });

        /**
         *
         * @param {number|string}key 父级分区id
         */
        function flushedSelectFun(key) {
            const tempVar = map.get(parseInt(key));
            select_name.children().remove();
            for (let v of jsonArr[tempVar]) {
                const id = v["id"];
                const name = v["name"];
                select_name.append(`<option value="${id}">${name}</option>`);
            }
        }

        select_parent_name.change(() => {
            flushedSelectFun(select_parent_name.val());
        });
        okBut.click(() => {
            const select_parent_ID = select_parent_name.val();
            const select_name_ID = select_name.val();
            const select_nameText = select_name.find("option:selected").text();
            const loading = Qmsg.loading(`正在获取${select_nameText}分区直播列表信息`);
            const liveListChildren = liveList.children(".bili-dyn-live-users__body").children();
            if (liveListChildren.length !== 0) {
                liveListChildren.remove();
            }
            tempFunc(select_parent_ID, select_name_ID, loading);
        });
        findBut.click(() => {
            const content = prompt("请输入你要查询的子分区");
            if (content == null) {
                return;
            }
            if (content === "") {
                Qmsg.error("请正确输入你的内容");
                return;
            }
            for (let v of parent_nameArr) {
                for (let j of jsonArr[v]) {
                    const parent_name = j["parent_name"];
                    const parent_id = j["parent_id"];
                    const name = j["name"];
                    const id = j["id"];
                    if (!name.includes(content)) {
                        continue;
                    }
                    select_parent_name.val(parent_id);
                    flushedSelectFun(parent_id);
                    select_name.val(id);
                    Qmsg.success(`已找到${parent_name}的${name}`);
                    console.log(parent_name, parent_id, name, id)
                    return;
                }
            }
            Qmsg.error(`未找到${content}分区的信息`);
        });
        openBut.click(() => {
            const select_parent_ID = select_parent_name.val();
            const select_name_ID = select_name.val();
            Util.openWindow(`https://live.bilibili.com/p/eden/area-tags?areaId=${select_name_ID}&parentAreaId=${select_parent_ID}`);
        });

        liveLayout.append(select_parent_name);
        liveLayout.append(select_name);
        liveLayout.append(okBut);
        liveLayout.append(findBut);
        liveLayout.append(openBut);
        const liveList = HtmlStr.getLiveList("直播分区-");
        liveLayout.append(liveList);
        const flushBut = $(`<div style="display: flex;justify-content: center;">
<div style="display: none">
<button>加载更多</button>
</div>
</div>`);
        liveLayout.append(flushBut);
        liveLayout.append(`<hr>`);
        const sessdata = LocalData.getSESSDATA();
        if (sessdata !== null) {
            Qmsg.success("用户配置了sessdata");
            followListLive();
        }

        flushBut.click(() => {
            const select_parent_ID = select_parent_name.val();
            const select_name_ID = select_name.val();
            const select_nameText = select_name.find("option:selected").text();
            const loading = Qmsg.loading(`正在获取${select_nameText}分区直播列表信息`);
            tempFunc(select_parent_ID, select_name_ID, loading);
        });

        function tempFunc(parent_id, id, qmLoading) {
            const tempE = $("#liveLayout .bili-dyn-live-users__body:eq(1)");
            if (tempE.length === 0) {
                Qmsg.error("布局异常");
                qmLoading.close();
                return;
            }
            let partitionPage = trends.data.getPartitionPage(id);
            HttpUtil.getLiveList(parent_id, id, partitionPage, "", (res) => {
                const body = JSON.parse(res.responseText);
                const code = body["code"];
                const message = body["message"];
                if (code !== 0) {
                    const info = "获取直播分区信息错误！" + message;
                    Qmsg.error(info);
                    console.log(info);
                    qmLoading.close();
                    return;
                }
                const list = body["data"]["list"];
                if (list.length === 0) {
                    trends.data.setPartitionBool(id, true);
                    qmLoading.close();
                    Qmsg.success(`累计获取到${trends.data.partitionEndTypeLiveName}分区的${tempE.children().length}个直播间`);
                    flushBut.find("div").hide();
                    return;
                }
                for (let v of list) {
                    const roomid = v["roomid"];
                    const title = v["title"];
                    const uname = v["uname"];
                    const uid = v["uid"];
                    if (Shield.arrKey(LocalData.getArrUID(), uid)) {
                        const tempInfo = `已通过UID，过滤用户【${uname}】 uid【${uid}】`;
                        Print.ln(tempInfo);
                        Qmsg.success(tempInfo);
                        continue;
                    }
                    const face = v["face"];
                    const cover = v["cover"];//封面
                    const system_cover = v["system_cover"];//关键帧
                    const parent_name = v["parent_name"];//父级分区
                    const area_name = v["area_name"];//子级分区
                    trends.data.partitionEndTypeLiveName = `${parent_name}-${area_name}`;
                    const liveItem = HtmlStr.getLiveItem(uname, uid, roomid, face, title);
                    tempE.append(liveItem);
                }
                qmLoading.close();
                const tempIndex = tempE.children().length;
                if (tempIndex === 0) {
                    Qmsg.info("未获取到指定分区正在直播的用户");
                    flushBut.find("div").hide();
                    qmLoading.close();
                    return;
                }
                $("#liveLayout .bili-dyn-live-users__title>span:eq(1)").text(`${tempIndex}`);
                Qmsg.success(`本轮已获取到${trends.data.partitionEndTypeLiveName}分区的${list.length}个直播间`);
                if (list.length < 20) {
                    flushBut.find("div").hide();
                } else {
                    flushBut.find("div").show();
                    trends.data.setPartitionPage(id, ++partitionPage);
                }
            }, (err) => {
                Qmsg.error("错误信息" + err);
                qmLoading.close();
            });
        };

        function tempLoadIng() {
            const interval01 = setInterval(() => {
                const tempList = document.querySelectorAll(".bili-dyn-list__items>.bili-dyn-list__item");
                if (tempList.length === 0) {
                    return;
                }
                clearInterval(interval01);
                shrieDynamicItems(tempList);
            }, 1000);
            const tempE01 = $(".bili-dyn-list__items");
            if (Util.isEventJq(tempE01, "DOMNodeInserted")) {
                return;
            }
            tempE01.bind("DOMNodeInserted", () => {
                shrieDynamicItems(tempE01.children());
            });
        }

        tempLoadIng();
        const interval02 = setInterval(() => {
            const tempE = $(".bili-dyn-up-list__content");
            if (tempE.length === 0) {
                return;
            }
            const list = tempE.children();
            if (list === null || list.length === 0) {
                return;
            }
            clearInterval(interval02);
            list.click(() => {
                tempLoadIng();
            });
        }, 1000);
    }
    if (href.includes("search.bilibili.com")) {
        $("#biliMainFooter").remove();
        console.log("已清空底部信息");
        $(".side-buttons.flex_col_end p_absolute").remove();
        console.log("已移除bilibili右侧悬浮按钮");
        return;
    }
    if (href.includes("www.bilibili.com/v/channel")) {
        const interval01 = setInterval(() => {
            const nav_link_ulMini = $(".nav-link-ul.mini");
            if (nav_link_ulMini.length === 0) {
                return;
            }
            clearInterval(interval01);
            const item = $(".nav-link-item:contains('下载'),.nav-link-item:contains('赛事'),.nav-link-item:contains('漫画'),.nav-link-item:contains('会员购')");
            console.log(item);
            item.remove();
            $(".navbar_logo").remove();//移除左上角的bilibili的LOGO
            console.log("已移除坐上顶栏部分项目");
        }, 1000);
        return;
    }
    if ((href.includes("www.bilibili.com") && windonsTitle === "哔哩哔哩 (゜-゜)つロ 干杯~-bilibili") || (href.includes("t.bilibili.com") & windonsTitle === "动态首页-哔哩哔哩")) {
        const interval01 = setInterval(() => {
            const login = $(".lt-col>.login-tip:contains('立即登录')");
            if (login.length === 0) {
                return;
            }
            clearInterval(interval01);
            login.remove();
            console.log("已移除页面右下角的提示登录");
        }, 1000);
        const interval02 = setInterval(() => {
            const login = $(".login-panel-popover");
            if (login.length === 0) {
                return;
            }
            clearInterval(interval02);
            login.remove();
            console.log("已移除页面的提示登录信息");
        }, 1000);
    }
}


function bilibili(href) {
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
            if (Shield.arrKey(LocalData.getArrUID(), uid)) {
                Print.video("yellow", "已通过UID屏蔽", userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`)
                return true;
            }
            const isNameKey = Shield.arrContent(LocalData.getArrNameKey(), userName);
            if (isNameKey != null) {
                Print.video(null, `已通过用户名模糊屏蔽规则【${isNameKey}】`, userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`)
                return true;
            }
            const isTitleKey = Shield.arrContent(LocalData.getArrTitle(), videoTitle);
            if (isTitleKey != null) {
                Print.video("#66CCCC", `已通过标题模糊屏蔽规则=【${isTitleKey}】`, userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`);
                return true;
            }
            const isTitleKeyCanonical = Shield.arrContentCanonical(LocalData.getArrTitleKeyCanonical(), videoTitle);
            if (isTitleKeyCanonical != null) {
                Print.video("#66CCCC", `已通过标题正则表达式屏蔽规则=${isTitleKeyCanonical}`, userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`);
                return true;
            }
            $(".container.is-version8").append(
                addElement.homeVideoE.getHtmlStr(
                    videoTitle, "https://www.bilibili.com/" + bvid, pic, uid, userName, duration, ctimeStr,
                    Util.getNumberFormat(view), Util.getNumberFormat(danmaku))
            );
            $("div[class='bili-video-card is-rcmd']:last").mouseenter((e) => {
                const domElement = e.delegateTarget;//dom对象
                const title = domElement.querySelector(".bili-video-card__info--tit").textContent;
                const userInfo = domElement.querySelector(".bili-video-card__info--owner");
                const userHref = userInfo.href;
                const uerName = domElement.querySelector(".bili-video-card__info--author").textContent;
                Util.showSDPanel(e, uerName, userHref.substring(userHref.lastIndexOf("/") + 1), title);
            });
        }

        //加载分区视频数据
        function loadingVideoE(ps) {
            const loading = Qmsg.loading("正在加载数据！");
            HttpUtil.get(`https://api.bilibili.com/x/web-interface/dynamic/region?ps=${ps}&rid=${LocalData.getVideo_zone()}`, function (res) {
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
                    const cid = v["cid"];
                    const ctime = v["ctime"];//视频审核时间时间戳
                    const pubdate = v["pubdate"];//视频上传时间时间戳
                    const ctimeStr = Util.timestampToTime(ctime * 1000);//发布时间
                    const duration = v["duration"];//视频时长秒，专区-存数字时间
                    const bvidSub = bvid.substring(0, bvid.indexOf("?"));
                    bvid = (bvidSub === "" ? bvid : bvidSub);
                    if (tempFunc(uid, videoTitle, name, bvid, Util.formateTime(duration), ctimeStr, view, danmaku, picUil)) {
                        Qmsg.info("过滤了视频！！");
                    }
                }
                loading.close();
            });
        }


        const interval01 = setInterval(() => {
            const recommended = $(".recommended-container_floor-aside");
            if (recommended.length === 0) {
                return;
            }
            clearInterval(interval01);
            recommended.prepend(`<div style="display: flex; flex-direction: row-reverse">
<button class="primary-btn roll-btn" id="replaceItBut" style="  height: 38px;position: fixed;    z-index: 100; background-color: #17181A; "><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style="--darkreader-inline-fill:currentColor;" data-darkreader-inline-fill=""><path d="M8.624933333333333 13.666666666666666C8.624933333333333 14.011849999999999 8.345125 14.291666666666666 7.999933333333333 14.291666666666666C4.525166666666666 14.291666666666666 1.7082933333333332 11.474791666666665 1.7082933333333332 8C1.7082933333333332 6.013308333333333 2.629825 4.2414233333333335 4.066321666666667 3.089385C4.335603333333333 2.8734283333333335 4.728959999999999 2.9166533333333335 4.944915 3.1859349999999997C5.160871666666666 3.4552099999999997 5.1176466666666665 3.848573333333333 4.848366666666666 4.0645283333333335C3.694975 4.98953 2.9582933333333328 6.40852 2.9582933333333328 8C2.9582933333333328 10.784416666666667 5.215528333333333 13.041666666666666 7.999933333333333 13.041666666666666C8.345125 13.041666666666666 8.624933333333333 13.321483333333333 8.624933333333333 13.666666666666666zM11.060475 12.810558333333333C10.844225000000002 12.541558333333331 10.887033333333335 12.148125 11.156041666666667 11.931875C12.306858333333333 11.006775 13.041599999999999 9.589424999999999 13.041599999999999 8C13.041599999999999 5.215561666666666 10.784408333333332 2.958333333333333 7.999933333333333 2.958333333333333C7.6548083333333325 2.958333333333333 7.374933333333333 2.6785083333333333 7.374933333333333 2.333333333333333C7.374933333333333 1.9881533333333332 7.6548083333333325 1.7083333333333333 7.999933333333333 1.7083333333333333C11.474725000000001 1.7083333333333333 14.291599999999999 4.525206666666667 14.291599999999999 8C14.291599999999999 9.984108333333333 13.372483333333332 11.753958333333332 11.939225 12.906125C11.670166666666663 13.122375 11.276725 13.079625 11.060475 12.810558333333333z" fill="currentColor" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"></path><path d="M1.375 3.4130866666666666C1.375 3.0679066666666666 1.654825 2.7880866666666666 2 2.7880866666666666L4.333333333333333 2.7880866666666666C4.862608333333333 2.7880866666666666 5.291666666666666 3.2171449999999995 5.291666666666666 3.7464199999999996L5.291666666666666 6.079753333333334C5.291666666666666 6.424928333333334 5.011841666666666 6.704736666666666 4.666666666666666 6.704736666666666C4.321491666666667 6.704736666666666 4.041666666666666 6.424928333333334 4.041666666666666 6.079753333333334L4.041666666666666 4.038086666666667L2 4.038086666666667C1.654825 4.038086666666667 1.375 3.7582616666666664 1.375 3.4130866666666666z" fill="currentColor" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"></path><path d="M14.625 12.5864C14.625 12.931591666666666 14.345183333333333 13.2114 14 13.2114L11.666666666666666 13.2114C11.137408333333335 13.2114 10.708333333333332 12.782383333333332 10.708333333333332 12.253066666666665L10.708333333333332 9.919733333333333C10.708333333333332 9.574608333333334 10.98815 9.294733333333333 11.333333333333332 9.294733333333333C11.678516666666667 9.294733333333333 11.958333333333332 9.574608333333334 11.958333333333332 9.919733333333333L11.958333333333332 11.9614L14 11.9614C14.345183333333333 11.9614 14.625 12.241275000000002 14.625 12.5864z" fill="currentColor" data-darkreader-inline-fill="" style="--darkreader-inline-fill:currentColor;"></path></svg>
<span>换一换</span></button>
</div>`);
            $("#replaceItBut").click(() => {
                const temp = Home.getPushType();
                if (Home.videoIndex <= 50 && temp === "分区") {
                    Home.videoIndex += 10;
                }
                if (temp === "分区") {
                    loadingVideoE(Home.videoIndex);
                } else {
                    loadingVideoZE();
                }
            });
        }, 1000);

        const interval02 = setInterval(() => {
            const homeGrid = $(".container.is-version8");
            if (homeGrid === null || homeGrid === undefined || homeGrid.children().length === 0) {
                return;
            }
            clearInterval(interval02);
            homeGrid.html("");//先清空该标签的内容
            if (Home.getPushType() === "分区") {
                loadingVideoE(25);
            } else {
                loadingVideoZE();
            }
            // //首页
            Home.stypeBody();
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
    if (href.includes("www.bilibili.com/v/")) {
        homePrefecture();
        return;
    }
    if (href.includes("space.bilibili.com/[0-9]+/dynamic") !== -1) {
        const interval01 = setInterval(() => {
            const tempE = $(".bili-dyn-list__items");
            if (tempE.length === 0) {
                return;
            }
            const list = tempE.children();
            if (list.length === 0) {
                return;
            }
            clearInterval(interval01);
            shrieDynamicItems(list);
            if (Util.isEventJq(tempE, "DOMNodeInserted")) {
                clearInterval(interval01);
                return;
            }
            tempE.bind("DOMNodeInserted", () => {
                shrieDynamicItems($(".bili-dyn-list__items").children());
            });
        }, 1000);
    }


}

/**
 * 屏蔽动态页动态项目
 */
function shrieDynamicItems(list) {
    for (let v of list) {
        let tempE = v.querySelector(".bili-rich-text");
        if (tempE === null || tempE.length === 0) {//没有说明是其他的类型动态，如投稿了视频且没有评论显示

            continue;
        }
        const tempContent = tempE.textContent;
        const contentKey = Shield.arrContent(LocalData.getDynamicArr(), tempContent);
        if (contentKey == null) {
            continue;
        }
        v.remove();
        const tempInfo = `已通过动态关键词【${contentKey}】屏蔽了动态【${tempContent}】`;
        Qmsg.success(tempInfo);
        Print.ln(tempInfo);
    }
}

/**
 * 中中针对于分区的广告页脚信息屏蔽
 */
function homePrefecture() {
    Util.circulateID("biliMainFooter", 2000, "已移除底部信息");
    Util.circulateClassName("primary-btn feedback visible", 2000, "已移除右侧悬浮按钮");
    for (let v of document.querySelectorAll(".eva-banner")) {
        v.remove();
        console.log("已移除界面中的横幅广告");
    }
}


