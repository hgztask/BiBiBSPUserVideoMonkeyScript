import urlUtil from "../../core/util/urlUtil.ts";
import elUtil from "../../core/util/elUtil.ts";
import shielding, {blockComment, blockUserUidAndName} from "../../domain/shielding/main.ts";
import {eventEmitter} from "../../core/EventEmitter.ts";
import {IntervalExecutor} from "../../core/cache/IntervalExecutor.ts";

const getLeftUserList = () => {
    return elUtil.findElements('[data-id^="contact_"]').then(elList => {
        const list: Array<{
            name: string,
            uid: number,
            el: HTMLElement,
            insertionPositionEl: HTMLElement,
            explicitSubjectEl: HTMLElement
        }> = []
        for (const el of elList) {
            const nameEl = el.querySelector('[class^="_SessionItem__Name"]')
            if (!nameEl) continue
            const dataIdStr = el.getAttribute("data-id");
            if (!dataIdStr) continue;
            const name = nameEl.textContent?.trim() ?? '';
            if (name === "社区中心" || name === "支付小助手" || name === "UP主小助手" || name === "哔哩哔哩智能机") {
                continue
            }
            const insertionPositionEl = nameEl.parentElement as HTMLElement
            if (!insertionPositionEl) continue
            const uid = urlUtil.getUrlUID(dataIdStr.split("_")[1])
            list.push({
                name, uid, el: el as HTMLElement, insertionPositionEl, explicitSubjectEl: el as HTMLElement
            })
        }
        return list
    })
}

const getMsgList = () => {
    return elUtil.findElements('[class^="_MessageList"]>._Msg_o7f0t_1').then(elList => {
        const list: Array<{ msg: string, el: Element, uid?: string | number, name?: string }> = []
        const nameEl = document.querySelector('[class^="_ContactName"]')
        const uidEl = document.querySelector('[data-id^="contact_"][class*="_SessionItemIsActive"]')
        if (!nameEl || !uidEl) return list
        const uidStr = uidEl.getAttribute("data-id")?.split("_")[1] ?? '';
        const uid = urlUtil.getUrlUID(uidStr);
        const name = nameEl.textContent?.trim() ?? '';
        for (const el of elList) {
            const isMy = el.className.includes("MsgIsMe");
            if (isMy) continue;
            const data: { msg: string, el: Element, uid?: string | number, name?: string } = {msg: "", el}
            const msgEl = el.querySelector('[class^="_Msg__Main"]');
            if (!msgEl) continue
            //跳过图片消息
            if (msgEl.querySelector('.b-img')) {
                continue
            }
            data.msg = msgEl.textContent?.trim() ?? '';
            data.uid = uid;
            data.name = name;
            list.push(data)
        }
        return list
    })
}

export default {
    isChatWindowInterface(parseUrl: { hash: string }) {
        const hash = parseUrl.hash;
        return hash.includes("#/whisper/mid") || hash.includes("#/whisper/unfollow/mid");
    },
    //检查左侧用户列表
    checkLeftUserList() {
        getLeftUserList().then(list => {
            for (const v of list) {
                const name = v.name;
                const {state, matching, type} = blockUserUidAndName(Number(v.uid), name);
                if (state) {
                    v.el.remove();
                    eventEmitter.send('打印信息', `根据${type}规则${matching}屏蔽用户${name}`)
                    continue
                }
                shielding.addBlockButton({
                    data: v, maskingFunc: this.checkLeftUserList, mouseoverFun: (butEl) => {
                        if (!location.href.endsWith('whisper/unfollow')) return;
                        butEl.style.display = ""
                    }
                })
            }
        })
    },
    checkMsgListIntervalExecutor: new IntervalExecutor(() => {
        getMsgList().then(msgList => {
            for (const msgData of msgList) {
                const {name, msg, el} = msgData;
                const {state, type, matching} = blockComment(msg);
                if (!state) continue;
                el.remove();
                eventEmitter.send('打印信息', `根据${type}规则${matching}屏蔽用户${name}发送的消息${msg}`)
            }
        })
    }, {
        intervalName: "聊天消息窗口", processTips: true
    })
}