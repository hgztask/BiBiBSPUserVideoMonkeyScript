//{"weight":2}
const SpaceControlPanelVue = {//空间主页左侧控制面板
    returnVue() {
        const vue = new Vue({
            el: "#id13315",
            data: {
                userUid: Util.getSubUid(href.split("/")[3]),
                userName: "",
                //当前用户空间是否是自己的空间主页
                isHAction: Space.isH_action(),
                tabsItemName: "",
                getDataListButText: "",
                getAllDataListButText: "",
                addUidButShow: true,
                addNameButShow: true,
                getDataListButShow: false,
                getAllDataListButShow: false
            },
            methods: {
                setDataListButText(text) {
                    this.getDataListButText = text;
                },
                setAllDataListButText(text) {
                    this.getAllDataListButText = text;
                },
                addUidBut() {
                    UrleCrud.addShow("userUIDArr", "用户uid黑名单模式(精确匹配)", this.userUid);
                },
                addNameBut() {
                    UrleCrud.addShow("userNameArr", "用户名黑名单模式(精确匹配)", this.userName);
                },
                async getDataListBut() {
                    let dataList, fileName;
                    const userName = this.userName;
                    switch (this.tabsItemName) {
                        case "投稿":
                            const tabTypeName = Space.video.getLeftTabTypeName();
                            switch (tabTypeName) {
                                case "视频":
                                    dataList = Space.video.getDataList();
                                    break;
                                case "专栏":
                                    dataList = Space.article.getdataList();
                                    break;
                                case "相簿":
                                    dataList = Space.album.getdataList();
                                    break;
                                default:
                                    alert(`暂不支持获取${tabTypeName}的数据！`);
                                    return;
                            }
                            fileName = `获取用户${userName}${Space.video.getSortText()}的${Space.video.getVideoType()}${this.tabsItemName}${tabTypeName}列表`;
                            break;
                        case "收藏":
                            const fav = Space.fav;
                            const favName = fav.getFavName();
                            const authorName = fav.getAuthorName();
                            const favID = fav.getFavID();
                            const favtype = fav.getFavtype();
                            if (!confirm(`获取【${authorName}】用户【${favName}】收藏夹当前显示的内容，是要获取吗？`)) {
                                return;
                            }
                            const input = prompt(`请选择获取的模式\n输入单个数字0为：页面自动化操作模式进行获取\n1为：网络请求模式获取，比页面自动化操作模式多3个结果参数（头像、uid、弹幕量）`);
                            if (input === null) return;
                            fileName = `${authorName}的${favName}收藏夹列表`;
                            if (input === "0") {
                                dataList = fav.getDataList();
                                break;
                            }
                            if (input === "1") {
                                const loading = Tip.loading("正在获取中！");
                                if (favtype === "collect") {//用户收藏其他用户收藏夹
                                    alert("暂不支持通过网络请求方式只获取当前页收藏夹列表，如需网络请求方式，请使用【获取收藏的列表数据】功能！或者使用【页面自动化操作模式】");
                                    loading.close();
                                    return;
                                }
                                const data = await fav.getHttpUserCreationDataList(favID)
                                loading.close();
                                if (!data["state"]) {
                                    Tip.error("获取失败!");
                                    return;
                                }
                                dataList = data["dataList"];
                            } else {
                                Tip.error("输入了意外的值！" + input);
                                return;
                            }
                            break;
                        case "订阅":
                            const tempTabsName = Space.subscribe.getTabsName();
                            if (tempTabsName === "标签") {
                                dataList = Space.subscribe.subs.getdataList();
                                fileName = `${userName}的订阅标签`;
                                break;
                            }
                            dataList = Space.subscribe.bangumiAndCinema.getdataList();
                            fileName = `${userName}订阅的${tempTabsName}列表`;
                            break;
                        case "关注数":
                        case "粉丝数":
                            dataList = Space.followAndFans.getdataList();
                            fileName = `${userName}的用户${this.tabsItemName}列表.json`;
                            break;
                        default:
                            alert("出现意外的参数！" + this.tabsItemName);
                            return;
                    }
                    const info = "获取到个数：" + dataList.length;
                    Tip.success(info);
                    console.log(info);
                    console.log(dataList);
                    alert(info);
                    Util.fileDownload(JSON.stringify(dataList, null, 3), `${fileName}[${dataList.length}个].json`);
                },
                async getAllDataListBut() {
                    const tabName = this.tabsItemName;
                    const userName = this.userName;
                    if (Space.isFetchingFollowersOrWatchlists) {
                        Tip.error("请等待获取完！");
                        return;
                    }
                    Space.isFetchingFollowersOrWatchlists = true;
                    const loading = Tip.loading(`正在获取 ${userName} 的${tabName}列表数据中，请不要轻易动当前页面内容`);
                    let fileName, dataList;
                    switch (tabName) {
                        case "投稿":
                            const tabTypeName = Space.video.getLeftTabTypeName();
                            switch (tabTypeName) {
                                case "视频":
                                    dataList = await Space.video.getAllDataList();
                                    break;
                                case "专栏":
                                    dataList = await Space.article.getAllDataList();
                                    break;
                                case "相簿":
                                    dataList = await Space.album.getAllDataList();
                                    break;
                                default:
                                    loading.close();
                                    alert(`暂不支持获取${tabTypeName}的数据！`);
                                    break;
                            }
                            fileName = `获取用户${userName}${Space.video.getSortText()}的${Space.video.getVideoType()}${tabName}${tabTypeName}列表`;
                            break;
                        case"收藏":
                            const fav = Space.fav;
                            const favName = fav.getFavName();
                            const authorName = fav.getAuthorName();
                            const favID = fav.getFavID();
                            if (!confirm(`是要获取收藏夹创建者【${authorName}】用户【${favName}】的收藏夹所有的内容吗？`)) {
                                Space.isFetchingFollowersOrWatchlists = false;
                                loading.close();
                                return;
                            }
                            const input = prompt(`请选择获取的模式\n输入单个数字0为：页面自动化操作模式进行获取\n1为：网络请求模式获取，比页面自动化操作模式多3个结果参数（头像、uid、弹幕量）`);
                            if (input === null) {
                                loading.close();
                                return;
                            }
                            fileName = `${authorName}的${favName}收藏夹列表`;
                            if (input === "0") {
                                dataList = await fav.getAllDataList();
                                break;
                            }
                            if (input === "1") {
                                const favtype = fav.getFavtype();
                                let data;
                                if (favtype === "collect") {//用户收藏其他用户收藏夹
                                    data = await fav.getHttpCollectOthersDataAllList(favID);
                                } else {
                                    data = await fav.getHttpUserCreationAllDataList(favID);
                                }
                                if (!data["state"]) {
                                    Tip.error("获取失败!");
                                    loading.close();
                                    return;
                                }
                                dataList = data["dataList"];
                            } else {
                                Tip.error("出现意外的值！" + input);
                                loading.close();
                                return;
                            }
                            break;
                        case "订阅":
                            const tempTabsName = Space.subscribe.getTabsName();
                            if (tempTabsName === "标签") {
                                Space.isFetchingFollowersOrWatchlists = false;
                                loading.close();
                                Tip.error("意外的结果!");
                                return;
                            }
                            dataList = await Space.subscribe.bangumiAndCinema.getAllDataList();
                            fileName = `${userName}订阅的${tempTabsName}列表`;
                            break;
                        case "关注数":
                        case "粉丝数":
                            if (tabName === "粉丝数") {
                                if (!confirm("温馨提示，最多能获取1000(一千)个粉丝用户信息，是否继续？")) {
                                    Space.isFetchingFollowersOrWatchlists = false;
                                    loading.close();
                                    return;
                                }
                            }
                            fileName = `${userName}的用户${tabName}列表`;
                            dataList = await Space.followAndFans.getAllDataList();
                            break;
                        default:
                            loading.close();
                            alert("出现意外的参数！" + tabName);
                            Space.isFetchingFollowersOrWatchlists = false;
                            return;
                    }
                    loading.close();
                    const info = "最终结果个数：" + dataList.length;
                    Tip.success(info);
                    console.log(info);
                    console.log(dataList);
                    Util.fileDownload(JSON.stringify(dataList, null, 3), `${fileName}[${dataList.length}个].json`);
                    Space.isFetchingFollowersOrWatchlists = false;
                }
            },
            created() {
                const isBlacklistUid = Matching.arrKey(LocalData.getArrUID(), this.userUid);
                if (isBlacklistUid) {
                    setTimeout(() => {
                        this.addUidButShow = false;
                        Tip.error("当前用户是黑名单！UID=" + this.userUid);
                    }, 2500);
                }
                if (this.isHAction) {
                    console.log("当前登录账号的个人空间主页");
                } else {
                    console.log("非个人空间主页");
                }
                Space.getUserName().then(value => {
                    this.userName = value;
                });
                if (LocalData.getPrivacyMode() && this.isHAction) {
                    $(".h-inner").hide();
                    $("#navigator-fixed .n-tab-links .n-fans").hide();
                    Tip.success(`检测到当前页面是用户自己的个人空间，由于开启了隐私模式，故隐藏该信息`);
                }
            },
            watch: {
                tabsItemName(getTabName) {
                    let tempBool = false;
                    tempBool = getTabName !== "主页";
                    this.getDataListButShow = this.getAllDataListButShow = tempBool;
                },
                userName(newVal) {
                    if (Matching.arrKey(LocalData.getArrName(), newVal)) {
                        this.addNameButShow = false;
                        Tip.error("当前用户是黑名单！用户名=" + newVal);
                    }
                }
            }
        });
        window.spaceControlPanelVue = vue;
        return function () {
            return vue;
        }
    },
    addlLayoutHtml() {
        $("body").append(`<div style="position: fixed;left: 1%;top: 10%;z-index:2020;" >
    <div id="id13315" style="display: flex; flex-direction: column;">
            <button @click="addUidBut" v-show="addUidButShow">屏蔽(uid)</button>
            <button @click="addNameBut" v-show="addNameButShow">屏蔽用户名(精确)</button>
            <button @click="getDataListBut" v-show="getDataListButShow">{{getDataListButText}}</button>
            <button @click="getAllDataListBut" v-show="getAllDataListButShow">{{getAllDataListButText}}</button>
    </div>
</div>`);
    }
}
