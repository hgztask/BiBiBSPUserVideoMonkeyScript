//对Qmsg工具进行二次封装

const Tip = {
    success(text, config) {//成功
        Qmsg.success(text, config);
    },
    videoBlock(text) {//屏蔽了视频的提示
        this.success(text, {position: "bottomright"});
    },
    info(text, config) {//信息
        Qmsg.info(text, config);
    },
    error(text, config) {//错误
        Qmsg.error(text, config);
    },
    warning(text, config) {//警告
        Qmsg.warning(text, config);
    },
    config(cfg) {//设置全局Tip配置
        Qmsg.config(cfg);
    },
    loading(text, config) {//加载进度条
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

