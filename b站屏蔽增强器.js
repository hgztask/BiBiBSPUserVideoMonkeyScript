// ==UserScript==
// @name         b站屏蔽增强器
// @version      0.6
// @description  根据用户名、uid、视频关键词、言论关键词和视频时长进行屏蔽和精简处理(详情看作者github对应仓库的README.md描述)，
// @author       byhgz
// @match        https://www.bilibili.com/v/channel/*?tab=multiple
// @match        *://search.bilibili.com/*
// @match        *://www.bilibili.com/v/channel/*
// @match        *://message.bilibili.com/*
// @match        *://www.bilibili.com/read/*
// @match        *://t.bilibili.com/*
// @match        *://space.bilibili.com/*
// @match        *://www.bilibili.com/video/*
// @match        *://live.bilibili.com/*
// @match        https://www.bilibili.com/
// @icon         https://static.hdslb.com/images/favicon.ico
// @grant        none
// ==/UserScript==

/**
 * 用户名黑名单模式
 * @type {string[]} 元素类型为字符串
 */
const userNameArr = [];
/**
 * 用户uid黑名单模式
 * @type {number[]}
 */
const userUIDArr = [442010132, 76525078, 225219967, 3493106108337121, 432029920, 522828809, 15361927, 1514545, 1463474700, 473602930, 360222848, 34478056, 443966044, 365370701,
    204223199, 108634479, 358982641, 1767883966, 9320658, 17342567, 485654692, 396597257, 365286131, 1373727295, 28705497, 69863283, 1273154216, 25193763, 45904574, 4119763,
    436925164, 2080706333, 18149131, 137366696, 678222997, 321483542, 166415666, 3991821, 10965947, 2112669666, 516973583, 18746429, 18207363, 1758985928, 324638729, 97777331,
    3461562092226886, 267309707, 1486867541, 1354324997, 381282127, 677946461, 34706053, 454731473, 1549857739, 648386152, 1543151814, 313692620, 498139921, 250473047, 551208674,
    355864845, 403099700, 310049630, 396088710, 816408, 244830863, 1849036165, 433761998, 407470895, 494905797, 15290294, 492714942, 1508604210, 1059098601, 1057671967, 108145926,
    17016234, 35374392, 347017348, 33069452, 510854520, 376257755, 14934048, 570365721, 247006155, 3812, 1153772186, 296539, 2117160, 1428464, 421706, 281239563, 27537451, 29660334,
    412930970, 26823187, 5216704, 448091880, 17460940, 1261836580, 174945001, 182976969, 426820673, 490592134, 198402204, 1281412061, 65976968, 40648072, 141151718, 1992255481, 11624471,
    1754181364, 196384402, 66367787, 128154158, 169545694, 5357279, 1152060393, 2038765, 3688216, 111220485, 6976808, 2346313, 28236100, 18227521, 440750397, 33309913, 280697705,
    209324033, 488235430, 356479827, 1670897182, 177701043, 37652547, 125580767, 514090617, 50649550, 163969773, 509539484, 272571655, 473638012, 455144859, 34569089, 648428269,
    43681957, 1715662667, 479377752, 238366138, 12475509, 29346851, 321253774, 89615638, 891858, 1301805267, 3529427, 243818176, 171384131, 11587623, 480266307, 450546148, 486810195,
    430440081, 1242975719, 28263772, 507566, 22017278, 26287223, 245666267, 260548595, 180078002, 158597892, 363168957, 160905064, 35918416, 2073698, 54887854, 2785997, 441304288,
    453875195, 304367432, 665571562, 359776394, 236691671, 435301455, 693055791, 1579905799, 617472671, 627472210, 1664466071, 188817014, 43417886, 177362409, 290792970, 167486665,
    52675587, 308174482, 286366141, 115496626, 516585427, 7407869, 21971309, 168618448, 163524651, 162007026, 300630871, 89015953, 10155123, 1360533588, 73149130, 8284785, 34774578,
    14493378, 58242864, 282462500, 35989854, 252953029, 9015499, 38269762, 45048267, 87369426, 3222715, 397883721, 324460860, 7856986, 161782912, 38377537, 433207409, 497415994, 26366366,
    68559, 326499679, 398977139, 401000486, 45320548, 10479363, 393196002, 382806584, 284141005, 355076532, 525007481, 396438095, 396773226, 49771321, 360978058, 393471511, 381431441,
    3493087556930157, 27534330, 401742377, 29668335, 17065080, 101157782, 3493144377166772, 363264911, 27825218, 511045567];

