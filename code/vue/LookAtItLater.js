const LookAtItLater = {
    returnVue() {
        const listVue = new Vue({
            el: "#lookAtItLaterListLayout",
            data: {
                searchKey: "",
                lookAtItLaterList: LocalData.getLookAtItLaterArr(),
                typeList: ["upName", "uid", "title", "bv"],
                typeListShowValue: "title",
                inputOutSelect: "导出稍后再看列表",
                inputOutSelectArr: ["导出稍后再看列表", "追加导入稍后再看列表"],
                inputEditContent: "",
                isInputSelect: false
            },
            methods: {
                renovateLayoutItemList() {//刷新列表
                    this.lookAtItLaterList = [];
                    for (const value of LocalData.getLookAtItLaterArr()) {
                        this.lookAtItLaterList.push(value);
                    }
                    Qmsg.success("已刷新了列表！");
                },
                splicingUserAddress(str) {//拼接用户地址
                    return "https://space.bilibili.com/" + str;
                },
                splicingVideoAddress(s) {//拼接视频地址
                    return "https://www.bilibili.com/video/" + s;
                },
                outLookAtItLaterArr() {//导出稍后再看列表数据
                    Util.fileDownload(JSON.stringify(LocalData.getLookAtItLaterArr(), null, 3), `稍后再看列表${Util.toTimeString()}.json`);
                },
                inputLookAtItLaterArr() {//导入稍后再看列表数据
                    let s = this.inputEditContent;
                    if (!(s.startsWith("[")) && s.endsWith("]")) {
                        alert("请填写正确的json格式！");
                        return;
                    }
                    const parse = JSON.parse(s);
                    if (parse.length === 0) {
                        alert("数组未有内容！");
                        return;
                    }
                    const tempList = LocalData.getLookAtItLaterArr();
                    try {
                        for (let v of parse) {
                            if (LookAtItLater.isVarTitleLookAtItLaterList("bv", tempList, v)) {
                                continue;
                            }
                            tempList.push({
                                title: v.title,
                                upName: v.upName,
                                uid: v.uid,
                                bv: v.bv
                            })
                        }
                    } catch (e) {
                        console.log(tempList);
                        console.log(e);
                        alert("数组异常!,异常信息已打印在控制台上！");
                        return;
                    }
                    if (!confirm("是否要保存本轮操作结果？")) {
                        return;
                    }
                    LocalData.setLookAtItLaterArr(tempList);
                    Qmsg.success("追加数据成功！");
                    console.table(tempList);
                },
                okOutOrInputClick() {
                    if (this.inputOutSelect === "导出稍后再看列表") {
                        this.outLookAtItLaterArr();
                    } else this.inputLookAtItLaterArr();
                },
                clearLookAtItLaterArr() {
                    if (!confirm("您确定要进行清空本地脚本存储的稍后再看列表数据吗，清空之后无法复原，除非您有导出过清空前的数据，请谨慎考虑，是要继续执行清空操作吗？")) {
                        Qmsg.info("操作结束了.");
                        return;
                    }
                    LocalData.setLookAtItLaterArr([]);
                    this.lookAtItLaterList = [];
                    Qmsg.success("已清空本地脚本存储的稍后再看列表数据了");
                },
                listInversion() {
                    this.lookAtItLaterList.reverse();
                }
            },
            watch: {
                searchKey(newValue, oldValue) {//监听搜索关键词key
                    if (newValue === oldValue || newValue.trim() === "") {
                        return;
                    }
                    const tempList = [];
                    const type = this.typeListShowValue;
                    for (const value of LocalData.getLookAtItLaterArr()) {
                        if (!value[type].toString().includes(newValue)) {
                            continue;
                        }
                        tempList.push(value);
                    }
                    const length = tempList.length;
                    if (length === 0) {
                        Qmsg.error("未搜索到指定内容的元素");
                        return;
                    }
                    this.lookAtItLaterList = [];
                    tempList.forEach(value => this.lookAtItLaterList.push(value));
                    Qmsg.success(`已搜索到${length}个符合搜索关键词的项目！`);
                },
                inputOutSelect(newVal) {
                    if (newVal === "导出稍后再看列表") {
                        this.isInputSelect = false;
                    } else {
                        this.isInputSelect = true;
                    }
                }
            }
        })
        return function () {
            return listVue;
        };
    },
    isVarTitleLookAtItLaterList(typeV, list, data) {//判断对象是否有相同的指定属性的值
        for (const v of list) {
            if (!(v[typeV] === data[typeV])) {
                continue;
            }
            return true;
        }
        return false;
    },
    addLookAtItLater(data) {//添加视频到稍后再看列表流程
        if (!confirm(`是要将【${data["title"]}】添加进稍后再看列表吗？`)) {
            return;
        }
        const arr = LocalData.getLookAtItLaterArr();
        for (const v of arr) {
            const tempTitle = data["title"];
            if (v["title"] === tempTitle) {
                alert(`您已添加该视频【${tempTitle}】！故本轮不添加进去！`);
                return;
            }
        }
        arr.push(data);
        LocalData.setLookAtItLaterArr(arr);
        Qmsg.success("添加成功！")
        alert(`已添加视频【${data["title"]}】至稍后再看列表！`);
    }
}