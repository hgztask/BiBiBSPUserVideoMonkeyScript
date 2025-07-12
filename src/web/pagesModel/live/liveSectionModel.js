import elUtil from "../../utils/elUtil.js";
import live_shielding from "../../model/shielding/live_shielding.js";

// 判断是否是直播分区
const isLiveSection = (url) => {
    return url.includes("live.bilibili.com/p/eden/area-tags")
}

/**
 * 获取直播分区中直播列表数据
 * @returns {Promise<[{liveUrl,name,title,partition,popularity}]>}
 */
const getRoomCardDataList = async () => {
    const elList = await elUtil.findElementsUntilFound("#room-card-list>div");
    const list = [];
    for (let el of elList) {
        const cardEL = el.querySelector("#card");
        const vueExample = cardEL.__vue__;
        const props = vueExample.$props;
        const uid = props.anchorId;
        //直播用户
        const name = props.anchorName;
        //直播标题
        const title = props.roomTitle;
        //直播房间号
        const roomId = props.roomId;
        //分区
        const partition = props.areaName;
        //人气
        const popularity = props.watchedShow.num;
        //直播封面
        const roomCover = props.roomCover;
        //直播链接
        const liveUrl = "https://live.bilibili.com/" + roomId;
        list.push({liveUrl, name, uid, roomId, title, partition, popularity, roomCover, el});
    }
    return list;
}

const startShieldingLiveRoom = async () => {
    const liveList = await getRoomCardDataList();
    for (let liveData of liveList) {
        live_shielding.shieldingLiveRoomDecorated(liveData);
    }
}


//直播分区业务逻辑
export default {
    isLiveSection,
    startShieldingLiveRoom
}