/**
 * 视频标题or专栏标题关键词
 * 关键词小写，会有方法对内容中的字母转成小写的
 * @type {string[]}
 */
const titleArr = ["感觉不如", "对标原神", "原神", "米哈游", "腾讯", "薄纱", "空大佐", "抄袭", "崩坏", "崩三"];
/**
 * 评论关键词
 * 关键词小写，会有方法对内容中的字母转成小写的
 * @type {string[]}
 */
const commentOnKeyArr = ["感觉不如", "有趣", "原神", "幻塔", "差不多的了", "你说得对", "op", "百万", "腾讯", "网易", "米哈游", "薄纱", "卫兵", "空大佐", "抄袭", "崩坏", "崩三"];

/**
 * 专栏关键词
 * 关键词小写，会有方法对内容中的字母转成小写的
 * @type {string[]}
 */
const contentColumnKeyArr = ["抄袭"];
/**
 * 粉丝牌
 * 根据粉丝牌屏蔽
 * @type {string[]}
 */
const fanCardKeyArr = [];

/**
 *设置时长最小值，单位秒
 * 设置为 0，则不需要根据视频时长过滤
 * @type {number}
 */
const filterSMin = 0;

/**
 * 设置时长最大值，单位秒
 * 设置为 0，则不需要根据视频时长过滤
 * @type {number}
 */
const filterSMax = 0;

//是否屏蔽首页=左侧大图的轮播图
const homePicBool = true;
//是否屏蔽首页右侧悬浮的按钮，其中包含反馈，内测等等之类的
const paletteButtionBool = true;

/**
 * 是否正在执行清理首页中的零散的直播间元素函数
 * @type {boolean}
 */
let boolShieldMainlive = false;

/**
 * 保准页面加载了本脚本之后只会触发一次该判断
 * 用于搜索页面的专栏按钮监听。且只会加载一次
 * @type {boolean}
 */
let searchColumnBool = false;

/**
 * 记录播放页的广告是屏蔽的地方
 * @type {number}
 */
let delVideoRightButtonADIndex = 0;

/**
 * 获取当前网页的url
 * @returns {string}
 */
function getWindowUrl() {

    return window.location.href;
}

/**
 * 根据用户提供的网页元素和对应的数组及key，判断数组里是否包含key元素本身，进行屏蔽元素
 * @param element
 * @param arr 数组
 * @param key 唯一key
 * @returns {boolean}
 */
function shieldArrKey(element, arr, key) {
    if (arr.includes(key)) {
        element.remove();
        return true;
    }
    return false;
}

/**
 * 根据用户uid屏蔽元素
 * @param element 网页元素
 * @param uid 用户uid
 * @returns {boolean}
 */
function shieldUID(element, uid) {
    return shieldArrKey(element, userUIDArr, uid);
}

/**
 *根据用户名屏蔽元素
 * @param element 网页元素
 * @param name 用户名
 * @returns {boolean}
 */
function shieldName(element, name) {
    return shieldArrKey(element, userNameArr, name);
}

/**
 * 根据用户提供的字符串集合，与指定内容进行比较屏蔽
 * @param element 网页元素
 * @param arr 字符串数组
 * @param content 内容
 * @returns {null|String}
 */
function shieldArrContent(element, arr, content) {
    for (let str of arr) {
        if (content.toLowerCase().includes(str)) {//将内容中的字母转成小写进行比较
            element.remove();
            return str;
        }
    }
    return null;
}

/**
 * 根据用户言论屏蔽元素
 * @param element 网页元素
 * @param content 用户的言论
 * @returns {string|null}
 */
function shieldContent(element, content) {
    return shieldArrContent(element, commentOnKeyArr, content);
}

/**
 * 根据用户专栏内容关键词屏蔽元素
 * @param element 网页元素
 * @param content 专栏内容关键词
 * @returns {string|null}
 */
function shieldColumnContent(element, content) {
    return shieldArrContent(element, contentColumnKeyArr, content);
}

/**
 * 根据标题屏蔽元素
 * @param element 网页元素
 * @param title 标题
 * @returns {string|null}
 */
function shieldTitle(element, title) {
    for (let str of titleArr) {
        if (title.toLowerCase().includes(str)) {//将内容中的字母转成小写进行比较
            element.remove();
            return str;
        }
    }
    return null;
}

/**
 * 根据用户粉丝牌进行屏蔽
 * @param element 网页元素
 * @param key
 * @returns {boolean}
 */
