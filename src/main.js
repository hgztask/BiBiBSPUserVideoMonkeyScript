//{"weight":3}
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
    }
}
const Home = {
    background: {//主面板背景颜色及透明度
        r: 255,
        g: 255,
        b: 255,
        a: 1
    },
    //是否初次点击了规则中心按钮
    isFirstRuleCenterLayoutClick: false,
    getBackgroundStr() {
        return Util.getRGBA(this.background.r, this.background.g, this.background.b, this.background.a);
    },
    //调整首页样式
    stypeBody() {
        document.querySelector(".bili-header__banner").remove()//删除首页顶部的图片位置的布局
        const interval = setInterval(() => {
            try {
                const headerChannelE = document.querySelector(".bili-header__channel");
                headerChannelE.style.padding = 0;//调整-首页header按钮栏
                headerChannelE.style.height = "auto";//调整其与下面控件的距离
                const videoListLayout = document.querySelector(".bili-feed4-layout");
                if (videoListLayout === null) return;
                videoListLayout.style.padding = 0;//调整视频列表左右边距为0
                document.querySelector("#i_cecream > div.bili-feed4 > div.bili-header.large-header > div.bili-header__bar").style.position = "inherit";//调整顶栏样式
                const headerC = document.querySelector("#i_cecream > div.bili-feed4 > div.header-channel");//调整往下滑动之后顶部的悬浮栏
                if (headerC === null) return;
                headerC.remove();
                clearInterval(interval)
            } catch (e) {
                console.error("样式修改失败", e);
            }
        }, 500);
        const i2 = setInterval(() => {
            const isE = document.querySelector(".bili-feed4-layout");
            if (isE === null) return;
            clearInterval(i2);
            $(isE).css("padding", "");
            Tip.success("调整首页布局");
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
                if (list.length === 0) return;
                clearInterval(interval);
                $(".floor-single-card").remove();
                $(".bili-live-card").remove();
                for (let v of list) {
                    let videoInfo, upSpatialAddress, videoUrl;
                    const videoClass = new VideoClass();
                    try {
                        videoInfo = v.querySelector(".bili-video-card__info--right");
                        const titleInfo = videoInfo.querySelector(".bili-video-card__info--tit");
                        upSpatialAddress = videoInfo.querySelector(".bili-video-card__info--owner").getAttribute("href");//用户空间地址
                        const topInfo = v.querySelectorAll(".bili-video-card__stats--left .bili-video-card__stats--item");//1播放量2弹幕数
                        const titleAE = titleInfo.querySelector("a");
                        const tempVideoUrl = titleAE.href;
                        if (tempVideoUrl.includes("www.bilibili.com/video/")) {
                            videoUrl = tempVideoUrl;
                        } else {
                            console.log("疑似推广视频！或广告！")
                            videoUrl = titleAE.getAttribute("data-target-url");
                        }
                        videoClass.setTitle(titleInfo.getAttribute("title"))
                            .setVideoAddress(videoUrl)
                            .setUpName(videoInfo.querySelector(".bili-video-card__info--author").title)
                            .setUid(Util.getSubWebUrlUid(upSpatialAddress))
                            .setVideoTime(v.querySelector(".bili-video-card__stats__duration").textContent)
                            .setPlaybackVolume(topInfo[0].textContent)
                            .setE(v);
                        if (topInfo[1] !== undefined) videoClass.setBarrageQuantity(topInfo[1].textContent)
                    } catch (e) {
                        v.remove();
                        Tip.successBottomRight("清理异常元素");
                        continue;
                    }
                    if (shieldVideo_userName_uid_title(videoClass)) continue;
                    const jqE = $(v);
                    if (Util.isEventJq(jqE, "mouseover")) continue;
                    jqE.mouseenter((e) => {
                        const domElement = e.delegateTarget;
                        const info = domElement.querySelector(".bili-video-card__info--right");
                        const videoInfoAE = info.querySelector(".bili-video-card__info--tit>a");
                        let videoAddress = videoInfoAE.getAttribute("href");
                        let tempBV;
                        let uid;
                        const href = info.querySelector(".bili-video-card__info--owner").href;
                        if (videoAddress.includes("www.bilibili.com/video/")) {
                            uid = Util.getSubWebUrlUid(href);
                            tempBV = Util.getSubWebUrlBV(videoAddress);
                        } else {
                            // 不是视频链接，疑似是推广视频
                            console.log("疑似推广视频！或广告！")
                            const tempUrl = videoInfoAE.getAttribute("data-target-url");
                            tempBV = Util.getSubWebUrlBV(tempUrl);
                            uid = href.match(/space_mid=(\d+)/)[1];
                        }
                        const v_img = domElement.querySelector(".v-img>img");
                        Util.showSDPanel(e, {
                            upName: info.querySelector(".bili-video-card__info--author").textContent,
                            uid: uid,
                            title: info.querySelector(".bili-video-card__info--tit").getAttribute("title"),
                            bv: tempBV,
                            frontCover: v_img === null ? null : v_img.getAttribute("src")
                        });
                    });
                }
                resolve(true);
            }, 250);
        });
    },
    hideDisplayHomeLaylout() {//隐藏显示面板
        const vue = window.mainVue
        vue.show = !vue.show;
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
        const tabs = document.querySelectorAll("#home_layout .tab");
        // 循环遍历每个标签布局
        for (let v of tabs) {
            // 从所有标签布局中删除“active”类，使它们不可见
            v.classList.remove("active");
        }
        const tempE = document.querySelector(`#home_layout #${e}`);
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
        if (list.length === 0) return;
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
                Tip.info("屏蔽了言论！！");
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
                    Tip.info("屏蔽了言论！！");
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
        Tip.printCommentOn("#00BFFF", `已通过言论关键词了【${key}】`, contentCLass.upName, contentCLass.uid, contentCLass.content);
        return true;
    }
    const isUid = Remove.uid(element, contentCLass.uid);
    if (isUid) {
        Tip.printCommentOn("yellow", `已通过UID屏蔽`, contentCLass.upName, contentCLass.uid, contentCLass.content);
        return true;
    }
    const isName = Remove.name(element, contentCLass.upName);
    if (isName) {
        Tip.printCommentOn(null, `已通过指定用户名【${isName}】`, contentCLass.upName, contentCLass.uid, contentCLass.content);
        return true;
    }
    const isNameKey = Remove.nameKey(element, contentCLass.upName);
    if (isNameKey != null) {
        Tip.printCommentOn(null, `已通过指定用户名模糊规则【${isNameKey}】`, contentCLass.upName, contentCLass.uid, contentCLass.content);
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
function shieldVideo_userName_uid_title({
                                            uid = 0,
                                            e: element,
                                            title,
                                            videoAddress: videoHref,
                                            upName: name,
                                            playbackVolume: videoPlaybackVolume,
                                            videoTime: videoTime,
                                            barrageQuantity
                                        }) {
    if (Remove.isWhiteUserUID(uid)) return false;
    if (uid !== null) {
        const isUid = Remove.uid(element, uid);
        if (isUid) {
            Tip.printVideo("yellow", "已通过UID屏蔽", name, uid, title, videoHref);
            return true;
        }
    }
    const isName = Remove.name(element, name);
    if (isName) {
        Tip.printVideo(null, "已通过用户名屏蔽", name, uid, title, videoHref);
        return true;
    }
    const isNameKey = Remove.nameKey(element, name);
    if (isNameKey != null) {
        Tip.printVideo(null, `已通过用户名模糊屏蔽规则=【${isNameKey}】`, name, uid, title, videoHref)
        return true;
    }
    const videoTitle = Remove.titleKey(element, title);
    if (videoTitle != null) {
        Tip.printVideo("#66CCCC", `已通过标题模糊屏蔽规则=【${videoTitle}】`, name, uid, title, videoHref);
        return true;
    }
    const titleKeyCanonical = Remove.titleKeyCanonical(element, title);
    if (titleKeyCanonical != null) {
        Tip.printVideo("#66CCCC", `已通过标题正则表达式屏蔽规则=${titleKeyCanonical}`, name, uid, title, videoHref);
        return true;
    }
    if (videoHref !== undefined) {
        const bv = Util.getSubWebUrlBV(videoHref);
        //TODO 后续适配所有需要过滤的地方
        if (Matching.arrKey(LocalData.getBvBlacklistArr(), bv)) {
            element.remove();
            Tip.printVideo("#66CCCC", `已根据bv号过滤视频=${title}`, name, uid, title, videoHref);
            return true;
        }
    }
    if (videoPlaybackVolume !== undefined) {
        const change = Util.changeFormat(videoPlaybackVolume);
        if (Remove.videoMinPlaybackVolume(element, change)) {
            Tip.printVideo(null, `已过滤视频播放量小于=【${LocalData.video.getBroadcastMin()}】的视频`, name, uid, title, videoHref);
            return true;
        }
        if (Remove.videoMaxPlaybackVolume(element, change)) {
            Tip.printVideo(null, `已过滤视频播放量大于=【${LocalData.video.getBroadcastMax()}】的视频`, name, uid, title, videoHref);
            return true;
        }
    }
    if (videoTime === undefined) return false;
    const timeTotalSeconds = Util.getTimeTotalSeconds(videoTime);
    if (Remove.videoMinFilterS(element, timeTotalSeconds)) {
        Tip.printVideo(null, `已通过视频时长过滤时长小于=【${LocalData.video.getFilterSMin()}】秒的视频`, name, uid, title, videoHref);
        return true;
    }
    if (Remove.videoMaxFilterS(element, timeTotalSeconds)) {
        Tip.printVideo(null, `已过滤时长大于=【${LocalData.video.getfilterSMax()}】秒的视频`, name, uid, title, videoHref);
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
                Tip.info("屏蔽了言论！！");
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
                Tip.info("屏蔽了言论！！");
            }
        }
    }
}
let href = Util.getWindowUrl();
console.log("当前网页url=" + href);
//加载布局
layout.addMainLayout();
$("body").prepend('<button id="myBut" v-show="show" @click="showBut">按钮</button>');
layout.css.home();
$("#home_layout #tabUl>li>button").click((e) => {
    const domElement = e.delegateTarget;
    document.querySelectorAll("#home_layout #tabUl>li>button").forEach((value) => $(value).css("color", ""))
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
    const loading = Tip.loading("请稍等...");
    const promise = RuleCenterLayoutVue.httpGetList();
    promise.then(dataBody => {
        Tip.success(dataBody.message);
        window.window.ruleCenterLayoutVue.list = dataBody.dataList;
        window.ruleCenterLayoutVue.isReloadListButShow = true;
    }).catch(reason => {
        Home.isFirstRuleCenterLayoutClick = false;
        window.ruleCenterLayoutVue.isReloadListButShow = true;
        debugger;
        console.log(reason);
    }).finally(() => {
        loading.close();
    });
});
$(document).keyup(function (event) {//单按键监听-按下之后松开事件
    if (!LocalData.isEnableShortcutKeys()) return;
    const key = event.key;
    switch (key) {
        case LocalData.localKeyCode.getDHMainPanel_KC(): {
            Home.hideDisplayHomeLaylout();
            break;
        }
        case LocalData.localKeyCode.getQFlBBFollowsTheMouse_KC(): {
            debugger;
            const is = VueData.panelSetsTheLayout.isDShieldPanelFollowMouse();
            VueData.panelSetsTheLayout.setDShieldPanelFollowMouse(!is);
            break;
        }
        case LocalData.localKeyCode.getFixedQuickSuspensionPanelValue_KC(): {//固定快捷悬浮面板值
            const q = VueData.panelSetsTheLayout.isFixedPanelValueCheckbox();
            VueData.panelSetsTheLayout.setFixedPanelValueCheckbox(!q);
            break;
        }
        case LocalData.localKeyCode.getHideQuickSuspensionBlockButton_KC(): {
            $("#suspensionDiv").hide();
            break;
        }
        case LocalData.localKeyCode.getDTQFSPToTriggerDisplay_KC(): {
            const vue = window.panelSetsTheLayoutVue;
            vue.isDShieldPanel = !vue.isDShieldPanel;
            break;
        }
    }
});
$("#getLiveHighEnergyListBut").click(() => {//获取直播间的高能用户列表-需要用户先展开高能用户列表才可以识别到
    const title = document.title;
    const url = Util.getWindowUrl();
    if (!(title.includes("- 哔哩哔哩直播，二次元弹幕直播平台") && url.includes("live.bilibili.com"))) {
        Tip.error("错误的引用了该功能！");
        return;
    }
    const list = document.querySelectorAll(".list-body>.list>*>.name");
    if (list.length === 0) {
        Tip.info("未获取到高能用户列表，当前长度微0，说明没有高能用户存在！");
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
        Tip.error("错误的引用了该功能！");
        return;
    }
    const list = document.querySelectorAll("#chat-items>*");
    if (list.length === 0) {
        Tip.error("未检测到弹幕内容！");
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
    Tip.success("获取成功并执行导出内容");
});
$("#butClearMessage").click(() => {
    if ($("#butClearMessage+input:first").is(":checked")) {
        if (!confirm("是要清空消息吗？")) return;
    }
    document.querySelector('#outputInfo').innerHTML = '';
});
RuleCRUDLayout.returnVue();
LookAtItLater.returnVue();
PanelSetsTheLayout.returnVue();
Video_params_layout.returnVue();
LiveLayoutVue.returnVue();
OtherLayoutVue.returnVue();
DonateLayoutVue.returnVue();
RuleCenterLayoutVue.returnVue();
SuspensionDivVue.returnVue();
AccountCenterVue.returnVue();
IsShowVue.returnVUe();
Util.suspensionBall(document.querySelector("#suspensionDiv"));
setInterval(() => {//每秒监听网页中的url
    const tempUrl = Util.getWindowUrl();
    if (href === tempUrl) return;//没有变化就结束本轮
    // 有变化就执行对应事件
    console.log("页面url发生变化了，原=" + href + " 现=" + tempUrl);
    href = tempUrl;//更新url
    bilibili(href);//网页url发生变化时执行
}, 500);
if (href.includes("bilibili.com")) {
    bilibiliOne(href, document.title);
    bilibili(href);
    startMonitorTheNetwork();
}
