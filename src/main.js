import './model/externalLibraryVerification.js'
import "./layout/init.js";
import router from './router.js'
import watch from './watch/watch.js'
import observeNetwork from "./watch/observeNetwork.js";
import './menu.js'
import {eventEmitter} from "./model/EventEmitter.js";


window.addEventListener('load', () => {
    console.log('页面加载完成')
    router.staticRoute(document.title, window.location.href);

    watch.addEventListenerUrlChange((newUrl, oldUrl, title) => {
        router.dynamicRouting(title, newUrl);
    })
})

watch.addEventListenerNetwork((url, windowUrl, winTitle, initiatorType) => {
    observeNetwork.observeNetwork(url, windowUrl, winTitle, initiatorType)
})

document.addEventListener('keydown', function (event) {
    if (event.key === "`") {
        eventEmitter.emit('主面板开关')
    }
});
