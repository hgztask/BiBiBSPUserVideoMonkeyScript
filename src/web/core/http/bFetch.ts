import video_zoneData from "../../config/video_zoneData.ts"
import {eventEmitter} from "../EventEmitter.ts"
import {bilibiliEncoder} from "../BilibiliEncoder.ts"

interface BarrageRule {
    type: number
    filter: string
    ctime: number
}

interface BarrageBlockingResult {
    state: boolean
    data?: any
    list?: BarrageRule[]
    msg: string
}

interface AttentionResult {
    state: boolean
    data?: any
    msg: string
    error?: any
}

interface VideoStat {
    view: number
    danmaku: number
    reply: number
    favorite: number
    coin: number
    share: number
    like: number
}

interface VideoInfo {
    staff?: any[]
    tname: string
    tname_v2: string
    desc: string
    pubdate: number
    ctime: number
    copyright: number
    is_upower_exclusive: boolean
    duration: number
    view: number
    danmaku: number
    reply: number
    favorite: number
    coin: number
    share: number
    participle: any
    dimension: any
    like: number
    argue_msg: string
}

interface UserInfo {
    follower: number
    friend: number
    like_num: number
    archive_count: number
    article_count: number
    Official: any
    official_verify: any
    vip: any
    uid: number
    name: string
    sex: string
    current_level: number
    pendant: any
    nameplate: any
    following: boolean
    sign: string
    is_senior_member: boolean
}

interface VideoInfoResult {
    state: boolean
    msg: string
    data?: {
        videoInfo: VideoInfo
        userInfo: UserInfo
        tags: string[]
    }
}

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

const fetchGetVideoInfo = async (bvId: string): Promise<VideoInfoResult> => {
    const response = await fetch(`https://api.bilibili.com/x/web-interface/view/detail?bvid=${bvId}`)
    if (response.status !== 200) {
        eventEmitter.send('请求获取视频信息失败', response, bvId)
        return {state: false, msg: '网络请求失败', data: response as any}
    }
    const {code, data, message} = await response.json()
    const defData: VideoInfoResult = {state: false, msg: '默认失败信息'}
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

interface ReplyBoxResult {
    state: boolean
    message: string
    childText?: string
    disabled?: boolean
    e?: any
}

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
