import elUtil from "../../core/util/elUtil.ts";
import live_shielding from "../../domain/shielding/live.ts";
import shielding from "../../domain/shielding/main.ts";
import LiveCommon from "./common.ts";
import liveCommon from "./common.ts";
import localMKData, {isDelLivePageRightSidebarGm, isRoomListAdaptiveGm} from "../../state/localMKData.ts";
import cssManager from "../../domain/cssManager.ts";
import urlUtil from "../../core/util/urlUtil.ts";

// 判断是否是直播分区
const isLiveSection = (url: any = window.location.href) => {
    return url.includes("live.bilibili.com/p/eden/area-tags")
}
/**
 * 获取直播分区中直播列表数据
 * @returns {Promise<[{liveUrl,name,title,partition,popularity}]>}
 */
const getRoomCardDataList = async () => {
    const elList = await elUtil.findElements("#room-card-list>div");
    const list: any[] = [];
    for (let el of elList) {
        const cardEL = el.querySelector("#card");
        if (!cardEL) continue;
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

//直播分区业务逻辑

// —— 饥饿恢复：屏蔽删除大部分卡片后，列表高度不足视口、页面滚动加载永不触发 ——
// 页面只监听 document 的 scroll 事件，饥饿态下文档高度 < 视口，无滚动空间故 scroll 永不触发。
// 点击"加载更多"按钮：临时撑高文档恢复滚动能力 → 真实滚动到底 → 触发页面自身 fetch 加载 → 复原。
let loadMoreButton: HTMLElement | null = null;

const triggerLoadMore = (): void => {
    const prevMinHeight = document.body.style.minHeight;
    document.body.style.minHeight = `${window.innerHeight + 200}px`;
    window.scrollTo(0, document.body.scrollHeight);
    // 等新卡片渲染完成后复原撑高，避免残留多余滚动空间
    setTimeout(() => {
        document.body.style.minHeight = prevMinHeight;
    }, 1500);
}

const insertLoadMoreButton = (): void => {
    if (loadMoreButton && document.body.contains(loadMoreButton)) return;
    const button = document.createElement('div');
    button.id = 'gz_live_section_load_more_button';
    button.textContent = '加载更多直播间';
    Object.assign(button.style, {
        position: 'fixed',
        right: '20px',
        bottom: '80px',
        zIndex: '99999',
        padding: '8px 16px',
        borderRadius: '20px',
        background: 'rgba(0, 161, 214, 0.9)',
        color: '#fff',
        fontSize: '14px',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        userSelect: 'none',
    } as CSSStyleDeclaration);
    button.addEventListener('click', () => triggerLoadMore());
    document.body.appendChild(button);
    loadMoreButton = button;
}

const run = () => {
    LiveCommon.addStyle();
    cssManager.liveStreamPartitionStyle(isRoomListAdaptiveGm());
    liveCommon.setLivePageRightSidebarHide(isDelLivePageRightSidebarGm())
    insertLoadMoreButton()
}

export default {
    isLiveSection, run,
    startShieldingLiveRoom,
    //检查顶部分区面板索引列表
    startCheckTopLiveRoomTagList(url: string) {
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
            if (!switchDiv) return
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
    startLoadTopLiveRoomTagList(parseUrl: ReturnType<typeof urlUtil.parseUrl>) {
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
        let keepList: string[] = [];
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
