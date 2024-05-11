//{"weight":1}
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

