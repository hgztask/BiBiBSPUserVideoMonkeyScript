// ==UserScript==
// @name         b站屏蔽增强器
// @namespace    http://tampermonkey.net/
// @license      MIT
// @version      1.2.4
// @description  支持动态屏蔽、评论区过滤屏蔽，视频屏蔽（标题、用户、uid等）、蔽根据用户名、uid、视频关键词、言论关键词和视频时长进行屏蔽和精简处理，支持获取b站相关数据并导出为json(用户收藏夹导出，历史记录导出、关注列表导出、粉丝列表导出)(详情看脚本主页描述)
// @author       byhgz
// @exclude      *://message.bilibili.com/pages/nav/header_sync
// @exclude      *://message.bilibili.com/pages/nav/index_new_pc_sync
// @exclude      *://live.bilibili.com/blackboard/dropdown-menu.html
// @exclude      *://live.bilibili.com/p/html/live-web-mng/*
// @exclude      *://www.bilibili.com/correspond/*
// @match        *://search.bilibili.com/*
// @match        *://www.bilibili.com/v/food/*
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
// @require      https://cdn.jsdelivr.net/npm/vue@2
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://greasyfork.org/scripts/462234-message/code/Message.js?version=1170653
// @icon         https://static.hdslb.com/images/favicon.ico
// @connect      bilibili.com
// @connect      api.mikuchase.ltd
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addValueChangeListener
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @noframes
// @downloadURL https://update.greasyfork.org/scripts/461382/b站屏蔽增强器.user.js
// @updateURL https://update.greasyfork.org/scripts/461382/b站屏蔽增强器.meta.js
// ==/UserScript==
'use strict';

/**
 * 用户基本信息
 */
class UserClass {
    upName;
    uid;
    upAddress;
    level;

    /**
     *
     * @param {string}upName
     * @return {UserClass}
     */
    setUpName(upName) {
        this.upName = upName.trim();
        return this;
    }

    setUpAddress(upAddress) {
        this.upAddress = upAddress;
        return this;
    }

    setUid(uid) {
        this.uid = uid;
        this.setUpAddress(`https://space.bilibili.com/${uid}`)
        return this;
    }

    setLevel(level) {
        const tempLevelMatch = level.match(/level_(.*).svg/);
        if (tempLevelMatch === null) {
            this.level = -1;
            return this;
        }
        this.level = tempLevelMatch[1];
        return this;
    }
}

/**
 * 视频基本信息
 */
class VideoClass extends UserClass {
    title;
    bv;
    av;
    videoAddress;
    videoTime;
    playbackVolume;
    barrageQuantity;
    //封面
    frontCover;
    e;

    setTitle(title) {
        this.title = title;
        return this;
    }

    setBv(bv) {
        this.bv = bv;
        return this;
    }

    setAv(av) {
        this.av = av;
        return this;
    }

    setVideoAddress(videoAddress) {//设置视频地址
        this.videoAddress = videoAddress;
        return this;
    }

    setVideoTime(videoTime) {//设置时长
        this.videoTime = videoTime;
        return this;
    }

    //设置播放量
    setPlaybackVolume(playbackVolume) {
        this.playbackVolume = playbackVolume;
        return this;
    }

    setE(element) {//元素
        this.e = element;
        return this;
    }

    setFrontCover(frontCover) {
        this.frontCover = frontCover;
        return this;
    }

    setBarrageQuantity(value) {//弹幕量
        this.barrageQuantity = value;
        return this;
    }
}

/**
 * 用户评论内容
 */
class ContentCLass extends UserClass {
    content;

    setContent(content) {
        this.content = content;
        return this;
    }
}

class LiveRoom extends UserClass {
    roomId;
    title;
    //头像
    face;
    //封面
    frontCover;
    //视频帧
    videoFrame;

    setRoomId(roomId) {
        this.roomId = roomId;
        return this;
    }

    setTitle(title) {
        this.title = title;
        return this;
    }

    setFace(face) {
        this.face = face;
        return this;
    }

    setFrontCover(frontCover) {
        this.frontCover = frontCover;
        return this;
    }

    setVideoFrame(videoFrame) {
        this.videoFrame = videoFrame;
        return this;
    }
}

const defApi = "https://api.mikuchase.ltd";
const registeredAddress = "https://www.mikuchase.ltd/web/#/registerAndLogIn";
/**
 * 踩坑记录，如果在ajax中使用地址时，后面记得加/
 */

/**
 * 工具类
 */
