//动态
const Trends = {
    data: {
        /**
         * 关注用户直播列表页数
         */
        concernPage: 1,
        /**
         * 关注用户直播-是否获取完列表item
         */
        concernBool: false,
        partition: {},
        /**
         * 分区列表页数
         */
        getPartitionPage: function (key) {
            const data = this.partition[key + "Page"];
            if (data == undefined || data == null) {
                return 1;
            }
            return data;
        },
        /**
         * 分区列表页数
         */
        setPartitionPage: function (key, value) {
            this.partition[key + "Page"] = value;
        },
        /**
         * 分区用户直播-是否获取完列表item
         */
        setPartitionBool: function (key, value) {
            this.partition[key + "Bool"] = value;
        }, /**
         * 分区用户直播-是否获取完列表item
         */
        getPartitionBool: function (key) {
            const data = this.partition[key + "Bool"];
            if (data == undefined || data == null || data === false) {
                return false;
            }
            return true;
        },
        partitionPage: 1,
        partitionBool: false,
        partitionEndTypeLiveName: "",
        setTrendsItemsTwoColumnCheackbox: function (bool) {
            Util.setData("isTrendsItemsTwoColumnCheackbox", bool);
        },
        getTrendsItemsTwoColumnCheackbox: function () {
            return Util.isBoolean(Util.getData("isTrendsItemsTwoColumnCheackbox"));
        },
    }, topCssDisply: {
        //针对于整体布局的细调整
        body: function () {
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
        topTar: function () {
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
        rightLayout: function () {
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
        items: function () {//调整动态列表的布局方式为类似网格
            Util.addStyle(`
            .bili-dyn-list__items{
           column-count: 2;
            }
            .bili-dyn-list__items>*{
            page-break-inside: avoid;
            }
            `);
        }
    },
    getVideoCommentAreaOrTrendsLandlord: function (v) {//获取动态页面-评论区信息-单个元素信息-楼主
        return {
            name: v.querySelector(".user-name").textContent,
            uid: v.querySelector(".user-name").getAttribute("data-user-id"),
            content: v.querySelector(".reply-content").parentNode.textContent,
            info: v.querySelector(".user-info")
        }
    },
    getVideoCommentAreaOrTrendsStorey: function (j) {//获取动态页面-评论区信息-单个元素信息-楼层
        return {
            name: j.querySelector(".sub-user-name").textContent,
            uid: j.querySelector(".sub-user-name").getAttribute("data-user-id"),
            content: j.querySelector(".reply-content").textContent
        }
    },
    shrieDynamicItems: function (list) {//屏蔽动态页动态项目
        for (let v of list) {
            let tempE = v.querySelector(".bili-rich-text");
            if (tempE === null || tempE.length === 0) {//没有说明是其他的类型动态，如投稿了视频且没有评论显示
                continue;
            }
            const tempContent = tempE.textContent;
            const contentKey = Shield.arrContent(LocalData.getDynamicArr(), tempContent);
            if (contentKey !== null) {
                const tempInfo = `已通过动态关键词【${contentKey}】屏蔽了动态【${tempContent}】`;
                v.remove();
                Qmsg.success(`已通过动态关键词屏蔽相关动态，详情屏蔽内容可看面板输出信息`);
                Print.ln(tempInfo);
                continue;
            }
            const arrContentCanonical = Shield.arrContentCanonical(LocalData.getDynamicCanonicalArr(), tempContent);
            if (arrContentCanonical != null) {
                const tempInfo = `已通过动态正则关键词【${arrContentCanonical}】屏蔽了动态【${tempContent}】`;
                v.remove();
                Qmsg.success(`已通过动态正则关键词屏蔽相关动态，详情屏蔽内容可看面板输出信息`);
                Print.ln(tempInfo);
            }
        }
    }
};