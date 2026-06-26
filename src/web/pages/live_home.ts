import elUtil from "../core/elUtil.ts";
import live_shielding from "../domain/shielding_live.ts";
import {eventEmitter} from "../core/EventEmitter.ts";
import liveCommon from "./live_common.ts";

const isLiveHomePage = (url: any) => {
    return url.includes("https://live.bilibili.com/?spm_id_from=") ||
        url === "https://live.bilibili.com/" || url.includes('live.bilibili.com/?visit_id=')
}

/**
 * 获取直播首页置顶直播间
 * @returns {Promise<[{}]>}
 */
const getTopLiveRoomDataList = async () => {
    //等待顶部的推荐列表加载完成
    const verification = await elUtil.findElement(".v-top>.aside-item .t-left.aside-item-tips.p-absolute.w-100.border-box");
    if (!verification || verification.textContent.trim() === "--") {
        //当前的元素为--时，则重新获取
        return await getTopLiveRoomDataList();
    }
    const elList = await elUtil.findElements(".v-top>.aside-item", {interval: 2000})
    const list: any[] = [];
    //目前没找到name相关信息
    for (let el of elList) {
        const classList = el.classList;
        const active = classList.contains("active");
        const title = el.getAttribute("title");
        const {up_id: uid, room_id} = JSON.parse(el.getAttribute("data-report") ?? '{}');
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
    const elList = await elUtil.findElements(".room-card-wrapper.p-relative.dp-i-block")
    const list: any[] = [];
    for (let el of elList) {
        //直播间卡片元素
        const cardEl = el.querySelector(".room-card-ctnr.p-relative.w-100");
        if (!cardEl) continue;
        //卡片数据
        const cardData = JSON.parse(cardEl.getAttribute("data-bl-report-click") ?? "");
        //用户uid和直播间id
        const {up_id: uid, room_id} = cardData.msg;
        const liveUrl = `https://live.bilibili.com/${room_id}`;
        const nameEl = el.querySelector(".room-anchor>span");
        const titleEl = el.querySelector(".room-title.card-text");
        const partitionEl = el.querySelector(".area-name");
        const popularityEl = el.querySelector(".room-anchor .v-middle");
        const name = nameEl ? nameEl.textContent.trim() : '';
        const title = titleEl ? titleEl.textContent.trim() : '';
        //直播分区
        const partition = partitionEl ? partitionEl.textContent.trim() : '';
        const popularity = popularityEl ? popularityEl.textContent.trim() : '';
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
