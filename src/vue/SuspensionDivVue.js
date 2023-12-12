const SuspensionDivVue = {
    returnVue() {
        const vue = new Vue({//快捷悬浮屏蔽面板的vue
            el: "#suspensionDiv",
            data: {
                moveLayoutValue: 5,
                xy: {
                    x: 0, y: 0
                },
                upName: "",
                uid: "",
                videoData: {
                    title: "",
                    bv: "",
                    av: "",
                    show: false,
                    frontCover: null
                },
            },
            methods: {
                getVideoData() {
                    return {
                        upName: this.upName,
                        uid: this.uid,
                        title: this.videoData.title,
                        bv: this.videoData.bv,
                        frontCover: this.videoData.frontCover
                    };
                },
                addLookAtItLater() {
                    LookAtItLater.addLookAtItLater(this.getVideoData());
                },
                addShieldName() {
                    UrleCrud.addShow("userNameArr", "用户名黑名单模式(精确匹配)", this.upName);
                },
                addShieldUid() {
                    if (!UrleCrud.addShow("userUIDArr", "用户uid黑名单模式(精确匹配)", this.uid)) {
                        return;
                    }
                    const title = document.title;
                    const url = Util.getWindowUrl();
                    if (title === "哔哩哔哩 (゜-゜)つロ 干杯~-bilibili") {
                        Home.startShieldMainVideo(".bili-video-card.is-rcmd");
                        return;
                    }
                    if (title.includes("-哔哩哔哩_Bilibili") && (url.includes("search.bilibili.com/all") || url.includes("search.bilibili.com/video"))) {//用于避免个别情况搜索界面屏蔽不生效问题
                        Search.video.searchRules();
                        return;
                    }
                    if (href.includes("//live.bilibili.com/") && title.includes("哔哩哔哩直播，二次元弹幕直播平台")) {
                        Live.shield($("#chat-items").children());
                    }
                },
                findUserInfo() {
                    const loading = Tip.loading("正在获取中！");
                    const promise = HttpUtil.get(`https://api.bilibili.com/x/web-interface/card?mid=${this.uid}&photo=false`);
                    promise.then(res => {
                        const body = res.bodyJson;
                        if (body["code"] !== 0) {
                            Tip.error("请求失败！");
                            return;
                        }
                        const cradInfo = body["data"]["card"];
                        const uid = cradInfo["mid"];//uid
                        const sex = cradInfo["sex"];//性别
                        const userName = cradInfo["name"];
                        const fans = cradInfo["fans"];//粉丝数
                        const sign = cradInfo["sign"];//个性签名信息
                        const face = cradInfo["face"];//头像
                        const current_level = cradInfo["level_info"]["current_level"];//当前用户b站等级
                        const friend = cradInfo["friend"];//关注量
                        const follower = body["data"]["follower"];//粉丝量
                        const like_num = body["data"]["like_num"];//点赞量
                        const userCardHtml = HtmlStr.getUserCard(uid, userName, current_level, sign, face, friend, follower, like_num);
                        const tempJq = $("#popDiv");
                        if (tempJq.length === 0) {
                            $("body").append(userCardHtml);
                        } else {
                            $("#popDiv").remove();
                            $("body").append(userCardHtml);
                        }
                        tempJq.css("display", "inline");
                    }).finally(() => {
                        loading.close();
                    });
                },
                move(value, func) {
                    const jqE = $("#suspensionDiv");
                    const moveLayoutValue = parseInt(Util.Str.lastIndexSub(jqE.css(value), 2));
                    let moveIndex = func(moveLayoutValue, this.moveLayoutValue);
                    const width = document.documentElement.clientWidth - parseInt(jqE.css("width"));
                    const height = document.documentElement.clientHeight - parseInt(jqE.css("height"));
                    if (value === "top" && 0 >= moveIndex) {
                        moveIndex = 0;
                    }
                    if (value === "top" && moveIndex > height) {
                        moveIndex = height;
                    }
                    if (value === "left" && moveIndex <= 0) {
                        moveIndex = 0;
                    }
                    if (value === "left" && moveIndex > width) {
                        moveIndex = width;
                    }
                    if (value === "top") {
                        this.xy.y = moveIndex;
                    } else {
                        this.xy.x = moveIndex;
                    }
                    jqE.css(value, `${moveIndex}px`);
                },
                moveTop() {
                    this.move("top", (layoutIndex, moveLayoutValue) => layoutIndex - moveLayoutValue);
                },
                moveLrft() {
                    this.move("left", (layoutIndex, moveLayoutValue) => layoutIndex - moveLayoutValue);
                },
                moveRight() {
                    this.move("left", (layoutIndex, moveLayoutValue) => layoutIndex + moveLayoutValue);
                },
                moveButton() {
                    this.move("top", (layoutIndex, moveLayoutValue) => layoutIndex + moveLayoutValue);
                },
                handleToggle(event) {//处理监听details展开关闭事件
                    if (event.target.open === false) {
                        return;
                    }
                    this.correctedPosition();
                },
                correctedPosition() {//修正位置
                    const jqE = $("#suspensionDiv");
                    const jqHeight = parseInt(jqE.css("height"));//面板本身面积高度
                    const panelTop = jqE.offset().top;//面板左上角的坐标y
                    const height = jqHeight + panelTop;//面板在页面高度中所占用的高度大小
                    const remainHeight = document.documentElement.clientHeight - height;//剩余的高度
                    const maxHeight = document.documentElement.clientHeight - jqHeight;//允许的最低位置
                    if (jqHeight < remainHeight) {
                        return;
                    }
                    if (remainHeight > maxHeight) {
                        return;
                    }
                    jqE.css("top", `${maxHeight}px`);
                }
            },
        });
        return function () {
            return vue;
        }
    }
}