function shieldFanCard(element, key) {
    return shieldArrKey(element, fanCardKeyArr, key);
}

/**
 * 限制可展示的视频时长最小值，低于该值的都屏蔽
 * 根据视频时长，过滤指定时长内的视频
 * @param element 网页元素
 * @param {Number}key 秒数
 * @returns {boolean}
 */
function shieldMinFilterS(element, key) {
    if (filterSMin > key) {
        element.remove();
        return true;
    }
    return false;
}

/**
 * 限制可暂时的视频时长最大值，高于该值的都屏蔽
 * @param element
 * @param {Number}key 秒数
 */
function shieldMaxFilterS(element, key) {
    if (filterSMax === 0 || filterSMax < filterSMin) {//如果最大值为0，则不需要执行了，和当最小值大于最大值也不执行
        return false;
    }
    if (filterSMax < key) {
        element.remove();
        return true;
    }
    return false;
}


/**
 * 分割时分秒字符串
 * @param time
 * @returns {{s: number, h: number, m: number}|{s: number, m: number}}
 */
function splitTimeHMS(time) {
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
}

/**
 * 根据字符串的时分秒转成秒
 * @param {String} time 时分秒字符串
 * @returns {Number} 总秒
 */
function getTimeTotalSeconds(time) {
    const demoTime = splitTimeHMS(time);
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
}

/**
 *结合版-根据用户名和uid针对性屏蔽元素
 * @param element 网页元素
 * @param name 用户名
 * @param uid 用户uid
 * @returns {string|null}
 */
function shieldNameOrUID(element, name, uid) {
    if (shieldUID(element, uid)) {
        return "uid";
    }
    if (shieldName(element, name)) {
        return "name";
    }
    return null;
}

/**
 * 执行并打印相关屏蔽信息
 * @param element 网页元素
 * @param name 用户名
 * @param uid uid
 * @returns {boolean}
 */
function startPrintShieldNameOrUID(element, name, uid) {
    const userShield = shieldNameOrUID(element, name, uid);
    if (userShield !== null) {
        if (userShield === "uid") {
            console.log("已通过uid=【" + uid + "】屏蔽黑名单用户【" + name + "】");
            return true;
        }
        console.log("已通过用户名屏蔽指定黑名单用户【" + name + "】");
        return true;
    }
    return false;
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
    if (startPrintShieldNameOrUID(element, name, uid)) {
        return true;
    }
    const key = shieldContent(element, content);
    if (key != null) {
        console.log("已通过言论关键词【" + key + "】屏蔽用户【" + name + "】 原言论=" + content);
        return true;
    }
    return false;
}

function startPrintShieldTitle(element, arr, title, name) {
    const key = shieldArrContent(element, titleArr, title);
    if (key != null) {
        console.log("已通过标题关键词【" + key + "】屏蔽用户【" + name + "】");
        return true;
    }
    return false;
}

/**
 * 执行并打印屏蔽专栏信息
 * @param element 网页元素
 * @param name 用户名
 * @param uid uid
 * @param content 专栏内容
 * @param title 专栏标题
 * @returns {boolean}
 */
function startPrintshieldcolumn(element, name, uid, content, title) {
    if (startPrintShieldNameOrUID(element, name, uid)) {
        return true;
    }
    const key = shieldColumnContent(element, content);
    if (key !== null) {
        console.log("已通过专栏内容关键词【" + key + "】屏蔽用户【" + name + "】 原专栏内容=" + content);
        return true;
    }
    return !!(startPrintShieldTitle(element, titleArr, title, name));
}

/**
 *  屏蔽视频元素
 *  针对用户名、用户uid，视频标题
 * @param element 对应的视频元素
 * @param {String}name 用户名
 * @param {Number}uid 用户uid
 * @param {String}title 视频标题
 * @param  {String}videoTime 视频时间
 * @returns {boolean} 是否执行完
 */
