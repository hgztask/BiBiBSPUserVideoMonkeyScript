import elUtil from "../../utils/elUtil.js";
import live_shielding from "../../model/shielding/live_shielding.js";
import shielding from "../../model/shielding/shielding.js";
import LiveCommon from "./liveCommon.js";
import {isDelRoomListRightSidebarGm, isRoomListAdaptiveGm} from "../../data/localMKData.js";
import liveRoomListAdaptiveCss from "../../css/live_room_list_adaptive.css";

// 判断是否是直播分区
const isLiveSection = (url = window.location.href) => {
    return url.includes("live.bilibili.com/p/eden/area-tags")
}
/**
 * 获取直播分区中直播列表数据
 * @returns {Promise<[{liveUrl,name,title,partition,popularity}]>}
 */
const getRoomCardDataList = async () => {
    const elList = await elUtil.findElements("#room-card-list>div");
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
        const titleEl = el.querySelector('.Item_roomTitle_ax3eD');
        if (titleEl) {
            titleEl.title = title;
        }
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
        const insertionPositionEl = el;
        const explicitSubjectEl = el;
        list.push({
            liveUrl, name, uid, roomId, title,
            partition, popularity, roomCover,
            insertionPositionEl,
            explicitSubjectEl,
            el
        });
    }
    return list;
}

const startShieldingLiveRoom = async () => {
    const liveList = await getRoomCardDataList();
    for (let liveData of liveList) {
        if (live_shielding.shieldingLiveRoomDecorated(liveData)) continue;
        shielding.addBlockButton({data: liveData, maskingFunc: startShieldingLiveRoom}, 'gz_shielding_live_room_button')
    }
}

const liveStreamPartitionStyle = (show = false) => {
    const selectorCss = '#live_room_list_adaptive';
    const el = document.querySelector(selectorCss);
    if (el && show === false) {
        el.textContent = '';
    } else {
        //直播分区房间列表自适应
        elUtil.installStyle(liveRoomListAdaptiveCss, selectorCss)
    }
}

//设置直播分区房间列表的右侧边栏显隐
const setRoomListRightSidebarHide = (hided = false) => {
    elUtil.findElement('#area-tags>div>aside', {cachePromise: true}).then(el => {
        el.style.display = hided ? 'none' : '';
    })
}

const run = () => {
    LiveCommon.addStyle();
    liveStreamPartitionStyle(isRoomListAdaptiveGm());
    setRoomListRightSidebarHide(isDelRoomListRightSidebarGm())
}

//直播分区业务逻辑
export default {
    isLiveSection, run, liveStreamPartitionStyle,
    startShieldingLiveRoom, setRoomListRightSidebarHide
}
