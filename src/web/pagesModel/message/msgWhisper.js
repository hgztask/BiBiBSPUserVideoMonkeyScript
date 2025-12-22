import urlUtil from "../../utils/urlUtil.js";
import elUtil from "../../utils/elUtil.js";
import shielding, {blockComment, blockUserUidAndName} from "../../model/shielding/shielding.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import {IntervalExecutor} from "../../model/IntervalExecutor.js";

const getLeftUserList = () => {
    return elUtil.findElements('[data-id^="contact_"]').then(elList => {
        const list = []
        for (const el of elList) {
            const nameEl = el.querySelector('[class^="_SessionItem__Name"]')
            const dataIdStr = el.getAttribute("data-id");
            const name = nameEl.textContent.trim();
            if (name === "社区中心" || name === "支付小助手" || name === "UP主小助手" || name === "哔哩哔哩智能机") {
                continue
            }
            const uid = urlUtil.getUrlUID(dataIdStr.split("_")[1])
            list.push({
                name, uid, el, insertionPositionEl: nameEl.parentElement, explicitSubjectEl: el
            })
        }
        return list
    })
}

const getMsgList = () => {
    return elUtil.findElements('[class^="_MessageList"]>._Msg_o7f0t_1').then(elList => {
        const list = []
        const nameEl = document.querySelector('[class^="_ContactName"]')
        const uidEl = document.querySelector('[data-id^="contact_"][class*="_SessionItemIsActive"]')
        const uidStr = uidEl.getAttribute("data-id").split("_")[1];
        const uid = urlUtil.getUrlUID(uidStr);
        const name = nameEl.textContent.trim();
        for (const el of elList) {
            const isMy = el.className.includes("MsgIsMe");
            if (isMy) continue;
            const data = {msg: "", el}
            const msgEl = el.querySelector('[class^="_Msg__Main"]');
            //跳过图片消息
            if (msgEl.querySelector('.b-img')) {
                continue
            }
            data.msg = msgEl.textContent.trim();
            data.uid = uid;
            data.name = name;
            list.push(data)
        }
        return list
    })
}

export default {
    isChatWindowInterface(parseUrl) {
        const hash = parseUrl.hash;
        return hash.includes("#/whisper/mid") || hash.includes("#/whisper/unfollow/mid");
    },
    //检查左侧用户列表
    checkLeftUserList() {
        getLeftUserList().then(list => {
            for (const v of list) {
                const name = v.name;
                const {state, matching, type} = blockUserUidAndName(v.uid, name);
                if (state) {
                    v.el.remove();
                    eventEmitter.send('打印信息', `根据${type}规则${matching}屏蔽用户${name}`)
                    continue
                }
                shielding.addBlockButton({data: v, maskingFunc: this.checkLeftUserList})
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