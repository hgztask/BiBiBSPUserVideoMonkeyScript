import elUtil from "../../utils/elUtil.js";
import live_shielding from "../../model/shielding/live_shielding.js";
import shielding from "../../model/shielding/shielding.js";
import LiveCommon from "./liveCommon.js";
import liveCommon from "./liveCommon.js";
import localMKData, {isDelLivePageRightSidebarGm, isRoomListAdaptiveGm} from "../../data/localMKData.js";
import cssManager from "../../model/cssManager.js";
import urlUtil from "../../utils/urlUtil.js";

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

const run = () => {
    LiveCommon.addStyle();
    cssManager.liveStreamPartitionStyle(isRoomListAdaptiveGm());
    liveCommon.setLivePageRightSidebarHide(isDelLivePageRightSidebarGm())
}


//直播分区业务逻辑
export default {
    isLiveSection, run,
    startShieldingLiveRoom,
    //检查顶部分区面板索引列表
    startCheckTopLiveRoomTagList(url) {
        const parseUrl = urlUtil.parseUrl(url);
        const {
            /**
             * 3 手游
             * 2 网游
             * 6 单机游戏
             */
            parentAreaId = '0',
            /**
             * 子分区id
             * 0 为全部，这时顶部·的区块列表为全部，不折叠展示
             */
            areaId = '0'
        } = parseUrl.queryParams;
        //只处理手游、网游、单机游戏主分区
        if (!(parentAreaId === '3' || parentAreaId === "2" || parentAreaId === "6")) return
        if (areaId === '0') {
            this.startLoadTopLiveRoomTagList(parseUrl)
            return
        }
        console.log('非全部，查找切换分区按钮')
        elUtil.byXpathElAsync('//div[@id="area-tags"]//div[contains(@class,"index_switch_area") and contains(.,"切换分区")]').then(switchDiv => {
            console.log('已找到切换分区按钮')
            const dataLabelKey = 'data-label'
            const dataLabel = switchDiv.getAttribute(dataLabelKey);
            if (dataLabel !== null) return console.log('已添加过切换分区按钮监听')
            switchDiv.setAttribute(dataLabelKey, '切换分区')
            switchDiv.addEventListener('click', () => {
                console.log('点击了切换分区')
                this.startLoadTopLiveRoomTagList(parseUrl)
            })
            console.log('切换分区按钮已添加监听')
        })
    },
    //载入顶部tag分区索引处理
    startLoadTopLiveRoomTagList(parseUrl) {
        const {
            /**
             * 3 手游
             * 2 网游
             * 6 单机游戏
             */
            parentAreaId = '0',
            /**
             * 子分区id
             * 0 为全部，这时顶部·的区块列表为全部，不折叠展示
             */
            areaId = '0'
        } = parseUrl.queryParams;
        let keepList;
        switch (parentAreaId) {
            case "3":
                if (!localMKData.isMobileGamePartitionTagOnlyShowStatus()) return
                keepList = localMKData.getMobileGamePartitionTagOnlyShowList()
                break;
            case"2":
                if (!localMKData.isGamePartitionTagOnlyShowStatus()) return
                keepList = localMKData.getGamePartitionTagOnlyShowList()
                break;
            case "6":
                if (!localMKData.isSingleGamePartitionTagOnlyShowStatus()) return
                keepList = localMKData.getSingleGamePartitionTagOnlyShowList()
                break;
        }
        const selector = areaId === '0' ? '#area-tags section>div>button[class^="index_tag_"]' : '#area-tags header[class^="index_header"]>section>a'
        console.log(parentAreaId, areaId)
        elUtil.findElements(selector, {interval: 200, timeout: 5000}).then(elList => {
            for (let el of elList) {
                const label = el.textContent.trim();
                if (keepList.includes(label)) continue
                el.style.display = 'none'
            }
        })
    }
}
