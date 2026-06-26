import elUtil from "../core/elUtil.ts";
import urlUtil from "../core/urlUtil.ts";
import './webWs.ts'
import debuggerManagement from "../domain/debuggerManagement.ts";
import webWs from "./webWs.ts";
import {eventEmitter} from "../core/EventEmitter.ts";


(unsafeWindow as any).mk_window = window;
(unsafeWindow as any).elUtil = elUtil;
(unsafeWindow as any).urlUtil = urlUtil;

if (debuggerManagement.isWsService()) {
    webWs.connectWebSocket()
}


eventEmitter.on('event:ws-status', (bool: boolean): void => {
    if (bool) {
        webWs.connectWebSocket()
    } else {
        webWs.stopWsConnect()
    }
})
