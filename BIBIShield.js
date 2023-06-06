// ==UserScript==
// @name         b站屏蔽增强器
// @namespace    http://tampermonkey.net/
// @license      MIT
// @version      1.1.51
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
// @require      https://hangexi.gitee.io/bibibspuservideomonkeyscript/util/Util.js
// @require      https://hangexi.gitee.io/bibibspuservideomonkeyscript/LocalData.js
// @require      https://hangexi.gitee.io/bibibspuservideomonkeyscript/Bilibili.js
// @require      https://hangexi.gitee.io/bibibspuservideomonkeyscript/BilibiliOne.js
// @icon         https://static.hdslb.com/images/favicon.ico
// @connect      bilibili.com
// @connect      vip.mikuchase.ltd
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
        //是否移除播放页右侧的的布局，其中包括【视频作者】【弹幕列表】【视频列表】和右侧相关的广告
        isRhgthlayout: false,
        //是否要移除右侧播放页的视频列表
        isrigthVideoList: false,
        //是否移除视频页播放器下面的标签，也就是Tag
        isTag: false,
        //是否移除视频页播放器下面的简介
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
    //是否隐藏了面板
    myidClickIndex: true,
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
    hideDisplayHomeLaylout: function () {//隐藏显示面板
        const home_layout = document.getElementById("home_layout");
        if (Home.myidClickIndex) {
            home_layout.style.display = "block";
            Home.myidClickIndex = false;
            return;
        }
        home_layout.style.display = "none";
        Home.myidClickIndex = true;
    },
    homePrefecture: function () {//针对于分区的广告页脚信息屏蔽
        Util.circulateID("biliMainFooter", 2000, "已移除底部信息");
        Util.circulateClassName("primary-btn feedback visible", 2000, "已移除右侧悬浮按钮");
        for (let v of document.querySelectorAll(".eva-banner")) {
            v.remove();
            console.log("已移除界面中的横幅广告");
        }
    },
    openTab: function (e) {// 点击标签时执行此函数
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
    }
}

//判断内容是否匹配上元素
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

