const Space = {
    //是否正在获取粉丝或关注列表
    isFetchingFollowersOrWatchlists: false,
    //获取当前用户空间是否是自己的空间主页
    isH_action() {
        return document.querySelector(".h-action") === null;
    },
    getMyFollowLabel() {//获取当前关注数页面中展示关注列表的标签，如，全部关注，以及用户自定义的分类，xxx
        return document.querySelector(".item.cur").textContent;
    },
    getUserName() {//获取当前空间中的用户名
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
    getTabName() {
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
        getFavName() {//获取收藏选项卡中对应展示的收藏夹名
            let favName = document.querySelector(".favInfo-details>.fav-name");
            if (favName !== null) return favName.textContent.trim();
            favName = document.querySelector(".collection-details .title-name");
            if (favName !== null) return favName.textContent.trim();
            return "未知收藏夹";
        },
        getFavID() {//获取收藏夹选项卡中展示的收藏夹id
            const element = $(".fav-item.cur a");
            let id = element.attr("href");
            return Util.getUrlParam(id, "fid");
        },
        getFavtype() {//获取左侧收藏夹选中的的类型
            const urlParam = Util.getUrlParam($(".fav-item.cur a").attr("href"), "ftype");
            if (urlParam === null) return null;
            return urlParam;
        },
        getAuthorName() {//获取收藏选项卡中对应展示的创建收藏夹的作者
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
        getDataList() {//获取获取收藏选项卡中对应展示的收藏夹项目内容
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
        },
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
        },
        getHttpDataList(url) {
            const dataList = [];
            return new Promise((resolve, reject) => {
                const promise = HttpUtil.get(url);
                promise.then(res => {
                    const json = res.bodyJson;
                    const mediasArr = json["data"]["medias"];
                    for (let value of mediasArr) {
                        const data = {};
                        const upInfo = value["upper"];
                        const bvId = value["bvid"];
                        data["作者名"] = upInfo["name"];
                        data["uid"] = upInfo["mid"];
                        data["头像"] = upInfo["face"];
                        data["标题"] = value["title"];
                        data["封面"] = value["cover"];
                        data["AV号"] = value["id"];
                        data["BV号"] = bvId;
                        data["视频地址"] = `https://www.bilibili.com/video/${bvId}`;
                        data["弹幕量"] = value["cnt_info"]["danmaku"];
                        data["播放量"] = value["cnt_info"]["play"];
                        data["收藏量"] = value["cnt_info"]["collect"];
                        data["投稿时间"] = value["ctime"];
                        data["收藏于何时"] = value["fav_time"];
                        dataList.push(data);
                    }
                    const hasMore = json["data"]["has_more"];
                    resolve({state: true, hasMore: hasMore, dataList: dataList});
                }).catch(error => {
                    reject({state: false, error: error});
                });
            });
        },
        /**
         * 请求自己或他人所建的收藏夹指定页数的列表内容
         * 该api最大只能获取20个收藏夹内容
         * 详情参数可查询<a href="https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/fav/list.md">api信息</a>
         * @param {string}id 收藏夹id
         * @param page
         * @return {Promise<unknown>}
         */
        getHttpUserCreationDataList(id, page = 1) {
            return this.getHttpDataList(`https://api.bilibili.com/x/v3/fav/resource/list?media_id=${id}&pn=${page}&ps=20`);
        },
        /**
         * 请求自己或他人所建的收藏夹中指定收藏夹所有item
         */
        async getHttpUserCreationAllDataList(id) {
            let page = 1;
            const datalist = [];

            async function f() {
                const data = await this.getHttpUserCreationDataList(id, page);
                if (!data["state"]) {
                    return false;
                }
                if (!data["hasMore"]) {
                    return false;
                }
                Util.mergeArrays(datalist, data["dataList"]);
                f();
            }

            await f();
            return datalist;
        },
        /**
         *
         * 请求他人或者自己收藏了他人指定收藏夹列表中所有项目
         * @param id 收藏夹id
         * @return {Promise<unknown>}
         */
        getHttpCollectOthersDataAllList(id) {
            return this.getHttpDataList(`https://api.bilibili.com/x/space/fav/season/list?season_id=${id}`);
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
                let uid = /space\.bilibili\.com\/(\d+?)\//.exec(userAddress);
                if (uid && uid[1]) {
                    uid = uid[1];
                } else {
                    uid = userAddress;
                }
                data["uid"] = parseInt(uid);
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
    },
    dynamic: {
        getdataList() {
            const list = [];
            document.querySelectorAll(".bili-dyn-list__items>*").forEach(v => {
                const data = {};
                data["动态内容"] = v.querySelector(".bili-dyn-content").textContent.trim();
                data["点赞量"] = v.querySelector(".bili-dyn-item__footer .like").textContent.trim();
                list.push(data);
            })
            console.log(list);
        }

    },
    video: {//投稿中的视频
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
    },
    article: {//投稿中的专栏
        getdataList() {
            const list = [];
            document.querySelectorAll(".article-wrap.clearfix>li").forEach(v => {
                const data = {};
                data["标题"] = v.querySelector(".article-title>a").getAttribute("title");
                data["地址"] = v.querySelector(".article-title>a").getAttribute("href");
                data["预览部分"] = v.querySelector(".article-con>a").getAttribute("title");
                const metaCol = v.querySelector(".meta-col");
                data["标签"] = v.querySelectorAll(".meta-col>span")[0].textContent;
                data["访问量"] = metaCol.querySelector(".view").textContent.trim();
                data["喜欢数"] = metaCol.querySelector(".like").textContent.trim();
                data["评论"] = metaCol.querySelector(".comment").textContent.trim();
                data["创建时间"] = metaCol.querySelector(".time").textContent.trim();
                const hrefCss = v.querySelector(".article-cover").getAttribute("style");
                let imgUrl = hrefCss.match(/url\("([^"]+)"\)/);
                data["封面"] = imgUrl ? imgUrl[1] : "";
                //封面后面在弄
                list.push(data);
            });
            return list;
        },
        getAllDataList() {
            let list = [];
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    Util.bufferBottom();
                    const tempList = Space.article.getdataList();
                    list = list.concat(tempList);
                    const nextPage = $(".be-pager-next");
                    if (nextPage.is(":hidden")) {
                        clearInterval(interval);
                        resolve(list);
                        return;
                    }
                    nextPage.click();
                }, 2500);
            });
        }
    },
    album: {//相薄
        getdataList() {
            const list = [];
            document.querySelectorAll(".album-list__content>*").forEach(v => {
                const data = {};
                const albumCardTitle = v.querySelector(".album-card__title");
                data["预览部分"] = albumCardTitle.textContent;
                data["动态地址"] = albumCardTitle.getAttribute("href");
                const albumCardCountText = v.querySelectorAll(".album-card__info .album-card__count-text");
                data["浏览量"] = albumCardCountText[0].textContent.trim();
                data["点赞量"] = albumCardCountText[1].textContent.trim();
                const hrefCss = v.querySelector(".album-card__picture").getAttribute("style");
                let imgUrl = hrefCss.match(/url\("([^"]+)"\)/);
                data["封面"] = imgUrl ? imgUrl[1] : "";
                list.push(data);
            });
            return list;
        },
        getAllDataList() {
            let list = [];
            return new Promise(resolve => {
                const interval = setInterval(() => {
                    Util.bufferBottom();
                    const tempList = Space.album.getdataList();
                    list = list.concat(tempList);
                    const nextPage = $(".be-pager-next");
                    if (nextPage.is(":hidden")) {
                        clearInterval(interval);
                        resolve(list);
                        return;
                    }
                    nextPage.click();
                }, 2500);
            });
        }
    },
    subscribe: {//订阅
        getTabsName() {//订阅中的tab名
            return $(".sub-tabs.clearfix>.active").text().trim();
        },
        bangumiAndCinema: {//追番和追剧
            getSortText() {//筛选的依据
                return $(".be-dropdown>.cur-filter").text();
            },
            getdataList() {
                const list = [];
                document.querySelectorAll(".pgc-space-follow-item").forEach(v => {
                    const data = {};
                    data["封面"] = v.querySelector(".pgc-item-cover>img").getAttribute("src");
                    const pgcItemInfo = v.querySelector(".pgc-item-info");
                    data["标题"] = pgcItemInfo.querySelector(".pgc-item-title").textContent;
                    data["类型"] = pgcItemInfo.querySelector(".type-and-area>span:first-child").textContent;
                    data["地区"] = pgcItemInfo.querySelector(".type-and-area>span:last-child").textContent;
                    data["部分简介"] = pgcItemInfo.querySelector(".pgc-item-desc").textContent;
                    data["地址"] = pgcItemInfo.getAttribute("href");
                    list.push(data);
                });
                return list;
            },
            getAllDataList() {
                let list = [];
                return new Promise(resolve => {
                    const interval = setInterval(() => {
                        const tempList = Space.subscribe.bangumiAndCinema.getdataList();
                        list = list.concat(tempList);
                        const nextPage = document.querySelector(".p.next-page");
                        if (nextPage === null) {
                            clearInterval(interval);
                            resolve(list);
                            return;
                        }
                        nextPage.click();
                    }, 2500);
                });
            }
        },
        subs: {//订阅中的标签
            getdataList() {
                const list = [];
                document.querySelectorAll(".content.clearfix>.mini-item").forEach(v => {
                    const data = {};
                    const detail = v.querySelector(".detail");
                    data["标签名"] = detail.getAttribute("title");
                    data["标签图标"] = v.querySelector(".cover>img").getAttribute("src");
                    data["地址"] = detail.querySelector("a").getAttribute("href");
                    list.push(data);
                });
                return list;
            }
        }
    },

}