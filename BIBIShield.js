// ==UserScript==
// @name         b站屏蔽增强器
// @namespace    http://tampermonkey.net/
// @license      MIT
// @version      1.1.64
// @description  支持动态屏蔽、评论区过滤屏蔽，视频屏蔽（标题、用户、uid等）、蔽根据用户名、uid、视频关键词、言论关键词和视频时长进行屏蔽和精简处理，支持获取b站相关数据并导出为json(用户收藏夹导出，历史记录导出、关注列表导出、粉丝列表导出)(详情看脚本主页描述)，针对github站内所有的链接都从新的标签页打开，而不从当前页面打开
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
// @match        http://gbtgame.ysepan.com/*
// @require      https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js
// @require      https://code.jquery.com/jquery-3.5.1.min.js
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
// ==/UserScript==

'use strict';
/**
 * 用户基本信息
 */
class UserClass {
    upName;
    uid;
    upAddress;

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
/**
 * 踩坑记录，如果在ajax中使用地址时，后面记得加/
 */
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
            if (!confirm(`是要查询用户 ${this.userName} 的${keyName} 规则吗？`)) {
                return;
            }
            Util.openWindowWriteContent(JSON.stringify(keyData, null, 3));
        },
        inputLocalRuleBut() {
            if (!confirm(`您确定要导入该用户 ${this.userName} 的规则并覆盖您当前本地已有的规则？`)) {
                return;
            }
            ruleCRUDLlayoutVue().inputRuleLocalData(this.ruleList);
        },
        inputCloudRuleBut() {//导入覆盖云端规则
            alert("暂不支持导入覆盖云端规则！");
        },
        lookUserRuleBut() {
                if (!confirm(`您是要查看用户 ${this.userName} 的规则内容吗，需要注意的是，在某些浏览器中，由于安全原因，脚本不能使用 window.open() 创建新窗口。对于这些浏览器，如果您出现打不开的情况，用户必须将浏览器设置为允许弹出窗口才能打开新窗口`)) {
                    return;
                }
                Util.openWindowWriteContent(JSON.stringify(this.ruleList, null, 2));

            },
            formatTIme(time) {
                return Util.timestampToTime(time);
            }
        }
    }
);

//用于稍后再看和已观看列表item项组件
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