function shieldVideo_userName_uid_title(element, name, uid, title, videoTime) {
    let nameOrUID = shieldNameOrUID(element, name, uid);
    if (nameOrUID != null) {
        if (nameOrUID === "uid") {
            console.log("已通过id=【" + uid + "】屏蔽黑名单用户【" + name + "】 视频=" + title);
            return true;
        }
        console.log("已通过用户名屏蔽指定黑名单用户【" + name + "】 视频=" + title);
        return true;
    }
    const videoTitle = shieldTitle(element, title);
    if (videoTitle != null) {
        console.log("已通过视频标题关键词=【" + videoTitle + "】 屏蔽用户【" + name + "】 视频=" + title);
    }
    const timeTotalSeconds = getTimeTotalSeconds(videoTime);
    if (shieldMinFilterS(element, timeTotalSeconds)) {
        console.log("已通过视频时长过滤时长小于=【" + filterSMin + "】秒的视频 视频=【" + title + "】");
        return true;
    }
    if (shieldMaxFilterS(element, timeTotalSeconds)) {
        console.log("已通过视频时长过滤时长大于=【" + filterSMax + "】秒的视频 视频=【" + title + "】");
        return true;
    }
    return false;
}

/**
 * 频道
 * 隐藏对应元素的视频
 * @param vdoc 视频列表
 * @returns {boolean}
 */
function startExtracted(vdoc) {
    let temp = false;
    for (const element of vdoc) {
        //用户名
        const upName = element.getElementsByClassName("up-name__text")[0].textContent;
        //视频标题
        let videoName = element.getElementsByClassName("video-name")[0].textContent;
        //空间地址
        const upSpatialAddress = element.getElementsByClassName("up-name")[0].getAttribute("href");
        const videoTime = element.getElementsByClassName("play-duraiton")[0].textContent;
        const lastIndexOf = upSpatialAddress.lastIndexOf("/") + 1;
        const id = parseInt(upSpatialAddress.substring(lastIndexOf));
        temp = shieldVideo_userName_uid_title(element, upName, id, videoName, videoTime);
    }
    return temp;
}

/**
 * 屏蔽首页对应的视频
 * @param {String} str
 */
function startShieldMainVideo(str) {
    const interval = setInterval(() => {
        let list = document.getElementsByClassName(str);
        if (list.length === 0) {
            return;
        }
        while (true) {
            const tempLength = list.length;
            for (let v of list) {
                let videoInfo, title, upName, upSpatialAddress, videoTime;//可以一排定义
                try {
                    videoInfo = v.getElementsByClassName("bili-video-card__info--right")[0];
                    //视频标题
                    title = videoInfo.getElementsByClassName("bili-video-card__info--tit")[0].getAttribute("title");
                    //用户名
                    upName = videoInfo.getElementsByClassName("bili-video-card__info--author")[0].getAttribute("title");
                    //用户空间地址
                    upSpatialAddress = videoInfo.getElementsByClassName("bili-video-card__info--owner")[0].getAttribute("href");
                    videoTime = v.getElementsByClassName("bili-video-card__stats__duration")[0].textContent;//视频的时间
                } catch (e) {
                    v.remove();
                    console.log("获取元素中，获取失败，下一行是该值的html");
                    console.log(e)
                    continue;
                }
                let id = parseInt(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1));
                if (isNaN(id)) {
                    v.remove();
                    console.log("检测到不是正常视频样式，故删除该元素");
                    continue;
                }
                shieldVideo_userName_uid_title(v, upName, id, title, videoTime);
            }
            list = document.getElementsByClassName(str);//删除完对应元素之后再检测一次，如果没有了就结束循环并结束定时器
            if (list.length !== tempLength) {//如果执行完之后关键元素长度还是没有变化，说明不需要在执行了
                continue;
            }
            clearInterval(interval);
            return;
        }
    }, 1000);
}

/**
 * 屏蔽首页顶部推荐视频
 */
function startShieldMainVideoTop() {
    startShieldMainVideo("feed-card");
}

/**
 * 点击播放器的宽屏按钮
 */
function click_playerCtrlWhid() {
    const interval = setInterval(() => {
        try {
            document.getElementsByClassName("bpx-player-ctrl-btn bpx-player-ctrl-wide")[0].click()
            console.log("已自动点击播放器的宽屏")
            clearInterval(interval);
        } catch (e) {
        }
    }, 1000);
}

/**
 * 删除消息中心的回复我的规则
 */
function delMessageReply() {
    const list = document.getElementsByClassName("reply-item");
    for (let v of list) {
        const info = v.getElementsByClassName("name-field")[0];
        const name = info.textContent;//用户名
        const indess = info.getElementsByTagName("a")[0].getAttribute("href");
        const uid = parseInt(indess.substring(indess.lastIndexOf("/") + 1));
        const content = v.getElementsByClassName("text string")[0].textContent;//消息内容
        startPrintShieldNameOrUIDOrContent(v, name, uid, content);
    }
}

/**
 * 删除消息中的艾特我的规则
 */
