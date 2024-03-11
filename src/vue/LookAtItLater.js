//{"weight":2}
const LookAtItLater = {
    returnVue() {
        const listVue = new Vue({
            el: "#lookAtItLaterListLayout",
            data: {
                subThis: null,
                lookAtItLaterList: LocalData.getLookAtItLaterArr(),
                typeList: ["upName", "uid", "title", "bv"],
                inputOutSelect: "导出稍后再看列表",
                inputOutSelectArr: ["导出稍后再看列表", "导入稍后再看列表"],
                inputEditContent: "",
                isInputSelect: false,
                isAddToInput: true,
                isAddToInputTxt: "追加导入"
            },
            methods: {
                addVideoItemDataBut() {
                    //TODO 后续开发
                    alert("未开发");
                },
                setSubThis(val) {
                    this.subThis = val;
                },
                searchKey(newValue, oldValue) {
                    if (newValue === oldValue || newValue === "") return;
                    const tempList = [];
                    for (const value of LocalData.getLookAtItLaterArr()) {
                        if (!value[this.subThis.tempFindListType].toString().includes(newValue)) {
                            continue;
                        }
                        tempList.push(value);
                    }
                    const length = tempList.length;
                    if (length === 0) {
                       Tip.error("未搜索到指定内容的元素");
                        return;
                    }
                    this.subThis.showList = [];
                    tempList.forEach(value => this.subThis.showList.push(value));
                    Tip.success(`已搜索到${length}个符合搜索关键词的项目！`);
                },
                outLookAtItLaterArr() {//导出稍后再看列表数据
                    Util.fileDownload(JSON.stringify(LocalData.getLookAtItLaterArr(), null, 3), `稍后再看列表${Util.toTimeString()}.json`);
                },
                isStringArray(strArray) {
                    if (strArray.startsWith("[") && strArray.endsWith("]")) {
                        const parse = JSON.parse(strArray);
                        if (parse.length === 0) {
                            Tip.error("数组未有内容！");
                            return null;
                        }
                        return parse;
                    }
                    Tip.error("内容不是json数组！");
                    return null;
                },
                inputAddToLookAtItLaterArr() {//追加导入稍后再看列表数据
                    let s = this.inputEditContent;
                    const parse = this.isStringArray(s);
                    if (parse === null) return false;
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
                        return false;
                    }
                    if (!confirm("是否要保存本轮追加操作结果？")) {
                        return false;
                    }
                    LocalData.setLookAtItLaterArr(tempList);
                    Tip.success("追加数据成功！");
                    console.table(tempList);
                    return true;
                },
                inputCoverLookAtItLaterArr() {//覆盖导入稍后再看列表数据
                    let s = this.inputEditContent;
                    const parse = this.isStringArray(s);
                    if (parse === null) return false;
                    const isKeyArr = ["upName", "uid", "title", "bv"];
                    for (const value of parse) {
                        if (Util.hasAllProperties(value, isKeyArr)) {
                            continue;
                        }
                        alert(`数组内容对应的项目缺少了相关属性\n项目：\n${JSON.stringify(value)}`);
                        return false;
                    }
                    if (!confirm("是否要保存本轮覆盖操作结果？")) {
                        return false;
                    }
                    LocalData.setLookAtItLaterArr(parse);
                    Tip.success("覆盖数据成功！");
                    console.table(parse);
                    return true;
                },
                renovateLayoutItemList() {
                    this.subThis.showList = LocalData.getLookAtItLaterArr();
                },
                okOutOrInputClick() {
                    if (this.inputOutSelect === "导出稍后再看列表") {
                        this.outLookAtItLaterArr();
                        return;
                    }
                    if (!confirm(`是要执行${this.isAddToInputTxt}吗？`)) return;
                    let loop = false;
                    if (this.isAddToInput) {//追加
                        loop = this.inputAddToLookAtItLaterArr();
                    } else {
                        loop = this.inputCoverLookAtItLaterArr();//覆盖
                    }
                    if (loop === true) {
                        this.renovateLayoutItemList();
                    }
                },
                clearLookAtItLaterArr() {
                    if (!confirm("您确定要进行清空本地脚本存储的稍后再看列表数据吗，清空之后无法复原，除非您有导出过清空前的数据，请谨慎考虑，是要继续执行清空操作吗？")) return;
                    LocalData.setLookAtItLaterArr([]);
                    this.subThis.showList = this.lookAtItLaterList = [];
                    Tip.success("已清空本地脚本存储的稍后再看列表数据");
                },
                getItemFindIndex(data) {
                    const index = this.lookAtItLaterList.findIndex(value => value === data);
                    if (index === -1) {
                        Tip.error(`查找列表中指定item失败!-1`);
                        return null;
                    }
                    if (!confirm(`是要对 ${data.title} 选项进行操作吗？\nbv:${data.bv}`)) {
                        return null;
                    }
                    return index;
                },
                delListItem(data) {
                    const index = this.getItemFindIndex(data);
                    if (index === null) return;
                    this.lookAtItLaterList.splice(index, 1);
                    const isKeyArr = ["upName", "uid", "title", "bv"];
                    const tempLookAtItLaterArr = LocalData.getLookAtItLaterArr();
                    const tempIndex = tempLookAtItLaterArr.findIndex(value => Util.objEquals(value, data, isKeyArr));
                    if (tempIndex === -1) {
                        Tip.error("查找数据组列表中要删除的item失败！-1");
                        return;
                    }
                    tempLookAtItLaterArr.splice(tempIndex, 1);
                    LocalData.setLookAtItLaterArr(tempLookAtItLaterArr);
                    Tip.success(`已删除 ${data.title} 选项，bv=${data.bv}`);
                },
                /**
                 *
                 * @param {Object}item
                 * @param {string}key
                 * @param {string}keyName
                 * @param {string|number}value
                 */
                setListItem(item, key, keyName, value) {
                    let input = prompt(`原${keyName}为=${value}\n修改${keyName}为`, value);
                    if (input === null) return;
                    input = input.trim();
                    if (input.length < 1) {
                        Tip.error("输入的字符不可小于1！");
                        return;
                    }
                    if (value === input) {
                        Tip.error("输入的值不能和原有的值相同！");
                        return;
                    }
                    if (key === "uid") {
                        if (isNaN(value)) {
                            Tip.error(`输入的uid不是一个数字！`);
                            return;
                        }
                        value = parseInt(value);
                    }
                    const tempLookAtItLaterArr = LocalData.getLookAtItLaterArr();
                    const isKeyArr = ["upName", "uid", "title", "bv"];
                    const tempIndex = tempLookAtItLaterArr.findIndex(value => Util.objEquals(value, item, isKeyArr));
                    if (tempIndex === -1) {
                        Tip.error("查找数据组列表中要修改的item失败！-1");
                        return;
                    }
                    item[key] = input;
                    tempLookAtItLaterArr.splice(tempIndex, 1, item);
                    LocalData.setLookAtItLaterArr(tempLookAtItLaterArr);
                    const tip = `已将${keyName}的值=${value}\n改成=${input}`;
                    Tip.success(tip);
                    alert(tip);
                },
                getBWebLookAtItLaterListBut() {
                    //TODO 待开发
                    debugger;
                    alert("待开发");
                    return;
                    const se = LocalData.getSESSDATA();
                    if (se === null) {
                        alert("未设置SESSDATA！");
                        return;
                    }
                    const promise = HttpUtil.getLookAtItLater(se);
                    promise.then(value => {
                        console.log(value);
                    }).catch(reason => {
                        console.log(reason);
                    });
                }
            },
            watch: {
                inputOutSelect(newVal) {
                    if (newVal === "导出稍后再看列表") {
                        this.isInputSelect = false;
                    } else {
                        this.isInputSelect = true;
                    }
                },
                isAddToInput(newVal) {
                    if (newVal) {
                        this.isAddToInputTxt = "追加导入";
                    } else {
                        this.isAddToInputTxt = "覆盖导入";
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
        if (!confirm(`是要将【${data["title"]}】添加进稍后再看列表吗？`)) return;
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
        Tip.success("添加成功！")
        alert(`已添加视频【${data["title"]}】至稍后再看列表！`);
    }
}
