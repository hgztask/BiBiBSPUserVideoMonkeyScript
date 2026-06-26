import urlUtil from "../../core/util/urlUtil.ts";
import elUtil from "../../core/util/elUtil.ts";
import comments_shielding from "../../domain/shielding/comments.ts";
import {eventEmitter} from "../../core/EventEmitter.ts";

const getDataList = () => {
    return elUtil.findElements(".reply-list>.interaction-item,.at-list>.interaction-item").then(elList => {
        const list = []
        for (const el of elList) {
            const nameAEl = el.querySelector(".interaction-item__uname")
            const msgEl = el.querySelector('.interaction-item__msg')
            if (!nameAEl || !msgEl) continue
            const name = nameAEl.textContent?.trim() ?? '';
            const userUrl = nameAEl.href ?? ''
            const uid = urlUtil.getUrlUID(userUrl)
            const msgChildren = msgEl.children;
            const msgChildrenSize = msgChildren.length;
            let content = ""
            if (msgChildrenSize > 0 || msgChildrenSize < 3) {
                for (const msgChild of msgChildren) {
                    if (msgChild.tagName === "SPAN") {
                        content = msgChild.textContent.trim()
                    }
                }
            } else {
                content = msgChildren[msgChildrenSize - 1].textContent.trim()
                content = content.substring(1).trim()
            }
            const insertionPositionEl = el.querySelector('.interaction-item__title')
            list.push({
                name, userUrl, uid, content, insertionPositionEl, el, explicitSubjectEl: el, msgChildren
            })
        }
        return list
    });
}

export default {
    userListInsertionButton() {
        getDataList().then(list => {
            for (const v of list) {
                const res = comments_shielding.shieldingComment(v);
                const {state, type, matching} = res;
                if (state) {
                    v.el.remove();
                    eventEmitter.send('屏蔽评论信息', type, matching, v)
                } else {
                    eventEmitter.send('评论添加屏蔽按钮', v)
                }
            }
        })
    }
}