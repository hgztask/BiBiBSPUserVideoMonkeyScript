const Space = {
    //是否正在获取粉丝或关注列表
    isFetchingFollowersOrWatchlists: false,
    //获取当前用户空间是否是自己的空间主页
    isH_action: function () {
        return document.querySelector(".h-action") === null;
    },
    getMyFollowLabel: function () {//获取当前关注数页面中展示关注列表的标签，如，全部关注，以及用户自定义的分类，xxx
        return document.querySelector(".item.cur").textContent;
    },
    getUserName: function () {//获取当前空间中的用户名
        return new Promise(resolve => {
            const interval = setInterval(() => {
                const e = $("#h-name");
                if (e.length === 0) {
                    return;
                }
                clearInterval(interval);
                resolve(e.text());
            }, 100);
        });
    },
    getTabName: function () {
        let typeE = document.querySelector(".n-statistics>.router-link-active>.n-data-k");//关注或粉丝页
        if (typeE !== null) {
            return typeE.textContent;
        }
        typeE = document.querySelector(".n-tab-links>.active>.n-text");
        if (typeE === null) {
            return null;
        }
        return typeE.textContent;
    },
    fav: {
        getFavName: function () {//获取收藏选项卡中对应展示的收藏夹名
            let favName = document.querySelector(".favInfo-details>.fav-name");
            if (favName !== null) {
                return favName.textContent.trim();
            }
            favName = document.querySelector(".collection-details .title-name");
            if (favName !== null) {
                return favName.textContent.trim();
            }
            return "未知收藏夹";
        }
        ,
        getAuthorName: function () {//获取收藏选项卡中对应展示的创建收藏夹的作者
            let favUpName = document.querySelector(".favInfo-details .fav-up-name");
            if (favUpName !== null) {
                return favUpName.textContent.replace("创建者：", "");
            }
            favUpName = document.querySelector(".author-wrapper>.author");
            if (favUpName !== null) {
                return favUpName.textContent.replace("合集 · UP主：", "");
            }
            return "不确定的用户名";
        }
        ,
        getDataList: function () {//获取获取收藏选项卡中对应展示的收藏夹项目内容
            const elementList = document.querySelectorAll(".fav-video-list.clearfix.content>li");
            const dataList = [];
            elementList.forEach(value => {
                const data = {};
                data["标题"] = value.querySelector(".title").textContent;
                const bvID = value.getAttribute("data-aid");
                data["BV号"] = bvID;
                data["AV号"] = Util.BilibiliEncoder.dec(bvID);
                data["收藏于何时"] = value.querySelector(".meta.pubdate").textContent.trim();//收藏于何时
                data["视频的时长"] = value.querySelector("a>.length").textContent;//对象的时长
                const videoInfo = value.querySelector(".meta-mask>.meta-info");
                data["作者名"] = videoInfo.querySelector(".author").textContent.split("：")[1];//作者名
                data["视频地址"] = `https://www.bilibili.com/video/${bvID}`;//视频地址
                data["播放量"] = videoInfo.querySelector(".view").textContent.split("：")[1];//播放量
                data["收藏量"] = videoInfo.querySelector(".favorite").textContent.split("：")[1];//收藏量
                data["投稿时间"] = videoInfo.querySelector(".pubdate").textContent.split("：")[1];//投稿时间(审核通过的时间)
                data["封面"] = value.querySelector(".b-img__inner>img").getAttribute("src");//收藏对象的封面，如视频封面
                dataList.push(data);
            });
            return dataList;
        }
        ,
        getAllDataList() {
            let list = [];
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    const arr = Space.fav.getDataList();
                    list = list.concat(arr);
                    const nextPageBut = $(".fav-content.section>.be-pager>.be-pager-next");
                    if (nextPageBut.is(":hidden")) {
                        clearInterval(interval);
                        resolve(list);
                        return;
                    }
                    nextPageBut.click();
                }, 2000);
            });
        }
    },
    followAndFans: {
        getdataList() {
            const list = [];
            document.querySelectorAll(".relation-list>li").forEach(value => {
                const data = {};
                const userInfoContent = value.querySelector(".content");
                const userAddress = userInfoContent.querySelector("a").getAttribute("href");
                const name = userInfoContent.querySelector("a>.fans-name").textContent;
                let desc = userInfoContent.querySelector(".desc");//个人简介
                const fansActionText = userInfoContent.querySelector(".fans-action-text").textContent;//关注状态，如已关注，互关
                const userImg = value.querySelector(".cover-container .bili-avatar>img").getAttribute("src");//头像
                data["name"] = name;
                data["img"] = userImg;
                if (desc !== null) {
                    desc = desc.getAttribute("title");
                }
                data["desc"] = desc;
                const uid = /space\.bilibili\.com\/(\d+?)\//.exec(userAddress);
                if (uid && uid[1]) {
                    data["uid"] = uid[1];
                } else {
                    data["uid"] = userAddress;
                }
                data["fansActionType"] = fansActionText;
                list.push(data);
            });
            return list;
        }
        ,
        getAllDataList() {
            let list = [];
            const isHAction = this.isH_action();
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    const arr = Space.followAndFans.getdataList();
                    list = list.concat(arr);
                    const nextPageBut = $(".content>.be-pager>.be-pager-next");
                    if (nextPageBut.is(":hidden")) {
                        clearInterval(interval);
                        resolve(list);
                        return;
                    }
                    const page = parseInt(document.querySelector(".be-pager>.be-pager-item.be-pager-item-active>a").textContent.trim());
                    if (page === 5 && (!isHAction)) {
                        resolve(list);
                        alert("因您当前访问的用户空间非自己实际登录的个人空间主页（不是自己当前网页登录的账号）而是访问他人，b站系统限制只能访问前5页");
                        return;
                    }
                    nextPageBut.click();
                }, 2000);
            });

        }
    }
    ,
    video: {
        getLeftTabTypeName() {
            return $(".contribution-list>.contribution-item.cur>a").text();
        },
        getSortText() {
            return $(".be-tab-inner.clearfix>.is-active>span").text();
        },
        getVideoType() {
            return $("#submit-video-type-filter>.active").text().trim().replace(/\d+/g, '');
        },
        getDataList() {
            const list = [];
            document.querySelectorAll(".clearfix.cube-list>li").forEach(v => {
                const data = {};
                data["标题"] = v.querySelector(".title").textContent;
                data["bv"] = v.getAttribute("data-aid");
                const meta = v.querySelector(".meta");
                data["播放量"] = meta.querySelector(".play>span").textContent;
                data["时间"] = meta.querySelector(".time").textContent.trim();
                data["时长"] = v.querySelector("a>.length").textContent;
                data["封面"] = v.querySelector(".b-img img").getAttribute("src")
                list.push(data);
            })
            return list;
        }
        ,
        getAllDataList() {
            let list = [];
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    const arr = Space.video.getDataList();
                    list = list.concat(arr);
                    const nextPageBut = $("#submit-video-list>.be-pager>.be-pager-next");
                    if (nextPageBut.is(":hidden")) {
                        clearInterval(interval);
                        resolve(list);
                        return;
                    }
                    nextPageBut.click();
                    Util.bufferBottom();
                }, 2500);
            });
        }
    }
}