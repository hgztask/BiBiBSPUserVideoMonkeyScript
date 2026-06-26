import elUtil from "../core/elUtil.ts";
import urlUtil from "../core/urlUtil.ts";
import shielding from "../domain/shielding_main.ts";

const getUserList = async () => {
    const elList = await elUtil.findElements(".media-list>div")
    const list = []
    for (const el of elList) {
        const nameAEl = el.querySelector('h2>a') as HTMLAnchorElement | null;
        if (!nameAEl) continue;
        const name = nameAEl.title
        const userUrl = nameAEl.href
        const uid = urlUtil.getUrlUID(userUrl ?? '');
        const insertionPositionEl = el.querySelector('.user-actions') as HTMLElement
        if (!insertionPositionEl) continue
        list.push({
            name, userUrl, uid, el, insertionPositionEl,
            explicitSubjectEl: el
        })
    }
    return list
}

export default {
    isUrlPage(url: string) {
        return url.startsWith('https://search.bilibili.com/upuser')
    },
    //用户列表插入屏蔽按钮
    userListInsertionButton() {
        getUserList().then(list => {
            for (const userData of list) {
                shielding.addBlockButton({data: userData})
            }
        })
    },
}