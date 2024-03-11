//{"weight":2}
//动态
const Trends = {

    getVideoCommentAreaOrTrendsLandlord(v) {//获取动态页面-评论区信息-单个元素信息-楼主
        return new ContentCLass().setUpName(v.querySelector(".user-name").textContent).setUid(v.querySelector(".user-name").getAttribute("data-user-id"))
            .setContent(v.querySelector(".reply-content").parentNode.textContent);
    },
    getVideoCommentAreaOrTrendsStorey(j) {//获取动态页面-评论区信息-单个元素信息-楼层
        return new ContentCLass()
            .setUpName(j.querySelector(".sub-user-name").textContent)
            .setUid(j.querySelector(".sub-user-name").getAttribute("data-user-id"))
            .setContent(j.querySelector(".reply-content").textContent)
    },
    shrieDynamicItems(list) {//屏蔽动态页动态项目
        for (let v of list) {
            let tempE = v.querySelector(".bili-rich-text");
            if (tempE === null || tempE.length === 0) {//没有说明是其他的类型动态，如投稿了视频且没有评论显示
                continue;
            }
            const tempContent = tempE.textContent;
            const contentKey = Matching.arrContent(LocalData.getDynamicArr(), tempContent);
            if (contentKey !== null) {
                const tempInfo = `已通过动态关键词【${contentKey}】屏蔽了动态【${tempContent}】`;
                v.remove();
                Tip.success(`已通过动态关键词屏蔽相关动态，详情屏蔽内容可看面板输出信息`);
                Tip.printLn(tempInfo);
                continue;
            }
            const arrContentCanonical = Matching.arrContentCanonical(LocalData.getDynamicCanonicalArr(), tempContent);
            if (arrContentCanonical != null) {
                const tempInfo = `已通过动态正则关键词【${arrContentCanonical}】屏蔽了动态【${tempContent}】`;
                v.remove();
                Tip.success(`已通过动态正则关键词屏蔽相关动态，详情屏蔽内容可看面板输出信息`);
                Tip.printLn(tempInfo);
                Rule.trendsData
            }
        }
    },
    getGrid9Imge() {
        const imgeUrlList = [];
        document.querySelectorAll(".bili-album__preview.grid9>*").forEach(v => {
            const src = v.querySelector("img").src;
            imgeUrlList.push(src.split("@")[0]);
        });
        return imgeUrlList;
    },
    tempLoadIng() {
        const interval01 = setInterval(() => {
            const tempList = document.querySelectorAll(".bili-dyn-list__items>.bili-dyn-list__item");
            if (tempList.length === 0) return;
            clearInterval(interval01);
            Trends.shrieDynamicItems(tempList);
        }, 1000);
        try {
            const tempE01 = $(".bili-dyn-list__items");
            if (Util.isEventJq(tempE01, "DOMNodeInserted")) return;
            tempE01.bind("DOMNodeInserted", () => {
                Trends.shrieDynamicItems(tempE01.children());
            });
        } catch (e) {
            console.error("出现错误！", e);
        }
    }
};
