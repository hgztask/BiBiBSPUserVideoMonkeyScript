import "./layout/init.js";
import router from './router.js'
import watch from './watch/watch.js'
import observeNetwork from "./watch/observeNetwork.js";
import mainDrawer from "./layout/drawer/mainDrawer.js";

router.staticRoute(document.title, window.location.href);

watch.addEventListenerUrlChange((newUrl, oldUrl, title) => {
    router.dynamicRouting(title, newUrl);
})

watch.addEventListenerNetwork((url, windowUrl,winTitle, initiatorType) => {
    observeNetwork.observeNetwork(url, windowUrl, winTitle,initiatorType)
})

document.addEventListener('keydown', function (event) {
    if (event.key === "`") {
        mainDrawer.showDrawer();
    }
});



