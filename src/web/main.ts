import './menu.ts'
import './core/externalLibraryVerification.ts'
import "./ui/init.ts";
import router from './router.ts'
import watchUtil from './domain/watchUtil.ts'
import observeNetwork from "./domain/observeNetwork.ts";
import './domain/notificationBlocking.ts'
import './domain/replaceKeywords.ts'
import './domain/videoDanmakuFilter.ts'
import './domain/videoDanmakuInspector.ts'
import './dev/dev.ts'
import liveRoomModel from "./pages/live/roomModel.ts";


window.addEventListener('load', () => {
    console.log('页面加载完成');
    router.staticRoute(document.title, window.location.href);
    watchUtil.addEventListenerUrlChange((newUrl, oldUrl, title) => {
        router.dynamicRouting(title, newUrl);
    })
})

watchUtil.addEventListenerNetwork((url, windowUrl, winTitle, initiatorType) => {
    observeNetwork.observeNetwork(url, windowUrl, winTitle, initiatorType)
}, (url, winUrl) => {
    if (url.search('https://i1.hdslb.com/bfs/live/.*.png') !== -1 && liveRoomModel.isLiveRoom(winUrl)) {
        return liveRoomModel.sendBulletGloryLevelList()
    }
})