function delMessageAT() {
    for (let v of document.getElementsByClassName("at-item")) {
        const userInfo = v.getElementsByClassName("name-field")[0].getElementsByTagName("a")[0];
        const href = userInfo.getAttribute("href");
        const userName = userInfo.textContent;
        const uid = parseInt(href.substring(href.lastIndexOf("/") + 1));
        const content = v.getElementsByClassName("content-list")[0].textContent;
        startPrintShieldNameOrUIDOrContent(v, userName, uid, content);
    }
}


/**
 * 移除视频播放页播放器下面和右侧和右下角的推广
 */
function delVideoRightButtonAD() {
    const interval = setInterval(() => {
        const id = document.getElementById("right-bottom-banner");
        const idGame = document.getElementsByClassName("video-page-game-card-small")[0];
        const className = document.getElementsByClassName("pop-live-small-mode part-undefined")[0];
        const fixed_Nav = document.getElementsByClassName("fixed-nav")[0];
        const float_nav_exp = document.getElementsByClassName("float-nav-exp")[0];
        const elementById = document.getElementById("activity_vote");
        if (elementById) {
            elementById.remove();
            delVideoRightButtonADIndex++;
        }
        if (fixed_Nav) {
            fixed_Nav.remove();
            delVideoRightButtonADIndex++;
        }
        if (float_nav_exp) {
            try {
                float_nav_exp.getElementsByClassName("item mini")[0].remove();//删除右侧的小窗按钮
                float_nav_exp.getElementsByTagName("a")[0].remove();//删除右侧的反馈按钮
                delVideoRightButtonADIndex++;
            } catch (e) {
            }
        }
        if (id) {
            document.getElementById("right-bottom-banner").remove();//删除右下角的活动推广
            delVideoRightButtonADIndex++;
        }
        if (idGame) {
            idGame.remove();
            delVideoRightButtonADIndex++;
        }
        if (className) {
            className.remove();//删除右下角的直播推广
            delVideoRightButtonADIndex++;
        }
        if (delVideoRightButtonADIndex === 6) {
            clearInterval(interval);
            console.log("视频页面的广告已经清除！")
        }
    }, 1000);
}


/**
 * 屏蔽直播间对应的言论
 * 暂时测试打印下效果
 */
function delDemo() {
    const chatItems = document.getElementById("chat-items");
    const list = chatItems.getElementsByClassName("chat-item danmaku-item");
    for (let v of list) {
        const userName = v.getAttribute("data-uname");
        const uid = parseInt(v.getAttribute("data-uid"));
        const content = v.getAttribute("data-danmaku");
        let fansMeda = "这是个个性粉丝牌子";
        try {
            fansMeda = v.getElementsByClassName("fans-medal-content")[0].textContent;
        } catch (e) {
        }
        if (!startPrintShieldNameOrUIDOrContent(v, userName, uid, content)) {
            if (shieldFanCard(v, fansMeda)) {
                console.log("已通过粉丝牌【" + fansMeda + "】屏蔽用户【" + userName + "】 言论=" + content);
            }
        }
    }
}

/**
 * 针对视频播放页右侧的视频进行过滤处理
 */
function delVideoRightVideo() {
    let interval = setInterval(() => {
        for (let e of document.getElementsByClassName("video-page-card-small")) {//获取右侧的页面的视频列表
            const videoInfo = e.getElementsByClassName("info")[0];
            //用户名
            const name = videoInfo.getElementsByClassName("name")[0].textContent;
            //视频标题
            const videoTitle = videoInfo.getElementsByClassName("title")[0].textContent;
            //用户空间地址
            const upSpatialAddress = e.getElementsByClassName("upname")[0].getElementsByTagName("a")[0].getAttribute("href");
            const id = parseInt(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("com/") + 4, upSpatialAddress.length - 1));
            let videoTime;
            try {
                videoTime = e.getElementsByClassName("duration")[0].textContent;
                clearInterval(interval);
                shieldVideo_userName_uid_title(e, name, id, videoTitle, videoTime);
            } catch (e) {
                console.log("获取视频时长错误，出现异常错误=" + e)
            }
        }
    }, 1000);
}


/**
 * 清理首页零散无用的推送,如个别直播推送，综艺，赛事等，零散的掺杂在视频列表中
 */
function startShieldMainAFloorSingle() {
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
                console.log("清理首页零散无用的推送")
                clearInterval(interval);
                return;
            }
        }
    }, 1000);
}

/**
 * 清理首页中的零散的直播间元素
 */
