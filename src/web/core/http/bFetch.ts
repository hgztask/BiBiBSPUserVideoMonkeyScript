import video_zoneData from "../../config/video_zoneData.ts"
import {eventEmitter} from "../EventEmitter.ts"
import {bilibiliEncoder} from "../BilibiliEncoder.ts"
import type {
    BarrageRule,
    BarrageBlockingResult,
    AttentionResult,
    VideoStat,
    VideoInfo,
    UserInfo,
    FetchVideoInfoResult,
    ReplyBoxResult,
} from "@/types/http";

/** 请求获取B站弹幕屏蔽词，过滤掉type=2的用户屏蔽规则 */
const fetchGetBarrageBlockingWords = (): Promise<BarrageBlockingResult> => {
    return new Promise((resolve, reject) => {
        fetch('https://api.bilibili.com/x/dm/filter/user', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(({code, data, message}: { code: number; data: any; message: string }) => {
                if (code !== 0) {
                    reject({state: false, msg: `请求相应内容失败：msg=${message} code=` + code})
                    return
                }
                const {rule} = data
                const list: BarrageRule[] = []
                for (let r of rule) {
                    const {type, filter, ctime} = r
                    if (type === 2) {
                        continue
                    }
                    list.push({type, filter, ctime})
                }
                resolve({state: true, data, list, msg: '获取成功'})
            })
    })
}

/** 请求获取用户关注信息，返回对方与当前用户的关注关系 */
const fetchGetAttentionInfo = (uid: string | number): Promise<AttentionResult> => {
    return new Promise((resolve, reject) => {
        fetch('https://api.bilibili.com/x/space/acc/relation?mid=' + uid, {credentials: 'include'}
        ).then(response => response.json())
            .then(data => {
                if (data.code === 0) {
                    resolve({state: true, data: data.data, msg: '获取成功'})
                }
                reject({state: false, data, msg: '获取失败'})
            }).catch(error => {
            reject({state: false, msg: '请求失败', error})
        })

    })
}

/** 通过BV号发起网络请求获取视频详情，包含视频信息、用户信息、标签等完整数据 */
const fetchGetVideoInfo = async (bvId: string): Promise<FetchVideoInfoResult> => {
    const response = await fetch(`https://api.bilibili.com/x/web-interface/view/detail?bvid=${bvId}`)
    if (response.status !== 200) {
        eventEmitter.send('请求获取视频信息失败', response, bvId)
        return {state: false, msg: '网络请求失败', data: response as any}
    }
    const {code, data, message} = await response.json()
    const defData: FetchVideoInfoResult = {state: false, msg: '默认失败信息'}
    if (code !== 0) {
        defData.msg = message
        return defData
    }
    defData.state = true
    defData.msg = '获取成功'
    const {
        View: {
            staff,
            tname,
            tname_v2,
            desc,
            pubdate,
            ctime,
            copyright,
            is_upower_exclusive,
            duration,
            dimension,
            stat: {
                view,
                danmaku,
                reply,
                favorite,
                coin,
                share,
                like
            },
            argue_info: {
                argue_msg
            },
        }, Card: {
            follower,
            like_num,
            archive_count,
            following,
            article_count, card: {
                friend,
                mid: uid,
                name,
                sex, level_info: {
                    current_level
                },
                pendant,
                nameplate,
                Official,
                official_verify,
                vip,
                sign,
                is_senior_member
            }
        }, Tags,
        participle
    } = data

    const videoInfo: VideoInfo = {
        staff,
        tname,
        tname_v2,
        desc,
        pubdate,
        ctime,
        copyright,
        is_upower_exclusive,
        duration,
        view,
        danmaku,
        reply,
        favorite,
        coin,
        share,
        participle,
        dimension,
        like,
        argue_msg,
    }

    const userInfo: UserInfo = {
        follower,
        friend,
        like_num,
        archive_count,
        article_count,
        Official,
        official_verify,
        vip,
        uid: parseInt(uid),
        name,
        sex,
        current_level,
        pendant,
        nameplate,
        following,
        sign,
        is_senior_member
    }
    let tags: string[] = []
    for (let tag of Tags) {
        tags.push(tag['tag_name'])
    }
    tags.unshift(tname, tname_v2)
    const findKey = video_zoneData.findKey(tname)
    if (findKey) {
        tags.unshift(findKey)
    }
    tags = tags.filter(tag => tag)
    defData.data = {videoInfo, userInfo, tags}
    return defData
}

/** 请求获取视频评论区输入框描述信息，用于判断评论限制类型 */
const fetchGetVideoReplyBoxDescription = async (bv: string): Promise<ReplyBoxResult> => {
    const avid = bilibiliEncoder.bv2av(bv)
    return new Promise((resolve, reject) => {
        fetch(`https://api.bilibili.com/x/v2/reply/subject/description?oid=${avid}&type=1`, {credentials: 'include'}
        ).then(response => response.json()).then(res => {
            try {
                const {data, code, message} = res
                const {child_text, disabled = false} = data['base']['input']
                if (code !== 0) {
                    reject({state: false, message})
                    return
                }
                resolve({state: true, message, childText: child_text, disabled})
            } catch (e) {
                reject({state: false, e})
            }
        }).catch(e => {
            reject({state: false, e})
        })
    })
}

declare global {
    interface Window {
        fetchGetVideoInfo: typeof fetchGetVideoInfo
        fetchGetVideoReplyBoxDescription: typeof fetchGetVideoReplyBoxDescription
    }
}

window.fetchGetVideoInfo = fetchGetVideoInfo
window.fetchGetVideoReplyBoxDescription = fetchGetVideoReplyBoxDescription

export default {
    fetchGetVideoInfo,
    fetchGetBarrageBlockingWords,
    fetchGetAttentionInfo
}
