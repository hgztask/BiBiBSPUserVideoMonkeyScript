import './menu.js'
import './model/externalLibraryVerification.js'
import "./layout/init.js";
import router from './router.js'
import watch from './watch/watch.js'
import observeNetwork from "./watch/observeNetwork.js";
import {eventEmitter} from "./model/EventEmitter.js";
import rightFloatingLayoutVue from "./layout/rightFloatingLayoutVue.js";
import './model/notificationBlocking.js'
import './model/replaceKeywords.js'
import './webSocket/index.js'
import {addGzStyle} from "./utils/defUtil.js";

window.addEventListener('load', () => {
    console.log('页面加载完成')
    rightFloatingLayoutVue.addLayout()
    router.staticRoute(document.title, window.location.href);

    watch.addEventListenerUrlChange((newUrl, oldUrl, title) => {
        router.dynamicRouting(title, newUrl);
    })
    addGzStyle(document);
})

watch.addEventListenerNetwork((url, windowUrl, winTitle, initiatorType) => {
    observeNetwork.observeNetwork(url, windowUrl, winTitle, initiatorType)
})

document.addEventListener('keydown', function (event) {
    if (event.key === "`") {
        eventEmitter.send('主面板开关')
    }
});