function startShieldMainlive() {
    if (boolShieldMainlive === true) {//避免同一时间多个执行！，只能执行完一个再执行下一个，反之其他统统拒绝
        return;
    }
    boolShieldMainlive = true;
    const interval = setInterval(() => {
        const list = document.getElementsByClassName("bili-live-card is-rcmd");
        if (list.length === 0) {
            return;
        }
        for (let v of list) {
            v.remove();
        }
        console.log("已清理零散的直播元素");
        clearInterval(interval);
        boolShieldMainlive = false;
    }, 500);
}

/***
 * 屏蔽首页左侧的轮播大图
 */
function startShieldMainLeftPic() {
    if (homePicBool) {
        const interval = setInterval(() => {
            try {
                document.getElementsByClassName("recommended-swipe grid-anchor")[0].style.display = "none"
                console.log("执行了屏蔽首页轮播图")
                clearInterval(interval);
            } catch (e) {
            }
        }, 1000);
    }
}


/**
 * 根据规则删除专栏和动态的评论区
 * 针对于专栏和动态内容下面的评论区
 */
function delDReplay() {
    const list = document.getElementsByClassName("list-item reply-wrap");
    for (let v of list) {
        const userInfo = v.getElementsByClassName("user")[0];//楼主信息
        const userName = userInfo.getElementsByClassName("name")[0].textContent;//楼主用户名
        const uid = parseInt(userInfo.getElementsByTagName("a")[0].getAttribute("data-usercard-mid"));//楼主UID
        const userContent = v.getElementsByClassName("text")[0].textContent;//内容
        const replyItem = v.getElementsByClassName("reply-box")[0].getElementsByClassName("reply-item reply-wrap");//楼层成员
        if (startPrintShieldNameOrUIDOrContent(v, userName, uid, userContent)) {
            continue;
        }
        for (let j of replyItem) {
            const replyInfo = j.getElementsByClassName("user")[0];//楼层成员info信息
            const replayName = replyInfo.getElementsByClassName("name")[0].textContent;
            const replayUid = parseInt(replyInfo.getElementsByClassName("name")[0].getAttribute("data-usercard-mid"));
            const replayContent = replyInfo.getElementsByTagName("span")[0].textContent;
            startPrintShieldNameOrUIDOrContent(j, replayName, replayUid, replayContent);
        }
    }
}

/**
 * 删除搜索页面的视频元素
 * @param videoList
 */
function searchRules(videoList) {
    for (let v of videoList) {
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
        let id = parseInt(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1));
        shieldVideo_userName_uid_title(v.parentNode, name, id, title, videoTime);
    }
}

function perf_observer(list, observer) {
    const entries = performance.getEntriesByType('resource');
    const windowUrl = getWindowUrl();
    for (let entry of entries) {
        const url = entry.name;
        const initiatorType = entry.initiatorType;
        if (initiatorType === "img" || initiatorType === "css" || initiatorType === "link" || initiatorType === "beacon") {
            continue;
        }
        //只要json类的
        if (url.includes("api.bilibili.com/x/web-interface/web/channel")) {
            //针对于频道界面的综合视频和频道界面的精选视频
            frequencyChannelRules();
            channelListRules();
            continue;
        }
        if (url.includes("https://api.bilibili.com/x/v2/reply/main?csrf=") ||
            url.includes("api.bilibili.com/x/v2/reply/reply?csrf=") &&
            windowUrl.includes("https://www.bilibili.com/video")) {
            //如果是视频播放页的话，且接收到评论的相应请求
            for (let v of document.getElementsByClassName("reply-item")) {//针对于评论区
                const userInfo = v.getElementsByClassName("user-info")[0];
                const userName = userInfo.getElementsByClassName("user-name")[0].textContent;
                const userID = userInfo.getElementsByClassName("user-name")[0].getAttribute("data-user-id")
                const root = v.getElementsByClassName("reply-content")[0].parentNode.textContent;//楼主评论
                const subReplyList = v.getElementsByClassName("sub-reply-list")[0];//楼主下面的评论区
                if (startPrintShieldNameOrUIDOrContent(v, userName, userID, root)) {
                    continue;
                }
                for (let j of subReplyList.getElementsByClassName("sub-reply-item")) {
                    const subUserName = j.getElementsByClassName("sub-user-name")[0].textContent;
                    const subUserID = j.getElementsByClassName("sub-user-name")[0].getAttribute("data-user-id")
                    const subContent = j.getElementsByClassName("reply-content-container sub-reply-content")[0].textContent;
                    startPrintShieldNameOrUIDOrContent(j, subUserName, subUserID, subContent);
                }
            }
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd?y_num=5&fresh_type=3&feed_version=V8&fresh_idx_1h=2&fetch_row=1&fresh_idx=2&brush=0&homepage_ver=1&ps=10&last_y_num=5&outside_trigger=&w_rid=")) {
            //首页带有换一换一栏的视频列表
            startShieldMainVideoTop();
            console.log("首页带有换一换一栏的视频列表")
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd?y_num=4&fresh_type=4&feed_version=V8&fresh_idx_1h=")) {//首页换一换推送下面的视频
            startShieldMainVideo("bili-video-card is-rcmd");
            startShieldMainAFloorSingle();
            startShieldMainlive();
            continue;

        }
        if (url.includes("api.bilibili.com/x/web-show/wbi/res/locs?pf=")) {//首页赛事相关
            startShieldMainAFloorSingle();
            continue;
        }
        if (url.includes("api.bilibili.com/x/msgfeed/reply?platform=") || url.includes("api.bilibili.com/x/msgfeed/reply?id=")) {//第一次加载对应json信息和后续添加的json信息
            delMessageReply();
            continue;
        }
        if (url.includes("api.bilibili.com/x/article/metas?ids=")) {
            searchColumn();
            continue;
        }
        if (url.includes("api.bilibili.com/x/msgfeed/at?build=")) {//消息中心的 @我的
            delMessageAT();
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
        }

        if (url.includes("api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd?y_num=")) {//该api应该是首页可通过换一换是推荐下面的视频内容
            console.log("不确定api链接！")
        }
    }
}

