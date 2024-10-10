//{"weight":4}
/**
 *
 * 首次加载时只会加载一次
 * @param {string}href
 * @param {string}windowsTitle
 */
async function bilibiliOne(href, windowsTitle) {
    const $body = $("body");
    const interval01 = setInterval(() => {
        const nav_search_input = $(".nav-search-input,.search-input-el");
        if (nav_search_input.length === 0) return;
        clearInterval(interval01);
        const arrContent = Matching.arrContent(LocalData.getArrTitle(), nav_search_input.attr("placeholder"));
        if (arrContent !== null) {
            const title = nav_search_input.attr("title");
            nav_search_input.attr("placeholder", "");
            nav_search_input.attr("title", "");
            Tip.info(`已通过标题关键词 ${arrContent} 过滤顶部搜索框显示的内容=${title}`);
        }
        const i2 = setInterval(() => {
            const element = document.querySelectorAll(".history-text");
            if (element.length === 0) return;
            clearInterval(i2);
            $(element).css("white-space", "break-spaces");
            const msg = "已调整搜索结果中历史记录样式";
            console.log(msg);
            Tip.successBottomRight(msg);
        }, 100);
        nav_search_input.click(() => {
            console.log("点击了顶部搜索框");
            const i1 = setInterval(() => {
                const list = document.querySelectorAll(".trendings-double .trending-item");
                if (list.length === 0) return;
                clearInterval(i1);
                list.forEach((value, key, parent) => {
                    const content = value.querySelector(".trending-text").textContent;
                    const titleKey = Remove.titleKey(value, content);
                    if (titleKey !== null) {
                        Tip.infoBottomRight("规则屏蔽了相关热搜");
                        Tip.printLn(`已通过标题关键词【${titleKey}】屏蔽热搜榜项目内容【${content}】`);
                        return;
                    }
                    const titleKeyCanonical = Remove.titleKeyCanonical(value, content);
                    if (titleKeyCanonical !== null) {
                        Tip.infoBottomRight("规则屏蔽了相关热搜");
                        Tip.printLn(`已通过标题正则关键词【${titleKeyCanonical}】屏蔽热搜榜项目内容【${content}】`);
                        return;
                    }
                    const contentKey = Remove.contentKey(value, content);
                    if (contentKey !== null) {
                        Tip.infoBottomRight("规则屏蔽了相关热搜");
                        Tip.printLn(`已通过标内容关键词【${contentKey}】屏蔽热搜榜项目内容【${content}】`);
                    }
                });
                // nav_search_input.unbind();//删除该元素的所有jq添加的事件
            }, 50);

        });
    }, 1000);
    if (href === "https://www.bilibili.com/" || href.includes("www.bilibili.com/?spm_id_from") || href.includes("www.bilibili.com/index.html")) {//首页
        console.log("进入了首页");
        const i2 = setInterval(() => {
            const jqE = $(".header-channel");
            if (jqE.length === 0) return;
            clearInterval(i2);
            jqE.remove();
            Tip.infoBottomRight("已移除页面下滑时，显示顶部的部分导航信息");
        }, 1000);
        const i3 = setInterval(() => {
            const el = document.querySelector(".desktop-download-tip");
            if (el === null) return;
            clearInterval(i3);
            el.remove();
            const msg = "已移除下载提示";
            console.log(msg);
            Tip.successBottomRight(msg);
        }, 500);
        return;
    }
    if (href.includes("space.bilibili.com/")) {//b站用户空间主页
        SpaceControlPanelVue.addlLayoutHtml();
        SpaceControlPanelVue.returnVue();
        return;
    }
    if (href.includes("www.bilibili.com/v/topic/detail/?topic_id=")) {//话题
        SubjectOfATalk.deltopIC();
        return;
    }
    if (href.includes("www.bilibili.com/video") || href.includes("www.bilibili.com/list/watchlater")) {//视频页
        VideoPlayVue.addHtml();
        VideoPlayVue.returnVue();
        return;
    }
    if ((href.includes("https://live.bilibili.com/?spm_id_from") || href === "https://live.bilibili.com/") && windowsTitle === "哔哩哔哩直播，二次元弹幕直播平台") {//直播首页
        console.log("进入直播首页了");
        const interval01 = setInterval(() => {
            const videoElement = document.getElementsByTagName("video")[0];
            if (videoElement) {
                videoElement.pause();//暂停视频
                //删除直播首页顶部无用直播间（包括占用大屏幕的，还其右侧的直播间列表）
                const bigPlayerClass = document.getElementsByClassName("player-area-ctnr border-box p-relative t-center")[0];
                if (bigPlayerClass) {
                    bigPlayerClass.remove();
                    clearInterval(interval01);
                }
            }
            const interval02 = setInterval(() => {
                const classNameElement = document.getElementsByClassName("link-footer-ctnr")[0];
                if (classNameElement) {
                    classNameElement.remove();
                    Tip.printLn("已移除页脚信息")
                    clearInterval(interval02);
                }
            }, 2000);
        }, 800);
        return;
    }
    if (href.includes("t.bilibili.com") && windowsTitle === "动态首页-哔哩哔哩") {
        console.log("动态页面");
        const interval01 = setInterval(() => {
            const login = $(".bili-dyn-login-register");
            if (login.length === 0) return;
            clearInterval(interval01);
            login.remove();
            console.log("已移除动态页面中的提示登录");
        }, 1000);
        Trends.tempLoadIng();
        const interval03 = setInterval(() => {
            const tab = document.querySelector(".bili-dyn-up-list__content");
            if (tab === null) return;
            clearInterval(interval03);
            document.querySelector(".bili-dyn-up-list__shadow-right")?.remove();
            $(tab).children(".bili-dyn-up-list__item").click(() => {
                Trends.tempLoadIng();
            });
        }, 1000);
    }
    if (href.includes("search.bilibili.com")) {
        const getDataListBut = layout.panel.getHoverBallBut("get(当前页)", "15%", "94%");
        const getAllDataListBut = layout.panel.getHoverBallBut("get(全部页)", "20%", "94%");
        $body.append(getDataListBut);
        $body.append(getAllDataListBut);
        getDataListBut.attr("id", "getDataListBut");
        getAllDataListBut.attr("id", "getAllDataListBut");
        getDataListBut.click(() => {
            let dataList, fileName;
            const tabsItem = Search.getTabsItem();
            const keyword = Search.getKeyword();
            switch (tabsItem) {
                case "综合":
                case "视频":
                    dataList = Search.video.getVideoDataList();
                    fileName = `(搜索关键词【${keyword}】的${Search.video.getTabTheSelectedSort()}视频列表${dataList.length})个.json`;
                    break;
                case "番剧":
                case "影视":
                    dataList = Search.bangumi.getDataList();
                    fileName = `(搜索关键词【${keyword}】的${tabsItem}列表${dataList.length})个.json`;
                    break;
                case "专栏":
                    dataList = Search.article.getDataList();
                    fileName = `(搜索关键词【${keyword}】的${Search.article.getTabTheSelectedSort()}专栏列表${dataList.length})个.json`;
                    break;
                case "用户":
                    dataList = Search.upuser.getUserInfoList();
                    fileName = `搜索关键词【${keyword}】的${Search.upuser.getTabTheSelectedSort()}的用户列表(${dataList.length}个).json`;
                    break;
                case "直播":
                    const liveTabs = Search.live.getTabsItem();
                    switch (liveTabs) {
                        case "直播间":
                            dataList = Search.live.getLiveDataList();
                            fileName = `(搜索关键词【${keyword}】的${Search.live.getLiveRoomSort()}${liveTabs}列表${dataList.length})个.json`;
                            break;
                        case "主播":
                            dataList = Search.live.liveUsers.getDataList();
                            fileName = `(搜索关键词【${keyword}】的${liveTabs}列表${dataList.length})个.json`;
                            break;
                        default:
                            alert("直播获取时出现意外的选项！");
                            return;
                    }
                    break;
                default:
                    alert(`搜索${keyword}时出现了意外的分支结果！`);
                    return;
            }
            if (dataList.length === 0) {
                alert(`未获取到关键词【${keyword}】相关${tabsItem}列表数据！`);
                return;
            }
            Tip.success(`获取当前页的${tabsItem}列表成功！`);
            Util.fileDownload(JSON.stringify(dataList, null, 3), fileName);
        });
        getAllDataListBut.click(async () => {
            if (Search.isGetLoadIngData) {
                Tip.error("请等待，获取完成！");
                return;
            }
            Search.isGetLoadIngData = true;
            const tabsItem = Search.getTabsItem();
            const keyword = Search.getKeyword();
            const loading = Tip.loading(`正在获取关键词【${keyword}】的相关${tabsItem}数据，请耐心等待！`);
            let dataList, fileName;
            switch (tabsItem) {
                case "综合":
                case "视频":
                    dataList = await Search.video.getAllVideoDataList();
                    fileName = `(搜索关键词【${keyword}】的${Search.video.getTabTheSelectedSort()}视频列表${dataList.length})个.json`;
                    break;
                case "番剧":
                    dataList = await Search.bangumi.getAllDataList();
                    fileName = `(搜索关键词【${keyword}】的番剧列表${dataList.length})个.json`;
                    break;
                case "直播":
                    const liveTabs = Search.live.getTabsItem();
                    switch (liveTabs) {
                        case "直播间":
                            dataList = await Search.live.getLiveAllDataList();
                            fileName = `(搜索关键词【${keyword}】的${Search.live.getLiveRoomSort()}${liveTabs}列表${dataList.length})个.json`;
                            break;
                        case "主播":
                            dataList = await Search.live.liveUsers.getAllDataList();
                            fileName = `(搜索关键词【${keyword}】的${liveTabs}列表${dataList.length})个.json`;
                            break;
                        default:
                            alert("直播获取时出现意外的选项！");
                            return;
                    }
                    break;
                case "专栏":
                    dataList = await Search.article.getAllDataList();
                    fileName = `(搜索关键词【${keyword}】的${Search.article.getTabTheSelectedSort()}专栏列表${dataList.length})个.json`;
                    break;
                case "用户":
                    dataList = await Search.upuser.getUserInfoAllList();
                    fileName = `搜索关键词【${keyword}】的${Search.upuser.getTabTheSelectedSort()}用户列表(${dataList.length}个).json`;
                    break;
                default:
                    alert(`搜索${keyword}时出现了意外的分支结果！`);
                    return;
            }
            loading.close();
            Search.isGetLoadIngData = false;
            if (dataList.length === 0) {
                alert(`未获取到相关${tabsItem}列表数据！`);
                return;
            }
            Tip.success(`获取${tabsItem}的关键词${keyword}的数据成功!个数为：${dataList.length}个`);
            Util.fileDownload(JSON.stringify(dataList, null, 3), fileName);
        });
        $("#biliMainFooter").remove();
        console.log("已清空底部信息");
        $(".side-buttons.flex_col_end.p_absolute").remove();
        console.log("已移除bilibili右侧悬浮按钮");
        return;
    }
    if (href.includes("www.bilibili.com/v")) {//首页分区页,该判断要低于频道等其他页面，主要是因为地址有相似的地方
        let size = -1;
        setInterval(() => {
            const tempSize = document.querySelectorAll(".bili-video-card");
            if (tempSize.length === size) return;
            size = tempSize.length;
            Home.startShieldMainVideo(".bili-video-card");
        }, 1000);
        return;
    }
    if ((href.includes("www.bilibili.com") && windowsTitle === "哔哩哔哩 (゜-゜)つロ 干杯~-bilibili") || (href.includes("t.bilibili.com") & windowsTitle === "动态首页-哔哩哔哩")) {
        const interval01 = setInterval(() => {
            const login = $(".lt-col>.login-tip:contains('立即登录')");
            if (login.length === 0) return;
            clearInterval(interval01);
            login.remove();
            console.log("已移除页面右下角的提示登录");
        }, 1000);
        const interval02 = setInterval(() => {
            const login = $(".login-panel-popover");
            if (login.length === 0) return;
            clearInterval(interval02);
            login.remove();
            console.log("已移除页面的提示登录信息");
        }, 1000);
        return;
    }
    if (href.includes("www.bilibili.com/account/history") && windowsTitle === "历史记录") {
        const getPageShowHistoryBut = layout.panel.getHoverBallBut("获取页面可见的历史记录", "18%", "5%");
        const getAllPageHistoryBut = layout.panel.getHoverBallBut("获取页面全部的历史记录", "28%", "5%");
        $body.append(getPageShowHistoryBut);
        $body.append(getAllPageHistoryBut);
        History.delLayout.footer();
        getPageShowHistoryBut.click(() => {
            if (History.isGetLoadIngData) {
                alert("请等待获取完成！");
                return;
            }
            alert("如果您要获取所有全部可见的历史记录内容，可以一直滚动到底部，直到显示全部可见的历史记录内容，再获取");
            History.isGetLoadIngData = true;
            const dataHistory = History.getDataHistory();
            History.isGetLoadIngData = false;
            if (dataHistory.length === 0) {
                alert("未获取到相关历史记录！");
                return;
            }
            alert("已获取完成！接下来可以将获取到的数据保存到电脑上任意一个位置");
            Util.fileDownload(JSON.stringify(dataHistory, null, 3), `b站用户的历史记录${Util.toTimeString()}(${dataHistory.length}个).json`);
        });
        getAllPageHistoryBut.click(() => {
            if (History.isGetLoadIngData) {
                alert("请等待获取完成！");
                return;
            }
            if (!confirm("温馨提示，此功能会持续模拟滚动到页面的底部使其加载更多的历史记录内容，直到到b站历史记录保留的最早的记录内容，可能会比较耗时，请耐心等待！是否继续？")) return;
            History.isGetLoadIngData = true;
            const loading = Tip.loading("温馨提示，此功能会持续模拟滚动到页面的底部使其加载更多的历史记录内容，直到到b站历史记录保留的最早的记录内容，可能会比较耗时，请耐心等待！");
            History.getAllDataHistory().then(() => {
                loading.close();
                const dataHistory = History.getDataHistory();
                History.isGetLoadIngData = false;
                if (dataHistory.length === 0) {
                    alert("未获取到相关历史记录！");
                    return;
                }
                alert("已获取完成！接下来可以将获取到的数据保存到电脑上任意一个位置");
                Util.fileDownload(JSON.stringify(dataHistory, null, 3), `b站用户全部的历史记录${Util.toTimeString()}(${dataHistory.length}个).json`);
            });
        });
        return;
    }
    if (href.includes("www.bilibili.com/watchlater")) {
        Watchlater.initLayout();
        $(".international-footer").remove();
        console.log("已移除页面页脚信息");
    }
}
