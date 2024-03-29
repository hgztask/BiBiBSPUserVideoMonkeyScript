const Watchlater = {
    initLayout() {
        const panel = layout.panel.getHoverball("获取稍后再看列表数据", "32%", "5%");
        const paneLooked = layout.panel.getHoverball("获取稍后再看列表数据(已观看)", "42%", "5%");
        const leadingInLookAtItLaterBut = layout.panel.getHoverball("导入脚本的稍后再看列表", "52%", "5%");
        const $body = $("body");
        $body.append(panel);
        $body.append(paneLooked);
        $body.append(leadingInLookAtItLaterBut);
        panel.click(() => {
            if (!confirm("仅获取页面可见的列表了内容并导出为json，是要继续吗？")) {
                return;
            }
            Util.bufferBottom();
            setTimeout(() => {
                const dataList = this.getDataList();
                if (dataList.length === 0) {
                    alert("未有相关内容！");
                    return;
                }
                const info = `已获取到${dataList.length}个稍后再看的记录`;
                Qmsg.success(info);
                Print.ln(info);
                alert(info);
                Util.fileDownload(JSON.stringify(dataList, null, 3), `b站用户的稍后再看记录${dataList.length}个.json`);
            }, 1550);
        });
        paneLooked.click(() => {
            if (!confirm("仅获取页面可见的列表中【已观看】了的内容并导出为json，是要继续吗？")) {
                return;
            }
            Util.bufferBottom();
            ;
            setTimeout(() => {
                const dataList = this.getDataList(true);
                if (dataList.length === 0) {
                    alert("未有相关内容！");
                    return;
                }
                const info = `已获取到${dataList.length}【已观看的】稍后再看的记录`;
                Qmsg.success(info);
                Print.ln(info);
                alert(info);
                Util.fileDownload(JSON.stringify(dataList, null, 3), `b站用户的【已观看】稍后再看记录${dataList.length}个.json`);
            }, 1550);
        });
        leadingInLookAtItLaterBut.click(() => {
            if (!confirm("是要获取页面可见的列表了内容并导入到脚本中的稍后再看列表吗，是要继续吗？")) {
                return;
            }
            Util.bufferBottom();
            setTimeout(() => {
                const dataList = this.getDataList();
                if (dataList.length === 0) {
                    alert("未有相关内容！");
                    return;
                }
                const lookAtItLaterArr = LocalData.getLookAtItLaterArr();
                let tempIndex = 0;
                for (let v of dataList) {
                    if (LookAtItLater.isVarTitleLookAtItLaterList("title", lookAtItLaterArr, v)) {
                        continue;
                    }
                    if (v.videoAddress === null) {
                        Qmsg.error(`title=${v.title}的视频出现问题，可能是失效了，故排除该视频`);
                        continue;
                    }
                    lookAtItLaterArr.push({
                        upName: v.upName,
                        uid: v.uid,
                        title: v.title,
                        bv: Util.Str.lastForwardSlashEnd(v.videoAddress)
                    });
                    tempIndex++;
                }
                console.log("脚本");
                console.table(dataList);
                if (tempIndex === 0) {
                    alert(`脚本的稍后再看列表包含了当前列表项目或者未获取到！`);
                    return;
                }

                alert(`已成功导入了${tempIndex}个内容到脚本的稍后再看列表！`);
                LocalData.setLookAtItLaterArr(lookAtItLaterArr);
                returnVue.renovateLayoutItemList();
            }, 1550);


        });
    },
    /**
     *
     * @param isV 是否只获取已观看的项目
     * @returns {*[]}
     */
    getDataList(isV = false) {
        const eList = document.querySelectorAll(".list-box>span>*");
        const dataList = [];
        eList.forEach(v => {
            const data = {};
            const videoInfo = v.querySelector(".av-about");
            data["title"] = videoInfo.querySelector(".t").textContent.trim();
            const userInfo = videoInfo.querySelector(".info.clearfix>.user");
            data["upName"] = userInfo.querySelector("span").textContent;
            const userAddress = userInfo.getAttribute("href");
            data["uid"] = Util.getSubWebUrlUid(userAddress);
            data["userAddress"] = userAddress;
            data["videoAddress"] = videoInfo.querySelector(".t").getAttribute("href");
            data["userImg"] = userInfo.querySelector(".lazy-img>img").getAttribute("src");
            if (isV) {
                const looked = v.querySelector(".looked");
                if (looked === null) {
                    return;
                }
                dataList.push(data);
                return;
            }
            dataList.push(data);
        });
        return dataList;
    }
}