/**
 * 频道排行榜规则
 */
function channelListRules() {
    let list = document.getElementsByClassName("rank-video-card");
    if (list.length !== 0 && startExtracted(list)) {
        console.log("已检测到频道综合的排行榜")
    }
}

/**
 * 频道精选视频等其他视频规则
 * 已针对个别情况没有删除对应元素，做了个循环处理
 */
function frequencyChannelRules() {
//针对频道中的精选视频和在综合排行榜下面的视频
    //let index = 0;
    while (true) {
        const list = document.getElementsByClassName("video-card");
        const tempLength = list.length;
        if (tempLength === 0) {
            break;
        }
        //console.log("执行第" + index + "轮检测")
        startExtracted(list)
        if (list.length === tempLength) {
            console.log("页面元素没有变化了，故退出循环")
            break;
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
        const userName = userInfo.textContent;
        const upSpatialAddress = userInfo.getAttribute("href");
        let id = parseInt(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1));
        startPrintshieldcolumn(v, userName, id, textContent, title);
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
                    console.log("删除搜索到的精确结果元素")
                } catch (e) {
                }
                try {//删除搜索到的精确用户结果元素
                    document.getElementsByClassName("user-list search-all-list")[0].remove();
                    console.log("删除搜索到的精确用户结果元素")
                } catch (e) {
                }
                searchRules(list);
                if (tempListLength === list.length) {
                    clearInterval(interval);
                    console.log("页面元素没有变化，故退出循环")
                    break;
                }
            }
        }, 500);
    }
    if (href.includes("https://www.bilibili.com/video")) {//如果是视频播放页的话
        document.getElementById("reco_list").addEventListener("DOMSubtreeModified", () => {
            delVideoRightVideo();
        });
        setTimeout(() => {
            document.getElementsByClassName("rec-footer")[0].addEventListener("click", () => {
                console.log("用户点击了右侧的展开")
                delVideoRightVideo();
            })
        }, 3000);
        delVideoRightButtonAD();
        click_playerCtrlWhid();
    }
    if (href.includes("message.bilibili.com/#/at") || href.includes("message.bilibili.com/?spm_id_from=..0.0#/at")) {//消息中心-艾特我的
        delMessageAT();
        return;
    }
    if (href.includes("message.bilibili.com/#/reply") || href.includes("message.bilibili.com/?spm_id_from=..0.0#/reply")) {
        delMessageReply();
        return;
    }
    if (href.search("www.bilibili.com/v/channel/.*?tab=.*") !== -1) {//频道 匹配到频道的精选列表，和综合的普通列表
        frequencyChannelRules();
    }

}

