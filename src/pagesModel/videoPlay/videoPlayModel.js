import elUtil from "../../utils/elUtil.js";
import shielding from "../../model/shielding.js";
import sFormatUtil from '../../utils/sFormatUtil.js'
import ruleUtil from "../../utils/ruleUtil.js";
import {Tip} from "../../utils/Tip.js";

//判断是否是视频播放页
const isVideoPlayPage = (url) => {
    return url.includes("www.bilibili.com/video");
}

/**
 * 开始定时检查创作者快捷屏蔽按钮
 * 存在时不作任何处理
 * 不存在时添加按钮
 */
const startIntervalCheckInstallShieldingButton = () => {
    setInterval(async () => {
        let tempBut = document.querySelector('button[but-data="video"]');
        if (tempBut !== null) return
        const el = await elUtil.findElementUntilFound('.video-info-detail-list.video-info-detail-content')
        tempBut = document.querySelector('button[but-data="video"]');
        if (tempBut !== null) return
        const butEl = document.createElement("button")
        butEl.setAttribute("gz_type", "")
        butEl.setAttribute('but-data', 'video')
        butEl.textContent = '选择用户屏蔽'
        el.appendChild(butEl)
        butEl.addEventListener('click', async () => {
            //查找是否是多个作者
            const {state} = await elUtil.findElement('.header.can-pointer', {timeout: 1800})
            if (state) {
                //多作者
                const elList = document.querySelectorAll('.container>.membersinfo-upcard-wrap>.membersinfo-upcard')
                const list = []
                for (const el of elList) {
                    const userUrl = el.querySelector('.avatar').href
                    const uid = elUtil.getUrlUID(userUrl)
                    const name = el.querySelector('.staff-name').textContent.trim()
                    list.push({
                        label: `用户-name=${name}-uid=${uid}`,
                        uid,
                        el,
                        name,
                    })
                }
                new gz.SheetDialog({
                    title: "选择屏蔽用户(uid精确)",
                    options: list,
                    closeOnOverlayClick: true,
                    /**
                     * 该实例的全局选项点击事件
                     * @param event 事件对象
                     * @param attrs {[{name:string,value:string}]} 当前选项的属性
                     * @returns {boolean} 如果返回true则阻止全局选项的点击事件，否则继续执行全局选项的点击事件
                     *
                     */
                    optionEvent: (event, attrs) => {
                        const {value} = attrs.find(item => item.name = 'uid')
                        const attrsUd = parseInt(value)
                        const item = list.find(item => item.uid === attrsUd);
                        ruleUtil.addRulePreciseUid(item.uid)
                        return true;
                    }
                });

            } else {
                //单作者
                const el = document.querySelector('.up-info-container')
                const nameEl = el.querySelector('.up-info--right a.up-name')
                const name = nameEl.textContent.trim()
                const userUrl = nameEl.href
                const uid = elUtil.getUrlUID(userUrl)
                console.log('点击了屏蔽按钮', name, userUrl, uid)
                xtip.confirm(`用户uid=${uid}-name=${name}`, {
                    title: "uid精确屏蔽方式", icon: "a",
                    btn1: () => {
                        if (uid === -1) {
                            Tip.error("该页面数据不存在uid字段");
                            return;
                        }
                        ruleUtil.addRulePreciseUid(uid)
                    }
                })

            }
        })
    }, 2000);
}

// 获取右侧视频列表
const getGetTheVideoListOnTheRight = async () => {
    //等待，直到列表中封面加载完
    await elUtil.findElementUntilFound(".video-page-card-small .b-img img");
    const elList = await elUtil.findElements(".rec-list>div", {interval: 1000})
    const nextPlayEl = document.querySelector('.next-play>.video-page-card-small');
    if (nextPlayEl) {
        elList.push(nextPlayEl)
    }
    const list = [];
    for (let el of elList) {
        try {
            const elInfo = el.querySelector(".info");
            const title = elInfo.querySelector(".title").title;
            const name = elInfo.querySelector(".upname .name").textContent.trim();
            const userUrl = elInfo.querySelector(".upname>a").href;
            const uid = elUtil.getUrlUID(userUrl);
            const playInfo = el.querySelector('.playinfo').innerHTML.trim();
            const videoUrl = el.querySelector(".info>a").href
            const bv = elUtil.getUrlBV(videoUrl)
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
                bv,
                nPlayCount,
                nBulletChat,
                nDuration,
                el,
                videoUrl,
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
    console.time("屏蔽右侧视频列表");
    getGetTheVideoListOnTheRight().then((videoList) => {
        console.timeEnd("屏蔽右侧视频列表");
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
            console.log("找到右侧视频列表的展开按钮", el);
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
    startIntervalCheckInstallShieldingButton
}
