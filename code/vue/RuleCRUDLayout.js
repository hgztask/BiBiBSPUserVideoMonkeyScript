//TODO 该页面后续开发
const RuleCRUDLayout = {
    returnVue() {
        const vue = new Vue({
            el: "#ruleCRUDLayout",
            data: {
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
                    const content = $("#inputTextAreaModel").val();
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
                }
            },
            watch: {}
        });
        return function () {
            return vue;
        }
    }
}