const Util = {
    //设置数据
    setData(key, content) {
        GM_setValue(key, content);
    },
    //读取数据
    getData(key, defaultValue) {
        return GM_getValue(key, defaultValue);
    },
    isData(key) {//判断数据是否存在
        return this.getData(key) !== undefined;
    },
    //删除数据
    delData(key) {
        if (!this.isData(key)) {
            return false;
        }
        GM_deleteValue(key);
        return true;
    },
    setLocalData(key, data) {
        window.localStorage.setItem(key, data);
    },
    getLocalData(key) {//如果 key 所对应的值不存在，它将返回 null，否则返回存储的对应键值 key 的字符串值。
        return window.localStorage.getItem(key);
    },
    //添加样式
    addStyle(cssStyleStr) {
        GM_addStyle(cssStyleStr);
    },
    /**
     * 发起http请求
     * @param {Object}x
     */
    httpRequest(x) {
        GM_xmlhttpRequest(x);
    },
    /**
     *注册一个菜单并返回菜单id，可在插件中点击油猴时看到对应脚本的菜单
     * @param {string}text 显示文本
     * @param {function}func 事件
     * @param {string}shortcutKey 快捷键
     * @return menu 菜单id
     */
    addGMMenu(text, func, shortcutKey = null) {
        return GM_registerMenuCommand(text, func, shortcutKey);
    },
    /**
     * 根据注册的菜单id删除对应菜单
     * @param menuValue 菜单id
     */
    delGMMenu(menuValue) {
        GM_unregisterMenuCommand(menuValue) // 按删除一个菜单
    },
    /**
     * 获取当前网页cookie
     * @return {string}
     */
    getCookie() {
        return document.cookie;
    },
    /**
     * 获取当前网页cookie，已键值对形式对象返回
     * @return {{}}
     */
    getCookieList() {
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
    splitTimeHMS(time) {
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
    getTimeTotalSeconds(time) {
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
    formateTime(time) {
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
    timestampToTime(timestamp) {
        timestamp = timestamp ? timestamp : null;
        if ((timestamp + "").length === 10) {
            timestamp *= 1000;
        }
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
    changeFormat(str) {
        if (!str.includes("万")) {
            //数字在1万以下的值
            return parseInt(str);
        }
        str = str.replace("万", "");
        if (str.includes(".")) {
            str = str.replace(".", "");
            return parseInt(str + "000");//已知b站视频的播放量或者弹幕量的播放量达到万以上时如果有小数点必然是一个数的，比如10.5万
        }
        return parseInt(str + "0000");//没有小数点却带有万字的情况下，直接在后面+四个零
    },
    /**
     * 将视频播放量和弹幕量格式化输出
     * 不超出4位数的按原数字返回字符串
     * 反之截取只保留万返回字符串
     * @param {string|number}strNumber
     * @returns {string}
     */
    getNumberFormat(strNumber) {
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
    getWindowUrl() {
        return window.location.href;
    },
    /**
     * 封装好的定时器检测元素，检测到将删除对应元素，ID方式
     * @param {String}idName
     * @param {number}time
     * @param {String}tip
     */
    circulateID(idName, time, tip) {
        const interval = setInterval(() => {
            const elementById = document.getElementById(idName);
            if (elementById) {
                elementById.remove();
                clearInterval(interval);
                Tip.printLn(tip);
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
    circulateIDs(elementStr, index, time, tip) {
        let tempIndex = 0;
        const interval = setInterval(() => {
            const byElement = document.getElementById(elementStr);
            if (byElement) {
                byElement.remove();
                Tip.printLn(tip);
            }
            if (++tempIndex === index) {
                clearInterval(interval);
            }
        }, time);
    },
    suspensionBall(dragId, func) {//设置元素可自由拖动拖动
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
            if (func === undefined) return;
            if (isClick) {
                func();
            }
        }
    },
    randomNum(minNum, maxNum) { //生成从minNum到maxNum的随机数
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
    },
    /**
     * 封装好的定时器检测元素，检测到将删除对应元素，class方式
     * @param elementStr
     * @param time
     * @param {String}tip
     */
    circulateClassName(elementStr, time, tip) {
        const interval = setInterval(() => {
            const byElement = document.getElementsByClassName(elementStr)[0];
            if (byElement) {
                byElement.remove();
                clearInterval(interval);
                Tip.printLn(tip);
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
    circulateClassNames(elementStr, elementIndex, index, time, tip) {
        let tempIndex = 0;
        const interval = setInterval(() => {
            const byElement = document.getElementsByClassName(elementStr)[elementIndex];
            if (byElement) {
                byElement.remove();
                Tip.printLn(tip);
            }
            if (++tempIndex === index) {
                clearInterval(interval);
            }
        }, time);
    },
    forIntervalDelE(elementCss, tip, time = 1000) {//定时检查指定元素，执行删除
        const i = setInterval(() => {
            const e = document.querySelector(elementCss);
            if (e === null) return;
            clearInterval(i);
            e.remove();
            Tip.success(tip);
        }, time);
    },
    /**
     * 返回当前时间
     * @returns {String}
     */
    toTimeString() {
        return new Date().toLocaleString();
    },
    printElement(id, element) {
        $(id).prepend(element);
    },
    /**
     * 设置页面播放器的播放速度
     * @param {Number|String} index
     */
    setVideoBackSpeed(index) {
        const videoTag = $("video");
        if (videoTag.length === 0) return;
        try {
            for (const v of videoTag) {
                v.playbackRate = index;
            }
        } catch (error) {
            console.log("出现错误，当前页面疑似没有播放器或者其他问题=" + error);
        }
    },
    video: {
        openPictureInPicture(video) {//打开指定视频标签的画中画模式
            return video.requestPictureInPicture();
        },
        closePictureInPicture() {//关闭页面画中画
            if (!document.pictureInPictureElement) return false;
            document.exitPictureInPicture();//退出画中画
            return true;
        },
        autoPictureInPicture(video) {//页面
            if (document.pictureInPictureElement) {
                this.closePictureInPicture();
                return;
            }
            this.openPictureInPicture(video);
        },
        autoAllPictureInPicture() {
            for (let video of document.getElementsByTagName("video")) {
                this.autoPictureInPicture(video);
            }
        }
    },
    /**
     *
     * @param {String}xy x轴还是Y轴
     * @param {String|Number}index
     */
    setVideoRotationAngle(xy, index) {
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
    setVideoCenterRotation(index) {
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
    getRGBA(r, g, b, a) {
        return `rgba(${r},${g}, ${b}, ${a})`;
    },
    /**
     * 复制单行内容到粘贴板
     * content : 需要复制的内容
     * message : 复制完后的提示，不传则默认提示"复制成功"
     */
    copyToClip(content, message) {
        const aux = document.createElement("input");
        aux.setAttribute("value", content);
        document.body.appendChild(aux);
        aux.select();
        document.execCommand("copy");
        document.body.removeChild(aux);
        if (message == null) {
            alert("复制成功");
        } else alert(message);
    },
    /**
     * 更新悬浮按钮的坐标
     * @param e 事件源
     */
    updateLocation(e) {
        const x = e.clientX;
        const y = e.clientY;
        //获取当前鼠标悬停的坐标轴
        window.suspensionDivVue.xy.x = x;
        window.suspensionDivVue.xy.y = y;
        if (!VueData.panelSetsTheLayout.isDShieldPanelFollowMouse()) return;
        const suspensionDiv = $("#suspensionDiv");
        suspensionDiv.css("left", x + "px");
        suspensionDiv.css("top", y + "px");
    },
    /**
     * 获取链接的域名
     * @param url 链接
     * @return {null|string}
     */
    getRealmName(url) {
        try {
            const domain = url.split("/");
            if (domain[2]) {
                return domain[2];
            } else return null;
        } catch (e) {
            return null;
        }
    },
    /**
     * 显示屏蔽面板
     * @param e 事件源
     * @param data
     */
    showSDPanel(e, data) {
        const name = data["upName"];
        const uid = Util.getSubUid(data["uid"]);
        const title = data["title"];
        let bv = data["bv"];
        let av = data["av"];
        const newVar = LocalData.isDShieldPanel();
        if (newVar) return;
        if (VueData.panelSetsTheLayout.isFixedPanelValueCheckbox()) return;
        window.suspensionDivVue.upName = name;
        window.suspensionDivVue.uid = uid;
        window.suspensionDivVue.videoData.title = title;
        window.suspensionDivVue.videoData.bv = bv;
        window.suspensionDivVue.videoData.av = av;
        window.suspensionDivVue.videoData.frontCover = data["frontCover"];
        if (title === undefined) {
            window.suspensionDivVue.videoData.show = false;
        } else {
            window.suspensionDivVue.videoData.show = true;
            if (bv === undefined) return;
            window.suspensionDivVue.videoData.av = Util.BilibiliEncoder.dec(bv);
        }
        this.updateLocation(e);
        $("#suspensionDiv").css("display", "inline-block");
    },
    /**
     * 对UID后面带有其他符号的字符截取掉并保留UID返回
     * @param {string}uidStr
     * @return {number}
     */
    getSubUid(uidStr) {
        uidStr = uidStr + "";
        const indexOf = uidStr.indexOf("?");
        const uid = indexOf === -1 ? uidStr : uidStr.substring(0, indexOf);
        return parseInt(uid);
    },
    subLastIndexStr: {
        tempFuc(str) {
            return str.substring(str.lastIndexOf("/") + 1);
        }
    },
    getSubWebUrlUid(uidAndes) {//获取url中的uid
        const sub = this.subLastIndexStr.tempFuc(uidAndes);
        if (isNaN(sub)) {
            return null;
        }
        return parseInt(sub);
    },
    getSubWebUrlBV(address) {//截取地址中的bv号
        const match = address.match(/\/video\/(.*?)[?\/]/);
        if (match !== null) {
            return match[1];
        }
        return this.subLastIndexStr.tempFuc(address);
    },
    /**
     * 截取网页的BV号
     * @param url
     * @return {null|string}
     */
    getUrlBVID(url) {
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
    getUrlLiveID(url) {
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
    isEventJq(element, eventName) {
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
    getDistinctKeys(arr) {
        let keysSet = new Set();
        arr.forEach(obj => {
            Object.keys(obj).forEach(key => keysSet.add(key));
        });
        return [...keysSet];
    },
    /**
     * 内容导出为文件
     * @param {String}content 内容
     * @param {String}fileName 文件名
     */
    fileDownload(content, fileName) {
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
    },
    /**
     * bv号与av号互转
     * 使用之前请初始化init先，如下
     * 使用例子
     * BilibiliEncoder.init();//先初始化
     * console.log(BilibiliEncoder.dec('BV1ms4y1e7B8'));//bv转av
     * console.log(BilibiliEncoder.enc(170001));//av转bv
     */
    BilibiliEncoder: {
        table: "fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF",
        tr: {},
        s: [11, 10, 3, 8, 4, 6],
        xor: 177451812,
        add: 8728348608,
        init() {//初始化
            for (let i = 0; i < 58; i++) {
                this.tr[this.table[i]] = i;
            }
        },
        dec(x) {//bv转av
            let r = 0;
            for (let i = 0; i < 6; i++) {
                r += this.tr[x[this.s[i]]] * Math.pow(58, i);
            }
            return (r - this.add) ^ this.xor;
        },
        enc(x) {//av转bv
            x = (x ^ this.xor) + this.add;
            const r = "BV1  4 1 7  ".split("");
            for (let i = 0; i < 6; i++) {
                r[this.s[i]] = this.table[Math.floor(x / Math.pow(58, i)) % 58];
            }
            return r.join("");
        }
    },
    openWindowWriteContent(content) {//打开一个标签页并写入内容至页面
        try {
            const newWindow = window.open();
            newWindow.document.write(content);
        } catch (e) {
            alert("出现错误！用户必须将浏览器设置为允许弹出窗口才能打开新窗口！");
        }
    },
    /**
     * 去除字符串中所有空格
     * @param {string}ele
     * @returns {string}
     */
    strTrimAll(ele) {
        return ele.split(/[\t\r\f\n\s]*/g).join("");
    },
    isBoolean(str) {
        const bool = Boolean(str);
        return bool === true;
    },
    bufferBottom() {//缓冲置底
        $('html, body').animate({scrollTop: $(document).height()}, 'slow');
    },
    Str: {
        lastForwardSlashEnd(str) {//返回字符串尾部中正斜杠/后面的内容
            return str.substring(str.lastIndexOf("/") + 1);
        },
        lastIndexSub(str, lastIndex) {//返回排除尾部lastIndex个字符，并把前面字符串返回
            if (str === "") {
                throw new Error("str错误！");
            }
            return str.substring(0, str.length - lastIndex);
        }
    },
    /**
     * 判断对象是否具有指定的所有属性名
     * @param {Object} obj - 要检查的对象
     * @param {Array} propertyArray - 属性名数组
     * @returns {boolean} - 如果对象包含数组中的所有属性名，则返回 true；否则返回 false
     */
    hasAllProperties(obj, propertyArray) {
        for (let value of propertyArray) {
            if (!obj.hasOwnProperty(value)) {
                return false;
            }
        }
        return true;
    },
    /**
     * 比较两个对象是否相同
     * @param {Object}obj1
     * @param {Object}obj2
     * @param {Array}keyArr 属性名数组
     * @return {boolean}如果两个对象的属性缺少或对不上KeyArr属性名数组中的属性，则返回false，反之继续比较其属性值是否相同
     */
    objEquals(obj1, obj2, keyArr) {
        if (!this.hasAllProperties(obj1, keyArr)) return false;
        if (!this.hasAllProperties(obj2, keyArr)) return false;
        for (let key of keyArr) {
            if (obj1[key] === obj2[key]) {
                continue;
            }
            return false;
        }
        return true;
    },
    getUrlParam(urlStr, urlKey) {//获取url指定参数的值
        const reg = new RegExp('[\?\&]' + urlKey + '=([^\&]*)(\&?)', 'i')
        const r = urlStr.match(reg)
        return r ? decodeURI(r[1]) : null;
    },
    /**
     * 不产生新的数据对象
     * 合并两个数组并返回合并之后的数组，返回源数组
     * @param {Array}array1 源数组
     * @param {Array}array2 目标数组
     * @param {number}threshold
     * @return {Array} 源数组
     */
    mergeArrays(array1, array2, threshold = 1000) {
        if (array1.length + array2.length <= threshold) {// 当数组长度较小时，使用 push() 方法
            array1.push(...array2);
        } else if (array1.length <= threshold) {// 当 array1 较短，array2 较长时，使用 splice() 方法
            array1.splice(array1.length, 0, ...array2);
        } else {// 当数组长度都较大时，使用 Array.prototype.push.apply() 方法
            Array.prototype.push.apply(array1, array2);
        }
        return array1;
    },
    Thread: {
        sleep(time) {//休眠操作，需要配合await和async
            return new Promise(resolve => {
                const timeout = setTimeout(() => {
                    resolve();
                    clearTimeout(timeout);
                }, time);
            });
        }
    },
    /**
     * 防抖函数
     * 用于限制连续触发的事件频率，确保只有在一定的时间间隔内没有新的触发才会执行函数
     * @param func 函数事件
     * @param delay 间隔时间
     * @return {(function(...[*]): void)|*}
     */
    debounce(func, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }
}



const Watchlater = {
    initLayout() {
        const panel = layout.panel.getHoverBallBut("获取稍后再看列表数据", "32%", "5%");
        const paneLooked = layout.panel.getHoverBallBut("获取稍后再看列表数据(已观看)", "42%", "5%");
        const leadingInLookAtItLaterBut = layout.panel.getHoverBallBut("导入脚本的稍后再看列表", "52%", "5%");
        const $body = $("body");
        $body.append(panel);
        $body.append(paneLooked);
        $body.append(leadingInLookAtItLaterBut);
        panel.click(() => {
            if (!confirm("仅获取页面可见的列表了内容并导出为json，是要继续吗？\n为了获取更完整的内容，请使用鼠标自行滚动，使其页面内容完全加载出来！")) return;
            Util.bufferBottom();
            setTimeout(() => {
                const dataList = this.getDataList();
                if (dataList.length === 0) {
                    alert("未有相关内容！");
                    return;
                }
                const info = `已获取到${dataList.length}个稍后再看的记录`;
                Tip.success(info);
                Tip.printLn(info);
                alert(info);
                Util.fileDownload(JSON.stringify(dataList, null, 3), `b站用户的稍后再看记录${dataList.length}个.json`);
            }, 2000);
        });
        paneLooked.click(() => {
            if (!confirm("仅获取页面可见的列表中【已观看】了的内容并导出为json，是要继续吗？\n为了获取更完整的内容，请使用鼠标自行滚动，使其页面内容完全加载出来！")) return;
            Util.bufferBottom();
            setTimeout(() => {
                const dataList = this.getDataList(true);
                if (dataList.length === 0) {
                    alert("未有相关内容！");
                    return;
                }
                const info = `已获取到${dataList.length}【已观看的】稍后再看的记录`;
                Tip.success(info);
                Tip.printLn(info);
                alert(info);
                Util.fileDownload(JSON.stringify(dataList, null, 3), `b站用户的【已观看】稍后再看记录${dataList.length}个.json`);
            }, 2000);
        });
        leadingInLookAtItLaterBut.click(() => {
            if (!confirm("是要获取页面可见的列表了内容并导入到脚本中的稍后再看列表吗，是要继续吗？\n为了获取更完整的内容，请使用鼠标自行滚动，使其页面内容完全加载出来！")) return;
            Util.bufferBottom();
            setTimeout(() => {
                const dataList = this.getDataList();
                if (dataList.length === 0) {
                    alert("未有相关内容！");
                    return;
                }
                const lookAtItLaterArr = LocalData.getLookAtItLaterArr();
                let tempIndex = 0;
                for (let v of dataList) {
                    if (LookAtItLater.isVarTitleLookAtItLaterList("title", lookAtItLaterArr, v)) {
                        continue;
                    }
                    if (v.videoAddress === null) {
                        Tip.error(`title=${v.title}的视频出现问题，可能是失效了，故排除该视频`);
                        continue;
                    }
                    lookAtItLaterArr.push({
                        upName: v.upName,
                        uid: v.uid,
                        title: v.title,
                        bv: Util.Str.lastForwardSlashEnd(v.videoAddress),
                        frontCover: v.frontCover
                    });
                    tempIndex++;
                }
                console.log("脚本");
                console.table(dataList);
                if (tempIndex === 0) {
                    alert(`脚本的稍后再看列表包含了当前列表项目或者未获取到！`);
                    return;
                }
                alert(`已成功导入了${tempIndex}个内容到脚本的稍后再看列表！`);
                LocalData.setLookAtItLaterArr(lookAtItLaterArr);
                window.otherLayoutVue.renovateLayoutItemList();
            }, 2000);
        });
    },
    /**
     *
     * @param isV 是否只获取已观看的项目
     * @returns {*[]}
     */
    getDataList(isV = false) {
        const eList = document.querySelectorAll(".list-box>span>*");
        const dataList = [];
        for (let v of eList) {
            const data = {};
            const videoInfo = v.querySelector(".av-about");
            data["title"] = videoInfo.querySelector(".t").textContent.trim();
            const userInfo = videoInfo.querySelector(".info.clearfix>.user");
            data["upName"] = userInfo.querySelector("span").textContent;
            const userAddress = userInfo.getAttribute("href");
            data["uid"] = Util.getSubWebUrlUid(userAddress);
            data["userAddress"] = userAddress;
            data["videoAddress"] = videoInfo.querySelector(".t").getAttribute("href");
            const userImg = data["userImg"] = userInfo.querySelector(".lazy-img>img").getAttribute("src");
            const frontCover = data["frontCover"] = v.querySelector(".lazy-img>img").getAttribute("src");
            if (frontCover.trim() === "" || userImg.trim() === "") {
                Tip.error("未获取到封面或用户头像！");
                continue;
            }
            if (isV) {
                const looked = v.querySelector(".looked");
                if (looked === null) continue;
                dataList.push(data);
                continue;
            }
            dataList.push(data);
        }
        return dataList;
    }
}

const DefVideo = {
    delLayout: {
        //移除右侧悬浮按钮
        rightSuspendButton() {
            Util.circulateClassNames("storage-box", 0, 2, 2000, "已移除右侧的【返回旧版】【新版反馈】【客服】");//针对新版界面
        },
        delRightE() {
            const video = Rule.videoData;
            if (video.isRhgthlayout) {
                Util.circulateClassNames("right-container is-in-large-ab", 0, 3, 1500, "已移除视频播放器右侧的布局");
                return;
            }
            // Util.forIntervalDelE("#slide_ad", "已移除右侧slide_ad广告！");
            // Util.circulateClassNames("video-page-special-card-small", 0, 2, 2000, "移除播放页右上角的其他推广");
            // Util.circulateClassNames("vcd", 0, 2, 2000, "已移除右上角的广告");
            // Util.circulateClassName("video-page-game-card-small", 2000, "移除播放页右上角的游戏推广");
            // Util.circulateIDs("right-bottom-banner", 2, 1500, "删除右下角的活动推广");
            // Util.circulateClassName("pop-live-small-mode part-undefined", 1000, "删除右下角的直播推广")
            // Util.circulateClassNames("ad-report video-card-ad-small", 0, 3, 2000, "已删除播放页右上角的广告内容");
            if (video.isrigthVideoList) {
                Util.circulateID("reco_list", 2000, "已移除播放页右侧的视频列表");
                return;
            }
            if (!video.isRightVideo) {
                setTimeout(() => {
                    document.getElementsByClassName("rec-footer")[0].addEventListener("click", () => {
                        Tip.printLn("用户点击了右侧的展开")
                        DefVideo.rightVideo();
                    })
                }, 4000);
            }
        },
        //对视频页的播放器下面的进行处理
        delBottonE() {
            DefVideo.hideCommentArea();//处理评论区
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
        },
    },
    //针对视频播放页右侧的视频进行过滤处理。该界面无需用时长过滤，视频数目较少
    rightVideo() {
        const interval = setInterval(() => {
            let list = document.querySelectorAll(".video-page-card-small");
            if (list.length === 0) return;
            clearInterval(interval);
            list.forEach(v => {//获取右侧的页面的视频列表
                const upSpatialAddress = v.querySelector(".upname>a").href;
                //视频标题
                if (shieldVideo_userName_uid_title(new VideoClass()
                    .setUpName(v.querySelector(".name").textContent)
                    .setUid(parseInt(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("com/") + 4, upSpatialAddress.length - 1)))
                    .setTitle(v.querySelector(".title").textContent)
                    .setE(v)
                )) {
                    Tip.videoBlock("屏蔽了视频");
                    return;
                }
                $(v).mouseenter((e) => {
                    const domElement = e.delegateTarget;
                    const upSpatialAddress = domElement.querySelector(".upname>a").href;
                    const videoAddress = domElement.querySelector(".video-awesome-img");
                    const bv = videoAddress === null ? null : Util.getSubWebUrlBV(videoAddress.href);
                    const v_img = domElement.querySelector(".b-img__inner>img");
                    const data = {
                        upName: domElement.querySelector(".name").textContent,
                        title: domElement.querySelector(".title").textContent,
                        uid: upSpatialAddress.substring(upSpatialAddress.lastIndexOf("com/") + 4, upSpatialAddress.length - 1),
                        frontCover: v_img === null ? null : v_img.getAttribute("src"),
                        bv: bv,
                        av: window.bilibiliEncoder.dec(bv)
                    };
                    Util.showSDPanel(e, data);
                });
            })
        }, 1000);
    },
    clickLayout: {
        fullScreenOnThePlayerPage() {//点击播放器的网页全屏按钮
            const interval = setInterval(() => {
                const jqE = $(".bpx-player-ctrl-btn.bpx-player-ctrl-web");
                if (jqE.length === 0) return;
                clearInterval(interval);
                jqE.click();
                const info = `已自动点击播放器的网页全屏`;
                Tip.printLn(info);
                Tip.success(info);
                console.log(info);
            }, 1000);
        },
        thePlayerGoesToGullScreen() {//点击播放器的进入全屏按钮
            const interval = setInterval(() => {
                const jqE = $(".bpx-player-ctrl-btn.bpx-player-ctrl-full");
                if (jqE.length === 0) return;
                clearInterval(interval);
                jqE.click();
                const info = "已自动点击播放器的进入全屏按钮";
                Tip.success(info);
                Tip.printLn(info);
                console.log(info);
            }, 1000);
        }
    },
    getVIdeoTitle() {//获取当前页面视频标题
        return document.querySelector("#viewbox_report>.video-title").title;
    },
    isCreativeTeam() {//判断是否是创作团队
        return document.querySelector(".header") !== null;
    },
    getCreativeTeam() {//获取创作团队
        const userList = [];
        if (this.isCreativeTeam()) {
            const list = document.querySelectorAll(".container .membersinfo-upcard-wrap .staff-name.is-vip");
            list.forEach(value => {
                const data = {};
                data["name"] = value.textContent.trim();
                const userAddress = value.getAttribute("href");
                data ["uid"] = Util.getSubWebUrlUid(userAddress);
                data["e"] = value;
                userList.push(data);
            })
            return userList;
        }
        const userInfo = document.querySelector(".up-name");
        if (userInfo === null) {
            return userList;
        }
        const data = {};
        data["name"] = userInfo.textContent.trim();
        const userAddress = userInfo.getAttribute("href");
        data["uid"] = Util.getSubWebUrlUid(userAddress);
        data["e"] = userInfo;
        userList.push(data);
        return userList;
    },
    videoCollection: {
        isList() {
            return document.querySelector(".range-box>.van-icon-general_viewlist") !== null;
        },
        isMulti_page() {//判断是否有视频选集
            return document.getElementById("multi_page") !== null;
        },
        getVideoList() {
            const list = [];
            document.querySelectorAll("#multi_page>.cur-list>ul>li").forEach(v => {
                const data = {};
                const routerLinkActive = v.querySelector(".router-link-active");
                data["分p序号"] = v.querySelector(".page-num").textContent;
                data["分p标题"] = routerLinkActive.title;
                data["分p地址"] = routerLinkActive.href;
                data["分p时长"] = v.querySelector(".duration").textContent;
                list.push(data);
            })
            console.log(list);
            return list;
        },
        getVIdeoGridList() {
            const list = [];
            document.querySelectorAll(".module-box.clearfix>li").forEach(value => {
                const data = {};
                data["分p序号"] = value.querySelector("span").textContent;
                const tempE = value.querySelector(".router-link-active");
                data["分p标题"] = tempE.title;
                data["分p地址"] = tempE.href;
                list.push(data);
            });
            return list;
        }
    },
    hideCommentArea() {//隐藏评论区
        if (LocalData.video.isHideVideoButtonCommentSections()) {
            const interval = setInterval(() => {
                const jqE = $("#comment");
                if (jqE.length === 0) return;
                clearInterval(interval);
                jqE.hide();
                Tip.success("已隐藏评论区");
            }, 500);
        }
    },
    setVideoSpeedInfo(videoElement) {
        {
            const data = Util.getData("playbackSpeed");
            if (data === undefined) return;
            if (data === 0 || data < 0.1) return;
            //播放视频速度
            videoElement.playbackRate = data;
            Tip.printLn("已设置播放器的速度=" + data);
        }
    },
    //获取视频页面-评论区信息-单个元素信息-楼主
    getOuterCommentInfo(e) {
        const tempE = e.shadowRoot.querySelector("bili-comment-user-info").shadowRoot;
        const userNameE = tempE.querySelector("#user-name");
        const name = userNameE.textContent.trim(); //姓名
        const uid =userNameE.getAttribute("data-user-profile-id");
        const userLevel = tempE.querySelector("#user-level>img").src;
        const content = e.shadowRoot.querySelector("bili-rich-text")
            .shadowRoot.querySelector("#contents")
            .textContent;
        return new ContentCLass()
            .setUpName(name)
            .setUid(uid)
            .setLevel(userLevel)
            .setContent(content);
    },
    //获取视频页面-评论区信息-单个元素信息-楼层
    getInnerCommentInfo(e) {
        const tempE = e.shadowRoot.querySelector("#main");
        const userInfoE = tempE.querySelector("bili-comment-user-info")
            .shadowRoot.querySelector("#info");
        const userNameE = userInfoE.querySelector("#user-name");
        const name = userNameE.textContent.trim();
        const uid = userNameE.getAttribute("data-user-profile-id");
        const userLevel = userInfoE.querySelector("#user-level>img").src;
        const content = tempE.querySelector("bili-rich-text")
            .shadowRoot.querySelector("#contents").textContent.trim();
        return new ContentCLass()
            .setUpName(name)
            .setUid(uid)
            .setLevel(userLevel)
            .setContent(content);
    },
}

const GreatDemand = {//热门
    delVideo() {
        let list = document.getElementsByClassName("video-card");
        if (list.length === 0) {
            list = document.getElementsByClassName("_card_1kuml_6");
            for (let v of list) {
                const data = new VideoClass().setE(v)
                    .setTitle(v.getElementsByClassName("title")[1].textContent)
                    .setUpName(v.getElementsByClassName("upName")[0].textContent)
                    .setVideoTime(v.getElementsByClassName("time")[0].textContent);
                console.log(data);
                if (shieldVideo_userName_uid_title(data)) {
                    Tip.videoBlock("屏蔽了视频");
                }
            }
            return;
        }
        for (let v of list) {
            //TODO 页面暂时没法获取uid，后续留意
            const data = new VideoClass().setE(v)
                .setTitle(v.getElementsByClassName("video-name")[0].textContent)
                .setUpName(v.getElementsByClassName("up-name__text")[0].textContent)
                .setPlaybackVolume(v.getElementsByClassName("play-text")[0].textContent.trim());
            if (shieldVideo_userName_uid_title(data)) {
                Tip.videoBlock("屏蔽了视频");
            }
        }
    }
}

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

//匹配数组元素
const Matching = {
    /**
     * 根据用户提供的网页元素和对应的数组及key，精确匹配数组某个元素
     * @param arr 数组
     * @param key 唯一key
     * @returns {boolean}
     */
    arrKey(arr, key) {
        if (arr === null || arr === undefined) {
            return false;
        }
        return arr.includes(key);
    },
    /**
     * 根据对象数组，返回匹配数组中对象oBjKey属性是否有指定value的布尔值
     * @param objArr{Array} 对象数组
     * @param objKey{String}对象属性名
     * @param value {String} 要匹配的完整值
     * @return {boolean} 是否有指定value布尔值
     */
    arrObjKey(objArr, objKey, value) {
        for (const v of objArr) {
            if (v[objKey] === undefined) {
                continue;
            }
            if (v[objKey] === value) {
                return true;
            }
        }
        return false;
    },
    /**
     * 根据用户提供的字符串集合，当content某个字符包含了了集合中的某个字符则返回对应的字符，模糊匹配
     * 反之返回null
     * @param {string[]}arr 字符串数组
     * @param {string}content 内容
     * @returns {null|string}
     */
    arrContent(arr, content) {
        if (arr === null || arr === undefined) {
            return null;
        }
        try {
            const lowerCase = Util.strTrimAll(content).toLowerCase();//将内容去重空格并把字母转成小写进行比较
            for (let str of arr) {
                if (lowerCase.includes(str)) {
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
    arrContentCanonical(arr, content) {
        if (arr === null || arr === undefined) {
            return null;
        }
        try {
            const lowerCase = Util.strTrimAll(content).toLowerCase();//将内容去重空格并把字母转成小写进行比较
            for (let str of arr) {
                if (lowerCase.search(str) === -1) {
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

async function perf_observer() {
    const entries = performance.getEntriesByType('resource');
    const windowUrl = Util.getWindowUrl();
    for (let entry of entries) {
        const url = entry.name;
        const initiatorType = entry.initiatorType;
        if (initiatorType === "img" || initiatorType === "css" || initiatorType === "link" || initiatorType === "beacon") {
            continue;
        }
        if (url.includes("api.bilibili.com/x/v2/reply/wbi/main?oid=") || url.includes("api.bilibili.com/x/v2/reply/reply?") ||
            url.includes("api.bilibili.com/x/web-interface/wbi/view/detail?aid=") || url.includes("api.bilibili.com/x/v2/reply/reply?oid=")) {
            /**
             * 视频播放页和www.bilibili.com/opus动态页下的评论
             * 需要注意的是，www.bilibili.com/opus这地址，可以从动态页中的，直接点击动态内容跳转的地址
             */
            if (windowUrl.includes("https://www.bilibili.com/video") && LocalData.video.isHideVideoButtonCommentSections()) {
                continue;
            }
            //是否是新版评论区
            //适配9月4日的动态页评论区
            const isNewComments = windowUrl.includes("https://www.bilibili.com/video") ||
                windowUrl.includes("www.bilibili.com/opus/")||windowUrl.includes("t.bilibili.com");
            console.log("视频api");
            const p = new Promise(resolve => {
                const i1 = setInterval(() => {
                    if (document.querySelector(".reply-list>.reply-loading") !== null) {
                        return;
                    }
                    clearInterval(i1);
                    let replyList;

                    if (isNewComments) {
                        const tempE = document.querySelector("bili-comments");
                        replyList = tempE.shadowRoot.querySelectorAll("bili-comment-thread-renderer")
                    } else {
                        replyList = document.querySelectorAll(".reply-list>.reply-item")
                    }
                    resolve(replyList);
                }, 1000);
            });
            const list = await p;
            for (let v of list) {//针对于评论区
                let usercontentWarp, data;
                if (isNewComments) {
                    usercontentWarp = v.shadowRoot.querySelector("#comment");
                    data = DefVideo.getOuterCommentInfo(usercontentWarp);
                } else {
                    usercontentWarp = v.querySelector(".content-warp");
                    data = Trends.getVideoCommentAreaOrTrendsLandlord(usercontentWarp);
                }
                if (startPrintShieldNameOrUIDOrContent(v, data)) {
                    Tip.success("屏蔽了言论！！");
                    continue;
                }
                const jqE = $(usercontentWarp);
                if (!Util.isEventJq(jqE, "mouseover")) {
                    jqE.mouseenter((e) => {
                        let domElement = e.delegateTarget;
                        let data;
                        if (isNewComments) {
                            data = DefVideo.getOuterCommentInfo(domElement);
                        } else {
                            data = Trends.getVideoCommentAreaOrTrendsLandlord(domElement);
                        }
                        Util.showSDPanel(e, data);
                    });
                }
                let subReplyList;//楼层中的评论列表
                if (isNewComments) {
                    subReplyList = v.shadowRoot
                        .querySelector("bili-comment-replies-renderer").shadowRoot
                        .querySelectorAll("bili-comment-reply-renderer")
                } else {
                    subReplyList = v.querySelectorAll(".sub-reply-container>.sub-reply-list>.sub-reply-item");//楼主下面的评论区
                }
                if (subReplyList.length === 0) {
                    continue;
                }
                for (let j of subReplyList) {
                    let data;
                    if (isNewComments) {
                        data = DefVideo.getInnerCommentInfo(j);
                    } else {
                        data = Trends.getVideoCommentAreaOrTrendsStorey(j);
                    }
                    if (startPrintShieldNameOrUIDOrContent(j, data)) {
                        Tip.success("屏蔽了言论！！");
                        continue;
                    }
                    const jqE = $(j);
                    if (Util.isEventJq(jqE, "mouseover")) {
                        continue;
                    }
                    jqE.mouseenter((e) => {
                        const domElement = e.delegateTarget;
                        if (isNewComments) {
                            data = DefVideo.getInnerCommentInfo(domElement);
                        } else {
                            data = Trends.getVideoCommentAreaOrTrendsStorey(domElement);
                        }
                        Util.showSDPanel(e, data);
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
            Search.searchColumn();
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
            SubjectOfATalk.deltopIC();
            continue;
        }
        if (url.includes("api.live.bilibili.com/xlive/web-interface/v1/second/getList?platform=web")) {//直播间列表，目前依旧还有点小问题，暂时不考虑维护了，后面再考虑
            Live.liveDel.delLiveRoom();
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/popular")
            || url.includes("api.bilibili.com/x/copyright-music-publicity/toplist/music_list?csrf=")
            && windowUrl.includes("www.bilibili.com/v/popular")) {//热门
            GreatDemand.delVideo();
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/dynamic/region?ps=")) {//首页分区类的api
            console.log("检测到首页分区类的api")
            Home.startShieldMainVideo(".bili-video-card");
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/ranking/region?")) {//首页分区排行榜
            for (let v of document.querySelectorAll(".bili-rank-list-video__list.video-rank-list")) {//遍历每个排行榜
                for (let q of v.querySelectorAll("li[class='bili-rank-list-video__item']")) {//遍历某个排行榜中的项目
                    const title = q.querySelector("[title]").textContent;
                    const isTitle = Matching.arrContent(LocalData.getArrTitle(), title);
                    if (isTitle != null) {
                        Tip.printLn(`已通过标题黑名单关键词屏蔽【${isTitle}】标题【${title}】`);
                        q.remove();
                        continue;
                    }
                    const isTitleCanonical = Matching.arrContentCanonical(LocalData.getArrTitleKeyCanonical(), title);
                    if (isTitleCanonical != null) {
                        Tip.printLn(`已通过标题正则黑名单关键词屏蔽【${isTitleCanonical}】标题【${title}】`);
                        q.remove();
                    }
                }
            }
            continue;
        }
        if (url.includes("api.bilibili.com/x/web-interface/wbi/search/type?") || url.includes("api.bilibili.com/x/web-interface/wbi/search/all/v2")) {//搜索界面
            if (windowUrl.includes("search.bilibili.com/video") || windowUrl.includes("search.bilibili.com/all")) {
                Search.video.searchRules();
            }
            if (windowUrl.includes("search.bilibili.com/all")) {
                Search.blockUserCard();
            }
            Tip.info("检测到搜索的接口");
            //search.searchRules();
            continue;
        }
        if (url.includes("https://api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd?web_location")) {//首页换一换
            Home.startShieldMainVideo(".container.is-version8>.feed-card").then(() => {
                Home.startShieldMainVideo(".container.is-version8>.bili-video-card");//换一换下面的视频
            });
        }
        if (url.includes("https://api.bilibili.com/x/web-interface/ranking/v2")) {
            console.log("热门排行榜api");
            const interval = setInterval(() => {
                const elList = document.querySelectorAll(".rank-list>.rank-item");
                if (elList.length === 0) return;
                clearInterval(interval);
                try {
                    elList.forEach(e => {
                        const info = e.querySelector(".info");
                        const videoInfo = info.querySelector(".title");
                        const userInfo = info.querySelector(".detail>a");
                        const video = new VideoClass().setE(e)
                            .setUpName(userInfo.textContent.trim())
                            .setBv(Util.getUrlBVID(videoInfo.href))
                            .setTitle(videoInfo.textContent.trim());
                        video.setUid(Util.getSubWebUrlUid(userInfo.href))
                        if (shieldVideo_userName_uid_title(video)) {
                            Tip.videoBlock("屏蔽了视频");
                        }
                    });
                } catch (e) {
                    console.error(e);
                    Tip.error("检测时出现错误！，请查询控制台信息！");
                }
            }, 100);
        }
    }
    performance.clearResourceTimings();//清除资源时间
}

const SubjectOfATalk = {//话题
    /**
     * 针对b站话题
     */
    deltopIC() {
        for (let v of document.getElementsByClassName("list__topic-card")) {
            const info = v.getElementsByClassName("bili-dyn-content__orig")[0];
            const name = v.getElementsByClassName("bili-dyn-title")[0].textContent.trim();
            const uid = parseInt(v.getElementsByClassName("bili-dyn-item__following")[0].getAttribute("data-mid"));
            if (info.getElementsByClassName("bili-dyn-content__orig__desc").length === 1) {
                const content = info.textContent;
                if (startPrintShieldNameOrUIDOrContent(v, new ContentCLass()
                    .setUpName(name)
                    .setUid(uid)
                    .setContent(content))) {
                   Tip.info("屏蔽了言论！！");
                }
                continue;
            }//如果内容是视频样式
            const videoInfo = info.querySelector(".bili-dyn-card-video");
            if (shieldVideo_userName_uid_title(new VideoClass()
                .setE(v)
                .setUpName(name)
                .setUid(uid)
                .setTitle(videoInfo.querySelector(".bili-dyn-card-video__title.bili-ellipsis").textContent)
                .setVideoTime(videoInfo.querySelector(".bili-dyn-card-video__duration").textContent))) {
                Tip.videoBlock("屏蔽了视频");
            }
        }
    }
}

const UrleCrud = {//规则的增删改查
    addShow(ruleType, ruleName, content = null) {
        if (content === null) {
            content = prompt(`要添加的类型为${ruleName}，请在输入框中填写要添加的具体值规则.`);
            if (content === null) return false;
            content = content.trim();
            if (content === "") {
                Tip.error("请输入正确的内容！");
                return false;
            }
        }
        if (ruleType === "userUIDArr" || ruleType === "userWhiteUIDArr") {
            if (isNaN(content)) {
                Tip.error(`输入的内容不是一个数字！value=${content}`);
                return false;
            }
            content = parseInt(content);
        }
        debugger;
        if (!confirm(`是要添加的${ruleName}规则为：\n${content}\n类型为：${typeof content}`)) {
            return false;
        }
        let ruleDataList = Util.getData(ruleType, []);
        return this.add(ruleDataList, content, ruleType);
    },
    addAllShow(ruleType, ruleName, jsonStrContent) {
        let json;
        if (typeof jsonStrContent !== "string") {
            Tip.error("内容非字符串！");
            return;
        }
        jsonStrContent = jsonStrContent.trim();
        try {
            json = JSON.parse(jsonStrContent);
        } catch (e) {
            Tip.error(`内容不正确！内容需要数组或者json格式！错误信息=${e}`);
            console.error("内容不正确！内容需要数组或者json格式！错误信息", e);
            return;
        }
        if (ruleType === "userUIDArr" || ruleType === "userWhiteUIDArr") {//效验数组内元素是否是整数
            let tempLoop = false;
            for (let v of json) {
                if (typeof v !== "number" && Number.isInteger(v)) {
                    tempLoop = true;
                    break;
                }
            }
            if (tempLoop) {
                Tip.error(json, "数组中有个元素非数字或非整数！");
                return;
            }
        }
        const ruleList = Util.getData(ruleType, []);
        const res = this.addAll(ruleList, json, ruleType);
        if (res.code) {
            Tip.success(`已批量插入${ruleName}的规则`);
        } else {
            Tip.error(res.msg);
        }
    },
    /**
     * 单个元素进行添加
     * @param {Array} arr
     * @param {String,number} key
     * @param {String} ruleType
     */
    add(arr, key, ruleType) {
        if (arr.includes(key)) return false;
        arr.push(key);
        Util.setData(ruleType, arr);
        Tip.success(`添加${ruleType}的值成功=${key}`);
        window.RuleCRUDLayoutVue.updateRuleIndex();
        return true;
    },
    /**
     * 批量添加，要求以数组形式
     * @param {Array} ruleList
     * @param {Array} contentList
     * @param ruleType
     */
    addAll(ruleList, contentList, ruleType) {
        let tempLenSize = 0;
        const set = new Set(ruleList);
        tempLenSize = set.size;
        for (const value of contentList) {
            set.add(value);
        }
        if (set.size === tempLenSize) {
            return {
                code: false,
                msg: "内容长度无变化，可能是已经有了的值",
            };
        }
        const fromList = Array.from(set);
        Util.setData(ruleType, fromList);
        console.log(`已更新${ruleType}的数组`, fromList);
        window.RuleCRUDLayoutVue.updateRuleIndex();
        return {code: true};
    },
    /**
     *
     * @param ruleList
     * @param content
     * @param ruleType
     * @return {boolean}
     */
    del(ruleList, content, ruleType) {
        const index = ruleList.indexOf(content);
        if (index === -1) {
            return false;
        }
        ruleList.splice(index, 1);
        Util.setData(ruleType, ruleList);
        Tip.printLn("已经删除该元素=" + content);
        window.RuleCRUDLayoutVue.updateRuleIndex();
        return true;
    },
    delShow(ruleType, ruleName, content = null) {
        if (content === null) {
            content = prompt(`要删除的类型为${ruleName}，请在输入框中填写要添加的具体值规则.`);
            if (content === null) return false;
            content = content.trim();
            if (content === "") {
                Tip.error("请输入正确的内容！");
                return false;
            }
        }
        if (ruleType === "userUIDArr" || ruleType === "userWhiteUIDArr") {
            if (isNaN(content)) {
                Tip.error(`输入的内容不是一个数字！value=${content}`);
                return false;
            }
            content = parseInt(content);
        }
        if (!confirm(`是要删除的${ruleName}规则为：\n${content}\n类型为：${typeof content}`)) {
            return false;
        }
        let ruleDataList = Util.getData(ruleType, []);
        const isDel = this.del(ruleDataList, content, ruleType);
        if (isDel) {
            Tip.success(`删除指定规则内容成功！content=${content}`);
        } else {
            Tip.error(`删除失败，未找到该规则！content=${content}`);
        }
        return isDel;
    },
    delItem(ruleType) {
        if (!Util.isData(ruleType)) {
            return false;
        }
        Util.delData(ruleType)
        return true;
    },
    delItemShow(ruleType, ruleName) {
        if (!confirm(`是要删除指定项目${ruleName}的规则吗？`)) return;
        if (this.delItem(ruleType)) {
            Tip.success(`已删除${ruleName}的规则内容！`);
        } else {
            Tip.error(`删除失败！可能是不存在指定项目${ruleName}的规则内容！`);
        }
        window.RuleCRUDLayoutVue.updateRuleIndex();
    },
    /**
     *根据数组中的每一项rule名，删除对应存储在油猴脚本中的数据
     * @param ruleStrNameArr{Array} 删除成功之后的个数，和对应的rule名
     */
    delALl(ruleStrNameArr) {
        const info = {index: 0, ruleNameArr: []};
        for (let rule of ruleStrNameArr) {
            if (!Util.isData(rule)) {
                continue;
            }
            if (Util.delData(rule)) {
                info.index++;
                info.ruleNameArr.push(rule);
            }
        }
        return info;
    },
    findKey(ruleType, key, defaultValue = undefined) {
        if (!Util.isData(ruleType)) {
            return false;
        }
        return Util.getData(ruleType, defaultValue).includes(key);
    },
    findKeyShow(ruleType, ruleName, key = null) {
        if (key === null) {
            key = prompt(`输入要查询${ruleName}的具体规则值`);
            if (key === null) return;
        }
        if (ruleType === "userUIDArr" || ruleType === "userWhiteUIDArr") {
            if (isNaN(key)) {
                Tip.error(`输入的内容不是一个数字！value=${key}`);
                return false;
            }
            key = parseInt(key);
        }
        let tip;
        if (this.findKey(ruleType, key, [])) {
            tip = `搜索的${ruleName}规则值已存在！find=${key}`;
            Tip.success(tip);
            console.log(tip, key);
            Tip.printLn(tip);
            return;
        }
        tip = `搜索的${ruleName}规则值不存在！find=${key}`;
        Tip.error(tip);
        console.log(tip, key);
        Tip.printLn(tip);
    },
    setKey(ruleType, oldValue, newValue) {
        if (oldValue === newValue) return false;
        if (oldValue === '' || oldValue.includes(" ") || newValue === "" || newValue.includes(" ")) return false;
        const ruleList = Util.getData(ruleType, []);
        if (ruleList.length === 0) return false;
        if (ruleType === "userUIDArr" || ruleType === "userWhiteUIDArr") {
            if (isNaN(oldValue) || isNaN(newValue)) {
                return false;
            }
            oldValue = parseInt(oldValue);
            newValue = parseInt(newValue);
        }
        const indexOf = ruleList.indexOf(oldValue);
        if (indexOf === -1) return false;
        ruleList.splice(indexOf, 1, newValue);
        Util.setData(ruleType, ruleList);
        return true;
    },
    setKeyShow(ruleType, ruleName, oldValue = null, newValue = null) {
        if (oldValue === null || newValue || null) {
            const data = {};
            let oldVal = prompt(`请输入要修改${ruleName}规则的值`);
            if (oldVal === null) return;
            if (!confirm(`是要对${ruleName}规则中的${oldVal}值进行修改更换吗？`)) return;
            const newVal = prompt(`请输入要修改${ruleName}规则的中${oldVal}之后的值`);
            if (newVal === "取消了操作.") return;
            oldValue = oldVal;
            newValue = newVal;
        }
        if (this.setKey(ruleType, oldValue, newValue)) {
            Tip.success(`修改${ruleName}规则成功！,已将 ${oldValue} 修改成 ${newValue}的值！`);
            return;
        }
        Tip.error(`修改${ruleName}规则失败！`);
    }
}

const HttpUtil = {
    httpRequest(method, url, headers, resolve, reject) {
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
    /**
     *封装好的底层post请求，一般情况下不要直接调用，请使用对应的封装好的函数
     */
    _post(url, data, headers, resolve, reject) {
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
    post(url, data, headers) {
        return new Promise((resolve, reject) => {
            this._post(url, data, headers, (res) => {
                resolve(this._toData(res));
            }, (error) => {
                reject(error);
            });
        });
    },
    /**
     * 封装好的底层get请求
     */
    get(url) {
        return new Promise((resolve, reject) => {
            this.httpRequest("get", url, {
                "User-Agent": navigator.userAgent,
            }, (res) => {
                resolve(this._toData(res))
            }, (error) => {
                reject(reject(error))
            });
        });
    },
    //私有的，不应该外部访问到，调整相应结果中的res数据
    _toData(res) {
        const data = {
            body: res.responseText,
            res: res,
            status: res.status,
            responseType: res["RESPONSE_TYPE_JSON"],
            bodyJson: null,
            message: ""
        };
        try {
            if (data.responseType === "json") {
                data.bodyJson = JSON.parse(res.responseText);
            }
        } catch (e) {
            data.error = e;
            data.bodyJson = null;
            data.message = "检测到responseType是json,但转换json失败了";
            console.error(data);
        }
        return data;
    },
    /**
     *携带cookioie发起get请求
     * @param url
     * @param {string}cookie
     */
    getCookie(url, cookie) {
        return new Promise((resolve, reject) => {
            this.httpRequest("get", url, {
                "User-Agent": navigator.userAgent,
                "cookie": cookie
            }, (res => {
                resolve(this._toData(res));
            }), (error) => {
                reject(error);
            });
        });
    },
    /**
     * 发送请求获取视频的基本信息
     * @param {string|number}bvOrAv
     */
    getVideoInfo(bvOrAv) {
        let url = "https://api.bilibili.com/x/player/pagelist?";
        if (bvOrAv + "".startsWith("BV")) {
            url = url + "bvid=" + bvOrAv;//需要带上BV号
        } else {
            url = url + "aid=" + bvOrAv;//不需要带上AV号
        }
        return this.get(url);
    },
    /**
     * 发送请求获取直播间基本信息
     * @param id 直播间房间号
     */
    getLiveInfo(id) {
        return this.get("https://api.live.bilibili.com/room/v1/Room/get_info?room_id=" + id);
    },
    /**
     * 获取用户关注的用户直播列表
     * @param cookie
     * @param page 页数，每页最多29个
     */
    getUsersFollowTheLiveList(cookie, page) {
        return this.getCookie(`https://api.live.bilibili.com/xlive/web-ucenter/user/following?page=${page}&page_size=29`, cookie);
    },
    /**
     * 获取指定分区下的用户直播列表
     * @param parent_id 父级分区
     * @param id 子级分区
     * @param page 页数
     * @param sort 排序-如综合或者最新，最新live_time 为空着综合
     */
    getLiveList(parent_id, id, page, sort) {
        //https://api.live.bilibili.com/xlive/web-interface/v1/second/getList?platform=web&parent_area_id=3&area_id=0&sort_type=sort_type_121&page=3
        return this.get(`https://api.live.bilibili.com/xlive/web-interface/v1/second/getList?platform=web&parent_area_id=${parent_id}&area_id=${id}&sort_type=${sort}&page=${page}`);
    },
    //获取指定用户创建的所有收藏夹信息
    //使用教程<a href="https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/fav/info.md">地址</a>
    getUSerAllFavInfo(uid) {
        return this.get(`https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=${uid}`);
    },
    /**
     * 获取我的所有表情包
     * api:<a href="https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/emoji/list.md">地址</a>
     * @param {string}business 场景 reply：评论区 dynamic：动态
     */
    getEmoJiList(business) {
        return this.get(`https://api.bilibili.com/x/emote/setting/panel?business=${business}`);
    },
    /**
     * 获取稍后再看列表
     * @param {string}SESSDATA
     */
    getLookAtItLater(SESSDATA) {
        return this.getCookie("https://api.bilibili.com/x/v2/history/toview", SESSDATA);
    }
};

//对Qmsg工具进行二次封装
const Tip = {
    success(text, config) {
        Qmsg.success(text, config);
    },
    successBottomRight(text) {
        this.success(text, {position: "bottomright"});
    },
    videoBlock(text) {//屏蔽了视频的提示
        this.success(text, {position: "bottomright"});
    },
    info(text, config) {
        Qmsg.info(text, config);
    },
    infoBottomRight(text) {
        this.info(text, {position: "bottomright"});
    },
    error(text, config) {
        Qmsg.error(text, config);
    },
    errorBottomRight(text) {
        this.error(text, {position: "bottomright"});
    },
    warning(text, config) {
        Qmsg.warning(text, config);
    },
    config(cfg) {//设置全局Tip配置
        Qmsg.config(cfg);
    },
    loading(text, config) {
        return Qmsg.loading(text, config);
    },
    close(loading) {
        try {
            loading.close();
        } catch (e) {
            console.error(e);
            this.error("loading关闭失败！");
        }
    },
    printLn(content) {
        Util.printElement("#outputInfo", `<dd>${content}</dd>`);
    },
    printVideo(color, content, name, uid, title, videoHref) {
        Util.printElement("#outputInfo", `
        <dd><b
            style="color: ${color}; ">${Util.toTimeString()}${content}屏蔽用户【${name}】uid=<a href="https://space.bilibili.com/${uid}" target="_blank">【${uid}】</a>标题【<a href="${videoHref}" target="_blank">${title}</a>】</b>
        </dd>`);
    },
    printCommentOn(color, content, name, uid, primaryContent) {
        Util.printElement("#outputInfo", `
        <dd>
        <b  style="color: ${color}; ">${Util.toTimeString()}${content} 屏蔽用户【${name}】uid=<a href="https://space.bilibili.com/${uid}" target="_blank">【${uid}】</a>
   原言论=【${primaryContent}】</b>
</dd>`);
    }
};


//拼接直播地址
Vue.filter("joinRoomAddress", (roomId) => {
    return `https://live.bilibili.com/${roomId}`;
})
//定义自定义组件
Vue.component("liveRoomItem", {//用于显示直播列表中默认的项目，无封面信息
    props: ["upAddress", "face", "roomId", "title", "upName"],
    template: `
      <div style="display: flex;flex-direction: row;height: 64px;align-items: center;border: 1px solid aqua">
      <div style="width: 48px;height: 48px;border-radius: 50%;overflow: hidden;margin-right:15px;">
        <a :href="upAddress" target="_blank">
          <img v-bind:src="face" style="width: 100%; height: 100%;object-fit: inherit">
        </a>
      </div>
      <div style="display: flex;flex-direction: column;justify-content: space-around;">
        <a :href="roomId|joinRoomAddress" target="_blank">
          <div :title="title" style="font-size: 17px;font-weight: bold">{{ title }}</div>
        </a>
        <a>
          <div :title="upName">{{ upName }}</div>
        </a>
      </div>
      </div>`
})
Vue.component("liveRoomFrontCoverItem", {
    props: ["upAddress", "face", "roomId", "title", "upName", "videoFrameImg", "frontCoverImg"],
    template: `
      <div style="border: 1px solid aqua;display: flex;align-items: center;flex-direction: column;">
      <div style="height: 144px;width: 256px;"><img :src="videoCover" alt="" style="height: 100%"
                                                    @mouseover="setVideoFrameImg" @mouseleave="setFrontCoverImg">
      </div>
      <div style="display: flex;flex-direction: row;height: 64px;align-items: center;">
        <div style="width: 48px;height: 48px;border-radius: 50%;overflow: hidden;margin-right:15px;">
          <a :href="upAddress" target="_blank">
            <img v-bind:src="face" style="width: 100%; height: 100%;object-fit: inherit">
          </a>
        </div>
        <div style="display: flex;flex-direction: column;justify-content: space-around;">
          <a :href="roomId|joinRoomAddress" target="_blank">
            <div :title="title" style="font-size: 17px;font-weight: bold">{{ title }}</div>
          </a>
          <a>
            <div :title="upName">{{ upName }}</div>
          </a>
        </div>
      </div>
      </div>`,
    data() {
        return {
            videoCover: this.frontCoverImg
        };
    },
    methods: {
        setVideoFrameImg() {
            this.videoCover = this.videoFrameImg;
        },
        setFrontCoverImg() {
            this.videoCover = this.frontCoverImg;
        }
    }
});
//规则中心的项目item
Vue.component("ruleCenterItem", {
        props: ["userName", "update_time", "ruleList", "first_push_time"],
        template: `
          <li>
          <div>
            <div>
              <span>作者：</span><span class="authorNameSpan">{{ userName }}</span>
            </div>
            <div>
              <span>更新时间：</span><span>{{ formatTIme(update_time) }}</span>
            </div>
            <div>
              <span>创建时间：</span><span>{{ formatTIme(first_push_time) }}</span>
            </div>
          </div>
          <div style="column-count: 4">
            <div v-for="(item,key) in ruleList">
              {{ key }}<span style="color: rgb(217, 217, 37)">{{ item.length }}</span>个
              <button @click="lookKeyRuleBut(item,key)">查询</button>
            </div>
          </div>
          <div>
            <button @click="inputLocalRuleBut">导入覆盖本地规则</button>
            <button @click="inputCloudRuleBut">导入覆盖云端规则</button>
            <button @click="lookUserRuleBut">查看该用户的规则</button>
          </div>
          </li>`,
        methods: {
            lookKeyRuleBut(keyData, keyName) {
                if (!confirm(`是要查询用户 ${this.userName} 的${keyName} 规则吗？`)) return;
                Util.openWindowWriteContent(JSON.stringify(keyData, null, 3));
            },
            inputLocalRuleBut() {
                if (!confirm(`您确定要导入该用户 ${this.userName} 的规则并覆盖您当前本地已有的规则？`)) return;
                window.RuleCRUDLayoutVue.inputRuleLocalData(this.ruleList);
            },
            inputCloudRuleBut() {//导入覆盖云端规则
                alert("暂不支持导入覆盖云端规则！");
            },
            lookUserRuleBut() {
                if (!confirm(`您是要查看用户 ${this.userName} 的规则内容吗，需要注意的是，在某些浏览器中，由于安全原因，脚本不能使用 window.open() 创建新窗口。对于这些浏览器，如果您出现打不开的情况，用户必须将浏览器设置为允许弹出窗口才能打开新窗口`)) return;
                Util.openWindowWriteContent(JSON.stringify(this.ruleList, null, 2));
            },
            formatTIme(time) {
                return Util.timestampToTime(time);
            }
        }
    }
);
//用于稍后再看item项组件
Vue.component("list-item", {
    template: `
      <li style="border: 1px solid green">
      <div style="display: flex">
        <div style="height: 144px; width: 256px;">
          <img :src="front_cover|setFrontCover" alt="显示失败" style="height: 100%;">
        </div>
        <div>
          <div>Title：<a v-bind:href=splicingVideoAddress(bv) target="_blank">{{ title }}</a></div>
          <div>UP：<a v-bind:href=splicingUserAddress(uid) target="_blank">{{ upName }}</a></div>
          <button @click="delItem">删除该项</button>
          <button @click="setItem('upName','用户名',upName)">修改用户名</button>
          <button @click="setItem('uid','uid',uid)">修改uid</button>
          <button @click="setItem('title','标题',title)">修改标题</button>
          <button @click="setItem('bv','BV号',bv)">修改bv</button>
        </div>
      </div>
      </li>`,
    props: ["objItem", "title", "upName", "bv", "uid", "front_cover"],
    methods: {
        delItem() {
            this.$emit("del-item-click", this.objItem);
        },
        setItem(key, name, value) {
            this.$emit("set-item-click", this.objItem, key, name, value);
        },
        splicingVideoAddress(s) {//拼接视频地址
            return "https://www.bilibili.com/video/" + s;
        },
        splicingUserAddress(str) {//拼接用户地址
            return "https://space.bilibili.com/" + str;
        },
    },
    filters: {
        setFrontCover(img) {
            const defImg = "http://i2.hdslb.com/bfs/archive/43276436b25529ae0e2c6e3dc896ec8a66ef4d60.jpg";
            if (img === null || img === undefined) return defImg;
            return img;
        }
    }
});
//TODO 后续完善下面的def-list-layout，用于稍后再看的默认布局
Vue.component("def-list-layout", {
    template: `
      <div>
      <h3>{{ listLayoutName }}项目共{{ showList.length }}个</h3>
      <button @click="renovateList">刷新列表</button>
      <button @click="clearShowListBut">清空列表数据(不删除实际数据)</button>
      <button @click="clearListBut">清空列表数据(影响实际数据)</button>
      <button @click="listInversion">列表反转</button>
      <slot name="top-right"></slot>
      <slot name="center"></slot>
      <div>
        搜索<input type="text" v-model.trim="tempSearchKey">
        搜索条件<select v-model="tempFindListType">
        <option v-for="item in typeList" :key="item">{{ item }}</option>
      </select>
      </div>
      <ol>
        <slot name="button-list" :showList="showList"></slot>
      </ol>
      </div>
    `,
    props: {
        list: {
            default: []
        },
        listLayoutName: {
            default: "列表",
        },
        typeList: {},
        findListType: {}
    },
    data() {
        return {
            tempSearchKey: "",
            tempFindListType: this.findListType,//监听搜索条件下拉框model
            showList: this.list
        }
    },
    methods: {
        renovateList() {//刷新
            this.$emit("renovate-list-event");
        },
        clearShowListBut() {
            this.showList = [];
        },
        clearListBut() {//清空列表
            this.$emit("clear-but");
        },
        listInversion() {//列表反转
            this.showList.reverse();
        },
        okBut() {
            this.$emit("okBut");
        }
    },
    watch: {
        tempSearchKey(newVal, oldVal) {
            this.$emit("search-key-event", newVal, oldVal);
        }
    },
    created() {
        this.$emit("set-sub-this", this);
    }
});

Vue.component("footer_layout", {
    template: `
      <div>
      <div>关于我们</div>
      作者相关群聊：
      <div v-for="item in group" :key="item.name">
        {{ item.name }}<a :href="item.url" target="_blank"><img :alt="item.name"
                                                                :title="item.name"
                                                                src="//pub.idqqimg.com/wpa/images/group.png"></a>
      </div>
      <div>
        作者其他作品：
        <div v-for="v in works" :key="v.label">
          <button><a :href="v.url" target="_blank">{{ v.label }}</a></button>
          开源地址：<a :href="v.openSourceUrl" target="_blank">{{ v.openSourceLabel }}</a>
        </div>
        <div> 作者b站：
          <button><a href="https://space.bilibili.com/473239155">传送门地址</a></button>
        </div>
      </div>
      </div>`,
    data() {
        return {
            group: [
                {
                    name: "桐子酱的油猴脚本官方群",
                    url: "//qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=zD3QMvs1ssNugrHekhe16Y1p6ofNtFaA&authKey=FpgEzNW82mhUYUa74jcb8Y2dVkSd4Qh%2FgxflxdUBJ9VohHQlM26PxZ0Fl6E6qfnq&noverify=0&group_code=876295632"
                },
            ],
            works: [
                {
                    label: "b站屏蔽增强器油猴脚本",
                    url: "https://greasyfork.org/zh-CN/scripts/461382",
                    openSourceUrl: "https://gitee.com/hangexi/BiBiBSPUserVideoMonkeyScript",
                    openSourceLabel: "gitee"
                },
                {
                    label: "b站频道生成器",
                    url: "https://greasyfork.org/zh-CN/scripts/481719",
                    openSourceUrl: "https://gitee.com/hangexi/bilibili-channel-viewer",
                    openSourceLabel: "gitee"
                },
                {
                    label: "github链接新标签打开",
                    url: "https://greasyfork.org/zh-CN/scripts/489538",
                    openSourceUrl: "https://gitee.com/hangexi/github_new_tab_open",
                    openSourceLabel: "gitee"
                },
                {
                    label: "b站动态设置",
                    url: "https://greasyfork.org/zh-CN/scripts/489577",
                    openSourceUrl: "https://gitee.com/hangexi/bilibili_dynamic_set_js",
                    openSourceLabel: "gitee"
                }
            ]
        }
    }
})

const History = {
    //是否正在执行获取操作
    isGetLoadIngData: false,
    delLayout: {
        footer() {
            $(".footer.bili-footer").remove();
        }
    },
    getDevice(e) {
        const classList = e.classList;
        if (classList.contains("bili-PC")) {
            return "电脑";
        }
        if (classList.contains("bili-Mobile")) {
            return "手机";
        }
        return "其他";
    },
    getDataHistory() {
        const historyEList = document.querySelectorAll("#history_list>li");
        const dataList = [];
        historyEList.forEach(value => {
            if (value.querySelector(".endpic") !== null) return;
            const data = {};
            const textInfo = value.querySelector(".r-txt");
            data["itemImg"] = value.querySelector(".cover-contain>.preview>.lazy-img>img").getAttribute("src");//项目中的封面，如视频封面番剧封面等
            data["historyRedRound"] = value.querySelector(".lastplay-time>.lastplay-t").textContent;//具体时间开始观看，如12:45
            data["title"] = textInfo.querySelector(".title").textContent;
            data["itemAddress"] = textInfo.querySelector(".title").getAttribute("href");//项目中的地址，如视频地址，番剧地址
            data["history_mark"] = textInfo.querySelector(".history-mark") !== null;//是否已收藏
            data["device"] = this.getDevice(textInfo.querySelector(".device.bilifont"));
            data["proTextProgress"] = textInfo.querySelector(".w-info>.time-wrap>.pro-txt.progress").textContent;//观看进度条相关
            const userInfo = textInfo.querySelector(".w-info>span");
            if (userInfo !== null) {//主导方为用户，而非官方（官方的如番剧电影等）
                data["tag"] = userInfo.querySelector(".name").textContent;
                data["name"] = userInfo.querySelector(".username").textContent;
                const userAddress = userInfo.querySelector("a").getAttribute("href");
                data["userAddress"] = userAddress;
                data["uid"] = Util.getSubWebUrlUid(userAddress);
                data["img"] = userInfo.querySelector(".lazy-img.userpic>img").getAttribute("src");
            } else {
                data["otherLabel"] = value.querySelector(".cover-contain>p[class='label']").textContent;//其他相关标签，如番剧，直播中、电影
            }
            dataList.push(data);
        });
        return dataList;
    },
    getAllDataHistory() {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (document.querySelector(".endpic") === null) {
                   Util.bufferBottom();
                    return;
                }
                clearInterval(interval);
                resolve();
            }, 1500);
        })
    }
}

const layout = {
    css: {
        home() {
            Util.addStyle(`
#home_layout {
    background: ${Home.getBackgroundStr()};
    margin: 0px;
    height: auto;
    width: 100%;
    max-height: 100%;
    position: fixed;
    z-index: 2024;
    overflow-y: auto;
    border: 3px solid green;
}
/* 隐藏标签布局，除了“active”的标签布局 */
#home_layout .tab {
    display: none;
}
#home_layout .tab.active {
    display: block;
}
ul {
    /* 隐藏ul标签的默认符号 */
    list-style: none;
}
/* 悬浮屏蔽布局 */
#suspensionDiv {
    position: fixed;
    display: none;
    z-index: 2023;
    background: rgb(149, 156, 135);
    height: atuo;
    width: 10%;
    top: 49%;
    left: 90%;
    border: 3px solid green;
}
#suspensionDiv p {
    margin-top: 10px;
}
#suspensionDiv .center button,#home_layout button,#rightLayout button,#id13315 button{
    margin-top: 10px;
    padding: 5px 10px;
    border: none;
    background-color: #4CAF50;
    color: #fff;
    cursor: pointer;
}
#suspensionDiv .center button:hover,#home_layout button:hover,#rightLayout button:hover,#id13315 button:hover {
    background-color: #3E8E41;
}
#myBut {
    position: fixed;
    z-index: 2025;
    width: 50px;
    height: 50px;
    left: 96%;
    bottom: 80%;
    background: rgb(67, 67, 124);
    color: white;
    border: none;
    border-radius: 50%;
}
#ruleCRUDLayout>div>div{
border: 0.5px solid green;
}
            `);
        }
    },
    panel: {
        /**
         * 悬浮球
         * @param text 显示内容
         * @param top
         * @param left
         * @param isVue
         * @param position
         * @returns {jQuery}
         */
        getHoverBallBut(text, top, left, isVue = false, position = "fixed") {
            let jqE;
            if (isVue) {
                jqE = $(`<button class="jb-button" style="margin-top: 10px; padding: 5px 10px; border: none;cursor: pointer;" @click="okBut" v-if="show">${text}</button>`);
            } else {
                jqE = $(`<button style="margin-top: 10px; padding: 5px 10px; border: none;cursor: pointer;">${text}</button>`);
            }
            jqE.css("position", position);
            jqE.css("left", left);
            jqE.css("z-index", 2000);
            jqE.css("top", top);
            jqE.css("background-color", "#4CAF50");
            jqE.css("color", "#fff");
            return jqE;
        },
    },
    getRuleCRUDLayout() {
        return `
<div style="display: flex;flex-wrap: wrap;">
<div>
<div>
<h2>规则增删改查</h2>
<select v-model="model">
<option v-for="(item,key) in modelList" v-bind:value="key">{{item}}</option>
</select>      
<select v-model="defaultSelect">
<option v-for="(item,key) in ruleKeyList" v-bind:value="key">{{item.name}}</option>
</select> 
<div>
<textarea style="width: 40%; height: 100px;"v-show="isBatchShow" v-model.trim="ruleEditBox"></textarea>
</div>  
        <div>
          <button @click="add" v-show="isSingleShow">增加指定规则</button>
          <button @click="addAll" v-show="isBatchShow">批量增加规则</button>
          <button @click="delItem" v-show="isBatchShow">删除下拉框选中的规则</button>
          <button @click="delKey" v-show="isSingleShow">删除指定规则</button>
          <button @click="delAll" v-show="isBatchShow">删除所有规则</button>
          <button @click="setKey" v-show="isSingleShow">修改</button>
          <button @click="findKey" v-show="isSingleShow">查询</button>
          <button @click="lookLocalRUleContent">查看本地下拉框中所有的规则内容</button>
          <button @click="lookLocalAppointRUleContent">查看下拉框中指定的规则内容</button>
        </div>
        <hr>
        <h3>测试规则</h3>
        <button><a href="https://www.mikuchase.ltd/web/#/rule_tool" target="_blank">规则验证工具</a></button>
      </div>
      <hr>
    <details>
      <summary>视频基本信息处理(时长弹幕播放量)</summary> 
      <h4 style="color: red">注意下面为0则不生效</h4>
      <input min="0" style="width: 29%;height: 20px;" type="number" v-model="videoRuleValueInput"/>
      <select v-model="videoSelectValue">
       <option v-for="(item,key) in videoRuleList" v-bind:value="key">{{item}}</option>
      </select>
      <button @click="okVideoSelectBut">确定</button>
     </details>
     <h2>使用说明</h2>
     <ol>
     <li>
     <pre style="white-space: pre-wrap">脚本中会对要匹配的内容进行去除空格和转成小写，比如有个内容是【不 要  笑   挑  战  ChallEnGE】，会被识别称为【不要笑挑战challenge】</pre>
     </li>
     <li>在上述一点的情况下，模糊匹配和正则匹配的方式时不用考虑要匹配的内容中大写问题</li>
     <li>如果用户要添加自己的正则匹配相关的规则时，建议先去该网址进行测试再添加，避免浪费时间【<a href="https://c.runoob.com/front-end/854/" target="_blank" title="正则表达式在线测试 | 菜鸟工具">https://c.runoob.com/front-end/854/正则表达式在线测试|菜鸟工具</a>】</li>
     <li>如需要备份自己的规则可以考虑在当前选项卡下的【规则导入导出】中选择你要导出的方式，【全部规则到文件】、【全部规则到剪贴板】、【全部UID规则到文件】和【全部规则到云端账号】，如您需要备份在云端服务器上请选择【全部规则到云端账号】</li>
     </ol>
     </div>
     <div>
     <h2>规则信息</h2>
     <p v-for="(item,key) in ruleKeyList">{{item.name}}个数<span style="color: #ff0000">{{item.size}}</span>个</p>
    </div>
    <div>
    <h2>规则导入导出</h2>
      <div>
  <select v-model="outRuleSelect">
  <option v-for="(item,key) in outRUleModelList":value="key">{{item}}</option>
</select>
<button @click="outRule">导出</button>
</div>
<div>
  <select v-model="inputRuleSelect">
  <option  v-for="item in inoutRUleModelList" :value="item">{{item}}</option>
</select>
<button @click="inputRule">导入</button>
</div><textarea v-model.trim="inputEditContent" placeholder="请填导入的规则内容" style="height: 300px; width: 100%; font-size: 14px;" v-show="isInputEditShow"></textarea></div>
</div>
`;
    },
    getVideo_params_layout() {
        return `<div>
<div>
<h1>播放器</h1>
    <div>
        <input type="checkbox" v-model="autoPlayCheckbox">禁止打开b站视频时的自动播放
    </div>
    <div>
        <input type="checkbox" v-model="videoEndRecommendCheckbox">播放完视频后移除视频推荐
    </div>
    <div>
        <button @click="VideoPIPicture">视频画中画</button>
    </div>
<hr>
</div>
    <h3>播放画面翻转</h3>
   <button @click="okFlipHorizontal">水平翻转</button>
   <button @click="okFlipVertical">垂直翻转</button>
   <div>
    自定义角度
    <input v-model="axleRange" type="range" value="0" min="0" max="360" step="1"><span>{{axleRange}}%</span>
   </div>
   <hr>
   <h3>播放页界面元素显隐</h3>
   <div>
       <div><input type="checkbox" v-model="setAutoSubItemButShow">默认展开右侧悬浮功能栏列表</div>
       <div><input type="checkbox" v-model="hideVideoTopTitleInfoCheackBox">默认隐藏视频播放页顶部标题信息布局</div>
       <div><input type="checkbox" v-model="hideVideoButtonCheackBox">默认隐藏视频播放页的评论区</div>
       <div><input type="checkbox" v-model="hideVideoRightLayoutCheackBox">默认隐藏视频播放页播放器的右侧布局</div>
    </div>
  </div>`;
    },
    getOutputInfoLayout() {
        return `<div>
      <button id="butClearMessage">清空信息</button>
      <input type="checkbox" checked="checked">
      <span>二次确认</span>
    </div>
    <div id="outputInfo">
    </div>`;
    },
    getOtherLayout() {
        return `<div>
    </div>
    <hr>
    <details open>
      <summary>b站SESSDATA</summary>
      <p>该数据一些b站api需要用到，一般情况下不用设置，以下的设置和读取均是需要用户自行添加b站对应的SESSDATA值，读取时候也是读取用户自己添加进去的SESSDATA值，脚本本身不获取b站登录的SESSDATA</p>
      <P>提示：为空字符串则取消移除SESSDATA，不可带有空格</P>
      <div>
        <button title="为空字符串则取消" @click="setSgSessdataBut">设置SESSDATA</button>
        <button @click="getSgSessdataBut">读取SESSDATA</button>
      </div>
    </details>
    <div>
    <h1>其他</h1>
    <button @click="bvToAvBut">bv号转av号</button>
    <button @click="avTObvBut">av号转bv号</button>
    </div>
    <hr>
   <button @click="openGBTWebBut">前往GBT乐赏游戏空间地址</button>
<details open>
<summary>b站页面传送门</summary>
<button v-for="(item,keyName) in BWebOpenList" :value="item" @click="openBWeb(item,keyName)">{{keyName}}</button>
</details>
    <div>
      <h1> 反馈问题</h1>
      <p>作者b站：<span><a href="https://space.bilibili.com/473239155" target="_blank">点我进行传送！</a></span></p>
      <p>本脚本gf反馈页<span>
          <a href="https://greasyfork.org/zh-CN/scripts/461382-b%E7%AB%99%E5%B1%8F%E8%94%BD%E5%A2%9E%E5%BC%BA%E5%99%A8/feedback" target="_blank">点我进行传送！</a>
        </span>
      </p>
    </div>`;
    },
    getSuspensionDiv() {
        return `<!-- 悬浮屏蔽布局 -->
      <div id="suspensionDiv">
       <div style="display: flex;justify-content: center;">
        <button value="上" @click="moveTop" >↑</button>
    </div>
        <div style="display: flex;justify-content: space-between;">
        <button value="左" @click="moveLrft">←</button>
       <div class="center">
       <div>移动步长：{{moveLayoutValue}}<input type="range" value="5" min="1" max="1000" v-model="moveLayoutValue"></div>
      坐标:x{{xy.x}}|y:{{xy.y}}
       <div>
       </div>
        <p>用户名：{{upName}}</p>
        <p>UID：<a v-bind:href="'https://space.bilibili.com/'+uid" target="_blank">{{uid}}</a></p>
        <details v-show="videoData.show" :open="videoData.show" @toggle="handleToggle">
        <summary>视频信息</summary>
        <p>标题:{{videoData.title}}</span></p>
        <p>视频BV号:{{videoData.bv}}</span></p>
        <p>视频AV号:{{videoData.av}}</p>
        <img :src="videoData.frontCover" alt="图片显示异常" style="width: 100%;">
        <button @click="addLookAtItLater">添加进稍后再看</button>
</details>
        <button @click="addShieldName">add屏蔽用户名</button>
        <button @click="addShieldUid">add屏蔽用户名UID</button>
        <button @click="findUserInfo">查询基本信息</button>
        <button id="getLiveHighEnergyListBut" style="display: none">获取高能用户列表</button>
        <button id="getLiveDisplayableBarrageListBut" style="display: none">获取当前可显示的弹幕列表</button>
       </div>
        <button value="右" @click="moveRight">→</button>
    </div>
    <div style="display: flex;justify-content: center;">
        <button value="下" @click="moveButton">↓</button>
    </div>
    
    
      </div>
     <!-- 悬浮屏蔽按钮 -->`;
    },
    addMainLayout() {
        const bodyJQE = $("body");
        bodyJQE.prepend(`<div id="home_layout" v-show="show"><main_layout></main_layout></div>`);
        MainVue.addVue();
        $("#panelSetsTheLayout").append(`<div style="display: flex;flex-wrap: wrap;justify-content: flex-start;">
        <div>
          <span>背景透明度</span>
          <input type="range" value="1" min="0.1" max="1" step="0.1" v-model="backgroundPellucidRange">
          <span>{{backgroundPellucidRange}}</span>
        </div>
        <div>
          <span>高度</span>
          <input type="range" value="100" min="20" max="100" step="0.1" v-model="heightRange">
          <span>{{heightRangeText}}</span>
        </div>
        <div>
          <span>宽度</span>
          <input type="range" value="100" min="40" max="100" step="0.1" v-model="widthRange">
          <span>{{widthRangeText}}</span>
        </div>
      </div>
      <hr>
<div style="display: flex; flex-wrap: wrap;">
    <div>
        <div>
        <label><input type="checkbox" v-model="isMyButShow">右上角悬浮球显示隐藏</label>
        </div>
        <div title="可通过快捷键显示控制面板，右击页面和左键油猴插件选择本脚本的【显示隐藏控制面板】">
            <label>
            <input type="checkbox" v-model="isDShowHidePanel">禁用显示隐藏主面板快捷键
            </label>
            <button @click="setDHMPKCBut">修改显示隐藏切换快捷键</button>
            <label>当前快捷键<span style="color: brown">{{showKCMap.dHMainPanel_KC_text}}</span></label>
        </div>
        <div>
            <label title="支持设置可隐藏该快捷悬浮屏蔽面板快捷键，支持设置切换此开关的快捷键">
            <input type="checkbox" v-model="isDShieldPanel">禁用快捷悬浮屏蔽面板自动显示
            <button @click="setDTQFSPToTDKCBut">修改该功能状态快捷键</button>
            </label>
            <label>当前快捷键<span style="color: brown">{{showKCMap.dTQFSPToTriggerDisplay_KC_text}}</span></label>
            <button @click="setHQSBlockButton_KCBut">修改主动隐藏快捷键</button>
            <label>当前快捷键<span style="color: brown">{{showKCMap.hideQuickSuspensionBlockButton_KC_text}}</span></label>
        </div>
        <div>
            <label>
            <input  type="checkbox" v-model="isDShieldPanelFollowMouse">快捷悬浮屏蔽面板跟随鼠标快捷键
            </label>
            <button @click="setQFlBBFTMouseKCBut">修改快捷键</button>
            <label>当前快捷键<span style="color: brown">{{showKCMap.qFlBBFollowsTheMouse_KC_text}}</span></label>
        </div>
        <div>
            <label>
            <input type="checkbox" v-model="isFixedPanelValueCheckbox">固定悬浮屏蔽面板数据值
            </label>
            <button @click="setsetFixedQuickSPanelValue_KCBut">修改快捷键</button>
            <label>当前快捷键<span style="color: brown">{{showKCMap.fixedQuickSuspensionPanelValue_KC_text}}</span></label>
        </div>
    </div>
    <div>
    <p>快捷键不可重复</p>
    <p>如果修改了快捷键，左侧当前快捷键文本需要刷新页面才会更新</p>
    <p>修改了快捷键马上生效</p>
    <button><a href="https://www.bejson.com/othertools/keycodes/" target="_blank">键盘按键参考地址-在线获取键盘按键值(keycode,ascii码)-BeJSON.com</a></button>
    </div>
</div>
    
`);

        $("#liveLayout").append(`点击用户名打开直播间,点击用户头像打开用户主页
      <div></div>
      <div>关注列表在中正在直播的用户-({{listOfFollowers.length}})个
        <button @click="loadFollowLst" :disabled="isLoadFollowLstDisabled">{{loadFollowButText}}</button>
        <button @click="hRecoveryListOfFollowersBut" v-if="hRecoveryListOfFollowersIf">恢复列表</button>
      </div>
      <div>
        搜索：<input type="text" v-model.trim="findFollowListRoomKey">
        搜索条件<select v-model="siftTypeSelect"><option v-for="item in siftTypeList" :value="item">{{item}}</option></select>
      </div>
      <hr>
      <div style="display: grid;grid-template-columns: auto auto auto auto auto; margin:0 12px">
        <live-room-item v-for="item in listOfFollowers"
                        :title="item.title"
                        :up-address="item.upAddress"
                        :face="item.face"
                        :up-name="item.upName"
                        :room-id="item.roomId"
        ></live-room-item>
      </div>
      <hr>
      <div>其他分区直播列表{{otherLiveRoomList.length}}个</div>
      <select v-model="mainPartitionSelect"><option  v-for="(item,key) in partitionObjList" :value="key">{{key}}</option></select>
      <select v-model="sPartitionSelectID"><option v-for="item in sPartitionObjList" :value="item.id">{{item.name}}</option></select>
      <button @click="loadOtherPartitionLiveListBut">加载</button>
      <button @click="hRecoveryOtherLiveRoomListBut" v-if="hRecoveryOtherLiveListIf">恢复列表</button>
      <button @click="findThisSubPartitionBut">从{{mainPartitionSelect}}查询子分区</button>
      <button @click="findSubPartitionBut">查询子分区</button>
      <button @click="openPartitionWebAddressBut">打开页面</button>
      <div>
        <div>
          搜索：<input type="text" v-model.trim="findOtherListRoomKey">
          搜索条件<select v-model="siftOtherLiveTypeSelect"><option v-for="item in siftOtherLiveTypeList" :value="item">{{item}}</option></select>
        </div>
        <div style="display: grid;grid-template-columns: auto auto auto auto auto;margin: 0px 12px;justify-items: stretch;">
          <live-room-front-cover-item v-for="item in otherLiveRoomList"
                                      :title="item.title"
                                      :up-address="item.upAddress"
                                      :face="item.face"
                                      :up-name="item.upName"
                                      :room-id="item.roomId"
                                      :video-frame-img="item.videoFrame"
                                      :front-cover-img="item.frontCover"
          ></live-room-front-cover-item>
        </div>
        <div style="display: flex;justify-content:center" v-if="otherLoadMoreIf"><button @click="otherLoadMoreBut">加载更多</button></div>
      </div>`);
        $("#lookAtItLaterListLayout").append(`<def-list-layout
          list-layout-name="稍后再看列表"
          :type-list="typeList"
          find-list-type="title"
          :list="lookAtItLaterList"
          @set-sub-this="setSubThis"
          @search-key-event="searchKey"
          @clear-but="clearLookAtItLaterArr"
          @renovate-list-event="renovateLayoutItemList">
        <template #top-right>
          <button><a href="https://www.bilibili.com/watchlater/?spm_id_from=333.1007.0.0#/list" target="_blank">前往b站网页端的稍后再看页面</a></button>
          <button @click="getBWebLookAtItLaterListBut">获取b站账号的稍后再看列表(需SESSDATA)</button>
          <button @click="addVideoItemDataBut">添加视频数据</button>
        </template>
        <template #center>
          <div>
            <input type="checkbox" v-model="isAddToInput">{{isAddToInputTxt}}
            <select v-model="inputOutSelect"><option v-for="item in inputOutSelectArr" :value="item">{{item}}</option></select>
            <button @click="okOutOrInputClick">执行</button>
          </div>
          <textarea v-model.trim="inputEditContent" v-show="isInputSelect" placeholder="请输入导出时的格式json（本轮操作为追加数据操作）"style="width: 80%;height: 400px"></textarea>
        </template>
        <template #button-list="data">
          <ol>
            <list-item v-for="(item,key) in data.showList"
                       :title="item.title"
                       :up-name="item.upName"
                       :uid="item.uid"
                       :bv="item.bv"
                       :obj-item="item"
                       :front_cover="item.frontCover"
                       v-on:del-item-click="delListItem"
                       v-on:set-item-click="setListItem"></list-item>
          </ol>
        </template>
      </def-list-layout>`);
        $("#ruleCenterLayout").append(`<button disabled><a href="https://www.bilibili.com/read/cv25025973" target="_blank">提示error解决方案</a></button>
      <button @click="reloadListBut" v-if="isReloadListButShow">重新加载</button>
      <ul style="margin: 0;padding-left: 0">
        <rule-center-item v-for="item in list"
                          :user-name="item.name"
                          :rule-list="item.ruleList"
                          :update_time="item.update_time"
                          :first_push_time="item.first_push_time"
        ></rule-center-item>
      </ul>`);
        $("#accountCenterLayout").append(`<component v-bind:is="isTab" @tab-click="getTabName"></component>`);
        $("#ruleCRUDLayout").append(layout.getRuleCRUDLayout());
        $("#video_params_layout").append(layout.getVideo_params_layout());
        $("#outputInfoLayout").append(layout.getOutputInfoLayout());
        $("#otherLayout").append(layout.getOtherLayout());
        bodyJQE.append(layout.getSuspensionDiv());
    }
}

//直播
const Live = {
    shield(list) {
        for (let v of list) {
            const userName = v.getAttribute("data-uname");
            const uid = v.getAttribute("data-uid");
            const content = v.getAttribute("data-danmaku");
            let fansMeda = "这是个个性粉丝牌子";
            try {
                fansMeda = v.querySelector(".fans-medal-content").text;
            } catch (e) {
            }
            if (startPrintShieldNameOrUIDOrContent(v, new ContentCLass()
                .setUpName(userName)
                .setUid(uid)
                .setContent(content))) {
                Tip.info("屏蔽了言论！！");
                continue;
            }
            if (Remove.fanCard(v, fansMeda)) {
                Tip.printLn("已通过粉丝牌【" + fansMeda + "】屏蔽用户【" + userName + "】 言论=" + content);
                continue;
            }
            const jqE = $(v);
            if (Util.isEventJq(jqE, "mouseover")) {
                continue;
            }
            jqE.mouseenter((e) => {
                const domElement = e.delegateTarget;
                Util.showSDPanel(e, {
                    upName: domElement.getAttribute("data-uname"),
                    uid: domElement.getAttribute("data-uid")
                });
            });
        }
    },
    getFollowDataList(sessdata, page = 1) {
        const followDataList = [];
        return new Promise((resolve, reject) => {
            const promise = HttpUtil.getUsersFollowTheLiveList(sessdata, page);
            promise.then(res => {
                const body = JSON.parse(res.body);
                const code = body["code"];
                const message = body["message"];
                if (code !== 0) {
                    const info = "获取当前用户正在直播的用户错误！" + message;
                    Tip.error(info);
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
                    Tip.info(info);
                    console.log(info);
                    return;
                }
                let live_status = -1;
                for (let v of list) {
                    /**
                     *直播状态
                     * 0：未开播
                     * 1：直播中
                     * 2：轮播中
                     */
                    live_status = v["live_status"];
                    if (live_status === 0) {//结束，说明后面的都是未开播的item
                        break;
                    }
                    if (live_status !== 1) {//不等于1的，也就是除直播之外的都跳过本轮循环
                        continue;
                    }
                    followDataList.push(new LiveRoom()
                        .setUpName(v["uname"])
                        .setUid(v["uid"])
                        .setTitle(v["title"])
                        .setRoomId(v["roomid"])
                        .setFace(v["face"]));
                }
                resolve({live_status: live_status, dataList: followDataList});
            }).catch(err => {
                reject(err);
                Tip.error("出现错误");
                Tip.error(err);
            });
        });
    },
    async loadAddAllFollowDataList(dataList, sessdata) {
        let page = 1;
        do {
            const data = await this.getFollowDataList(sessdata, page);
            page++;
            const liveStatus = data.live_status;
            if (liveStatus === 1) {
                Util.mergeArrays(dataList, data.dataList);
                await Util.Thread.sleep(500);
                Tip.success(`正在获取关注列表中正在直播列表`);
                continue;
            }
            if (liveStatus === 0 || liveStatus === -1) {
                Util.mergeArrays(dataList, data.dataList);
                break;
            }
        } while (true);
        Tip.success(`已获取完成！`);
        return Promise.resolve();
    },
    getOthersAreWorkingLiveDataList(parent_id, id, page = 1) {//获取其他正在直播中的直播列表
        const tempList = [];
        const data = {
            //已经没有内容时设置为true
            partitionBool: false,
            dataList: tempList
        };
        return new Promise((resolve, reject) => {
            const promise = HttpUtil.getLiveList(parent_id, id, page, "");
            promise.then(res => {
                const body = res.bodyJson;
                const code = body["code"];
                const message = body["message"];
                data.message = message;
                data.code = code;
                if (code !== 0) {
                    data["info"] = "获取直播分区信息错误！" + message;
                    reject(data);
                    return;
                }
                const list = body["data"]["list"];
                for (let v of list) {
                    const roomid = v["roomid"];
                    const title = v["title"];
                    const uname = v["uname"];
                    const uid = v["uid"];
                    if (Matching.arrKey(LocalData.getArrUID(), uid)) {
                        const tempInfo = `已通过UID，过滤用户【${uname}】 uid【${uid}】`;
                        Tip.printLn(tempInfo);
                        Tip.success(tempInfo);
                        continue;
                    }
                    const face = v["face"];
                    const cover = v["cover"];//封面
                    const system_cover = v["system_cover"];//关键帧
                    const parent_name = v["parent_name"];//父级分区
                    const area_name = v["area_name"];//子级分区
                    tempList.push(new LiveRoom()
                        .setUpName(uname)
                        .setUid(uid)
                        .setFace(face)
                        .setTitle(title)
                        .setRoomId(roomid)
                        .setFrontCover(cover)
                        .setVideoFrame(system_cover)
                    )
                }
                if (list.length < 20) {
                    data.partitionBool = true;
                }
                resolve(data);//因一次加载最多20个，小于说明后面没有开播用户了,当小于时可以考虑加入隐藏加载更多，反之显示
            }).catch(err => {
                data.errorText = "错误信息" + err;
                data.err = err;
                reject(data);
            });
        })
    },
    //直播间
    liveDel: {
        delLiveRoom() {//过滤直播间列表，该功能目前尚未完善，暂时用着先
            const list = document.getElementsByClassName("index_3Uym8ODI");
            for (let v of list) {
                const title = v.getElementsByClassName("Item_2GEmdhg6")[0].textContent.trim();
                const type = v.getElementsByClassName("Item_SI0N7ecx")[0].textContent;//分区类型
                const name = v.getElementsByClassName("Item_QAOnosoB")[0].textContent.trim();
                const index = v.getElementsByClassName("Item_3Iz_3buh")[0].textContent.trim();//直播间人气
                //直播分区时屏蔽的类型，比如在手游直播界面里的全部中，会屏蔽对应的类型房间号
                if (["和平精英"].includes(type)) {
                    v.remove();
                    Tip.printLn("已屏蔽直播分类为=" + type + " 的直播间 用户名=" + name + " 房间标题=" + title + " 人气=" + index)
                    continue;
                }
                if (Remove.name(v, name)) {
                    Tip.printLn("已通过用户名=" + name + " 屏蔽直播间 直播分类=" + type + " 房间标题=" + title + " 人气=" + index)
                    continue;
                }
                const nameKey = Remove.nameKey(v, name);
                if (nameKey != null) {
                    Tip.printLn("用户名=" + name + " 包含了=屏蔽词=" + nameKey + " 故屏蔽该直播间 分类=" + type + " 房间标题=" + title + " 人气=" + index)
                    continue;
                }
                if (Remove.titleKey(v, title)) {
                    Tip.printLn("已通过直播间标题=【" + title + "】屏蔽该房间 用户名=" + name + " 分类=" + type + " 人气=" + index);
                }
            }
        }
    }
};

const Search = {
    //是否正在执行获取操作
    isGetLoadIngData: false,
    getKeyword() {//返回搜索页面中搜索关键词
        const match = Util.getWindowUrl().match(/keyword=([^&]+)/);
        if (match) {
            return decodeURIComponent(match[1]);
        } else {
            return null;
        }
    },
    getTabsItem() {//获取搜索页面当前选中的总选项卡
        return document.querySelector(".vui_tabs--nav.vui_tabs--nav-pl0>.vui_tabs--nav-item-active .vui_tabs--nav-text").textContent;
    },
    //TODO 后续需要防抖优化
    /**
     * 处理综合搜索页面展示对应用户是否匹配屏蔽规则执行屏蔽处理
     */
    blockUserCard() {
        const interval = setInterval(() => {
            const jqE = $(".user-list.search-all-list");
            if (jqE.length === 0) return;
            clearInterval(interval);
            const userCrud = jqE.find('.user-name.cs_pointer.v_align_middle');
            const userAddress = userCrud[0].href;
            const userName = userCrud.text();
            const userUid = Util.getSubWebUrlUid(userAddress);
            if (Matching.arrKey(LocalData.getArrUID(), parseInt(userUid))) {
                jqE.remove();
                Tip.success(`已通过黑名单uid规则屏蔽${userUid} 屏蔽用户【${userName}】uid=${userUid} -搜索优先级匹配显示的用户内容`);
                return;
            }
            const MA = Matching.arrContent(LocalData.getArrNameKey(), userName);
            if (MA === null) return;
            jqE.remove();
            Tip.success(`已通过黑名单用户名模糊规则=【${MA}】 屏蔽${userUid} 屏蔽用户【${userName}】uid=${userUid} -搜索优先级匹配显示的用户内容`);
        }, 1000);
    },
    video: {
        getDataV(v) {
            let info = v.querySelector(".bili-video-card__info--right");
            let userInfo = info.querySelector(".bili-video-card__info--owner");
            //用户空间地址
            let upSpatialAddress = userInfo.getAttribute("href");
            let videOHref;
            const topInfo = v.querySelectorAll(".bili-video-card__stats--left>.bili-video-card__stats--item");//1播放量2弹幕数
            const tempE = info.querySelector("a[href*='www.bilibili.com/video/']");
            const v_img = v.querySelector(".v-img>img");
            if (tempE == null) {
                v.remove();
                console.log("视频地址非video，故删除");
            } else {
                videOHref = tempE.href;
            }
            return {
                //用户名
                upName: userInfo.querySelector(".bili-video-card__info--author").textContent,
                //标题
                title: info.querySelector(".bili-video-card__info--tit").getAttribute("title"),
                "视频地址": videOHref,
                bv: Util.getSubWebUrlBV(videOHref),
                upSpatialAddress: upSpatialAddress,
                uid: Util.getSubUid(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1)),
                //视频的时间
                videoTime: v.querySelector(".bili-video-card__stats__duration").textContent,
                frontCover: v_img === null ? null : v_img.getAttribute("src"),
                //播放量
                playbackVolume: topInfo[0],
                //弹幕量
                barrageQuantity: topInfo[1]
            }
        },
        getTabTheSelectedSort() {//排序
            const e = document.querySelector(".search-condition-row>.vui_button--active");
            return e == null ? "默认排序" : e.textContent;
        },
        getVideoDataList(list = document.querySelectorAll(".video-list.row>*")) {
            const dataList = [];
            list.forEach(v => {
                const data = {};
                const info = v.querySelector(".bili-video-card__info--right");
                const title = info.querySelector("h3").getAttribute("title");
                if (title === null) return;
                data["title"] = title.trim();
                const tempHref = info.querySelector("a[href*='www.bilibili.com/video/']");
                if (tempHref == null) {
                    v.remove();
                    console.error("视频地址非video，故删除");
                    return;
                }
                const videoAddress = tempHref.href;
                data["bv"] = Util.getSubWebUrlBV(videoAddress);
                data["videoAddress"] = videoAddress;
                const userInfo = info.querySelector(".bili-video-card__info--owner");
                if (userInfo === null) return;
                const userAddress = userInfo.getAttribute("href");
                data["name"] = userInfo.querySelector(".bili-video-card__info--author").textContent;
                data["uid"] = Util.getSubWebUrlUid(userAddress);
                data["userAddress"] = userAddress;
                let tempDate;
                try {
                    const tempE = userInfo.querySelector(".bili-video-card__info--date");
                    tempDate = tempE ? tempE.textContent.substring(3) : null;
                    data["date"] = tempDate;
                } catch (e) {
                    console.log("搜索页面中获取项目时间出错了！");
                    console.error(e);
                }
                data["e"] = v;
                dataList.push(data);
            });
            return dataList;
        },
        async getAsyncVideoDataList() {
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    const arr = document.querySelectorAll(".video-list.row>*");
                    if (arr.length === 0) {
                        return;
                    }
                    if (arr[0].textContent === "") {
                        return;
                    }
                    clearInterval(interval)
                    resolve(Search.video.getVideoDataList(arr));
                }, 500);
            });
        },
        async getAllVideoDataList() {
            let dataList = [];
            return new Promise((resolve, reject) => {
                const interval = setInterval(() => {
                    const tabsItem = Search.getTabsItem();
                    if (!(tabsItem === "视频" || tabsItem === "综合")) {
                        clearInterval(interval);
                        reject("当前请在视频选项卡或者综合选项卡中获取！");
                        return;
                    }
                    const tempDataList = Search.video.getVideoDataList();
                    dataList = dataList.concat(tempDataList);
                    const nextPageBut = $(".vui_pagenation--btns>button:contains('下一页')");
                    if (nextPageBut.prop("disabled")) {
                        clearInterval(interval);
                        resolve(dataList);
                    }
                    nextPageBut.click();
                    Util.bufferBottom();
                }, 2500);
            });
        },
        /**
         * 删除搜索页面的视频元素
         */
        async searchRules() {
            const videoDataList = await this.getAsyncVideoDataList();
            videoDataList.forEach(v => {
                if (shieldVideo_userName_uid_title(new VideoClass()
                    .setE(v["e"])
                    .setUpName(v["name"])
                    .setUid(v["uid"])
                    .setTitle(v["title"])
                    .setVideoAddress(v["videoAddress"]))) {
                    Tip.videoBlock("屏蔽了视频");
                    return;
                }
                const jqE = $(v["e"]);
                if (Util.isEventJq(jqE, "mouseover")) return;
                jqE.mouseenter((e) => {
                    const domElement = e.delegateTarget;
                    const data = Search.video.getDataV(domElement);
                    Util.showSDPanel(e, data);
                });
            });
        }
    },
    article: {
        getTabTheSelectedSort() {//排序
            const e = document.querySelector(".condition-row>.vui_button--active");
            return e == null ? "综合排序" : e.textContent;
        },
        getDataList() {
            const eList = document.querySelectorAll(".media-list.row.mt_lg>*");
            const list = [];
            eList.forEach(v => {
                const data = {};
                data["title"] = v.querySelector(".text1").getAttribute("title");
                data["type"] = v.querySelector(".b_text.atc-info.text_ellipsis>a").textContent;
                data["desc"] = v.querySelector(".atc-desc").textContent;
                const userInfo = v.querySelector(".flex_start.flex_inline.text3");
                data["src"] = v.querySelector(".v-img.cover-img>img").getAttribute("src");
                data["userAddress"] = userInfo.getAttribute("href");
                data["name"] = userInfo.querySelector(".lh_xs").textContent;
                const articleAddress = v.querySelector(".text1").getAttribute("href");
                data["address"] = articleAddress;
                data["cv"] = articleAddress.match(/read\/(.*?)[?]/)[1];
                list.push(data);
            });
            return list;
        },
        getAllDataList() {
            let dataList = [];
            return new Promise((resolve, reject) => {
                const interval = setInterval(() => {
                    if (document.querySelector(".loading-text.b_text.text3.p_center") !== null) {
                        Tip.info("加载中...");
                        return;
                    }
                    const tempList = Search.article.getDataList();
                    dataList = dataList.concat(tempList);
                    if (document.querySelector(".net-error.p_center.text_center") !== null) {
                        reject(dataList);
                        clearInterval(interval);
                        return;
                    }
                    const nextPageBut = $(".vui_pagenation--btns>button:contains('下一页')");
                    if (nextPageBut.prop("disabled")) {
                        clearInterval(interval);
                        resolve(dataList);
                    }
                    nextPageBut.click();
                    Util.bufferBottom();
                }, 2500);
            });
        }
    },
    upuser: {
        getTabTheSelectedSort() {//排序
            const e = document.querySelector(".condition-row>.vui_button--active");
            return e == null ? "默认排序" : e.textContent;
        },
        getTwoTabTheSelectedSort() {//二级筛选
            return document.querySelector(".more-conditions.hide.ov_hidden>.condition-row>.vui_button--active").textContent;
        },
        getUserInfoList() {//获取搜索用户页面列表(当前页面可见)
            const elementNodeList = document.querySelectorAll(".media-list.row.mt_x40>*");
            const dataList = [];
            elementNodeList.forEach(v => {
                const data = {};
                const userInfo = v.querySelector("h2>a");
                data["name"] = userInfo.getAttribute("title");
                const address = userInfo.getAttribute("href");
                data["uid"] = Util.getSubWebUrlUid(address);
                const lvSvgVar = v.querySelector("h2>.level-icon>use").getAttribute("xlink:href");
                data["lv"] = parseInt(lvSvgVar.replace("#lv_", ""));
                data["address"] = address;
                data["text_ellipsis"] = v.querySelector(".user-content>.text_ellipsis").getAttribute("title");
                dataList.push(data);
            });
            return dataList;
        }, getUserInfoAllList() {//获取搜索用户页面列表(当前页面全部可见)
            let dataList = [];
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    const tempDataList = Search.upuser.getUserInfoList();
                    dataList = dataList.concat(tempDataList);
                    const nextPageBut = $(".vui_pagenation--btns>button:contains('下一页')");
                    if (nextPageBut.prop("disabled")) {
                        clearInterval(interval);
                        resolve(dataList);
                    }
                    nextPageBut.click();
                }, 2110);
            });
        }
    },
    bangumi: {
        getDataList() {
            const arr = document.querySelectorAll(".media-list.i_wrapper>.row>*");
            const list = [];
            arr.forEach(v => {
                const data = {};
                data["封面"] = v.querySelector(".v-img>img").getAttribute("src");
                data["tag"] = v.querySelector(".tag.tag-primary.media-card-content-head-title-tag").textContent;
                data["番剧名"] = v.querySelector(".text_ellipsis").getAttribute("title");
                data["lableContent"] = v.querySelector(".media-card-content-head-text.media-card-content-head-label").textContent;
                const cvDesc = v.querySelector(".media-card-content-head-text.media-card-content-head-cv.text_ellipsis>span");
                data["声优"] = cvDesc === null ? "" : cvDesc.textContent;
                data["简介"] = v.querySelector(".media-card-content-head-text.media-card-content-head-desc.text_ellipsis_3l").getAttribute("title");
                const scoreFooterE = v.querySelector(".score.media-card-content-footer-score");
                data["评分人数"] = scoreFooterE.querySelector(".score-text").textContent;
                data["评分值"] = scoreFooterE.querySelector(".score-value").textContent;
                list.push(data);
            });
            console.log(list);
            return list;
        },
        getAllDataList() {
            let dataList = [];
            return new Promise(resolve => {
                const inte = setInterval(() => {
                    const arr = Search.bangumi.getDataList();
                    dataList = dataList.concat(arr);
                    const nextPageBut = $(".vui_pagenation--btns>button:contains('下一页')");
                    if (nextPageBut.prop("disabled")) {
                        clearInterval(inte);
                        resolve(dataList);
                        return;
                    }
                    nextPageBut.click();
                }, 2000);
            });
        }
    },
    live: {
        getTabsItem() {
            const e = document.querySelector(".live-condition.mt_lg.mt_xxl>.vui_button--active");
            return e === null ? "全部" : e.textContent;
        },
        liveUsers: {
            getDataList() {
                const list = [];
                document.querySelectorAll(".live-user-cards.row.mt_lg>*").forEach(v => {
                    const data = {};
                    const liveTitleE = v.querySelector(".live-title");
                    data["直播间标题"] = liveTitleE.textContent;
                    data["直播间地址"] = liveTitleE.getAttribute("href");
                    data["text_ellipsisD_inline_block"] = v.querySelector(".text_ellipsis.d_inline_block").textContent;
                    data["用户头像"] = v.querySelector(".bili-avatar>img").getAttribute("src");
                    list.push(data);
                });
                return list;
            },
            getAllDataList() {
                let list = [];
                return new Promise(resolve => {
                    const interval = setInterval(() => {
                        const arr = Search.live.liveUsers.getDataList();
                        list = list.concat(arr);
                        const nextPageBut = $(".vui_pagenation--btns>button:contains('下一页')");
                        if (nextPageBut.prop("disabled")) {
                            clearInterval(interval);
                            resolve(list);
                            return;
                        }
                        nextPageBut.click();
                    }, 2000);
                });
            }
        },
        getLiveRoomSort() {//直播间排序
            const e = document.querySelector(".room-order.flex_start.ml_sm>.vui_button--active");
            return e === null ? "综合排序" : e.textContent;
        },
        getLiveDataList() {
            const list = [];
            document.querySelectorAll(".live-room-cards.row.mt_lg>*").forEach(v => {
                const data = {};
                data["封面"] = v.querySelector(".v-img.bili-live-card__cover>img").getAttribute("src");
                const liveCard = v.querySelector(".bili-live-card__info--tit");
                const userInfoE = v.querySelector(".bili-live-card__info--uname");
                data["直播间标题"] = liveCard.querySelector("a>span").textContent;
                data["直播间地址"] = liveCard.querySelector("a").getAttribute("href");
                data["用户名"] = userInfoE.querySelector("span").textContent;
                const userAddress = userInfoE.getAttribute("href");
                data["uid"] = Util.getSubWebUrlUid(userAddress);
                data["用户地址"] = userAddress;
                data["人气"] = v.querySelector(".bili-live-card__stats--item>span").textContent;
                list.push(data);
            });
            return list;
        },
        getLiveAllDataList() {
            let list = [];
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    const arr = Search.live.getLiveDataList();
                    list = list.concat(arr);
                    const nextPageBut = $(".vui_pagenation--btns>button:contains('下一页')");
                    if (nextPageBut.prop("disabled")) {
                        clearInterval(interval);
                        resolve(list);
                        return;
                    }
                    nextPageBut.click();
                }, 2000);
            });
        }
    },
    searchColumn() {//根据规则屏蔽搜索专栏项目
        const interval = setInterval(() => {
            const list = $(".media-list.row.mt_lg").children();
            if (list.length === 0) return;
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
                    Tip.printLn("已通过uid【" + uid + "】，屏蔽用户【" + name + "】，专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
                    continue;
                }
                if (Remove.name(v, name)) {
                    Tip.printLn("已通过黑名单用户【" + name + "】，屏蔽处理，专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
                    continue;
                }
                const isNameKey = Remove.nameKey(v, name);
                if (isNameKey != null) {
                    Tip.printLn("用户【" + name + "】的用户名包含屏蔽词【" + isNameKey + "】 故进行屏蔽处理 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid)
                    continue;
                }
                const isTitleKey = Remove.titleKey(v, title);
                if (isTitleKey != null) {
                    Tip.printLn("通过标题关键词屏蔽用户【" + name + "】 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
                    continue;
                }
                const titleKeyCanonical = Remove.titleKeyCanonical(v, title);
                if (titleKeyCanonical != null) {
                    Tip.printLn(`通过标题正则表达式=【${titleKeyCanonical}】屏蔽用户【${name}】专栏预览内容=${textContent} 用户空间地址=https://space.bilibili.com/${uid}`);
                    continue;
                }
                const key = Remove.columnContentKey(v, textContent);
                if (key !== null) {
                    Tip.printLn("已通过专栏内容关键词【" + key + "】屏蔽用户【" + name + "】 专栏预览内容=" + textContent + " 用户空间地址=https://space.bilibili.com/" + uid);
                    continue;
                }
                $(v).mouseenter((e) => {
                    const domElement = e.delegateTarget;
                    const title = domElement.querySelector(".text1").textContent;
                    const info = domElement.querySelector(".flex_start.flex_inline.text3");
                    const userHref = info.href;
                    Util.showSDPanel(e, {
                        upName: info.querySelector(".lh_xs").text,
                        uid: userHref.substring(userHref.lastIndexOf("/") + 1)
                    });
                });
            }
        }, 1000);
    }
}

const Space = {
    //是否正在获取粉丝或关注列表
    isFetchingFollowersOrWatchlists: false,
    //获取当前用户空间是否是自己的空间主页
    isH_action() {
        return document.querySelector(".h-action") === null;
    },
    getMyFollowLabel() {//获取当前关注数页面中展示关注列表的标签，如，全部关注，以及用户自定义的分类，xxx
        return document.querySelector(".item.cur").textContent;
    },
    getUserName() {//获取当前空间中的用户名
        return new Promise(resolve => {
            const interval = setInterval(() => {
                const e = $("#h-name");
                if (e.length === 0) return;
                clearInterval(interval);
                resolve(e.text());
            }, 100);
        });
    },
    async getTabName() {
        return new Promise(resolve => {
            const i1 = setInterval(() => {
                let typeE = document.querySelector(".n-statistics>.router-link-active>.n-data-k");//关注或粉丝页
                if (typeE !== null) {
                    resolve(typeE.textContent);
                    clearInterval(i1);
                    return;
                }
                typeE = document.querySelector(".n-tab-links>.active>.n-text");
                if (typeE === null) return;
                resolve(typeE.textContent);
                clearInterval(i1);
            }, 50);
        });

    },
    fav: {
        getFavName() {//获取收藏选项卡中对应展示的收藏夹名
            let favName = document.querySelector(".favInfo-details>.fav-name");
            if (favName !== null) return favName.textContent.trim();
            favName = document.querySelector(".collection-details .title-name");
            if (favName !== null) return favName.textContent.trim();
            return "未知收藏夹";
        },
        getFavID() {//获取收藏夹选项卡中展示的收藏夹id
            const element = $(".fav-item.cur a");
            let id = element.attr("href");
            return Util.getUrlParam(id, "fid");
        },
        getFavtype() {//获取左侧收藏夹选中的的类型
            const urlParam = Util.getUrlParam($(".fav-item.cur a").attr("href"), "ftype");
            if (urlParam === null) return null;
            return urlParam;
        },
        getAuthorName() {//获取收藏选项卡中对应展示的创建收藏夹的作者
            let favUpName = document.querySelector(".favInfo-details .fav-up-name");
            if (favUpName !== null) {
                return favUpName.textContent.replace("创建者：", "");
            }
            favUpName = document.querySelector(".author-wrapper>.author");
            if (favUpName !== null) {
                return favUpName.textContent.replace("合集 · UP主：", "");
            }
            return "不确定的用户名";
        },
        getDataList() {//获取获取收藏选项卡中对应展示的收藏夹项目内容
            const elementList = document.querySelectorAll(".fav-video-list.clearfix.content>li");
            const dataList = [];
            elementList.forEach(value => {
                const data = {};
                data["标题"] = value.querySelector(".title").textContent;
                const bvID = value.getAttribute("data-aid");
                data["BV号"] = bvID;
                data["AV号"] = Util.BilibiliEncoder.dec(bvID);
                data["收藏于何时"] = value.querySelector(".meta.pubdate").textContent.trim();//收藏于何时
                data["视频的时长"] = value.querySelector("a>.length").textContent;//对象的时长
                const videoInfo = value.querySelector(".meta-mask>.meta-info");
                data["作者名"] = videoInfo.querySelector(".author").textContent.split("：")[1];//作者名
                data["视频地址"] = `https://www.bilibili.com/video/${bvID}`;//视频地址
                data["播放量"] = videoInfo.querySelector(".view").textContent.split("：")[1];//播放量
                data["收藏量"] = videoInfo.querySelector(".favorite").textContent.split("：")[1];//收藏量
                data["投稿时间"] = videoInfo.querySelector(".pubdate").textContent.split("：")[1];//投稿时间(审核通过的时间)
                data["封面"] = value.querySelector(".b-img__inner>img").getAttribute("src");//收藏对象的封面，如视频封面
                dataList.push(data);
            });
            return dataList;
        },
        getAllDataList() {
            let list = [];
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    const arr = Space.fav.getDataList();
                    list = list.concat(arr);
                    const nextPageBut = $(".fav-content.section>.be-pager>.be-pager-next");
                    if (nextPageBut.is(":hidden")) {
                        clearInterval(interval);
                        resolve(list);
                        return;
                    }
                    nextPageBut.click();
                }, 2000);
            });
        },
        getHttpDataList(url) {
            const dataList = [];
            return new Promise((resolve, reject) => {
                const promise = HttpUtil.get(url);
                promise.then(res => {
                    const json = res.bodyJson;
                    const mediasArr = json["data"]["medias"];
                    for (let value of mediasArr) {
                        const data = {};
                        const upInfo = value["upper"];
                        const bvId = value["bvid"];
                        data["作者名"] = upInfo["name"];
                        data["uid"] = upInfo["mid"];
                        data["头像"] = upInfo["face"];
                        data["标题"] = value["title"];
                        data["封面"] = value["cover"];
                        data["AV号"] = value["id"];
                        data["BV号"] = bvId;
                        data["视频地址"] = `https://www.bilibili.com/video/${bvId}`;
                        data["弹幕量"] = value["cnt_info"]["danmaku"];
                        data["播放量"] = value["cnt_info"]["play"];
                        data["收藏量"] = value["cnt_info"]["collect"];
                        data["投稿时间"] = value["ctime"];
                        data["收藏于何时"] = value["fav_time"];
                        dataList.push(data);
                    }
                    const hasMore = json["data"]["has_more"];
                    resolve({state: true, hasMore: hasMore, dataList: dataList});
                }).catch(error => {
                    reject({state: false, error: error});
                });
            });
        },
        /**
         * 请求自己或他人所建的收藏夹指定页数的列表内容
         * 该api最大只能获取20个收藏夹内容
         * 详情参数可查询<a href="https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/fav/list.md">api信息</a>
         * @param {string}id 收藏夹id
         * @param page
         * @return {Promise<unknown>}
         */
        getHttpUserCreationDataList(id, page = 1) {
            return this.getHttpDataList(`https://api.bilibili.com/x/v3/fav/resource/list?media_id=${id}&pn=${page}&ps=20`);
        },
        /**
         * 请求自己或他人所建的收藏夹中指定收藏夹所有item
         */
        async getHttpUserCreationAllDataList(id) {
            let page = 1;
            const datalist = [];

            async function f() {
                const data = await this.getHttpUserCreationDataList(id, page);
                if (!data["state"]) {
                    return false;
                }
                if (!data["hasMore"]) {
                    return false;
                }
                Util.mergeArrays(datalist, data["dataList"]);
                f();
            }

            await f();
            return datalist;
        },
        /**
         *
         * 请求他人或者自己收藏了他人指定收藏夹列表中所有项目
         * @param id 收藏夹id
         * @return {Promise<unknown>}
         */
        getHttpCollectOthersDataAllList(id) {
            return this.getHttpDataList(`https://api.bilibili.com/x/space/fav/season/list?season_id=${id}`);
        }
    },
    followAndFans: {
        getdataList() {
            const list = [];
            document.querySelectorAll(".relation-list>li").forEach(value => {
                const data = {};
                const userInfoContent = value.querySelector(".content");
                const userAddress = userInfoContent.querySelector("a").getAttribute("href");
                const name = userInfoContent.querySelector("a>.fans-name").textContent;
                let desc = userInfoContent.querySelector(".desc");//个人简介
                const fansActionText = userInfoContent.querySelector(".fans-action-text").textContent;//关注状态，如已关注，互关
                const userImg = value.querySelector(".cover-container .bili-avatar>img").getAttribute("src");//头像
                data["name"] = name;
                data["img"] = userImg;
                if (desc !== null) {
                    desc = desc.getAttribute("title");
                }
                data["desc"] = desc;
                let uid = /space\.bilibili\.com\/(\d+?)\//.exec(userAddress);
                if (uid && uid[1]) {
                    uid = uid[1];
                } else {
                    uid = userAddress;
                }
                data["uid"] = parseInt(uid);
                data["fansActionType"] = fansActionText;
                list.push(data);
            });
            return list;
        }
        ,
        getAllDataList() {
            let list = [];
            const isHAction = this.isH_action();
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    const arr = Space.followAndFans.getdataList();
                    list = list.concat(arr);
                    const nextPageBut = $(".content>.be-pager>.be-pager-next");
                    if (nextPageBut.is(":hidden")) {
                        clearInterval(interval);
                        resolve(list);
                        return;
                    }
                    const page = parseInt(document.querySelector(".be-pager>.be-pager-item.be-pager-item-active>a").textContent.trim());
                    if (page === 5 && (!isHAction)) {
                        resolve(list);
                        alert("因您当前访问的用户空间非自己实际登录的个人空间主页（不是自己当前网页登录的账号）而是访问他人，b站系统限制只能访问前5页");
                        return;
                    }
                    nextPageBut.click();
                }, 2000);
            });
        }
    },
    dynamic: {
        getdataList() {
            const list = [];
            document.querySelectorAll(".bili-dyn-list__items>*").forEach(v => {
                const data = {};
                data["动态内容"] = v.querySelector(".bili-dyn-content").textContent.trim();
                data["点赞量"] = v.querySelector(".bili-dyn-item__footer .like").textContent.trim();
                list.push(data);
            })
            console.log(list);
        }
    },
    video: {//投稿中的视频
        getLeftTabTypeName() {
            return $(".contribution-list>.contribution-item.cur>a").text();
        },
        getSortText() {
            return $(".be-tab-inner.clearfix>.is-active>span").text();
        },
        getVideoType() {
            return $("#submit-video-type-filter>.active").text().trim().replace(/\d+/g, '');
        },
        getDataList() {
            const list = [];
            document.querySelectorAll(".clearfix.cube-list>li").forEach(v => {
                const data = {};
                data["标题"] = v.querySelector(".title").textContent;
                data["bv"] = v.getAttribute("data-aid");
                const meta = v.querySelector(".meta");
                data["播放量"] = meta.querySelector(".play>span").textContent;
                data["时间"] = meta.querySelector(".time").textContent.trim();
                data["时长"] = v.querySelector("a>.length").textContent;
                data["封面"] = v.querySelector(".b-img img").getAttribute("src")
                list.push(data);
            })
            return list;
        }
        ,
        getAllDataList() {
            let list = [];
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    const arr = Space.video.getDataList();
                    list = list.concat(arr);
                    const nextPageBut = $("#submit-video-list>.be-pager>.be-pager-next");
                    if (nextPageBut.is(":hidden")) {
                        clearInterval(interval);
                        resolve(list);
                        return;
                    }
                    nextPageBut.click();
                    Util.bufferBottom();
                }, 2500);
            });
        }
    },
    article: {//投稿中的专栏
        getdataList() {
            const list = [];
            document.querySelectorAll(".article-wrap.clearfix>li").forEach(v => {
                const data = {};
                data["标题"] = v.querySelector(".article-title>a").getAttribute("title");
                data["地址"] = v.querySelector(".article-title>a").getAttribute("href");
                data["预览部分"] = v.querySelector(".article-con>a").getAttribute("title");
                const metaCol = v.querySelector(".meta-col");
                data["标签"] = v.querySelectorAll(".meta-col>span")[0].textContent;
                data["访问量"] = metaCol.querySelector(".view").textContent.trim();
                data["喜欢数"] = metaCol.querySelector(".like").textContent.trim();
                data["评论"] = metaCol.querySelector(".comment").textContent.trim();
                data["创建时间"] = metaCol.querySelector(".time").textContent.trim();
                const hrefCss = v.querySelector(".article-cover").getAttribute("style");
                let imgUrl = hrefCss.match(/url\("([^"]+)"\)/);
                data["封面"] = imgUrl ? imgUrl[1] : "";
                //封面后面在弄
                list.push(data);
            });
            return list;
        },
        getAllDataList() {
            let list = [];
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    Util.bufferBottom();
                    const tempList = Space.article.getdataList();
                    list = list.concat(tempList);
                    const nextPage = $(".be-pager-next");
                    if (nextPage.is(":hidden")) {
                        clearInterval(interval);
                        resolve(list);
                        return;
                    }
                    nextPage.click();
                }, 2500);
            });
        }
    },
    album: {//相薄
        getdataList() {
            const list = [];
            document.querySelectorAll(".album-list__content>*").forEach(v => {
                const data = {};
                const albumCardTitle = v.querySelector(".album-card__title");
                data["预览部分"] = albumCardTitle.textContent;
                data["动态地址"] = albumCardTitle.getAttribute("href");
                const albumCardCountText = v.querySelectorAll(".album-card__info .album-card__count-text");
                data["浏览量"] = albumCardCountText[0].textContent.trim();
                data["点赞量"] = albumCardCountText[1].textContent.trim();
                const hrefCss = v.querySelector(".album-card__picture").getAttribute("style");
                let imgUrl = hrefCss.match(/url\("([^"]+)"\)/);
                data["封面"] = imgUrl ? imgUrl[1] : "";
                list.push(data);
            });
            return list;
        },
        getAllDataList() {
            let list = [];
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    Util.bufferBottom();
                    const tempList = Space.album.getdataList();
                    list = list.concat(tempList);
                    const nextPage = $(".be-pager-next");
                    if (nextPage.is(":hidden")) {
                        clearInterval(interval);
                        resolve(list);
                        return;
                    }
                    nextPage.click();
                }, 2500);
            });
        }
    },
    subscribe: {//订阅
        getTabsName() {//订阅中的tab名
            return $(".sub-tabs.clearfix>.active").text().trim();
        },
        bangumiAndCinema: {//追番和追剧
            getSortText() {//筛选的依据
                return $(".be-dropdown>.cur-filter").text();
            },
            getdataList() {
                const list = [];
                document.querySelectorAll(".pgc-space-follow-item").forEach(v => {
                    const data = {};
                    data["封面"] = v.querySelector(".pgc-item-cover>img").getAttribute("src");
                    const pgcItemInfo = v.querySelector(".pgc-item-info");
                    data["标题"] = pgcItemInfo.querySelector(".pgc-item-title").textContent;
                    data["类型"] = pgcItemInfo.querySelector(".type-and-area>span:first-child").textContent;
                    data["地区"] = pgcItemInfo.querySelector(".type-and-area>span:last-child").textContent;
                    data["部分简介"] = pgcItemInfo.querySelector(".pgc-item-desc").textContent;
                    data["地址"] = pgcItemInfo.getAttribute("href");
                    list.push(data);
                });
                return list;
            },
            getAllDataList() {
                let list = [];
                return new Promise(resolve => {
                    const interval = setInterval(() => {
                        const tempList = Space.subscribe.bangumiAndCinema.getdataList();
                        list = list.concat(tempList);
                        const nextPage = document.querySelector(".p.next-page");
                        if (nextPage === null) {
                            clearInterval(interval);
                            resolve(list);
                            return;
                        }
                        nextPage.click();
                    }, 2500);
                });
            }
        },
        subs: {//订阅中的标签
            getdataList() {
                const list = [];
                document.querySelectorAll(".content.clearfix>.mini-item").forEach(v => {
                    const data = {};
                    const detail = v.querySelector(".detail");
                    data["标签名"] = detail.getAttribute("title");
                    data["标签图标"] = v.querySelector(".cover>img").getAttribute("src");
                    data["地址"] = detail.querySelector("a").getAttribute("href");
                    list.push(data);
                });
                return list;
            }
        }
    },
}

