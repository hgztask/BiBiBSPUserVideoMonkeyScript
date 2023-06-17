function bilibili(href) {
    if (href.includes("www.bilibili.com/v/popular")) {//热门
        greatDemand.delVideo();
        try {
            document.getElementsByClassName("international-footer")[0].remove();
        } catch (e) {
            console.log("屏蔽热门底部元素出错！" + e);
        }
        return;
    }
    if (href.includes("www.bilibili.com/v/")) {//通过URL变动执行屏蔽首页分区视频
        Home.startShieldMainVideo(".bili-video-card");
        Home.homePrefecture();
        return;
    }
    if (href.includes("space.bilibili.com/[0-9]+/dynamic") !== -1) {
        const interval01 = setInterval(() => {
            const tempE = $(".bili-dyn-list__items");
            if (tempE.length === 0) {
                return;
            }
            const list = tempE.children();
            if (list.length === 0) {
                return;
            }
            clearInterval(interval01);
            Trends.shrieDynamicItems(list);
            if (Util.isEventJq(tempE, "DOMNodeInserted")) {
                clearInterval(interval01);
                return;
            }
            tempE.bind("DOMNodeInserted", () => {
                Trends.shrieDynamicItems($(".bili-dyn-list__items").children());
            });
        }, 1000);
    }
}