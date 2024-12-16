import elUtil from "../utils/elUtil.js";
import shielding from "../model/shielding.js";

const isVideoPlayPage = (url) => {
    return url.includes("www.bilibili.com/video");
}


// 获取右侧视频列表
const getGetTheVideoListOnTheRight = async () => {
    //等待，直到列表中封面加载完
    await elUtil.findElementUntilFound(".video-page-card-small .b-img img");
    const elList = await elUtil.findElementsUntilFound(".video-page-card-small", {interval: 50})
    const list = [];
    for (let el of elList) {
        try {
            const elInfo = el.querySelector(".info");
            const title = elInfo.querySelector(".title").title;
            const name = elInfo.querySelector(".upname .name").textContent.trim();
            const userUrl = elInfo.querySelector(".upname>a").href;
            const uid = elUtil.getUrlUID(userUrl);
            list.push({
                title,
                userUrl,
                name,
                uid,
                el,
                videoUrl:el.querySelector(".info>a").href,
                insertionPositionEl: el.querySelector(".playinfo"),
                explicitSubjectEl: elInfo
            });
        } catch (e) {
            console.error("获取右侧视频列表失败:", e);
        }
    }
    return list;
}

// 执行屏蔽右侧视频列表
const startShieldingVideoList = () => {
    getGetTheVideoListOnTheRight().then((videoList) => {
        for (let videoData of videoList) {
            if (shielding.shieldingVideoDecorated(videoData)) {
                continue;
            }
            shielding.addVideoBlockButton({data: videoData, maskingFunc: startShieldingVideoList});
        }
    })
}

/**
 *  查找右侧视频列表的展开按钮并绑定事件
 *  延迟3秒执行
 *  视频页中如果点击了，右侧视频列表加载对应视频，绑定的事件依旧生效，所以不用重复设置事件
 */
const findTheExpandButtonForTheListOnTheRightAndBindTheEvent = () => {
    setTimeout(() => {
        elUtil.findElementUntilFound(".rec-footer", {interval: 2000}).then((el) => {
            console.log("找到右侧视频列表的展开按钮");
            console.log(el);
            el.addEventListener("click", () => {
                startShieldingVideoList();
            })
        })
    }, 3000);
}



//视频播放模块
export default {
    isVideoPlayPage,
    startShieldingVideoList,
    findTheExpandButtonForTheListOnTheRightAndBindTheEvent,
}
