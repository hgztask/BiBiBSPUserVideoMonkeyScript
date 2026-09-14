import './domain/homeResponseRewrite.ts'
import './domain/searchResponseRewrite.ts'
import './domain/commentResponseRewrite.ts'
import './domain/liveSectionResponseRewrite.ts'
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


const onPageLoad = () => {
    console.log('页面加载完成');
    router.staticRoute(document.title, window.location.href);
    watchUtil.addEventListenerUrlChange((newUrl, oldUrl, title) => {
        router.dynamicRouting(title, newUrl);
    })
}

// boot 动态导入可能错过 load 事件，按 readyState 判断
if (document.readyState === 'complete') {
    onPageLoad()
} else {
    window.addEventListener('load', onPageLoad)
}

watchUtil.addEventListenerNetwork((url, windowUrl, winTitle, initiatorType) => {
    observeNetwork.observeNetwork(url, windowUrl, winTitle, initiatorType)
}, (url, winUrl) => {
    if (url.search('https://i1.hdslb.com/bfs/live/.*.png') !== -1 && liveRoomModel.isLiveRoom(winUrl)) {
        return liveRoomModel.sendBulletGloryLevelList()
    }
})
