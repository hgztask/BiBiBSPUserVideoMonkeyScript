import elUtil from "../../utils/elUtil.js";
import defUtil from "../../utils/defUtil.js";
import ruleUtil from "../../utils/ruleUtil.js";
import commentSectionModel from "../commentSectionModel.js";

//是否是直播间排行榜页面
const isUrlPage = (url) => {
    return url.includes('live.bilibili.com/p/eden/rank')
}

const run = async () => {
    defUtil.getJQuery().then($ => {
        const butEl = document.createElement('button');
        butEl.textContent = '屏蔽';
        butEl.setAttribute('gz_type', '')
        butEl.addEventListener('click', () => {
            const el = document.querySelector('body>.user-card');
            const nameEl = el.querySelector('.name');
            const userAddress = nameEl.href;
            const uid = elUtil.getUrlUID(userAddress);
            if (ruleUtil.addRulePreciseUid(uid).status) {
                commentSectionModel.checkLiveRankingsCommentSectionList();
            }
        })
        $("body").on("mouseenter.data-userCard", "[data-usercard-mid]", function () {
            elUtil.findElement('body>.user-card').then(el => {
                if (el.querySelector('button[gz_type]') !== null) return;
                const userEl = el.querySelector('.user');
                userEl.appendChild(butEl);
            })
        })
    })
}

export default {isUrlPage, run}
