import elUtil from "../../utils/elUtil.js";
import live_shielding from "../../model/shielding/live_shielding.js";
import shielding from "../../model/shielding/shielding.js";

//是否是全部直播页面url
const isUrlPage = (url) => {
    return url.startsWith('https://live.bilibili.com/all')
}

//获取全部直播页的直播列表
const getAllLivePageLiveList = async () => {
    const elList = await elUtil.findElements('.index_item_JSGkw');
    const list = [];
    for (const el of elList) {
        const vueEl = el.querySelector('a')
        const vueData = vueEl['__vue__'];
        const {
            anchorName: name, anchorId: uid, roomId,
            roomTitle: title, watchedShow: {
                num: popularity
            }
        } = vueData;
        list.push({
            name, uid, roomId, title, popularity, el,
            insertionPositionEl: el, explicitSubjectEl: el
        });
    }
    return list;
}

//检查直播列表屏蔽
const checkLiveList = async () => {
    const list = await getAllLivePageLiveList();
    for (let liveData of list) {
        if (live_shielding.shieldingLiveRoomDecorated(liveData)) continue;
        shielding.addBlockButton({data: liveData, maskingFunc: checkLiveList}, 'gz-live-home-room-card-list-item')
    }
}

export default {isUrlPage, checkLiveList}