const GBTGame = {
    data: {
        tempArrList: {}
    },
    init: function () {//初始化页面资源信息，用于获取资源操作
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
                alert("已点击完成！");
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
    find: function (key) {
        const tempArrList = this.data.tempArrList;
        const keys = Object.keys(tempArrList);
        if (keys.length === 0) {
            const info = "请先获取页面所有游戏资源先！";
            Qmsg.error(info);
            alert(info);
            return;
        }
        const newArray = {};
        keys.forEach(value => {
            if (!value.includes(key)) {
                return;
            }
            newArray[value] = tempArrList[value];
        });
        const filter = Object.keys(newArray);
        if (filter.length === 0) {
            const info = "并未搜索到您想要的资源，key=" + key;
            Print.ln(info);
            Qmsg.info(info);
            alert(info);
            return;
        }
        const info = `已找到了${filter.length}个资源，并输出到控制台上！`;
        alert(info);
        Print.ln(info);
        Qmsg.success(info);
        console.log(info);
        console.log(newArray);
        console.log(JSON.stringify(newArray));
    },
    getData: function () {
        const tempArrList = this.data.tempArrList;
        const keys = Object.keys(tempArrList);
        if (keys.length === 0) {
            const info = "请先获取页面所有游戏资源先！";
            alert(info);
            Qmsg.error(info);
            return;
        }
        const info = `已获取到${keys.length}个资源，并将其打印在控制台和输出面板上！`;
        const strJson = JSON.stringify(tempArrList);
        Print.ln(info);
        Print.ln(strJson);
        console.log(info);
        console.log(tempArrList);
        console.log(strJson);
    }
}