//动态
const Trends = {

    getVideoCommentAreaOrTrendsLandlord(v) {//获取动态页面-评论区信息-单个元素信息-楼主
        return new ContentCLass().setUpName(v.querySelector(".user-name").textContent).setUid(v.querySelector(".user-name").getAttribute("data-user-id"))
            .setContent(v.querySelector(".reply-content").parentNode.textContent);
    },
    getVideoCommentAreaOrTrendsStorey(j) {//获取动态页面-评论区信息-单个元素信息-楼层
        return new ContentCLass()
            .setUpName(j.querySelector(".sub-user-name").textContent)
            .setUid(j.querySelector(".sub-user-name").getAttribute("data-user-id"))
            .setContent(j.querySelector(".reply-content").textContent)
    },
    shrieDynamicItems(list) {//屏蔽动态页动态项目
        for (let v of list) {
            let tempE = v.querySelector(".bili-rich-text");
            if (tempE === null || tempE.length === 0) {//没有说明是其他的类型动态，如投稿了视频且没有评论显示
                continue;
            }
            const tempContent = tempE.textContent;
            const contentKey = Matching.arrContent(LocalData.getDynamicArr(), tempContent);
            if (contentKey !== null) {
                const tempInfo = `已通过动态关键词【${contentKey}】屏蔽了动态【${tempContent}】`;
                v.remove();
                Tip.success(`已通过动态关键词屏蔽相关动态，详情屏蔽内容可看面板输出信息`);
                Tip.printLn(tempInfo);
                continue;
            }
            const arrContentCanonical = Matching.arrContentCanonical(LocalData.getDynamicCanonicalArr(), tempContent);
            if (arrContentCanonical != null) {
                const tempInfo = `已通过动态正则关键词【${arrContentCanonical}】屏蔽了动态【${tempContent}】`;
                v.remove();
                Tip.success(`已通过动态正则关键词屏蔽相关动态，详情屏蔽内容可看面板输出信息`);
                Tip.printLn(tempInfo);
                Rule.trendsData
            }
        }
    },
    getGrid9Imge() {
        const imgeUrlList = [];
        document.querySelectorAll(".bili-album__preview.grid9>*").forEach(v => {
            const src = v.querySelector("img").src;
            imgeUrlList.push(src.split("@")[0]);
        });
        return imgeUrlList;
    },
    tempLoadIng() {
        const interval01 = setInterval(() => {
            const tempList = document.querySelectorAll(".bili-dyn-list__items>.bili-dyn-list__item");
            if (tempList.length === 0) return;
            clearInterval(interval01);
            Trends.shrieDynamicItems(tempList);
        }, 1000);
        try {
            const tempE01 = $(".bili-dyn-list__items");
            if (Util.isEventJq(tempE01, "DOMNodeInserted")) return;
            tempE01.bind("DOMNodeInserted", () => {
                Trends.shrieDynamicItems(tempE01.children());
            });
        } catch (e) {
            console.error("出现错误！", e);
        }
    }
};