//针对内容符合规则的删除元素并返回状态值
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
        const min = LocalData.video.getFilterSMin();
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
        const max = LocalData.video.getfilterSMax();
        if (max === 0 || max < LocalData.video.getFilterSMin() || max === null) {//如果最大值为0，则不需要执行了，和当最小值大于最大值也不执行
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
        const min = LocalData.video.getBroadcastMin();
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
        const max = LocalData.video.getBroadcastMax();
        if (max === 0 || max < LocalData.video.getBroadcastMin() || max === null) {//如果最大值为0，则不需要执行了，和当最小值大于最大值也不执行
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
        if (LocalData.video.getBarrageQuantityMin() > key) {
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
        const max = LocalData.video.getBarrageQuantityMax();
        if (max === 0 || LocalData.video.getBarrageQuantityMin() > max) {
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

//添加元素
const addElement = {
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

function startMonitorTheNetwork() {//监听网络变化
    const observer = new PerformanceObserver(perf_observer);
    observer.observe({entryTypes: ['resource']});
}

const urleCrud = {//规则的增删改查
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
            Print.video(null, `已过滤视频播放量小于=【${LocalData.video.getBroadcastMin()}】的视频`, name, uid, title, videoHref);
            return true;
        }
        if (Remove.videoMaxPlaybackVolume(element, change)) {
            Print.video(null, `已过滤视频播放量大于=【${LocalData.video.getBroadcastMax()}】的视频`, name, uid, title, videoHref);
            return true;
        }
    }
    if (videoTime === null) {
        return false;
    }
    const timeTotalSeconds = Util.getTimeTotalSeconds(videoTime);
    if (Remove.videoMinFilterS(element, timeTotalSeconds)) {
        Print.video(null, `已通过视频时长过滤时长小于=【${LocalData.video.getFilterSMin()}】秒的视频`, name, uid, title, videoHref);
        return true;
    }
    if (Remove.videoMaxFilterS(element, timeTotalSeconds)) {
        Print.video(null, `已过滤时长大于=【${LocalData.video.getfilterSMax()}】秒的视频`, name, uid, title, videoHref);
        return true;
    }
    return false;
}

//消息中心
const message = {//消息中心
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

//针对视频播放页的相关方法
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
    }, commentArea: function () {
        if (LocalData.getDelVideoCommentSections()) {
            Util.circulateID("comment", 1500, "已移除评论区");
        }
    }, //针对视频播放页右侧的视频进行过滤处理。该界面无需用时长过滤，视频数目较少
    rightVideo: async function () {//异步形式执行
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
    },
    click_playerCtrlWhid: function () {//点击播放器的宽屏按钮
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

const greatDemand = {//热门
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

const search = {//搜索
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
    searchColumn: function () {//根据规则屏蔽搜索专栏项目
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
}

const subjectOfATalk = {//话题
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

function loadPartition() {//加载下拉框中的分区
    const tempVar = Home.data.video_zoneList;
    for (const v in tempVar) {
        $("#video_zoneSelect").append(`<option value=${v}>${tempVar[v]}</option>`);
    }
}

function loadChannel() {//加载下拉框中的频道信息
    const list = frequencyChannel.data.channel_idList;
    for (const v in list) {
        $("#video_zoneSelect").append(`<option value=${v}>${list[v]}</option>`);
    }
}

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
        Home.openTab(domElement.value);
    });
    Util.suspensionBall(document.getElementById("suspensionDiv"));
    Rule.ruleLength();
    Rule.showInfo();
    $("#mybut").click(() => Home.hideDisplayHomeLaylout());

    $(document).keyup(function (event) {//单按键监听-按下之后松开事件
        const keycode = event.keyCode;
        if (keycode === 192) {//按下`按键显示隐藏面板
            Home.hideDisplayHomeLaylout();
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
        Util.fileDownload(JSON.stringify(arr), "评论区列表-" + Util.toTimeString());
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
        Util.fileDownload(JSON.stringify(array), Util.toTimeString() + "直播间高能用户列表.json");
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
                toTime: Util.timestampToTime(timeDate)
            };
            if (type === "1") {
                data["imge"] = v.getAttribute("data-image");
            }
            arrData.push(data);
        }
        Util.fileDownload(JSON.stringify(arrData), Util.toTimeString() + "_直播间弹幕内容.json");
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
        Util.setData(typeV, parseInt(inputVideoV));
        const info = `已设置${name}的具体值【${inputVideoV}】，为0则不生效`;
        Print.ln(info);
        Qmsg.success(info);
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
        switch (selectedText) {
            case "全部规则到文件":
                let s = prompt("保存为", "规则-" + Util.toTimeString());
                if (s === null) {
                    return;
                }
                if (s.includes(" ") || s === "" || s.length === 0) {
                    s = "规则";
                }
                Util.fileDownload(Util.getRuleFormatStr(), s + ".json");
                break;
            case "全部规则到剪贴板":
                Util.copyToClip(Util.getRuleFormatStr());
                break;
            case "全部UID规则到文件":
                const list = LocalData.getArrUID();
                Util.fileDownload(JSON.stringify(list), `UID规则-${list.length}个.json`);
                break;
            case "全部UID规则到云端":
                alert("暂不支持");
                break;
            case "全部规则到云端账号":
                const getInfo = LocalData.AccountCenter.getInfo();
                if (getInfo === {} || Object.keys(getInfo).length === 0) {
                    alert("请先登录在进行操作.");
                    return;
                }
                if (!confirm("确定要将本地规则导出到对应账号的云端上吗")) {
                    return;
                }
                const loading = Qmsg.loading("请稍等...");
                $.ajax({
                    type: "POST",
                    url: "https://vip.mikuchase.ltd/bilibili/shieldRule/",
                    data: {
                        model: "All",
                        userName: getInfo["userName"],
                        userPassword: getInfo["userPassword"],
                        postData: Util.getRuleFormatStr()
                    },
                    dataType: "json",
                    success: function (data) {
                        loading.close();
                        const message = data["message"];
                        if (data["code"] !== 1) {
                            Qmsg.error(message);
                            return;
                        }
                        Qmsg.success(message);
                        console.log(data["dataJson"])
                    }, error: function (xhr, status, error) { //请求失败的回调函数
                        loading.close();
                        console.log(error);
                        console.log(status);
                    }
                });
                break;
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
            Util.fileDownload(JSON.stringify(list), "b站账号弹幕屏蔽设定规则.json");
        }
    });

    function rulesAreImportedLocally(ruleRes) {//规则导入本地
        let list = ruleRes["用户名黑名单模式(精确匹配)"];
        LocalData.setArrName(list);
        list = ruleRes["用户名黑名单模式(模糊匹配)"];
        LocalData.setArrNameKey(list);
        list = ruleRes["用户uid黑名单模式(精确匹配)"];
        LocalData.setArrUID(list)
        list = ruleRes["用户uid白名单模式(精确匹配)"];
        LocalData.setArrWhiteUID(list);
        list = ruleRes["标题黑名单模式(模糊匹配)"];
        LocalData.setArrTitle(list);
        list = ruleRes["标题黑名单模式(正则匹配)"];
        LocalData.setArrTitleKeyCanonical(list);
        list = ruleRes["评论关键词黑名单模式(模糊匹配)"];
        Util.setData("commentOnKeyArr", list);
        list = ruleRes["评论关键词黑名单模式(正则匹配)"];
        LocalData.setArrContentOnKeyCanonicalArr(list);
        list = ruleRes["粉丝牌黑名单模式(精确匹配)"];
        LocalData.setFanCardArr(list)
        list = ruleRes["专栏关键词内容黑名单模式(模糊匹配)"];
        LocalData.setContentColumnKeyArr(list)
        list = ruleRes["动态关键词内容黑名单模式(模糊匹配)"];
        LocalData.setDynamicArr(list);
        Rule.ruleLength();
        alert("已导入");
    }

//导入按钮事件
    $("#inputExport").click(function () {
        const selectedText = $('#inputRuleSelect option:selected').text();
        let content = $("#ruleEditorInput").val();
        switch (selectedText) {
            case "从云端账号导入覆盖本地规则":
                const getInfo = LocalData.AccountCenter.getInfo();
                if (getInfo === {} || Object.keys(getInfo).length === 0) {
                    alert("请先登录在进行操作.");
                    return;
                }
                if (!confirm("确定要云端账号对应的规则导入并覆盖到本地吗？")) {
                    return;
                }
                const loading = Qmsg.loading("请稍等...");
                $.ajax({
                    type: "GET",
                    url: "https://vip.mikuchase.ltd/bilibili/shieldRule/",
                    data: {
                        userName: getInfo["userName"],
                        userPassword: getInfo["userPassword"]
                    },
                    dataType: "json",
                    success: function (data) {
                        loading.close();
                        const message = data["message"];
                        if (data["code"] !== 1) {
                            Qmsg.error(message);
                            return;
                        }
                        Qmsg.success(message);
                        const time = data["data"]["time"];
                        const ruleRes = data["data"]["ruleRes"];
                        console.log(time);
                        console.log(ruleRes);
                        rulesAreImportedLocally(ruleRes);
                    }, error: function (xhr, status, error) { //请求失败的回调函数
                        loading.close();
                        console.log(error);
                        console.log(status);
                    }
                });
                break;
            case "全部规则":
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
                rulesAreImportedLocally(jsonRule);
                break;
            case "确定合并导入UID规则":
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
                break;
            case "本地b站弹幕屏蔽规则":
                alert("暂时未写")
                break;
        }
    });


    $('#inputRuleSelect').change(() => {//监听模式下拉列表
        const selectedText = $('#inputRuleSelect option:selected').text();
        const editorInput = $("#ruleEditorInput");
        if (selectedText === "从下面编辑框导入全部规则" || selectedText === "从下面编辑框合并导入UID规则") {
            editorInput.show();
            return;
        }
        editorInput.hide();
    });

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