import elUtil from "../../utils/elUtil.js";
import generalFuc from "./videoPlayPageCommon.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import video_shielding from "../../model/shielding/video_shielding.js";
// 判断是否为收藏的视频播放页
const iscCollectionVideoPlayPage = (url = window.location.href) => {
    return url.includes("www.bilibili.com/list/ml")
}


// 获取右侧视频列表
const getGetTheVideoListOnTheRight = async () => {
    const elList = await elUtil.findElements(".recommend-list-container>.video-card");
    return generalFuc.getRightVideoDataList(elList);
}

//开始执行屏蔽右侧视频列表
const startShieldingVideoList = () => {
    getGetTheVideoListOnTheRight().then((videoList) => {
        const css = {right: "123px"};
        for (let videoData of videoList) {
            if (video_shielding.shieldingVideoDecorated(videoData)) continue;
            videoData.cssMap = css;
            eventEmitter.send('视频添加屏蔽按钮', {data: videoData, maskingFunc: startShieldingVideoList})
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
        elUtil.findElement(".rec-footer", {interval: 2000}).then((el) => {
            el.addEventListener("click", () => {
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
