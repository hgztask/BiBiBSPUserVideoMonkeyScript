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