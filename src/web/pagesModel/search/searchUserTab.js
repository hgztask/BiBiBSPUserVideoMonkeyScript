import elUtil from "../../utils/elUtil.js";
import urlUtil from "../../utils/urlUtil.js";
import shielding from "../../model/shielding/shielding.js";

const getUserList = async () => {
    const elList = await elUtil.findElements(".media-list>div")
    const list = []
    for (const el of elList) {
        const nameAEl = el.querySelector('h2>a');
        const name = nameAEl.title
        const userUrl = nameAEl.href
        const uid = urlUtil.getUrlUID(userUrl);
        const insertionPositionEl = el.querySelector('.user-actions')
        list.push({
            name, userUrl, uid, el, insertionPositionEl,
            explicitSubjectEl: el
        })
    }
    return list
}

export default {
    isUrlPage(url) {
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