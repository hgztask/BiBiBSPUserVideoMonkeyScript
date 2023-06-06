function github(href) {
    setInterval(() => {//github站内所有的链接都从新的标签页打开，而不从当前页面打开
        $("a").attr("target", "_blank");
    }, 1000);
}