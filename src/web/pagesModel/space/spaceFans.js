import elUtil from "../../utils/elUtil.js";
import shielding from "../../model/shielding/shielding.js";

const getUserList = () => {
    return elUtil.findElements(".fans-main .items>.item").then(elList => {
        const list = []
        for (const el of elList) {
            const avatarEl = el.querySelector(".relation-card-avatar");
            const nameEl = el.querySelector('.relation-card-info__uname')
            const uid = parseInt(avatarEl.getAttribute("data-user-profile-id"))
            const name = nameEl.textContent.trim();
            const insertionPositionEl = el.querySelector('.relation-card-info-option')
            list.push({
                name, uid, el, insertionPositionEl,
                explicitSubjectEl: el
            })
        }
        return list
    })
}

export default {
    isUrlPage(url) {
        return url.search('space.bilibili.com/([\\d]+)/relation/fans') !== -1;
    },
    userListInsertionButton() {
        getUserList().then(list => {
            for (const userData of list) {
                shielding.addBlockButton({data: userData})
            }
        })
    }
}