const HomePageLayoutVue = {
    getVideo_zoneList() {
        return Home.data.video_zoneList;
    },
    getChannel_idList() {
        return frequencyChannel.data.channel_idList;
    },
    returnVue() {
        const vue = new Vue({
            el: "#homePageLayout",
            data: {
                isMainVideoListCheckbox: LocalData.getIsMainVideoList(),
                pushTypeSelect: Home.getPushType(),
                pushTypeList: ["分区", "频道"],
                sort_typeSelect: "hot",
                sort_typeList: {hot: "近期热门", view: "播放最多(近30天投稿)", new: "最新投稿"},
                isIdCheckbox: false,
                //是否要显示频道的一级select
                isChannelSelect: false,
                showListSelect: 0,
                showList: {},
            },
            methods: {
                findBut() {//TODO 待测试
                    const inputs = prompt("查询的类型关键词");
                    if (inputs === null) return;
                    if (inputs === "" || inputs.includes(" ")) {
                       Tip.error("请正确输入内容");
                        return;
                    }
                    const listMap = this.showList;
                    if (this.isIdCheckbox) {
                        if (inputs in listMap) {
                            this.showListSelect = inputs;
                            Tip.success(`通过ID的方式找到该值！id=${inputs} 值=${listMap[inputs]}`);
                            return;
                        }
                    } else {
                        for (let v in listMap) {//通过遍历字典中的value，该值包含于tempContent时成立
                            if (!listMap[v].includes(inputs)) continue;
                            this.showListSelect = v;
                            Tip.success(`通过value找到该值！=${inputs}`);
                            return;
                        }
                    }
                    Tip.error("未找到该值！");
                },
                okBut() {
                    const pushType = this.pushTypeSelect;
                    const showListSelect = parseInt(this.showListSelect);
                    let tip;
                    if (pushType === "分区") {
                        tip = `选择了分区${this.showList[showListSelect]} 进行指定推送 id=${showListSelect}`;
                        LocalData.setVideo_zone(showListSelect);
                    } else {
                        const temp = this.sort_typeSelect;
                        tip = `选择了${this.sort_typeList[temp]}的频道${this.showList[showListSelect]}进行指定推送 id=${showListSelect}`;
                        frequencyChannel.setChannel_id(showListSelect);
                        frequencyChannel.setSort_type(temp);
                    }
                    Home.setPushType(pushType);
                    alert("已设置！\n" + tip)
                }
            },
            watch: {
                isMainVideoListCheckbox(newVal) {
                    LocalData.setIsMainVideoList(newVal);
                },
                pushTypeSelect(newVal) {
                    if (newVal === "分区") {
                        this.showList = HomePageLayoutVue.getVideo_zoneList();
                        this.isChannelSelect = false;
                        this.showListSelect = LocalData.getVideo_zone();
                    } else {
                        this.showList = HomePageLayoutVue.getChannel_idList();
                        this.isChannelSelect = true;
                        this.showListSelect = frequencyChannel.getChannel_id();
                        this.sort_typeSelect = frequencyChannel.getSort_type();
                    }
                }
            },
            created() {
                switch (Home.getPushType()) {
                    case "频道":
                        this.sort_typeSelect = frequencyChannel.getSort_type();
                        this.showList = HomePageLayoutVue.getChannel_idList();
                        this.showListSelect = frequencyChannel.getChannel_id();
                        this.isChannelSelect = true;
                        break;
                    default:
                        this.showList = HomePageLayoutVue.getVideo_zoneList();
                        this.showListSelect = LocalData.getVideo_zone();
                        this.sort_typeSelect = frequencyChannel.getSort_type();
                        break;
                }
            }
        });
        return function () {
            return vue;
        }
    }
}