const AccountCenterVue = {
    returnVue() {
        const vue = new Vue({
            el: "#accountCenterLayout",
            components: {
                login: {//已登录状态
                    template: `
                        <div>
                        <h1>个人信息</h1>
                        <div style="display: flex">
                            <img src="https://tc.dhmip.cn/imgs/2024/04/30/7247e547a33ce1ed.png"
                                 style="border-radius: 50%; height: 100px;" alt="图片加载不出来">
                            <div
                                style="display: flex;align-items: flex-start;padding-left: 10px;flex-direction: column;justify-content: center;">
                                <div>
                                    <span>用户名：</span><span>{{ userName }}</span>
                                </div>
                                <div>
                                    <span>注册时间：</span><span>{{ addTime }}</span>
                                </div>
                                <div id="ruleSharingDiv">
                                    规则共享状态：<span>{{ sharedState }}</span>
                                    <button @click="ruleSharingSet(true)">公开我的规则</button>
                                    <button @click="ruleSharingSet(false)">不公开我的规则</button>
                                    <input type="checkbox" v-model="isAnonymityCheckbox"><span
                                    title="选中为匿名公布，反之不匿名公布，每次提交会覆盖上一次的匿名状态">是否匿名公布(鼠标悬停我提示信息)</span>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <div style="display: flex;justify-content: center;">
                            <button>
                                <a href="${registeredAddress}" target="_blank">注册</a>
                            </button>
                            <button @click="exitSignBut">退出登录</button>
                        </div>
                        </div>`,
                    data() {
                        return {
                            userName: "我是用户名占位符",
                            addTime: "我是注册时间占位符",
                            sharedState: false,
                            isAnonymityCheckbox: false
                        }
                    },
                    methods: {
                        exitSignBut() {
                            if (!confirm("您确定要退出登录吗")) return;
                            LocalData.AccountCenter.setInfo({});
                            Tip.success("已退出登录！");
                            this.$emit("tab-click", "notLogin");
                        },
                        //设置规则共享
                        ruleSharingSet(isPublic) {
                            const userInfo = LocalData.AccountCenter.getInfo();
                            if (Object.keys(userInfo).length === 0) {
                                Tip.error("未登录！");
                                return;
                            }
                            const {name, pwd} = userInfo;
                            const loading = Tip.loading("请稍等...");
                            if (!confirm(`确定${isPublic ? "公开" : "不公开"}自己的规则吗？\n匿名状态=${this.anonymity}`)) return;
                            $.ajax({
                                type: "POST",
                                url: `${defApi}/bilibili/`,
                                data: {
                                    model: "setShare",
                                    userName: name,
                                    userPassword: pwd,
                                    share: isPublic,
                                    anonymity: this.anonymity
                                },
                                dataType: "json",
                                success({code, message, share, anonymity}) {
                                    loading.close();
                                    if (code !== 1) {
                                        Tip.error(message);
                                        return;
                                    }
                                    userInfo["share"] = this.sharedState = share;
                                    userInfo["anonymity"] = this.anonymity = anonymity;
                                    LocalData.AccountCenter.setInfo(userInfo);
                                    Tip.success(message);
                                },
                                error(xhr, status, error) {
                                    loading.close();
                                    console.log(error);
                                    console.log(status);
                                }
                            })
                            ;
                        }
                    },
                    created() {
                        let {name, share, addTime, anonymity} = LocalData.AccountCenter.getInfo();
                        this.userName = name;
                        this.addTime = Util.timestampToTime(addTime);
                        this.sharedState = share === 1;
                        this.isAnonymityCheckbox = anonymity === 1;
                    }
                },
                notLogin: {
                    template: `
                        <div style="display: flex;flex-direction: column;align-items: center;">
                        <h1>登录账号</h1>
                        <input type="text" placeholder="用户名" v-model.trim="userName">
                        <input type="text" placeholder="密码" v-model.trim="userPwd">
                        <div>
                            <button>
                                <a href="${registeredAddress}" target="_blank">注册</a>
                            </button>
                            <button @click="loginBut">登录</button>
                        </div>
                        </div>`,
                    data() {
                        return {userName: "", userPwd: ""}
                    },
                    methods: {
                        loginBut() {
                            const captcha = Util.randomNum(1000, 9999);
                            const s = prompt("请输入验证码\n" + captcha);
                            if (s === null) return;
                            if (s !== (captcha + "")) {
                                alert("验证码错误！");
                                return;
                            }
                            if (this.userName === "" || this.userPwd === "") {
                                alert("请正常填写账号信息！");
                                return;
                            }
                            if (this.userPwd.length < 6) {
                                alert("密码长度需要大于或登录6位");
                                return;
                            }
                            const loading = Tip.loading("正在登录中...");
                            const promise = HttpUtil.get(`${defApi}/bilibili/signInToRegister.php?userName=${this.userName}&userPassword=${this.userPwd}&model=logIn`);
                            promise.then(({bodyJson}) => {
                                const {code, message, userInfo, userRule} = bodyJson;
                                if (code !== 1) {
                                    Tip.error(message);
                                    return;
                                }
                                Tip.success(message);
                                if (userRule === null) {
                                    LocalData.AccountCenter.setInfo(userInfo);
                                } else {
                                    userInfo["first_push_time"] = userRule["first_push_time"];
                                    userInfo["anonymity"] = userRule["anonymity"];
                                    userInfo["share"] = userRule["share"];
                                    LocalData.AccountCenter.setInfo(userInfo);
                                    const rule_content = JSON.parse(userRule["rule_content"]);
                                    if (confirm("是要将云端规则导入覆盖本地规则吗？")) {
                                        window.RuleCRUDLayoutVue.inputRuleLocalData(rule_content);
                                    }
                                }
                                this.$emit("tab-click", "login");
                            }).catch((error) => {
                                console.log(error);
                            }).finally(() => {
                                loading.close();
                            });
                        }
                    }
                }
            },
            data() {
                return {
                    isTab: "login",
                }
            },
            methods: {
                getTabName(tabName) {
                    this.isTab = tabName;
                }
            },
            created() {
                const getInfo = LocalData.AccountCenter.getInfo();
                if (getInfo === {} || Object.keys(getInfo).length === 0) {//没有就进入非登录页面
                    this.isTab = "notLogin";
                } else {//有就进入已登录页面
                    this.isTab = "login";
                }
            }
        });
        return function () {
            return vue;
        }
    }
}

