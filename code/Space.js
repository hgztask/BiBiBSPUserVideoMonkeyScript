const Space = {
    isFetchingFollowersOrWatchlists: false,//是否正在获取粉丝或关注列表
    isSpaceFollowOrFollow: function (url) {//判断url最后的地址是否是关注或粉丝参数
        let type;
        const match = /\/fans\/(.*?)\?/.exec(url);
        const split = url.split("/");
        if (match && match[1]) {
            type = match[1];
        } else {
            type = split[split.length - 1];
        }
        switch (type) {
            case "follow"://关注数
            case "fans"://粉丝
                return type;
            default:
                return null;
        }
    },
    getRealtIonList: function () {
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                const list = document.querySelectorAll("ul[class='relation-list']>*"); //获取每个项目
                if (list.length === 0) {
                    reject(null);
                    return;
                }
                clearInterval(interval);
                const userinfoList = [];
                list.forEach(value => {
                    const userInfo = {};
                    const userInfoContent = value.querySelector(".content");
                    const userAddress = userInfoContent.querySelector("a").getAttribute("href");
                    const name = userInfoContent.querySelector("a>.fans-name").textContent;
                    let desc = userInfoContent.querySelector(".desc");//个人简介
                    const fansActionText = userInfoContent.querySelector(".fans-action-text").textContent;//关注状态，如已关注，互关
                    const userImg = value.querySelector(".cover-container .bili-avatar>img").getAttribute("src");//头像
                    userInfo["name"] = name;
                    userInfo["img"] = userImg;
                    if (desc !== null) {
                        desc = desc.getAttribute("title");
                    }
                    userInfo["desc"] = desc;
                    const uid = /space\.bilibili\.com\/(\d+?)\//.exec(userAddress);
                    if (uid && uid[1]) {
                        userInfo["uid"] = uid[1];
                    } else {
                        userInfo["uid"] = userAddress;
                    }
                    userInfo["fansActionType"] = fansActionText;
                    userinfoList.push(userInfo);
                });
                resolve(userinfoList);
            }, 1000);
        });
    }
    ,
    extracted: function (loading) {
        return new Promise(resolve => {
            let dataList = [];

            function whileFunc() {
                Space.getRealtIonList().then(value => {
                    const currentInfo = `当前列表获取个数：${value.length}`;
                    Qmsg.success(currentInfo);
                    console.log(currentInfo);
                    const next = $(".be-pager-next");
                    dataList = dataList.concat(value);
                    Qmsg.success(`总列表个数：${dataList.length}`);
                    if (next.is(':hidden')) {//判断是否已经隐藏了下一页，隐藏说明没有下一页的关注列了，到头了，反之还有
                        loading.close();
                        resolve(dataList);
                        return;
                    }
                    next.click();
                    console.log("点击下一页");
                    Qmsg.info("点击下一页");
                    setTimeout(() => {
                        whileFunc();
                    }, 1000);
                }).catch(() => {
                    loading.close();
                    if (dataList.length === 0) {
                        Qmsg.error("获取失败");
                        return;
                    }
                    resolve(dataList);
                });
            }

            whileFunc();
        });
    }
}