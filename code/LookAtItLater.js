const LookAtItLater = {
    lookAtItLaterListVue() {
        return new Vue({
            el: "lookAtItLaterListLayout",
            data: {
                lookAtItLaterList: LocalData.getLookAtItLaterArr()
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