const DonateLayoutVue = {
    returnVue() {
        new Vue({
            el: "#home_layout #donateLayout",
            template: `
              <div id="donateLayout" class="tab">
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
                  <div v-for="item in list" :title="item.name"><img :src="item.src" :alt="item.alt"
                                                                    style="max-height: 500px;">
                    <span style="display: flex;justify-content: center;">{{ item.name }}</span>
                  </div>
                </div>
                <hr>
                <h1 style=" display: flex; justify-content: center;">打赏点猫粮</h1>
              </div>
              </div>`,
            data: {
                list: [
                    {
                        name: "支付宝赞助",
                        alt: "支付宝支持",
                        src: "https://tc.dhmip.cn/imgs/2024/04/30/ae79193e00011c74.png"
                    },
                    {name: "微信赞助", alt: "微信支持", src: "https://tc.dhmip.cn/imgs/2024/04/30/8498fb1b0838370f.png"},
                    {name: "QQ赞助", alt: "QQ支持", src: "https://tc.dhmip.cn/imgs/2024/04/30/232cabb892576d6d.png"},
                ]
            }
        });
    }
}

const IsShowVue = {
    returnVUe() {
        window.isShowVue = new Vue({
            el: "#myBut",
            data: {
                show: LocalData.isMyButSHow(),
            },
            methods: {
                showBut() {
                    Home.hideDisplayHomeLaylout();
                }
            }
        });
    }
};

const LiveLayoutVue = {
    listOfFollowers: [],
    otherLiveRoomList: [],
    returnVue() {
        const vue = new Vue({
            el: "#liveLayout",
            data: {
                //关注列表
                listOfFollowers: [],
                loadFollowButText: "加载列表",
                isLoadFollowLstDisabled: false,
                findFollowListRoomKey: "",
                hRecoveryListOfFollowersIf: false,
                siftTypeSelect: "upName",
                siftTypeList: ["upName", "uid", "title", "roomId"],
                //其他分区直播列表
                otherLiveRoomList: [],
                mainPartitionSelect: "手游",
                partitionObjList: JSON.parse(`{"手游":[{"parent_name":"手游","parent_id":3,"name":"全部","id":0},{"parent_name":"手游","parent_id":3,"name":"原神","id":321},{"parent_name":"手游","parent_id":3,"name":"欢乐斗地主","id":719},{"parent_name":"手游","parent_id":3,"name":"DNF手游","id":343},{"parent_name":"手游","parent_id":3,"name":"新游评测","id":274},{"parent_name":"手游","parent_id":3,"name":"黎明觉醒：生机","id":479},{"parent_name":"手游","parent_id":3,"name":"宝可梦大集结","id":493},{"parent_name":"手游","parent_id":3,"name":"幻塔","id":550},{"parent_name":"手游","parent_id":3,"name":"三国志战棋版","id":756},{"parent_name":"手游","parent_id":3,"name":"明日之后","id":189},{"parent_name":"手游","parent_id":3,"name":"百闻牌","id":286},{"parent_name":"手游","parent_id":3,"name":"阴阳师","id":36},{"parent_name":"手游","parent_id":3,"name":"第五人格","id":163},{"parent_name":"手游","parent_id":3,"name":"战双帕弥什","id":293},{"parent_name":"手游","parent_id":3,"name":"FIFA足球世界","id":641},{"parent_name":"手游","parent_id":3,"name":"跃迁旅人","id":717},{"parent_name":"手游","parent_id":3,"name":"空之要塞：启航","id":718},{"parent_name":"手游","parent_id":3,"name":"火影忍者手游","id":292},{"parent_name":"手游","parent_id":3,"name":"Fate/GO","id":37},{"parent_name":"手游","parent_id":3,"name":"CF手游","id":333},{"parent_name":"手游","parent_id":3,"name":"游戏王","id":303},{"parent_name":"手游","parent_id":3,"name":"重返未来：1999 ","id":761},{"parent_name":"手游","parent_id":3,"name":"哈利波特：魔法觉醒 ","id":474},{"parent_name":"手游","parent_id":3,"name":"玛娜希斯回响","id":644},{"parent_name":"手游","parent_id":3,"name":" 东方归言录","id":538},{"parent_name":"手游","parent_id":3,"name":"无期迷途","id":675},{"parent_name":"手游","parent_id":3,"name":"光遇","id":687},{"parent_name":"手游","parent_id":3,"name":"少女前线：云图计划","id":525},{"parent_name":"手游","parent_id":3,"name":"黑色沙漠手游","id":615},{"parent_name":"手游","parent_id":3,"name":"雀姬","id":214},{"parent_name":"手游","parent_id":3,"name":"时空猎人3","id":643},{"parent_name":"手游","parent_id":3,"name":"明日方舟","id":255},{"parent_name":"手游","parent_id":3,"name":"猫咪公寓2","id":736},{"parent_name":"手游","parent_id":3,"name":"QQ飞车手游","id":154},{"parent_name":"手游","parent_id":3,"name":"古魂","id":759},{"parent_name":"手游","parent_id":3,"name":"航海王热血航线","id":504},{"parent_name":"手游","parent_id":3,"name":"和平精英","id":256},{"parent_name":"手游","parent_id":3,"name":"暗黑破坏神：不朽","id":492},{"parent_name":"手游","parent_id":3,"name":"蛋仔派对","id":571},{"parent_name":"手游","parent_id":3,"name":"JJ斗地主","id":724},{"parent_name":"手游","parent_id":3,"name":"香肠派对","id":689},{"parent_name":"手游","parent_id":3,"name":"跑跑卡丁车手游","id":265},{"parent_name":"手游","parent_id":3,"name":"梦幻模拟战","id":178},{"parent_name":"手游","parent_id":3,"name":"APEX手游","id":506},{"parent_name":"手游","parent_id":3,"name":"综合棋牌","id":354},{"parent_name":"手游","parent_id":3,"name":"以闪亮之名","id":755},{"parent_name":"手游","parent_id":3,"name":"恋爱养成游戏","id":576},{"parent_name":"手游","parent_id":3,"name":"漫威超级战争","id":478},{"parent_name":"手游","parent_id":3,"name":"暗区突围","id":502},{"parent_name":"手游","parent_id":3,"name":"狼人杀","id":41},{"parent_name":"手游","parent_id":3,"name":"盾之勇者成名录：浪潮","id":704},{"parent_name":"手游","parent_id":3,"name":"荒野乱斗","id":469},{"parent_name":"手游","parent_id":3,"name":"猫和老鼠手游","id":269},{"parent_name":"手游","parent_id":3,"name":"LOL手游","id":395},{"parent_name":"手游","parent_id":3,"name":"战火勋章","id":765},{"parent_name":"手游","parent_id":3,"name":"深空之眼","id":598},{"parent_name":"手游","parent_id":3,"name":"碧蓝航线","id":113},{"parent_name":"手游","parent_id":3,"name":"坎公骑冠剑","id":442},{"parent_name":"手游","parent_id":3,"name":"摩尔庄园手游","id":464},{"parent_name":"手游","parent_id":3,"name":"非人学园","id":212},{"parent_name":"手游","parent_id":3,"name":"崩坏3","id":40},{"parent_name":"手游","parent_id":3,"name":"天地劫：幽城再临","id":448},{"parent_name":"手游","parent_id":3,"name":"弹弹堂","id":734},{"parent_name":"手游","parent_id":3,"name":"300大作战","id":688},{"parent_name":"手游","parent_id":3,"name":"解密游戏","id":42},{"parent_name":"手游","parent_id":3,"name":"使命召唤手游","id":386},{"parent_name":"手游","parent_id":3,"name":"猫之城","id":645},{"parent_name":"手游","parent_id":3,"name":"长安幻想","id":738},{"parent_name":"手游","parent_id":3,"name":"少女前线","id":39},{"parent_name":"手游","parent_id":3,"name":"游戏王：决斗链接","id":407},{"parent_name":"手游","parent_id":3,"name":"梦幻西游手游","id":342},{"parent_name":"手游","parent_id":3,"name":"其他手游","id":98},{"parent_name":"手游","parent_id":3,"name":"决战！平安京","id":140},{"parent_name":"手游","parent_id":3,"name":"三国杀移动版","id":352},{"parent_name":"手游","parent_id":3,"name":"影之诗","id":156},{"parent_name":"手游","parent_id":3,"name":"公主连结Re:Dive","id":330},{"parent_name":"手游","parent_id":3,"name":"王者荣耀","id":35},{"parent_name":"手游","parent_id":3,"name":"忍者必须死3","id":203},{"parent_name":"手游","parent_id":3,"name":"BanG Dream","id":258},{"parent_name":"手游","parent_id":3,"name":"休闲小游戏","id":679},{"parent_name":"手游","parent_id":3,"name":"金铲铲之战","id":514},{"parent_name":"手游","parent_id":3,"name":"环形战争","id":725},{"parent_name":"手游","parent_id":3,"name":"天涯明月刀手游","id":389},{"parent_name":"手游","parent_id":3,"name":"漫威对决","id":511},{"parent_name":"手游","parent_id":3,"name":"奥比岛手游","id":661},{"parent_name":"手游","parent_id":3,"name":"奇点时代","id":762},{"parent_name":"手游","parent_id":3,"name":"部落冲突:皇室战争","id":50},{"parent_name":"手游","parent_id":3,"name":"重返帝国","id":613},{"parent_name":"手游","parent_id":3,"name":"小动物之星","id":473}],"赛事":[{"parent_name":"赛事","parent_id":13,"name":"全部","id":0},{"parent_name":"赛事","parent_id":13,"name":"体育赛事","id":562},{"parent_name":"赛事","parent_id":13,"name":"游戏赛事","id":561},{"parent_name":"赛事","parent_id":13,"name":"赛事综合","id":563}],"生活":[{"parent_name":"生活","parent_id":10,"name":"全部","id":0},{"parent_name":"生活","parent_id":10,"name":"手工绘画","id":627},{"parent_name":"生活","parent_id":10,"name":"时尚","id":378},{"parent_name":"生活","parent_id":10,"name":"影音馆","id":33},{"parent_name":"生活","parent_id":10,"name":"生活分享","id":646},{"parent_name":"生活","parent_id":10,"name":"萌宠","id":369},{"parent_name":"生活","parent_id":10,"name":"美食","id":367},{"parent_name":"生活","parent_id":10,"name":"搞笑","id":624},{"parent_name":"生活","parent_id":10,"name":"运动","id":628}],"娱乐":[{"parent_name":"娱乐","parent_id":1,"name":"全部","id":0},{"parent_name":"娱乐","parent_id":1,"name":"视频唱见","id":21},{"parent_name":"娱乐","parent_id":1,"name":"户外","id":123},{"parent_name":"娱乐","parent_id":1,"name":"萌宅领域","id":530},{"parent_name":"娱乐","parent_id":1,"name":"情感","id":706},{"parent_name":"娱乐","parent_id":1,"name":"视频聊天","id":145},{"parent_name":"娱乐","parent_id":1,"name":"日常","id":399},{"parent_name":"娱乐","parent_id":1,"name":"聊天室","id":740},{"parent_name":"娱乐","parent_id":1,"name":"舞见","id":207}],"电台":[{"parent_name":"电台","parent_id":5,"name":"全部","id":0},{"parent_name":"电台","parent_id":5,"name":"配音","id":193},{"parent_name":"电台","parent_id":5,"name":"唱见电台","id":190},{"parent_name":"电台","parent_id":5,"name":"聊天电台","id":192}],"网游":[{"parent_name":"网游","parent_id":2,"name":"全部","id":0},{"parent_name":"网游","parent_id":2,"name":"诛仙世界","id":654},{"parent_name":"网游","parent_id":2,"name":"街头篮球","id":649},{"parent_name":"网游","parent_id":2,"name":"洛克王国","id":669},{"parent_name":"网游","parent_id":2,"name":"剑灵","id":505},{"parent_name":"网游","parent_id":2,"name":"堡垒之夜","id":164},{"parent_name":"网游","parent_id":2,"name":"枪神纪","id":251},{"parent_name":"网游","parent_id":2,"name":"逃离塔科夫","id":252},{"parent_name":"网游","parent_id":2,"name":"吃鸡行动","id":80},{"parent_name":"网游","parent_id":2,"name":"坦克世界","id":115},{"parent_name":"网游","parent_id":2,"name":"VRChat","id":656},{"parent_name":"网游","parent_id":2,"name":"新游前瞻","id":298},{"parent_name":"网游","parent_id":2,"name":"星际战甲","id":249},{"parent_name":"网游","parent_id":2,"name":"战争雷霆","id":316},{"parent_name":"网游","parent_id":2,"name":"英雄联盟","id":86},{"parent_name":"网游","parent_id":2,"name":"超击突破","id":680},{"parent_name":"网游","parent_id":2,"name":"其他网游","id":107},{"parent_name":"网游","parent_id":2,"name":"创世战车","id":705},{"parent_name":"网游","parent_id":2,"name":"最终幻想14","id":102},{"parent_name":"网游","parent_id":2,"name":"跑跑卡丁车","id":664},{"parent_name":"网游","parent_id":2,"name":"梦三国","id":710},{"parent_name":"网游","parent_id":2,"name":"古剑奇谭OL","id":173},{"parent_name":"网游","parent_id":2,"name":"永恒轮回","id":459},{"parent_name":"网游","parent_id":2,"name":"激战2","id":607},{"parent_name":"网游","parent_id":2,"name":"奇迹MU","id":683},{"parent_name":"网游","parent_id":2,"name":"怀旧网游","id":288},{"parent_name":"网游","parent_id":2,"name":"APEX英雄","id":240},{"parent_name":"网游","parent_id":2,"name":"FIFA ONLINE 4","id":388},{"parent_name":"网游","parent_id":2,"name":"使命召唤:战区","id":318},{"parent_name":"网游","parent_id":2,"name":"反恐精英Online","id":629},{"parent_name":"网游","parent_id":2,"name":"阿尔比恩","id":639},{"parent_name":"网游","parent_id":2,"name":"星际争霸2","id":93},{"parent_name":"网游","parent_id":2,"name":"星际公民","id":658},{"parent_name":"网游","parent_id":2,"name":"CS:GO","id":89},{"parent_name":"网游","parent_id":2,"name":"天涯明月刀","id":596},{"parent_name":"网游","parent_id":2,"name":"炉石传说","id":91},{"parent_name":"网游","parent_id":2,"name":"生死狙击2","id":575},{"parent_name":"网游","parent_id":2,"name":"彩虹岛","id":686},{"parent_name":"网游","parent_id":2,"name":"武装突袭","id":634},{"parent_name":"网游","parent_id":2,"name":"魔兽争霸3","id":181},{"parent_name":"网游","parent_id":2,"name":"问道","id":670},{"parent_name":"网游","parent_id":2,"name":"剑网3","id":82},{"parent_name":"网游","parent_id":2,"name":"造梦西游","id":668},{"parent_name":"网游","parent_id":2,"name":"NBA2KOL2","id":581},{"parent_name":"网游","parent_id":2,"name":"星战前夜：晨曦","id":331},{"parent_name":"网游","parent_id":2,"name":"英魂之刃","id":690},{"parent_name":"网游","parent_id":2,"name":"永恒之塔","id":684},{"parent_name":"网游","parent_id":2,"name":"艾尔之光","id":651},{"parent_name":"网游","parent_id":2,"name":"大话西游","id":652},{"parent_name":"网游","parent_id":2,"name":"洛奇","id":663},{"parent_name":"网游","parent_id":2,"name":"风暴英雄","id":114},{"parent_name":"网游","parent_id":2,"name":"新天龙八部","id":653},{"parent_name":"网游","parent_id":2,"name":"骑士精神2","id":650},{"parent_name":"网游","parent_id":2,"name":"赛尔号","id":667},{"parent_name":"网游","parent_id":2,"name":"300英雄","id":84},{"parent_name":"网游","parent_id":2,"name":"封印者","id":300},{"parent_name":"网游","parent_id":2,"name":"新世界","id":544},{"parent_name":"网游","parent_id":2,"name":"战争与抉择","id":729},{"parent_name":"网游","parent_id":2,"name":"人间地狱","id":677},{"parent_name":"网游","parent_id":2,"name":"剑网3缘起","id":499},{"parent_name":"网游","parent_id":2,"name":"魔兽世界","id":83},{"parent_name":"网游","parent_id":2,"name":"泡泡堂","id":737},{"parent_name":"网游","parent_id":2,"name":"战舰世界","id":248},{"parent_name":"网游","parent_id":2,"name":"Squad战术小队","id":659},{"parent_name":"网游","parent_id":2,"name":"逆战","id":487},{"parent_name":"网游","parent_id":2,"name":"QQ飞车","id":610},{"parent_name":"网游","parent_id":2,"name":"穿越火线","id":88},{"parent_name":"网游","parent_id":2,"name":"洛奇英雄传","id":599},{"parent_name":"网游","parent_id":2,"name":"超激斗梦境","id":519},{"parent_name":"网游","parent_id":2,"name":"龙之谷","id":112},{"parent_name":"网游","parent_id":2,"name":"无畏契约","id":329},{"parent_name":"网游","parent_id":2,"name":"传奇","id":695},{"parent_name":"网游","parent_id":2,"name":"冒险岛","id":574},{"parent_name":"网游","parent_id":2,"name":"猎杀对决","id":600},{"parent_name":"网游","parent_id":2,"name":"流放之路","id":551},{"parent_name":"网游","parent_id":2,"name":"命运方舟","id":590},{"parent_name":"网游","parent_id":2,"name":"综合射击","id":601},{"parent_name":"网游","parent_id":2,"name":"黑色沙漠","id":632},{"parent_name":"网游","parent_id":2,"name":"刀塔自走棋","id":239},{"parent_name":"网游","parent_id":2,"name":"DNF","id":78},{"parent_name":"网游","parent_id":2,"name":"战意","id":383},{"parent_name":"网游","parent_id":2,"name":"守望先锋","id":87},{"parent_name":"网游","parent_id":2,"name":"DOTA2","id":92},{"parent_name":"网游","parent_id":2,"name":"FPS沙盒","id":633},{"parent_name":"网游","parent_id":2,"name":"风暴奇侠","id":648},{"parent_name":"网游","parent_id":2,"name":"幻想全明星","id":176},{"parent_name":"网游","parent_id":2,"name":"铁甲雄兵","id":691},{"parent_name":"网游","parent_id":2,"name":"三国杀","id":81},{"parent_name":"网游","parent_id":2,"name":"永劫无间","id":666},{"parent_name":"网游","parent_id":2,"name":"CFHD ","id":472},{"parent_name":"网游","parent_id":2,"name":"QQ三国","id":685},{"parent_name":"网游","parent_id":2,"name":"装甲战争","id":642}],"虚拟主播":[{"parent_name":"虚拟主播","parent_id":9,"name":"全部","id":0},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟Singer","id":744},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟Gamer","id":745},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟声优","id":746},{"parent_name":"虚拟主播","parent_id":9,"name":"TopStar","id":743},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟日常","id":371}],"单机游戏":[{"parent_name":"单机游戏","parent_id":6,"name":"全部","id":0},{"parent_name":"单机游戏","parent_id":6,"name":"原子之心","id":750},{"parent_name":"单机游戏","parent_id":6,"name":"以撒","id":219},{"parent_name":"单机游戏","parent_id":6,"name":"荒野大镖客2","id":226},{"parent_name":"单机游戏","parent_id":6,"name":"双人成行","id":446},{"parent_name":"单机游戏","parent_id":6,"name":"刺客信条","id":227},{"parent_name":"单机游戏","parent_id":6,"name":"霍格沃茨之遗","id":747},{"parent_name":"单机游戏","parent_id":6,"name":"狂野之心","id":748},{"parent_name":"单机游戏","parent_id":6,"name":"独立游戏","id":283},{"parent_name":"单机游戏","parent_id":6,"name":"怀旧游戏","id":237},{"parent_name":"单机游戏","parent_id":6,"name":"格斗游戏","id":433},{"parent_name":"单机游戏","parent_id":6,"name":"胡闹厨房","id":507},{"parent_name":"单机游戏","parent_id":6,"name":"怪物猎人","id":578},{"parent_name":"单机游戏","parent_id":6,"name":"重生细胞","id":426},{"parent_name":"单机游戏","parent_id":6,"name":"盗贼之海","id":341},{"parent_name":"单机游戏","parent_id":6,"name":"暖雪","id":582},{"parent_name":"单机游戏","parent_id":6,"name":"NBA2K","id":362},{"parent_name":"单机游戏","parent_id":6,"name":"消逝的光芒2","id":586},{"parent_name":"单机游戏","parent_id":6,"name":"恋爱模拟游戏","id":592},{"parent_name":"单机游戏","parent_id":6,"name":"饥荒","id":218},{"parent_name":"单机游戏","parent_id":6,"name":"策略游戏","id":570},{"parent_name":"单机游戏","parent_id":6,"name":"卧龙：苍天陨落","id":700},{"parent_name":"单机游戏","parent_id":6,"name":"全面坦克战略官","id":758},{"parent_name":"单机游戏","parent_id":6,"name":"弹幕互动玩法","id":460},{"parent_name":"单机游戏","parent_id":6,"name":"暗黑破坏神","id":535},{"parent_name":"单机游戏","parent_id":6,"name":"全境封锁2","id":243},{"parent_name":"单机游戏","parent_id":6,"name":"禁闭求生","id":707},{"parent_name":"单机游戏","parent_id":6,"name":"帝国时代4","id":548},{"parent_name":"单机游戏","parent_id":6,"name":"边境","id":763},{"parent_name":"单机游戏","parent_id":6,"name":"战神","id":579},{"parent_name":"单机游戏","parent_id":6,"name":"全面战争：战锤3","id":594},{"parent_name":"单机游戏","parent_id":6,"name":"无主之地3","id":273},{"parent_name":"单机游戏","parent_id":6,"name":"辐射76","id":220},{"parent_name":"单机游戏","parent_id":6,"name":"红色警戒2","id":693},{"parent_name":"单机游戏","parent_id":6,"name":"不羁联盟","id":764},{"parent_name":"单机游戏","parent_id":6,"name":"糖豆人","id":357},{"parent_name":"单机游戏","parent_id":6,"name":"霓虹序列","id":766},{"parent_name":"单机游戏","parent_id":6,"name":"战锤40K:暗潮","id":723},{"parent_name":"单机游戏","parent_id":6,"name":"Dread Hunger","id":591},{"parent_name":"单机游戏","parent_id":6,"name":"森林之子","id":751},{"parent_name":"单机游戏","parent_id":6,"name":"聚会游戏","id":636},{"parent_name":"单机游戏","parent_id":6,"name":"生化危机","id":721},{"parent_name":"单机游戏","parent_id":6,"name":"方舟","id":295},{"parent_name":"单机游戏","parent_id":6,"name":"艾尔登法环","id":555},{"parent_name":"单机游戏","parent_id":6,"name":"歧路旅人2","id":752},{"parent_name":"单机游戏","parent_id":6,"name":"Roblox","id":753},{"parent_name":"单机游戏","parent_id":6,"name":"只狼","id":245},{"parent_name":"单机游戏","parent_id":6,"name":"风帆纪元","id":739},{"parent_name":"单机游戏","parent_id":6,"name":"其他单机","id":235},{"parent_name":"单机游戏","parent_id":6,"name":"游戏速通","id":678},{"parent_name":"单机游戏","parent_id":6,"name":"恐怖游戏","id":276},{"parent_name":"单机游戏","parent_id":6,"name":"恐鬼症","id":387},{"parent_name":"单机游戏","parent_id":6,"name":"使命召唤19","id":282},{"parent_name":"单机游戏","parent_id":6,"name":"我的世界","id":216},{"parent_name":"单机游戏","parent_id":6,"name":"仁王2","id":313},{"parent_name":"单机游戏","parent_id":6,"name":"THE FINALS","id":754},{"parent_name":"单机游戏","parent_id":6,"name":"FORZA 极限竞速","id":302},{"parent_name":"单机游戏","parent_id":6,"name":"全面战争","id":257},{"parent_name":"单机游戏","parent_id":6,"name":"塞尔达传说","id":308},{"parent_name":"单机游戏","parent_id":6,"name":"鬼泣5","id":244},{"parent_name":"单机游戏","parent_id":6,"name":"法外枭雄:滚石城","id":757},{"parent_name":"单机游戏","parent_id":6,"name":"SIFU","id":587},{"parent_name":"单机游戏","parent_id":6,"name":"FIFA23","id":708},{"parent_name":"单机游戏","parent_id":6,"name":"命运2","id":277},{"parent_name":"单机游戏","parent_id":6,"name":"精灵宝可梦","id":228},{"parent_name":"单机游戏","parent_id":6,"name":"文字游戏","id":583},{"parent_name":"单机游戏","parent_id":6,"name":"主机游戏","id":236},{"parent_name":"单机游戏","parent_id":6,"name":"植物大战僵尸","id":309},{"parent_name":"单机游戏","parent_id":6,"name":"人类一败涂地","id":270},{"parent_name":"单机游戏","parent_id":6,"name":"战地风云","id":597},{"parent_name":"单机游戏","parent_id":6,"name":"骑马与砍杀","id":326},{"parent_name":"单机游戏","parent_id":6,"name":"泰拉瑞亚","id":593},{"parent_name":"单机游戏","parent_id":6,"name":"体育游戏","id":500},{"parent_name":"单机游戏","parent_id":6,"name":"宝可梦集换式卡牌游戏","id":720},{"parent_name":"单机游戏","parent_id":6,"name":"斯普拉遁3","id":694},{"parent_name":"单机游戏","parent_id":6,"name":"枪火重生","id":364}],"知识":[{"parent_name":"知识","parent_id":11,"name":"全部","id":0},{"parent_name":"知识","parent_id":11,"name":"科学科普","id":701},{"parent_name":"知识","parent_id":11,"name":"社科法律心理","id":376},{"parent_name":"知识","parent_id":11,"name":"职场·技能","id":377},{"parent_name":"知识","parent_id":11,"name":"科技","id":375},{"parent_name":"知识","parent_id":11,"name":"人文历史","id":702},{"parent_name":"知识","parent_id":11,"name":"校园学习","id":372}]}`),
                sPartitionSelectID: 0,
                sPartitionSelect: {},
                sPartitionObjList: [],//子分区
                partitionPage: 1,
                otherLoadMoreIf: false,//加载更多按钮销毁或显示
                loadedPartition: {},//用于记录上一次加载的直播列表数据
                findOtherListRoomKey: "",
                siftOtherLiveTypeSelect: "upName",
                siftOtherLiveTypeList: ["upName", "uid", "title", "roomId"],
                hRecoveryOtherLiveListIf: false,//恢复列表
            },
            methods: {
                getSPartitionSelect(id) {//通过id查找对应子分区列表中符合条件的项目
                    return this.sPartitionObjList.find(value => value.id === id);
                },
                loadFollowLst() {//加载关注列表中正在直播的用户列表api数据
                    const sessdata = LocalData.getSESSDATA();
                    if (sessdata === null) {
                       Tip.error("用户未配置sessdata！");
                        return;
                    }
                    Tip.success("用户配置了sessdata");
                    this.isLoadFollowLstDisabled = true;
                    this.listOfFollowers = [];//清空列表
                    const promise = Live.loadAddAllFollowDataList(this.listOfFollowers, sessdata);
                    promise.then(() => {
                        LiveLayoutVue.listOfFollowers = this.listOfFollowers;
                        Tip.success(`已临时保存关注列表中正在直播的用户列表，可使用搜索对其进行筛选`);
                    }).finally(() => {
                        this.loadFollowButText = "重新加载";
                        this.isLoadFollowLstDisabled = false;
                    });
                },
                hRecoveryListOfFollowersBut() {
                    this.listOfFollowers = LiveLayoutVue.listOfFollowers;
                    Tip.success(`已恢复关注中正在直播的用户列表`);
                },
                //其他分区直播列表
                loadOtherPartitionLiveListBut() {//加载其他分区直播列表
                    const id = this.sPartitionSelectID;
                    const sPartition = this.getSPartitionSelect(id);
                    const parentId = sPartition["parent_id"];
                    if (!confirm(`是要加载${sPartition["parent_name"]} 的子分区 ${sPartition.name} 吗？`)) return;
                    const loading = Tip.loading(`正在获取中！`);
                    const promise = Live.getOthersAreWorkingLiveDataList(parentId, id);
                    promise.then(value => {
                        if (!value.partitionBool) {
                            this.otherLoadMoreIf = true;
                        }
                        this.partitionPage++;//默认第一次加载成功加1，为2
                        this.loadedPartition = sPartition;
                        const info = value["info"];
                        if (info) {
                            Tip.error(`info:${info}`);
                        }
                        const tempList = value.dataList;
                        this.otherLiveRoomList = tempList;//清空列表并赋予新表
                        LiveLayoutVue.otherLiveRoomList = tempList;
                        Tip.success(`获取成功！已获取到${tempList.length}个直播间`);
                    }).catch(reason => {
                        Tip.error(reason.errorText);
                        console.log(reason.err);
                    }).finally(() => {
                        loading.close();
                    });
                },
                otherLoadMoreBut() {
                    const id = this.sPartitionSelectID;
                    const sPartition = this.getSPartitionSelect(id);
                    const parentId = sPartition["parent_id"];
                    const loading = Tip.loading(`正在获取更多！`);
                    const promise = Live.getOthersAreWorkingLiveDataList(parentId, id, this.partitionPage);
                    promise.then(value => {
                        if (value.partitionBool) {
                            this.otherLoadMoreIf = false;
                        }
                        this.partitionPage++;//下一轮之后的则是新的一页
                        const loadedPartition = this.loadedPartition;
                        if (!Util.objEquals(loadedPartition, sPartition, ["parent_name", "parent_id", "name", "id"])) {
                            this.otherLiveRoomList = [];//不相同时清空列表
                            LiveLayoutVue.otherLiveRoomList = [];
                        }
                        const info = value["info"];
                        if (info) {
                            Tip.error(`info:${info}`);
                        }
                        /**
                         * 当两者数组长度不相同说明otherLiveRoomList应该是用户搜索过后过滤显示的内容
                         * 此时加载更多需要将原先的数组内容补上并在后面合并
                         */
                        if (this.otherLiveRoomList.length !== LiveLayoutVue.otherLiveRoomList.length) {
                            this.otherLiveRoomList = LiveLayoutVue.otherLiveRoomList;
                        }
                        const dataList = value.dataList;
                        //这里合并新数组的内容
                        Util.mergeArrays(this.otherLiveRoomList, dataList);
                        LiveLayoutVue.otherLiveRoomList = this.otherLiveRoomList;
                        Tip.success(`获取成功！已获取到${dataList.length}个直播间，累计${this.otherLiveRoomList.length}个直播间`);
                    }).catch(reason => {
                        Tip.error(reason.errorText);
                        console.log(reason.err);
                    }).finally(() => {
                        loading.close();
                    });
                },
                hRecoveryOtherLiveRoomListBut() {
                    this.otherLiveRoomList = LiveLayoutVue.otherLiveRoomList;
                    Tip.success(`已恢复其他分区正在直播的列表`);
                },
                godchildPartitionsSpecifiedParentPartition(parentPartitionName, title) {//查找指定父分区的子分区
                    const list = this.partitionObjList[parentPartitionName];
                    for (let value of list) {
                        if (!value.name.includes(title)) {
                            continue;
                        }
                        return value;
                    }
                    return null;
                },
                findThisSubPartitionBut() {//查询当前父分区中指定的子分区
                    const parentName = this.mainPartitionSelect;
                    let input = prompt(`请输入您要查询父分区${parentName}的子分区名是什么(可模糊匹配，仅匹配第一个)`);
                    if (input === null) return;
                    input = input.trim();
                    if (input === "") {
                        Tip.error("请正确书写！");
                        return;
                    }
                    const subPartition = this.godchildPartitionsSpecifiedParentPartition(parentName, input);
                    if (subPartition === null) {
                        alert(`未在父分区${parentName}查询到子分区 ${input} ！`);
                        return;
                    }
                    this.sPartitionSelect = subPartition;
                    this.sPartitionSelectID = subPartition.id;
                    Tip.success(`已在父分区${parentName}查询到子分区${subPartition.name} ！`);
                },
                findSubPartitionBut() {
                    let input = prompt(`请输入您要查询的子分区名是什么(可模糊匹配，仅匹配第一个)`);
                    if (input === null) return;
                    input = input.trim();
                    if (input === "") {
                        Tip.error("请正确书写！");
                        return;
                    }
                    const objList = this.partitionObjList;
                    let obj = null;
                    for (const key in objList) {
                        const tempObj = this.godchildPartitionsSpecifiedParentPartition(key, input);
                        if (tempObj === null) continue;
                        obj = tempObj;
                        break;
                    }
                    if (obj === null) {
                        alert(`未查询到子分区 ${input} ！`);
                        return;
                    }
                    Tip.success(`已在父分区${obj["parent_name"]}查询到子分区${obj.name} ！`);
                    this.mainPartitionSelect = obj["parent_name"];
                    this.sPartitionSelect = obj;
                    //代码在延迟 50 毫秒后执行，为了确保在 Vue.js 的下一个渲染周期中更新这个数据属性的值。这样做是为了避免在同一个渲染周期中进行数据修改，以确保 Vue.js 的响应式系统能够正确地追踪数据的变化并更新视图。
                    setTimeout(() => this.sPartitionSelectID = obj.id, 50);
                },
                openPartitionWebAddressBut() {
                    const partition = this.sPartitionSelect;
                    if (!confirm(`是要打开${partition["parent_name"]} 的子分区 ${partition.name} 吗？`)) return;
                    Util.openWindow(`https://live.bilibili.com/p/eden/area-tags?areaId=${partition.id}&parentAreaId=${partition["parent_id"]}`);
                },
            },
            watch: {
                findFollowListRoomKey(newVal) {
                    if (newVal === "") return;
                    const tempList = [];
                    for (const v of LiveLayoutVue.listOfFollowers) {
                        if (!v[this.siftTypeSelect].toString().includes(newVal)) {
                            continue;
                        }
                        tempList.push(v);
                    }
                    const tempSize = tempList.length;
                    if (tempSize === 0) {
                        Tip.error(`未搜索到正在直播中用户名包含关键词 ${newVal} 的用户！`);
                        return;
                    }
                    this.listOfFollowers = tempList;
                    this.hRecoveryListOfFollowersIf = true;
                    Tip.success(`已搜索到${tempSize}个符合搜索关键词的项目！`);
                },
                mainPartitionSelect(newVal) {
                    this.sPartitionObjList = this.partitionObjList[newVal];
                    this.sPartitionSelect = this.sPartitionObjList[0];
                },
                sPartitionSelectID(newVal) {
                    this.sPartitionSelect = this.getSPartitionSelect(newVal);
                },
                findOtherListRoomKey(newVal) {
                    if (newVal === "") return;
                    const tempList = [];
                    for (const v of LiveLayoutVue.otherLiveRoomList) {
                        if (!v[this.siftOtherLiveTypeSelect].toString().includes(newVal)) {
                            continue;
                        }
                        tempList.push(v);
                    }
                    const tempSize = tempList.length;
                    if (tempSize === 0) {
                        Tip.error(`未搜索到正在直播中用户名包含关键词 ${newVal} 的用户！`);
                        return;
                    }
                    this.hRecoveryOtherLiveListIf = true;
                    this.otherLiveRoomList = tempList;
                    Tip.success(`已搜索到${tempSize}个符合搜索关键词的项目！`);
                }
            },
            created() {
                this.sPartitionObjList = this.partitionObjList[this.mainPartitionSelect];
                this.sPartitionSelect = this.sPartitionObjList[0];
            }
        });
        return function () {
            return vue;
        }
    }
}

