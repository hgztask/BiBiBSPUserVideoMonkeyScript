//动态
const Trends = {
    data: {
        setTrendsItemsTwoColumnCheackbox(bool) {
            Util.setData("isTrendsItemsTwoColumnCheackbox", bool);
        },
        getTrendsItemsTwoColumnCheackbox() {
            return Util.isBoolean(Util.getData("isTrendsItemsTwoColumnCheackbox"));
        },
    }, topCssDisply: {
        //针对于整体布局的细调整
        body() {
            const sessdata = LocalData.getSESSDATA();
            const interval = setInterval(() => {
                try {
                    document.querySelector(".bili-dyn-home--member").style.justifyContent = 'space-between';
                    document.querySelector(".bili-dyn-my-info").style.display = "none";//移除左侧中的个人基础面板信息
                    if (sessdata !== null) {
                        const leftLiveLay = document.querySelector(".left");
                        if (leftLiveLay.length === 0) {
                            return;
                        }
                        leftLiveLay.style.display = "none";//当用户已经设置了sessdata值时，隐藏右侧的直播列表
                        document.querySelector("main").style.width = "84%";
                    } else {
                        document.querySelector("main").style.width = "70%";
                    }
                    Print.ln("已调整动态界面布局");
                    clearInterval(interval)
                } catch (e) {
                }
            });
            const interval02 = setInterval(() => {
                const e = document.querySelectorAll(".bili-dyn-sidebar>*:nth-child(-n+2)");
                if (e.length === 0) {
                    return;
                }
                clearInterval(interval02);
                e.forEach((value, key) => {
                    value.remove();
                });
                console.log("已尝试移除个别多余的悬浮按钮");
            }, 500);
        },
        //针对顶部的处理
        topTar() {
            const trends = Rule.trendsData;
            if (trends.isTop) {
                const interval = setInterval(() => {
                        try {
                            document.getElementById("bili-header-container").remove();//移除顶部栏
                            clearInterval(interval);
                        } catch (e) {
                        }
                    }
                );
            }
        },
        rightLayout() {
            const trendsData = Rule.trendsData;
            if (trendsData.isRightLayout) {
                const interval = setInterval(() => {
                    try {
                        document.getElementsByClassName("right")[0].style.display = "none";//隐藏右侧布局
                        document.getElementsByTagName("main")[0].style.width = "85%";//调整中间动态容器布局宽度
                        clearInterval(interval);
                        Print.ln("已移除右侧布局并调整中间动态容器布局宽度")
                    } catch (e) {
                    }
                }, 1000);
                return;
            }
            if (trendsData.isBiliDynBanner) {
                const interval = setInterval(() => {
                    try {
                        document.getElementsByClassName("bili-dyn-banner")[0].style.display = "none";
                        Print.ln("已移除公告栏布局")
                        clearInterval(interval)
                    } catch (e) {
                    }
                });
            }
            //移除话题上面的广告
            const interval01 = setInterval(() => {
                const bili_dyn_ads = $(".bili-dyn-ads");
                if (bili_dyn_ads.length === 0) {
                    return;
                }
                clearInterval(interval01);
                bili_dyn_ads.remove();
                console.log("已移除话题上面的广告");
            }, 1000);


        }
    }, layoutCss: {
        items() {//调整动态列表的布局方式为类似网格
            Util.addStyle(`
            .bili-dyn-list__items{
           column-count: 2;
            }
            .bili-dyn-list__items>*{
            page-break-inside: avoid;
            }
            `);
        },
        tabUserItems(jqE) {//调整切换用户展示动态的按钮列表样式
            let index = 0;
            jqE.css("display", "flex");
            jqE.css("flex-flow", "row wrap");
            const interval = setInterval(() => {
                if (index === 5) {
                    clearInterval(interval);
                    Qmsg.info("结束定时器");
                }
                if (jqE.css("flex-flow") === "row wrap") {
                    index++;
                    return;
                }
                jqE.css("display", "flex");
                jqE.css("flex-flow", "row wrap");
            }, 2500);
        }
    },
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
                Qmsg.success(`已通过动态关键词屏蔽相关动态，详情屏蔽内容可看面板输出信息`);
                Print.ln(tempInfo);
                continue;
            }
            const arrContentCanonical = Matching.arrContentCanonical(LocalData.getDynamicCanonicalArr(), tempContent);
            if (arrContentCanonical != null) {
                const tempInfo = `已通过动态正则关键词【${arrContentCanonical}】屏蔽了动态【${tempContent}】`;
                v.remove();
                Qmsg.success(`已通过动态正则关键词屏蔽相关动态，详情屏蔽内容可看面板输出信息`);
                Print.ln(tempInfo);
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
    }
};