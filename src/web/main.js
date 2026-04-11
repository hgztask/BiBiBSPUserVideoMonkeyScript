import './menu.js'
import './model/externalLibraryVerification.js'
import "./layout/init.js";
import router from './router.js'
import watchUtil from './watch/watchUtil.js'
import observeNetwork from "./watch/observeNetwork.js";
import './model/notificationBlocking.js'
import './model/replaceKeywords.js'

window.addEventListener('load', () => {
    console.log('页面加载完成');
    router.staticRoute(document.title, window.location.href);
    watchUtil.addEventListenerUrlChange((newUrl, oldUrl, title) => {
        router.dynamicRouting(title, newUrl);
    })
})

watchUtil.addEventListenerNetwork((url, windowUrl, winTitle, initiatorType) => {
    observeNetwork.observeNetwork(url, windowUrl, winTitle, initiatorType)
})


