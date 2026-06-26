import elUtil from "../../core/util/elUtil.ts";
import defUtil from "../../core/util/defUtil.ts";
import ruleUtil from "../../core/util/ruleUtil.ts";
import commentSectionModel from "../commentSectionModel.ts";
import urlUtil from "../../core/util/urlUtil.ts";

//是否是直播间排行榜页面
const isUrlPage = (url: any) => {
    return url.includes('live.bilibili.com/p/eden/rank')
}

const run = async () => {
    defUtil.getJQuery().then($ => {
        const butEl = document.createElement('button');
        butEl.textContent = '屏蔽';
        butEl.setAttribute('gz_type', '')
        butEl.addEventListener('click', () => {
            const el = document.querySelector('body>.user-card');
            if (!el) return;
            const nameEl = el.querySelector<HTMLAnchorElement>('.name');
            if (!nameEl) return;
            const userAddress = nameEl.href ?? '';
            const uid = urlUtil.getUrlUID(userAddress);
            if (ruleUtil.addRulePreciseUid(uid).status) {
                commentSectionModel.checkLiveRankingsCommentSectionList();
            }
        })
        $("body").on("mouseenter.data-userCard", "[data-usercard-mid]", function () {
            elUtil.findElement('body>.user-card').then(el => {
                if (!el) return;
                if (el.querySelector('button[gz_type]') !== null) return;
                const userEl = el.querySelector('.user');
                if (!userEl) return;
                userEl.appendChild(butEl);
            })
        })
    })
}

export default {isUrlPage, run}
