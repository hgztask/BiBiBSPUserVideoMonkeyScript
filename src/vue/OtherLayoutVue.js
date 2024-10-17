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
