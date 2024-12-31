// 判断是否是直播分区
import elUtil from "../../utils/elUtil.js";
import shielding from "../../model/shielding.js";

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
        //直播链接
        const liveUrl = el.querySelector("#card").href;
        //直播用户
        const name = el.querySelector(".Item_nickName_KO2QE").textContent.trim();
        //直播标题
        const title = el.querySelector(".Item_roomTitle_ax3eD").textContent.trim();
        //分区
        const partition = el.querySelector(".Item_area-name_PXDG4")?.textContent.trim() || null;
        //人气
        const popularity = el.querySelector(".Item_onlineCount_FmOW6").textContent.trim();
        list.push({liveUrl, name, title, partition, popularity, el});
    }
    return list;
}

const startShieldingLiveRoom = async () => {
    const liveList = await getRoomCardDataList();
    for (let liveData of liveList) {
        shielding.shieldingLiveRoomDecorated(liveData);
    }
}


//直播分区业务逻辑
export default {
    isLiveSection,
    startShieldingLiveRoom
}
