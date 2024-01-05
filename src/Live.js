//直播
const Live = {
    shield(list) {
        for (let v of list) {
            const userName = v.getAttribute("data-uname");
            const uid = v.getAttribute("data-uid");
            const content = v.getAttribute("data-danmaku");
            let fansMeda = "这是个个性粉丝牌子";
            try {
                fansMeda = v.querySelector(".fans-medal-content").text;
            } catch (e) {
            }
            if (startPrintShieldNameOrUIDOrContent(v, new ContentCLass()
                .setUpName(userName)
                .setUid(uid)
                .setContent(content))) {
                Tip.info("屏蔽了言论！！");
                continue;
            }
            if (Remove.fanCard(v, fansMeda)) {
                Tip.printLn("已通过粉丝牌【" + fansMeda + "】屏蔽用户【" + userName + "】 言论=" + content);
                continue;
            }
            const jqE = $(v);
            if (Util.isEventJq(jqE, "mouseover")) {
                continue;
            }
            jqE.mouseenter((e) => {
                const domElement = e.delegateTarget;
                Util.showSDPanel(e, {
                    upName: domElement.getAttribute("data-uname"),
                    uid: domElement.getAttribute("data-uid")
                });
            });
        }
    },
    getFollowDataList(sessdata, page = 1) {
        const followDataList = [];
        return new Promise((resolve, reject) => {
            const promise = HttpUtil.getUsersFollowTheLiveList(sessdata, page);
            promise.then(res => {
                const body = JSON.parse(res.body);
                const code = body["code"];
                const message = body["message"];
                if (code !== 0) {
                    const info = "获取当前用户正在直播的用户错误！" + message;
                    Tip.error(info);
                    console.log(info);
                    return;
                }
                /**
                 *
                 * @type {Array}
                 */
                const list = body["data"]["list"];
                if (list === undefined || list === null || list.length === 0) {
                    const info = "未获取到当前用户关注的直播用户列表信息";
                    Tip.info(info);
                    console.log(info);
                    return;
                }
                let live_status = -1;
                for (let v of list) {
                    /**
                     *直播状态
                     * 0：未开播
                     * 1：直播中
                     * 2：轮播中
                     */
                    live_status = v["live_status"];
                    if (live_status === 0) {//结束，说明后面的都是未开播的item
                        break;
                    }
                    if (live_status !== 1) {//不等于1的，也就是除直播之外的都跳过本轮循环
                        continue;
                    }
                    followDataList.push(new LiveRoom()
                        .setUpName(v["uname"])
                        .setUid(v["uid"])
                        .setTitle(v["title"])
                        .setRoomId(v["roomid"])
                        .setFace(v["face"]));
                }
                resolve({live_status: live_status, dataList: followDataList});
            }).catch(err => {
                reject(err);
                Tip.error("出现错误");
                Tip.error(err);
            });
        });
    },
    async loadAddAllFollowDataList(dataList, sessdata) {
        let page = 1;
        do {
            const data = await this.getFollowDataList(sessdata, page);
            page++;
            const liveStatus = data.live_status;
            if (liveStatus === 1) {
                Util.mergeArrays(dataList, data.dataList);
                await Util.Thread.sleep(500);
                Tip.success(`正在获取关注列表中正在直播列表`);
                continue;
            }
            if (liveStatus === 0 || liveStatus === -1) {
                Util.mergeArrays(dataList, data.dataList);
                break;
            }
        } while (true);
        Tip.success(`已获取完成！`);
        return Promise.resolve();
    },
    getOthersAreWorkingLiveDataList(parent_id, id, page = 1) {//获取其他正在直播中的直播列表
        const tempList = [];
        const data = {
            //已经没有内容时设置为true
            partitionBool: false,
            dataList: tempList
        };
        return new Promise((resolve, reject) => {
            const promise = HttpUtil.getLiveList(parent_id, id, page, "");
            promise.then(res => {
                const body = res.bodyJson;
                const code = body["code"];
                const message = body["message"];
                data.message = message;
                data.code = code;
                if (code !== 0) {
                    data["info"] = "获取直播分区信息错误！" + message;
                    reject(data);
                    return;
                }
                const list = body["data"]["list"];
                for (let v of list) {
                    const roomid = v["roomid"];
                    const title = v["title"];
                    const uname = v["uname"];
                    const uid = v["uid"];
                    if (Matching.arrKey(LocalData.getArrUID(), uid)) {
                        const tempInfo = `已通过UID，过滤用户【${uname}】 uid【${uid}】`;
                        Tip.printLn(tempInfo);
                        Tip.success(tempInfo);
                        continue;
                    }
                    const face = v["face"];
                    const cover = v["cover"];//封面
                    const system_cover = v["system_cover"];//关键帧
                    const parent_name = v["parent_name"];//父级分区
                    const area_name = v["area_name"];//子级分区
                    tempList.push(new LiveRoom()
                        .setUpName(uname)
                        .setUid(uid)
                        .setFace(face)
                        .setTitle(title)
                        .setRoomId(roomid)
                        .setFrontCover(cover)
                        .setVideoFrame(system_cover)
                    )
                }
                if (list.length < 20) {
                    data.partitionBool = true;
                }
                resolve(data);//因一次加载最多20个，小于说明后面没有开播用户了,当小于时可以考虑加入隐藏加载更多，反之显示
            }).catch(err => {
                data.errorText = "错误信息" + err;
                data.err = err;
                reject(data);
            });
        })
    },
    //直播间
    liveDel: {
        delLiveRoom() {//过滤直播间列表，该功能目前尚未完善，暂时用着先
            const list = document.getElementsByClassName("index_3Uym8ODI");
            for (let v of list) {
                const title = v.getElementsByClassName("Item_2GEmdhg6")[0].textContent.trim();
                const type = v.getElementsByClassName("Item_SI0N7ecx")[0].textContent;//分区类型
                const name = v.getElementsByClassName("Item_QAOnosoB")[0].textContent.trim();
                const index = v.getElementsByClassName("Item_3Iz_3buh")[0].textContent.trim();//直播间人气
                //直播分区时屏蔽的类型，比如在手游直播界面里的全部中，会屏蔽对应的类型房间号
                if (["和平精英"].includes(type)) {
                    v.remove();
                    Tip.printLn("已屏蔽直播分类为=" + type + " 的直播间 用户名=" + name + " 房间标题=" + title + " 人气=" + index)
                    continue;
                }
                if (Remove.name(v, name)) {
                    Tip.printLn("已通过用户名=" + name + " 屏蔽直播间 直播分类=" + type + " 房间标题=" + title + " 人气=" + index)
                    continue;
                }
                const nameKey = Remove.nameKey(v, name);
                if (nameKey != null) {
                    Tip.printLn("用户名=" + name + " 包含了=屏蔽词=" + nameKey + " 故屏蔽该直播间 分类=" + type + " 房间标题=" + title + " 人气=" + index)
                    continue;
                }
                if (Remove.titleKey(v, title)) {
                    Tip.printLn("已通过直播间标题=【" + title + "】屏蔽该房间 用户名=" + name + " 分类=" + type + " 人气=" + index);
                }
            }
        }
    }
};