//TODO 后续完善下面的def-list-layout，用于稍后再看和已观看列表的默认布局
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
    circulateIDs(elementStr, index, time, tip) {
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
            if (func === undefined) {
                return;
            }
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
    circulateClassNames(elementStr, elementIndex, index, time, tip) {
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
    forIntervalDelE(elementCss, tip, time = 1000) {//定时检查指定元素，执行删除
        const i = setInterval(() => {
            const e = document.querySelector(elementCss);
            if (e === null) {
                return;
            }
            clearInterval(i);
            e.remove();
            Qmsg.success(tip);
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
        } else {
            alert(message);
        }
    },
    /**
     * 更新悬浮按钮的坐标
     * @param e 事件源
     */
    updateLocation(e) {
        const x = e.clientX;
        const y = e.clientY;
        //获取当前鼠标悬停的坐标轴
        suspensionDivVue().xy.x = x;
        suspensionDivVue().xy.y = y;
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
    getRealmName(url) {
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
     * @param data
     */
    showSDPanel(e, data) {
        const name = data["upName"];
        const uid = Util.getSubUid(data["uid"]);
        const title = data["title"];
        let bv = data["bv"];
        let av = data["av"];
        const newVar = LocalData.isDShieldPanel();
        if (newVar) {
            return;
        }
        if ($("#fixedPanelValueCheckbox").is(':checked')) {
            return;
        }
        suspensionDivVue().upName = name;
        suspensionDivVue().uid = uid;
        suspensionDivVue().videoData.title = title;
        suspensionDivVue().videoData.bv = bv;
        suspensionDivVue().videoData.av = av;
        suspensionDivVue().videoData.frontCover = data["frontCover"];
        console.log(data["frontCover"]);
        if (title === undefined) {
            suspensionDivVue().videoData.show = false;
        } else {
            suspensionDivVue().videoData.show = true;
            if (bv === undefined) {
                return;
            }
            suspensionDivVue().videoData.av = Util.BilibiliEncoder.dec(bv);
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
        return sub;
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
const layout = {
    css: {
        home() {
            Util.addStyle(`
#home_layout {
    background: ${Home.getBackgroundStr()};
    margin: 0px;
    height: 100%;
    width: 100%;
    max-height: 100%;
    position: fixed;
    z-index: 2024;
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
#suspensionDiv .center button,#home_layout button,#rightLayout button{
    margin-top: 10px;
    padding: 5px 10px;
    border: none;
    background-color: #4CAF50;
    color: #fff;
    cursor: pointer;
}
#suspensionDiv .center button:hover,#home_layout button:hover,#rightLayout button:hover {
    background-color: #3E8E41;
}

#mybut {
    position: fixed;
    z-index: 2025;
    width: 50px;
    height: 50px;
    left: 96%;
    bottom: 85%;
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
         * @param position
         * @returns {*|jQuery|HTMLElement}
         */
        getHoverball(text, top, left, position = "fixed") {
            return $(`<button style=" position: ${position};margin-top: 10px;z-index: 2000;left: ${left};top: ${top};
    padding: 5px 10px;
    border: none;
    background-color: #4CAF50;
    color: #fff;
    cursor: pointer;">${text}</button>`);
        },
        getFilter_queue() {//个人主页悬浮屏蔽按钮
            return this.getHoverball("屏蔽", "15%", "4%");
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
        <select v-model="defaultMPSelect">
        <option v-for="item in MPSList" :value="item">{{item}}</option>
        </select>模式
        <div>
        二次确认<input type="checkbox" v-model=debugSeC>
        </div>
        <div>
        填写规则时自动测试<input type="checkbox" v-model="debugATestOInput">
        </div>
        <div>
        要匹配的内容(测试内容)：<input type="text" v-model.trim="debugText">
        </div>
        <div>
        规则：<input type="text" v-model.trim="debugRuleVal">
        </div>
        <button @click="okDebugRule" title="用于测试指定规则类型是否能匹配内容">测试</button>
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
    getHomePageLayout() {
        return `
      <h3>首页推荐视频</h3>
      <div>
          <span>指定推送</span>
          <input type="checkbox" v-model="isMainVideoListCheckbox">
          <select v-model="pushTypeSelect"><option v-for="item in pushTypeList" :value="item">{{item}}</option></select>
           <select v-model="sort_typeSelect" v-if="isChannelSelect">
            <option v-for="(item,key) in sort_typeList" :value="key">{{item}}</option>
          </select>
          <select v-model="showListSelect">
            <option v-for="(item,key) in showList" :value="key">{{item}}</option>
          </select>
      </div>

      <div>
      <input type="checkbox" v-model="isIdCheckbox">id
      <button @click="findBut">查询</button>
      <button @click="okBut">确定</button>
      </div>`;
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
<h3>视频播放速度</h3>
 <div>固定视频播放速度值
   <select v-model="playbackSpeedSelect">
   <option v-for="item in playbackSpeedList" :value="item">{{item}}x</option>
    </select>
  </div>
拖动更改页面视频播放速度<input v-model="rangePlaySpeed" type="range" value="1.0" min="0.1" max="16" step="0.01">
 <span>{{rangePlaySpeed}}x</span>
 <button @click="preservePlaySpeed">保存</button>
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
   <div style="display: flex;">
       <input type="checkbox" v-model="hideVideoTopTitleInfoCheackBox">默认隐藏视频播放页顶部标题信息布局</div>
       <input type="checkbox" v-model="hideVideoButtonCheackBox">默认隐藏视频播放页的评论区</div>
       <input type="checkbox" v-model="hideVideoRightLayoutCheackBox">默认隐藏视频播放页播放器的右侧布局
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
      <button onclick="document.documentElement.scrollTop=0;">页面置顶</button>
    </div>
    <details>
      <summary>快捷键</summary>
      <div>
        <p> 显示隐藏面板 快捷键\`</p>
        <p>选中取消快捷悬浮屏蔽面板跟随鼠标 快捷键1</p>
        <p>选中固定快捷相符屏蔽面板的固定面板值 快捷键2</p>
        <p>隐藏快捷悬浮屏蔽面板 快捷键3</p>
      </div>
    </details>
    <hr>
    <details open>
      <summary>b站SESSDATA</summary>
      <p>该数据一些b站api需要用到，一般情况下不用设置，以下的设置和读取均是需要用户自行添加b站对应的SESSDATA值，读取时候也是读取用户自己添加进去的SESSDATA值，脚本本身不获取b站登录的SESSDATA</p>
      <P>提示：为空字符串则取消移除SESSDATA，不可带有空格</P>
      <div>
        <button title="为空字符串则取消" @click="setSgSessdataBut">设置SESSDATA</button>
        <button @click="getSgSessdataBut">读取SESSDATA</button>
      </div>
      <div>
        <button @click="setBili_jctBut">设置bili_jct</button>
        <button @click="setLogInBili_jctBut">设置b站登录的bili_jct</button>
        <button @click="getLogInBili_jctBut">读取b站登录的bili_jct</button>
        <button @click="getBili_jctBut">读取bili_jct</button>
      </div>
    </details>
    <div style="display: flex">
    <input type="checkbox" v-model="isPrivacyModeCheckbox">开启隐私模式
    </div>
    <div>
    <h1>网络请求</h1>
    <p>默认仅仅只能请求b站的顶级域，如需请求其他的网站，请在油猴中打开本脚本的设置，在XHR安全选项卡中，针对性添加域名白名单，pan.baidu.com，和baidu.com，后者范围更大，前者无法请求到其他百度的子域名。</p>
    请求Url：
    <input type="text" v-model.trim="requestUrl" style="width: 100%">
    Cookie：
    <input type="text" v-model.trim="requestCookie" style="width: 100%">
    <div><select v-model="requestTypeSelect"><option  v-for="item in requestType" :value="item">{{item}}</option></select></div>
    <div><button @click="sendRequestBut">发送请求</button></div>
    <details>
    <summary>相应结果</summary>
    <textarea style="width: 100%;height: 500px" readonly>{{responseResult}}</textarea>
    </details>
    </div>
    <div>
    <h1>其他</h1>
    <button @click="bvToAvBut">bv号转av号</button>
    <button @click="avTObvBut">av号转bv号</button>
    </div>
    <hr>
<details open>
    <summary>GBT乐赏游戏空间</summary>
    <button @click="openGBTWebBut">前往GBT乐赏游戏空间地址</button>
    <button @click="getGBTPageDataInfoBut">初始化页面资源信息</button>
    <button @click="getGBTDataBut">获取页面资源</button>
    <button @click="getGBTFildKeysBut">获取指定key的项目</button>
</details>
<details title="设置之后加载其他动态内容或者刷新页面才生效" open>
<summary>动态</summary>
<input type="checkbox" v-model="isTrendsItemsTwoColumnCheackbox">动态首页动态展示双列显示
</details>
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
          <span>按钮跟随鼠标</span>
          <input id="quickLevitationShield" type="checkbox">
        </div>
       <div>
       <span>固定面板值</span>
       <input id="fixedPanelValueCheckbox" type="checkbox">
       </div>
        <p>用户名：{{upName}}</p>
        <p>UID：<a v-bind:href="'https://space.bilibili.com/'+uid" target="_blank">{{uid}}</a></p>
        <details v-show="videoData.show" :open="videoData.show" @toggle="handleToggle">
        <summary>视频信息</summary>
        <p>标题:{{videoData.title}}</span></p>
        <p>视频BV号:{{videoData.bv}}</span></p>
        <p>视频AV号:{{videoData.av}}</p>
        <img :src="videoData.frontCover" alt="图片显示异常" style="width: 100%;">
        <button @click="addToWatchedBut">添加进已观看</button>
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
    getDonateLayout() {//捐赠页面
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
                <div v-for="item in list" :title="item.name"><img :src="item.src" :alt="item.alt" style="max-height: 500px;">
                <span style="display: flex;justify-content: center;">{{item.name}}</span>
                </div>
        </div>
        <hr>
        <h1 style=" display: flex; justify-content: center;">打赏点猫粮</h1>
    </div>
`);
    }
    , loading: {
        home() {
            const bodyJQE = $("body");
            bodyJQE.prepend(`
      <div id="home_layout" style="display: none">
        <!-- 标签栏 -->
  <ul style="display: flex;justify-content: space-around;padding-top: 10px;" id="tabUl">
    <!-- 每个标签都有一个唯一的ID，可以在后面的标签布局中使用 -->
    <li><button value="panelSetsTheLayout">面板设置</button></li>
    <li><button value="ruleCRUDLayout">规则增删改查-信息-备份与恢复(导出与导入)</button></li>
    <li><button value="homePageLayout">首页</button></li>
    <li><button value="video_params_layout">视频参数</button></li>
    <li><button value="liveLayout">直播列表</button></li>
    <li><button value="watchedListLayout">已观看列表</button></li>
    <li><button value="lookAtItLaterListLayout">稍后再看列表</button></li>
    <li><button value="outputInfoLayout">输出信息</button></li>
    <li><button value="otherLayout">其他</button></li>
    <li><button value="donateLayout">支持打赏作者</button></li>
    <li><button value="ruleCenterLayout">规则中心</button></li>
    <li><button value="accountCenterLayout">账户中心</button></li>
  </ul>
  <!-- 标签布局 -->
  <div class="tab" id="panelSetsTheLayout">
  <div style="display: flex;flex-wrap: wrap;justify-content: flex-start;">
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
        <input type="range" value="100" min="20" max="100" step="0.1" v-model="widthRange">
        <span>{{widthRangeText}}</span>
      </div>
    </div>
    <h1>快捷悬浮面板</h1>
    <input type="checkbox" v-model="isDShieldPanel"><span title="快捷键3可隐藏该快捷悬浮屏蔽面板，快捷键4可切换此开关">禁用快捷悬浮屏蔽面板自动显示</span>
</div><!-- 面板设置布局 -->
  <div class="tab" id="ruleCRUDLayout"></div><!-- 规则增删改查布局 -->
  <div class="tab" id="homePageLayout"></div><!-- 首页布局 -->
  <div class="tab active" id="outputInfoLayout"></div><!-- 输出信息布局 -->
  <div class="tab" id="otherLayout"></div><!-- 其他布局 -->
  <div class="tab" id="liveLayout">
  点击用户名打开直播间,点击用户头像打开用户主页
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
</div>
  <!-- 直播列表布局 -->
</div>
  <div class="tab" id="watchedListLayout">
  <def-list-layout list-layout-name="已观看视频列表"
  :type-list="typeList"
  find-list-type="title"
  :list="watchedList"
  @set-sub-this="setSubThis"
   @search-key-event="searchKey"
  @clear-but="clearWatchedArr"
  @renovate-list-event="renovateLayoutItemList"
  >
  <template #button-list="data">
  <ol>
  <list-item v-for="(item,key) in data.showList"
  :title="item.title"
  :up-name="item.upName"
  :uid="item.uid"
  :bv="item.bv"
  :obj-item="item"
  :front_cover="item.frontCover"
  @del-item-click="delListItem"
  @set-item-click="setListItem"
  ></list-item>
</ol>
</template>
</def-list-layout>
</div><!-- 已观看列表布局 -->
  <div class="tab" id="lookAtItLaterListLayout">
  <def-list-layout
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
</def-list-layout>
  <!-- 稍后再看列表布局 --></div>
  <div class="tab" id="video_params_layout"><!-- 视频参数布局 --></div>
  <div class="tab" id="donateLayout"><!-- 捐赠布局 --></div>
  <div class="tab" id="ruleCenterLayout">
<!-- 规则中心布局 -->
<button disabled><a href="https://www.bilibili.com/read/cv25025973" target="_blank">提示error解决方案</a></button>
<button @click="reloadListBut" v-if="isReloadListButShow">重新加载</button>
<ul style="margin: 0;padding-left: 0">
<rule-center-item v-for="item in list"
:user-name="item.name"
:rule-list="item.ruleList"
:update_time="item.update_time"
:first_push_time="item.first_push_time"
></rule-center-item>
</ul>
<!-- 规则中心布局 -->
</div>
  <div class="tab" id="accountCenterLayout">
        <component v-bind:is="isTab" @tab-click="getTabName"></component>
  <!-- 账户中心布局 --></div>
      </div>
<!-- 分割home_layout -->
    `);
            $("#ruleCRUDLayout").append(layout.getRuleCRUDLayout());
            $("#homePageLayout").append(layout.getHomePageLayout());
            $("#video_params_layout").append(layout.getVideo_params_layout());
            $("#outputInfoLayout").append(layout.getOutputInfoLayout());
            $("#otherLayout").append(layout.getOtherLayout());
            $("#donateLayout").append(layout.getDonateLayout());
            bodyJQE.append(layout.getSuspensionDiv());
        }
    },
    htmlVue: {
        videoPlayVue() {
            return $(`<div style="position: fixed;left: 95%;top: 15%">
<div id="rightLayout" style="display: flex; flex-direction: column;">
<button @click="subItemShowBut">{{subItemButText}}</button>
<div v-show="subItemButShow">
<button @click="addUid">屏蔽(uid)</button>
<button @click="getTheVideoBarrage">获取视频弹幕</button>
<button @click="getTheVideoAVNumber">获取视频av号</button>
<button @click="getVideoCommentArea">获取评论区页面可见数据</button>
<button @click="getLeftTopVideoListBut">获取视频选集列表数据</button>
<button @click="addLefToWatchedBut">添加进已观看</button>
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
    getWebBili_jct() {
        const data = Util.getCookieList()["bili_jct"];
        if (data === undefined) return null;
        return data;
    },
    getBili_jct() {
        return Util.getData("bili_jct", null);
    },
    setBili_jct(key) {
        Util.setData("bili_jct", key);
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
    getWatchedArr() {//获取已观看的视频数组
        return Util.getData("watchedArr", []);
    },
    setWatchedArr(key) {//设置已观看的视频
        Util.setData("watchedArr", key);
    },
    getLookAtItLaterArr() {//获取稍后再看列表
        return Util.getData("lookAtItLaterArr", []);
    },
    setLookAtItLaterArr(arr) {//设置稍后再看列表
        Util.setData("lookAtItLaterArr", arr)
    },
    setPrivacyMode(key) {
        Util.setData("isPrivacyMode", key === true);
    },
    getPrivacyMode() {//隐私模式
        return Util.getData("isPrivacyMode") === true;
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
        getRangePlaySpeed() {
            const data = Util.getData("rangePlaySpeed", 1);
            if (isNaN(data)) {
                return 1;
            }
            return data;
        },
        setRangePlaySpeed(v) {
            Util.setData("rangePlaySpeed", v);
        },
        isVideoEndRecommend() {//是否播放完视频后移除视频推荐
            return Util.getData("videoEndRecommend", false);
        },
        setVideoEndRecommend(bool) {//设置是否播放完视频后移除视频推荐
            Util.setData("videoEndRecommend", bool);
        }

    },
    AccountCenter: {
        getInfo() {//读取本地账户信息
            return Util.getData("AccountCenterInfo", {});
        }, setInfo(key) {//设置本地账户信息
            Util.setData("AccountCenterInfo", key);
        }
    },
    getIsMainVideoList() {//获取是否使用脚本自带的针对于首页的处理效果状态值
        const data = Util.getData("isMainVideoList", false);
        return Util.isBoolean(data);
    },
    setIsMainVideoList(bool) {//设置是否使用脚本自带的针对于首页的处理效果状态值
        Util.setData("isMainVideoList", Util.isBoolean(bool));
    },
    isDShieldPanel() {//是否开启禁用快捷悬浮屏蔽面板自动显示
        return Util.getData("isDShieldPanel") === true;
    },
    setDShieldPanel(v) {//设置禁用快捷悬浮屏蔽面板自动显示
        Util.setData("isDShieldPanel", v === true)
    },
    LockScreen: {
        setState(bool) {
            Util.setData("LockScreenState", bool === true);
        },
        getState() {//返回是否开启锁屏
            return Util.getData("LockScreenState", false);
        },
        setIntervalTime(timeInt) {
            Util.setData("LockScreenIntervalTime", timeInt);
        },
        getIntervalTime() {//返回锁屏间隔时间戳，默认返回5分钟的时间戳
            return Util.getData("LockScreenIntervalTime", 60000 * 5);
        },
        setPwd(pwd) {
            Util.setData("LockScreenPwd", pwd);
        },
        getPwd() {
            return Util.getData("LockScreenPwd", null);
        },
        getTLastTimestamp() {//返回最后锁屏解锁的时间戳
            return Util.getData("LockScreenLastTimestamp", Date.now());
        },
        setTLastTimestamp(timeNov) {//设置最后锁屏解锁的时间戳
            Util.setData("LockScreenLastTimestamp", timeNov);
        }
    },
    setEnableShortcutKeys(is) {
        Util.setData("enableShortcutKeys", is);
    },

    isEnableShortcutKeys() {//获取是否启用了快捷键功能
        return Util.getData("enableShortcutKeys", true);
    }
}
const PanelSetsTheLayout = {//面板设置
    returnVue() {
        const vue = new Vue({
            el: "#panelSetsTheLayout",
            data: {
                backgroundPellucidRange: 1,
                heightRange: 100,
                heightRangeText: "100%",
                widthRange: 100,
                widthRangeText: "100%",
                isDShieldPanel: LocalData.isDShieldPanel()
            },
            watch: {
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
                },
                isDShieldPanel(newVal) {
                    LocalData.setDShieldPanel(newVal);
                    Qmsg.success(`您更改了【禁用快捷悬浮屏蔽面板自动显示】的状态，当前为：${newVal ? "启用" : "不启用"}状态`);
                }
            }
        });
        return function () {
            return vue;
        };
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
                        Qmsg.error("未搜索到指定内容的元素");
                        return;
                    }
                    this.subThis.showList = [];
                    tempList.forEach(value => this.subThis.showList.push(value));
                    Qmsg.success(`已搜索到${length}个符合搜索关键词的项目！`);
                },
                outLookAtItLaterArr() {//导出稍后再看列表数据
                    Util.fileDownload(JSON.stringify(LocalData.getLookAtItLaterArr(), null, 3), `稍后再看列表${Util.toTimeString()}.json`);
                },
                isStringArray(strArray) {
                    if (strArray.startsWith("[") && strArray.endsWith("]")) {
                        const parse = JSON.parse(strArray);
                        if (parse.length === 0) {
                            Qmsg.error("数组未有内容！");
                            return null;
                        }
                        return parse;
                    }
                    Qmsg.error("内容不是json数组！");
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
                    Qmsg.success("追加数据成功！");
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
                    Qmsg.success("覆盖数据成功！");
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
                    Qmsg.success("已清空本地脚本存储的稍后再看列表数据");
                },
                getItemFindIndex(data) {
                    const index = this.lookAtItLaterList.findIndex(value => value === data);
                    if (index === -1) {
                        Qmsg.error(`查找列表中指定item失败!-1`);
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
                        Qmsg.error("查找数据组列表中要删除的item失败！-1");
                        return;
                    }
                    tempLookAtItLaterArr.splice(tempIndex, 1);
                    LocalData.setLookAtItLaterArr(tempLookAtItLaterArr);
                    Qmsg.success(`已删除 ${data.title} 选项，bv=${data.bv}`);
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
                        Qmsg.error("输入的字符不可小于1！");
                        return;
                    }
                    if (value === input) {
                        Qmsg.error("输入的值不能和原有的值相同！");
                        return;
                    }
                    if (key === "uid") {
                        if (isNaN(value)) {
                            Qmsg.error(`输入的uid不是一个数字！`);
                            return;
                        }
                        value = parseInt(value);
                    }
                    const tempLookAtItLaterArr = LocalData.getLookAtItLaterArr();
                    const isKeyArr = ["upName", "uid", "title", "bv"];
                    const tempIndex = tempLookAtItLaterArr.findIndex(value => Util.objEquals(value, item, isKeyArr));
                    if (tempIndex === -1) {
                        Qmsg.error("查找数据组列表中要修改的item失败！-1");
                        return;
                    }
                    item[key] = input;
                    tempLookAtItLaterArr.splice(tempIndex, 1, item);
                    LocalData.setLookAtItLaterArr(tempLookAtItLaterArr);
                    const tip = `已将${keyName}的值=${value}\n改成=${input}`;
                    Qmsg.success(tip);
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
        if (!confirm(`是要将【${data["title"]}】添加进稍后再看列表吗？`)) {
            return;
        }
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
        Qmsg.success("添加成功！")
        alert(`已添加视频【${data["title"]}】至稍后再看列表！`);
    }
}
const Watched = {
    WatchedListVue() {
        return new Vue({
            el: "#watchedListLayout",
            data: {
                subThis: null,
                watchedList: LocalData.getWatchedArr(),
                typeList: ["upName", "uid", "title", "bv"],
            },
            methods: {
                setSubThis(val) {
                    this.subThis = val;
                },
                searchKey(newValue, oldValue) {
                    if (newValue === oldValue || newValue === "") return;
                    const tempList = [];
                    for (const value of LocalData.getWatchedArr()) {
                        if (!value[this.subThis.tempFindListType].toString().includes(newValue)) {
                            continue;
                        }
                        tempList.push(value);
                    }
                    const length = tempList.length;
                    if (length === 0) {
                        Qmsg.error("未搜索到指定内容的元素");
                        return;
                    }
                    this.subThis.showList = [];
                    tempList.forEach(value => this.subThis.showList.push(value));
                },
                clearWatchedArr() {
                    if (!confirm("您确定要进行清空本地脚本存储的已观看列表数据吗，清空之后无法复原，除非您有导出过清空前的数据，请谨慎考虑，是要继续执行清空操作吗？")) return;
                    LocalData.setWatchedArr([]);
                    this.subThis.showList = this.lookAtItLaterList = [];
                    Qmsg.success("已清空本地脚本存储的已观看列表数据");
                },
                renovateLayoutItemList() {
                    this.subThis.showList = LocalData.getWatchedArr();
                },
                delListItem() {
                    //TODO 待开发
                },
                setListItem() {
                    //TODO 待开发
                },
            }
        })
    },
    addWatched(data) {//添加视频到已观看列表流程
        if (!confirm(`是要将【${data["title"]}】添加进已观看列表吗？`)) {
            return;
        }
        const arr = LocalData.getWatchedArr();
        for (const v of arr) {
            const tempTitle = data["title"];
            if (v["title"] === tempTitle) {
                alert(`您已添加该视频【${tempTitle}】！故本轮不添加进去！`);
                return;
            }
        }
        arr.push(data);
        LocalData.setWatchedArr(arr);
        Qmsg.success("添加成功")
        alert(`已添加视频【${data["title"]}】至已观看列表！`);
    }
}
const RuleCRUDLayout = {
    returnVue() {
        const vue = new Vue({
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
                MPSList: ["精确", "模糊", "正则"],
                defaultMPSelect: "模糊",
                debugText: "",
                debugRuleVal: "",
                debugSeC: true,
                debugATestOInput: false,
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
                        Qmsg.error('出现了意外的类型bug:155532');
                        return;
                    }
                    UrleCrud.addShow(selectRUleItem.ruleType, selectRUleItem.ruleName)
                },
                addAll() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                        Qmsg.error('出现了意外的类型bug:155533');
                        return;
                    }
                    const content = this.ruleEditBox;
                    if (content === null) return;
                    if (content === "") {
                        Qmsg.error("请输入正确的内容！");
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
                        Qmsg.error('出现了意外的类型bug:155535');
                        return;
                    }
                    UrleCrud.delItemShow(selectRUleItem.ruleType, selectRUleItem.ruleName);
                },
                delKey() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                        Qmsg.error('出现了意外的类型bug:155537');
                        return;
                    }
                    UrleCrud.delShow(selectRUleItem.ruleType, selectRUleItem.ruleName);
                },
                findKey() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                        Qmsg.error('出现了意外的类型bug:155536');
                        return;
                    }
                    UrleCrud.findKeyShow(selectRUleItem.ruleType, selectRUleItem.ruleName);
                },
                setKey() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                        Qmsg.error('出现了意外的类型bug:155537');
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
                    Print.ln(info);
                    Qmsg.success(info);
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
                            const loading = Qmsg.loading("请稍等...");
                            $.ajax({
                                type: "POST",
                                url: `${defApi}/bilibili/`,
                                data: {
                                    model: "All",
                                    userName: getInfo["userName"],
                                    userPassword: getInfo["userPassword"],
                                    postData: this.getOutRuleDataFormat()
                                },
                                dataType: "json",
                                success({code, message}) {
                                    debugger;
                                    loading.close();
                                    if (code !== 1) {
                                        Qmsg.error(message);
                                        return;
                                    }
                                    Qmsg.success(message);
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
                            const loading = Qmsg.loading("请稍等...");
                            $.ajax({
                                type: "GET",
                                url: `${defApi}/bilibili/`,
                                data: {
                                    model: "getUsers",
                                    userName: getInfo["userName"],
                                    userPassword: getInfo["userPassword"]
                                },
                                dataType: "json",
                                success({message, code, data}) {
                                    loading.close();
                                    if (code !== 1) {
                                        Qmsg.error(message);
                                        return;
                                    }
                                    Qmsg.success(message);
                                    const {rule_content} = data;
                                    ruleCRUDLlayoutVue().inputRuleLocalData(JSON.parse(rule_content));
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
                        Qmsg.info(`${item.ruleName}规则内容为空的！`);
                        return;
                    }
                    Util.openWindowWriteContent(JSON.stringify(data, null, 3));
                },
                debugRule() {
                    if (this.debugText.length === 0 || this.debugRuleVal.length === 0) {
                        Qmsg.error("请正确书写内容！");
                        return;
                    }
                    const mpSelect = this.defaultMPSelect;
                    if (this.debugSeC) {
                        if (!confirm(`当前选中的是${mpSelect}模式，是要进行调试测试吗，用于测试是否能匹配上，如匹配上说明，对应规则可以被处理(屏蔽)`)) {
                            return;
                        }
                    }
                    let loop = false;
                    switch (mpSelect) {
                        case "精确":
                            loop = Matching.arrKey([this.debugRuleVal], this.debugText);
                            break;
                        case "模糊":
                            loop = Matching.arrContent([this.debugRuleVal], this.debugText) || false;
                            break;
                        case "正则":
                            loop = Matching.arrContentCanonical([this.debugRuleVal], this.debugText) || false;
                            break;
                        default:
                            Qmsg.error("出现了意外的值!" + mpSelect);
                            break;
                    }
                    if (loop) {
                        Qmsg.success(`规则测试匹配成功!${mpSelect}模式`);
                    } else {
                        Qmsg.error(`规则测试匹配失败了!${mpSelect}模式`);
                    }
                },
                okDebugRule() {
                    this.debugRule();
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
                debugSeC(newVal) {
                    if (newVal) this.debugATestOInput = false;
                },
                debugATestOInput(newVal) {
                    if (newVal) this.debugSeC = false;
                },
                debugRuleVal() {
                    if (!this.debugATestOInput) return;
                    this.debugRule();
                }
            },
            created() {
                this.updateRuleIndex();
            }
        });
        return function () {
            return vue;
        }
    }
}
const VideoPlayVue = {
    returnVue() {
        const vue = new Vue({
            el: "#rightLayout",
            data: {
                hideButtonLayoutButText: this.showHideButtonLayoutButText(),
                subItemButShow: true,
                subItemButText: "收起",
                hideRightLayoutButText: this.showHideRightLayoutButText(),
                hideTopVideoTitleInfoButText: this.showHideTopVideoTitleInfoButText()
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
                    const loading = Qmsg.loading("正在获取数据中!");
                    const promise = HttpUtil.getVideoInfo(urlBVID);
                    promise.then(res => {
                        const body = res.bodyJson;
                        const code = body["code"];
                        const message = body["message"];
                        if (code !== 0) {
                            Qmsg.error("获取失败!" + message);
                            return;
                        }
                        let data;
                        try {
                            data = body["data"][0];
                        } catch (e) {
                            Qmsg.error("获取数据失败!" + e);
                            return;
                        }
                        if (data === null || data === undefined) {
                            Qmsg.error("获取到的数据为空的!");
                            return;
                        }
                        const cid = data["cid"];
                        Qmsg.success("cid=" + cid);
                        Util.openWindow(`https://comment.bilibili.com/${cid}.xml`);
                    }).catch(err => {
                        Qmsg.error("错误状态!");
                        Qmsg.error(err);
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
                    Qmsg.success("已获取成功！");
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
                            uid: parseInt(Util.getSubWebUrlUid(upInfo.href)),
                            title: document.querySelector(".video-title").textContent,
                            bv: Util.getSubWebUrlBV(Util.getWindowUrl())
                        };
                    } catch (e) {
                        console.error("获取视频信息出现错误！", e);
                        return null;
                    }
                    return data;
                },
                addLefToWatchedBut() {
                    Watched.addWatched(this.localGetVideoInfo())
                },
                addLefToLookAtItLaterListBut() {
                    LookAtItLater.addLookAtItLater(this.localGetVideoInfo())
                },
                isHideButtonLayoutBut() {//隐藏评论区
                    const e = $("#comment,.playlist-comment");
                    if (e.is(":hidden")) {
                        e.show();
                        this.hideButtonLayoutButText = "隐藏评论区";
                        return;
                    }
                    e.hide();
                    this.hideButtonLayoutButText = "显示评论区";
                },
                isHideRightLayoutBut() {
                    const jqE = $(".right-container.is-in-large-ab,.playlist-container--right");
                    if (jqE.length === 0) {
                        alert("获取不到右侧布局！");
                        return;
                    }
                    if (jqE.is(":hidden")) {
                        jqE.show();
                        this.hideRightLayoutButText = "隐藏右侧布局";
                        return;
                    }
                    jqE.hide();
                    this.hideRightLayoutButText = "显示右侧布局";
                },
                isHideTopVideoTitleInfoBut() {
                    const jqE = $("#viewbox_report,.video-info-container");
                    if (jqE.is(":hidden")) {
                        jqE.show();
                        this.hideTopVideoTitleInfoButText = "隐藏顶部视频标题信息";
                        return;
                    }
                    jqE.hide();
                    this.hideTopVideoTitleInfoButText = "显示顶部视频标题信息";
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
                }
            }
        });
        return function () {
            return vue;
        }
    },
    showHideButtonLayoutButText() {
        return LocalData.video.isHideVideoButtonCommentSections() ? "显示评论区" : "隐藏评论区";
    },
    showHideRightLayoutButText() {
        return LocalData.video.isHideVideoRightLayout() ? "显示右侧布局" : "隐藏右侧布局";
    },
    showHideTopVideoTitleInfoButText() {
        return LocalData.video.isHideVideoTopTitleInfoLayout() ? "显示顶部视频标题信息" : "隐藏顶部视频标题信息";
    }

}
const Video_params_layout = {
    returnVue() {
        const vue = new Vue({
            el: "#video_params_layout",
            data: {
                autoPlayCheckbox: LocalData.video.isAutoPlay(),
                videoEndRecommendCheckbox: LocalData.video.isVideoEndRecommend(),
                rangePlaySpeed: LocalData.video.getRangePlaySpeed(),
                playbackSpeedSelect: LocalData.video.getRangePlaySpeed(),
                playbackSpeedList: [0.25, 0.5, 0.75, 0.9, 1, 1.25, 1.35, 1.5, 2],
                isFlipHorizontal: false,
                isFlipVertical: false,
                axleRange: 0,
                hideVideoTopTitleInfoCheackBox: LocalData.video.isHideVideoTopTitleInfoLayout(),
                hideVideoButtonCheackBox: LocalData.video.isHideVideoButtonCommentSections(),
                hideVideoRightLayoutCheackBox: LocalData.video.isHideVideoRightLayout()
            },
            methods: {
                VideoPIPicture() {
                    Util.video.autoAllPictureInPicture();
                },
                preservePlaySpeed() {//保存视频播放速度值
                    const data = this.rangePlaySpeed;
                    if (!confirm(`是要保存视频的播放速度值吗？\n${data}x`)) return;
                    LocalData.video.setRangePlaySpeed(data);
                    Qmsg.success(`已保存视频的播放速度值=${data}x`);
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
                rangePlaySpeed(newVal) {
                    Util.setVideoBackSpeed(newVal);
                },
                playbackSpeedSelect(newVal) {
                    this.rangePlaySpeed = newVal;
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
                }
            }
        });
        return function () {
            return vue;
        }
    }
}
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
                        Qmsg.error("用户未配置sessdata！");
                        return;
                    }
                    Qmsg.success("用户配置了sessdata");
                    this.isLoadFollowLstDisabled = true;
                    const promise = Live.loadAddAllFollowDataList(this.listOfFollowers, sessdata);
                    promise.then(() => {
                        LiveLayoutVue.listOfFollowers = this.listOfFollowers;
                        Qmsg.success(`已临时保存关注列表中正在直播的用户列表，可使用搜索对其进行筛选`);
                    }).finally(() => {
                        this.loadFollowButText = "重新加载";
                        this.isLoadFollowLstDisabled = false;
                    });
                },
                hRecoveryListOfFollowersBut() {
                    this.listOfFollowers = LiveLayoutVue.listOfFollowers;
                    Qmsg.success(`已恢复关注中正在直播的用户列表`);
                },
                //其他分区直播列表
                loadOtherPartitionLiveListBut() {//加载其他分区直播列表
                    const id = this.sPartitionSelectID;
                    const sPartition = this.getSPartitionSelect(id);
                    const parentId = sPartition["parent_id"];
                    if (!confirm(`是要加载${sPartition["parent_name"]} 的子分区 ${sPartition.name} 吗？`)) return;
                    const loading = Qmsg.loading(`正在获取中！`);
                    const promise = Live.getOthersAreWorkingLiveDataList(parentId, id);
                    promise.then(value => {
                        if (!value.partitionBool) {
                            this.otherLoadMoreIf = true;
                        }
                        this.partitionPage++;//默认第一次加载成功加1，为2
                        this.loadedPartition = sPartition;
                        const info = value["info"];
                        if (info) {
                            Qmsg.error(`info:${info}`);
                        }
                        const tempList = value.dataList;
                        this.otherLiveRoomList = tempList;//清空列表并赋予新表
                        LiveLayoutVue.otherLiveRoomList = tempList;
                        Qmsg.success(`获取成功！已获取到${tempList.length}个直播间`);
                    }).catch(reason => {
                        Qmsg.error(reason.errorText);
                        console.log(reason.err);
                    }).finally(() => {
                        loading.close();
                    });
                },
                otherLoadMoreBut() {
                    const id = this.sPartitionSelectID;
                    const sPartition = this.getSPartitionSelect(id);
                    const parentId = sPartition["parent_id"];
                    const loading = Qmsg.loading(`正在获取更多！`);
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
                            Qmsg.error(`info:${info}`);
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
                        Qmsg.success(`获取成功！已获取到${dataList.length}个直播间，累计${this.otherLiveRoomList.length}个直播间`);
                    }).catch(reason => {
                        Qmsg.error(reason.errorText);
                        console.log(reason.err);
                    }).finally(() => {
                        loading.close();
                    });
                },
                hRecoveryOtherLiveRoomListBut() {
                    this.otherLiveRoomList = LiveLayoutVue.otherLiveRoomList;
                    Qmsg.success(`已恢复其他分区正在直播的列表`);
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
                        Qmsg.error("请正确书写！");
                        return;
                    }
                    const subPartition = this.godchildPartitionsSpecifiedParentPartition(parentName, input);
                    if (subPartition === null) {
                        alert(`未在父分区${parentName}查询到子分区 ${input} ！`);
                        return;
                    }
                    this.sPartitionSelect = subPartition;
                    this.sPartitionSelectID = subPartition.id;
                    Qmsg.success(`已在父分区${parentName}查询到子分区${subPartition.name} ！`);
                },
                findSubPartitionBut() {
                    let input = prompt(`请输入您要查询的子分区名是什么(可模糊匹配，仅匹配第一个)`);
                    if (input === null) return;
                    input = input.trim();
                    if (input === "") {
                        Qmsg.error("请正确书写！");
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
                    Qmsg.success(`已在父分区${obj["parent_name"]}查询到子分区${obj.name} ！`);
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
                        Qmsg.error(`未搜索到正在直播中用户名包含关键词 ${newVal} 的用户！`);
                        return;
                    }
                    this.listOfFollowers = tempList;
                    this.hRecoveryListOfFollowersIf = true;
                    Qmsg.success(`已搜索到${tempSize}个符合搜索关键词的项目！`);
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
                        Qmsg.error(`未搜索到正在直播中用户名包含关键词 ${newVal} 的用户！`);
                        return;
                    }
                    this.hRecoveryOtherLiveListIf = true;
                    this.otherLiveRoomList = tempList;
                    Qmsg.success(`已搜索到${tempSize}个符合搜索关键词的项目！`);
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
const OtherLayoutVue = {
    returnVue() {
        const vue = new Vue({
            el: "#otherLayout",
            data: {
                isPrivacyModeCheckbox: LocalData.getPrivacyMode(),
                //网络请求Url
                requestUrl: "",
                requestTypeSelect: "get",
                requestType: ["get",
                    // "post"
                ],
                responseResult: "",
                requestCookie: "",
                isTrendsItemsTwoColumnCheackbox: Trends.data.getTrendsItemsTwoColumnCheackbox(),
                BWebOpenList: {
                    "稍后再看列表": "https://www.bilibili.com/watchlater/?spm_id_from=333.1007.0.0#/list",
                    "稍后再看播放列表": "https://www.bilibili.com/watchlater",
                    "直播中心": "https://link.bilibili.com/p/center/index",
                    "素材库平台": "coolHome",
                    "频道": "https://www.bilibili.com/v/channel",
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
                        Qmsg.error("内容中包含空格或者=，请去除相关符号！");
                        return;
                    }
                    if (!confirm(`要保存的SESSDATA是\n${content}`)) {
                        return;
                    }
                    LocalData.setSESSDATA(content);
                    Qmsg.success("已设置SESSDATA的值！");
                },
                getSgSessdataBut() {
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
                },
                setBili_jctBut() {
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
                },
                setLogInBili_jctBut() {
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
                },
                getLogInBili_jctBut() {
                    const data = LocalData.getWebBili_jct();
                    if (data === null) {
                        Qmsg.error(`获取不到存储在网页中的bili_jct值:`);
                        return;
                    }
                    Qmsg.success("已获取到存储在网页中的bili_jct值，已输出到面板上");
                    Print.ln(data);
                },
                getBili_jctBut() {
                    const biliJct = LocalData.getBili_jct();
                    if (biliJct === null) {
                        Qmsg.error(`用户未设置bili_jct值`);
                        return;
                    }
                    Qmsg.success("获取成功！，已将bili_jct值输出到面板上");
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
                    const dec = bilibiliEncoder.dec(content);
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
                    const dec = bilibiliEncoder.enc(content);
                    if (!dec.startsWith("BV")) {
                        alert("结果错误！");
                        return;
                    }
                    alert(dec);
                },
                openGBTWebBut() {
                    if (Util.getWindowUrl().includes("http://gbtgame.ysepan.com")) {
                        alert("当前网站就是GBT乐赏游戏空间");
                        return;
                    }
                    Util.openWindow("http://gbtgame.ysepan.com/");
                },
                getGBTPageDataInfoBut() {
                    GBTGame.init();
                },
                getGBTDataBut() {
                    GBTGame.getData();
                },
                getGBTFildKeysBut() {
                    const key = prompt("请输入您要搜索的内容");
                    if (key === null) return;
                    if (key.includes(" ") || key === "") {
                        alert("请正确填写您要搜索的内容！");
                        return;
                    }
                    const findList = GBTGame.find(key);
                    const filter = Object.keys(findList);
                    if (filter.length === 0) {
                        const info = "并未搜索到您想要的资源，key=" + key;
                        Print.ln(info);
                        Qmsg.info(info);
                        alert(info);
                        return;
                    }
                    const info = `已找到了${filter.length}个资源，并输出到控制台上，且用户接下来可以将其保存在电脑上！`;
                    alert(info);
                    const findJsonListStr = JSON.stringify(findList, null, 3);
                    console.log(findList);
                    console.log(findJsonListStr);
                    Qmsg.success(info);
                    Util.fileDownload(findJsonListStr, `搜索GBT乐赏游戏空间关键词为【${key}】 的资源${filter.length}个.json`);
                },
                openBWeb(item, name) {
                    if (!confirm(`是要前往 ${name} 吗？`)) return;
                    Util.openWindow(item);
                },
                sendRequestBut() {
                    const requestUrl = this.requestUrl;
                    const cookie = this.requestCookie;
                    if (!(requestUrl.startsWith("https://") || requestUrl.startsWith("http://"))) {
                        Qmsg.error("请正确填写请求地址！");
                        return;
                    }
                    const requestType = this.requestTypeSelect;
                    const promise = HttpUtil.getCookie(requestUrl, cookie);
                    const loading = Qmsg.loading(`正在使用${requestType}请求 请求地址${requestUrl}中！`);
                    promise.then(data => {
                        Qmsg.success("请求成功！");
                        this.responseResult = data.body;
                        console.log(data);
                    }).catch(reason => {
                        Qmsg.error("相应失败！");
                        console.error(reason);
                    }).finally(() => {
                        loading.close();
                    });
                }
            },
            watch: {
                isPrivacyModeCheckbox(newVal) {
                    LocalData.setPrivacyMode(newVal);
                },
                isTrendsItemsTwoColumnCheackbox(newVal) {
                    Trends.data.setTrendsItemsTwoColumnCheackbox(newVal);
                }
            }
        });
        return function () {
            return vue;
        }
    }
};
const DonateLayoutVue = {
    returnVue() {
        const vue = new Vue({
            el: "#donateLayout",
            data: {
                list: [
                    {
                        name: "支付宝赞助",
                        alt: "支付宝支持",
                        src: "https://hangexi.gitee.io/datafile/img/paymentCodeZFB.png"
                    },
                    {name: "微信赞助", alt: "微信支持", src: "https://hangexi.gitee.io/datafile/img/paymentCodeWX.png"},
                    {name: "QQ赞助", alt: "QQ支持", src: "https://hangexi.gitee.io/datafile/img/paymentCodeQQ.png"},
                ]
            }
        });
        return function () {
            return vue;
        }
    }
}
const HomePageLayoutVue = {
    getVideo_zoneList() {
        return Home.data.video_zoneList;
    },
    getChannel_idList() {
        return frequencyChannel.data.channel_idList;
    },
    returnVue() {
        const vue = new Vue({
            el: "#homePageLayout",
            data: {
                isMainVideoListCheckbox: LocalData.getIsMainVideoList(),
                pushTypeSelect: Home.getPushType(),
                pushTypeList: ["分区", "频道"],
                sort_typeSelect: "hot",
                sort_typeList: {hot: "近期热门", view: "播放最多(近30天投稿)", new: "最新投稿"},
                isIdCheckbox: false,
                //是否要显示频道的一级select
                isChannelSelect: false,
                showListSelect: 0,
                showList: {},
            },
            methods: {
                findBut() {//TODO 待测试
                    const inputs = prompt("查询的类型关键词");
                    if (inputs === null) return;
                    if (inputs === "" || inputs.includes(" ")) {
                        Qmsg.error("请正确输入内容");
                        return;
                    }
                    const listMap = this.showList;
                    if (this.isIdCheckbox) {
                        if (inputs in listMap) {
                            this.showListSelect = inputs;
                            Qmsg.success(`通过ID的方式找到该值！id=${inputs} 值=${listMap[inputs]}`);
                            return;
                        }
                    } else {
                        for (let v in listMap) {//通过遍历字典中的value，该值包含于tempContent时成立
                            if (!listMap[v].includes(inputs)) continue;
                            this.showListSelect = v;
                            Qmsg.success(`通过value找到该值！=${inputs}`);
                            return;
                        }
                    }
                    Qmsg.error("未找到该值！");
                },
                okBut() {
                    const pushType = this.pushTypeSelect;
                    const showListSelect = parseInt(this.showListSelect);
                    let tip;
                    if (pushType === "分区") {
                        tip = `选择了分区${this.showList[showListSelect]} 进行指定推送 id=${showListSelect}`;
                        LocalData.setVideo_zone(showListSelect);
                    } else {
                        const temp = this.sort_typeSelect;
                        tip = `选择了${this.sort_typeList[temp]}的频道${this.showList[showListSelect]}进行指定推送 id=${showListSelect}`;
                        frequencyChannel.setChannel_id(showListSelect);
                        frequencyChannel.setSort_type(temp);
                    }
                    Home.setPushType(pushType);
                    alert("已设置！\n" + tip)
                }
            },
            watch: {
                isMainVideoListCheckbox(newVal) {
                    LocalData.setIsMainVideoList(newVal);
                },
                pushTypeSelect(newVal) {
                    if (newVal === "分区") {
                        this.showList = HomePageLayoutVue.getVideo_zoneList();
                        this.isChannelSelect = false;
                        this.showListSelect = LocalData.getVideo_zone();
                    } else {
                        this.showList = HomePageLayoutVue.getChannel_idList();
                        this.isChannelSelect = true;
                        this.showListSelect = frequencyChannel.getChannel_id();
                        this.sort_typeSelect = frequencyChannel.getSort_type();
                    }
                }
            },
            created() {
                switch (Home.getPushType()) {
                    case "频道":
                        this.sort_typeSelect = frequencyChannel.getSort_type();
                        this.showList = HomePageLayoutVue.getChannel_idList();
                        this.showListSelect = frequencyChannel.getChannel_id();
                        this.isChannelSelect = true;
                        break;
                    default:
                        this.showList = HomePageLayoutVue.getVideo_zoneList();
                        this.showListSelect = LocalData.getVideo_zone();
                        this.sort_typeSelect = frequencyChannel.getSort_type();
                        break;
                }
            }
        });
        return function () {
            return vue;
        }
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
        const vue = new Vue({
            el: "#ruleCenterLayout",
            data: {
                list: [],
                isReloadListButShow: false,
            },
            methods: {
                reloadListBut() {
                    const loading = Qmsg.loading("正在重新加载，请稍等...");
                    this.isReloadListButShow = false;
                    const promise = RuleCenterLayoutVue.httpGetList();
                    promise.then(dataBody => {
                        Qmsg.success(dataBody.message);
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
        return function () {
            return vue;
        }
    }
}
const SuspensionDivVue = {
    returnVue() {
        const vue = new Vue({//快捷悬浮屏蔽面板的vue
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
                addToWatchedBut() {
                    Watched.addWatched(this.getVideoData());
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
                    const loading = Qmsg.loading("正在获取中！");
                    const promise = HttpUtil.get(`https://api.bilibili.com/x/web-interface/card?mid=${this.uid}&photo=false`);
                    promise.then(res => {
                        const body = res.bodyJson;
                        if (body["code"] !== 0) {
                            Qmsg.error("请求失败！");
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
        return function () {
            return vue;
        }
    }
}
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
                            <img src="https://hangexi.gitee.io/datafile/img/defaultAvatar.png"
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
                                    <button @click="publicStateBut">公开我的规则</button>
                                    <button @click="notPublicStateBut">不公开我的规则</button>
                                    <input type="checkbox" v-model="isAnonymityCheckbox"><span
                                    title="选中为匿名公布，反之不匿名公布，每次提交会覆盖上一次的匿名状态">是否匿名公布(鼠标悬停我提示信息)</span>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <div style="display: flex;justify-content: center;">
                            <button>
                                <a href="https://www.mikuchase.ltd/web/#/registerAndLogIn" target="_blank">注册</a>
                            </button>
                            <button @click="exitSignBut">退出登录</button>
                        </div>
                        </div>`,
                    data() {
                        return {
                            userName: "我是用户名占位符",
                            addTime: "我是注册时间占位符",
                            pwd: "",
                            sharedState: false,
                            isAnonymityCheckbox: false

                        }
                    },
                    methods: {
                        exitSignBut() {
                            if (!confirm("您确定要退出登录吗")) return;
                            LocalData.AccountCenter.setInfo({});
                            Qmsg.success("已退出登录！");
                            this.$emit("tab-click", "notLogin");
                        },
                        publicStateBut() {
                            if (!confirm("确定要公开自己的规则吗？\n匿名状态=" + this.isAnonymityCheckbox)) return;
                            ruleSharingSet(this.userName, this.pwd, true, this.isAnonymityCheckbox);
                        },
                        notPublicStateBut() {
                            if (!confirm("确定不公开自己的规则吗？")) return;
                            ruleSharingSet(this.userName, this.pwd, false, false);
                        }
                    },
                    created() {
                        let {name, pwd, share, addTime} = LocalData.AccountCenter.getInfo();
                        debugger;
                        this.userName = name;
                        this.addTime = Util.timestampToTime(addTime);
                        this.sharedState = share;
                        this.pwd = pwd;
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
                                <a href="https://www.mikuchase.ltd/web/#/registerAndLogIn" target="_blank">注册</a>
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
                            const loading = Qmsg.loading("正在登录中...");
                            const promise = HttpUtil.get(`${defApi}/bilibili/signInToRegister.php?userName=${this.userName}&userPassword=${this.userPwd}&model=logIn`);
                            promise.then(({bodyJson: body}) => {
                                const {code, message, userData} = body;
                                if (code !== 1) {
                                    Qmsg.error(message);
                                    return;
                                }
                                let {rule_content} = userData;
                                rule_content = JSON.parse(rule_content);
                                debugger;
                                try {
                                    delete userData["rule_content"];
                                } catch (e) {
                                    console.error("登录时出错！", e);
                                }
                                if (confirm("是要将云端规则导入覆盖本地规则吗？")) {
                                    ruleCRUDLlayoutVue().inputRuleLocalData(rule_content);
                                }
                                LocalData.AccountCenter.setInfo(userData);
                                Qmsg.success(message);
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


/**
 *
 * 设置规则共享
 * @param userName
 * @param userPassword
 * @param {boolean}shareBool 共享状态
 * @param {boolean}anonymityBool 匿名状态
 */
function ruleSharingSet(userName, userPassword, shareBool, anonymityBool) {
    const loading = Qmsg.loading("请稍等...");
    $.ajax({
        type: "POST",
        url: `${defApi}/bilibili/`,
        data: {
            model: "setShare",
            userName: userName,
            userPassword: userPassword,
            share: shareBool,
            anonymity: anonymityBool
        },
        dataType: "json",
        success({message, code, share}) {
            loading.close();
            if (code !== 1) {
                Qmsg.error(message);
                return;
            }
            const getInfo = LocalData.AccountCenter.getInfo();
            if (Object.keys(getInfo).length === 0) {
                Qmsg.error("更新本地账户信息错误！");
                return;
            }
            getInfo["share"] = share;
            LocalData.AccountCenter.setInfo(getInfo);
            Qmsg.success(message);
        }, error(xhr, status, error) {
            loading.close();
            console.log(error);
            console.log(status);
        }
    });
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
const UrleCrud = {//规则的增删改查
    addShow(ruleType, ruleName, content = null) {
        if (content === null) {
            content = prompt(`要添加的类型为${ruleName}，请在输入框中填写要添加的具体值规则.`);
            if (content === null) return false;
            content = content.trim();
            if (content === "") {
                Qmsg.error("请输入正确的内容！");
                return false;
            }
        }
        if (ruleType === "userUIDArr" || ruleType === "userWhiteUIDArr") {
            if (isNaN(content)) {
                Qmsg.error(`输入的内容不是一个数字！value=${content}`);
                return false;
            }
            content = parseInt(content);
        }
        if (!confirm(`是要添加的${ruleName}规则为：\n${content}\n类型为：${typeof content}`)) {
            return false;
        }
        let ruleDataList = Util.getData(ruleType, []);
        return this.add(ruleDataList, content, ruleType);
    },
    addAllShow(ruleType, ruleName, jsonStrContent) {
        if (ruleType === "userUIDArr" || ruleType === "userWhiteUIDArr") {
            alert("暂不支持uid和白名单uid批量添加");
            return false;
        }
        let json;
        if (typeof jsonStrContent !== "string") {
            return false;
        }
        jsonStrContent = jsonStrContent.trim();
        try {
            json = JSON.parse(jsonStrContent);
        } catch (e) {
            Qmsg.error(`内容不正确！内容需要数组或者json格式！错误信息=${e}`);
            console.error("内容不正确！内容需要数组或者json格式！错误信息", e);
            return false;
        }
        const ruleList = Util.getData(ruleType, []);
        return this.addAll(ruleList, json, ruleType);
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
        Qmsg.success(`添加${ruleType}的值成功=${key}`);
        ruleCRUDLlayoutVue().updateRuleIndex();
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
        for (const value of contentList) {
            set.add(value);
        }
        if (set.size === ruleList.length) {
            Print.ln("内容长度无变化，可能是已经有了的值")
            return false;
        }
        const fromList = Array.from(set);
        Util.setData(ruleType, fromList);
        console.log(`已更新${ruleType}的数组`, fromList);
        ruleCRUDLlayoutVue().updateRuleIndex();
        return true;
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
        Print.ln("已经删除该元素=" + content);
        ruleCRUDLlayoutVue().updateRuleIndex();
        return true;
    },
    delShow(ruleType, ruleName, content = null) {
        if (content === null) {
            content = prompt(`要删除的类型为${ruleName}，请在输入框中填写要添加的具体值规则.`);
            if (content === null) return false;
            content = content.trim();
            if (content === "") {
                Qmsg.error("请输入正确的内容！");
                return false;
            }
        }
        if (ruleType === "userUIDArr" || ruleType === "userWhiteUIDArr") {
            if (isNaN(content)) {
                Qmsg.error(`输入的内容不是一个数字！value=${content}`);
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
            Qmsg.success(`删除指定规则内容成功！content=${content}`);
        } else {
            Qmsg.error(`删除失败，未找到该规则！content=${content}`);
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
        if (!confirm(`是要删除指定项目${ruleName}的规则吗？`)) {
            return;
        }
        if (this.delItem(ruleType)) {
            Qmsg.success(`已删除${ruleName}的规则内容！`);
        } else {
            Qmsg.error(`删除失败！可能是不存在指定项目${ruleName}的规则内容！`);
        }
        ruleCRUDLlayoutVue().updateRuleIndex();
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
                Qmsg.error(`输入的内容不是一个数字！value=${key}`);
                return false;
            }
            key = parseInt(key);
        }
        let tip;
        if (this.findKey(ruleType, key, [])) {
            tip = `搜索的${ruleName}规则值已存在！find=${key}`;
            Qmsg.success(tip);
            console.log(tip, key);
            Print.ln(tip);
            return;
        }
        tip = `搜索的${ruleName}规则值不存在！find=${key}`;
        Qmsg.error(tip);
        console.log(tip, key);
        Print.ln(tip);
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
            Qmsg.success(`修改${ruleName}规则成功！,已将 ${oldValue} 修改成 ${newValue}的值！`);
            return;
        }
        Qmsg.error(`修改${ruleName}规则失败！`);
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
        //只要json类的
        if (url.includes("api.bilibili.com/x/web-interface/web/channel") && windowUrl.includes("www.bilibili.com/v/channel")) {
            //针对于频道界面的综合视频和频道界面的精选视频
            frequencyChannel.videoRules();
            frequencyChannel.listRules();
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
            console.log("视频api");
            const p = new Promise(resolve => {
                const i1 = setInterval(() => {
                    if (document.querySelector(".reply-list>.reply-loading") !== null) {
                        return;
                    }
                    clearInterval(i1);
                    resolve(document.querySelectorAll(".reply-list>.reply-item"));

                }, 1000);
            });
            const list = await p;
            for (let v of list) {//针对于评论区
                const usercontentWarp = v.querySelector(".content-warp");
                const data = Trends.getVideoCommentAreaOrTrendsLandlord(usercontentWarp);
                if (startPrintShieldNameOrUIDOrContent(v, data)) {
                    Qmsg.success("屏蔽了言论！！");
                    continue;
                }
                const jqE = $(usercontentWarp);
                if (!Util.isEventJq(jqE, "mouseover")) {
                    jqE.mouseenter((e) => {
                        const domElement = e.delegateTarget;
                        const data = Trends.getVideoCommentAreaOrTrendsLandlord(domElement);
                        Util.showSDPanel(e, data);
                    });
                }
                const subReplyList = v.querySelectorAll(".sub-reply-container>.sub-reply-list>.sub-reply-item");//楼主下面的评论区
                if (subReplyList.length === 0) {
                    continue;
                }
                for (let j of subReplyList) {
                    const data = Trends.getVideoCommentAreaOrTrendsStorey(j);
                    if (startPrintShieldNameOrUIDOrContent(j, data)) {
                        Qmsg.success("屏蔽了言论！！");
                        continue;
                    }
                    const jqE = $(j);
                    if (Util.isEventJq(jqE, "mouseover")) {
                        continue;
                    }
                    jqE.mouseenter((e) => {
                        const domElement = e.delegateTarget;
                        Util.showSDPanel(e, Trends.getVideoCommentAreaOrTrendsStorey(domElement));
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
                        Print.ln(`已通过标题黑名单关键词屏蔽【${isTitle}】标题【${title}】`);
                        q.remove();
                        continue;
                    }
                    const isTitleCanonical = Matching.arrContentCanonical(LocalData.getArrTitleKeyCanonical(), title);
                    if (isTitleCanonical != null) {
                        Print.ln(`已通过标题正则黑名单关键词屏蔽【${isTitleCanonical}】标题【${title}】`);
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
            Qmsg.info("检测到搜索的接口");
            //search.searchRules();
            continue;
        }
        if (url.includes("https://api.bilibili.com/x/web-interface/wbi/index/top/feed/rcmd?web_location")) {//首页换一换
            Home.startShieldMainVideo(".container.is-version8>.feed-card").then(() => {
                Home.startShieldMainVideo(".container.is-version8>.bili-video-card");//换一换下面的视频
            });
        }

    }
    performance.clearResourceTimings();//清除资源时间
}
/**
 * 频道
 */
const frequencyChannel = {//频道
    data: {
        //需要给出个初始值，之后可以迭代生成，如果为空字符串则为从顶部内容获取
        offsetData: {
            //k是频道id，v是当时加载的坐标
        },
        channel_idList: JSON.parse(`{"32154017":"铃芽之旅","28612663":"绝望主夫","26649160":"OPPO Reno系列","26598150":"万里归途","26493662":"红发歌姬","25712509":"分手的决心","24991047":"穿靴子的猫2","24837361":"尘白禁区","24797875":"吴海嫄","24709355":"保你平安","24622360":"张圭珍","24234843":"瞬息全宇宙","24142652":"荣耀Magic4","24011272":"华硕天选3","23903809":"隐入尘烟","23784795":"哥，你好","23472254":"OPPO Find X5","23128970":"OPPOFindN","23111206":"坏蛋联盟","23069590":"长空之王","23012765":"惠普暗影精灵8","22692325":"特级英雄黄继光","22405153":"舞千年","22360063":"宇宙探索编辑部","21910538":"OPPO Reno8","21813182":"重启之深渊疑冢","21744669":"崩坏：星穹铁道","21716895":"NMIXX","21532737":"SULLYOON","21296875":"一加9RT","21035961":"JINNI","20994127":"iPad Air 5","20834278":"IXFORM","20539337":"惠普暗影精灵7","20473564":"华为MatePad11","20321738":"这个杀手不太冷静","20307965":"红米K50","20223881":"突如其来的假期","19943077":"红米note系列","19745832":"90婚介所","19730584":"ROG幻16","19497246":"INTO1","19435281":"荣耀50","19364474":"海的尽头是草原","19355660":"我的音乐你听吗","19343572":"三星S22","19314402":"iPhone 13 Pro Max","19273662":"小米平板5Pro","19260443":"黑白魔女库伊拉","19191975":"联想R9000P","19173782":"边缘行者","18980818":"真我GT Neo","18881813":"我和我的父辈","18800082":"戴尔G15","18781771":"OPPO Find系列","18713957":"夏日友晴天","18702977":"新神榜杨戬","18637623":"段星星","18461688":"iQOONeo5","18385266":"孙滢皓","18291899":"iPad Pro 2021","18131330":"华硕天选2","18096401":"蛋仔派对","18063440":"尹浩宇","18038215":"拜年纪","17742752":"少女前线：云图计划","17703835":"魔法满屋","17701752":"赞多","17681251":"世间有她","17532495":"乃琳Queen","17532493":"向晚大魔王","17532492":"珈乐Carol","17532491":"贝拉kira","17532487":"嘉然今天吃什么","17495108":"爱很美味","17326659":"丁真","17309798":"RTX3050","17291794":"时光代理人","17118359":"aespa","16920302":"到了30岁还是处男，似乎会变成魔法师","16915022":"尼康Z9","16815381":"雄狮少年","16760361":"恐鬼症","16569298":"刘彰","16565023":"萨勒芬妮","16517835":"全员恶玉","16371649":"女王的棋局","16286545":"黎明觉醒:生机","16230013":"黑神话悟空","16215530":"花束般的恋爱","16206465":"松下S5","16051534":"金刚川","16048272":"外太空的莫扎特","15864005":"歪嘴战神","15843383":"凡尔赛文学","15775524":"必剪创作","15545355":"硬糖少女303","15485817":"超猎都市","15396883":"尼康Z5","15303231":"红米K40","14971139":"THE9","14930011":"iPhone 13 Pro","14889376":"张嘉元","14763345":"华为P50","14684850":"Helltaker","14644759":"糖豆人","14586712":"佳能R6","14478476":"刺客信条：英灵殿","14447810":"小米12","14377864":"说唱新世代","14350779":"唇泥","14206339":"三国志幻想大陆","14137182":"大威天龙","14006162":"黑人抬棺","13899485":"黄绿合战5th-绿队应援","13898921":"淡黄的长裙，蓬松的头发","13882551":"黄绿合战5th-黄队应援","13771460":"华硕天选","13650742":"心灵奇旅","13565555":"郑乃馨","13497041":"VALORANT","13374029":"网抑云","13256029":"罗一舟","13227355":"小米平板5","13128843":"富士XT4","12966836":"新型冠状病毒肺炎","12908731":"小麻薯","12900282":"诸葛大力","12839538":"ROG幻14","12798880":"松下GH6","12779915":"风犬少年的天空","12769132":"B站跨年晚会","12620189":"异度侵入","12615391":"国王排名","12614370":"永劫无间","12494013":"白神遥Haruka","12364750":"LPL全明星","12361985":"独行月球","12291142":"荣耀Magic系列","12247979":"港诡实录","12244365":"禁止套娃","12238584":"哈利波特魔法觉醒","12193316":"我和你荡秋千","12101103":"绯赤艾莉欧","12095773":"危机合约","12075986":"明月照我心","12058043":"不止不休","12050439":"时代少年团","11956030":"钢铁洪流进行曲","11932853":"高卿尘","11874831":"大田后生仔","11847238":"动物狂想曲","11844018":"红晓音Akane","11817907":"三国志·战略版","11782259":"健身环大冒险","11744330":"DRX","11545680":"窝窝头一块钱四个","11485295":"周柯宇","11364186":"剑与远征","11312447":"动感视频","11302041":"妄想破绽","11264602":"乔碧萝","11154180":"野狼disco","10959020":"韩美娟","10876266":"云顶之弈","10866186":"BANG DREAM","10795681":"R1SE","10792874":"联想Y7000P","10776794":"重生细胞","10703999":"漫威超级战争","10693945":"绿豆传","10665758":"雨女无瓜","10661492":"解神者","10654559":"鲨鱼夹","10639865":"阴阳师妖怪屋","10615728":"人类迷惑行为","10558065":"艾因Eine","10462022":"美食纪","10404390":"德鲁纳酒店","10341766":"部落与弯刀","10294120":"和平精英","10258098":"UNINE","10206956":"赵让","10168179":"悬崖之上","10137307":"华为P40","10074413":"AB6IX","10026108":"Phigros","9997553":"iPhone13","9990565":"神楽七奈","9972781":"Among Us","9964268":"我们离婚了","9963814":"iPhone 12","9962627":"有娜","9957165":"彩领","9955064":"双生视界","9942751":"坎公骑冠剑","9926699":"宝可梦剑盾","9881291":"阴阳师：百闻牌","9799759":"马里奥制造2","9751395":"正念冥想","9741441":"流浪地球2","9734740":"APEX英雄","9681631":"李佳琦","9677800":"轮到你了","9601977":"助眠音乐","9572398":"哪吒之魔童降世","9229031":"自走棋","9226744":"刀塔自走棋","9183946":"人潮汹涌","9175940":"威神V","9175551":"疾速追杀4","9167687":"犬山玉姬","9139179":"李彩演","9119431":"影音设备","9086461":"隐形守护者","9061851":"龙族幻想","9057499":"金采源","9045711":"阿梓从小就很可爱","9034851":"乐评盘点","9010971":"元龙","9003961":"姚昱辰","9002442":"李振宁","8980226":"穿戴甲","8975578":"天外世界","8967933":"因为太怕痛就全点防御力了","8890222":"巴斯克蛋糕","8877740":"一条小团团","8861115":"奥比岛手游","8775876":"谢可寅","8751822":"hololive","8731911":"蔡程昱","8717390":"高天鹤","8703278":"余宇涵","8646504":"机动战姬：聚变","8623556":"五等分的新娘","8607584":"崔叡娜","8593145":"荣耀手表","8583026":"天使降临到我身边","8517908":"K/DA","8509591":"毒液2","8505910":"礼志","8491410":"神探大战","8486440":"黑袍纠察队","8477796":"朱志鑫","8404892":"包桑","8402119":"战斗吧歌姬","8359677":"白蛇缘起","8314661":"刘扬扬","8249031":"DWG","8228054":"湊あくあ","8227542":"蚁人3","8203176":"索尼A7M4","8190619":"童禹坤","8187638":"陈天润","8186374":"张极","8164028":"mur猫","8129516":"建厚","8122256":"苏新皓","8122205":"穆祉丞","8069134":"2019拜年祭","8010631":"魅族18","7990197":"对王之王","7984793":"妻子的味道","7945544":"原神","7936717":"唐九洲","7917965":"炎炎消防队","7897308":"大王不高兴","7873955":"我的起源","7850505":"任敏","7784727":"肖宇梁","7761795":"本间向日葵","7751160":"黄冠亨","7744030":"肖俊","7740510":"鬼畜剧场","7709426":"苹果MacBook","7703005":"假面骑士时王","7700690":"战双帕弥什","7699988":"搞笑挑战","7662506":"曺柔理","7660345":"赵小棠","7646054":"金子涵","7619886":"宿伞之魂","7614030":"太吾绘卷","7589109":"翟潇闻","7562902":"神楽めあ","7556105":"沙雕新闻","7549675":"许愿神龙","7528653":"火箭少女101","7520997":"潘大帅","7515820":"沙雕动画","7497510":"金珉周","7475190":"刘宇宁","7473181":"MUSEDASH","7458282":"公主连结","7452435":"乐言","7445930":"假面骑士zio","7439509":"雷神4","7433905":"赤井心","7433507":"雀魂","7424663":"仁王2","7417100":"只狼","7416210":"对马岛之魂","7416144":"留真","7414788":"夏色祭","7407694":"忍者必须死3","7401538":"人生大事","7360534":"CFHD","7355391":"白上吹雪","7335684":"韩商言","7322971":"姜惠元","7315974":"NBA2K19","7308895":"徐穗珍","7295336":"元歌","7268790":"宋继扬","7241942":"张元英","7235148":"李彩燕","7144106":"宋制汉服","7133808":"GIAO哥","7131448":"小可学妹","7116756":"沙雕广告","7076806":"水果吃法","7076332":"范闲","7054552":"云视听小电视","7040396":"好莱坞往事","7011428":"总之就是非常可爱","6976876":"奈布","6973898":"使命召唤手游","6969906":"罗布奥特曼","6955654":"王牌战士","6947904":"叶舒华","6945542":"(G)I-DLE","6865534":"约战：精灵再临","6855974":"侏罗纪世界3","6844730":"段奥娟","6826050":"NINEPERCENT","6815716":"起泡胶","6778342":"闪耀暖暖","6775630":"猫宫日向","6773882":"一起来捉妖","6627240":"周诗雨","6624022":"有线耳机","6622258":"沙雕图","6621182":"少年的你","6617838":"SKY光遇","6579446":"傅菁","6572048":"租借女友","6530230":"特鲁索娃","6512894":"火影忍者秋风","6497596":"咒术回战","6471826":"赵美延","6465118":"乃万","6438848":"宋雨琦","6400036":"面筋哥","6396980":"扬名立万","6385102":"狂野飙车9","6377252":"佳能M50","6372852":"改革春风吹满地","6344342":"拆盲盒","6344192":"节奏光剑","6340008":"丁禹兮","6339084":"5G手机","6243646":"哥斯拉大战金刚","6205506":"安宥真","6159224":"小众香水","6140096":"非自然死亡","6100642":"姚琛","6090816":"施柏宇","6054582":"冬泳怪鸽","6046582":"柠檬鸡爪","6029204":"pr转场","6017226":"言冰云","6012204":"明星舞蹈","5994176":"乐华七子","5946444":"王琳凯","5903376":"木子洋","5858250":"虎皮鸡爪","5844584":"全面战争：三国","5831238":"Cytus II","5826120":"Rich Brian","5822794":"陈立农","5817842":"林彦俊","5817586":"王怡人","5809396":"四小天盒","5790520":"椰子鸡汤","5788774":"林雨申","5776586":"权恩菲","5727642":"校园vlog","5685176":"中国机长","5681110":"动物森友会","5674016":"时乃空","5673848":"毕雯珺","5648988":"邓佳鑫","5638580":"丁泽仁","5626748":"黄新淳","5617802":"他人即地狱","5513956":"律化娜","5502986":"灵魂能力6","5500126":"FGO街机","5498808":"呆妹儿小霸王","5478148":"杀戮尖塔","5476512":"范丞丞","5418114":"裤子推荐","5417240":"PRODUCE48","5405434":"军运会","5398202":"王子异","5390284":"亿万僵尸","5388752":"无限法则","5368254":"李泽言","5327740":"失控玩家","5303604":"致我们暖暖的小时光","5268164":"和班尼特福迪一起攻克难关","5262544":"早稻叽","5147396":"豫章书院","5095854":"催眠麦克风","5080738":"伯远","5053314":"理科综合","5045872":"Queendom","5035590":"金昇玟","5035588":"梁精寅","5028520":"黄铉辰","5023002":"方灿","5022520":"徐彰彬","5021650":"智勋","5016258":"韩知城","5012736":"平凡英雄","4970994":"沙雕游戏","4922634":"张颜齐","4887644":"寄明月","4866254":"公孙离","4854888":"战斗天赋解析系统","4844668":"洪世贤","4820530":"重装战姬","4813036":"非人学园","4798332":"Stray Kids","4792148":"截断式眼妆","4790540":"鸡蛋做法","4785500":"王冰冰","4743152":"刘隽","4730180":"紫菜蛋花汤","4730016":"病名为爱","4727322":"决战平安京","4687696":"希林娜依高","4671660":"快速入睡","4668516":"八方旅人","4618594":"八佰","4610466":"明日方舟","4585786":"脆皮五花肉","4527048":"钢铁意志","4478110":"BOYSTORY","4434646":"灵笼","4429874":"虚拟UP主","4425434":"毒舌律师","4302942":"抖肩舞","4235094":"仝卓","4233904":"金在奂","4231380":"罗浮生","4200922":"医学专业","4200866":"百香果茶","4083902":"旭凤","4083900":"锦觅","4083898":"润玉","4054560":"头号玩家","4005150":"紫宁","3957654":"创造与魔法","3956954":"假面骑士BUILD","3955656":"显示器支架","3948192":"周棋洛","3948190":"许墨","3927278":"拖米","3926626":"人生一串","3896988":"黄旼炫","3873106":"恋与制作人","3853450":"朱星杰","3847232":"刘端端","3823788":"你要跳舞吗","3792166":"刘耀文","3789156":"惠普暗影精灵","3787668":"周震南","3774218":"回廊亭","3768654":"Havana","3740404":"WANNAONE","3737600":"异灵术","3733536":"阿冷","3724824":"毛不易","3722108":"邕圣祐","3691312":"王鹤棣","3687316":"仙某某","3683252":"荒野乱斗","3669046":"百里玄策","3658400":"怪物猎人世界","3653542":"胡一天","3623232":"华为P系列","3607931":"键盘轴","3605758":"4K显示器","3591145":"捷德奥特曼","3584781":"交换人生","3570562":"洗脸巾","3570424":"仙王的日常生活","3567139":"盾之勇者成名录","3566718":"蒜蓉小龙虾","3550779":"第五人格","3532062":"一梦江湖","3528773":"JDG","3521284":"桃源恋歌","3519626":"金廷祐","3519133":"汉服推荐","3509868":"农学","3503159":"宝石之国","3495562":"NBA2K18","3491296":"百里守约","3491241":"张泽禹","3485924":"爱情神话","3473118":"法考","3467981":"楚留香手游","3467541":"天才枪手","3466323":"李权哲","3463206":"致我们单纯的小美好","3462905":"少女歌剧","3462699":"图拉夫","3460928":"李旻浩","3457223":"永远的七日之都","3451649":"裴珍映","3451253":"朴志训","3443356":"陆柯燃","3442446":"姜丹尼尔","3441282":"阿轲","3438063":"QGhappy","3437846":"本特利","3433921":"朴佑镇","3426520":"左航","3420833":"敢达争锋对决","3418579":"尹智圣","3417915":"尤长靖","3414029":"徐正溪","3404908":"千层套路","3400804":"刘宇","3392467":"河成云","3376057":"黄旭熙","3373630":"复仇者联盟4","3365006":"达康书记","3349682":"何洛洛","3349680":"孙亦航","3349658":"易安音乐社","3346000":"命运2","3342542":"香蜜沉沉烬如霜","3335365":"Minnie","3327666":"鞋子推荐","3327368":"秦霄贤","3320110":"柳会胜","3310624":"7SENSES","3307585":"史诗战争模拟器","3303821":"寻梦环游记","3301050":"骆歆","3299496":"李大辉","3296688":"阴阳怪气","3294748":"朱正廷","3287269":"黄明昊","3287181":"赖冠霖","3267800":"深海迷航","3240712":"杨超越","3233847":"元气骑士","3232987":"A.I.Channel","3232159":"使命召唤14","3222257":"芒种","3213005":"唐制汉服","3206041":"明日战记","3196073":"华为平板","3192224":"末日铁拳","3185248":"Bin","3178287":"你的婚礼","3176401":"尚九熙","3173885":"林墨","3166607":"折叠屏手机","3149869":"李诞","3114739":"跳舞的线","3107685":"鬼灭之刃","3106811":"陈星旭","3103832":"约定的梦幻岛","3088294":"奥利给","3084968":"第一炉香","3082148":"杨芸晴","3053790":"Tian","3053588":"烤面筋","3049131":"金韶情","3047615":"迪玛希","3046801":"守岛人","3042908":"是，首相","3041514":"奶块","3038799":"兽娘动物园","3035050":"PRISTIN","3033823":"雾山五行","3032493":"刺客伍六七","3023780":"桌游棋牌","3019069":"炖排骨","3013173":"Letme","2999678":"大唐荣耀","2996689":"双镜","2995383":"22/7","2993242":"王慧侦","2990460":"惊雷","2988407":"梁世灿","2983903":"阿云嘎","2980540":"符华","2960639":"王奕","2957633":"JIWOO","2949428":"焰灵姬","2940555":"宿舍好物","2936731":"KARD","2936428":"大话西游游戏","2935179":"五条人","2922647":"面包做法","2915763":"中国式家长","2914344":"百妖谱","2908447":"碧蓝航线","2907234":"运动裤","2904309":"张新成","2901885":"最后生还者2","2894465":"周六野","2890529":"知否知否","2852414":"索尼Xperia系列","2841289":"游戏王：决斗链接","2840132":"李寿根","2823919":"苹果平板","2804942":"郑云龙","2803954":"赖美云","2803738":"文科综合","2801146":"孤存","2795142":"红烧猪蹄","2790530":"浓缩咖啡","2784499":"雷狮","2772390":"萧平旌","2765046":"陈钰琪","2758126":"吊带裙","2757061":"3dmax建模","2756323":"虞书欣","2746180":"Karsa","2744306":"梁靖康","2719650":"野钓","2718281":"the shy","2713856":"炫神","2700267":"食物语","2699874":"陈卓璇","2690426":"英雄联盟手游","2676001":"手办模玩","2674764":"李天泽","2672508":"袁一琦","2659029":"PPAP","2658411":"无线鼠标","2656362":"ONER","2647282":"陈飞宇","2644907":"KPL","2633912":"李子璇","2624426":"中国乒乓","2623729":"犬王","2622126":"脸红的思春期","2621800":"赵露思","2618715":"J.Fla","2612346":"Knight","2610734":"微胖穿搭","2609655":"李楷灿","2600739":"鱼的做法","2597902":"airpods","2588258":"半身裙","2582371":"卤面","2579034":"Krist","2579030":"Singto","2573761":"Felix","2569359":"MacBook Pro","2568232":"X玖少年团","2561575":"龚俊","2561468":"excel","2559972":"防晒衣","2556751":"小猪佩奇","2553825":"电视剧解说","2553696":"橘猫","2547812":"罗渽民","2547811":"朴志晟","2547810":"黄仁俊","2547809":"李帝努","2544632":"天官赐福","2538993":"Rookie","2538125":"shroud","2537364":"SF9","2533863":"李子柒","2532831":"N.Flying","2529888":"Doinb","2529416":"开学穿搭","2527991":"switch","2526877":"芒果冰","2525720":"NCT DREAM","2525559":"Beyonce","2520684":"freestyle","2517524":"ps教程","2515404":"查杰","2514240":"Taylor Swift","2513408":"iwanna","2513004":"procreate","2512541":"iPhone","2511718":"Ariana Grande","2511282":"vlog","2510920":"夏季穿搭","2510804":"孟美岐","2510690":"iKON","2502324":"汉服配饰","2502136":"sans","2498756":"Fate","2496782":"Red Velvet","2495417":"冰淇淋制作","2494311":"吴宣仪","2494280":"Duang","2492412":"Rihanna","2491596":"Korea相关","2489706":"YERI","2487027":"竹鼠","2486527":"lolita","2486427":"SHINee","2485620":"张九龄","2485583":"阿凡达2","2485137":"姜Gary","2484328":"Aimer","2483415":"Re：从零开始的异世界生活","2482768":"蒜香排骨","2482673":"NCT127","2482344":"JENNIE","2479909":"嘉德罗斯","2433660":"这么多年","2403573":"男生穿搭","2337661":"富士相机","2287121":"清蒸鱼","2271078":"包包推荐","2255402":"佳能相机","2214961":"华语现场","2210094":"战狼2","2190062":"MOMOLAND","2187258":"战舰联盟","2126326":"建军大业","2108450":"全面战争模拟器","2098656":"人类一败涂地","2073345":"客制化键盘","2012954":"沈巍","2012952":"赵云澜","1853276":"水果茶","1853158":"烤茄子","1851001":"朱广权","1805799":"PENTAGON","1802787":"排骨汤","1775550":"刘学义","1771846":"喻言","1768384":"高考政治","1767238":"一起同过窗","1765149":"刘些宁","1760362":"连淮伟","1759671":"夏日饮品","1756757":"李一桐","1755728":"冥想音乐","1751888":"侯明昊","1751795":"张铭恩","1749296":"BLACKPINK","1740982":"熊梓淇","1737239":"死亡搁浅","1734103":"人间世","1732829":"SofM","1731930":"看门狗2","1728359":"国风音乐","1727225":"茨木童子","1722232":"金路云","1718137":"余小C","1708821":"黄绿合战","1706779":"高考历史","1698817":"荷兰弟","1696501":"精灵宝可梦日月","1693136":"3DMAX教程","1690944":"战地1","1688874":"白灼虾","1685027":"齐木楠雄的灾难","1684958":"奥尔加","1684679":"一人之下","1682183":"黄恩妃","1681663":"金在德","1679326":"欧布奥特曼","1677610":"德丽莎","1677467":"漂发","1677308":"马冬梅","1674133":"金请夏","1673963":"全昭弥","1673845":"极乐净土","1671408":"蕾姆","1669303":"金光瑶","1669085":"内双眼妆","1669084":"单眼皮眼妆","1667658":"姜东昊","1666331":"舞法天女","1666216":"减脂餐","1665976":"粉霜","1664750":"吴谨言","1663773":"BEJ48","1663337":"还是觉得你最好","1662923":"小林家的龙女仆","1661887":"MLXG","1660794":"华硕ROG","1660558":"猫和老鼠手游","1658728":"姜昇润","1658727":"李昇勋","1657069":"王九龙","1656926":"周九良","1650732":"雄兵连","1650232":"小米手表","1647661":"钱锟","1646669":"文泰一","1646668":"郑在玹","1645475":"徐梦洁","1645154":"DIY染发","1643561":"GNZ48","1640990":"李泰容","1639589":"NCT U","1639194":"I.O.I","1637921":"江澄","1637397":"王者荣耀花木兰","1634877":"金宇硕","1631094":"全昭妍","1624519":"徐英浩","1623014":"游戏显示器","1621455":"具晙会","1621360":"孔雪儿","1621267":"刘雨昕","1621198":"魏无羡","1621194":"蓝忘机","1620256":"崩坏3","1619372":"薛洋","1615603":"晓星尘","1615209":"ROOMTOUR","1614795":"金世正","1614756":"耳饰","1612939":"雪娥","1605755":"恩熙","1604272":"刺客列传","1599602":"配饰","1597831":"宋旻浩","1597173":"李兰迪","1594382":"清洁面膜","1593182":"洁面","1590425":"马嘉祺","1589079":"李昇基","1588309":"星露谷物语","1583639":"便携显示器","1583317":"程潇","1581262":"孤岛惊魂5","1581005":"青云志","1579263":"三国志14","1577361":"王晰","1573317":"正道的光","1566710":"宋亚轩","1565324":"眼妆教程","1564714":"火鸡面","1564410":"唇釉","1562795":"高瀚宇","1562513":"格瑞","1558469":"男生发型","1557554":"上海迪士尼","1555709":"高考语文","1550817":"天鹅臂","1548279":"盗贼之海","1546934":"骨传导耳机","1546292":"李马克","1545392":"杨九郎","1545325":"何九华","1545256":"周洁琼","1544288":"董思成","1543807":"苞娜","1542724":"张真源","1542723":"严浩翔","1539089":"DC电影","1538830":"贝果","1538786":"滚动的天空","1534556":"气垫粉底","1527914":"紫罗兰永恒花园","1527593":"车银优","1527081":"蹦迪","1525327":"皇室战争","1523841":"邢菲","1523046":"高考地理","1521388":"无线键盘","1519748":"贺峻霖","1518432":"EXCEL教程","1518250":"NCT","1506015":"起床战争","1500251":"蒸汽波","1499499":"曾舜晞","1498706":"东北大鹌鹑","1497944":"彭昱畅","1489415":"植物大战僵尸1","1487092":"X特遣队","1486920":"宇宙少女","1483890":"逃离塔科夫","1483761":"动物派对","1482612":"孟鹤堂","1481907":"PRODUCE101","1478561":"高考英语","1477109":"男士香水","1472657":"金秦禹","1470872":"本田仁美","1469519":"探店","1469000":"神奇动物在哪里","1468896":"宋威龙","1468687":"段艺璇","1466243":"你的名字","1464743":"袁冰妍","1463475":"增肌","1462727":"包菜","1461066":"EVERGLOW","1456591":"SING女团","1456318":"鲁班七号","1456296":"夏之光","1456064":"彭楚粤","1456063":"郭子凡","1455428":"黑暗欺骗","1452715":"越界","1452208":"伍嘉成","1452021":"明制汉服","1451673":"焉栩嘉","1451590":"2K显示器","1450880":"肖战","1449446":"高考生物","1447910":"费沁源","1446710":"谷嘉诚","1445512":"疯狂动物城","1443813":"徐慧潾","1439702":"美股","1437806":"王大娘","1434903":"黄景瑜","1434902":"许魏洲","1432618":"爱宠大机密","1431684":"咖啡制作","1430280":"茶杯头","1430120":"韩国美妆","1427060":"燃烧吧少年","1426033":"我家大师兄脑子有坑","1423903":"金高银","1422623":"土豆炖牛肉","1422260":"刘飞儿","1418350":"楚乔传","1414022":"新宝岛","1413410":"尼尔机械纪元","1412402":"底特律变人","1410830":"穿越火线手游","1410225":"唇妆","1410028":"ITZY","1404375":"王者荣耀","1403904":"朴志效","1402093":"平井桃","1402092":"凑崎纱夏","1399750":"名井南","1396950":"影之诗","1396864":"金容仙","1395461":"荒野行动","1394554":"英国留学","1393143":"传说之下","1389366":"白噪音","1385136":"麦克雷","1382944":"沈月","1375873":"军师联盟","1371681":"汉服发型","1370737":"法学","1361639":"铁血的奥尔芬斯","1360622":"金道英","1359657":"拳皇14","1353160":"联想拯救者","1353146":"戳爷","1352963":"华莎","1352961":"辉人","1350313":"刘也","1346695":"赵今麦","1344205":"姜成勋","1343714":"宋昕冉","1342449":"明诚","1340644":"熊叔实验室","1339688":"蔡徐坤","1339014":"骨傲天","1338842":"博人传","1337755":"嗨氏","1335015":"宋民国","1333288":"玟星","1332502":"小黄人大眼萌","1330216":"防晒霜","1328031":"欅坂46","1327158":"天海祐希","1323937":"李圣经","1323100":"AQOURS","1322743":"汤面","1318588":"酱油炒饭","1318032":"金艺琳","1317766":"入耳式耳机","1316400":"天行九歌","1308325":"孙彩瑛","1308100":"林娜琏","1308099":"俞定延","1307556":"鸡蛋羹","1302892":"鬼畜大赏","1301876":"唇蜜","1298731":"大理寺日志","1297229":"沈梦瑶","1293757":"小米粥","1293264":"哪吒","1291155":"造梦西游3","1288454":"火影忍者手游","1288297":"超级马里奥制造","1288280":"佘诗曼","1285747":"丁恩妃","1285745":"崔俞娜","1285744":"金艺源","1285676":"周子瑜","1281706":"女流66","1278695":"夏洛特烦恼","1274965":"徐明浩","1273356":"洪知秀","1273120":"朴正花","1271438":"全圆佑","1271393":"荒原","1269344":"郑艺琳","1269250":"文俊辉","1267729":"权顺荣","1267478":"普拉提","1266597":"荣耀战魂","1266451":"夫胜宽","1264176":"金珉奎","1263686":"金鸡奖","1262982":"崔胜澈","1260792":"垫底辣妹","1260083":"冯建宇","1259589":"柠檬茶","1258411":"星动亚洲","1256831":"尹净汉","1256812":"李知勋","1255892":"龙马精神","1254904":"美丽芭蕾","1254839":"球球大作战","1254774":"申东熙","1252194":"虾滑","1248461":"BDF","1239469":"四海","1237033":"王大陆","1236718":"摩卡","1236676":"朱婷","1236089":"宫崎英高","1234724":"哪吒传奇","1234670":"游戏鼠标","1234235":"影视解说","1234161":"冲出地球","1233929":"染发","1230927":"埃罗芒阿老师","1228022":"少女前线","1227044":"牛角包","1224627":"黑暗之魂3","1224378":"陈瑶","1224377":"韩东君","1221797":"全景视频","1221581":"互动视频","1221579":"许率智","1218245":"金宰铉","1218243":"车勋","1218242":"李承协","1217733":"购物分享","1216888":"杨冰怡","1216464":"马东","1213072":"山泥若","1205111":"方舟生存进化","1204185":"昆特牌","1200789":"全昭旻","1199791":"韦神","1199590":"黄焖鸡","1197062":"MONSTA X","1196089":"奇迹暖暖","1187005":"布洛妮娅","1180937":"Are you OK","1178961":"TWICE","1178061":"凉鞋","1174481":"是在下输了","1173898":"寅子","1172858":"最好的我们","1171742":"非正式会谈","1170904":"印度美食","1169259":"邓伦","1166589":"侠客风云传","1162495":"表志勋","1161117":"电影解说","1152599":"高考物理","1151729":"百褶裙","1147004":"参鸡汤","1142567":"高考化学","1139735":"穿搭","1139423":"街头美食","1138380":"郑合惠子","1137082":"莫吉托","1132582":"阿水","1130307":"偶像梦幻祭","1130210":"朴草娥","1130206":"周二珂","1128093":"种草","1124980":"普通DISCO","1124484":"中本悠太","1121730":"油焖大虾","1112287":"都市天际线","1111341":"发型教程","1106005":"金硕珍","1106004":"闵玧其","1103589":"电脑配置","1103381":"张昕","1102712":"申惠晶","1099778":"彩虹社","1099151":"如果声音不记得","1097738":"宋家三胞胎","1094330":"宫脇咲良","1093613":"张云雷","1092695":"华为手表","1090508":"教育学","1090382":"手帐","1089748":"金雪炫","1087556":"日本豆腐","1087534":"白鹿","1082258":"张大仙","1081956":"郑号锡","1081955":"朴智旻","1081940":"金南俊","1080328":"偶像运动会","1074753":"大龙虾","1074231":"如懿传","1067350":"血小板","1066492":"德云色","1065905":"朴叙俊","1058463":"迷你厨房","1057045":"李晟敏","1056021":"麻辣小龙虾","1054498":"SEULGI","1050978":"申智珉","1050648":"韩语学习","1048177":"宋轶","1044947":"粉底","1044946":"底妆","1044288":"牵丝戏","1040180":"豆腐汤","1040026":"三日月宗近","1039059":"鹤丸国永","1038521":"收纳","1035275":"张天爱","1034765":"编发","1032214":"王博文","1029373":"张水院","1029372":"水晶男孩","1021498":"大圣归来","1020403":"周雨彤","1020279":"朴宝剑","1020034":"GFRIEND","1019881":"张予曦","1018272":"星际战甲","1017641":"刀剑乱舞","1014344":"罗云熙","1014045":"钵仔糕","1011490":"马甲线","1005496":"刘敏涛","1005465":"你好世界","1004975":"LCK","1001997":"白宇","999385":"影视杂谈","994518":"垃圾佬","994090":"FGO","988556":"干物妹小埋","987582":"张雨鑫","987568":"王司徒","986177":"宝塚","984842":"神超","983293":"连城璧","979033":"朴素妍","977612":"陆婷","975288":"街霸5","973929":"丁程鑫","970789":"拍照手机","970732":"可塑性记忆","966586":"李洪基","964575":"曹承衍","964574":"李汶翰","951674":"琪亚娜","950841":"约瑟夫","949470":"吴夏荣","949469":"金南珠","948239":"空洞骑士","947331":"周依然","943873":"侏罗纪世界","943131":"孙芮","942929":"崔珉起","937793":"许杨玉琢","935320":"迷你世界","934788":"卡戴珊","930932":"LOVELYZ","930635":"朱一龙","928449":"ZICO","926988":"守望先锋","921323":"古风舞","918398":"李现","917992":"赵粤","917244":"空气炸锅","915594":"惊奇队长","914587":"复仇者联盟3","912869":"洪真英","912494":"任嘉伦","911336":"李居丽","911249":"王迅","911124":"敖子逸","908970":"HANI","906753":"郑业成","904950":"波澜哥","903111":"全宝蓝","902875":"减肥餐","902804":"美国留学","902725":"冯提莫","902215":"王一博","902214":"UNIQ","902193":"仿妆","900798":"无主之地3","898995":"金多贤","898091":"彩虹六号围攻","891482":"FPX","887323":"刘诗雯","884531":"孤影","882598":"影视混剪","880337":"烤猪蹄","880335":"卤猪蹄","879358":"杀手2","879244":"万丽娜","879243":"冯薪朵","878348":"OVERLORD","873733":"韩非","873562":"油豆腐","872789":"疾速追杀","868709":"一个人的武林","866683":"郑粲右","863753":"血源诅咒","861311":"PR教程","856481":"林一","848567":"咸恩静","847845":"穿普拉达的女王","840887":"露营","840219":"金孝渊","840218":"黄美英","840163":"张若昀","839005":"MAMAMOO","838789":"学习方法","837899":"金韩彬","837378":"古董局中局","833300":"宋尹亨","832569":"美妆","831374":"金振焕","825482":"面膜","823256":"荒野大镖客2","822462":"粉底液","822420":"金所炫","821151":"张钧甯","820876":"游戏手机","820148":"朴秀荣","819952":"玩具熊的五夜后宫","819719":"尹正","819718":"成毅","819467":"古剑奇谭游戏","817374":"芜湖大司马","814910":"炸鸡腿","811810":"声优广播","808938":"慕斯蛋糕","805733":"红烧鱼","802163":"野生技术协会","796840":"金泰亨","796838":"田柾国","795012":"烤土豆","794862":"马思唯","794385":"李顺圭","793071":"源氏","791829":"4AM","789870":"NUEST","788691":"俄剧","784170":"一周的偶像","783535":"严斌","780558":"金钟铉","780447":"周淑怡","779262":"午餐肉","778339":"于朦胧","777092":"LINUSTECHTIPS","773822":"白敬亭","772031":"鸡胸肉","766151":"片寄凉太","762312":"张彬彬","760121":"自杀小队","759049":"李栋旭","756847":"手抓饼","753867":"季肖冰","752983":"南柱赫","752249":"张碧晨","751970":"周深","750669":"苹果手表","749860":"夏至未至","748338":"老师好","748238":"碧蓝幻想","737629":"于晓光","737461":"金珉锡","736573":"扫地机器人","735503":"李泰民","732271":"焖饭","725992":"吴倩","720912":"林在范","719063":"月圆之夜","716691":"堡垒之夜","715800":"防晒","714393":"门锁","713926":"搜救","712595":"坦克世界闪电战","706486":"动漫资讯","703941":"李荣浩","700392":"崔荣宰","700391":"朴珍荣","700389":"段宜恩","700388":"金有谦","700387":"王嘉尔","696751":"古力娜扎","693473":"安图恩","692758":"水煮鱼","690640":"魏大勋","689147":"王境泽","686151":"皮蛋瘦肉粥","684608":"金厉旭","683752":"球鞋","682032":"择天记","678144":"JUNGKOOK","676424":"马里奥制造","675872":"小松菜奈","673903":"宝蓝","672893":"李永","671689":"民宿","671156":"我只喜欢你","663765":"姜虎东","661600":"宋祖儿","660189":"美食侦探","659917":"忍者必须死","656109":"女人我最大","655995":"李承鄞","653892":"刘昊然","651301":"李斯丹妮","649117":"家居","645936":"口红","645812":"漫威电影","644870":"小米平板","641414":"斋藤飞鸟","641033":"国内综艺","637832":"自驾游","634695":"哥谭","634219":"朴春","630567":"房车","629601":"刘国梁","629081":"金晨","625249":"水濑祈","625117":"田径","623790":"美甲","621640":"生死狙击","620958":"可乐鸡翅","620762":"乐童音乐家","617079":"任豪","615664":"谭松韵","615194":"尹普美","615193":"朴初珑","615192":"孙娜恩","613680":"朴孝敏","613025":"卡布奇诺","612671":"金唱片","612086":"护肤","612073":"李多喜","610195":"H1Z1","605361":"数据可视化","604596":"真三国无双8","603338":"汽车评测","603074":"宠物医院","602557":"英语口语","602418":"杀戮天使","601839":"奥拉星","600160":"无限火力","600144":"EDG","599663":"请问您今天要来点兔子吗","599064":"东京奥运会","598696":"米卡","598440":"咒","598357":"日常妆","597654":"辣子鸡","596132":"梅根","595451":"韩国美食","592857":"秦俊杰","592627":"上官婉儿","591125":"金圣圭","590630":"四月是你的谎言","590624":"路人女主的养成方法","589268":"关晓彤","588111":"徐海乔","586269":"欧阳娜娜","581189":"VIXX","579454":"RNG","579165":"丸子头","578683":"梅长苏","578320":"黄婷婷","578222":"麻薯","577900":"张峻豪","577535":"5G","576152":"明凯","575706":"美式咖啡","574887":"BTOB","574006":"西卡","573045":"葱油饼","572556":"洞主","571888":"眼影","571533":"澳门风云","570860":"调酒","570258":"矢吹奈子","570166":"许凯","569515":"高马尾","567623":"宣美","566210":"拌面","565581":"涛妹","565481":"篮球鞋","564757":"钟辰乐","564621":"金钟大","563816":"无线耳机","563711":"腊肠","563196":"黑店百地","562579":"气象","562511":"魔女2","559363":"头戴式耳机","556840":"朴智妍","553693":"APINK","553302":"一年生","552737":"门徒","544762":"樊振东","544761":"丁宁","544672":"光盘行动","543181":"汽车模型","540875":"一周的朋友","540461":"伊野尾慧","539854":"沉睡魔咒","536516":"林秀香","536400":"橘右京","536395":"防弹少年团","535925":"JYP","535923":"BAMBAM","535922":"GOT7","535884":"华尔街之狼","535650":"王鸥","535299":"辛德勒的名单","534014":"几何冲刺","532013":"金材昱","531208":"大侠卢小鱼","530918":"动漫杂谈","529643":"无心","528969":"宣璐","526460":"秋瓷炫","526392":"PS5","525659":"鱼香肉丝","521731":"知否知否应是绿肥红瘦","521337":"电竞赛事","520050":"沫子","520000":"瑞克和莫蒂","519896":"化妆品","519316":"武磊","518596":"檀健次","516500":"秀场","515827":"易嘉爱","515826":"李艺彤","515169":"殷志源","515117":"星际穿越","514412":"崩坏学园2","513708":"超神学院","513171":"黄轩","512372":"摄影教程","510520":"土豆丝","510215":"一步之遥","510021":"岳岳","506528":"成果","504679":"时装周","504597":"环球旅行","504355":"螺蛳粉","502706":"烤串","501905":"小虎","500019":"奥奇传说","499816":"彩妆","498800":"生田绘梨花","497398":"辐射4","497221":"鬼畜调教","496473":"凉面","495416":"天谕","493569":"赏金术士","492464":"马龙","492395":"扫黑行动","491845":"窦骁","490990":"桥本环奈","490923":"花样年华","490608":"试吃","489375":"陆星材","488659":"糖醋排骨","487255":"理财","486385":"徐贤","486085":"酸菜鱼","484358":"池昌旭","482921":"曺圭贤","482902":"吴昕","482275":"刘涛","481901":"王耀庆","481489":"扬州炒饭","480470":"徐子轩","480264":"煲汤","479818":"AOA","479227":"靳东","476829":"风暴英雄","476115":"金希澈","475516":"拿铁","474681":"眼妆","474020":"西野七濑","472990":"明日之后","471583":"朴炯植","471091":"手链","470877":"倪妮","470666":"鞠婧祎","470665":"林思意","469388":"孔刘","469196":"力丸","467082":"BML","462608":"断桥","460348":"粉饼","460090":"张子枫","459007":"EDM","458852":"微微一笑很倾城","457916":"造梦西游","457385":"电子产品","454809":"甜品","453608":"连衣裙","452343":"温流","451792":"中国舞","451654":"安崎","450716":"土豆饼","449518":"都暻秀","448718":"戚风蛋糕","448443":"烤箱","446907":"埼玉","446505":"雷佳音","445152":"FAKER","444760":"赛博朋克2077","443303":"野外生存","442514":"李沁","438585":"洼田正孝","435985":"刘宪华","435569":"IRENE","435407":"金钟仁","435406":"金俊勉","435405":"吴世勋","435404":"边伯贤","435403":"朴灿烈","433844":"全境封锁","433824":"模拟人生4","431937":"郑恩地","428970":"蛋糕制作","428529":"消逝的光芒","426077":"新奥特曼","425410":"银河护卫队","424714":"新警察故事","424331":"灵能百分百","423627":"机箱","423036":"曾卓君","420821":"孔孝真","417852":"电饭煲","416482":"郭京飞","416376":"迪丽热巴","416375":"高伟光","415431":"索尼相机","414968":"文豪野犬","413678":"装机","409944":"流放之路","409754":"白石麻衣","405162":"背带裤","404647":"小李子","404504":"战地5","404044":"七日杀","400668":"华晨宇","397891":"助眠","397672":"松饼","397670":"一人食","397404":"男刀","395596":"旅拍","394549":"红烧排骨","394538":"吃鸡","392845":"民族舞","391556":"金木研","390737":"金智媛","390219":"猪蹄","389537":"西葫芦","389510":"处处吻","389490":"虾","389440":"租房","385801":"娱乐百分百","385333":"吐司","384852":"酸梅汤","384798":"王雷","384363":"武状元苏乞儿","383910":"超轻粘土","383680":"金明洙","380426":"德牧","380387":"拆弹专家","379680":"黄少天","378659":"荔枝","378278":"林允儿","378048":"伪装者","377209":"食戟之灵","377088":"八重樱","376775":"起风了","374686":"龙俊亨","374620":"玉泽演","372889":"强仁","372799":"考研","372675":"燕小六","372423":"许昕","372420":"张继科","371512":"崔秀英","370017":"粥","369699":"赶海","369641":"神偷奶爸","369126":"部落冲突","367456":"WINNER","366980":"巧克力蛋糕","366532":"最终幻想15","365736":"巫师3","365677":"泰坦陨落","364848":"仁王","363113":"吕珍九","361796":"植物大战僵尸2","360877":"沈昌珉","360876":"郑允浩","360005":"英语学习","356796":"游戏人生","356262":"萌娃","353057":"智能手表","351678":"键帽","350360":"橡皮章","349128":"欧洲卡车模拟2","349001":"鬼鬼吴映洁","348953":"茅子俊","347055":"路人王","345363":"西西里的美丽传说","341391":"朴宰范","341369":"拉丁舞","340020":"盲女","338050":"时崎狂三","337310":"AE教程","335752":"PS教程","334910":"金秀贤","334517":"恶灵附身","333943":"天涯明月刀OL","333528":"野良神","332847":"荞麦面","332531":"最后生还者","332416":"姿态","331863":"利威尔","329830":"黑暗之魂2","329261":"王子变青蛙","328981":"日本留学","328122":"姜大声","325309":"境界的彼方","324091":"洗碗机","323144":"意大利面","322961":"金俊秀","322960":"崔始源","322239":"新科娘","322082":"歪果仁","321905":"中华田园犬","321258":"恶之花","320487":"三明治","318756":"炉石传说","318664":"金泰妍","318570":"影视剪辑","318397":"万茜","318078":"张晋","317896":"小龙虾","317609":"沙海","316679":"吴秀波","315748":"手撕鸡","315352":"LPL","313718":"服饰","313458":"郑秀晶","313457":"郑秀妍","312534":"焦俊艳","312200":"崔胜铉","311144":"烤肠","310775":"赵丽颖","309568":"排骨","309518":"隐形人","309290":"魔术教学","308052":"革命机VALVRAVE","306663":"星际公民","306139":"王子文","306138":"周冬雨","306137":"杨颖","305918":"尼坤","305155":"雅思","304696":"新蝙蝠侠","304169":"珠宝","304105":"叶修","302709":"言叶之庭","300744":"纸人","300697":"艺声","299685":"游戏本","299641":"虎神","299611":"张良","298482":"戴萌","298303":"贾玲","298164":"穷游","297206":"吴哲晗","296818":"黄旭东","296288":"我要我们在一起","296203":"钱蓓婷","296112":"马丽","296111":"沈腾","294354":"莫寒","294275":"张语格","291921":"一剪梅","290291":"冥想","290069":"爵士舞","289460":"梅菜扣肉","289315":"川菜","289033":"鸡汤","288405":"剑雨","287870":"蒋欣","287380":"李准基","286910":"韩信","286512":"主持人大赛","286464":"九九八十一","285109":"上海地铁","285044":"女神异闻录5","284724":"刘畊宏","284682":"七大罪","284496":"赵磊","282866":"郑亨敦","282453":"人类观察","282435":"作画MAD","281878":"EXID","281864":"乔杉","281638":"许佳琪","280531":"节奏大师","279840":"李胜贤","279790":"孔肖吟","279760":"英语六级","276236":"薛之谦","275992":"坠落","274802":"PDD","274013":"IZONE","272235":"秦岚","268705":"排球少年","266892":"英语四级","266190":"鱿鱼","266119":"李健","265488":"剑宗","264846":"日本旅游","264440":"崩坏学园","264301":"罗宋汤","264029":"红烧肉","263089":"游戏集锦","261355":"化妆教程","261233":"JK制服","260652":"饥荒","259991":"GEN","257412":"帕梅拉","257162":"文彩元","257161":"宋仲基","256731":"瘟疫公司","256508":"井柏然","256276":"番茄炒蛋","255784":"陈晓","255603":"少年派","255087":"劫","254615":"金智秀","254068":"约会大作战","254027":"英魂之刃","253801":"古装剧","253448":"RWBY","252406":"陈伟霆","252274":"捡垃圾","252081":"吕秀才","251928":"菠萝赛东","251843":"布偶猫","251059":"双十一","250444":"狮子狗","250067":"影流之主","249842":"文明6","248948":"DIA","248805":"断网","248004":"秦昊","248003":"马思纯","243120":"重庆话","242903":"项链","242864":"300英雄","241712":"新裤子","241699":"安宰贤","241337":"利特","240874":"西兰花","240347":"玛格丽特","239855":"厨艺","238261":"狼人杀","237069":"古风翻唱","236831":"音游","236568":"西甲","236135":"陈赫","236068":"紧急救援","235021":"麻辣鸡","233677":"李光洙","233619":"魏晨","233344":"欢乐斗地主","233111":"冰雪奇缘","233003":"金泫雅","232159":"满江红","230405":"G2","230186":"李惠利","229190":"村上信五","229073":"狄仁杰","228455":"肖申克的救赎","227424":"文森特","226146":"烹饪","225507":"权志龙","224773":"重装上阵","224415":"灭霸","223653":"李东海","223615":"安田章大","223047":"老陈","221917":"有冈大贵","220476":"李易峰","220450":"山崎贤人","220187":"奢侈品","219887":"崔雪莉","219886":"崔珉豪","218956":"张怡宁","218836":"英语语法","218245":"烘焙","218167":"弱音HAKU","217923":"吉良吉影","217699":"薮宏太","216971":"李宗伟","216914":"BAE","216283":"谭晶","216260":"军事科技","215841":"我们结婚了","215500":"尹斗俊","215499":"李赫宰","214414":"小水","214370":"乐正龙牙","214233":"奇异博士","214030":"张艺兴","213040":"环太平洋","212821":"孙杨","212661":"王俊凯","212660":"王源","212197":"战争雷霆","211065":"热带鱼","210946":"腾格尔","210691":"流浪地球","210501":"张含韵","210351":"鸡爪","209672":"流星花园","207892":"虚拟歌手","207781":"篮球教学","206950":"张雨绮","206943":"4K","206466":"高以翔","206465":"陈乔恩","206464":"张翰","206405":"七朵组合","206371":"MSI","206115":"舞力全开","205756":"SISTAR","205372":"木工","204909":"芽衣","204682":"环境音","204442":"唇膏","203752":"德州扑克","203360":"赵又廷","202470":"流水","201841":"张娜拉","201609":"GAI","201481":"乐正绫","201462":"机械键盘","200691":"烤鱼","199397":"口水鸡","198975":"上坂堇","198482":"姬子","198427":"宋小宝","197990":"郭麒麟","197897":"丸山隆平","197035":"天涯明月刀","196296":"吴磊","195492":"信条","194934":"YG","194342":"权侑莉","194288":"英雄连2","192335":"杨戬","191549":"傅红雪","191239":"吴青峰","191238":"黄子韬","191033":"鹿晗","191032":"EXO","190723":"麻辣烫","189985":"福原爱","189223":"杨蓉","189215":"无敌破坏王","189181":"我的青春恋爱物语果然有问题","188464":"看门狗","188042":"NBA2K","187787":"亚索","187095":"德莱文","186562":"乔振宇","186559":"舒畅","186426":"杨紫","185237":"宇智波鼬","185233":"FNC","185181":"美瞳","184905":"虾仁","184527":"莴笋","182801":"游戏王YGOCORE","182316":"诺克萨斯之手","181133":"裴秀智","180653":"赵敏","180212":"东永裴","180184":"刘星","179850":"周笔畅","179812":"张扬","179187":"刘仁娜","179103":"泰剧","179080":"唐嫣","178862":"星海","178172":"阿信","176807":"MAMA","175905":"卡莲","175335":"洋葱","175174":"黑镜","174458":"武则天","174045":"拜仁","173262":"杰尼斯","172837":"斗破苍穹","172195":"花粥","171796":"王凯","171662":"SNH48","171505":"GENERATIONS","171332":"郭芙蓉","171290":"古琴","170997":"北京奥运会","170646":"戏曲","170377":"撒贝宁","169523":"医学","169485":"以撒的结合","168822":"T-ARA","168516":"白冰","167015":"凹凸世界","166738":"热血无赖","166550":"托福","166338":"边江","165956":"SN","165546":"锐雯","165210":"广场舞","165014":"地理","164146":"桐人","163736":"BOBBY","163369":"黄龄","163192":"黑豹2","161860":"梁逸峰","161375":"夺冠","161357":"装修","161247":"古典舞","161137":"枪神纪","160442":"朴有天","160298":"跨年演唱会","160097":"刀妹","159571":"韩舞","159190":"张智尧","159059":"CLC","158255":"玄彬","158202":"陈星汉","158189":"冰菓","157951":"抖森","157930":"有吉弘行","157821":"天生一对","157146":"白金DISCO","157087":"舞蹈教学","156230":"牛排","155880":"笑笑","153954":"杨洋","153951":"林黛玉","152882":"明道","152673":"王师傅","152655":"沙盒游戏","152330":"妲己","151950":"米津玄师","151642":"SKT","151542":"TF家族","151521":"贾宝玉","151514":"博德之门","150694":"张鹤伦","150416":"空中浩劫","150342":"低俗小说","149838":"HKT48","149532":"戚薇","149531":"大张伟","149330":"卢克","149066":"S.H.E","149065":"郑元畅","148937":"电棍","148898":"林更新","148760":"董卿","148556":"那年那兔那些事儿","148414":"牛仔裤","148242":"内存条","148171":"鸡蛋饼","148123":"编舞","147600":"佟湘玉","147289":"韩雪","147058":"伊芙琳","147026":"双肩包","147016":"无人机","146730":"乃木坂46","146628":"泰国电影","146059":"牛肉","145883":"模型制作","145808":"微单","145696":"鸟鸣","145656":"金毛","145436":"TXT","144956":"魔术揭秘","144654":"JYJ","144292":"四川话","143893":"章子怡","143751":"手机评测","143665":"孤独的美食家","142904":"艾伦秀","142726":"恶作剧之吻","142339":"知念侑李","141870":"宋茜","141407":"巴菲特","140992":"变形计","140503":"杨丞琳","140364":"年度盘点","139012":"自然科学","138600":"漫威","137793":"张韶涵","135668":"啦啦啦德玛西亚","135212":"街球","134721":"宇智波斑","133641":"黄磊","133622":"高木雄也","133353":"金陵十三钗","133257":"生物","130863":"天津话","130159":"姚晨","129697":"SUPER JUNIOR","129641":"言和","128786":"泠鸢YOUSA","127846":"罗翔","127837":"刃牙","127279":"火力少年王","126954":"插画","125578":"翼装飞行","124649":"狼群","124135":"洛克王国","123465":"KPOP","123146":"S10","119973":"包包","119702":"江华","119640":"速度与激情","119392":"深海","118386":"まふまふ","116606":"阿卡丽","116535":"匪我思存","116480":"张召忠","116364":"泡面","116267":"卡牌游戏","116059":"韩庚","116044":"围攻","116013":"王大锤","115092":"编曲","114612":"黑子的篮球","114604":"金光布袋戏","114088":"户外","113512":"黄圣依","113431":"黎姿","113054":"BJD","112832":"草薙京","112758":"雨声","112139":"尤克里里","111865":"电子音乐","111817":"韩语","111405":"巡音LUKA","111377":"影评","111037":"宫本武藏","110784":"李佳薇","110511":"开箱","110347":"张一山","110331":"无名","109721":"蔡少芬","109540":"日语学习","109161":"松冈祯丞","108939":"荒岛求生","108907":"手表","108744":"白色相簿2","108296":"孙俪","107974":"大鹏","107840":"忠犬八公","107839":"杀死比尔","107783":"潘粤明","107717":"杀破狼","107668":"TEN","106299":"GOPRO","105794":"小马宝莉","105768":"宋智孝","105765":"池石镇","105764":"刘在石","105763":"金钟国","105669":"全智贤","105286":"国家宝藏","105130":"自我介绍","105019":"杨梅","104929":"搞笑一家人","104812":"高达EXVS","104537":"PS4","104427":"薇恩","104037":"海鲜","103817":"摩尔庄园","103594":"董洁","103593":"张嘉译","103406":"书法","103076":"彭于晏","103074":"杀生丸","102935":"索隆","102841":"宁静","102666":"齐舞","102361":"盲僧","102317":"李佳航","101694":"破坏之王","101392":"贾斯汀比伯","101365":"使命召唤OL","101333":"烤鸡翅","101287":"拳皇98","101263":"英语听力","100925":"鸡肉","100759":"战斗法师","100475":"田馥甄","100163":"豪车","99842":"CS:GO","99697":"朴敏英","99344":"利物浦","99264":"飞盘","98890":"C4D","98842":"灾难","98414":"派大星","98053":"2NE1","98016":"古川雄辉","97613":"林心如","97199":"战舰世界","96579":"爸爸去哪儿","96514":"娄艺潇","96498":"锅包肉","96308":"陆军","96197":"QQ飞车","96107":"巴萨","96007":"小枫","95691":"巴啦啦小魔仙","95670":"终极三国","95153":"运动鞋","95071":"伊莉雅","94982":"经济","94971":"手指舞","94571":"我是大哥大","94460":"雷军","94375":"小黄人","94365":"土豆泥","94337":"家常菜","94281":"灰太狼","94247":"帆布鞋","93250":"金星","93217":"王思聪","92708":"吴尊","91251":"潮流","90804":"芹菜","90439":"游戏攻略","89976":"高桥南","89808":"礼物","89694":"金在中","89358":"生化危机6","89203":"林依晨","87922":"泰国广告","87677":"韩红","87376":"胡夏","87121":"吉他弹唱","86917":"鲸鱼","86845":"杨幂","86776":"室内设计","86573":"逆战","85689":"日文翻唱","85651":"街机游戏","85317":"张智霖","85149":"宋慧乔","85111":"裙子","84875":"张伟","84657":"象棋","83553":"八乙女光","83550":"小嶋阳菜","83294":"山田凉介","83104":"一美","82945":"诺贝尔奖","82518":"X1","82141":"汪东城","81867":"韩国电影","81618":"航天","81372":"YYF","81265":"日本综艺","81222":"SEVENTEEN","80946":"罪恶王冠","80914":"美女与野兽","80600":"刘备","80446":"风云雄霸天下","80372":"滑雪","80371":"陈坤","80309":"炎亚纶","80129":"3DMAX","79809":"石原里美","79795":"朴宝英","79484":"贺来贤人","79402":"黑手党","79245":"喜剧片","79034":"素描","78992":"喜剧之王","78868":"终结者2","78711":"张靓颖","78484":"李敏镐","78415":"面条","78160":"西线无战事","77733":"章鱼哥","77680":"冯绍峰","77679":"黄渤","77557":"李晨","77556":"张译","77401":"夜宵","77388":"旭旭宝宝","77083":"阿杰","76626":"动物之森","76615":"F(X)","76435":"番茄","75847":"林丹","75803":"蔡康永","75002":"生化危机7","74927":"贞德","74605":"爱丽丝梦游仙境","74529":"菜单","73621":"朴树","73516":"寿司","73475":"孤岛惊魂","73404":"杏仁豆腐","73139":"武装突袭3","72926":"吕子乔","72672":"UZI","72303":"游泳","72140":"饮料","72138":"原创歌曲","71898":"焦恩俊","71897":"刘烨","71875":"汪峰","71686":"WENDY","71602":"张杰","71273":"相叶雅纪","71221":"煎蛋","71175":"白展堂","71124":"孙尚香","70720":"吉尔伽美什","70718":"横山裕","70561":"陈道明","70024":"泰拉瑞亚","69943":"六小龄童","69811":"邓紫棋","69736":"赵雅芝","69434":"钉钉","68637":"苏有朋","68539":"林志颖","68393":"赛文奥特曼","68321":"毕业季","68270":"香水","68112":"张家辉","68042":"2PM","67482":"监狱风云","67201":"BEAST","66872":"黑金","66849":"财经","66834":"关8","66611":"情侣","66594":"高晓松","66209":"现代舞","66188":"汪苏泷","64842":"安以轩","64475":"辩论","64457":"蓝拳","64397":"微电影","64343":"威廉","64254":"古筝","64207":"黎明","64022":"张震","63887":"许嵩","63715":"吴彦祖","63711":"巴比伦","63265":"黑道圣徒","63185":"复仇者联盟","63096":"恐龙","63073":"经济学","63019":"暮光之城","63017":"魔戒","63002":"天策","62939":"郑伊健","62937":"郭富城","62411":"德甲","62330":"英超","61963":"管理学","61575":"柯基","61512":"景甜","61511":"孙红雷","61382":"大仓忠义","61300":"警察故事","61044":"卸妆","61021":"东方神起","60730":"陈豪","60624":"高铁","60513":"未闻花名","60399":"小龙女","60323":"少女与战车","60181":"逃学威龙","59990":"刺猬索尼克","59930":"凉粉","59920":"赌圣","59861":"莫文蔚","59846":"农村","59624":"LOLITA FASHION","59535":"张柏芝","59534":"谢霆锋","59457":"茅野爱衣","59337":"红色警戒2","59062":"赌侠","58615":"邓超","58562":"西游降魔篇","58512":"海上钢琴师","58495":"诛仙","58261":"特斯拉","58230":"围棋","58228":"郑容和","58226":"朴信惠","58218":"公路车","57834":"航母","57684":"镇魂街","57448":"弹丸论破","57220":"印度电影","57156":"POPPING","56738":"雷欧奥特曼","56723":"八神","56504":"范伟","56408":"内马尔","56406":"小吃","55920":"钟汉良","55739":"唐伯虎点秋香","55152":"大S","55079":"小S","55054":"周迅","54904":"胡一菲","54593":"爱杀宝贝","54574":"GARY","54532":"张敬轩","54206":"单反","54046":"九品芝麻官","53885":"维吉尔","53873":"相机","53731":"李宇春","53667":"山地车","53580":"印度歌舞","53473":"搞笑配音","53445":"大野智","53206":"羽毛球","53105":"小叮当","53056":"韩剧","52718":"延时摄影","52314":"孔侑","52179":"纪实","52126":"王心凌","51540":"大乔","51532":"沙溢","51447":"狮子","51330":"诸葛亮","50944":"哈尔的移动城堡","50787":"凡人修仙传","50654":"李孝利","50614":"UFC","50488":"佐藤健","50345":"艾薇儿","50331":"战神4","50158":"彩虹六号","49874":"想见你","49741":"奥运会","49478":"IU","49439":"投影仪","49422":"TED","49079":"牧场物语","49009":"李云龙","49008":"亮剑","48961":"饺子","48934":"梅艳芳","48590":"上古卷轴5","48485":"千与千寻","48326":"二宫和也","48271":"吴京","48233":"海豹","48206":"橙子","47996":"冷知识","47988":"我的世界","47896":"斗地主","47863":"杨迪","47708":"高跟鞋","47637":"豪宅","47481":"职场","47404":"沙拉","47282":"日本料理","47079":"欧冠","47034":"DOTA2","46977":"下午茶","46929":"斯诺克","46723":"梁朝伟","46722":"张曼玉","46419":"侏罗纪公园","46188":"梁家辉","46183":"人工智能","46133":"冰淇淋","46126":"股票","46123":"周慧敏","45996":"机动战士高达00","45968":"星尘","45945":"菊次郎的夏天","45614":"金刚","45576":"吴奇隆","45566":"马天宇","45565":"霍建华","45564":"刘诗诗","45490":"大鱼海棠","45081":"伊藤润二","45077":"CL","44665":"武装突袭","44392":"ROSE","44381":"菅田将晖","44220":"折纸","44171":"刘慈欣","44129":"香取慎吾","44128":"中居正广","43766":"圣歌","43693":"驯龙高手","43303":"歌剧","42949":"欢乐颂","42739":"谢娜","42738":"何炅","42390":"黑暗之魂","42361":"陈小春","42348":"半泽直树","42279":"李克勤","42253":"短裤","42208":"维多利亚的秘密","42015":"排球","41928":"曾小贤","41917":"心理学","41861":"哥斯拉","41752":"王小明","41593":"咖啡","41573":"PSV","41194":"金庸","41103":"体育","40872":"手风琴","40855":"潘玮柏","40787":"VR","40737":"人文","40649":"镜音RIN","40374":"恶魔之魂","40323":"袁咏仪","40298":"长野博","40082":"HAHA","39999":"下山","39704":"IG","39591":"波风水门","39326":"羽生结弦","39295":"短裙","39164":"鸡蛋","39118":"鬼畜全明星","39107":"金融","39062":"鼠标","38731":"三体","38714":"传送门","38360":"BLG","38329":"奶茶","38199":"德语","38138":"锦户亮","37887":"孙策","37800":"岚","37660":"三森铃子","37558":"稻垣吾郎","37557":"SMAP","37497":"INFINITE","37364":"刘亦菲","37254":"阿甘正传","37242":"健康","37127":"芭蕾","36893":"早餐","36877":"LOVE LIVE!","36477":"堂本光一","36292":"太宰治","35859":"胡歌","35826":"让子弹飞","35807":"梦幻西游","35730":"周润发","35602":"葛优","35575":"坦克世界","35505":"甜点","35504":"蛋糕","35272":"姜文","35258":"木吉他","34631":"坎巴拉太空计划","34321":"黑科技","34155":"东方栀子","33963":"WE","33862":"王菲","33818":"TOKIO","33730":"法语","33623":"楚留香","33467":"逆水寒","33450":"独立游戏","33360":"林俊杰","33072":"航空","33034":"松本润","32944":"蹦极","32881":"超级战队","32813":"吴宗宪","32811":"赵本山","32788":"中岛裕翔","32767":"古典音乐","32613":"面试","32586":"水浒传","32517":"李玉刚","32461":"徐峥","32454":"汉服","32318":"邓萃雯","32301":"王力宏","32284":"惊声尖笑","31878":"翻跳","31864":"公开课","31861":"枪声音乐","31806":"刘醒","31762":"罗永浩","31093":"悠悠球","30951":"东北话","30815":"蚁人","30580":"长泽雅美","30550":"眉毛","30508":"梦幻模拟战","30239":"柴犬","30124":"赛罗奥特曼","29871":"黑亚当","29788":"教父","29722":"剑灵","29671":"尔康","29668":"空军","29661":"阿卡贝拉","29622":"功夫熊猫","29603":"刀剑神域","29597":"工藤新一","29415":"二次元鬼畜","29276":"汉堡","29138":"烧烤","29105":"水彩","29044":"美国队长","28784":"编程","28759":"BEATBOX","28683":"文明","28668":"美国电影","28631":"张卫健","28628":"吴孟达","28555":"OMG","28421":"刘德华","28321":"范冰冰","28195":"黑寡妇","28096":"甄子丹","28074":"魔法少女小圆","27955":"曼联","27866":"C罗","27398":"马化腾","27269":"山田孝之","27268":"小栗旬","27217":"梁非凡","27022":"死侍","27021":"绿巨人","26977":"洗面奶","26909":"王祖贤","26856":"镜音LEN","26583":"拳击","26582":"洛基","26517":"动画短片","26516":"奥斯卡","26390":"林青霞","26277":"全职猎人","26251":"盖聂","26249":"樱井翔","26180":"人力VOCALOID","26038":"暗黑破坏神","25955":"骑马与砍杀","25898":"跑车","25885":"陈奕迅","25758":"暗黑破坏神3","25560":"轩辕剑","25483":"GMV","25450":"摄影","25395":"国家地理","25376":"魔兽争霸3","25337":"黑豹","25327":"三笠","24935":"火柴人","24908":"卫宫士郎","24870":"蛋炒饭","24789":"英剧","24762":"阿拉斯加","24467":"岳云鹏","24386":"康熙来了","24304":"战斗机","24236":"跳水","23995":"航拍","23901":"互联网","23877":"风之谷","23661":"小罗伯特唐尼","23605":"汉尼拔","23580":"贝吉塔","23430":"霸王别姬","23369":"LGD","23331":"粽子","23306":"炸鸡","23208":"平板电脑","23182":"武汉","23002":"柏木由纪","22984":"三浦春马","22919":"大熊猫","22657":"罗志祥","22654":"小说","22551":"漫展","22534":"ADC","22525":"这个杀手不太冷","22338":"BW","22317":"乌龟","22269":"瑜伽","21873":"泰拳","21854":"SUV","21646":"指弹吉他","21609":"饼","21534":"闪电侠","21382":"如龙","21337":"月饼","21325":"美人鱼","21297":"嘻哈","21295":"鬼步舞","21216":"显示器","21187":"剑网3","21079":"土豆","20986":"蛋挞","20805":"减肥","20804":"跑步","20795":"神奇女侠","20744":"日麻","20736":"EXCEL","20706":"赛尔号","20684":"五月天","20495":"滑板","20479":"笛子","20459":"鬼泣5","20439":"萨摩耶","20327":"射击游戏","20215":"美食","20098":"冲浪","20057":"魔兽争霸","20042":"昆虫","20002":"TRPG","19956":"包子","19890":"游戏解说","19877":"美军","19860":"郭敬明","19794":"黄晓明","19703":"零食","19539":"灰原哀","19382":"披萨","19258":"阿森纳","19047":"李连杰","19042":"台风","18970":"和珅","18969":"纪晓岚","18966":"张国立","18902":"跑团","18879":"小王子","18874":"跑跑卡丁车","18755":"硬盘","18669":"陈汉典","18537":"DRAMA","18505":"最终幻想7","18447":"鲨鱼","18423":"摩托车","18330":"卫庄","18277":"曹操","18086":"棒球","18056":"面包","17941":"恐怖游戏","17940":"红蝶","17739":"布丁","17690":"黄子华","17683":"单机游戏","17625":"悲惨世界","17539":"摔角","17418":"贝斯","17390":"行尸走肉","17365":"NASA","17332":"马云","17299":"谢耳朵","17246":"魔方","17231":"神秘海域","17098":"剑道","17034":"欧美音乐","17013":"霍比特人","16992":"盗梦空间","16807":"龟梨和也","16724":"穿越火线","16599":"馒头","16474":"红白歌会","16332":"冷兵器","16262":"口琴","16097":"乒乓球","16093":"军训","15958":"哈士奇","15942":"史莱姆","15846":"鸡翅","15845":"清唱","15808":"李钟硕","15751":"黄瓜","15746":"少女时代","15491":"鸣人","15478":"头文字D","15414":"台球","15342":"天文","15296":"英文翻唱","15265":"架子鼓","15227":"中岛美嘉","15204":"孙悟空","15187":"TFBOYS","15186":"易烊千玺","14958":"导弹","14932":"程序员","14913":"拳皇97","14898":"TES","14826":"琵琶","14704":"乐器","14583":"佐助","14469":"木村拓哉","14426":"电音","14379":"PR","14117":"贾静雯","14107":"新垣结衣","14080":"加勒比海盗","13996":"不知火舞","13896":"发型","13893":"交响乐","13881":"超级英雄","13879":"X战警","13878":"金刚狼","13848":"小品","13784":"迪迦奥特曼","13760":"汽车","13715":"STEAM","13683":"民谣","13584":"地狱少女","13509":"文学","13490":"定格动画","13450":"科幻片","13370":"机械舞","13267":"RADWIMPS","13175":"化妆","13098":"万智牌","13004":"国产凌凌漆","12988":"动物世界","12882":"跑酷","12843":"魔女","12837":"擎天柱","12816":"于谦","12784":"开口跪","12732":"猫头鹰","12675":"皇马","12644":"猪肉","12625":"小游戏","12407":"张超","12341":"UFO","12157":"BIGBANG","12134":"炒饭","12097":"回魂夜","12078":"陈冠希","11936":"恐怖片","11920":"三国志","11824":"网球王子","11715":"马拉多纳","11687":"综艺","11684":"LISA","11666":"战锤40K","11564":"铠甲勇士","11559":"音乐剧","11526":"樱井孝宏","11434":"黄家驹","11387":"喜羊羊","11376":"公益","11291":"最终幻想14","11265":"手工","11259":"民乐","11212":"玩具","11208":"堂本刚","11142":"寂静岭","11109":"FIFA","11100":"荒野求生","10710":"黑暗料理","10699":"ARASHI","10657":"泰坦尼克号","10613":"跳舞机","10427":"歌姬计划","10387":"TVB","10384":"真三国无双","10325":"战神","10282":"容嬷嬷","10216":"中村悠一","10071":"植物大战僵尸","9969":"板绘","9962":"巨石强森","9955":"汪星人","9924":"怪盗基德","9920":"老虎","9887":"战锤","9826":"鬼泣4","9783":"迈克尔杰克逊","9711":"胡萝卜","9683":"关羽","9605":"幽灵公主","9600":"星座","9533":"冰箱","9505":"毛利兰","9500":"宅舞","9476":"鲁邦三世","9458":"高考数学","9435":"蜘蛛侠","9374":"HIPHOP","9366":"新番介绍","9264":"宇宙","9222":"英雄联盟","9177":"PHOTOSHOP","9145":"企鹅","8964":"哈利波特","8947":"贝爷","8892":"郭德纲","8881":"名侦探柯南","8876":"极限运动","8859":"考试","8816":"英语","8785":"钢铁侠","8740":"高考","8734":"耳机","8729":"极品飞车","8669":"麻婆豆腐","8564":"洛天依","8562":"中国风","8522":"布袋戏","8470":"狙击手","8422":"生化危机2","8401":"婚礼","8316":"飞机","8314":"指原莉乃","8259":"光之美少女","8227":"古风","8172":"健身操","8142":"激战2","8099":"SNL","8043":"中文翻唱","7993":"摇滚","7991":"张国荣","7976":"古墓丽影","7950":"成龙","7949":"三国杀","7944":"铃村健一","7849":"解放军","7782":"三国演义","7781":"新三国","7712":"白客","7678":"龙之谷","7634":"求生之路","7620":"豆腐","7583":"陈浩民","7501":"吴邪","7500":"张起灵","7457":"宫野真守","7384":"樱桃小丸子","7258":"街霸","7257":"中岛美雪","7205":"黑执事","7172":"吕布","7161":"妖精的尾巴","7158":"JOY","7114":"乐队","7074":"小提琴","7062":"精灵宝可梦","7029":"GMOD","7007":"手机","6947":"吱星人","6943":"萌宠","6942":"吃货","6888":"上古卷轴","6728":"超越","6694":"鹦鹉","6609":"舞台剧","6603":"求生之路2","6578":"计算机","6572":"旅游","6466":"阅兵","6453":"RPG","6446":"苏打绿","6348":"水果","6346":"原曲不使用","6332":"黑塔利亚","6225":"一方通行","6213":"显卡","6212":"CPU","6107":"李小龙","6106":"街头霸王","6088":"龙族","6052":"世界奇妙物语","6048":"乐高","6035":"蔡依林","6033":"堺雅人","6028":"模拟人生","6019":"洗衣机","5963":"火锅","5911":"福山润","5909":"诹访部顺一","5892":"生田斗真","5882":"死亡空间","5858":"命运石之门","5794":"美国","5784":"功夫","5783":"相声","5781":"刺客信条","5722":"千本樱","5663":"狮子王","5633":"鬼泣","5632":"电台","5597":"芒果","5590":"法律","5574":"街舞","5563":"国庆","5558":"死神","5555":"山下智久","5540":"正义联盟","5461":"路飞","5417":"科普","5401":"合金装备","5374":"虐杀原形","5341":"眼镜","5312":"机动战士高达SEED","5282":"卡卡西","5251":"科幻","5249":"神谷浩史","5220":"塞尔达传说","5216":"そらる","5195":"京剧","5192":"误解向","5152":"机械","5108":"魔卡少女樱","5069":"兔子","5033":"DNF","5023":"育碧","4968":"生化危机3","4958":"宝莲灯","4916":"黑客帝国","4890":"OST","4835":"荒野大镖客","4772":"费玉清","4759":"钉宫理惠","4747":"生化危机4","4672":"JOJO的奇妙冒险","4585":"坂田银时","4577":"OSU","4486":"泰罗奥特曼","4346":"脱口秀","4344":"健身","4306":"犬夜叉","4296":"宫崎骏","4274":"龙与虎","4248":"钓鱼","4200":"张学友","4199":"浪客剑心","4198":"海贼王","4187":"克苏鲁","4083":"花样滑冰","4072":"龙猫","4053":"博丽灵梦","4052":"梅西","3988":"武器","3986":"艾尔之光","3985":"EVE","3982":"LIA","3981":"恶魔城","3973":"泽野弘之","3965":"机动战士高达UC","3875":"逆转裁判","3828":"貂蝉","3737":"悠木碧","3620":"DIY","3569":"春晚","3553":"广播剧","3531":"星际争霸2","3504":"英国","3502":"空之境界","3492":"方言","3344":"家庭教师","3238":"GTA","3220":"上海话","3189":"俄罗斯","3185":"吉他","3151":"配音","3138":"勇者斗恶龙","3125":"南条爱乃","3086":"日语","3079":"警察","3023":"超级玛丽","3006":"模型","2999":"赛车","2968":"周杰伦","2953":"光环","2947":"特摄","2904":"GUMI","2902":"幽灵","2894":"阴阳师","2874":"JAZZ","2870":"铁血战士","2869":"异形","2861":"新海诚","2825":"DC","2810":"星球大战","2800":"绘画","2739":"演讲","2696":"反恐精英","2633":"印度","2630":"钢琴","2600":"大岛优子","2599":"渡边麻友","2598":"前田敦子","2592":"AKB48","2531":"SAI","2496":"铃木达央","2453":"IPAD","2383":"暴雪","2359":"水树奈奈","2355":"恋爱循环","2349":"游戏王","2337":"太鼓达人","2332":"杉田智和","2296":"魔兽世界","2259":"秒速五厘米","2231":"ASTRO","2199":"王宝强","2069":"假面骑士","2052":"西瓜","2027":"某科学的超电磁炮","1988":"方便面","1961":"灌篮高手","1951":"DOTA","1938":"国足","1885":"小野大辅","1833":"搞笑","1758":"漫才","1730":"粤语","1726":"轻音少女","1669":"萝卜","1654":"战地","1645":"声优","1630":"KAITO","1616":"螃蟹","1599":"红白机","1562":"喵星人","1555":"同人游戏","1552":"现代战争","1547":"便当","1546":"上条当麻","1541":"英雄","1520":"二胡","1476":"SABER","1462":"半条命","1429":"久石让","1426":"天空之城","1405":"阿凡达","1364":"科学","1356":"金坷垃","1339":"电脑","1338":"笔记本","1329":"十六夜咲夜","1311":"茄子","1281":"DJ","1257":"最终幻想","1246":"无主之地","1238":"魂斗罗","1210":"手绘","1172":"都市传说","1149":"花泽香菜","1141":"羊驼","1134":"KEY","1126":"MMD","1110":"冒险岛","1087":"使命召唤","1068":"柯南","1022":"蜡笔小新","1009":"任天堂","994":"新世纪福音战士","980":"高达","963":"奥特曼","959":"葛平","949":"仙剑奇侠传","930":"FC","882":"哆啦A梦","869":"我爱你","860":"日本","857":"短片","853":"蝙蝠侠","804":"LILY","803":"生化危机","788":"火星","776":"俄语","718":"魔法禁书目录","702":"蘑菇","678":"御坂美琴","674":"合金弹头","627":"同人音乐","610":"皮卡丘","608":"手书","597":"雾雨魔理沙","596":"上海","589":"哲学","584":"足球","564":"机器人","548":"泰语","547":"泰国","529":"说唱","516":"初音未来","513":"灰姑娘","483":"怪物猎人","442":"马里奥","436":"命令与征服","434":"键盘","426":"凉宫春日","416":"叶问","404":"CLANNAD","403":"红色警戒3","398":"周星驰","396":"麻将","391":"AMV","386":"翻唱","379":"古天乐","373":"演奏","372":"电吉他","368":"技术宅","366":"拳皇","364":"格斗","363":"MUGEN","342":"XBOX","341":"PS3","310":"德国","290":"VOCALOID","281":"MAD","254":"变形金刚","246":"RAP","232":"红色警戒","221":"历史","167":"猫和老鼠","166":"东方","133":"雷神","116":"韩国","112":"星际争霸","88":"COSPLAY","77":"偶像大师","68":"鬼畜","21":"万恶之源"}`)
    },
    //设置当前频道的id
    setChannel_id(id) {
        Util.setData("channel_id", parseInt(id));
    },
    //获取当前频道的id
    getChannel_id() {
        const data = Util.getData("channel_id");
        if (data === undefined || data == null) {
            return 17941;//默认返回恐怖游戏的频道
        }
        return parseInt(data);
    },
    //设置频道推送的类型，热门还是以播放量亦或者最新
    setSort_type(typeStr) {
        Util.setData("sort_type", typeStr);
    },
    //获取频道推送的类型，热门还是以播放量亦或者最新
    getSort_type() {
        const data = Util.getData("sort_type");
        return data === undefined || data === null ? "hot" : data;//默认返回热门
    },
    /**
     *
     * @param id 频道id
     * @param typeStr 频道对应的排序类型
     * @param s 具体的内容
     */
    setOffset(id, typeStr, s) {
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
    getOffset(id, typeStr) {
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
    listRules() {
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
    videoRules() {
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
    delDevelop() {
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
    startExtracted(vdoc) {
        let temp = false;
        for (let element of vdoc) {
            const jqE = $(element);
            if (Util.isEventJq(jqE, "mouseover")) {
                continue;
            }
            jqE.mouseenter((e) => {
                const element = e.delegateTarget;
                const data = frequencyChannel.getVideoRules(element);
                Util.showSDPanel(e, data);
            });
            element.style.margin = "0px 5px 0px 0px";//设置元素边距
            const data = frequencyChannel.getVideoRules(element);
            temp = shieldVideo_userName_uid_title(data);
        }
        return temp;
    },
    cssStyle: {
        tempVar: {
            //是否执行了调整页面边距
            backGaugeBool: false,
        },
        backGauge() {
            if (this.tempVar.backGaugeBool) {
                return;
            }
            this.tempVar.backGaugeBool = true;
            document.getElementsByClassName("detail-panels")[0].style.width = "auto";//调整其页面左右边距
            Print.ln("已调整频道界面的左右边距")
        }
    },
    getVideoRules(element) {//获取频道界面单个的视频信息
        const videoInfo = element.querySelector(".video-name");
        //空间地址
        const tempE = element.querySelector(".up-name");
        // console.assert(tempE !== null, "用户空间地址获取失败", element, tempE);
        const upSpatialAddress = tempE.href;
        const lastIndexOf = upSpatialAddress.substring(upSpatialAddress.lastIndexOf("/") + 1);
        const topInfo = element.getElementsByClassName("video-card__info")[0].getElementsByClassName("count");
        const videoHref = videoInfo.href;
        const v_img = element.querySelector(".cover-picture>img");
        return new VideoClass()
            .setE(element)
            .setUpName(element.querySelector(".up-name__text").textContent)
            .setUid(Util.getSubUid(lastIndexOf))
            .setTitle(videoInfo.textContent.trim())
            .setVideoAddress("https:" + videoHref)
            .setBv(Util.getSubWebUrlBV(videoHref))
            .setPlaybackVolume(topInfo[0].textContent.trim())
            .setVideoTime(element.getElementsByClassName("play-duraiton")[0].textContent)
            .setBarrageQuantity(topInfo[1].textContent.trim())
            .setFrontCover(v_img === null ? null : v_img.getAttribute("src"));
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
                Qmsg.error("出现错误");
                Qmsg.error(err);
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
                Qmsg.success(`正在获取关注列表中正在直播列表`);
                continue;
            }
            if (liveStatus === 0 || liveStatus === -1) {
                Util.mergeArrays(dataList, data.dataList);
                break;
            }
        } while (true);
        Qmsg.success(`已获取完成！`);
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
                        Print.ln(tempInfo);
                        Qmsg.success(tempInfo);
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
        //针对于直播间顶部的屏蔽处理
        topElement() {
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
        hreadElement() {
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
        bottomElement() {//针对于直播间底部的屏蔽处理
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
        delGiftBar() {
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
        delRightChatLayout() {
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
        delOtherE() {
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
        delLiveRoom() {//过滤直播间列表，该功能目前尚未完善，暂时用着先
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
};
//动态
const Trends = {
    data: {
        setTrendsItemsTwoColumnCheackbox(bool) {
            Util.setData("isTrendsItemsTwoColumnCheackbox", bool);
        },
        getTrendsItemsTwoColumnCheackbox() {
            return Util.isBoolean(Util.getData("isTrendsItemsTwoColumnCheackbox", false));
        },
    }, topCssDisply: {
        //针对于整体布局的细调整
        body() {
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
        topTar() {
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
        },
        rightLayout() {
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
    }, layoutCss: {
        items() {//调整动态列表的布局方式为类似网格
            Util.addStyle(`
            .bili-dyn-list__items{
           column-count: 2;
            }
            .bili-dyn-list__items>*{
            page-break-inside: avoid;
            }
            `);
        },
        tabUserItems(jqE) {//调整切换用户展示动态的按钮列表样式
            let index = 0;
            jqE.css("display", "flex");
            jqE.css("flex-flow", "row wrap");
            const interval = setInterval(() => {
                if (index === 5) {
                    clearInterval(interval);
                    Qmsg.info("结束定时器");
                }
                if (jqE.css("flex-flow") === "row wrap") {
                    index++;
                    return;
                }
                jqE.css("display", "flex");
                jqE.css("flex-flow", "row wrap");
            }, 2500);
        }
    },
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
                Qmsg.success(`已通过动态关键词屏蔽相关动态，详情屏蔽内容可看面板输出信息`);
                Print.ln(tempInfo);
                continue;
            }
            const arrContentCanonical = Matching.arrContentCanonical(LocalData.getDynamicCanonicalArr(), tempContent);
            if (arrContentCanonical != null) {
                const tempInfo = `已通过动态正则关键词【${arrContentCanonical}】屏蔽了动态【${tempContent}】`;
                v.remove();
                Qmsg.success(`已通过动态正则关键词屏蔽相关动态，详情屏蔽内容可看面板输出信息`);
                Print.ln(tempInfo);
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
    }
};
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
                if (e.length === 0) {
                    return;
                }
                clearInterval(interval);
                resolve(e.text());
            }, 100);
        });
    },
    getTabName() {
        let typeE = document.querySelector(".n-statistics>.router-link-active>.n-data-k");//关注或粉丝页
        if (typeE !== null) {
            return typeE.textContent;
        }
        typeE = document.querySelector(".n-tab-links>.active>.n-text");
        if (typeE === null) {
            return null;
        }
        return typeE.textContent;
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
        }
        ,
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
            if (value.querySelector(".endpic") !== null) {
                return;
            }
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
const Watchlater = {
    initLayout() {
        const panel = layout.panel.getHoverball("获取稍后再看列表数据", "32%", "5%");
        const paneLooked = layout.panel.getHoverball("获取稍后再看列表数据(已观看)", "42%", "5%");
        const leadingInLookAtItLaterBut = layout.panel.getHoverball("导入脚本的稍后再看列表", "52%", "5%");
        const $body = $("body");
        $body.append(panel);
        $body.append(paneLooked);
        $body.append(leadingInLookAtItLaterBut);
        panel.click(() => {
            if (!confirm("仅获取页面可见的列表了内容并导出为json，是要继续吗？")) {
                return;
            }
            Util.bufferBottom();
            setTimeout(() => {
                const dataList = this.getDataList();
                if (dataList.length === 0) {
                    alert("未有相关内容！");
                    return;
                }
                const info = `已获取到${dataList.length}个稍后再看的记录`;
                Qmsg.success(info);
                Print.ln(info);
                alert(info);
                Util.fileDownload(JSON.stringify(dataList, null, 3), `b站用户的稍后再看记录${dataList.length}个.json`);
            }, 1550);
        });
        paneLooked.click(() => {
            if (!confirm("仅获取页面可见的列表中【已观看】了的内容并导出为json，是要继续吗？")) {
                return;
            }
            Util.bufferBottom();
            ;
            setTimeout(() => {
                const dataList = this.getDataList(true);
                if (dataList.length === 0) {
                    alert("未有相关内容！");
                    return;
                }
                const info = `已获取到${dataList.length}【已观看的】稍后再看的记录`;
                Qmsg.success(info);
                Print.ln(info);
                alert(info);
                Util.fileDownload(JSON.stringify(dataList, null, 3), `b站用户的【已观看】稍后再看记录${dataList.length}个.json`);
            }, 1550);
        });
        leadingInLookAtItLaterBut.click(() => {
            if (!confirm("是要获取页面可见的列表了内容并导入到脚本中的稍后再看列表吗，是要继续吗？")) {
                return;
            }
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
                        Qmsg.error(`title=${v.title}的视频出现问题，可能是失效了，故排除该视频`);
                        continue;
                    }
                    lookAtItLaterArr.push({
                        upName: v.upName,
                        uid: v.uid,
                        title: v.title,
                        bv: Util.Str.lastForwardSlashEnd(v.videoAddress)
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
                returnVue.renovateLayoutItemList();
            }, 1550);


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
        eList.forEach(v => {
            const data = {};
            const videoInfo = v.querySelector(".av-about");
            data["title"] = videoInfo.querySelector(".t").textContent.trim();
            const userInfo = videoInfo.querySelector(".info.clearfix>.user");
            data["upName"] = userInfo.querySelector("span").textContent;
            const userAddress = userInfo.getAttribute("href");
            data["uid"] = Util.getSubWebUrlUid(userAddress);
            data["userAddress"] = userAddress;
            data["videoAddress"] = videoInfo.querySelector(".t").getAttribute("href");
            data["userImg"] = userInfo.querySelector(".lazy-img>img").getAttribute("src");
            if (isV) {
                const looked = v.querySelector(".looked");
                if (looked === null) {
                    return;
                }
                dataList.push(data);
                return;
            }
            dataList.push(data);
        });
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
                        Print.ln("用户点击了右侧的展开")
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
            if (list.length === 0) {
                return;
            }
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
                    Qmsg.info("屏蔽了视频！！");
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
                        av: bilibiliEncoder.dec(bv)
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
                if (jqE.length === 0) {
                    return;
                }
                clearInterval(interval);
                jqE.click();
                const info = `已自动点击播放器的网页全屏`;
                Print.ln(info);
                Qmsg.success(info);
                console.log(info);
            }, 1000);
        },
        thePlayerGoesToGullScreen() {//点击播放器的进入全屏按钮
            const interval = setInterval(() => {
                const jqE = $(".bpx-player-ctrl-btn.bpx-player-ctrl-full");
                if (jqE.length === 0) {
                    return;
                }
                clearInterval(interval);
                jqE.click();
                const info = "已自动点击播放器的进入全屏按钮";
                Qmsg.success(info);
                Print.ln(info);
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
                data ["uid"] = parseInt(Util.getSubWebUrlUid(userAddress));
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
                if (jqE.length === 0) {
                    return;
                }
                clearInterval(interval);
                jqE.hide();
                Qmsg.success("已隐藏评论区");
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
            Print.ln("已设置播放器的速度=" + data);
        }
    }

}

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
            if (Matching.arrKey(LocalData.getArrUID(), userUid)) {
                jqE.remove();
                Qmsg.success(`已通过黑名单uid规则屏蔽${userUid} 屏蔽用户【${userName}】uid=${userUid} -搜索优先级匹配显示的用户内容`);
                return;
            }
            const MA = Matching.arrContent(LocalData.getArrNameKey(), userName);
            if (MA === null) return;
            jqE.remove();
            Qmsg.success(`已通过黑名单用户名模糊规则=【${MA}】 屏蔽${userUid} 屏蔽用户【${userName}】uid=${userUid} -搜索优先级匹配显示的用户内容`);
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
                if (title === null) {
                    return;
                }
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
                if (userInfo === null) {
                    return;
                }
                const userAddress = userInfo.getAttribute("href");
                data["name"] = userInfo.querySelector(".bili-video-card__info--author").textContent;
                data["uid"] = parseInt(Util.getSubWebUrlUid(userAddress));
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
                    Qmsg.info("屏蔽了视频！！");
                    return;
                }
                const jqE = $(v["e"]);
                if (Util.isEventJq(jqE, "mouseover")) {
                    return;
                }
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
                        Qmsg.info("加载中...");
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
                data["uid"] = parseInt(Util.getSubWebUrlUid(address));
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
                    Qmsg.info("屏蔽了言论！！");
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
                Qmsg.info("屏蔽了视频！！");
            }
        }
    }
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
                    Qmsg.info("屏蔽了视频！！");
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
                Qmsg.info("屏蔽了视频！！");
            }
        }
    }
}
Util.addGMMenu('设置锁屏密码', () => LockScreen.setPwdShow());
Util.addGMMenu('重置锁屏密码', () => LockScreen.resetPwdShow());
Util.addGMMenu('设置加锁时间', () => LockScreen.setScreenLockTimeShow());

Util.addGMMenu("手动锁屏", () => LockScreen.manualLockScreen());

Util.addGMMenu('开关锁屏功能', () => LockScreen.ioLLockScreenShow());
Util.addGMMenu('查询锁屏时间', () => LockScreen.lookScreenLockTime());

Util.addGMMenu('禁用脚本快捷键', () => {
    const input = prompt(`当前脚快捷键状态为：${LocalData.isEnableShortcutKeys() ? "启用" : "禁用"}\n输入1为启用，输入0为禁用`);
    if (input === null) return;
    const is = {0: false, 1: true};
    if (is[input] === undefined) {
        Qmsg.error(`输入了意外的内容！`);
        return;
    }
    LocalData.setEnableShortcutKeys(is[input]);
    Qmsg.success(`已设置快捷键状态为：${is[input] ? "启用" : "禁用"}`);
});

const LockScreen = {
    screen: LocalData.LockScreen,
    verifyPwd() {//验证锁屏密码流程
        const pwd = this.screen.getPwd();
        if (pwd === null) {
            return true;
        }
        const input = prompt("您需要输入锁屏密码来验证身份")
        if (input === null) return null;
        return input === pwd;

    },
    setPwdShow(isVerifyPod = true) {//设置锁屏密码流程
        if (isVerifyPod) {
            const verifyPwd = this.verifyPwd();
            if (verifyPwd === null) return;
            if (!verifyPwd) {
                Qmsg.error("验证失败！");
                return;
            }
        }
        const oldPwd = this.screen.getPwd();
        let newPwd = prompt("请输入新的锁屏密码作为锁屏密码");
        if (newPwd === null) return;
        newPwd = newPwd.trim();
        if (newPwd === oldPwd) {
            alert("旧锁屏密码不能和新密码相同！");
            return;
        }
        this.screen.setPwd(newPwd);
        const tip = `设置成功！，您当前的锁屏密码为${newPwd}`;
        Qmsg.success(tip);
        Print.ln(tip);
        alert(tip);
    },
    resetPwdShow() {//重置锁屏密码流程
        const verifyPwd = this.verifyPwd();
        if (verifyPwd === null) return;
        if (!verifyPwd) {
            Qmsg.error("验证失败！");
            return;
        }
        this.setPwdShow(false);
    },
    ioLLockScreenShow() {//设置锁屏的开关
        const pwd = this.screen.getPwd();
        if (pwd === null) {
            if (!confirm("请先设置锁屏密码先，点击确定设置锁屏密码，取消则取消")) {
                return;
            }
            this.setPwdShow();
            return;
        }
        const verifyPwd = this.verifyPwd();
        if (verifyPwd === null) return;
        if (verifyPwd === false) {
            Qmsg.error("验证失败！");
            return;
        }
        const s = prompt(`输入1为开启，0为关闭，当前为${this.screen.getState() ? "开启" : "关闭"}状态`);
        if (s === null) return;
        let boo = null;
        if (s === "1") {
            boo = true;
        }
        if (s === "0") {
            boo = false;
        }
        if (boo === null) {
            Qmsg.error("输入错误，请按照格式正确输入！");
            return;
        }
        const state = this.screen.getState();
        if (state === boo) {
            alert("相同状态无需设置！");
            return;
        }
        this.screen.setState(boo);
        const tip = `已设置锁屏开关状态，当前为${boo ? "开启" : "关闭"}状态`;
        Qmsg.success(tip);
        Print.ln(tip);
        alert(tip);
    },
    isLockScreen() {
        if (!this.screen.getState()) {
            Qmsg.info("未开启锁屏功能");
            return;
        }
        Qmsg.info("开启锁屏功能");
        const nowTime = Date.now();
        const screen = this.screen;
        const intervalTime = screen.getIntervalTime();//锁屏间隔时间戳
        const tLastTimestamp = screen.getTLastTimestamp();//最后记录的解锁的时间戳
        const toTLastTimestamp = Util.timestampToTime(tLastTimestamp);
        if (nowTime - tLastTimestamp < intervalTime) {//当剩下的时间戳小于锁屏间隔时间戳时不锁屏操作，反之进行锁屏
            return;
        }
        const pwd = screen.getPwd();
        const interval = setInterval(() => {
            const inputPwd = prompt("锁屏中，请输入锁屏密码进行解锁操作，解锁之后正常访问页面内容");
            if (inputPwd === null) {
                return;
            }
            if (inputPwd !== pwd) {
                alert("密码验证失败！");
                return;
            }
            clearInterval(interval);
            screen.setTLastTimestamp(Date.now());
            Qmsg.success("已解锁成功！");
        }, 25);

    },
    setScreenLockTimeShow() {
        const verifyPwd = this.verifyPwd();
        if (verifyPwd === null) return;
        let time = prompt(`请输入间隔时间戳？
需使用毫秒为单位的时间戳，如果您需要指定间隔时间，比如下面的一天时间则为86400000，一天之后才会触发自动锁屏，以下仅供参考
一天的时间戳是 86,400,000 毫秒（24小时 × 60分钟 × 60秒 × 1000毫秒）。
一小时的时间戳是 3,600,000 毫秒（60分钟 × 60秒 × 1000毫秒）。
一分钟的时间戳是 60,000 毫秒（60秒 × 1000毫秒）。
        `);
        if (time === null) return;
        time = time.trim();
        if (isNaN(time)) {
            Qmsg.error("请填写数字！");
            return;
        }
        time = parseInt(time);
        if (time < 60000 * 5) {//判断是否小于5分钟
            Qmsg.error("设置的时间不可小于5分钟！");
            return;
        }
        this.screen.setIntervalTime(time);
        const tip = `已成功设置间隔时间戳为${time}，单位毫秒，当下次访问超出该时间时会对页面进行锁屏操作，用户需要输入锁屏密码通过之后才可以正常访问页面，且成功之后以当时的时间重新开始统计`;
        Qmsg.success(tip);
        alert(tip);
    },
    manualLockScreen() {//手动锁屏
        this.screen.setTLastTimestamp(-1);
        this.isLockScreen();
    },
    lookScreenLockTime() {
        const lastTimestamp = this.screen.getTLastTimestamp();
        const intervalTime = this.screen.getIntervalTime();
        alert(`最后锁屏解锁时间${Util.timestampToTime(lastTimestamp)}
锁屏间隔时间戳：${intervalTime}
        
毫秒为单位的时间戳数值参考：
一天的时间戳是 86,400,000 毫秒（24小时 × 60分钟 × 60秒 × 1000毫秒）。
一小时的时间戳是 3,600,000 毫秒（60分钟 × 60秒 × 1000毫秒）。
一分钟的时间戳是 60,000 毫秒（60秒 × 1000毫秒）。
        `);
    }

}
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
                            console.log(au.is(":checked"));
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
                        Print.ln("播放结束");
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
                if (list.length === 0) {
                    return;
                }
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
    if (href.search("www.bilibili.com/v/channel/.*?tab=.*") !== -1) {//频道 匹配到频道的精选列表，和综合的普通列表
        frequencyChannel.videoRules();
        frequencyChannel.delDevelop();
        frequencyChannel.cssStyle.backGauge();
    }
    if (href.includes("www.bilibili.com/v/channel/")) {
        const interval = setInterval(() => {
            const jqE = $(".slide-scroll");
            if (jqE.length === 0) return;
            clearInterval(interval);
            jqE.css("flex-wrap", "wrap");
            document.querySelector(".arrow-btn.arrow-btn--right").remove();
            Qmsg.success("已调整页面顶部最近观看的频道列表展示效果");
        }, 1000);
    }
    if (href.includes("www.bilibili.com/v/popular")) {//热门
        GreatDemand.delVideo();
        const interval = setInterval(() => {
            const jqE = $(".international-footer");
            if (jqE.length === 0) return;
            clearInterval(interval);
            jqE.remove();
        }, 1000);
        return;
    }
    if (href.includes("www.bilibili.com/v/")) {//通过URL变动执行屏蔽首页分区视频
        Home.startShieldMainVideo(".bili-video-card");
        Home.homePrefecture();
        return;
    }
    if (href.includes("space.bilibili.com")) {
        const userName = await Space.getUserName();
        const $getDataListBut = $("#getDataListBut");
        const $getAllDataListBut = $("#getAllDataListBut");
        const getTabName = Space.getTabName();
        if (getTabName === "主页") {
            $getDataListBut.hide();
            $getAllDataListBut.hide();
        } else {
            $getDataListBut.show();
            $getAllDataListBut.show();
        }
        if (getTabName === "投稿") {
            const name = Space.video.getLeftTabTypeName();
            $getDataListBut.text(`获取当前${getTabName}页的${name}列表数据`);
            $getAllDataListBut.text(`获取${getTabName}的${name}列表数据`);
        } else if (getTabName === "订阅") {
            const tabsName = Space.subscribe.getTabsName();
            $getDataListBut.text(`获取当前${tabsName}页的列表数据`);
            $getAllDataListBut.text(`获取${tabsName}的列表数据`);
        } else {
            $getDataListBut.text(`获取当前${getTabName}页的列表数据`);
            $getAllDataListBut.text(`获取${getTabName}的列表数据`);
        }
        switch (getTabName) {
            case "动态":
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
                    Trends.shrieDynamicItems(list);
                    if (Util.isEventJq(tempE, "DOMNodeInserted")) {
                        clearInterval(interval01);
                        return;
                    }
                    tempE.bind("DOMNodeInserted", () => {
                        Trends.shrieDynamicItems($(".bili-dyn-list__items").children());
                    });
                }, 1000);
                break;
        }

        if (LocalData.getPrivacyMode() && Space.isH_action()) {
            $(".h-inner").hide();
            $("#navigator-fixed .n-tab-links .n-fans").hide();
            Qmsg.success(`检测到当前页面是用户自己的个人空间，由于开启了隐私模式，故隐藏该信息`);
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
            Qmsg.info(`已通过标题关键词 ${arrContent} 过滤顶部搜索框显示的内容=${title}`);
        }
        nav_search_input.click(() => {
            console.log("点击了顶部搜索框");
            const interval01 = setInterval(() => {
                const list = document.querySelectorAll(".trendings-double .trending-item");
                if (list.length === 0) return;
                clearInterval(interval01);
                list.forEach((value, key, parent) => {
                    const content = value.querySelector(".trending-text").textContent;
                    const titleKey = Remove.titleKey(value, content);
                    if (titleKey !== null) {
                        Qmsg.info("规则屏蔽了相关热搜");
                        Print.ln(`已通过标题关键词【${titleKey}】屏蔽热搜榜项目内容【${content}】`);
                        return;
                    }
                    const titleKeyCanonical = Remove.titleKeyCanonical(value, content);
                    if (titleKeyCanonical !== null) {
                        Qmsg.info("规则屏蔽了相关热搜");
                        Print.ln(`已通过标题正则关键词【${titleKeyCanonical}】屏蔽热搜榜项目内容【${content}】`);
                        return;
                    }
                    const contentKey = Remove.contentKey(value, content);
                    if (contentKey !== null) {
                        Qmsg.info("规则屏蔽了相关热搜");
                        Print.ln(`已通过标内容关键词【${contentKey}】屏蔽热搜榜项目内容【${content}】`);
                    }
                });
                // nav_search_input.unbind();//删除该元素的所有jq添加的事件
            }, 50);
        });
    }, 1000);
    if (LocalData.getPrivacyMode()) {
        const interval02 = setInterval(() => {
            const tempE01 = document.querySelector(".right-entry") || document.querySelector(".nav-user-center");
            if (tempE01 === null) {
                return;
            }
            tempE01.style.visibility = "hidden";//隐藏元素继续占位
        }, 1100);
    }

    if (href === "https://www.bilibili.com/" || href.includes("www.bilibili.com/?spm_id_from") || href.includes("www.bilibili.com/index.html")) {//首页
        console.log("进入了首页");
        const interval03 = setInterval(() => {
            const jqE = $(".channel-icons");
            if (jqE.length === 0) {
                return;
            }
            clearInterval(interval03);
            const jqELast = jqE.children().eq(-1);
            const jqEa = jqELast.clone();
            jqEa.attr("href", "https://www.bilibili.com/v/channel");
            jqEa.find(".icon-title").text("频道");
            jqEa.find(".icon-bg.icon-bg__popular").html(`<img src="https://img1.imgtp.com/2023/09/18/tR1X1XpA.png" alt="频道">`);
            jqE.append(jqEa);
        }, 1000);
        const interval04 = setInterval(() => {
            const jqE = $(".header-channel");
            if (jqE.length === 0) {
                return;
            }
            clearInterval(interval04);
            jqE.remove();
            Qmsg.info("已移除页面下滑时，显示顶部的部分导航信息");
        }, 1000);
        if (!LocalData.getIsMainVideoList()) {
            Home.startShieldMainVideo(".container.is-version8>.feed-card").then(() => {
                Home.startShieldMainVideo(".container.is-version8>.bili-video-card");//换一换下面的视频
            }); //换一换
            return;
        }

        function ergodicList(list) { //针对频道api中的数据遍历处理并添加进去网页元素
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

        function loadingVideoZE() { //加载频道视频数据
            const tempChannelId = frequencyChannel.getChannel_id();
            const tempSortType = frequencyChannel.getSort_type();//频道推送的类型，热门还是以播放量亦或者最新
            const tempOffset = frequencyChannel.getOffset(tempChannelId, tempSortType);//视频列表偏移量
            const loading = Qmsg.loading("正在加载数据！");
            const promise = HttpUtil.get(`https://api.bilibili.com/x/web-interface/web/channel/multiple/list?channel_id=${tempChannelId}&sort_type=${tempSortType}&offset=${tempOffset}&page_size=30`);
            promise.then(res => {
                const body = res.bodyJson;//频道页一次最多加载30条数据
                if (body["code"] !== 0) {
                    alert("未获取到频道视频数据");
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
            }).finally(() => {
                loading.close();
            });
        };

        /**
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
            if (Matching.arrKey(LocalData.getArrUID(), uid)) {
                Print.video("yellow", "已通过UID屏蔽", userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`)
                return true;
            }
            const isNameKey = Matching.arrContent(LocalData.getArrNameKey(), userName);
            if (isNameKey != null) {
                Print.video(null, `已通过用户名模糊屏蔽规则【${isNameKey}】`, userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`)
                return true;
            }
            const isTitleKey = Matching.arrContent(LocalData.getArrTitle(), videoTitle);
            if (isTitleKey != null) {
                Print.video("#66CCCC", `已通过标题模糊屏蔽规则=【${isTitleKey}】`, userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`);
                return true;
            }
            const isTitleKeyCanonical = Matching.arrContentCanonical(LocalData.getArrTitleKeyCanonical(), videoTitle);
            if (isTitleKeyCanonical != null) {
                Print.video("#66CCCC", `已通过标题正则表达式屏蔽规则=${isTitleKeyCanonical}`, userName, uid, videoTitle, `https://www.bilibili.com/${bvid}`);
                return true;
            }
            const jqE = addElement.homeVideoE.getHtmlStr(videoTitle, "https://www.bilibili.com/video/" + bvid, pic, uid, userName, duration, ctimeStr, Util.getNumberFormat(view), Util.getNumberFormat(danmaku));
            $(".container.is-version8").append(jqE);

            if (Util.isEventJq(jqE, "mouseover")) {
                return false;
            }
            jqE.mouseenter((e) => {
                const element = e.delegateTarget;
                const tempInfo = element.querySelector(".bili-video-card__info--tit");
                const title = tempInfo.textContent;
                const videoAddress = tempInfo.querySelector("a").href;
                const userInfo = element.querySelector(".bili-video-card__info--owner");
                const userHref = userInfo.href;
                const v_img = element.querySelector(".v-img>img");
                const data = {
                    upName: element.querySelector(".bili-video-card__info--author").textContent,
                    uid: Util.getSubWebUrlUid(userHref),
                    title: title,
                    videoAddress: videoAddress,
                    bv: Util.getSubWebUrlBV(videoAddress),
                    frontCover: v_img === null ? null : v_img.getAttribute("src")
                };
                Util.showSDPanel(e, data);
            });
        }

        function loadingVideoE(ps) {//加载分区视频数据
            const loading = Qmsg.loading("正在加载数据！");
            const promise = HttpUtil.get(`https://api.bilibili.com/x/web-interface/dynamic/region?ps=${ps}&rid=${LocalData.getVideo_zone()}`);
            promise.then(res => {
                const bodyJson = res.bodyJson;
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
            }).finally(() => {
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
            if (!LocalData.getIsMainVideoList()) {
                Home.stypeBody();
            }
            document.getElementsByClassName("left-entry")[0].style.visibility = "hidden"//删除首页左上角的导航栏，并继续占位
            setTimeout(() => {
                $(".feed-roll-btn").remove();//移除换一换
                console.log("移除换一换");
            }, 1500);
        }, 100);
        return;
    }
    if (href.includes("space.bilibili.com/")) {//b站用户空间主页
        const hrefUID = Util.getSubUid(href.split("/")[3]);
        const userName = await Space.getUserName();
        if (Matching.arrKey(LocalData.getArrUID(), hrefUID)) {
            setTimeout(() => {
                alert("当前用户时是黑名单！UID=" + hrefUID)
            }, 2500);
            return;
        }
        const filterQueue = layout.panel.getFilter_queue();
        const getDataListBut = layout.panel.getHoverball("get(当前页)", "5%", "85%");
        const getAllDataListBut = layout.panel.getHoverball("get(全部页)", "9%", "85%");
        $body.append(getDataListBut);
        $body.append(getAllDataListBut);
        getDataListBut.attr("id", "getDataListBut");
        getAllDataListBut.attr("id", "getAllDataListBut");

        if (Space.isH_action()) {
            console.log("当前登录账号的个人空间主页");
        } else {
            console.log("非个人空间主页")
            $body.append(filterQueue);
        }

        filterQueue.click(() => {
            UrleCrud.addShow("userUIDArr", "用户uid黑名单模式(精确匹配)", hrefUID);
        });

        getDataListBut.click(async () => {
            const tabName = Space.getTabName();
            let dataList, fileName;
            switch (tabName) {
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
                    fileName = `获取用户${userName}${Space.video.getSortText()}的${Space.video.getVideoType()}${tabName}${tabTypeName}列表`;
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
                        const loading = Qmsg.loading("正在获取中！");
                        if (favtype === "collect") {//用户收藏其他用户收藏夹
                            alert("暂不支持通过网络请求方式只获取当前页收藏夹列表，如需网络请求方式，请使用【获取收藏的列表数据】功能！或者使用【页面自动化操作模式】");
                            loading.close();
                            return;
                        }
                        const data = await fav.getHttpUserCreationDataList(favID)
                        loading.close();
                        if (!data["state"]) {
                            Qmsg.error("获取失败!");
                            return;
                        }
                        dataList = data["dataList"];
                    } else {
                        Qmsg.error("输入了意外的值！" + input);
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
                    fileName = `${userName}的用户${tabName}列表.json`;
                    break;
                default:
                    alert("出现意外的参数！" + tabName);
                    return;
            }
            const info = "获取到个数：" + dataList.length;
            Qmsg.success(info);
            console.log(info);
            console.log(dataList);
            alert(info);
            Util.fileDownload(JSON.stringify(dataList, null, 3), `${fileName}[${dataList.length}个].json`);
        });

        getAllDataListBut.click(async () => {
            const tabName = Space.getTabName();
            if (Space.isFetchingFollowersOrWatchlists) {
                Qmsg.error("请等待获取完！");
                return;
            }
            Space.isFetchingFollowersOrWatchlists = true;
            const loading = Qmsg.loading(`正在获取 ${userName} 的${tabName}列表数据中，请不要轻易动当前页面内容`);
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
                            Qmsg.error("获取失败!");
                            loading.close();
                            return;
                        }
                        dataList = data["dataList"];
                    } else {
                        Qmsg.error("出现意外的值！" + input);
                        loading.close();
                        return;
                    }
                    break;
                case "订阅":
                    const tempTabsName = Space.subscribe.getTabsName();
                    if (tempTabsName === "标签") {
                        Space.isFetchingFollowersOrWatchlists = false;
                        loading.close();
                        Qmsg.error("意外的结果!");
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
            Qmsg.success(info);
            console.log(info);
            console.log(dataList);
            Util.fileDownload(JSON.stringify(dataList, null, 3), `${fileName}[${dataList.length}个].json`);
            Space.isFetchingFollowersOrWatchlists = false;
        });

        return;
    }

    if (href.includes("www.bilibili.com/v/topic/detail/?topic_id=")) {//话题
        SubjectOfATalk.deltopIC();
        return;
    }
    if (href.includes("www.bilibili.com/video") || href.includes("www.bilibili.com/list/watchlater")) {//视频页
        $body.append(layout.htmlVue.videoPlayVue());
        const videoPlayVue = VideoPlayVue.returnVue();


        if (LocalData.video.isHideVideoRightLayout()) {
            const interval = setInterval(() => {
                const jqE = $(".right-container.is-in-large-ab,.playlist-container--right");
                if (jqE.length === 0) return;
                if (!LocalData.video.isHideVideoRightLayout() || videoPlayVue().hideRightLayoutButText === "隐藏右侧布局") {
                    clearInterval(interval)
                    return;
                }
                jqE.hide();
            }, 1600);
        }
        if (LocalData.video.isHideVideoButtonCommentSections()) {
            const interval = setInterval(() => {
                const jqE = $("#comment,.playlist-comment");
                if (jqE.length === 0) return;
                if (!LocalData.video.isHideVideoButtonCommentSections() || videoPlayVue().hideButtonLayoutButText === "隐藏评论区") {
                    clearInterval(interval)
                    return;
                }
                jqE.hide();
            }, 1600);
        }

        if (LocalData.video.isHideVideoTopTitleInfoLayout()) {
            const interval = setInterval(() => {
                const jqE = $("#viewbox_report,.video-info-container");
                if (jqE.length === 0) return;
                clearInterval(interval);
                jqE.hide();
            }, 1500);
        }
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
    if (href.includes("//live.bilibili.com/") && windowsTitle.includes("哔哩哔哩直播，二次元弹幕直播平台")) {//直播间房间-该判断要低于上面的直播首页判断
        console.log("当前界面疑似是直播间");
        $("#getLiveHighEnergyListBut").css("display", "inline");//显示获取高能用户列表按钮
        $("#getLiveDisplayableBarrageListBut").css("display", "inline");//显示获取当前可显示的弹幕列表
        Live.liveDel.topElement();
        Live.liveDel.hreadElement();
        Live.liveDel.bottomElement();
        Live.liveDel.delGiftBar();
        Live.liveDel.delRightChatLayout();
        Live.liveDel.delOtherE();
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


    if (href.includes("t.bilibili.com") && windowsTitle === "动态首页-哔哩哔哩") {
        console.log("动态页面");
        const interval01 = setInterval(() => {
            const login = $(".bili-dyn-login-register");
            if (login.length === 0) {
                return;
            }
            clearInterval(interval01);
            login.remove();
            console.log("已移除动态页面中的提示登录");
        }, 1000);
        const interval02 = setInterval(() => {
            const jqE = $(".bili-rich-textarea");
            if (jqE.length === 0) {
                return;
            }
            clearInterval(interval02);
            jqE.css("max-height", "");
            Qmsg.success("已解锁发动态编辑框的最大可视内容！");
        }, 1000);
        //.bili-dyn-ads
        Trends.topCssDisply.body();
        Trends.topCssDisply.topTar();
        Trends.topCssDisply.rightLayout();

        function tempLoadIng() {
            const interval01 = setInterval(() => {
                const tempList = document.querySelectorAll(".bili-dyn-list__items>.bili-dyn-list__item");
                if (tempList.length === 0) {
                    return;
                }
                clearInterval(interval01);
                Trends.shrieDynamicItems(tempList);
                if (!Trends.data.getTrendsItemsTwoColumnCheackbox()) {
                    return;
                }
                Trends.layoutCss.items();
            }, 1000);
            const tempE01 = $(".bili-dyn-list__items");
            if (Util.isEventJq(tempE01, "DOMNodeInserted")) {
                return;
            }
            tempE01.bind("DOMNodeInserted", () => {
                Trends.shrieDynamicItems(tempE01.children());
            });
        }

        tempLoadIng();
        const interval03 = setInterval(() => {
            const tempE = $(".bili-dyn-up-list__content");
            if (tempE.length === 0) {
                return;
            }
            const list = tempE.children();
            if (list === null || list.length === 0) {
                return;
            }
            clearInterval(interval03);
            Trends.layoutCss.tabUserItems(tempE);
            $(".bili-dyn-up-list__shadow-right").remove();
            list.click(() => {
                tempLoadIng();
            });
        }, 1000);
    }
    if (href.includes("search.bilibili.com")) {
        const getDataListBut = layout.panel.getHoverball("get(当前页)", "15%", "94%");
        const getAllDataListBut = layout.panel.getHoverball("get(全部页)", "20%", "94%");

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
            Qmsg.success(`获取当前页的${tabsItem}列表成功！`);
            Util.fileDownload(JSON.stringify(dataList, null, 3), fileName);
        });

        getAllDataListBut.click(async () => {
            if (Search.isGetLoadIngData) {
                Qmsg.error("请等待，获取完成！");
                return;
            }
            Search.isGetLoadIngData = true;
            const tabsItem = Search.getTabsItem();
            const keyword = Search.getKeyword();
            const loading = Qmsg.loading(`正在获取关键词【${keyword}】的相关${tabsItem}数据，请耐心等待！`);
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
            Qmsg.success(`获取${tabsItem}的关键词${keyword}的数据成功!个数为：${dataList.length}个`);
            Util.fileDownload(JSON.stringify(dataList, null, 3), fileName);
        });

        $("#biliMainFooter").remove();
        console.log("已清空底部信息");
        $(".side-buttons.flex_col_end.p_absolute").remove();
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
    if (href.includes("www.bilibili.com/v")) {//首页分区页,该判断要低于频道等其他页面，主要是因为地址有相似的地方
        let size = -1;
        setInterval(() => {
            const tempSize = document.querySelectorAll(".bili-video-card");
            if (tempSize.length === size) {
                return;
            }
            size = tempSize.length;
            Home.startShieldMainVideo(".bili-video-card");
        }, 1000);
        return;
    }
    if ((href.includes("www.bilibili.com") && windowsTitle === "哔哩哔哩 (゜-゜)つロ 干杯~-bilibili") || (href.includes("t.bilibili.com") & windowsTitle === "动态首页-哔哩哔哩")) {
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
        return;
    }
    if (href.includes("www.bilibili.com/account/history") && windowsTitle === "历史记录") {
        const getPageShowHistoryBut = layout.panel.getHoverball("获取页面可见的历史记录", "18%", "5%");
        const getAllPageHistoryBut = layout.panel.getHoverball("获取页面全部的历史记录", "28%", "5%");
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
            if (!confirm("温馨提示，此功能会持续模拟滚动到页面的底部使其加载更多的历史记录内容，直到到b站历史记录保留的最早的记录内容，可能会比较耗时，请耐心等待！是否继续？")) {
                return;
            }
            History.isGetLoadIngData = true;
            const loading = Qmsg.loading("温馨提示，此功能会持续模拟滚动到页面的底部使其加载更多的历史记录内容，直到到b站历史记录保留的最早的记录内容，可能会比较耗时，请耐心等待！");
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
function github(href) {
    setInterval(() => {//github站内所有的链接都从新的标签页打开，而不从当前页面打开
        $("a").attr("target", "_blank");
    }, 1000);
}
const GBTGame = {
    data: {
        tempArrList: {}
    },
    init() {//初始化页面资源信息，用于获取资源操作
        if (!Util.getWindowUrl().includes("http://gbtgame.ysepan.com")) {
            alert("当前网站不是GBT乐赏游戏空间");
            return;
        }
        const loading = Qmsg.loading("正在获取中，请不要对当前网页进行其他操作！");
        const arrList = document.querySelectorAll("#menuList>*");
        let chickTempIndex = 0;
        this.data.tempArrList = {};
        const interval = setInterval(() => {
            if (arrList.length <= chickTempIndex) {
                loading.close();
                clearInterval(interval);
                alert("已点击完成！现在可以对资源进行获取和查找从操作了。ps：每次访问当前页面都需要初始化！");
                return;
            }
            const tempE = arrList[chickTempIndex++];
            const a = tempE.querySelector("a");
            const filesTime = a.text;
            a.click();
            const info = `已点击${filesTime}`;
            Qmsg.success(info);
            const p = new Promise((resolve) => {
                const interval01 = setInterval(() => {
                    let menuItem = tempE.querySelectorAll(".menu>*:not(.lxts)");
                    if (menuItem.length <= 1) {
                        return;
                    }
                    clearInterval(interval01);
                    resolve(menuItem);
                }, 15);
            });
            p.then((data) => {
                data.forEach((value) => {
                    const tempE = value.querySelector("a");
                    const title = tempE.text;
                    this.data.tempArrList[title] = tempE.getAttribute("href");
                });
            });
        }, 1000);

    },
    find(key) {
        const tempArrList = this.data.tempArrList;
        const keys = Object.keys(tempArrList);
        if (keys.length === 0) {
            const info = "请先获取页面所有游戏资源先！";
            Qmsg.error(info);
            throw Error(info);
        }
        const newArray = {};
        keys.forEach(value => {
            if (!value.includes(key)) {
                return;
            }
            newArray[value] = tempArrList[value];
        });
        return newArray;
    },
    getData() {
        const tempArrList = this.data.tempArrList;
        const keys = Object.keys(tempArrList);
        if (keys.length === 0) {
            const info = "请先获取页面所有游戏资源先！";
            alert(info);
            Qmsg.error(info);
            return;
        }
        const info = `已获取到${keys.length}个资源，并将其打印在控制台和输出面板上！`;
        alert(info);
        Print.ln(info);
        Qmsg.success(info);
        Util.fileDownload(JSON.stringify(tempArrList, null, 3), `GBT乐赏游戏空间游戏磁力地址${keys.length}个资源(${Util.toTimeString()}).json`);
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
