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
                setBili_jctBut() {
                    const content = prompt("设置bili_jct值为：");
                    if (content === null) {
                        return;
                    }
                    if (content === "" | content.includes(" ")) {
                        Tip.error("内容有误，请正确书写！");
                        return;
                    }
                    LocalData.setBili_jct(content);
                    Tip.success(`已设置bili_jct的值为\n${content}`);
                },
                setLogInBili_jctBut() {
                    const data = LocalData.getWebBili_jct();
                    if (data === null) {
                        Tip.error(`获取不到存储在网页中的bili_jct值:`);
                        return;
                    }
                    if (!confirm("确定要将存储在网页中的bili_jct值并设置存储在油猴脚本bili_jct值吗？")) {
                        return;
                    }
                    LocalData.setBili_jct(data);
                    Tip.success(`已读取存储在网页中的bili_jct值并设置存储在脚本bili_jct的值为\n${data}`);
                },
                getLogInBili_jctBut() {
                    const data = LocalData.getWebBili_jct();
                    if (data === null) {
                        Tip.error(`获取不到存储在网页中的bili_jct值:`);
                        return;
                    }
                    Tip.success("已获取到存储在网页中的bili_jct值，已输出到面板上");
                    Tip.printLn(data);
                },
                getBili_jctBut() {
                    const biliJct = LocalData.getBili_jct();
                    if (biliJct === null) {
                        Tip.error(`用户未设置bili_jct值`);
                        return;
                    }
                    Tip.success("获取成功！，已将bili_jct值输出到面板上");
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
                        Tip.printLn(info);
                        Tip.info(info);
                        alert(info);
                        return;
                    }
                    const info = `已找到了${filter.length}个资源，并输出到控制台上，且用户接下来可以将其保存在电脑上！`;
                    alert(info);
                    const findJsonListStr = JSON.stringify(findList, null, 3);
                    console.log(findList);
                    console.log(findJsonListStr);
                    Tip.success(info);
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
                        Tip.error("请正确填写请求地址！");
                        return;
                    }
                    const requestType = this.requestTypeSelect;
                    const promise = HttpUtil.getCookie(requestUrl, cookie);
                    const loading = Tip.loading(`正在使用${requestType}请求 请求地址${requestUrl}中！`);
                    promise.then(data => {
                        Tip.success("请求成功！");
                        this.responseResult = data.body;
                        console.log(data);
                    }).catch(reason => {
                        Tip.error("相应失败！");
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