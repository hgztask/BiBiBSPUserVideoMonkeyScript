const Watched = {
    dataVue: {
        watchedList: LocalData.getWatchedArr(),//已观看视频个数,

    },
    addWatched(data) {//添加视频到已观看列表流程
        if (!confirm(`是要将【${data["title"]}】添加进已观看列表吗？`)) {
            return;
        }
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
        Qmsg.success("添加成功")
        alert(`已添加视频【${data["title"]}】至已观看列表！`);
    }
}