const Watchlater = {
    initLayout: function () {
        const panel = layout.panel.getHoverball("获取稍后再看列表数据", "34%", "5%", "52px", "95px", "10%");
        $("body").append(panel);
        panel.click(() => {
            if (!confirm("仅获取页面可见的列表了内容并导出为json，是要继续吗？")) {
                return;
            }
            $('html, body').animate({scrollTop: $(document).height()}, 'slow');
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
    },
    getDataList: function () {
        const eList = document.querySelectorAll(".list-box>span>*");
        const dataList = [];
        eList.forEach(v => {
            const data = {};
            const videoInfo = v.querySelector(".av-about");
            data["title"] = videoInfo.querySelector(".t").textContent.trim();
            const userInfo = videoInfo.querySelector(".info.clearfix>.user");
            data["name"] = userInfo.querySelector("span").textContent;
            const userAddress = userInfo.getAttribute("href");
            data["uid"] = Util.getSubWebUrlUid(userAddress);
            data["userAddress"] = userAddress;
            data["videoAddress"] = videoInfo.querySelector(".t").getAttribute("href");
            data["userImg"] = userInfo.querySelector(".lazy-img>img").getAttribute("src");
            dataList.push(data);
        });
        return dataList;
    }
}