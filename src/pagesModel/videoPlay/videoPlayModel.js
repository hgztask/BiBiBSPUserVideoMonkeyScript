import elUtil from "../../utils/elUtil.js";
import shielding from "../../model/shielding.js";
import sFormatUtil from '../../utils/sFormatUtil.js'
import ruleUtil from "../../utils/ruleUtil.js";
import {Tip} from "../../utils/Tip.js";
import elData from "../../data/elData.js";

const isVideoPlayPage = (url) => {
    return url.includes("www.bilibili.com/video");
}


/**
 * 对单个用户创作者卡片插入屏蔽按钮
 * 如果在视频页右侧的推荐列表中点击了某个视频，页面加载对应的视频信息，这时下面的nameEl元素依旧拿到的是对应的作者名称
 * 也就是对于单作者加载其他视频也是单作者时，不用重复添加按钮
 * @returns null
 */
const installSingleUserCreatorButton = async () => {
    const el = await elUtil.findElementUntilFound('.up-info-container')
    //要插入的元素位置
    const installPositionEl = el.querySelector('.up-info--right')
    const butEl = document.createElement("button")
    butEl.setAttribute("gz_type", "")
    butEl.textContent = "屏蔽";
    butEl.style.width = "100%";
    butEl.style.display = 'none'
    const nameEl = installPositionEl.querySelector('a.up-name')
    butEl.addEventListener('click', () => {
        const name = nameEl.textContent.trim()
        const userUrl = nameEl.href
        const uid = elUtil.getUrlUID(userUrl)
        console.log('点击了屏蔽按钮', name, userUrl, uid)
        xtip.confirm(`uid精确屏蔽-用户uid=${uid}-name=${name}`, {
            title: "提示", icon: "a",
            btn1: () => {
                if (uid === -1) {
                    Tip.error("该页面数据不存在uid字段");
                    return;
                }
                ruleUtil.addRulePreciseUid(uid)
            }
        })
    })
    elUtil.addEventListenerWithTracking(installPositionEl, 'mouseover', () => butEl.style.display = '')
    elUtil.addEventListenerWithTracking(installPositionEl, 'mouseout', () => butEl.style.display = 'none')
    installPositionEl.appendChild(butEl)
    Tip.infoBottomRight(`单作者添加屏蔽按钮成功`)
}

/**
 * 执行创作团队卡片添加屏蔽按钮
 * @returns null
 */
const creationTeamInsertsShieldButton = async () => {
    //获取用户团队列表
    const elList = await elUtil.findElementsUntilFound('.container>.membersinfo-upcard-wrap>.membersinfo-upcard')
    for (let item of elList) {
        const butEL = document.createElement('button')
        butEL.className = "gz_button gz_demo"
        butEL.textContent = "屏蔽"
        butEL.style.display = 'none'
        const userUrl = item.querySelector('.avatar').href
        const uid = elUtil.getUrlUID(userUrl)
        const name = item.querySelector('.staff-name').textContent.trim()
        butEL.addEventListener('click', () => {
            xtip.confirm(`uid精确屏蔽-用户uid=${uid}-name=${name}`, {
                title: "提示", icon: "a",
                btn1: () => {
                    if (uid === -1) {
                        Tip.error("该页面数据不存在uid字段");
                        return;
                    }
                    ruleUtil.addRulePreciseUid(uid)
                }
            })
        })
        item.appendChild(butEL)
        elUtil.addEventListenerWithTracking(item, 'mouseover', () => butEL.style.display = '')
        elUtil.addEventListenerWithTracking(item, 'mouseout', () => butEL.style.display = 'none')
    }
    Tip.infoBottomRight(`创作团队添加屏蔽按钮成功`)
}


// 执行作者卡片添加屏蔽按钮
const execAuthorAddBlockButton = () => {
    //查找是否是多个作者，是否是创作
    elUtil.findElementWithTimeout('.header.can-pointer', {timeout: 4000}).then(res => {
        if (res.state) {
            creationTeamInsertsShieldButton()
            //更新标记，更新为当前不是单作者视频
            elData.setData('isSingleAuthor', false)
            return
        }
        //单作者时添加对应的屏蔽按钮
        // 上一个是单作者，不用重复添加按钮
        if (elData.getData('isSingleAuthor', false)) {
            return;
        }
        elData.setData('isSingleAuthor', true)
        installSingleUserCreatorButton()
    })
}


// 获取右侧视频列表
const getGetTheVideoListOnTheRight = async () => {
    //等待，直到列表中封面加载完
    await elUtil.findElementUntilFound(".video-page-card-small .b-img img");
    const elList = await elUtil.findElementsUntilFound(".video-page-card-small", {interval: 50})
    const list = [];
    for (let el of elList) {
        try {
            const elInfo = el.querySelector(".info");
            const title = elInfo.querySelector(".title").title;
            const name = elInfo.querySelector(".upname .name").textContent.trim();
            const userUrl = elInfo.querySelector(".upname>a").href;
            const uid = elUtil.getUrlUID(userUrl);
            const playInfo = el.querySelector('.playinfo').innerHTML.trim();
            let nPlayCount = playInfo.match(/<\/svg>(.*)<svg/s)?.[1].trim()
            nPlayCount = sFormatUtil.toPlayCountOrBulletChat(nPlayCount)
            let nBulletChat = playInfo.match(/class="dm".+<\/svg>(.+)$/s)?.[1].trim()
            nBulletChat = sFormatUtil.toPlayCountOrBulletChat(nBulletChat)
            let nDuration = el.querySelector('.duration')?.textContent.trim()
            nDuration = sFormatUtil.timeStringToSeconds(nDuration)
            list.push({
                title,
                userUrl,
                name,
                uid,
                nPlayCount,
                nBulletChat,
                nDuration,
                el,
                videoUrl: el.querySelector(".info>a").href,
                insertionPositionEl: el.querySelector(".playinfo"),
                explicitSubjectEl: elInfo
            });
        } catch (e) {
            console.error("获取右侧视频列表失败:", e);
        }
    }
    return list;
}

// 执行屏蔽右侧视频列表
const startShieldingVideoList = () => {
    getGetTheVideoListOnTheRight().then((videoList) => {
        for (let videoData of videoList) {
            if (shielding.shieldingVideoDecorated(videoData)) {
                continue;
            }
            shielding.addVideoBlockButton({data: videoData, maskingFunc: startShieldingVideoList});
        }
    })
}

/**
 *  查找右侧视频列表的展开按钮并绑定事件
 *  延迟3秒执行
 *  视频页中如果点击了，右侧视频列表加载对应视频，绑定的事件依旧生效，所以不用重复设置事件
 */
const findTheExpandButtonForTheListOnTheRightAndBindTheEvent = () => {
    setTimeout(() => {
        elUtil.findElementUntilFound(".rec-footer", {interval: 2000}).then((el) => {
            console.log("找到右侧视频列表的展开按钮");
            console.log(el);
            el.addEventListener("click", () => {
                startShieldingVideoList();
            })
        })
    }, 3000);
}


//视频播放模块
export default {
    isVideoPlayPage,
    startShieldingVideoList,
    findTheExpandButtonForTheListOnTheRightAndBindTheEvent,
    execAuthorAddBlockButton
}
