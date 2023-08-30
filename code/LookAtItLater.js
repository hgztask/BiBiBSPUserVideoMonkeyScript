const LookAtItLater = {
    lookAtItLaterListVue() {
        return new Vue({
            el: "#lookAtItLaterListLayout",
            data: {
                searchKey: "",
                lookAtItLaterList: LocalData.getLookAtItLaterArr()
            },
            methods: {
                renovateLayoutItemList() {//刷新列表
                    this.lookAtItLaterList.length = 0;
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
                }
            },
            watch: {
                searchKey(newValue, oldValue) {//监听搜索关键词key
                    if (newValue === oldValue || newValue.trim() === "") {
                        return;
                    }
                    this.lookAtItLaterList.length = 0;
                    for (const value of LocalData.getLookAtItLaterArr()) {
                        if (!value.title.includes(newValue)) {
                            continue;
                        }
                        this.lookAtItLaterList.push(value);
                    }
                    const length = this.lookAtItLaterList.length;
                    if (length === 0) {
                        Qmsg.error("未搜索到指定内容的元素");
                        return;
                    }
                    Qmsg.success(`已搜索到${length}个符合搜索关键词的项目！`);
                }
            }
        })
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