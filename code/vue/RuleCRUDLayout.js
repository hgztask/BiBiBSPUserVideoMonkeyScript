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
                    userNameArr: {name: "用户名黑名单模式(精确匹配)", size: 0},
                    userNameKeyArr: {name: "用户名黑名单模式(模糊匹配)", size: 0},
                    userUIDArr: {name: "用户uid黑名单模式(精确匹配)", size: 0},
                    userWhiteUIDArr: {name: "用户uid白名单模式(精确匹配)", size: 0},
                    titleKeyArr: {name: "标题黑名单模式(模糊匹配)", size: 0},
                    titleKeyCanonicalArr: {name: "标题黑名单模式(正则匹配)", size: 0},
                    commentOnKeyArr: {name: "评论关键词黑名单模式(模糊匹配)", size: 0},
                    contentOnKeyCanonicalArr: {name: "评论关键词黑名单模式(正则匹配)", size: 0},
                    fanCardArr: {name: "粉丝牌黑名单模式(精确匹配)", size: 0},
                    contentColumnKeyArr: {name: "专栏关键词内容黑名单模式(模糊匹配)", size: 0},
                    dynamicArr: {name: "动态关键词内容黑名单模式(模糊匹配)", size: 0},
                },
                MPSList: ["精确", "模糊", "正则"],
                defaultMPSelect: "模糊",
                debugText: "",
                debugRuleVal: "",
                debugSeC: true,
                debugATestOInput: false,
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
                outRuleSelect: "allRuleOutFIle",
                outRUleModelList: {
                    allRuleOutFIle: "全部规则到文件",
                    allRuleOutShearPlate: "全部规则到剪贴板",
                    allUIDRuleOutFIle: "全部UID规则到文件",
                    barrageShieldingRule: "b站弹幕屏蔽规则",
                    allRuleOutCloudServer: "全部规则到云端账号"
                },
                inputRuleSelect: "从下面编辑框导入全部规则",
                inputEditContent: "",
                inoutRUleModelList: ["从云端账号导入覆盖本地规则", "从下面编辑框导入全部规则", "从下面编辑框合并导入UID规则"],
                isInputEditShow: true
            },
            methods: {
                add() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                        Qmsg.error('出现了意外的类型bug:155532');
                        return;
                    }
                    UrleCrud.addShow(selectRUleItem.ruleType, selectRUleItem.ruleName)
                },
                addAll() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                        Qmsg.error('出现了意外的类型bug:155533');
                        return;
                    }
                    const content = this.ruleEditBox;
                    if (content === null) return;
                    if (content === "") {
                        Qmsg.error("请输入正确的内容！");
                        return;
                    }
                    UrleCrud.addAllShow(selectRUleItem.ruleType, selectRUleItem.ruleName, content);
                },
                delAll() {
                    const list = this.ruleKeyList;
                    let str = "";
                    for (let key in list) {
                        const name = list[key].name;
                        const size = Util.getData(key, []).length;
                        str += `规则名:${name} 个数:${size}个\n`;
                    }
                    if (!confirm(`是要全部规则吗？，以下是您的全部规则基本信息\n\n${str}`)) {
                        return;
                    }
                    const okData = {success: 0, fail: 0};
                    for (const key in this.ruleKeyList) {
                        if (Util.delData(key)) {
                            okData.success++;
                        } else {
                            okData.fail++;
                        }
                    }
                    this.updateRuleIndex();
                    alert(`删除结果:\n成功:${okData.success}\n失败:${okData.fail}`);
                },
                delItem() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                        Qmsg.error('出现了意外的类型bug:155535');
                        return;
                    }
                    UrleCrud.delItemShow(selectRUleItem.ruleType, selectRUleItem.ruleName);
                },
                delKey() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                        Qmsg.error('出现了意外的类型bug:155537');
                        return;
                    }
                    UrleCrud.delShow(selectRUleItem.ruleType, selectRUleItem.ruleName);
                },
                findKey() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                        Qmsg.error('出现了意外的类型bug:155536');
                        return;
                    }
                    UrleCrud.findKeyShow(selectRUleItem.ruleType, selectRUleItem.ruleName);
                },
                setKey() {
                    const selectRUleItem = this.getSelectRUleItem();
                    if (selectRUleItem.ruleName === undefined || selectRUleItem.ruleName === null) {
                        Qmsg.error('出现了意外的类型bug:155537');
                        return;
                    }
                    UrleCrud.setKeyShow(selectRUleItem.ruleType, selectRUleItem.ruleName);
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
                },
                getSelectRUleItem() {//返回defaultSelect中选中的规则项
                    const ruleType = this.defaultSelect;
                    const ruleName = this.ruleKeyList[ruleType].name;
                    return {ruleType: ruleType, ruleName: ruleName}
                },
                updateRuleIndex() {//更新规则的个数
                    const tempList = this.ruleKeyList;
                    for (let item in tempList) {
                        const tempSize = tempList[item].size;
                        const newSize = Util.getData(item, []).length;
                        if (tempSize === newSize) {
                            continue;
                        }
                        tempList[item].size = newSize;
                    }
                },
                getOutRuleDataFormat(space = 3) {//获取导出规则的结果内容
                    const ruleKeyList = this.ruleKeyList;
                    const data = {};
                    for (let key in ruleKeyList) {
                        const ruleName = ruleKeyList[key].name;
                        data[ruleName] = Util.getData(key, []);
                    }
                    return JSON.stringify(data, null, space);
                },
                inputRuleLocalData(json) {//导入规则内容！
                    const list = this.ruleKeyList;
                    for (let ruleKey in list) {
                        const name = list[ruleKey].name;
                        const jsonRuleList = json[name];
                        if (!jsonRuleList) {
                            continue;
                        }
                        if (jsonRuleList.length === 0) {
                            continue;
                        }
                        Util.setData(ruleKey, jsonRuleList);
                    }
                    this.updateRuleIndex();
                    alert("已导入");
                },
                outRule() {
                    const outType = this.outRUleModelList[this.outRuleSelect];
                    switch (outType) {
                        case "全部规则到文件":
                            let fileName = "规则-" + Util.toTimeString();
                            const s = prompt("保存为", fileName);
                            if (s === null) return;
                            if (!(s.includes(" ") || s === "" || s.length === 0)) fileName = s;
                            Util.fileDownload(this.getOutRuleDataFormat(), fileName + ".json");
                            break;
                        case "全部规则到剪贴板":
                            Util.copyToClip(this.getOutRuleDataFormat(0));
                            break;
                        case "全部UID规则到文件":
                            const list = LocalData.getArrUID();
                            Util.fileDownload(JSON.stringify(list, null, 3), `UID规则-${list.length}个.json`);
                            break;
                        case "全部UID规则到云端":
                            alert("暂不支持");
                            break;
                        case "全部规则到云端账号":
                            const getInfo = LocalData.AccountCenter.getInfo();
                            if (getInfo === {} || Object.keys(getInfo).length === 0) {
                                alert("请先登录在进行操作.");
                                return;
                            }
                            if (!confirm("确定要将本地规则导出到对应账号的云端上吗")) return;
                            const loading = Qmsg.loading("请稍等...");
                            $.ajax({
                                type: "POST",
                                url: `${defApi}/bilibili/shieldRule/`,
                                data: {
                                    model: "All",
                                    userName: getInfo["userName"],
                                    userPassword: getInfo["userPassword"],
                                    postData: this.getOutRuleDataFormat()
                                },
                                dataType: "json",
                                success(data) {
                                    loading.close();
                                    const message = data["message"];
                                    if (data["code"] !== 1) {
                                        Qmsg.error(message);
                                        return;
                                    }
                                    Qmsg.success(message);
                                    console.log(data["dataJson"])
                                }, error(xhr, status, error) { //请求失败的回调函数
                                    loading.close();
                                    console.log(error);
                                    console.log(status);
                                }
                            });
                            break;
                        case "b站弹幕屏蔽规则": {
                            //已经登录b站账号的前提下，打开该api
                            //https://api.bilibili.com/x/dm/filter/user
                            //即可获取到该账号下的b站云端最新的屏蔽词内容
                            //type类型
                            //0 屏蔽文本
                            //1 屏蔽正则
                            //2 屏蔽用户
                            /**
                             * filter 规则内容
                             */
                            /**
                             *opened 是否启用
                             */
                            const item = window.localStorage.getItem("bpx_player_profile");
                            if (item === null || item === undefined) {
                                alert("找不到当前账号的屏蔽设定规则，请确定进行登录了并进行加载了弹幕的屏蔽设定");
                                return;
                            }
                            const arrList = JSON.parse(item)["blockList"];
                            if (arrList === undefined || arrList === null || arrList.length === 0) {
                                alert("当前账号的屏蔽设定规则没有屏蔽设定规则哟，请确定进行登录了并加载了弹幕的屏蔽设定");
                                return;
                            }
                            const list = [];
                            for (const arrListElement of arrList) {
                                const type = arrListElement["type"];
                                const filter = arrListElement["filter"];
                                const opened = arrListElement["opened"];
                                const id = arrListElement["id"];
                                if (type === 2) {
                                    continue;
                                }
                                list.push(arrListElement);
                            }
                            Util.fileDownload(JSON.stringify(list, null, 3), "b站账号弹幕屏蔽设定规则.json");
                            break;
                        }
                    }
                },
                inputRule() {
                    const inputType = this.inputRuleSelect;
                    const content = this.inputEditContent;
                    switch (inputType) {
                        case "从云端账号导入覆盖本地规则":
                            const getInfo = LocalData.AccountCenter.getInfo();
                            if (getInfo === {} || Object.keys(getInfo).length === 0) {
                                alert("请先登录在进行操作.");
                                return;
                            }
                            if (!confirm("确定要云端账号对应的规则导入并覆盖到本地已有的规则吗？")) {
                                return;
                            }
                            const loading = Qmsg.loading("请稍等...");
                            $.ajax({
                                type: "GET",
                                url: `${defApi}/bilibili/shieldRule/`,
                                data: {
                                    userName: getInfo["userName"],
                                    userPassword: getInfo["userPassword"]
                                },
                                dataType: "json",
                                success(data) {
                                    loading.close();
                                    const message = data["message"];
                                    if (data["code"] !== 1) {
                                        Qmsg.error(message);
                                        return;
                                    }
                                    Qmsg.success(message);
                                    const time = data["data"]["time"];
                                    const ruleRes = data["data"]["ruleRes"];
                                    console.log(time);
                                    console.log(ruleRes);
                                    ruleCRUDLlayoutVue().inputRuleLocalData(ruleRes);
                                }, error(xhr, status, error) { //请求失败的回调函数
                                    loading.close();
                                    console.log(error);
                                    console.log(status);
                                }
                            });
                            break;
                        case "从下面编辑框导入全部规则":
                            if (content === "" || content === " ") {
                                alert("请填写正确的规则样式！");
                                return;
                            }
                            if (!confirm("需要注意的是，这一步操作会覆盖你当前的已有规则！您确定要导入吗？")) {
                                return;
                            }
                            let jsonRule = [];
                            try {
                                jsonRule = JSON.parse(content);
                            } catch (error) {
                                alert("内容格式错误！" + error)
                                return;
                            }
                            this.inputRuleLocalData(jsonRule);
                            break;
                        case "从下面编辑框合并导入UID规则":
                            let uidList;
                            try {
                                uidList = JSON.parse(content)
                                if (!(uidList instanceof Array)) {
                                    throw new Error("错误信息，导入的类型不是数组！");
                                }
                            } catch (e) {
                                alert("类型错误，导入的内容不是jsoN")
                                return;
                            }
                            for (let i = 0; i < uidList.length; i++) {
                                try {
                                    uidList[i] = parseInt(uidList[i]);
                                } catch (e) {
                                    alert("数组中存在非数字内容")
                                    return;
                                }
                            }
                            if (uidList.length === 0) {
                                alert("该数组长度为0！")
                                return;
                            }
                            const data = LocalData.getArrUID();
                            if (data === undefined || data === null || !(data instanceof Array) || data.length === 0) {
                                if (confirm("未检测到本地的UID规则，是否要覆盖或者直接添加？")) {
                                    LocalData.setArrUID(uidList);
                                    alert("添加成功！")
                                }
                                return;
                            }
                            let index = 0;
                            for (const v of uidList) {
                                if (data.includes(v)) {
                                    continue;
                                }
                                index++;
                                data.push(v);
                            }
                            if (index === 0) {
                                alert("内容没有变化！，可能是原先的规则里已经有了");
                                return;
                            }
                            alert(`已新增${index}个UID规则`);
                            LocalData.setArrUID(data);
                            break;
                        case "本地b站弹幕屏蔽规则":
                            alert("暂时未写")
                            break;
                        default:
                            alert(`出现超出的条件！inputType=${inputType}`);
                            break;
                    }


                },
                lookLocalRUleContent() {
                    Util.openWindowWriteContent(this.getOutRuleDataFormat(3));
                },
                lookLocalAppointRUleContent() {
                    const item = this.getSelectRUleItem();
                    if (!confirm(`是要查询${item.ruleName}的规则内容吗？`)) return;
                    const data = Util.getData(item.ruleType, []);
                    if (data.length === 0) {
                        Qmsg.info(`${item.ruleName}规则内容为空的！`);
                        return;
                    }
                    Util.openWindowWriteContent(JSON.stringify(data, null, 3));
                },
                debugRule() {
                    if (this.debugText.length === 0 || this.debugRuleVal.length === 0) {
                        Qmsg.error("请正确书写内容！");
                        return;
                    }
                    const mpSelect = this.defaultMPSelect;
                    if (this.debugSeC) {
                        if (!confirm(`当前选中的是${mpSelect}模式，是要进行调试测试吗，用于测试是否能匹配上，如匹配上说明，对应规则可以被处理(屏蔽)`)) {
                            return;
                        }
                    }
                    let loop = false;
                    switch (mpSelect) {
                        case "精确":
                            loop = Matching.arrKey([this.debugRuleVal], this.debugText);
                            break;
                        case "模糊":
                            loop = Matching.arrContent([this.debugRuleVal], this.debugText) || false;
                            break;
                        case "正则":
                            loop = Matching.arrContentCanonical([this.debugRuleVal], this.debugText) || false;
                            break;
                        default:
                            Qmsg.error("出现了意外的值!" + mpSelect);
                            break;
                    }
                    if (loop) {
                        Qmsg.success(`规则测试匹配成功!${mpSelect}模式`);
                    } else {
                        Qmsg.error(`规则测试匹配失败了!${mpSelect}模式`);
                    }
                },
                okDebugRule() {
                    this.debugRule();
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
                },
                inputRuleSelect(newVal, oldVal) {
                    if (newVal === oldVal) return;
                    this.isInputEditShow = newVal !== "从云端账号导入覆盖本地规则";
                },
                debugSeC(newVal) {
                    if (newVal) this.debugATestOInput = false;
                },
                debugATestOInput(newVal) {
                    if (newVal) this.debugSeC = false;
                },
                debugRuleVal() {
                    if (!this.debugATestOInput) return;
                    this.debugRule();
                }
            }
        });
        return function () {
            return vue;
        }
    }
}