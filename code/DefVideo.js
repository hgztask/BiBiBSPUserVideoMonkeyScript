const DefVideo = {
    delLayout: {
        //移除右侧悬浮按钮
        rightSuspendButton() {
            Util.circulateClassNames("storage-box", 0, 2, 2000, "已移除右侧的【返回旧版】【新版反馈】【客服】");//针对新版界面
        },
        delRightE() {
            const video = Rule.videoData;
            if (video.isRhgthlayout) {
                Util.circulateClassNames("right-container is-in-large-ab", 0, 3, 1500, "已移除视频播放器右侧的布局");
                return;
            }
            // Util.forIntervalDelE("#slide_ad", "已移除右侧slide_ad广告！");
            // Util.circulateClassNames("video-page-special-card-small", 0, 2, 2000, "移除播放页右上角的其他推广");
            // Util.circulateClassNames("vcd", 0, 2, 2000, "已移除右上角的广告");
            // Util.circulateClassName("video-page-game-card-small", 2000, "移除播放页右上角的游戏推广");
            // Util.circulateIDs("right-bottom-banner", 2, 1500, "删除右下角的活动推广");
            // Util.circulateClassName("pop-live-small-mode part-undefined", 1000, "删除右下角的直播推广")
            // Util.circulateClassNames("ad-report video-card-ad-small", 0, 3, 2000, "已删除播放页右上角的广告内容");
            if (video.isrigthVideoList) {
                Util.circulateID("reco_list", 2000, "已移除播放页右侧的视频列表");
                return;
            }
            if (!video.isRightVideo) {
                setTimeout(() => {
                    document.getElementsByClassName("rec-footer")[0].addEventListener("click", () => {
                        Print.ln("用户点击了右侧的展开")
                        DefVideo.rightVideo();
                    })
                }, 4000);
            }
        },
        //对视频页的播放器下面的进行处理
        delBottonE() {
            DefVideo.hideCommentArea();//处理评论区
            Util.circulateIDs("bannerAd", 10, 2500, "已移除播放器底部的广告");
            Util.circulateID("activity_vote", 2500, "已移除播放器底部的活动广告");
            Util.circulateClassName("reply-notice", 2000, "已移除播放器底部的橙色横幅通知");
            Util.circulateClassName("ad-floor-cover b-img", 2000, "已移除播放器底部的图片广告");
            if (Rule.videoData.isTag) {
                Util.circulateID("v_tag", 2000, "已移除播放器底部的tag栏");
            }
            if (Rule.videoData.isDesc) {
                Util.circulateID("v_desc", 2000, "已移除播放器底部的简介");
            }
        },

    },
    //针对视频播放页右侧的视频进行过滤处理。该界面无需用时长过滤，视频数目较少
    rightVideo() {
        const interval = setInterval(() => {
            let list = document.querySelectorAll(".video-page-card-small");
            if (list.length === 0) {
                return;
            }
            clearInterval(interval);
            list.forEach(v => {//获取右侧的页面的视频列表
                const upSpatialAddress = v.querySelector(".upname>a").href;
                //视频标题
                if (shieldVideo_userName_uid_title(new VideoClass()
                    .setUpName(v.querySelector(".name").textContent)
                    .setUid(parseInt(upSpatialAddress.substring(upSpatialAddress.lastIndexOf("com/") + 4, upSpatialAddress.length - 1)))
                    .setTitle(v.querySelector(".title").textContent)
                    .setE(v)
                )) {
                    Qmsg.info("屏蔽了视频！！");
                    return;
                }
                $(v).mouseenter((e) => {
                    const domElement = e.delegateTarget;
                    const upSpatialAddress = domElement.querySelector(".upname>a").href;
                    const videoAddress = domElement.querySelector(".video-awesome-img");
                    const bv = videoAddress === null ? null : Util.getSubWebUrlBV(videoAddress.href);
                    const v_img = domElement.querySelector(".b-img__inner>img");
                    const data = {
                        upName: domElement.querySelector(".name").textContent,
                        title: domElement.querySelector(".title").textContent,
                        uid: upSpatialAddress.substring(upSpatialAddress.lastIndexOf("com/") + 4, upSpatialAddress.length - 1),
                        frontCover: v_img === null ? null : v_img.getAttribute("src"),
                        bv: bv,
                        av: bilibiliEncoder.dec(bv)
                    };
                    Util.showSDPanel(e, data);
                });
            })
        }, 1000);
    },
    clickLayout: {
        fullScreenOnThePlayerPage() {//点击播放器的网页全屏按钮
            const interval = setInterval(() => {
                const jqE = $(".bpx-player-ctrl-btn.bpx-player-ctrl-web");
                if (jqE.length === 0) {
                    return;
                }
                clearInterval(interval);
                jqE.click();
                const info = `已自动点击播放器的网页全屏`;
                Print.ln(info);
                Qmsg.success(info);
                console.log(info);
            }, 1000);
        },
        thePlayerGoesToGullScreen() {//点击播放器的进入全屏按钮
            const interval = setInterval(() => {
                const jqE = $(".bpx-player-ctrl-btn.bpx-player-ctrl-full");
                if (jqE.length === 0) {
                    return;
                }
                clearInterval(interval);
                jqE.click();
                const info = "已自动点击播放器的进入全屏按钮";
                Qmsg.success(info);
                Print.ln(info);
                console.log(info);
            }, 1000);
        }
    },

    getVIdeoTitle() {//获取当前页面视频标题
        return document.querySelector("#viewbox_report>.video-title").title;
    },
    isCreativeTeam() {//判断是否是创作团队
        return document.querySelector(".header") !== null;
    },
    getCreativeTeam() {//获取创作团队
        const userList = [];
        if (this.isCreativeTeam()) {
            const list = document.querySelectorAll(".container .membersinfo-upcard-wrap .staff-name.is-vip");
            list.forEach(value => {
                const data = {};
                data["name"] = value.textContent.trim();
                const userAddress = value.getAttribute("href");
                data ["uid"] = parseInt(Util.getSubWebUrlUid(userAddress));
                data["e"] = value;
                userList.push(data);
            })
            return userList;
        }
        const userInfo = document.querySelector(".up-name");
        if (userInfo === null) {
            return userList;
        }
        const data = {};
        data["name"] = userInfo.textContent.trim();
        const userAddress = userInfo.getAttribute("href");
        data["uid"] = Util.getSubWebUrlUid(userAddress);
        data["e"] = userInfo;
        userList.push(data);
        return userList;
    },
    videoCollection: {
        isList() {
            return document.querySelector(".range-box>.van-icon-general_viewlist") !== null;
        },
        isMulti_page() {//判断是否有视频选集
            return document.getElementById("multi_page") !== null;
        },
        getVideoList() {
            const list = [];
            document.querySelectorAll("#multi_page>.cur-list>ul>li").forEach(v => {
                const data = {};
                const routerLinkActive = v.querySelector(".router-link-active");
                data["分p序号"] = v.querySelector(".page-num").textContent;
                data["分p标题"] = routerLinkActive.title;
                data["分p地址"] = routerLinkActive.href;
                data["分p时长"] = v.querySelector(".duration").textContent;
                list.push(data);
            })
            console.log(list);
            return list;
        },
        getVIdeoGridList() {
            const list = [];
            document.querySelectorAll(".module-box.clearfix>li").forEach(value => {
                const data = {};
                data["分p序号"] = value.querySelector("span").textContent;
                const tempE = value.querySelector(".router-link-active");
                data["分p标题"] = tempE.title;
                data["分p地址"] = tempE.href;
                list.push(data);
            });
            return list;
        }
    },
    hideCommentArea() {//隐藏评论区
        if (LocalData.video.isHideVideoButtonCommentSections()) {
            const interval = setInterval(() => {
                const jqE = $("#comment");
                if (jqE.length === 0) {
                    return;
                }
                clearInterval(interval);
                jqE.hide();
                Qmsg.success("已隐藏评论区");
            }, 500);
        }
    }

}
