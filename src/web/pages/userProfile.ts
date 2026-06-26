import {eventEmitter} from "../core/EventEmitter.ts";
import ruleUtil from "../core/ruleUtil.ts";
import elUtil from "../core/elUtil.ts";
//查找用户资料悬浮卡片插入屏蔽按钮
export default {
    run() {
        elUtil.findElement('bili-user-profile', {parseShadowRoot: true}).then(async (el) => {
            const but = document.createElement('button');
            but.id = 'chat';
            but.className = 'gz-div';
            but.textContent = '屏蔽';
            but.addEventListener('click', () => {
                const data = document.querySelector('bili-user-profile')?.['__data'];
                const {card: {mid, name}} = data
                eventEmitter.invoke('el-confirm', `是要屏蔽的用户${name}-【${mid}】吗？`).then(() => {
                    const uid = parseInt(mid)
                    if (ruleUtil.addRulePreciseUid(uid).status) {
                        eventEmitter.send('通知屏蔽').send('event-检查评论区屏蔽');
                    }
                })
            });
            const checkTheInsertButton = (el: any) => {
                const actionEl = el.querySelector('#action');
                if (actionEl === null) return;
                let gzDiv = el.querySelector('#chat.gz-div');
                if (gzDiv === null) actionEl.appendChild(but);
            }
            if (el === null) return;
            checkTheInsertButton(el);
            const observer = new MutationObserver(() => {
                checkTheInsertButton(el);
            });
            observer.observe(el as Node, {childList: true, subtree: true});
        })
    }
}