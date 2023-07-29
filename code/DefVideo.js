const DefVideo = {
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
        if (LocalData.getHideVideoButtonCommentSections()) {
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
