const Watched = {
    WatchedListVue() {
        return new Vue({
            el: "#watchedListLayout",
            data: {
                subThis: null,
                watchedList: LocalData.getWatchedArr(),
                typeList: ["upName", "uid", "title", "bv"],
            },
            methods: {
                setSubThis(val) {
                    this.subThis = val;
                },
                searchKey(newValue, oldValue) {
                    if (newValue === oldValue || newValue === "") return;
                    const tempList = [];
                    for (const value of LocalData.getWatchedArr()) {
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
                },
                clearWatchedArr() {
                    if (!confirm("您确定要进行清空本地脚本存储的已观看列表数据吗，清空之后无法复原，除非您有导出过清空前的数据，请谨慎考虑，是要继续执行清空操作吗？")) return;
                    LocalData.setWatchedArr([]);
                    this.subThis.showList = this.lookAtItLaterList = [];
                    Tip.success("已清空本地脚本存储的已观看列表数据");
                },
                renovateLayoutItemList() {
                    this.subThis.showList = LocalData.getWatchedArr();
                },
                delListItem() {
                    //TODO 待开发
                },
                setListItem() {
                    //TODO 待开发
                },
            }
        })
    },
    addWatched(data) {//添加视频到已观看列表流程
        if (!confirm(`是要将【${data["title"]}】添加进已观看列表吗？`)) return;
        const arr = LocalData.getWatchedArr();
        for (const v of arr) {
            const tempTitle = data["title"];
            if (v["title"] === tempTitle) {
                alert(`您已添加该视频【${tempTitle}】！故本轮不添加进去！`);
                return;
            }
        }
        arr.push(data);
        LocalData.setWatchedArr(arr);
        Tip.success("添加成功")
        alert(`已添加视频【${data["title"]}】至已观看列表！`);
    }
}