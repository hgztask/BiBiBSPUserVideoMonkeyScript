//TODO 该页面后续开发
const RuleCRUDLayout = {
    returnVue() {
        const vue = new Vue({
            el: "#ruleCRUDLayout",
            data: {
                modelList: {
                    single: "单个",
                    batch: "批量"
                },
                ruleEditBox: "",//规则编辑框内容
                model: "single",
                isSingleShow: true,//是否对的单个相关按钮进行显示处理
                isBatchShow: false,//是否对批量相关按钮进行显示处理
                ruleKeyList: {
                    userNameArr: "用户名黑名单模式(精确匹配)",
                    userNameKeyArr: "用户名黑名单模式(模糊匹配)",
                    userUIDArr: "用户uid黑名单模式(精确匹配)",
                    userWhiteUIDArr: "用户uid白名单模式(精确匹配)",
                    titleKeyArr: "标题黑名单模式(模糊匹配)",
                    titleKeyCanonicalArr: "标题黑名单模式(正则匹配)",
                    commentOnKeyArr: "评论关键词黑名单模式(模糊匹配)",
                    contentOnKeyCanonicalArr: "评论关键词黑名单模式(正则匹配)",
                    fanCardArr: "粉丝牌黑名单模式(精确匹配)",
                    contentColumnKeyArr: "专栏关键词内容黑名单模式(模糊匹配)",
                    dynamicArr: "动态关键词内容黑名单模式(模糊匹配)",
                },
                videoRuleList: {
                    filterSMin: "时长最小值(单位秒)",
                    filterSMax: "时长最大值(单位秒)",
                    broadcastMin: "播放量最小值",
                    broadcastMax: "播放量最大值",
                    barrageQuantityMin: "弹幕量最小值",
                    barrageQuantityMax: "弹幕量最大值"
                },
                videoRuleValueInput: "",
                videoSelectValue: "filterSMin",
                defaultSelect: "userUIDArr",//当前下拉框选中的值
            },
            methods: {
                add() {
                    const ruleType = this.defaultSelect;
                    const ruleName = this.ruleKeyList[ruleType];
                    if (ruleName === undefined || ruleName === null) {
                        Qmsg.error('出现了意外的类型bug:155532');
                        return;
                    }
                    UrleCrud.addShow(ruleType, ruleName)
                },
                addAll() {
                    const ruleType = this.defaultSelect;
                    const ruleName = this.ruleKeyList[ruleType];
                    if (ruleName === undefined || ruleName === null) {
                        Qmsg.error('出现了意外的类型bug:155533');
                        return;
                    }
                    const content = this.ruleEditBox;
                    if (content === null) return;
                    if (content === "") {
                        Qmsg.error("请输入正确的内容！");
                        return;
                    }
                    UrleCrud.addAllShow(ruleType, ruleName, content);
                },
                del() {
                    const ruleType = this.defaultSelect;
                    const ruleName = this.ruleKeyList[ruleType];
                    if (ruleName === undefined || ruleName === null) {
                        Qmsg.error('出现了意外的类型bug:155534');
                        return;
                    }
                    UrleCrud.delShow(ruleType, ruleName);
                },
                delItem() {
                    const ruleType = this.defaultSelect;
                    const ruleName = this.ruleKeyList[ruleType];
                    if (ruleName === undefined || ruleName === null) {
                        Qmsg.error('出现了意外的类型bug:155535');
                        return;
                    }
                    UrleCrud.delItemShow(ruleType, ruleName);
                },
                findKey() {
                    const ruleType = this.defaultSelect;
                    const ruleName = this.ruleKeyList[ruleType];
                    if (ruleName === undefined || ruleName === null) {
                        Qmsg.error('出现了意外的类型bug:155536');
                        return;
                    }
                    UrleCrud.findKeyShow(ruleType, ruleName);
                },
                okVideoSelectBut() {//确定时长播放量弹幕
                    const videoSelectType = this.videoSelectValue;
                    const videoSelectName = this.videoRuleList[videoSelectType];
                    const contentInput = this.videoRuleValueInput;
                    if (contentInput === "") return;
                    Util.setData(videoSelectType, parseInt(contentInput));
                    const info = `已设置${videoSelectName}的具体值【${contentInput}】，为0则不生效`;
                    Print.ln(info);
                    Qmsg.success(info);
                }
            },
            watch: {
                model(newVal, oldVal) {
                    if (newVal === oldVal) return;
                    if (newVal === "single") {
                        this.isBatchShow = false;
                        this.isSingleShow = true;
                    } else {
                        this.isBatchShow = true;
                        this.isSingleShow = false;
                    }
                }
            }
        });
        return function () {
            return vue;
        }
    }
}