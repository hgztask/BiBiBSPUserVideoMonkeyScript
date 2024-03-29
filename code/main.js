//主入口
const Rule = {
    //TODO 后续把对应关联的变量清除修改
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
        //是否取消对播放页右侧列表的视频内容过滤屏蔽处理，如果播放页出现，加载不出页面图片，情况建议开启该功能
        isRightVideo: false
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
        r: 255,
        g: 255,
        b: 255,
        a: 1
    },
    data: {
        //分区rid对应的类型
        video_zoneList: JSON.parse(`{"1":"动画(主分区)","3":"音乐(主分区)","4":"游戏(主分区)","5":"娱乐(主分区)","11":"电视剧(主分区)","13":"番剧(主分区)","17":"单机游戏","19":"Mugen","20":"宅舞","21":"日常","22":"鬼畜调教","23":"电影(主分区)","24":"MAD·AMV","25":"MMD·3D","26":"音MAD","27":"综合","28":"原创音乐","29":"音乐现场","30":"VOCALOID·UTAU","31":"翻唱","32":"完结动画","33":"连载动画","36":"知识(主分区)","37":"人文·历史","47":"短片·手书·配音","51":"资讯","59":"演奏","65":"网络游戏","71":"综艺","75":"动物综合","76":"美食制作( 原[生活]->[美食圈] )","83":"其他国家","85":"小剧场","86":"特摄","95":"数码( 原手机平板 )","119":"鬼畜(主分区)","121":"GMV","122":"野生技术协会","124":"社科·法律·心理( 原社科人文、原趣味科普人文 )","126":"人力VOCALOID","127":"教程演示","129":"舞蹈(主分区)","130":"音乐综合","136":"音游","137":"明星综合","138":"搞笑","145":"欧美电影","146":"日本电影","147":"华语电影","152":"官方延伸","153":"国产动画","154":"舞蹈综合","155":"时尚(主分区)","156":"舞蹈教程","157":"美妆护肤","158":"穿搭","159":"时尚潮流","160":"生活(主分区)","161":"手工","162":"绘画","164":"健身","167":"国创(主分区)","168":"国产原创相关","169":"布袋戏","170":"资讯","171":"电子竞技","172":"手机游戏","173":"桌游棋牌","176":"汽车生活","177":"纪录片(主分区)","178":"科学·探索·自然","179":"军事","180":"社会·美食·旅行","181":"影视(主分区)","182":"影视杂谈","183":"影视剪辑","184":"预告·资讯","185":"国产剧","187":"海外剧","188":"科技(主分区)","193":"MV","195":"动态漫·广播剧","198":"街舞","199":"明星舞蹈","200":"中国舞","201":"科学科普","202":"资讯(主分区)","203":"热点","204":"环球","205":"社会","206":"综合","207":"财经商业","208":"校园学习","209":"职业职场","210":"手办·模玩","211":"美食(主分区)","212":"美食侦探","213":"美食测评","214":"田园美食","215":"美食记录","216":"鬼畜剧场","217":"动物圈(主分区)","218":"喵星人","219":"汪星人","220":"大熊猫","221":"野生动物","222":"爬宠","223":"汽车(主分区)","227":"购车攻略","228":"人文历史","229":"设计·创意","230":"软件应用","231":"计算机技术","232":"科工机械 ( 原工业·工程·机械 )","233":"极客DIY","234":"运动(主分区)","235":"篮球","236":"竞技体育","237":"运动文化","238":"运动综合","239":"家居房产","240":"摩托车","241":"娱乐杂谈","242":"粉丝创作","243":"乐评盘点","244":"音乐教学","245":"赛车","246":"改装玩车","247":"新能源车","248":"房车","249":"足球","250":"出行","251":"三农","252":"仿妆cos","253":"动漫杂谈"}`)
    },
    //是否隐藏了面板
    myidClickIndex: true,
    //是否初次点击了规则中心按钮
    isFirstRuleCenterLayoutClick: false,
    /**
     *
     * @return {string}
     */
    getPushType() {
        const data = Util.getData("pushType");
        if (data === null || data === undefined) {
            return "分区";
        }
        return data;
    },
    setPushType(key) {
        Util.setData("pushType", key);
    },
    getBackgroundStr() {
        return Util.getRGBA(this.background.r, this.background.g, this.background.b, this.background.a);
    },
    //调整首页样式
    stypeBody() {
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
    startShieldMainVideo(str) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                let list = document.querySelectorAll(str);
                if (list.length === 0) {
                    return;
                }
                clearInterval(interval);
                $(".floor-single-card").remove();
                $(".bili-live-card").remove();
                for (let v of list) {
                    let videoInfo, title, upName, upSpatialAddress, videoAddress, videoTime, playbackVolume;//可以一排定义
                    const videoClass = new VideoClass();
                    try {
                        videoInfo = v.querySelector(".bili-video-card__info--right");
                        const titleInfo = videoInfo.querySelector(".bili-video-card__info--tit");
                        upSpatialAddress = videoInfo.querySelector(".bili-video-card__info--owner").getAttribute("href");//用户空间地址
                        const topInfo = v.querySelectorAll(".bili-video-card__stats--left .bili-video-card__stats--item");//1播放量2弹幕数
                        videoClass.setTitle(titleInfo.getAttribute("title"))
                            .setVideoAddress(titleInfo.querySelector("a").href)
                            .setUpName(videoInfo.querySelector(".bili-video-card__info--author").title)
                            .setUid(Util.getSubWebUrlUid(upSpatialAddress))
                            .setVideoTime(v.querySelector(".bili-video-card__stats__duration").textContent)
                            .setPlaybackVolume(topInfo[0].textContent)
                            .setE(v);
                        if (topInfo[1] !== undefined) {
                            videoClass.setBarrageQuantity(topInfo[1].textContent)
                        }
                    } catch (e) {
                        v.remove();
                        console.error("清理异常元素", e);
                        continue;
                    }
                    if (shieldVideo_userName_uid_title(videoClass)) {
                        continue;
                    }
                    const jqE = $(v);
                    if (Util.isEventJq(jqE, "mouseover")) {
                        continue;
                    }
                    jqE.mouseenter((e) => {
                        const domElement = e.delegateTarget;
                        const info = domElement.querySelector(".bili-video-card__info--right");
                        const videoAddress = info.querySelector(".bili-video-card__info--tit>a").getAttribute("href");
                        const href = info.querySelector(".bili-video-card__info--owner").href;
                        const v_img = domElement.querySelector(".v-img>img");
                        Util.showSDPanel(e, {
                            upName: info.querySelector(".bili-video-card__info--author").textContent,
                            uid: Util.getSubWebUrlUid(href),
                            title: info.querySelector(".bili-video-card__info--tit").getAttribute("title"),
                            bv: Util.getSubWebUrlBV(videoAddress),
                            frontCover: v_img === null ? null : v_img.getAttribute("src")
                        });
                    });
                }
                resolve(true);
            }, 250);
        });

    },
    hideDisplayHomeLaylout() {//隐藏显示面板
        const home_layout = document.getElementById("home_layout");
        if (Home.myidClickIndex) {
            home_layout.style.display = "block";
            Home.myidClickIndex = false;
            return;
        }
        home_layout.style.display = "none";
        Home.myidClickIndex = true;
    },
    homePrefecture() {//针对于分区的广告页脚信息屏蔽
        Util.circulateID("biliMainFooter", 2000, "已移除底部信息");
        Util.circulateClassName("primary-btn feedback visible", 2000, "已移除右侧悬浮按钮");
        for (let v of document.querySelectorAll(".eva-banner")) {
            v.remove();
            console.log("已移除界面中的横幅广告");
        }
    },
    openTab(e) {// 点击标签时执行此函数
        // 获取所有标签布局
        const tabs = document.querySelectorAll(".tab");
        // 循环遍历每个标签布局
        for (let v of tabs) {
            // 从所有标签布局中删除“active”类，使它们不可见
            v.classList.remove("active");
        }
        const tempE = document.querySelector(`#${e}`);
        // 将指定的标签布局添加到“active”类，使它可见
        tempE.classList.add("active");
    }
}