const LookAtItLater = {
    returnVue() {
        const listVue = new Vue({
            el: "#lookAtItLaterListLayout",
            data: {
                subThis: null,
                lookAtItLaterList: LocalData.getLookAtItLaterArr(),
                typeList: ["upName", "uid", "title", "bv"],
                inputOutSelect: "导出稍后再看列表",
                inputOutSelectArr: ["导出稍后再看列表", "导入稍后再看列表"],
                inputEditContent: "",
                isInputSelect: false,
                isAddToInput: true,
                isAddToInputTxt: "追加导入"
            },
            methods: {
                addVideoItemDataBut() {
                    //TODO 后续开发
                    alert("未开发");
                },
                setSubThis(val) {
                    this.subThis = val;
                },
                searchKey(newValue, oldValue) {
                    if (newValue === oldValue || newValue === "") return;
                    const tempList = [];
                    for (const value of LocalData.getLookAtItLaterArr()) {
                        if (!value[this.subThis.tempFindListType].toString().includes(newValue)) {
                            continue;
                        }
                        tempList.push(value);
                    }
                    const length = tempList.length;
                    if (length === 0) {
                       Tip.error("未搜索到指定内容的元素");
                        return;
                    }
                    this.subThis.showList = [];
                    tempList.forEach(value => this.subThis.showList.push(value));
                    Tip.success(`已搜索到${length}个符合搜索关键词的项目！`);
                },
                outLookAtItLaterArr() {//导出稍后再看列表数据
                    Util.fileDownload(JSON.stringify(LocalData.getLookAtItLaterArr(), null, 3), `稍后再看列表${Util.toTimeString()}.json`);
                },
                isStringArray(strArray) {
                    if (strArray.startsWith("[") && strArray.endsWith("]")) {
                        const parse = JSON.parse(strArray);
                        if (parse.length === 0) {
                            Tip.error("数组未有内容！");
                            return null;
                        }
                        return parse;
                    }
                    Tip.error("内容不是json数组！");
                    return null;
                },
                inputAddToLookAtItLaterArr() {//追加导入稍后再看列表数据
                    let s = this.inputEditContent;
                    const parse = this.isStringArray(s);
                    if (parse === null) return false;
                    const tempList = LocalData.getLookAtItLaterArr();
                    try {
                        for (let v of parse) {
                            if (LookAtItLater.isVarTitleLookAtItLaterList("bv", tempList, v)) {
                                continue;
                            }
                            tempList.push({
                                title: v.title,
                                upName: v.upName,
                                uid: v.uid,
                                bv: v.bv
                            })
                        }
                    } catch (e) {
                        console.log(tempList);
                        console.log(e);
                        alert("数组异常!,异常信息已打印在控制台上！");
                        return false;
                    }
                    if (!confirm("是否要保存本轮追加操作结果？")) {
                        return false;
                    }
                    LocalData.setLookAtItLaterArr(tempList);
                    Tip.success("追加数据成功！");
                    console.table(tempList);
                    return true;
                },
                inputCoverLookAtItLaterArr() {//覆盖导入稍后再看列表数据
                    let s = this.inputEditContent;
                    const parse = this.isStringArray(s);
                    if (parse === null) return false;
                    const isKeyArr = ["upName", "uid", "title", "bv"];
                    for (const value of parse) {
                        if (Util.hasAllProperties(value, isKeyArr)) {
                            continue;
                        }
                        alert(`数组内容对应的项目缺少了相关属性\n项目：\n${JSON.stringify(value)}`);
                        return false;
                    }
                    if (!confirm("是否要保存本轮覆盖操作结果？")) {
                        return false;
                    }
                    LocalData.setLookAtItLaterArr(parse);
                    Tip.success("覆盖数据成功！");
                    console.table(parse);
                    return true;
                },
                renovateLayoutItemList() {
                    this.subThis.showList = LocalData.getLookAtItLaterArr();
                },
                okOutOrInputClick() {
                    if (this.inputOutSelect === "导出稍后再看列表") {
                        this.outLookAtItLaterArr();
                        return;
                    }
                    if (!confirm(`是要执行${this.isAddToInputTxt}吗？`)) return;
                    let loop = false;
                    if (this.isAddToInput) {//追加
                        loop = this.inputAddToLookAtItLaterArr();
                    } else {
                        loop = this.inputCoverLookAtItLaterArr();//覆盖
                    }
                    if (loop === true) {
                        this.renovateLayoutItemList();
                    }
                },
                clearLookAtItLaterArr() {
                    if (!confirm("您确定要进行清空本地脚本存储的稍后再看列表数据吗，清空之后无法复原，除非您有导出过清空前的数据，请谨慎考虑，是要继续执行清空操作吗？")) return;
                    LocalData.setLookAtItLaterArr([]);
                    this.subThis.showList = this.lookAtItLaterList = [];
                    Tip.success("已清空本地脚本存储的稍后再看列表数据");
                },
                getItemFindIndex(data) {
                    const index = this.lookAtItLaterList.findIndex(value => value === data);
                    if (index === -1) {
                        Tip.error(`查找列表中指定item失败!-1`);
                        return null;
                    }
                    if (!confirm(`是要对 ${data.title} 选项进行操作吗？\nbv:${data.bv}`)) {
                        return null;
                    }
                    return index;
                },
                delListItem(data) {
                    const index = this.getItemFindIndex(data);
                    if (index === null) return;
                    this.lookAtItLaterList.splice(index, 1);
                    const isKeyArr = ["upName", "uid", "title", "bv"];
                    const tempLookAtItLaterArr = LocalData.getLookAtItLaterArr();
                    const tempIndex = tempLookAtItLaterArr.findIndex(value => Util.objEquals(value, data, isKeyArr));
                    if (tempIndex === -1) {
                        Tip.error("查找数据组列表中要删除的item失败！-1");
                        return;
                    }
                    tempLookAtItLaterArr.splice(tempIndex, 1);
                    LocalData.setLookAtItLaterArr(tempLookAtItLaterArr);
                    Tip.success(`已删除 ${data.title} 选项，bv=${data.bv}`);
                },
                /**
                 *
                 * @param {Object}item
                 * @param {string}key
                 * @param {string}keyName
                 * @param {string|number}value
                 */
                setListItem(item, key, keyName, value) {
                    let input = prompt(`原${keyName}为=${value}\n修改${keyName}为`, value);
                    if (input === null) return;
                    input = input.trim();
                    if (input.length < 1) {
                        Tip.error("输入的字符不可小于1！");
                        return;
                    }
                    if (value === input) {
                        Tip.error("输入的值不能和原有的值相同！");
                        return;
                    }
                    if (key === "uid") {
                        if (isNaN(value)) {
                            Tip.error(`输入的uid不是一个数字！`);
                            return;
                        }
                        value = parseInt(value);
                    }
                    const tempLookAtItLaterArr = LocalData.getLookAtItLaterArr();
                    const isKeyArr = ["upName", "uid", "title", "bv"];
                    const tempIndex = tempLookAtItLaterArr.findIndex(value => Util.objEquals(value, item, isKeyArr));
                    if (tempIndex === -1) {
                        Tip.error("查找数据组列表中要修改的item失败！-1");
                        return;
                    }
                    item[key] = input;
                    tempLookAtItLaterArr.splice(tempIndex, 1, item);
                    LocalData.setLookAtItLaterArr(tempLookAtItLaterArr);
                    const tip = `已将${keyName}的值=${value}\n改成=${input}`;
                    Tip.success(tip);
                    alert(tip);
                },
                getBWebLookAtItLaterListBut() {
                    //TODO 待开发
                    debugger;
                    alert("待开发");
                    return;
                    const se = LocalData.getSESSDATA();
                    if (se === null) {
                        alert("未设置SESSDATA！");
                        return;
                    }
                    const promise = HttpUtil.getLookAtItLater(se);
                    promise.then(value => {
                        console.log(value);
                    }).catch(reason => {
                        console.log(reason);
                    });
                }
            },
            watch: {
                inputOutSelect(newVal) {
                    if (newVal === "导出稍后再看列表") {
                        this.isInputSelect = false;
                    } else {
                        this.isInputSelect = true;
                    }
                },
                isAddToInput(newVal) {
                    if (newVal) {
                        this.isAddToInputTxt = "追加导入";
                    } else {
                        this.isAddToInputTxt = "覆盖导入";
                    }
                }
            }
        })
        return function () {
            return listVue;
        };
    },
    isVarTitleLookAtItLaterList(typeV, list, data) {//判断对象是否有相同的指定属性的值
        for (const v of list) {
            if (!(v[typeV] === data[typeV])) {
                continue;
            }
            return true;
        }
        return false;
    },
    addLookAtItLater(data) {//添加视频到稍后再看列表流程
        if (!confirm(`是要将【${data["title"]}】添加进稍后再看列表吗？`)) return;
        const arr = LocalData.getLookAtItLaterArr();
        for (const v of arr) {
            const tempTitle = data["title"];
            if (v["title"] === tempTitle) {
                alert(`您已添加该视频【${tempTitle}】！故本轮不添加进去！`);
                return;
            }
        }
        arr.push(data);
        LocalData.setLookAtItLaterArr(arr);
        Tip.success("添加成功！")
        alert(`已添加视频【${data["title"]}】至稍后再看列表！`);
    }
}

Vue.component("main_layout", {
    template: `
      <div>
      <ul style="display: flex;justify-content: space-around;padding-top: 10px;" id="tabUl">
        <li v-for="(v) in tabList" :key=v.id>
          <button :value="v.id">{{ v.label }}</button>
        </li>
      </ul>
      <div>
        <div v-for="v in tabList" :key=v.id v-bind:id="v.id" :class="{tab:true}"></div>
      </div>
      <hr>
      <footer_layout/>
      </div>`,
    data() {
        return {
            tabList: [
                {id: "panelSetsTheLayout", label: "面板设置"},
                {id: "ruleCRUDLayout", label: "规则增删改查-信息-备份与恢复(导出与导入)"},
                {id: "video_params_layout", label: "视频参数"},
                {id: "liveLayout", label: "直播列表"},
                {id: "lookAtItLaterListLayout", label: "稍后再看列表"},
                {id: "outputInfoLayout", label: "输出信息"},
                {id: "otherLayout", label: "其他"},
                {id: "donateLayout", label: "支持打赏作者"},
                {id: "ruleCenterLayout", label: "规则中心"},
                {id: "accountCenterLayout", label: "账户中心"}

            ]
        }
    }
});

const MainVue = {
    addVue() {
        window.mainVue = new Vue({
            el: "#home_layout",
            data: {
                show: false
            }
        });
    }
}

const OtherLayoutVue = {
    returnVue() {
        window.otherLayoutVue = new Vue({
            el: "#otherLayout",
            data: {
                BWebOpenList: {
                    "稍后再看列表": "https://www.bilibili.com/watchlater/?spm_id_from=333.1007.0.0#/list",
                    "稍后再看播放列表": "https://www.bilibili.com/watchlater",
                    "素材库平台": "coolHome",
                }
            },
            methods: {
                setSgSessdataBut() {
                    const content = prompt("请输入要保存的SESSDATA值");
                    if (content === null) {
                        return;
                    }
                    if (content === "") {
                        LocalData.setSESSDATA(null);
                        return;
                    }
                    if (content.includes(" ") || content.includes("=")) {
                       Tip.error("内容中包含空格或者=，请去除相关符号！");
                        return;
                    }
                    if (!confirm(`要保存的SESSDATA是\n${content}`)) {
                        return;
                    }
                    LocalData.setSESSDATA(content);
                    Tip.success("已设置SESSDATA的值！");
                },
                getSgSessdataBut() {
                    const data = LocalData.getSESSDATA();
                    if (data === null) {
                        const tip = '用户未添加SESSDATA或者已删除存储在脚本的SESSDATA';
                        Tip.error(tip);
                        alert(tip);
                        return;
                    }
                    Tip.success("已将值输出到脚本面板的输出信息上！");
                    Tip.printLn("用户存储在脚本中的SESSDATA，如上一条：");
                    Tip.printLn(data);
                },
                bvToAvBut() {
                    const content = prompt("bv转av号");
                    if (content === null) {
                        return;
                    }
                    if (content.length <= 5) {
                        alert("请正确填写内容！");
                        return;
                    }
                    const dec = window.bilibiliEncoder.dec(content);
                    if (isNaN(dec)) {
                        alert("结果错误！");
                        return;
                    }
                    alert("av" + dec);
                },
                avTObvBut() {
                    let content = prompt("av转bv号");
                    if (content === null) {
                        return;
                    }
                    if (content.startsWith("av") || content.startsWith("AV")) {
                        content = content.substring(2, content.length);
                    }
                    if (content.length < 1 || (isNaN(content))) {
                        alert("请正确填写内容！");
                        return;
                    }
                    const dec = window.bilibiliEncoder.enc(content);
                    if (!dec.startsWith("BV")) {
                        alert("结果错误！");
                        return;
                    }
                    alert(dec);
                },
                openGBTWebBut() {
                    Util.openWindow("http://gbtgame.ysepan.com/");
                },
                openBWeb(item, name) {
                    if (!confirm(`是要前往 ${name} 吗？`)) return;
                    Util.openWindow(item);
                }
            }
        });
    }
};

