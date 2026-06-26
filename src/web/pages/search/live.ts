import elUtil from "../../core/util/elUtil.ts";
import css from '../../ui/styles/searchLive.css'
import shielding from "../../domain/shielding/main.ts";
import live_shielding from "../../domain/shielding/live.ts";
import urlUtil from "../../core/util/urlUtil.ts";

// 判断是否是搜索直播页
const isSearchLivePage = (url: any = window.location.href) => {
    return url.includes('search.bilibili.com/live')
}

//安装样式，该样式主要为修改搜索页的直播选项卡下的隐藏房间卡片，使其显示
const installStyle = () => {
    const styleElement = document.createElement('style');
    styleElement.textContent = css;
    document.head.appendChild(styleElement)
}

//获取直播列表
const getLiveRoomList = async () => {
    const elList = await elUtil.findElements('.live-room-cards>.video-list-item')
    const list = []
    for (let el of elList) {
        const titleAEl = el.querySelector('.bili-live-card__info--tit>a');
        const titleEl = el.querySelector('.bili-live-card__info--tit>a>span')
        const userEl = el.querySelector('.bili-live-card__info--uname')
        if (!titleAEl || !titleEl || !userEl) {
            continue
        }
        const liveUrl = (titleAEl as HTMLAnchorElement).href ?? '';
        const title = titleEl.textContent?.trim() ?? '';
        const userUrl = (userEl as HTMLAnchorElement).href ?? '';
        const uid = urlUtil.getUrlUID(userUrl ?? '')
        const name = userEl.textContent?.trim() ?? ''
        const roomId = urlUtil.getUrlRoomId(liveUrl ?? '')
        list.push({
            title,
            liveUrl,
            name,
            userUrl,
            uid,
            roomId,
            el,
            explicitSubjectEl: el.querySelector('.bili-live-card__info') as HTMLElement | undefined,
            insertionPositionEl: userEl as HTMLElement
        })
    }
    return list
}

// 屏蔽直播列表
const startShieldingLiveRoomList = async () => {
    const list = await getLiveRoomList()
    for (let liveData of list) {
        if (live_shielding.shieldingLiveRoomDecorated(liveData)) {
            continue
        }
        shielding.addBlockButton({data: liveData, maskingFunc: startShieldingLiveRoomList}, '', ['right'])
    }
}
export default {
    installStyle,
    startShieldingLiveRoomList,
    isSearchLivePage
}