//针对内容符合规则的删除元素并返回状态值
const Remove = {
    //是否是白名单用户
    isWhiteUserUID(uid) {
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
    uid(element, uid) {
        if (Matching.arrKey(LocalData.getArrUID(), parseInt(uid))) {
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
    name(element, name) {
        if (Matching.arrKey(LocalData.getArrName(), name)) {
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
    nameKey(element, name) {
        const shieldArrContent = Matching.arrContent(LocalData.getArrNameKey(), name);
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
    titleKey(element, title) {
        const shieldArrContent = Matching.arrContent(LocalData.getArrTitle(), title);
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
    titleKeyCanonical(element, title) {
        const canonical = Matching.arrContentCanonical(LocalData.getArrTitleKeyCanonical(), title);
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
    contentKey(element, content) {
        const shieldArrContent = Matching.arrContent(LocalData.getCommentOnKeyArr(), content);
        if (shieldArrContent !== null) {
            element.remove();
        }
        return shieldArrContent;
    },
    /**
     * 根据用户专栏内容关键词屏蔽元素
     * @param element
     * @param content
     * @returns {String|null}
     */
    columnContentKey(element, content) {
        const shieldArrContent = Matching.arrContent(element, LocalData.getContentColumnKeyArr(), content);
        if (shieldArrContent !== null) {
            element.remove();
        }
        return shieldArrContent;
    },
    /**
     * 根据用户粉丝牌进行屏蔽
     * @param element
     * @param key
     * @returns {boolean}
     */
    fanCard(element, key) {
        if (Matching.arrKey(LocalData.getFanCardArr(), key)) {
            element.remove();
            return true;
        }
        return false;
    },
    /**
     * 限制的视频时长最小值，低于该值的都屏蔽
     * 根据视频时长，过滤指定时长内的视频
     * @param element
     * @param {Number}key 秒数
     * @returns {boolean}
     */
    videoMinFilterS(element, key) {
        const min = LocalData.video.getFilterSMin();
        if (min === null) {
            return false;
        }
        if (min > key) {
            element.remove();
            return true;
        }
        return false;
    },
    /**
     * 限制可展示的视频时长最大值，高于该值的都屏蔽
     * @param element
     * @param {Number}key 秒数
     * @returns {boolean}
     */
    videoMaxFilterS(element, key) {
        const max = LocalData.video.getfilterSMax();
        if (max === 0 || max < LocalData.video.getFilterSMin() || max === null) {//如果最大值为0，则不需要执行了，和当最小值大于最大值也不执行
            return false;
        }
        if (max < key) {
            element.remove();
            return true;
        }
        return false;
    },
    /**
     * 限制视频播放量最小值，低于该值的都屏蔽
     * 根据视频播放量，过滤低于指定播放量的视频
     * @param element
     * @param {number}key 播放量纯数字
     * @returns {boolean}
     */
    videoMinPlaybackVolume(element, key) {
        const min = LocalData.video.getBroadcastMin();
        if (min === null) {
            return false;
        }
        if (min > key) {
            element.remove();
            return true;
        }
        return false;
    },
    /**
     * 限制视频播放量最大值，高于该值的都屏蔽
     * 根据视频播放量，过滤高于指定播放量的视频
     * @param element
     * @param {number}key 播放量纯数字
     * @returns {boolean}
     */
    videoMaxPlaybackVolume(element, key) {
        const max = LocalData.video.getBroadcastMax();
        if (max === 0 || max < LocalData.video.getBroadcastMin() || max === null) {//如果最大值为0，则不需要执行了，和当最小值大于最大值也不执行
            return false;
        }
        if (max < key) {
            element.remove();
            return true;
        }
        return false;
    },
    /**
     * 限制可暂时的视频弹幕量最小值，低于该值的都屏蔽
     * 根据视频弹幕量，过滤低于指定弹幕量的视频
     * @param element
     * @param {number}key 弹幕数量
     * @returns {boolean}
     */
    videoMinBarrageQuantity(element, key) {
        if (LocalData.video.getBarrageQuantityMin() > key) {
            element.remove();
            return true;
        }
        return false;
    },
    /**
     * 限制可暂时的视频弹幕量最大值，高于该值的都屏蔽
     * 根据视频弹幕量，过滤高于指定弹幕量的视频
     * @param element
     * @param {number}key 弹幕数量
     * @returns {boolean}
     */
    videoMaxBarrageQuantity(element, key) {
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
            if (startPrintShieldNameOrUIDOrContent(v, new ContentCLass()
                .setUpName(rootName)
                .setUid(parseInt(rootUid))
                .setContent(rootContent))) {
                Qmsg.info("屏蔽了言论！！");
                continue;
            }
            const jqE = $(rootUserinfo);
            if (!Util.isEventJq(jqE, "mouseover")) {
                jqE.mouseenter((e) => {
                    const domElement = e.delegateTarget;
                    Util.showSDPanel(e, {
                        upName: domElement.textContent,
                        uid: domElement.getAttribute("data-usercard-mid")
                    });
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
                if (startPrintShieldNameOrUIDOrContent(j, new ContentCLass()
                    .setUpName(subName)
                    .setUid(parseInt(subUid))
                    .setContent(subContent))) {
                    Qmsg.info("屏蔽了言论！！");
                    continue;
                }
                const jqE = $(j);
                if (Util.isEventJq(jqE, "mouseover")) {
                    continue;
                }
                jqE.mouseenter((e) => {
                    const domElement = e.delegateTarget;
                    Util.showSDPanel(e, {
                        upName: domElement.querySelector(".name").textContent,
                        uid: domElement.querySelector("a").getAttribute("data-usercard-mid")
                    });
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
    getUserCard(uid, userName, level, sign, image, gz, fs, hz) {
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
    }
}

const Print = {
    ln(content) {
        Util.printElement("#outputInfo", `<dd>${content}</dd>`);
    },
    video(color, content, name, uid, title, videoHref) {
        Util.printElement("#outputInfo", `
        <dd><b
            style="color: ${color}; ">${Util.toTimeString()}${content}屏蔽用户【${name}】uid=<a href="https://space.bilibili.com/${uid}" target="_blank">【${uid}】</a>标题【<a href="${videoHref}" target="_blank">${title}</a>】</b>
        </dd>`);
    }, commentOn(color, content, name, uid, primaryContent) {
        Util.printElement("#outputInfo", `
        <dd>
        <b  style="color: ${color}; ">${Util.toTimeString()}${content} 屏蔽用户【${name}】uid=<a href="https://space.bilibili.com/${uid}" target="_blank">【${uid}】</a>
   原言论=【${primaryContent}】</b>
</dd>`);
    }
};

//添加元素
const addElement = {
    homeVideoE: {
        /**
         * @param {string}title 视频标题
         * @param {string}videoAddess
         * @param {string}videoImage 视频封面
         * @param {string}userID 用户uid
         * @param {string}userName 用户名
         * @param {string}timeLong 视频时长
         * @param {string}ctime 发布时间
         * @param {string}view 播放量
         * @param {string}danmaku 弹幕量
         */
        getHtmlStr(title, videoAddess, videoImage, userID, userName, timeLong, ctime, view, danmaku) {
            return $(`<div class="bili-video-card is-rcmd" data-report="tianma.7-1-23.click" data-v-45e09777="">
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
</div>`);
        }
    }
}

function startMonitorTheNetwork() {//监听网络变化
    const observer = new PerformanceObserver(perf_observer);
    observer.observe({entryTypes: ['resource']});
}

/**
 * 针对言论内容根据name和uid进行屏蔽并打印消息
 * @param element 网页元素
 * @param {ContentCLass}  contentCLass
 * @returns {boolean}
 */
function startPrintShieldNameOrUIDOrContent(element, contentCLass) {
    if (Remove.isWhiteUserUID(contentCLass.uid)) {
        return false;
    }
    const key = Remove.contentKey(element, contentCLass.content);
    if (key != null) {
        Print.commentOn("#00BFFF", `已通过言论关键词了【${key}】`, contentCLass.upName, contentCLass.uid, contentCLass.content);
        return true;
    }
    const isUid = Remove.uid(element, contentCLass.uid);
    if (isUid) {
        Print.commentOn("#yellow", `已通过UID屏蔽`, contentCLass.upName, contentCLass.uid, contentCLass.content);
        return true;
    }
    const isName = Remove.name(element, contentCLass.upName);
    if (isName) {
        Print.commentOn(null, `已通过指定用户名【${isName}】`, contentCLass.upName, contentCLass.uid, contentCLass.content);
        return true;
    }
    const isNameKey = Remove.nameKey(element, contentCLass.upName);
    if (isNameKey != null) {
        Print.commentOn(null, `已通过指定用户名模糊规则【${isNameKey}】`, contentCLass.upName, contentCLass.uid, contentCLass.content);
        return true;
    }
    return false;
}

/**
 *  屏蔽视频元素
 *  针对用户名、用户uid，视频标题
 * @param {VideoClass} data - 包含以下属性的数据对象：
 * @param {string} data.upName 用户名
 * @param {number} data.uid uid
 *   @return  {Boolean} 是否屏蔽
 */
function shieldVideo_userName_uid_title(data) {
    const uid = data.uid || 0;
    const element = data.e;
    const title = data.title;
    const videoHref = data.videoAddress;
    const name = data.upName.trim();
    const videoPlaybackVolume = data.playbackVolume;
    const videoTime = data.videoTime;
    const barrageQuantity = data.barrageQuantity;
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
    if (videoHref !== undefined) {
        const bv = Util.getSubWebUrlBV(videoHref);
        if (Matching.arrObjKey(LocalData.getWatchedArr(), "bv", bv)) {
            element.remove();
            Print.video("#66CCCC", `已过滤已观看的视频=${title}`, name, uid, title, videoHref);
            Qmsg.success(`已过滤已观看的视频`);
            return true;
        }
    }
    if (videoPlaybackVolume !== undefined) {
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
    if (videoTime === undefined) {
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
    delMessageReply() {
        const list = document.getElementsByClassName("reply-item");
        for (let v of list) {
            const info = v.getElementsByClassName("name-field")[0];
            const name = info.textContent;//用户名
            const indess = info.getElementsByTagName("a")[0].getAttribute("href");
            const uid = parseInt(indess.substring(indess.lastIndexOf("/") + 1));
            const content = v.getElementsByClassName("text string")[0].textContent;//消息内容
            if (startPrintShieldNameOrUIDOrContent(v, new ContentCLass()
                .setUpName(name)
                .setUid(uid)
                .setContent(content))) {
                Qmsg.info("屏蔽了言论！！");
            }
        }
    },
    /**
     * 删除消息中的艾特我的规则
     */
    delMessageAT() {
        for (let v of document.getElementsByClassName("at-item")) {
            const userInfo = v.getElementsByClassName("name-field")[0].getElementsByTagName("a")[0];
            const href = userInfo.getAttribute("href");
            const userName = userInfo.textContent;
            const uid = parseInt(href.substring(href.lastIndexOf("/") + 1));
            const content = v.getElementsByClassName("content-list")[0].textContent;
            if (startPrintShieldNameOrUIDOrContent(v, new ContentCLass()
                .setUpName(userName)
                .setUid(uid)
                .setContent(content))) {
                Qmsg.info("屏蔽了言论！！");
            }
        }
    }
}

let href = Util.getWindowUrl();
console.log("当前网页url=" + href);

if (href.includes("github.com")) {
    github(href);
    throw new Error();
}
//加载布局
layout.loading.home();
$("body").prepend('<button id="mybut">按钮</button>');
layout.css.home();

Util.BilibiliEncoder.init();

$("#tabUl>li>button").click((e) => {
    const domElement = e.delegateTarget;
    document.querySelectorAll("#tabUl>li>button").forEach((value, key, parent) => {
        $(value).css("color", "");
    })
    domElement.style.color = "#1b00ff";
    Home.openTab(domElement.value);
});

$("#tabUl>li>button[value='ruleCenterLayout']").click(() => {
    if (Home.isFirstRuleCenterLayoutClick) {
        return;
    }
    Util.addStyle(`
   #ruleCenterLayout>ul li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap:wrap;
        border: 1px solid rgb(0, 217, 0);
        
    }
                    `);
    Home.isFirstRuleCenterLayoutClick = true;
    const loading = Qmsg.loading("请稍等...");
    const promise = RuleCenterLayoutVue.httpGetList();
    promise.then(dataBody => {
        Qmsg.success(dataBody.message);
        ruleCenterLayoutVue().list = dataBody.dataList;
        ruleCenterLayoutVue().isReloadListButShow = true;
    }).catch(reason => {
        Home.isFirstRuleCenterLayoutClick = false;
        ruleCenterLayoutVue().isReloadListButShow = true;
        debugger;
        console.log(reason);
    }).finally(() => {
        loading.close();
    });
});

$("#mybut").click(() => Home.hideDisplayHomeLaylout());

$(document).keyup(function (event) {//单按键监听-按下之后松开事件
    if (!LocalData.isEnableShortcutKeys()) {
        return;
    }
    const keycode = event.keyCode;
    switch (keycode) {
        case 192: {//按下`按键显示隐藏面板
            Home.hideDisplayHomeLaylout();
            break;
        }
        case 49: {//选中快捷悬浮屏蔽按钮跟随鼠标 键盘上的1
            const q = $("#quickLevitationShield");
            q.prop("checked", !q.is(':checked'));
            break;
        }
        case 50: {//固定快捷悬浮面板值 键盘上的2
            const q = $("#fixedPanelValueCheckbox");
            q.prop("checked", !q.is(':checked'));
            break;
        }
        case 51: {//隐藏快捷悬浮屏蔽按钮 键盘上的3
            $("#suspensionDiv").hide();
            break;
        }
        case 52: {//选中或取消面板中面板设置禁用快捷悬浮屏蔽面板自动显示
            const vue = panelSetsTheLayoutVue();
            vue.isDShieldPanel = !vue.isDShieldPanel;
            break;
        }
    }
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
    Util.fileDownload(JSON.stringify(array, null, 3), Util.toTimeString() + "直播间高能用户列表.json");
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
    Util.fileDownload(JSON.stringify(arrData, null, 3), Util.toTimeString() + "_直播间弹幕内容.json");
    Qmsg.success("获取成功并执行导出内容");
});


$("#butClearMessage").click(() => {
    if ($("#butClearMessage+input:first").is(":checked")) {
        if (!confirm("是要清空消息吗？")) {
            return;
        }
    }
    document.querySelector('#outputInfo').innerHTML = '';
});

const bilibiliEncoder = Util.BilibiliEncoder;


Watched.WatchedListVue();
const ruleCRUDLlayoutVue = RuleCRUDLayout.returnVue();
const returnVue = LookAtItLater.returnVue();
const panelSetsTheLayoutVue = PanelSetsTheLayout.returnVue();
Video_params_layout.returnVue();
LiveLayoutVue.returnVue();
OtherLayoutVue.returnVue();
DonateLayoutVue.returnVue();
HomePageLayoutVue.returnVue();
const ruleCenterLayoutVue = RuleCenterLayoutVue.returnVue();
const suspensionDivVue = SuspensionDivVue.returnVue();

AccountCenterVue.returnVue();

Util.suspensionBall(document.querySelector("#suspensionDiv"));

setInterval(() => {//每秒监听网页中的url
    const tempUrl = Util.getWindowUrl();
    if (href === tempUrl) {//没有变化就结束本轮
        return;
    }//有变化就执行对应事件
    console.log("页面url发生变化了，原=" + href + " 现=" + tempUrl);
    href = tempUrl;//更新url
    bilibili(href);//网页url发生变化时执行
}, 500);

if (href.includes("bilibili.com")) {
    LockScreen.isLockScreen();
    bilibiliOne(href, document.title);
    bilibili(href);
    startMonitorTheNetwork();
}