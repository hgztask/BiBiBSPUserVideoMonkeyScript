import elUtil from "../../utils/elUtil.js";
import sFormatUtil from '../../utils/sFormatUtil.js'
import ruleUtil from "../../utils/ruleUtil.js";
import ruleMatchingUtil from "../../utils/ruleMatchingUtil.js";
import ruleKeyListData from "../../data/ruleKeyListData.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import gmUtil from "../../utils/gmUtil.js";
import localMKData from "../../data/localMKData.js";
import video_shielding from "../../model/shielding/video_shielding.js";

//判断是否是视频播放页
const isVideoPlayPage = (url = window.location.href) => {
    return url.includes("www.bilibili.com/video");
}

/**
 * 选择用户屏蔽
 */
const selectUserBlocking = async () => {
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
                uid
            })
        }
        eventEmitter.send('sheet-dialog', {
            title: '选择要屏蔽的用户(uid精确)',
            list,
            optionsClick: (item) => {
                ruleUtil.addRulePreciseUid(item.uid);
                return true
            }
        })
    } else {
        //单作者
        const el = document.querySelector('.up-info-container')
        const nameEl = el.querySelector('.up-info--right a.up-name')
        const name = nameEl.textContent.trim()
        const userUrl = nameEl.href
        const uid = elUtil.getUrlUID(userUrl)
        console.log('点击了屏蔽按钮', name, userUrl, uid)
        eventEmitter.invoke('el-confirm', `用户uid=${uid}-name=${name}`, 'uid精确屏蔽方式').then(() => {
            if (uid === -1) {
                eventEmitter.send('el-msg', "该页面数据不存在uid字段")
                return;
            }
            ruleUtil.addRulePreciseUid(uid);
        })
    }
}

// 获取右侧视频列表
const getGetTheVideoListOnTheRight = async () => {
    //等待，直到列表中封面加载完
    await elUtil.findElementUntilFound(".video-page-card-small .b-img img");
    delAd()
    delGameAd()
    const elList = await elUtil.findElements(".rec-list>.video-page-card-small", {interval: 1000})
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
    if (localMKData.isDelPlayerPageRightVideoList()) {
        return
    }
    getGetTheVideoListOnTheRight().then((videoList) => {
        for (let videoData of videoList) {
            if (video_shielding.shieldingVideoDecorated(videoData)) {
                continue;
            }
            eventEmitter.send('视频添加屏蔽按钮', {data: videoData, maskingFunc: startShieldingVideoList})
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

/**
 * 获取播放器播放完成之后的推荐视频列表
 * @returns {Promise<{list: [{title:string,el:Element}],cancelEl:Element}>}
 */
const getPlayerVideoList = async () => {
    const elList = await elUtil.findElements('.bpx-player-ending-related>.bpx-player-ending-related-item')
    const data = {list: [], cancelEl: null}
    for (const el of elList) {
        const title = el.querySelector('.bpx-player-ending-related-item-title')?.textContent.trim()
        const cancelEl = el.querySelector('.bpx-player-ending-related-item-cancel')
        if (cancelEl) {
            data.cancelEl = cancelEl
        }
        data.list.push({
            title,
            el
        })
    }
    return data
}

//获取视频播放完成之后的推荐视频层
const getVideoPlayerEndingPanelEl = async () => {
    return await elUtil.findElement('#bilibili-player .bpx-player-ending-wrap>.bpx-player-ending-panel',
        {interval: 50})
}

/**
 * 设置视频播放结束事件
 * @returns {Promise<void>|any}
 */
const setVideoPlayerEnded = async () => {
    const videoEl = await elUtil.findElement('#bilibili-player video');
    const funcStart = async () => {
        const res = await getPlayerVideoList()
        for (let {el, title} of res.list) {
            let matching = ruleMatchingUtil.fuzzyMatch(ruleKeyListData.getTitleArr(), title);
            if (matching !== null) {
                eventEmitter.send('打印信息', `根据-模糊标题-【${matching}】-屏蔽视频:${title}`)
                el.remove();
                continue
            }
            matching = ruleMatchingUtil.regexMatch(ruleKeyListData.getTitleCanonicalArr(), title);
            if (matching !== null) {
                eventEmitter.send('打印信息', `根据-正则标题-【${matching}】-屏蔽视频:${title}`)
                el.remove();
            }
        }
    }
    videoEl.addEventListener('ended', () => {
        console.log('视频播放结束')
        funcStart()
        if (localMKData.isDelPlayerEndingPanel()) {
            getVideoPlayerEndingPanelEl().then(el => {
                el.remove()
                eventEmitter.send('打印信息', '已删除播放页播放器中推荐层')
            })
        }
    })
}

/**
 * 删除播放页的广告
 */
const delAd = () => {
    if (!gmUtil.getData('isDelPlayerPageAd', false)) {
        return
    }
    //查找页面广告标签，十秒之后未找到则结束
    elUtil.findElements('[class|=ad],#slide_ad').then(elList => {
        for (const el of elList) {
            el.style.display = 'none'
            // el?.remove()
        }
        eventEmitter.send('打印信息', '隐藏了播放页的页面广告')
    })
}

//移除右侧视频列表
const delRightVideoList = () => {
    if (!localMKData.isDelPlayerPageRightVideoList()) {
        return
    }
    elUtil.findElement('.recommend-list-v1').then(el => {
        // el?.remove()
        el.style.visibility = "hidden";
        eventEmitter.send('打印信息', '屏蔽了播放页的右侧推荐列表')
    })
}

/**
 * 屏蔽播放页右侧游戏推荐
 */
const delGameAd = () => {
    if (!gmUtil.getData('isDelPlayerPageRightGameAd', false)) {
        return
    }
    elUtil.findElement('.video-page-game-card-small', {timeout: 10000}).then(({state, data}) => {
        if (!state) {
            eventEmitter.send('打印信息', '没有找到播放页的右侧游戏推荐')
            return
        }
        data?.remove();
        eventEmitter.send('打印信息', '屏蔽了游戏推荐')
    })
}

//移除屏蔽底部评论区
const delBottomCommentApp = () => {
    if (!localMKData.isDelBottomComment()) {
        return
    }
    elUtil.findElement('#commentapp').then(el => {
        el?.remove()
        eventEmitter.send('打印信息', '移除了页面底部的评论区')
    })
}

//屏蔽页面元素管理
const delElManagement = () => {
    if (localMKData.isDelPlayerPageRightVideoList()) {
        delAd()
    }
    delRightVideoList()
    delBottomCommentApp()
}

//视频播放模块
export default {
    isVideoPlayPage,
    startShieldingVideoList,
    findTheExpandButtonForTheListOnTheRightAndBindTheEvent,
    selectUserBlocking,
    run,
}