(function () {
    'use strict';
    let href = getWindowUrl();
    if (href.includes("https://message.bilibili.com/pages/nav/header_sync")) {
        //console.log("检测到不该出现的url=" + href);//最好把这url给补上
        return;
    }
    console.log("当前网页url= " + href);
    //监听网络变化
    var observer = new PerformanceObserver(perf_observer);
    observer.observe({entryTypes: ['resource']});

    ruleList(href)//正常加载网页时执行

    setInterval(function () {//每秒监听网页中的url
        const tempUrl = getWindowUrl();
        if (href === tempUrl) {//没有变化就结束本轮
            return;
        }//有变化就执行对应事件
        console.log("页面url发生变化了，原=" + href + " 现=" + tempUrl);
        href = tempUrl;//更新url
        ruleList(href);//网页url发生变化时执行
    }, 1000);


    if (href.includes("//live.bilibili.com/")) {
        try {
            document.getElementById("chat-items").addEventListener("DOMSubtreeModified", () => {
                delDemo();
            });
            console.log("定义了监听器=chat-items")
        } catch (e) {
            console.log("测试，没找着id")
        }
    }
    if (href.includes("search.bilibili.com") && searchColumnBool === false) {
        try {
            document.getElementById("biliMainFooter").remove();
            document.getElementsByClassName("side-buttons flex_col_end p_absolute")[0].remove();
            console.log("已删除搜索底部信息和右侧悬浮按钮")
        } catch (e) {
        }
        searchColumnBool = true;
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

    if (href === "https://www.bilibili.com/") { //首页
        startShieldMainLeftPic();
        if (paletteButtionBool) {
            setTimeout(() => {
                document.getElementsByClassName("palette-button-wrap")[0].style.display = "none";
            }, 2000);
        }
        //document.getElementById("bili-header-banner-img").remove()//删除首页顶部的图片
        document.getElementsByClassName("left-entry")[0].style.visibility = "hidden"//删除首页左上角的导航栏，并继续占位
        document.getElementsByClassName("banner-link")[0].remove();//删除首页顶部图片的跳转链接
        startShieldMainAFloorSingle();
        startShieldMainVideoTop();
    }
})();
/**
 精简处理的地方有：
 搜索页面右侧悬浮按钮（貌似是新版的，没留意）
 搜索页面底部信息
 视频播放界面右侧个别悬浮按钮
 */

/*****
 * 原本想写多一个处理从首页进去的的动态页面的评论区的，不知道为什么捕获不到那个api链接，如果捕获到了或许可以比较好处理写，用定时器一直监听也是比较麻烦，以后如果有机会或者，找到方法了在尝试解决把
 * 对其部分上述代码先放在注释这边先，以后有缘再处理
 * 其中关键api放这：
 * api.bilibili.com/x/v2/reply/main?callback=
 * api.bilibili.com/x/polymer/web-dynamic/v1/feed/all?host_mid=
 function dynamicCommentsf(v) {//动态评论区
    const userInfo = v.getElementsByClassName("user")[0].getElementsByTagName("a")[0];//用户信息
    const userUID = userInfo.getAttribute("data-usercard-mid");//用户UID
    const userName = userInfo.text;//用户名
}
 for (let v of document.getElementsByClassName("comment-list has-limit")[0].getElementsByClassName("con")) {
    dynamicCommentsf(v);
    const userContent = v.getElementsByClassName("text")[0].textContent;//楼主的言论
    console.log(userContent)
    for (let j of v.getElementsByClassName("reply-item reply-wrap")) {//楼主下面的评论
        dynamicCommentsf(j)
        const subContent = j.getElementsByClassName("text-con")[0].textContent;
        //console.log(subContent);
    }
}


 //设置页面元素监听点击事件
 document.getElementsByClassName("feed-roll-btn")[0].addEventListener("click", () => {
    setTimeout(() => {
        startShieldMainVideoTop();
        console.log("用户点击了换一换")
    }, 500);
});



 获取用户所有关注的思路：
 不确定js有没有相关可以发起请求的库，以java的为例，请求带上cookie，和referer，
 且用该api发起请求
 https://api.bilibili.com/x/relation/followings?vmid=UID号&pn=页数，从1开始&ps=20&order=desc&order_type=attention&jsonp=jsonp&callback=__jp5
 其中referer值=https://space.bilibili.com/用户UID/fans/follow
 正常情况就可以得到内容了，根据总的关注数量，除以20，且除余就得出需要循环获取多少次了页数

 新计划
 根据规则屏蔽直播间的用户



 这里写一下，避免下次还得用搜索引擎查找，目前已知match的网址规则可以这样填写，就匹配到了    *://message.bilibili.com/*

 */