const PanelSetsTheLayout = {//面板设置
    returnVue() {
        window.panelSetsTheLayoutVue = new Vue({
            el: "#panelSetsTheLayout",
            data: {
                backgroundPellucidRange: 1,
                heightRange: 100,
                heightRangeText: "100%",
                widthRange: 100,
                widthRangeText: "100%",
                isMyButShow: LocalData.isMyButSHow(),
                isDShieldPanel: LocalData.isDShieldPanel(),//是否禁用快捷悬浮屏蔽面板自动显示
                isDShowHidePanel: false,//是否禁用显示隐藏主面板快捷键
                isDShieldPanelFollowMouse: false,//快捷悬浮屏蔽面板是否跟随鼠标
                isFixedPanelValueCheckbox: false,//是否固定快捷悬浮屏蔽面板的值，也有该复选框是否选中的意思
                showKCMap: {
                    dHMainPanel_KC_text: LocalData.localKeyCode.getDHMainPanel_KC(),
                    dTQFSPToTriggerDisplay_KC_text: LocalData.localKeyCode.getDTQFSPToTriggerDisplay_KC(),
                    hideQuickSuspensionBlockButton_KC_text: LocalData.localKeyCode.getHideQuickSuspensionBlockButton_KC(),
                    qFlBBFollowsTheMouse_KC_text: LocalData.localKeyCode.getQFlBBFollowsTheMouse_KC(),
                    fixedQuickSuspensionPanelValue_KC_text: LocalData.localKeyCode.getFixedQuickSuspensionPanelValue_KC()
                }

            },
            methods: {
                __showInputKC(text) {
                    let input = prompt(text, "");
                    if (input === null) return null;
                    input = input.trim();
                    if (input === "") {
                        Tip.error("请输入正确的快捷键");
                        return null;
                    }
                    return input;
                },
                __isPrintKC(kcData, fun) {//临时将就着用的
                    if (!kcData) return;
                    let msg;
                    if (fun) {
                        msg = `已修改快捷键：${kcData}`;
                        Tip.success(msg);
                    } else {
                        msg = "快捷键已被占用，请重新设置！";
                        Tip.error(msg);
                    }
                    console.log(msg);
                    alert(msg);
                },
                setDHMPKCBut() {
                    const kc = this.__showInputKC("请输入显示隐藏主面板的快捷键");
                    this.__isPrintKC(kc, LocalData.localKeyCode.setDHMainPanel_KC(kc));
                },
                setDTQFSPToTDKCBut() {//有用
                    const kc = this.__showInputKC("请输入切换快捷悬浮屏蔽面板自动显示状态的按键");
                    this.__isPrintKC(kc, LocalData.localKeyCode.setDTQFSPToTriggerDisplay_KC(kc));
                },
                setQFlBBFTMouseKCBut() {
                    const kc = this.__showInputKC("请输入快捷悬浮屏蔽面板是否跟随鼠标的快捷键");
                    this.__isPrintKC(kc, LocalData.localKeyCode.setQFlBBFollowsTheMouse_KC(kc));
                },
                setHQSBlockButton_KCBut() {
                    const kc = this.__showInputKC("请输入隐藏快捷悬浮面板的按键");
                    this.__isPrintKC(kc, LocalData.localKeyCode.setHideQuickSuspensionBlockButton_KC(kc));
                },
                setsetFixedQuickSPanelValue_KCBut() {
                    const kc = this.__showInputKC("请输入固定快捷悬浮屏蔽面板的快捷键");
                    this.__isPrintKC(kc, LocalData.localKeyCode.setFixedQuickSuspensionPanelValue_KC(kc));
                }
            },
            watch: {
                isMyButShow(newVal) {
                    LocalData.setMyButShow(newVal);
                    window.isShowVue.show = newVal;
                },
                isDShieldPanel(newVal) {
                    LocalData.setDShieldPanel(newVal);
                    Tip.success(`您更改了【禁用快捷悬浮屏蔽面板自动显示】的状态，当前为：${newVal ? "启用" : "不启用"}状态`);
                },
                isDShowHidePanel(newVal) {

                },
                isDShieldPanelFollowMouse(newVal) {
                    Tip.infoBottomRight(`${newVal ? '启动' : '禁用'}快捷悬浮屏蔽面板跟随鼠标`);
                },
                backgroundPellucidRange(newVal) {
                    const back = Home.background;
                    $("#home_layout").css("background", Util.getRGBA(back.r, back.g, back.b, newVal));
                },
                heightRange(newVal) {
                    this.heightRangeText = newVal + "%";
                    $("#home_layout").css("height", `${newVal}%`);
                },
                widthRange(newVal) {
                    this.widthRangeText = newVal + "%";
                    $("#home_layout").css("width", `${newVal}%`);
                }
            }
        });
    }
}

const RuleCenterLayoutVue = {
    httpGetList() {
        return new Promise((resolve, reject) => {
            const data = {
                code: -1,
                message: "未能成功响应"
            };
            //TODO 后续对下面代码进行调整
            $.ajax({
                type: "GET",
                url: `${defApi}/bilibili/`,
                data: {
                    model: "ruleCenter"
                },
                dataType: "json",
                success({message, code, dataList}) {//上面已声明了json，之后响应体会自动转成json处理
                    data.message = message;
                    data.code = code;
                    if (code !== 1) {
                        reject(data);
                        return;
                    }
                    const tempDataList = [];
                    for (const {name, rule_content, first_push_time, update_time} of dataList) {
                        tempDataList.push({
                            name: name,
                            ruleList: JSON.parse(rule_content),
                            update_time: update_time,
                            first_push_time: first_push_time
                        });
                    }
                    data["dataList"] = tempDataList;
                    resolve(data);
                }, error(xhr, status, error) { //请求失败的回调函数
                    data["xhr"] = xhr;
                    data["status"] = status;
                    data["error"] = error;
                    reject(data);
                }
            });
        })
    },
    returnVue() {
        window.ruleCenterLayoutVue = new Vue({
            el: "#ruleCenterLayout",
            data: {
                list: [],
                isReloadListButShow: false,
            },
            methods: {
                reloadListBut() {
                    const loading = Tip.loading("正在重新加载，请稍等...");
                    this.isReloadListButShow = false;
                    const promise = RuleCenterLayoutVue.httpGetList();
                    promise.then(dataBody => {
                        Tip.success(dataBody.message);
                        this.list = dataBody.dataList;
                        this.isReloadListButShow = true;
                    }).catch(reason => {
                        this.isReloadListButShow = true;
                        debugger;
                        console.log(reason);
                    }).finally(() => {
                        loading.close();
                    });
                }
            }
        });
    }
}

const RuleCRUDLayout = {
    returnVue() {
        window.RuleCRUDLayoutVue = new Vue({
            el: "#ruleCRUDLayout",
            data: {
                modelList: {
                    single: "单个",
                    batch: "批量"
                },
                ruleEditBox: "",//规则编辑框内容
                model: "single",
                isSingleShow: true,//是否对的单个相关按钮进行显示处理
                isBatchShow: false,//是否对批量相关按钮进行显示处理
                ruleKeyList: {
                    userNameArr: {name: "用户名黑名单模式(精确匹配)", size: 0},
                    bvBlacklistArr: {name: "BV号黑名单模式(精确匹配)", size: 0},
                    userNameKeyArr: {name: "用户名黑名单模式(模糊匹配)", size: 0},
                    userUIDArr: {name: "用户uid黑名单模式(精确匹配)", size: 0},
                    userWhiteUIDArr: {name: "用户uid白名单模式(精确匹配)", size: 0},
                    titleKeyArr: {name: "标题黑名单模式(模糊匹配)", size: 0},
                    titleKeyCanonicalArr: {name: "标题黑名单模式(正则匹配)", size: 0},
                    commentOnKeyArr: {name: "评论关键词黑名单模式(模糊匹配)", size: 0},
                    contentOnKeyCanonicalArr: {name: "评论关键词黑名单模式(正则匹配)", size: 0},
                    fanCardArr: {name: "粉丝牌黑名单模式(精确匹配)", size: 0},
                    contentColumnKeyArr: {name: "专栏关键词内容黑名单模式(模糊匹配)", size: 0},
                    dynamicArr: {name: "动态关键词内容黑名单模式(模糊匹配)", size: 0},
                },
                videoRuleList: {
                    filterSMin: "时长最小值(单位秒)",
                    filterSMax: "时长最大值(单位秒)",
                    broadcastMin: "播放量最小值",
                    broadcastMax: "播放量最大值",
                    barrageQuantityMin: "弹幕量最小值",
                    barrageQuantityMax: "弹幕量最大值"
                },
                videoRuleValueInput: "",
                videoSelectValue: "filterSMin",
                defaultSelect: "userUIDArr",//当前下拉框选中的值
                outRuleSelect: "allRuleOutFIle",
                outRUleModelList: {
                    allRuleOutFIle: "全部规则到文件",
                    allRuleOutShearPlate: "全部规则到剪贴板",
                    allUIDRuleOutFIle: "全部UID规则到文件",
                    barrageShieldingRule: "b站弹幕屏蔽规则",
                    allRuleOutCloudServer: "全部规则到云端账号"
                },
                inputRuleSelect: "从下面编辑框导入全部规则",
                inputEditContent: "",
                inoutRUleModelList: ["从云端账号导入覆盖本地规则", "从下面编辑框导入全部规则", "从下面编辑框合并导入UID规则"],
                isInputEditShow: true
            },
            methods: {
                add() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                       Tip.error('出现了意外的类型bug:155532');
                        return;
                    }
                    UrleCrud.addShow(selectRUleItem.ruleType, selectRUleItem.ruleName)
                },
                addAll() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                        Tip.error('出现了意外的类型bug:155533');
                        return;
                    }
                    const content = this.ruleEditBox;
                    if (content === null) return;
                    if (content === "") {
                        Tip.error("请输入正确的内容！");
                        return;
                    }
                    UrleCrud.addAllShow(selectRUleItem.ruleType, selectRUleItem.ruleName, content);
                },
                delAll() {
                    const list = this.ruleKeyList;
                    let str = "";
                    for (let key in list) {
                        const name = list[key].name;
                        const size = Util.getData(key, []).length;
                        str += `规则名:${name} 个数:${size}个\n`;
                    }
                    if (!confirm(`是要全部规则吗？，以下是您的全部规则基本信息\n\n${str}`)) {
                        return;
                    }
                    const okData = {success: 0, fail: 0};
                    for (const key in this.ruleKeyList) {
                        if (Util.delData(key)) {
                            okData.success++;
                        } else {
                            okData.fail++;
                        }
                    }
                    this.updateRuleIndex();
                    alert(`删除结果:\n成功:${okData.success}\n失败:${okData.fail}`);
                },
                delItem() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                        Tip.error('出现了意外的类型bug:155535');
                        return;
                    }
                    UrleCrud.delItemShow(selectRUleItem.ruleType, selectRUleItem.ruleName);
                },
                delKey() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                        Tip.error('出现了意外的类型bug:155537');
                        return;
                    }
                    UrleCrud.delShow(selectRUleItem.ruleType, selectRUleItem.ruleName);
                },
                findKey() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                        Tip.error('出现了意外的类型bug:155536');
                        return;
                    }
                    UrleCrud.findKeyShow(selectRUleItem.ruleType, selectRUleItem.ruleName);
                },
                setKey() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                        Tip.error('出现了意外的类型bug:155537');
                        return;
                    }
                    UrleCrud.setKeyShow(selectRUleItem.ruleType, selectRUleItem.ruleName);
                },
                okVideoSelectBut() {//确定时长播放量弹幕
                    const videoSelectType = this.videoSelectValue;
                    const videoSelectName = this.videoRuleList[videoSelectType];
                    const contentInput = this.videoRuleValueInput;
                    if (contentInput === "") return;
                    Util.setData(videoSelectType, parseInt(contentInput));
                    const info = `已设置${videoSelectName}的具体值【${contentInput}】，为0则不生效`;
                    Tip.printLn(info);
                    Tip.success(info);
                },
                getSelectRUleItem() {//返回defaultSelect中选中的规则项
                    const ruleType = this.defaultSelect;
                    const ruleName = this.ruleKeyList[ruleType].name;
                    return {ruleType: ruleType, ruleName: ruleName}
                },
                updateRuleIndex() {//更新规则的个数
                    const tempList = this.ruleKeyList;
                    for (let item in tempList) {
                        const tempSize = tempList[item].size;
                        const newSize = Util.getData(item, []).length;
                        if (tempSize === newSize) {
                            continue;
                        }
                        tempList[item].size = newSize;
                    }
                },
                getOutRuleDataFormat(space = 3) {//获取导出规则的结果内容
                    const ruleKeyList = this.ruleKeyList;
                    const data = {};
                    for (let key in ruleKeyList) {
                        const ruleName = ruleKeyList[key].name;
                        data[ruleName] = Util.getData(key, []);
                    }
                    return JSON.stringify(data, null, space);
                },
                inputRuleLocalData(json) {//导入规则内容！
                    const list = this.ruleKeyList;
                    for (let ruleKey in list) {
                        const name = list[ruleKey].name;
                        const jsonRuleList = json[name];
                        if (!jsonRuleList) {
                            continue;
                        }
                        if (jsonRuleList.length === 0) {
                            continue;
                        }
                        Util.setData(ruleKey, jsonRuleList);
                    }
                    this.updateRuleIndex();
                    alert("已导入");
                },
                outRule() {
                    const outType = this.outRUleModelList[this.outRuleSelect];
                    switch (outType) {
                        case "全部规则到文件":
                            let fileName = "规则-" + Util.toTimeString();
                            const s = prompt("保存为", fileName);
                            if (s === null) return;
                            if (!(s.includes(" ") || s === "" || s.length === 0)) fileName = s;
                            Util.fileDownload(this.getOutRuleDataFormat(), fileName + ".json");
                            break;
                        case "全部规则到剪贴板":
                            Util.copyToClip(this.getOutRuleDataFormat(0));
                            break;
                        case "全部UID规则到文件":
                            const list = LocalData.getArrUID();
                            Util.fileDownload(JSON.stringify(list, null, 3), `UID规则-${list.length}个.json`);
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
                            if (!confirm("确定要将本地规则导出到对应账号的云端上吗")) return;
                            const loading = Tip.loading("请稍等...");
                            $.ajax({
                                type: "POST",
                                url: `${defApi}/bilibili/`,
                                data: {
                                    model: "All",
                                    userName: getInfo["name"],
                                    userPassword: getInfo["pwd"],
                                    postData: this.getOutRuleDataFormat()
                                },
                                dataType: "json",
                                success({code, message}) {
                                    debugger;
                                    loading.close();
                                    if (code !== 1) {
                                        Tip.error(message);
                                        return;
                                    }
                                    Tip.success(message);
                                }, error(xhr, status, error) { //请求失败的回调函数
                                    loading.close();
                                    console.log(error);
                                    console.log(status);
                                }
                            });
                            break;
                        case "b站弹幕屏蔽规则": {
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
                            Util.fileDownload(JSON.stringify(list, null, 3), "b站账号弹幕屏蔽设定规则.json");
                            break;
                        }
                    }
                },
                inputRule() {
                    const inputType = this.inputRuleSelect;
                    const content = this.inputEditContent;
                    switch (inputType) {
                        case "从云端账号导入覆盖本地规则":
                            const getInfo = LocalData.AccountCenter.getInfo();
                            if (getInfo === {} || Object.keys(getInfo).length === 0) {
                                alert("请先登录在进行操作.");
                                return;
                            }
                            if (!confirm("确定要云端账号对应的规则导入并覆盖到本地已有的规则吗？")) {
                                return;
                            }
                            const loading = Tip.loading("请稍等...");
                            $.ajax({
                                type: "GET",
                                url: `${defApi}/bilibili/`,
                                data: {
                                    model: "getUsers",
                                    userName: getInfo["name"],
                                    userPassword: getInfo["pwd"]
                                },
                                dataType: "json",
                                success({message, code, data}) {
                                    loading.close();
                                    if (code !== 1) {
                                        Tip.error(message);
                                        return;
                                    }
                                    Tip.success(message);
                                    const {rule_content} = data;
                                    window.RuleCRUDLayoutVue.inputRuleLocalData(JSON.parse(rule_content));
                                }, error(xhr, status, error) { //请求失败的回调函数
                                    loading.close();
                                    console.log(error);
                                    console.log(status);
                                }
                            });
                            break;
                        case "从下面编辑框导入全部规则":
                            if (content === "" || content === " ") {
                                alert("请填写正确的规则样式！");
                                return;
                            }
                            if (!confirm("需要注意的是，这一步操作会覆盖你当前的已有规则！您确定要导入吗？")) {
                                return;
                            }
                            let jsonRule = [];
                            try {
                                jsonRule = JSON.parse(content);
                            } catch (error) {
                                alert("内容格式错误！" + error)
                                return;
                            }
                            this.inputRuleLocalData(jsonRule);
                            break;
                        case "从下面编辑框合并导入UID规则":
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
                        default:
                            alert(`出现超出的条件！inputType=${inputType}`);
                            break;
                    }
                },
                lookLocalRUleContent() {
                    Util.openWindowWriteContent(this.getOutRuleDataFormat(3));
                },
                lookLocalAppointRUleContent() {
                    const item = this.getSelectRUleItem();
                    if (!confirm(`是要查询${item.ruleName}的规则内容吗？`)) return;
                    const data = Util.getData(item.ruleType, []);
                    if (data.length === 0) {
                        Tip.info(`${item.ruleName}规则内容为空的！`);
                        return;
                    }
                    Util.openWindowWriteContent(JSON.stringify(data, null, 3));
                }
            },
            watch: {
                model(newVal, oldVal) {
                    if (newVal === oldVal) return;
                    if (newVal === "single") {
                        this.isBatchShow = false;
                        this.isSingleShow = true;
                    } else {
                        this.isBatchShow = true;
                        this.isSingleShow = false;
                    }
                },
                inputRuleSelect(newVal, oldVal) {
                    if (newVal === oldVal) return;
                    this.isInputEditShow = newVal !== "从云端账号导入覆盖本地规则";
                },
            },
            created() {
                this.updateRuleIndex();
            }
        });
    }
}

const SpaceControlPanelVue = {//空间主页左侧控制面板
    returnVue() {
        const vue = new Vue({
            el: "#id13315",
            data: {
                userUid: Util.getSubUid(href.split("/")[3]),
                userName: "",
                //当前用户空间是否是自己的空间主页
                isHAction: Space.isH_action(),
                tabsItemName: "",
                getDataListButText: "",
                getAllDataListButText: "",
                addUidButShow: true,
                addNameButShow: true,
                getDataListButShow: false,
                getAllDataListButShow: false
            },
            methods: {
                setDataListButText(text) {
                    this.getDataListButText = text;
                },
                setAllDataListButText(text) {
                    this.getAllDataListButText = text;
                },
                addUidBut() {
                    UrleCrud.addShow("userUIDArr", "用户uid黑名单模式(精确匹配)", this.userUid);
                },
                addNameBut() {
                    UrleCrud.addShow("userNameArr", "用户名黑名单模式(精确匹配)", this.userName);
                },
                async getDataListBut() {
                    let dataList, fileName;
                    const userName = this.userName;
                    switch (this.tabsItemName) {
                        case "投稿":
                            const tabTypeName = Space.video.getLeftTabTypeName();
                            switch (tabTypeName) {
                                case "视频":
                                    dataList = Space.video.getDataList();
                                    break;
                                case "专栏":
                                    dataList = Space.article.getdataList();
                                    break;
                                case "相簿":
                                    dataList = Space.album.getdataList();
                                    break;
                                default:
                                    alert(`暂不支持获取${tabTypeName}的数据！`);
                                    return;
                            }
                            fileName = `获取用户${userName}${Space.video.getSortText()}的${Space.video.getVideoType()}${this.tabsItemName}${tabTypeName}列表`;
                            break;
                        case "收藏":
                            const fav = Space.fav;
                            const favName = fav.getFavName();
                            const authorName = fav.getAuthorName();
                            const favID = fav.getFavID();
                            const favtype = fav.getFavtype();
                            if (!confirm(`获取【${authorName}】用户【${favName}】收藏夹当前显示的内容，是要获取吗？`)) {
                                return;
                            }
                            const input = prompt(`请选择获取的模式\n输入单个数字0为：页面自动化操作模式进行获取\n1为：网络请求模式获取，比页面自动化操作模式多3个结果参数（头像、uid、弹幕量）`);
                            if (input === null) return;
                            fileName = `${authorName}的${favName}收藏夹列表`;
                            if (input === "0") {
                                dataList = fav.getDataList();
                                break;
                            }
                            if (input === "1") {
                                const loading = Tip.loading("正在获取中！");
                                if (favtype === "collect") {//用户收藏其他用户收藏夹
                                    alert("暂不支持通过网络请求方式只获取当前页收藏夹列表，如需网络请求方式，请使用【获取收藏的列表数据】功能！或者使用【页面自动化操作模式】");
                                    loading.close();
                                    return;
                                }
                                const data = await fav.getHttpUserCreationDataList(favID)
                                loading.close();
                                if (!data["state"]) {
                                    Tip.error("获取失败!");
                                    return;
                                }
                                dataList = data["dataList"];
                            } else {
                                Tip.error("输入了意外的值！" + input);
                                return;
                            }
                            break;
                        case "订阅":
                            const tempTabsName = Space.subscribe.getTabsName();
                            if (tempTabsName === "标签") {
                                dataList = Space.subscribe.subs.getdataList();
                                fileName = `${userName}的订阅标签`;
                                break;
                            }
                            dataList = Space.subscribe.bangumiAndCinema.getdataList();
                            fileName = `${userName}订阅的${tempTabsName}列表`;
                            break;
                        case "关注数":
                        case "粉丝数":
                            dataList = Space.followAndFans.getdataList();
                            fileName = `${userName}的用户${this.tabsItemName}列表.json`;
                            break;
                        default:
                            alert("出现意外的参数！" + this.tabsItemName);
                            return;
                    }
                    const info = "获取到个数：" + dataList.length;
                    Tip.success(info);
                    console.log(info);
                    console.log(dataList);
                    alert(info);
                    Util.fileDownload(JSON.stringify(dataList, null, 3), `${fileName}[${dataList.length}个].json`);
                },
                async getAllDataListBut() {
                    const tabName = this.tabsItemName;
                    const userName = this.userName;
                    if (Space.isFetchingFollowersOrWatchlists) {
                        Tip.error("请等待获取完！");
                        return;
                    }
                    Space.isFetchingFollowersOrWatchlists = true;
                    const loading = Tip.loading(`正在获取 ${userName} 的${tabName}列表数据中，请不要轻易动当前页面内容`);
                    let fileName, dataList;
                    switch (tabName) {
                        case "投稿":
                            const tabTypeName = Space.video.getLeftTabTypeName();
                            switch (tabTypeName) {
                                case "视频":
                                    dataList = await Space.video.getAllDataList();
                                    break;
                                case "专栏":
                                    dataList = await Space.article.getAllDataList();
                                    break;
                                case "相簿":
                                    dataList = await Space.album.getAllDataList();
                                    break;
                                default:
                                    loading.close();
                                    alert(`暂不支持获取${tabTypeName}的数据！`);
                                    break;
                            }
                            fileName = `获取用户${userName}${Space.video.getSortText()}的${Space.video.getVideoType()}${tabName}${tabTypeName}列表`;
                            break;
                        case"收藏":
                            const fav = Space.fav;
                            const favName = fav.getFavName();
                            const authorName = fav.getAuthorName();
                            const favID = fav.getFavID();
                            if (!confirm(`是要获取收藏夹创建者【${authorName}】用户【${favName}】的收藏夹所有的内容吗？`)) {
                                Space.isFetchingFollowersOrWatchlists = false;
                                loading.close();
                                return;
                            }
                            const input = prompt(`请选择获取的模式\n输入单个数字0为：页面自动化操作模式进行获取\n1为：网络请求模式获取，比页面自动化操作模式多3个结果参数（头像、uid、弹幕量）`);
                            if (input === null) {
                                loading.close();
                                return;
                            }
                            fileName = `${authorName}的${favName}收藏夹列表`;
                            if (input === "0") {
                                dataList = await fav.getAllDataList();
                                break;
                            }
                            if (input === "1") {
                                const favtype = fav.getFavtype();
                                let data;
                                if (favtype === "collect") {//用户收藏其他用户收藏夹
                                    data = await fav.getHttpCollectOthersDataAllList(favID);
                                } else {
                                    data = await fav.getHttpUserCreationAllDataList(favID);
                                }
                                if (!data["state"]) {
                                    Tip.error("获取失败!");
                                    loading.close();
                                    return;
                                }
                                dataList = data["dataList"];
                            } else {
                                Tip.error("出现意外的值！" + input);
                                loading.close();
                                return;
                            }
                            break;
                        case "订阅":
                            const tempTabsName = Space.subscribe.getTabsName();
                            if (tempTabsName === "标签") {
                                Space.isFetchingFollowersOrWatchlists = false;
                                loading.close();
                                Tip.error("意外的结果!");
                                return;
                            }
                            dataList = await Space.subscribe.bangumiAndCinema.getAllDataList();
                            fileName = `${userName}订阅的${tempTabsName}列表`;
                            break;
                        case "关注数":
                        case "粉丝数":
                            if (tabName === "粉丝数") {
                                if (!confirm("温馨提示，最多能获取1000(一千)个粉丝用户信息，是否继续？")) {
                                    Space.isFetchingFollowersOrWatchlists = false;
                                    loading.close();
                                    return;
                                }
                            }
                            fileName = `${userName}的用户${tabName}列表`;
                            dataList = await Space.followAndFans.getAllDataList();
                            break;
                        default:
                            loading.close();
                            alert("出现意外的参数！" + tabName);
                            Space.isFetchingFollowersOrWatchlists = false;
                            return;
                    }
                    loading.close();
                    const info = "最终结果个数：" + dataList.length;
                    Tip.success(info);
                    console.log(info);
                    console.log(dataList);
                    Util.fileDownload(JSON.stringify(dataList, null, 3), `${fileName}[${dataList.length}个].json`);
                    Space.isFetchingFollowersOrWatchlists = false;
                }
            },
            created() {
                const isBlacklistUid = Matching.arrKey(LocalData.getArrUID(), this.userUid);
                if (isBlacklistUid) {
                    setTimeout(() => {
                        this.addUidButShow = false;
                        Tip.error("当前用户是黑名单！UID=" + this.userUid);
                    }, 2500);
                }
                if (this.isHAction) {
                    console.log("当前登录账号的个人空间主页");
                } else {
                    console.log("非个人空间主页");
                }
                Space.getUserName().then(value => {
                    this.userName = value;
                });
            },
            watch: {
                tabsItemName(getTabName) {
                    let tempBool = false;
                    tempBool = getTabName !== "主页";
                    this.getDataListButShow = this.getAllDataListButShow = tempBool;
                },
                userName(newVal) {
                    if (Matching.arrKey(LocalData.getArrName(), newVal)) {
                        this.addNameButShow = false;
                        Tip.error("当前用户是黑名单！用户名=" + newVal);
                    }
                }
            }
        });
        window.spaceControlPanelVue = vue;
        return function () {
            return vue;
        }
    },
    addlLayoutHtml() {
        $("body").append(`<div style="position: fixed;left: 1%;top: 10%;z-index:2020;" >
    <div id="id13315" style="display: flex; flex-direction: column;">
            <button @click="addUidBut" v-show="addUidButShow">屏蔽(uid)</button>
            <button @click="addNameBut" v-show="addNameButShow">屏蔽用户名(精确)</button>
            <button @click="getDataListBut" v-show="getDataListButShow">{{getDataListButText}}</button>
            <button @click="getAllDataListBut" v-show="getAllDataListButShow">{{getAllDataListButText}}</button>
    </div>
</div>`);
    }
}

const SuspensionDivVue = {
    returnVue() {
        window.suspensionDivVue = new Vue({//快捷悬浮屏蔽面板的vue
            el: "#suspensionDiv",
            data: {
                moveLayoutValue: 5,
                xy: {
                    x: 0, y: 0
                },
                upName: "",
                uid: "",
                videoData: {
                    title: "",
                    bv: "",
                    av: "",
                    show: false,
                    frontCover: null
                },
            },
            methods: {
                getVideoData() {
                    return {
                        upName: this.upName,
                        uid: this.uid,
                        title: this.videoData.title,
                        bv: this.videoData.bv,
                        frontCover: this.videoData.frontCover
                    };
                },
                addLookAtItLater() {
                    LookAtItLater.addLookAtItLater(this.getVideoData());
                },
                addShieldName() {
                    UrleCrud.addShow("userNameArr", "用户名黑名单模式(精确匹配)", this.upName);
                },
                addShieldUid() {
                    if (!UrleCrud.addShow("userUIDArr", "用户uid黑名单模式(精确匹配)", this.uid)) {
                        return;
                    }
                    const title = document.title;
                    const url = Util.getWindowUrl();
                    if (title === "哔哩哔哩 (゜-゜)つロ 干杯~-bilibili") {
                        Home.startShieldMainVideo(".bili-video-card.is-rcmd");
                        return;
                    }
                    if (title.includes("-哔哩哔哩_Bilibili") && (url.includes("search.bilibili.com/all") || url.includes("search.bilibili.com/video"))) {//用于避免个别情况搜索界面屏蔽不生效问题
                        Search.video.searchRules();
                        return;
                    }
                    if (href.includes("//live.bilibili.com/") && title.includes("哔哩哔哩直播，二次元弹幕直播平台")) {
                        Live.shield($("#chat-items").children());
                    }
                },
                findUserInfo() {
                    const loading = Tip.loading("正在获取中！");
                    const promise = HttpUtil.get(`https://api.bilibili.com/x/web-interface/card?mid=${this.uid}&photo=false`);
                    promise.then(res => {
                        const body = res.bodyJson;
                        if (body["code"] !== 0) {
                            Tip.error("请求失败！");
                            return;
                        }
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
                        const tempJq = $("#popDiv");
                        if (tempJq.length === 0) {
                            $("body").append(userCardHtml);
                        } else {
                            $("#popDiv").remove();
                            $("body").append(userCardHtml);
                        }
                        tempJq.css("display", "inline");
                    }).finally(() => {
                        loading.close();
                    });
                },
                move(value, func) {
                    const jqE = $("#suspensionDiv");
                    const moveLayoutValue = parseInt(Util.Str.lastIndexSub(jqE.css(value), 2));
                    let moveIndex = func(moveLayoutValue, this.moveLayoutValue);
                    const width = document.documentElement.clientWidth - parseInt(jqE.css("width"));
                    const height = document.documentElement.clientHeight - parseInt(jqE.css("height"));
                    if (value === "top" && 0 >= moveIndex) {
                        moveIndex = 0;
                    }
                    if (value === "top" && moveIndex > height) {
                        moveIndex = height;
                    }
                    if (value === "left" && moveIndex <= 0) {
                        moveIndex = 0;
                    }
                    if (value === "left" && moveIndex > width) {
                        moveIndex = width;
                    }
                    if (value === "top") {
                        this.xy.y = moveIndex;
                    } else {
                        this.xy.x = moveIndex;
                    }
                    jqE.css(value, `${moveIndex}px`);
                },
                moveTop() {
                    this.move("top", (layoutIndex, moveLayoutValue) => layoutIndex - moveLayoutValue);
                },
                moveLrft() {
                    this.move("left", (layoutIndex, moveLayoutValue) => layoutIndex - moveLayoutValue);
                },
                moveRight() {
                    this.move("left", (layoutIndex, moveLayoutValue) => layoutIndex + moveLayoutValue);
                },
                moveButton() {
                    this.move("top", (layoutIndex, moveLayoutValue) => layoutIndex + moveLayoutValue);
                },
                handleToggle(event) {//处理监听details展开关闭事件
                    if (event.target.open === false) {
                        return;
                    }
                    this.correctedPosition();
                },
                correctedPosition() {//修正位置
                    const jqE = $("#suspensionDiv");
                    const jqHeight = parseInt(jqE.css("height"));//面板本身面积高度
                    const panelTop = jqE.offset().top;//面板左上角的坐标y
                    const height = jqHeight + panelTop;//面板在页面高度中所占用的高度大小
                    const remainHeight = document.documentElement.clientHeight - height;//剩余的高度
                    const maxHeight = document.documentElement.clientHeight - jqHeight;//允许的最低位置
                    if (jqHeight < remainHeight) {
                        return;
                    }
                    if (remainHeight > maxHeight) {
                        return;
                    }
                    jqE.css("top", `${maxHeight}px`);
                }
            },
        });
    }
}

