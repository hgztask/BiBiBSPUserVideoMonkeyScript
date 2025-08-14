import elUtil from "../../utils/elUtil.js";
import live_shielding from "../../model/shielding/live_shielding.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import liveCommon from "./liveCommon.js";

const isLiveHomePage = (url) => {
    return url.includes("https://live.bilibili.com/?spm_id_from=333.1007.0.0") ||
        url === "https://live.bilibili.com/"
}

/**
 * 获取直播首页置顶直播间
 * @returns {Promise<[{}]>}
 */
const getTopLiveRoomDataList = async () => {
    //等待顶部的推荐列表加载完成
    const verification = await elUtil.findElementUntilFound(".v-top>.aside-item .t-left.aside-item-tips.p-absolute.w-100.border-box");
    if (verification.textContent.trim() === "--") {
        //当前的元素为--时，则重新获取
        return await getTopLiveRoomDataList();
    }
    const elList = await elUtil.findElementsUntilFound(".v-top>.aside-item", {interval: 2000})
    const list = [];
    //目前没找到name相关信息
    for (let el of elList) {
        const classList = el.classList;
        const active = classList.contains("active");
        const title = el.getAttribute("title");
        const {up_id: uid, room_id} = JSON.parse(el.getAttribute("data-report"));
        const liveUrl = `https://live.bilibili.com/${room_id}`;
        list.push({title, uid, active, liveUrl, el})
    }
    return list;
}

/**
 *获取直播首页中的直播间列表
 * @returns {Promise<[{}]>}
 */
const getLiveRoomDataList = async () => {
    const elList = await elUtil.findElementsUntilFound(".room-card-wrapper.p-relative.dp-i-block")
    const list = [];
    for (let el of elList) {
        //直播间卡片元素
        const cardEl = el.querySelector(".room-card-ctnr.p-relative.w-100");
        //卡片数据
        const cardData = JSON.parse(cardEl.getAttribute("data-bl-report-click") || "");
        //用户uid和直播间id
        const {up_id: uid, room_id} = cardData.msg;
        const liveUrl = `https://live.bilibili.com/${room_id}`;
        const name = el.querySelector(".room-anchor>span").textContent.trim();
        const title = el.querySelector(".room-title.card-text").textContent.trim();
        //直播分区
        const partition = el.querySelector(".area-name").textContent.trim();
        const popularity = el.querySelector(".room-anchor .v-middle").textContent.trim();
        list.push({
            name, title, partition, popularity, liveUrl, uid, el, roomId: room_id,
            explicitSubjectEl: el, insertionPositionEl: el.querySelector('a')
        });
    }
    return list;
}

/**
 * 屏蔽直播首页推荐的直播间
 * @returns null
 */
const startShieldingLiveRoom = async () => {
    const list = await getLiveRoomDataList();
    for (let liveData of list) {
        //屏蔽直播间
        if (live_shielding.shieldingLiveRoomDecorated(liveData)) continue;
        eventEmitter.send('event-直播首页列表添加屏蔽按钮', {data: liveData, maskingFunc: startShieldingLiveRoom});
    }
}

/**
 * 屏蔽直播首页置顶的直播间
 * //todo 后续处理一些当匹配上正在播放的直播间时切换到其他直播间去
 * @returns null
 */
const startShieldingTopLiveRoom = async () => {
    const list = await getTopLiveRoomDataList();
    for (let liveData of list) {
        live_shielding.shieldingLiveRoomDecorated(liveData)
    }
}

const run = () => {
    liveCommon.addStyle();
    startShieldingTopLiveRoom()
    startShieldingLiveRoom()
    setInterval(async () => {
        await startShieldingLiveRoom();
    }, 2000)
}

export default {
    isLiveHomePage,
    startShieldingLiveRoom,
    run
}
