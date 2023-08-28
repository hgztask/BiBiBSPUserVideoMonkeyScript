/**
 * 工具类
 */
const Util = {
    //设置数据
    setData(key, content) {
        GM_setValue(key, content);
    },
    //读取数据
    getData(key) {
        return GM_getValue(key);
    },
    //删除数据
    delData(key) {
        GM_deleteValue(key);
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
    //设置元素可自由拖动拖动
    suspensionBall(dragId, func) {
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
    //获取格式化规则的内容
    getRuleFormatStr() {
        //温馨提示每个{}对象最后一个不可以有,符号
        return Util.strTrimAll(`{"用户名黑名单模式(精确匹配)": ${JSON.stringify(LocalData.getArrName())},"用户名黑名单模式(模糊匹配)": ${JSON.stringify(LocalData.getArrNameKey())},
    "用户uid黑名单模式(精确匹配)": ${JSON.stringify(LocalData.getArrUID())},"用户uid白名单模式(精确匹配)": ${JSON.stringify(LocalData.getArrWhiteUID())},
    "标题黑名单模式(模糊匹配)": ${JSON.stringify(LocalData.getArrTitle())},"标题黑名单模式(正则匹配)": ${JSON.stringify(LocalData.getArrTitleKeyCanonical())},
    "评论关键词黑名单模式(模糊匹配)": ${JSON.stringify(LocalData.getCommentOnKeyArr())},"评论关键词黑名单模式(正则匹配)": ${JSON.stringify(LocalData.getArrContentOnKeyCanonicalArr())},
    "粉丝牌黑名单模式(精确匹配)": ${JSON.stringify(LocalData.getFanCardArr())},"专栏关键词内容黑名单模式(模糊匹配)": ${JSON.stringify(LocalData.getContentColumnKeyArr())},
    "动态关键词内容黑名单模式(模糊匹配)": ${JSON.stringify(LocalData.getDynamicArr())},"动态关键词内容黑名单模式(正则匹配)":${JSON.stringify(LocalData.getDynamicCanonicalArr())}}`);
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
        suspensionDivVue.xy.x = x;
        suspensionDivVue.xy.y = y;
        if (!($("#quickLevitationShield").is(':checked'))) {
            return;
        }
        const suspensionDiv = $("#suspensionDiv");
        suspensionDiv.css("left", x + "px");
        suspensionDiv.css("top", y + "px");
    },
    dShielPanel() {

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
        const newVar = Util.getData("isDShielPanel");
        if (newVar) {
            return;
        }
        if ($("#fixedPanelValueCheckbox").is(':checked')) {
            return;
        }
        suspensionDivVue.upName = name;
        suspensionDivVue.uid = uid;
        suspensionDivVue.videoData.title = title;
        suspensionDivVue.videoData.bv = bv;
        suspensionDivVue.videoData.av = av;
        if (title !== undefined) {
            $("#vueSuspensinVideoInfo").show();
            if (bv === undefined) {
                return;
            }
            suspensionDivVue.videoData.av = Util.BilibiliEncoder.dec(bv);
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
    }
}