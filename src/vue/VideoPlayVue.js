const VideoPlayVue = {
    returnVue() {
        const vue = new Vue({
            el: "#rightLayout",
            data: {
                leftVal: "1%",
                topVal: "15%",
                subItemButShow: LocalData.video.isSubItemButShow(),
                subItemButText: "收起",
                //是否隐藏右侧布局
                hideRightLayout: false,
                //是否隐藏顶部标题
                hideTopVideoTitleInfo: false,
                //是否隐藏底部评论区
                hideButtonLayout: false,
                hideButtonLayoutButText: "隐藏评论区",
                hideRightLayoutButText: "隐藏右侧布局",
                hideTopVideoTitleInfoButText: "隐藏顶部视频标题信息"
            },
            methods: {
                subItemShowBut() {
                    this.subItemButShow = !this.subItemButShow;
                },
                addUid() {
                    const userList = DefVideo.getCreativeTeam();
                    if (userList.length === 0) {
                        alert("获取失败！");
                        return;
                    }
                    if (userList.length === 1) {
                        const data = userList[0];
                        const name = data["name"];
                        const uid = data["uid"];
                        if (!confirm(`是要屏蔽用户【${name}】吗？屏蔽方式为uid=${uid}`)) {
                            return;
                        }
                        UrleCrud.addShow("userUIDArr", "用户uid黑名单模式(精确匹配)", uid);
                        return;
                    }
                    alert("暂不支持屏蔽多作者方式.");
                },
                addNameBut() {
                    const userList = DefVideo.getCreativeTeam();
                    if (userList.length === 0) {
                        alert("获取失败！");
                        return;
                    }
                    if (userList.length === 1) {
                        const data = userList[0];
                        const name = data["name"];
                        if (!confirm(`是要屏蔽用户【${name}】吗？屏蔽方式为用户名(精确)`)) {
                            return;
                        }
                        UrleCrud.addShow("userNameArr", "用户名黑名单模式(精确匹配)", name);
                        return;
                    }
                    alert("暂不支持屏蔽多作者方式.");
                },
                getTheVideoBarrage() {
                    const windowUrl = Util.getWindowUrl();
                    if (!windowUrl.includes("www.bilibili.com/video")) {
                        alert("当前不是播放页!");
                        return;
                    }
                    const urlBVID = Util.getUrlBVID(windowUrl);
                    if (urlBVID === null) {
                        alert("获取不到BV号!");
                        return;
                    }
                    if (!confirm(`当前视频BV号是 ${urlBVID} 吗`)) {
                        return;
                    }
                    const loading = Tip.loading("正在获取数据中!");
                    const promise = HttpUtil.getVideoInfo(urlBVID);
                    promise.then(res => {
                        const body = res.bodyJson;
                        const code = body["code"];
                        const message = body["message"];
                        if (code !== 0) {
                            Tip.error("获取失败!" + message);
                            return;
                        }
                        let data;
                        try {
                            data = body["data"][0];
                        } catch (e) {
                            Tip.error("获取数据失败!" + e);
                            return;
                        }
                        if (data === null || data === undefined) {
                            Tip.error("获取到的数据为空的!");
                            return;
                        }
                        const cid = data["cid"];
                        Tip.success("cid=" + cid);
                        Util.openWindow(`https://comment.bilibili.com/${cid}.xml`);
                    }).catch(err => {
                        Tip.error("错误状态!");
                        Tip.error(err);
                    }).finally(() => {
                        loading.close();
                    });
                },
                getTheVideoAVNumber() {
                    const urlId = Util.getUrlBVID(Util.getWindowUrl());
                    if (urlId === null) {
                        alert("获取不到BV号!");
                        return;
                    }
                    if (!confirm(`当前视频BV号是 ${urlId} 吗`)) {
                        return;
                    }
                    alert(Util.BilibiliEncoder.dec(urlId));
                },
                getVideoCommentArea() {//获取视频的评论区列表可见的内容
                    const list = document.querySelectorAll(".reply-list>.reply-item");
                    if (list.length === 0) {
                        Tip.error("未获取评论区内容，可能是当前并未有人评论！");
                        return;
                    }
                    const arr = [];
                    for (let v of list) {
                        const rootName = v.querySelector(".user-name").textContent;
                        const rootUid = v.querySelector(".user-name").getAttribute("data-user-id");
                        const rootContent = v.querySelector(".root-reply .reply-content").textContent;
                        const subList = v.querySelectorAll(".sub-reply-list>.sub-reply-item");
                        const data = {
                            name: rootName, uid: parseInt(rootUid), content: rootContent,
                        };
                        if (subList.length === 0) {
                            arr.push(data);
                            continue;
                        }
                        const subArr = [];
                        for (let j of subList) {
                            const subName = j.querySelector(".sub-user-name").textContent;
                            const subUid = j.querySelector(".sub-user-name").getAttribute("data-user-id");
                            const subContent = j.querySelector(".reply-content").textContent;
                            const subData = {
                                name: subName, uid: parseInt(subUid), content: subContent
                            };
                            subArr.push(subData);
                        }
                        data["sub"] = subArr;
                        arr.push(data);
                    }
                    Util.fileDownload(JSON.stringify(arr, null, 3), `评论区列表-${Util.toTimeString()}.json`);
                    Tip.success("已获取成功！");
                },
                getLeftTopVideoListBut() {
                    const videoCollection = DefVideo.videoCollection;
                    if (!videoCollection.isMulti_page()) {
                        alert("并未有视频选集列表！");
                        return;
                    }
                    let dataList;
                    if (videoCollection.isList()) {
                        dataList = videoCollection.getVideoList();
                    } else {
                        dataList = videoCollection.getVIdeoGridList();
                    }
                    Util.fileDownload(JSON.stringify(dataList, null, 3), `${DefVideo.getVIdeoTitle()}的视频选集列表(${dataList.length})个.json`);
                },
                localGetVideoInfo() {
                    const upInfo = document.querySelector(".up-name");
                    let data;
                    try {
                        data = {
                            upName: upInfo.textContent.trim(),
                            uid: Util.getSubWebUrlUid(upInfo.href),
                            title: document.querySelector(".video-title").textContent,
                            bv: Util.getSubWebUrlBV(Util.getWindowUrl())
                        };
                    } catch (e) {
                        console.error("获取视频信息出现错误！", e);
                        return null;
                    }
                    return data;
                },
                addLefToLookAtItLaterListBut() {
                    LookAtItLater.addLookAtItLater(this.localGetVideoInfo())
                },
                isHideButtonLayoutBut() {//隐藏评论区
                    const e = $("#comment,.playlist-comment");
                    if (e.is(":hidden")) {
                        e.show();
                        this.hideButtonLayout = false;
                        return;
                    }
                    e.hide();
                    this.hideButtonLayout = true;
                },
                isHideRightLayoutBut() {
                    const jqE = $(".right-container.is-in-large-ab,.playlist-container--right");
                    if (jqE.length === 0) {
                        Tip.error("获取不到右侧布局！");
                        return;
                    }
                    if (jqE.is(":hidden")) {
                        jqE.show();
                        this.hideRightLayout = false;
                        return;
                    }
                    jqE.hide();
                    this.hideRightLayout = true;
                },
                isHideTopVideoTitleInfoBut() {
                    const jqE = $("#viewbox_report,.video-info-container");
                    if (jqE.is(":hidden")) {
                        jqE.show();
                        this.hideTopVideoTitleInfo = false;
                        return;
                    }
                    jqE.hide();
                    this.hideTopVideoTitleInfo = true;
                },
                VideoPIPicture() {
                    Util.video.autoAllPictureInPicture();
                },
                openVideoSubtitle() {
                    const ariaE = document.querySelector("[aria-label='字幕'] span");
                    if (ariaE === null) {
                        return alert("未获取到字幕！");
                    }
                    ariaE.click();
                }
            },
            watch: {
                subItemButShow(newVal) {
                    this.subItemButText = newVal ? "收起" : "展开";
                },
                hideRightLayout(newVal) {
                    this.hideRightLayoutButText = newVal ? "显示右侧布局" : "隐藏右侧布局";
                    let tempLeft;
                    let tempTop;
                    if (newVal) {
                        tempLeft = "1%";
                        tempTop = "15%";
                    } else {
                        tempLeft = "90%";
                        tempTop = "20%";
                    }
                    this.leftVal = tempLeft;
                    this.topVal = tempTop;
                },
                hideTopVideoTitleInfo(newVal) {
                    this.hideTopVideoTitleInfoButText = newVal ? "显示顶部视频标题信息" : "隐藏顶部视频标题信息";
                },
                hideButtonLayout(newVal) {
                    this.hideButtonLayoutButText = newVal ? "显示评论区" : "隐藏评论区";
                }
            },
            created() {
                const tempRightBool = this.hideRightLayout = LocalData.video.isHideVideoRightLayout();
                if (tempRightBool) {
                    const interval = setInterval(() => {
                        const jqE = $(".right-container.is-in-large-ab,.playlist-container--right");
                        if (jqE.length === 0) return;
                        if (!tempRightBool || !this.hideRightLayout) {
                            clearInterval(interval)
                            return;
                        }
                        jqE.hide();
                    }, 1600);
                }
                const tempButtinBool = this.hideButtonLayout = LocalData.video.isHideVideoButtonCommentSections();
                if (tempButtinBool) {
                    const interval = setInterval(() => {
                        const jqE = $("#comment,.playlist-comment");
                        if (jqE.length === 0) return;
                        if (!tempButtinBool || !this.hideButtonLayout) {
                            clearInterval(interval)
                            return;
                        }
                        jqE.hide();
                    }, 1600);
                }
                const tempTopBool = this.hideTopVideoTitleInfo = LocalData.video.isHideVideoTopTitleInfoLayout();
                if (tempTopBool) {
                    const interval = setInterval(() => {
                        const jqE = $("#viewbox_report,.video-info-container");
                        if (jqE.length === 0) return;
                        clearInterval(interval);
                        jqE.hide();
                    }, 1500);
                }
            }
        });
        return function () {
            return vue;
        }
    },
    addHtml() {
        $("body").append(`<div id="rightLayout" :style="{left:leftVal,top:topVal}" style="position: fixed;">
<div style="display: flex; flex-direction: column;">
<button @click="subItemShowBut">{{subItemButText}}</button>
    <div v-show="subItemButShow" style="display: flex; flex-direction: column;">
        <button @click="addUid">屏蔽(uid)</button>
        <button @click="addNameBut">屏蔽用户名(精确)</button>
        <button @click="getTheVideoBarrage">获取视频弹幕</button>
        <button @click="getTheVideoAVNumber">获取视频av号</button>
        <button @click="getVideoCommentArea">获取评论区页面可见数据</button>
        <button @click="getLeftTopVideoListBut">获取视频选集列表数据</button>
        <button @click="addLefToLookAtItLaterListBut">添加进稍后再看</button>
        <button @click="isHideButtonLayoutBut">{{hideButtonLayoutButText}}</button>
        <button @click="isHideRightLayoutBut">{{hideRightLayoutButText}}</button>
        <button @click="isHideTopVideoTitleInfoBut">{{hideTopVideoTitleInfoButText}}</button>
        <button @click="VideoPIPicture">播放器画中画</button>
        <button @click="openVideoSubtitle">字幕开关</button>
    </div>
</div>
</div>`);
    }
}