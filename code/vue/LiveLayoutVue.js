//TODO 直播列表待开发
const LiveLayoutVue = {
    listOfFollowers: [],
    returnVue() {
        const vue = new Vue({
            el: "#liveLayout",
            data: {
                //关注列表
                listOfFollowers: [],
                isLoadFollowBut: true,
                findFollowListRoomKey: "",
                hRecoveryListOfFollowers: false,
                siftTypeSelect: "upName",
                siftTypeList: ["upName", "uid", "title", "roomId"],
            },
            methods: {
                joinRoomAddress(roomId) {
                    return `https://live.bilibili.com/${roomId}`;
                },
                loadFollowLst() {//加载关注列表中正在直播的用户列表api数据
                    this.isLoadFollowBut = false;
                    const sessdata = LocalData.getSESSDATA();
                    if (sessdata === null) {
                        Qmsg.error("用户未配置sessdata！");
                        return;
                    }
                    Qmsg.success("用户配置了sessdata");
                    Live.loadAddAllFollowDataList(this.listOfFollowers, sessdata).then(() => {
                        LiveLayoutVue.listOfFollowers = this.listOfFollowers;
                        this.hRecoveryListOfFollowers = true;
                        Qmsg.success(`已临时保存关注列表中正在直播的用户列表，可使用搜索对其进行筛选`);
                    });
                },
                hRecoveryListOfFollowersBut() {
                    this.listOfFollowers = LiveLayoutVue.listOfFollowers;
                    Qmsg.success(`已恢复关注中正在直播的用户列表`);
                }
            },
            watch: {
                findFollowListRoomKey(newVal) {
                    if (newVal === "") return;
                    const tempList = [];
                    for (const v of LiveLayoutVue.listOfFollowers) {
                        if (!v[this.siftTypeSelect].toString().includes(newVal)) {
                            continue;
                        }
                        tempList.push(v);
                    }
                    const tempSize = tempList.length;
                    if (tempSize === 0) {
                        Qmsg.error(`未搜索到正在直播中用户名包含关键词 ${newVal} 的用户！`);
                        return;
                    }
                    this.listOfFollowers = tempList;
                    Qmsg.success(`已搜索到${tempSize}个符合搜索关键词的项目！`);
                }
            }
        });
        return function () {
            return vue;
        }
    }
}