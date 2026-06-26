import elUtil from "../../core/util/elUtil.ts";
import shielding from "../../domain/shielding/main.ts";

const getUserList = () => {
    return elUtil.findElements(".fans-main .items>.item,.follow-main .items>.item").then(elList => {
        const list = []
        for (const el of elList) {
            const avatarEl = el.querySelector(".relation-card-avatar");
            const nameEl = el.querySelector('.relation-card-info__uname')
            if (!avatarEl || !nameEl) continue;
            const uid = parseInt(avatarEl.getAttribute("data-user-profile-id") || "")
            const name = nameEl.textContent?.trim() || "";
            const insertionPositionEl = el.querySelector('.relation-card-info-option') as HTMLElement
            if (!insertionPositionEl) continue
            list.push({
                name, uid, el, insertionPositionEl,
                explicitSubjectEl: el
            })
        }
        return list
    })
}

export default {
    isUrlPage(url: string) {
        const parsed = new URL(url);
        return parsed.pathname.search(/space\.bilibili\.com\/([\d]+)\/relation\/fans/) !== -1 ||
            parsed.pathname.search(/space\.bilibili\.com\/([\d]+)\/relation\/follow/) !== -1;
    },
    userListInsertionButton() {
        getUserList().then(list => {
            for (const userData of list) {
                shielding.addBlockButton({data: userData})
            }
        })
    }
}