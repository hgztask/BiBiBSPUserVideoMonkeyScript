const GBTGame = {
    data: {
        tempArrList: {}
    },
    init() {//初始化页面资源信息，用于获取资源操作
        if (!Util.getWindowUrl().includes("http://gbtgame.ysepan.com")) {
            alert("当前网站不是GBT乐赏游戏空间");
            return;
        }
        const loading = Tip.loading("正在获取中，请不要对当前网页进行其他操作！");
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
            Tip.success(info);
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
            Tip.error(info);
            throw Error(info);
        }
        const newArray = {};
        keys.forEach(value => {
            if (!value.includes(key)) return;
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
            Tip.error(info);
            return;
        }
        const info = `已获取到${keys.length}个资源，并将其打印在控制台和输出面板上！`;
        alert(info);
        Tip.printLn(info);
        Tip.success(info);
        Util.fileDownload(JSON.stringify(tempArrList, null, 3), `GBT乐赏游戏空间游戏磁力地址${keys.length}个资源(${Util.toTimeString()}).json`);
    }
}