const VideoPlayVue = {
    returnVue() {
        const vue = new Vue({
            el: "#rightLayout",
            data: {
                leftVal: "1%",
                topVal: "15%",
                subItemButShow: LocalData.video.isSubItemButShow(),
                subItemButText: "收起",
                //是否隐藏右侧布局
                hideRightLayout: false,
                //是否隐藏顶部标题
                hideTopVideoTitleInfo: false,
                //是否隐藏底部评论区
                hideButtonLayout: false,
                hideButtonLayoutButText: "隐藏评论区",
                hideRightLayoutButText: "隐藏右侧布局",
                hideTopVideoTitleInfoButText: "隐藏顶部视频标题信息"
            },
            methods: {
                subItemShowBut() {
                    this.subItemButShow = !this.subItemButShow;
                },
                addUid() {
                    const userList = DefVideo.getCreativeTeam();
                    if (userList.length === 0) {
                        alert("获取失败！");
                        return;
                    }
                    if (userList.length === 1) {
                        const data = userList[0];
                        const name = data["name"];
                        const uid = data["uid"];
                        if (!confirm(`是要屏蔽用户【${name}】吗？屏蔽方式为uid=${uid}`)) {
                            return;
                        }
                        UrleCrud.addShow("userUIDArr", "用户uid黑名单模式(精确匹配)", uid);
                        return;
                    }
                    alert("暂不支持屏蔽多作者方式.");
                },
                addNameBut() {
                    const userList = DefVideo.getCreativeTeam();
                    if (userList.length === 0) {
                        alert("获取失败！");
                        return;
                    }
                    if (userList.length === 1) {
                        const data = userList[0];
                        const name = data["name"];
                        if (!confirm(`是要屏蔽用户【${name}】吗？屏蔽方式为用户名(精确)`)) {
                            return;
                        }
                        UrleCrud.addShow("userNameArr", "用户名黑名单模式(精确匹配)", name);
                        return;
                    }
                    alert("暂不支持屏蔽多作者方式.");
                },
                getTheVideoBarrage() {
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
                    const loading = Tip.loading("正在获取数据中!");
                    const promise = HttpUtil.getVideoInfo(urlBVID);
                    promise.then(res => {
                        const body = res.bodyJson;
                        const code = body["code"];
                        const message = body["message"];
                        if (code !== 0) {
                            Tip.error("获取失败!" + message);
                            return;
                        }
                        let data;
                        try {
                            data = body["data"][0];
                        } catch (e) {
                            Tip.error("获取数据失败!" + e);
                            return;
                        }
                        if (data === null || data === undefined) {
                            Tip.error("获取到的数据为空的!");
                            return;
                        }
                        const cid = data["cid"];
                        Tip.success("cid=" + cid);
                        Util.openWindow(`https://comment.bilibili.com/${cid}.xml`);
                    }).catch(err => {
                        Tip.error("错误状态!");
                        Tip.error(err);
                    }).finally(() => {
                        loading.close();
                    });
                },
                getTheVideoAVNumber() {
                    const urlId = Util.getUrlBVID(Util.getWindowUrl());
                    if (urlId === null) {
                        alert("获取不到BV号!");
                        return;
                    }
                    if (!confirm(`当前视频BV号是 ${urlId} 吗`)) {
                        return;
                    }
                    alert(Util.BilibiliEncoder.dec(urlId));
                },
                getVideoCommentArea() {//获取视频的评论区列表可见的内容
                    const list = document.querySelectorAll(".reply-list>.reply-item");
                    if (list.length === 0) {
                        Tip.error("未获取评论区内容，可能是当前并未有人评论！");
                        return;
                    }
                    const arr = [];
                    for (let v of list) {
                        const rootName = v.querySelector(".user-name").textContent;
                        const rootUid = v.querySelector(".user-name").getAttribute("data-user-id");
                        const rootContent = v.querySelector(".root-reply .reply-content").textContent;
                        const subList = v.querySelectorAll(".sub-reply-list>.sub-reply-item");
                        const data = {
                            name: rootName, uid: parseInt(rootUid), content: rootContent,
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
                                name: subName, uid: parseInt(subUid), content: subContent
                            };
                            subArr.push(subData);
                        }
                        data["sub"] = subArr;
                        arr.push(data);
                    }
                    Util.fileDownload(JSON.stringify(arr, null, 3), `评论区列表-${Util.toTimeString()}.json`);
                    Tip.success("已获取成功！");
                },
                getLeftTopVideoListBut() {
                    const videoCollection = DefVideo.videoCollection;
                    if (!videoCollection.isMulti_page()) {
                        alert("并未有视频选集列表！");
                        return;
                    }
                    let dataList;
                    if (videoCollection.isList()) {
                        dataList = videoCollection.getVideoList();
                    } else {
                        dataList = videoCollection.getVIdeoGridList();
                    }
                    Util.fileDownload(JSON.stringify(dataList, null, 3), `${DefVideo.getVIdeoTitle()}的视频选集列表(${dataList.length})个.json`);
                },
                localGetVideoInfo() {
                    const upInfo = document.querySelector(".up-name");
                    let data;
                    try {
                        data = {
                            upName: upInfo.textContent.trim(),
                            uid: Util.getSubWebUrlUid(upInfo.href),
                            title: document.querySelector(".video-title").textContent,
                            bv: Util.getSubWebUrlBV(Util.getWindowUrl())
                        };
                    } catch (e) {
                        console.error("获取视频信息出现错误！", e);
                        return null;
                    }
                    return data;
                },
                addLefToLookAtItLaterListBut() {
                    LookAtItLater.addLookAtItLater(this.localGetVideoInfo())
                },
                isHideButtonLayoutBut() {//隐藏评论区
                    const e = $("#comment,.playlist-comment");
                    if (e.is(":hidden")) {
                        e.show();
                        this.hideButtonLayout = false;
                        return;
                    }
                    e.hide();
                    this.hideButtonLayout = true;
                },
                isHideRightLayoutBut() {
                    const jqE = $(".right-container.is-in-large-ab,.playlist-container--right");
                    if (jqE.length === 0) {
                        Tip.error("获取不到右侧布局！");
                        return;
                    }
                    if (jqE.is(":hidden")) {
                        jqE.show();
                        this.hideRightLayout = false;
                        return;
                    }
                    jqE.hide();
                    this.hideRightLayout = true;
                },
                isHideTopVideoTitleInfoBut() {
                    const jqE = $("#viewbox_report,.video-info-container");
                    if (jqE.is(":hidden")) {
                        jqE.show();
                        this.hideTopVideoTitleInfo = false;
                        return;
                    }
                    jqE.hide();
                    this.hideTopVideoTitleInfo = true;
                },
                VideoPIPicture() {
                    Util.video.autoAllPictureInPicture();
                },
                openVideoSubtitle() {
                    const ariaE = document.querySelector("[aria-label='字幕'] span");
                    if (ariaE === null) {
                        return alert("未获取到字幕！");
                    }
                    ariaE.click();
                }
            },
            watch: {
                subItemButShow(newVal) {
                    this.subItemButText = newVal ? "收起" : "展开";
                },
                hideRightLayout(newVal) {
                    this.hideRightLayoutButText = newVal ? "显示右侧布局" : "隐藏右侧布局";
                    let tempLeft;
                    let tempTop;
                    if (newVal) {
                        tempLeft = "1%";
                        tempTop = "15%";
                    } else {
                        tempLeft = "90%";
                        tempTop = "20%";
                    }
                    this.leftVal = tempLeft;
                    this.topVal = tempTop;
                },
                hideTopVideoTitleInfo(newVal) {
                    this.hideTopVideoTitleInfoButText = newVal ? "显示顶部视频标题信息" : "隐藏顶部视频标题信息";
                },
                hideButtonLayout(newVal) {
                    this.hideButtonLayoutButText = newVal ? "显示评论区" : "隐藏评论区";
                }
            },
            created() {
                const tempRightBool = this.hideRightLayout = LocalData.video.isHideVideoRightLayout();
                if (tempRightBool) {
                    const interval = setInterval(() => {
                        const jqE = $(".right-container.is-in-large-ab,.playlist-container--right");
                        if (jqE.length === 0) return;
                        if (!tempRightBool || !this.hideRightLayout) {
                            clearInterval(interval)
                            return;
                        }
                        jqE.hide();
                    }, 1600);
                }
                const tempButtinBool = this.hideButtonLayout = LocalData.video.isHideVideoButtonCommentSections();
                if (tempButtinBool) {
                    const interval = setInterval(() => {
                        const jqE = $("#comment,.playlist-comment");
                        if (jqE.length === 0) return;
                        if (!tempButtinBool || !this.hideButtonLayout) {
                            clearInterval(interval)
                            return;
                        }
                        jqE.hide();
                    }, 1600);
                }
                const tempTopBool = this.hideTopVideoTitleInfo = LocalData.video.isHideVideoTopTitleInfoLayout();
                if (tempTopBool) {
                    const interval = setInterval(() => {
                        const jqE = $("#viewbox_report,.video-info-container");
                        if (jqE.length === 0) return;
                        clearInterval(interval);
                        jqE.hide();
                    }, 1500);
                }
            }
        });
        return function () {
            return vue;
        }
    },
    addHtml() {
        $("body").append(`<div id="rightLayout" :style="{left:leftVal,top:topVal}" style="position: fixed;z-index: 2023">
<div style="display: flex; flex-direction: column;">
<button @click="subItemShowBut">{{subItemButText}}</button>
    <div v-show="subItemButShow" style="display: flex; flex-direction: column;">
        <button @click="addUid">屏蔽(uid)</button>
        <button @click="addNameBut">屏蔽用户名(精确)</button>
        <button @click="getTheVideoBarrage">获取视频弹幕</button>
        <button @click="getTheVideoAVNumber">获取视频av号</button>
        <button @click="getVideoCommentArea">获取评论区页面可见数据</button>
        <button @click="getLeftTopVideoListBut">获取视频选集列表数据</button>
        <button @click="addLefToLookAtItLaterListBut">添加进稍后再看</button>
        <button @click="isHideButtonLayoutBut">{{hideButtonLayoutButText}}</button>
        <button @click="isHideRightLayoutBut">{{hideRightLayoutButText}}</button>
        <button @click="isHideTopVideoTitleInfoBut">{{hideTopVideoTitleInfoButText}}</button>
        <button @click="VideoPIPicture">播放器画中画</button>
        <button @click="openVideoSubtitle">字幕开关</button>
    </div>
</div>
</div>`);
    }
}

const Video_params_layout = {
    returnVue() {
        const vue = new Vue({
            el: "#video_params_layout",
            data: {
                autoPlayCheckbox: LocalData.video.isAutoPlay(),
                videoEndRecommendCheckbox: LocalData.video.isVideoEndRecommend(),
                isFlipHorizontal: false,
                isFlipVertical: false,
                axleRange: 0,
                setAutoSubItemButShow: LocalData.video.isSubItemButShow(),
                hideVideoTopTitleInfoCheackBox: LocalData.video.isHideVideoTopTitleInfoLayout(),
                hideVideoButtonCheackBox: LocalData.video.isHideVideoButtonCommentSections(),
                hideVideoRightLayoutCheackBox: LocalData.video.isHideVideoRightLayout()
            },
            methods: {
                VideoPIPicture() {
                    Util.video.autoAllPictureInPicture();
                },
                okFlipHorizontal() {//水平翻转
                    if (this.isFlipHorizontal) {
                        Util.setVideoRotationAngle("Y", 0);
                        this.isFlipHorizontal = false;
                        return;
                    }
                    Util.setVideoRotationAngle("Y", 180);
                    this.isFlipHorizontal = true;
                },
                okFlipVertical() {//垂直翻转
                    if (this.isFlipVertical) {
                        Util.setVideoRotationAngle("X", 0);
                        this.isFlipVertical = false;
                        return;
                    }
                    Util.setVideoRotationAngle("X", 180)
                    this.isFlipVertical = true;
                }
            },
            watch: {
                autoPlayCheckbox(newVal) {
                    LocalData.video.setAutoPlay(newVal);
                },
                videoEndRecommendCheckbox(newVal) {
                    LocalData.video.setVideoEndRecommend(newVal);
                },
                axleRange(newVal) {
                    Util.setVideoCenterRotation(newVal);
                },
                hideVideoTopTitleInfoCheackBox(newVal) {
                    LocalData.video.setHideVideoTopTitleInfoLayout(newVal);
                },
                hideVideoRightLayoutCheackBox(newVal) {
                    LocalData.video.setHideVideoRightLayout(newVal);
                },
                hideVideoButtonCheackBox(newVal) {
                    LocalData.video.setHideVideoButtonCommentSections(newVal);
                },
                setAutoSubItemButShow(newBool) {
                    LocalData.video.setSubItemButShow(newBool);
                }
            }
        });
        return function () {
            return vue;
        }
    }
}


const VueData = {//vue组件数据获取与设置
    panelSetsTheLayout: {//面板设置布局
        isDShieldPanelFollowMouse() {//是否跟随鼠标
            return window.panelSetsTheLayoutVue.isDShieldPanelFollowMouse;
        },
        setDShieldPanelFollowMouse(boolVal) {//设置是否跟随鼠标
            window.panelSetsTheLayoutVue.isDShieldPanelFollowMouse = boolVal;
        },
        isFixedPanelValueCheckbox(){//是否固定面板值
            return window.panelSetsTheLayoutVue.isFixedPanelValueCheckbox;
        },
        setFixedPanelValueCheckbox(boolVal) {//设置是否固定面板值
            window.panelSetsTheLayoutVue.isFixedPanelValueCheckbox = boolVal;
        }
    }
}

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
Util.BilibiliEncoder.init();
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
window.bilibiliEncoder = Util.BilibiliEncoder;
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

Util.addGMMenu('禁用脚本快捷键', () => {
    const input = prompt(`当前脚快捷键状态为：${LocalData.isEnableShortcutKeys() ? "启用" : "禁用"}\n输入1为启用，输入0为禁用`);
    if (input === null) return;
    const is = {0: false, 1: true};
    if (is[input] === undefined) {
       Tip.error(`输入了意外的内容！`);
        return;
    }
    LocalData.setEnableShortcutKeys(is[input]);
    Tip.success(`已设置快捷键状态为：${is[input] ? "启用" : "禁用"}`);
});
Util.addGMMenu("显示隐藏控制面板", () => Home.hideDisplayHomeLaylout());

/**
 * 根据网页url指定不同的逻辑
 * @param href{String} url链接
 */
async function bilibili(href) {
    if (href.includes("live.bilibili.com/p/eden/area-tags")) {
        console.log("直播专区")
        Live.liveDel.delLiveRoom();
        return;
    }
    if (href.includes("https://www.bilibili.com/video")) {//如果是视频播放页的话
        const videoData = Rule.videoData;
        const videoElement = document.getElementsByTagName("video");
        const interval = setInterval(() => {
            try {
                if (videoElement.length === 0) return;
                clearInterval(interval);
                if (LocalData.video.isAutoPlay() === true) {
                    const intervalAutoPlay = setInterval(() => {
                        const au = $("input[aria-label='自动开播']");
                        if (au.length === 0) return;
                        for (const videoTag of videoElement) videoTag.pause();
                        if (au.is(":checked")) {
                            au.attr("checked", false);
                        } else {
                            clearInterval(intervalAutoPlay);
                            console.log("退出intervalAutoPlay")
                            console.log("已自动暂定视频播放");
                        }
                    }, 800);
                }
                for (const videoTag of videoElement) {
                    DefVideo.setVideoSpeedInfo(videoTag);
                    videoTag.addEventListener('ended', () => {//播放器结束之后事件
                        Tip.printLn("播放结束");
                        if (LocalData.video.isVideoEndRecommend()) {
                            Util.circulateClassName("bpx-player-ending-content", 2000, "已移除播放完视频之后的视频推荐");
                        }
                    }, false);
                }
            } catch (e) {
                console.error("播放页调整播放器出错！", e);
            }
        }, 1000);
        if (!videoData.isrigthVideoList && !videoData.isRhgthlayout && !videoData.isRightVideo) {//如果删除了右侧视频列表和右侧布局就不用监听该位置的元素了
            const interval = setInterval(() => {
                const list = document.querySelectorAll(".video-page-card-small");
                if (list.length === 0) return;
                DefVideo.rightVideo();
                console.log("检测到右侧视频列表中符合条件");
                clearInterval(interval)
            }, 2000);
        }
        DefVideo.delLayout.delRightE();
        DefVideo.delLayout.delBottonE();
        DefVideo.delLayout.rightSuspendButton();
        return;
    }
    if (href.includes("search.bilibili.com")) {
        const tabsItem = Search.getTabsItem();
        const $getDataListBut = $("#getDataListBut");
        const $getAllDataListBut = $("#getAllDataListBut");
        $getDataListBut.text(`获取${tabsItem}数据(当前页)`);
        $getAllDataListBut.text(`获取${tabsItem}数据(全部页)`);
        if (tabsItem === "直播") {
            const liveTabItems = Search.live.getTabsItem();
            if (liveTabItems === "全部") {
                $getDataListBut.hide();
                $getAllDataListBut.hide();
            } else {
                $getDataListBut.text(`获取${liveTabItems}数据(当前页)`);
                $getAllDataListBut.text(`获取${liveTabItems}数据(全部页)`);
                $getDataListBut.show();
                $getAllDataListBut.show();
            }
        } else {
            $getDataListBut.show();
            $getAllDataListBut.show();
        }
        if (href.includes("search.bilibili.com/all") || href.includes("search.bilibili.com/video")) {//搜索页面-综合-搜索界面-视频
            Search.video.searchRules();
            Search.blockUserCard();
            return;
        }
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
    if (href.includes("www.bilibili.com/v/popular")) {//热门
        GreatDemand.delVideo();
        const interval = setInterval(() => {
            const jqE = $(".international-footer");
            if (jqE.length === 0) return;
            clearInterval(interval);
            jqE.remove();
        }, 1000);
        if (href.includes("v/popular/all")) {
            Tip.info("综合热门因获取不到uid，故uid屏蔽方式不生效", {position: "topleft"});
        }
        return;
    }
    if (href.includes("www.bilibili.com/v/")) {//通过URL变动执行屏蔽首页分区视频
        Home.startShieldMainVideo(".bili-video-card");
        Home.homePrefecture();
        return;
    }
    if (href.includes("space.bilibili.com")) {
        const getTabName = await Space.getTabName();
        window.spaceControlPanelVue.tabsItemName = getTabName;
        if (getTabName === "投稿") {
            const name = Space.video.getLeftTabTypeName();
            window.spaceControlPanelVue.setDataListButText(`获取当前${getTabName}页的${name}列表数据`);
            window.spaceControlPanelVue.setAllDataListButText(`获取${getTabName}的${name}列表数据`);
        } else if (getTabName === "订阅") {
            const tabsName = Space.subscribe.getTabsName();
            window.spaceControlPanelVue.setDataListButText(`获取当前${tabsName}页的列表数据`);
            window.spaceControlPanelVue.setAllDataListButText(`获取${tabsName}的列表数据`);
        } else {
            window.spaceControlPanelVue.setDataListButText(`获取当前${getTabName}页的列表数据`);
            window.spaceControlPanelVue.setAllDataListButText(`获取${getTabName}的列表数据`);
        }
        if (getTabName === "动态") {
            const interval01 = setInterval(() => {
                const tempE = $(".bili-dyn-list__items");
                if (tempE.length === 0) return;
                const list = tempE.children();
                if (list.length === 0) return;
                clearInterval(interval01);
                Trends.shrieDynamicItems(list);
                if (Util.isEventJq(tempE, "DOMNodeInserted")) {
                    clearInterval(interval01);
                    return;
                }
                tempE.bind("DOMNodeInserted", () => {
                    Trends.shrieDynamicItems($(".bili-dyn-list__items").children());
                });
            }, 1000);
        }
    }
}

/**
 *
 * 首次加载时只会加载一次
 * @param {string}href
 * @param {string}windowsTitle
 */
async function bilibiliOne(href, windowsTitle) {
    const $body = $("body");
    const interval01 = setInterval(() => {
        const nav_search_input = $(".nav-search-input,.search-input-el");
        if (nav_search_input.length === 0) return;
        clearInterval(interval01);
        const arrContent = Matching.arrContent(LocalData.getArrTitle(), nav_search_input.attr("placeholder"));
        if (arrContent !== null) {
            const title = nav_search_input.attr("title");
            nav_search_input.attr("placeholder", "");
            nav_search_input.attr("title", "");
            Tip.info(`已通过标题关键词 ${arrContent} 过滤顶部搜索框显示的内容=${title}`);
        }
        const i2 = setInterval(() => {
            const element = document.querySelectorAll(".history-text");
            if (element.length === 0) return;
            clearInterval(i2);
            $(element).css("white-space", "break-spaces");
            const msg = "已调整搜索结果中历史记录样式";
            console.log(msg);
            Tip.successBottomRight(msg);
        }, 100);
        nav_search_input.click(() => {
            console.log("点击了顶部搜索框");
            const i1 = setInterval(() => {
                const list = document.querySelectorAll(".trendings-double .trending-item");
                if (list.length === 0) return;
                clearInterval(i1);
                list.forEach((value, key, parent) => {
                    const content = value.querySelector(".trending-text").textContent;
                    const titleKey = Remove.titleKey(value, content);
                    if (titleKey !== null) {
                        Tip.infoBottomRight("规则屏蔽了相关热搜");
                        Tip.printLn(`已通过标题关键词【${titleKey}】屏蔽热搜榜项目内容【${content}】`);
                        return;
                    }
                    const titleKeyCanonical = Remove.titleKeyCanonical(value, content);
                    if (titleKeyCanonical !== null) {
                        Tip.infoBottomRight("规则屏蔽了相关热搜");
                        Tip.printLn(`已通过标题正则关键词【${titleKeyCanonical}】屏蔽热搜榜项目内容【${content}】`);
                        return;
                    }
                    const contentKey = Remove.contentKey(value, content);
                    if (contentKey !== null) {
                        Tip.infoBottomRight("规则屏蔽了相关热搜");
                        Tip.printLn(`已通过标内容关键词【${contentKey}】屏蔽热搜榜项目内容【${content}】`);
                    }
                });
                // nav_search_input.unbind();//删除该元素的所有jq添加的事件
            }, 50);

        });
    }, 1000);
    if (href === "https://www.bilibili.com/" || href.includes("www.bilibili.com/?spm_id_from") || href.includes("www.bilibili.com/index.html")) {//首页
        console.log("进入了首页");
        const i2 = setInterval(() => {
            const jqE = $(".header-channel");
            if (jqE.length === 0) return;
            clearInterval(i2);
            jqE.remove();
            Tip.infoBottomRight("已移除页面下滑时，显示顶部的部分导航信息");
        }, 1000);
        return;
    }
    if (href.includes("space.bilibili.com/")) {//b站用户空间主页
        SpaceControlPanelVue.addlLayoutHtml();
        SpaceControlPanelVue.returnVue();
        return;
    }
    if (href.includes("www.bilibili.com/v/topic/detail/?topic_id=")) {//话题
        SubjectOfATalk.deltopIC();
        return;
    }
    if (href.includes("www.bilibili.com/video") || href.includes("www.bilibili.com/list/watchlater")) {//视频页
        VideoPlayVue.addHtml();
        VideoPlayVue.returnVue();
        return;
    }
    if ((href.includes("https://live.bilibili.com/?spm_id_from") || href === "https://live.bilibili.com/") && windowsTitle === "哔哩哔哩直播，二次元弹幕直播平台") {//直播首页
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
                    Tip.printLn("已移除页脚信息")
                    clearInterval(interval02);
                }
            }, 2000);
        }, 800);
        return;
    }
    if (href.includes("t.bilibili.com") && windowsTitle === "动态首页-哔哩哔哩") {
        console.log("动态页面");
        const interval01 = setInterval(() => {
            const login = $(".bili-dyn-login-register");
            if (login.length === 0) return;
            clearInterval(interval01);
            login.remove();
            console.log("已移除动态页面中的提示登录");
        }, 1000);
        Trends.tempLoadIng();
        const interval03 = setInterval(() => {
            const tab = document.querySelector(".bili-dyn-up-list__content");
            if (tab === null) return;
            clearInterval(interval03);
            document.querySelector(".bili-dyn-up-list__shadow-right")?.remove();
            $(tab).children(".bili-dyn-up-list__item").click(() => {
                Trends.tempLoadIng();
            });
        }, 1000);
    }
    if (href.includes("search.bilibili.com")) {
        const getDataListBut = layout.panel.getHoverBallBut("get(当前页)", "15%", "94%");
        const getAllDataListBut = layout.panel.getHoverBallBut("get(全部页)", "20%", "94%");
        $body.append(getDataListBut);
        $body.append(getAllDataListBut);
        getDataListBut.attr("id", "getDataListBut");
        getAllDataListBut.attr("id", "getAllDataListBut");
        getDataListBut.click(() => {
            let dataList, fileName;
            const tabsItem = Search.getTabsItem();
            const keyword = Search.getKeyword();
            switch (tabsItem) {
                case "综合":
                case "视频":
                    dataList = Search.video.getVideoDataList();
                    fileName = `(搜索关键词【${keyword}】的${Search.video.getTabTheSelectedSort()}视频列表${dataList.length})个.json`;
                    break;
                case "番剧":
                case "影视":
                    dataList = Search.bangumi.getDataList();
                    fileName = `(搜索关键词【${keyword}】的${tabsItem}列表${dataList.length})个.json`;
                    break;
                case "专栏":
                    dataList = Search.article.getDataList();
                    fileName = `(搜索关键词【${keyword}】的${Search.article.getTabTheSelectedSort()}专栏列表${dataList.length})个.json`;
                    break;
                case "用户":
                    dataList = Search.upuser.getUserInfoList();
                    fileName = `搜索关键词【${keyword}】的${Search.upuser.getTabTheSelectedSort()}的用户列表(${dataList.length}个).json`;
                    break;
                case "直播":
                    const liveTabs = Search.live.getTabsItem();
                    switch (liveTabs) {
                        case "直播间":
                            dataList = Search.live.getLiveDataList();
                            fileName = `(搜索关键词【${keyword}】的${Search.live.getLiveRoomSort()}${liveTabs}列表${dataList.length})个.json`;
                            break;
                        case "主播":
                            dataList = Search.live.liveUsers.getDataList();
                            fileName = `(搜索关键词【${keyword}】的${liveTabs}列表${dataList.length})个.json`;
                            break;
                        default:
                            alert("直播获取时出现意外的选项！");
                            return;
                    }
                    break;
                default:
                    alert(`搜索${keyword}时出现了意外的分支结果！`);
                    return;
            }
            if (dataList.length === 0) {
                alert(`未获取到关键词【${keyword}】相关${tabsItem}列表数据！`);
                return;
            }
            Tip.success(`获取当前页的${tabsItem}列表成功！`);
            Util.fileDownload(JSON.stringify(dataList, null, 3), fileName);
        });
        getAllDataListBut.click(async () => {
            if (Search.isGetLoadIngData) {
                Tip.error("请等待，获取完成！");
                return;
            }
            Search.isGetLoadIngData = true;
            const tabsItem = Search.getTabsItem();
            const keyword = Search.getKeyword();
            const loading = Tip.loading(`正在获取关键词【${keyword}】的相关${tabsItem}数据，请耐心等待！`);
            let dataList, fileName;
            switch (tabsItem) {
                case "综合":
                case "视频":
                    dataList = await Search.video.getAllVideoDataList();
                    fileName = `(搜索关键词【${keyword}】的${Search.video.getTabTheSelectedSort()}视频列表${dataList.length})个.json`;
                    break;
                case "番剧":
                    dataList = await Search.bangumi.getAllDataList();
                    fileName = `(搜索关键词【${keyword}】的番剧列表${dataList.length})个.json`;
                    break;
                case "直播":
                    const liveTabs = Search.live.getTabsItem();
                    switch (liveTabs) {
                        case "直播间":
                            dataList = await Search.live.getLiveAllDataList();
                            fileName = `(搜索关键词【${keyword}】的${Search.live.getLiveRoomSort()}${liveTabs}列表${dataList.length})个.json`;
                            break;
                        case "主播":
                            dataList = await Search.live.liveUsers.getAllDataList();
                            fileName = `(搜索关键词【${keyword}】的${liveTabs}列表${dataList.length})个.json`;
                            break;
                        default:
                            alert("直播获取时出现意外的选项！");
                            return;
                    }
                    break;
                case "专栏":
                    dataList = await Search.article.getAllDataList();
                    fileName = `(搜索关键词【${keyword}】的${Search.article.getTabTheSelectedSort()}专栏列表${dataList.length})个.json`;
                    break;
                case "用户":
                    dataList = await Search.upuser.getUserInfoAllList();
                    fileName = `搜索关键词【${keyword}】的${Search.upuser.getTabTheSelectedSort()}用户列表(${dataList.length}个).json`;
                    break;
                default:
                    alert(`搜索${keyword}时出现了意外的分支结果！`);
                    return;
            }
            loading.close();
            Search.isGetLoadIngData = false;
            if (dataList.length === 0) {
                alert(`未获取到相关${tabsItem}列表数据！`);
                return;
            }
            Tip.success(`获取${tabsItem}的关键词${keyword}的数据成功!个数为：${dataList.length}个`);
            Util.fileDownload(JSON.stringify(dataList, null, 3), fileName);
        });
        $("#biliMainFooter").remove();
        console.log("已清空底部信息");
        $(".side-buttons.flex_col_end.p_absolute").remove();
        console.log("已移除bilibili右侧悬浮按钮");
        return;
    }
    if (href.includes("www.bilibili.com/v")) {//首页分区页,该判断要低于频道等其他页面，主要是因为地址有相似的地方
        let size = -1;
        setInterval(() => {
            const tempSize = document.querySelectorAll(".bili-video-card");
            if (tempSize.length === size) return;
            size = tempSize.length;
            Home.startShieldMainVideo(".bili-video-card");
        }, 1000);
        return;
    }
    if ((href.includes("www.bilibili.com") && windowsTitle === "哔哩哔哩 (゜-゜)つロ 干杯~-bilibili") || (href.includes("t.bilibili.com") & windowsTitle === "动态首页-哔哩哔哩")) {
        const interval01 = setInterval(() => {
            const login = $(".lt-col>.login-tip:contains('立即登录')");
            if (login.length === 0) return;
            clearInterval(interval01);
            login.remove();
            console.log("已移除页面右下角的提示登录");
        }, 1000);
        const interval02 = setInterval(() => {
            const login = $(".login-panel-popover");
            if (login.length === 0) return;
            clearInterval(interval02);
            login.remove();
            console.log("已移除页面的提示登录信息");
        }, 1000);
        return;
    }
    if (href.includes("www.bilibili.com/account/history") && windowsTitle === "历史记录") {
        const getPageShowHistoryBut = layout.panel.getHoverBallBut("获取页面可见的历史记录", "18%", "5%");
        const getAllPageHistoryBut = layout.panel.getHoverBallBut("获取页面全部的历史记录", "28%", "5%");
        $body.append(getPageShowHistoryBut);
        $body.append(getAllPageHistoryBut);
        History.delLayout.footer();
        getPageShowHistoryBut.click(() => {
            if (History.isGetLoadIngData) {
                alert("请等待获取完成！");
                return;
            }
            alert("如果您要获取所有全部可见的历史记录内容，可以一直滚动到底部，直到显示全部可见的历史记录内容，再获取");
            History.isGetLoadIngData = true;
            const dataHistory = History.getDataHistory();
            History.isGetLoadIngData = false;
            if (dataHistory.length === 0) {
                alert("未获取到相关历史记录！");
                return;
            }
            alert("已获取完成！接下来可以将获取到的数据保存到电脑上任意一个位置");
            Util.fileDownload(JSON.stringify(dataHistory, null, 3), `b站用户的历史记录${Util.toTimeString()}(${dataHistory.length}个).json`);
        });
        getAllPageHistoryBut.click(() => {
            if (History.isGetLoadIngData) {
                alert("请等待获取完成！");
                return;
            }
            if (!confirm("温馨提示，此功能会持续模拟滚动到页面的底部使其加载更多的历史记录内容，直到到b站历史记录保留的最早的记录内容，可能会比较耗时，请耐心等待！是否继续？")) return;
            History.isGetLoadIngData = true;
            const loading = Tip.loading("温馨提示，此功能会持续模拟滚动到页面的底部使其加载更多的历史记录内容，直到到b站历史记录保留的最早的记录内容，可能会比较耗时，请耐心等待！");
            History.getAllDataHistory().then(() => {
                loading.close();
                const dataHistory = History.getDataHistory();
                History.isGetLoadIngData = false;
                if (dataHistory.length === 0) {
                    alert("未获取到相关历史记录！");
                    return;
                }
                alert("已获取完成！接下来可以将获取到的数据保存到电脑上任意一个位置");
                Util.fileDownload(JSON.stringify(dataHistory, null, 3), `b站用户全部的历史记录${Util.toTimeString()}(${dataHistory.length}个).json`);
            });
        });
        return;
    }
    if (href.includes("www.bilibili.com/watchlater")) {
        Watchlater.initLayout();
        $(".international-footer").remove();
        console.log("已移除页面页脚信息");
    }
}