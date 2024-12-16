import elUtil from "../utils/elUtil.js";
import shielding from "../model/shielding.js";
// 判断是否为收藏的视频播放页
const iscCollectionVideoPlayPage = (url) => {
    return url.includes("www.bilibili.com/list/ml")
}


// 获取右侧视频列表
const getGetTheVideoListOnTheRight = async () => {
    const elList = await elUtil.findElementsUntilFound(".recommend-list-container>.video-card");
    /**
     *
     * @type {[{}]}
     */
    const list = [];
    for (let el of elList) {
        const title = el.querySelector(".title").title;
        const name = el.querySelector(".name").textContent.trim();
        const userUrl = el.querySelector(".upname").href;
        const uid = elUtil.getUrlUID(userUrl);
        list.push({
            title,
            name,
            userUrl,
            videoUrl: el.querySelector(".info>a").href,
            uid,
            el,
            insertionPositionEl: el.querySelector(".playinfo"),
            explicitSubjectEl: el.querySelector(".info")
        })
    }
    return list;
}


//开始执行屏蔽右侧视频列表
const startShieldingVideoList = () => {

    getGetTheVideoListOnTheRight().then((videoList) => {
        const css = {right: "123px"};
        for (let videoData of videoList) {
            if (shielding.shieldingVideoDecorated(videoData)) continue;
            videoData.css = css;
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
            el.addEventListener("click", () => {
                debugger;
                startShieldingVideoList();
            })
        })
    }, 3000);
}


//收藏夹播放的视频播放页面模型
export default {
    iscCollectionVideoPlayPage,
    startShieldingVideoList,
    findTheExpandButtonForTheListOnTheRightAndBindTheEvent
}
