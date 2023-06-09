//直播
const Live = {
    shield: function (list) {
        for (let v of list) {
            const userName = v.getAttribute("data-uname");
            const uid = v.getAttribute("data-uid");
            const content = v.getAttribute("data-danmaku");
            let fansMeda = "这是个个性粉丝牌子";
            try {
                fansMeda = v.querySelector(".fans-medal-content").text;
            } catch (e) {
            }
            if (startPrintShieldNameOrUIDOrContent(v, userName, uid, content)) {
                Qmsg.info("屏蔽了言论！！");
                continue;
            }
            if (Remove.fanCard(v, fansMeda)) {
                Print.ln("已通过粉丝牌【" + fansMeda + "】屏蔽用户【" + userName + "】 言论=" + content);
                continue;
            }
            const jqE = $(v);
            if (Util.isEventJq(jqE, "mouseover")) {
                continue;
            }
            jqE.mouseenter((e) => {
                const domElement = e.delegateTarget;//dom对象
                const name = domElement.getAttribute("data-uname");
                const uid = domElement.getAttribute("data-uid");
                Util.showSDPanel(e, name, uid);
            });
        }
    },
    //直播间
    liveDel: {
        //针对于直播间顶部的屏蔽处理
        topElement: function () {
            if (Rule.liveData.topElement) {
                try {
                    document.getElementsByClassName("link-navbar-ctnr z-link-navbar w-100 p-fixed p-zero ts-dot-4 z-navbar contain-optimize")[0].remove();
                    Print.ln("已移除直播间顶部的信息（包括顶部标题栏）")
                } catch (e) {
                    Print.ln("已移除直播间顶部的信息（包括顶部标题栏）-出错")
                }
                return;
            }
            if (Rule.liveData.topLeftBar.length !== 0) {
                for (const element of Rule.liveData.topLeftBar) {
                    try {
                        document.getElementsByClassName(element)[0].remove();
                        Print.ln("已移除该项目=" + element)
                    } catch (e) {
                        Print.ln("不存在该项目！=" + element)
                    }
                }
            }
            if (Rule.liveData.topLeftLogo) {
                document.getElementsByClassName("entry_logo")[0].remove();
                Print.ln("已移除左上角的b站直播logo信息")
            }
            if (Rule.liveData.topLeftHomeTitle) {
                document.getElementsByClassName("entry-title")[0].remove();
                Print.ln("已移除左上角的首页项目")
            }
        },
        //针对直播间播放器头部的用户信息，举例子，，某某用户直播，就会显示器的信息和直播标题等
        hreadElement: function () {
            const liveData = Rule.liveData;
            if (liveData.isheadInfoVm) {
                const interval = setInterval(() => {
                    try {
                        document.getElementById("head-info-vm").remove()
                        clearInterval(interval);
                        Print.ln("已移除直播间头部的用户信息");
                    } catch (e) {
                    }
                }, 2000);
            }
        },
        bottomElement: function () {//针对于直播间底部的屏蔽处理
            document.getElementById("link-footer-vm").remove();
            Print.ln("已移除底部的页脚信息")
            if (Rule.liveData.bottomElement) {
                document.getElementById("sections-vm").remove();
                Print.ln("已移除直播间底部的全部信息")
                return;
            }
            if (Rule.liveData.bottomIntroduction) {
                document.getElementsByClassName("section-block f-clear z-section-blocks")[0].getElementsByClassName("left-container")[0].remove();
                Print.ln("已移除直播间底部的的简介和主播荣誉")
            } else {
                if (Rule.liveData.liveFeed) {
                    const interval = setInterval(() => {
                        try {
                            document.getElementsByClassName("room-feed")[0].remove();
                            clearInterval(interval)
                            Print.ln("已移除页面底部动态部分")
                        } catch (e) {
                        }
                    }, 2500);
                }
            }
            if (Rule.liveData.container) {
                document.getElementsByClassName("right-container")[0].remove();
                Print.ln("已移除直播间的主播公告")
            }
        },
        //礼物栏的布局处理
        delGiftBar: function () {
            if (Rule.liveData.delGiftLayout) {
                Util.circulateIDs("gift-control-vm", 5, 1500, "已移除礼物栏")
                return;
            }
            if (Rule.liveData.isEmbark) {
                const temp = setInterval(() => {
                    const tempClass = document.getElementsByClassName("m-guard-ent gift-section guard-ent")[0];
                    if (tempClass) {
                        tempClass.remove();
                        clearInterval(temp);
                        Print.ln("移除立即上舰")
                    }
                }, 2000);
            }
            if (Rule.liveData.isGift) {
                const temp = setInterval(() => {
                    const element = document.getElementsByClassName("gift-presets p-relative t-right")[0];
                    if (element) {
                        element.remove();
                        clearInterval(temp);
                        Print.ln("移除礼物栏的的礼物部分")
                    }
                }, 2000);
            }
            if (Rule.liveData.isEmbark && Rule.liveData.isGift) {//如果立即上舰和礼物栏的部分礼物移除了就对其位置调整
                const interval = setInterval(() => {
                    try {
                        document.getElementById("gift-control-vm").style.height = "auto";
                        document.getElementsByClassName("gift-control-panel f-clear b-box p-relative")[0].style.height = "40px";
                        clearInterval(interval);
                    } catch (e) {
                    }
                }, 1500);
            }
        },
        //移除右侧的聊天布局
        delRightChatLayout: function () {
            const liveData = Rule.liveData;
            if (liveData.isRightChatLayout) {
                const interval = setInterval(() => {
                    const id = document.getElementById("aside-area-vm");
                    if (id) {
                        id.remove();
                        clearInterval(interval);
                        Print.ln("移除直播间右侧的聊天布局")
                        document.getElementsByClassName("player-ctnr")[0].style.width = "100%";//移除完之后调整其布局位置
                    }
                }, 2000);
                return;
            }
            if (liveData.isChatHistoryPanel) {
                const interval = setInterval(() => {
                    const tempClass = document.getElementsByClassName("chat-history-panel")[0];
                    if (tempClass) {
                        tempClass.remove();
                        clearInterval(interval);
                        Print.ln("已移除直播间右侧的聊天内容");
                        document.getElementById("aside-area-vm").style.height = "0px";//移除之后调整下布局
                    }
                }, 2000);
                return;
            }
            if (liveData.isSystemRedTip) {
                const interval = setInterval(() => {//移除右侧的聊天布局系统提示
                    const tempE = document.getElementsByClassName("chat-item  convention-msg border-box")[0];
                    if (tempE) {
                        tempE.remove();
                        clearInterval(interval);
                        Print.ln("已移除聊天布局的系统提示")
                    }
                }, 2000);
            }
            if (liveData.isEnterLiveRoomTip) {
                const interval = setInterval(() => {//移除右侧聊天内容中的用户进入房间提示
                    try {
                        document.getElementById("brush-prompt").remove();
                        clearInterval(interval);
                        Print.ln("移除右侧聊天内容中的用户进入房间提示")
                    } catch (e) {
                    }
                }, 2000);
            }
        },
        delOtherE: function () {
            const liveData = Rule.liveData;
            if (liveData.is233Ma) {
                const interval = setInterval(() => {
                    try {
                        document.getElementById("my-dear-haruna-vm").remove();
                        clearInterval(interval);
                        Print.ln("已移除2333娘")
                    } catch (e) {
                    }
                }, 2000);
            }
            if (liveData.isRightSuspenBotton) {
                const interval = setInterval(() => {
                    try {
                        document.getElementsByClassName("side-bar-cntr")[0].remove();
                        Print.ln("已移除右侧悬浮靠边按钮-如实验-关注")
                        clearInterval(interval);
                    } catch (e) {
                    }
                }, 2000);
            }
            if (liveData.isLiveRoomWatermark) {
                const interval = setInterval(() => {
                    try {
                        document.getElementsByClassName("web-player-icon-roomStatus")[0].remove();//移除播放器左上角的哔哩哔哩直播水印
                        clearInterval(interval);
                        Print.ln("已移除直播水印")
                    } catch (e) {
                    }
                }, 2000);
            }
            if (liveData.isShoppingCartTip) {
                const interval = setInterval(() => {
                    try {
                        document.getElementsByClassName("shop-popover")[0].remove();//是否移除提示购物车
                        clearInterval(interval);
                        Print.ln("已移除提示购物车")
                    } catch (e) {
                    }
                }, 2000);
            }
            if (liveData.isShoppingCart) {
                const interval = setInterval(() => {
                    try {
                        document.getElementsByClassName("ecommerce-entry gift-left-part")[0].remove();//是否移除购物车
                        clearInterval(interval);
                        Print.ln("已移除购物车")
                    } catch (e) {
                    }
                }, 2000);
            }
            if (liveData.isDelbackground) {
                const interval = setInterval(() => {
                    try {
                        document.getElementsByClassName("room-bg webp p-fixed")[0].remove(); //移除直播背景图
                        clearInterval(interval);
                        Print.ln("已移除直播背景图")
                    } catch (e) {
                    }
                }, 2000);
            }
            const interval01 = setInterval(() => {
                try {
                    document.getElementsByClassName("web-player-icon-feedback")[0].remove();//移除播放器右上角的问号图标
                    clearInterval(interval01);
                } catch (e) {
                }
            }, 2000);
        },
        delLiveRoom: function () {//过滤直播间列表，该功能目前尚未完善，暂时用着先
            const list = document.getElementsByClassName("index_3Uym8ODI");
            for (let v of list) {
                const title = v.getElementsByClassName("Item_2GEmdhg6")[0].textContent.trim();
                const type = v.getElementsByClassName("Item_SI0N7ecx")[0].textContent;//分区类型
                const name = v.getElementsByClassName("Item_QAOnosoB")[0].textContent.trim();
                const index = v.getElementsByClassName("Item_3Iz_3buh")[0].textContent.trim();//直播间人气
                if (Rule.liveData.classify.includes(type)) {
                    v.remove();
                    Print.ln("已屏蔽直播分类为=" + type + " 的直播间 用户名=" + name + " 房间标题=" + title + " 人气=" + index)
                    continue;
                }
                if (Remove.name(v, name)) {
                    Print.ln("已通过用户名=" + name + " 屏蔽直播间 直播分类=" + type + " 房间标题=" + title + " 人气=" + index)
                    continue;
                }
                const nameKey = Remove.nameKey(v, name);
                if (nameKey != null) {
                    Print.ln("用户名=" + name + " 包含了=屏蔽词=" + nameKey + " 故屏蔽该直播间 分类=" + type + " 房间标题=" + title + " 人气=" + index)
                    continue;
                }
                if (Remove.titleKey(v, title)) {
                    Print.ln("已通过直播间标题=【" + title + "】屏蔽该房间 用户名=" + name + " 分类=" + type + " 人气=" + index);
                }
            }
        }
    }
};