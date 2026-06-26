import Dexie, {Table} from "dexie"
import {getFutureTimestamp} from "./defUtil.ts"
import {getExpiresMaxAgeGm} from "../state/localMKData.ts"

interface VideoStat {
    view: number
    danmaku: number
    reply: number
    favorite: number
    coin: number
    share: number
    like: number
}

interface VideoInfoData {
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

interface UserInfoData {
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

interface VideoInfoRecord {
    bv: string
    tags: string[]
    userInfo: UserInfoData
    videoInfo: VideoInfoData
    expiresMaxAge: number
}

class MKDexie extends Dexie {
    videoInfos!: Table<VideoInfoRecord, string>

    constructor() {
        super('mk-db')
        this.version(1).stores({
            videoInfos: 'bv,tags,userInfo,videoInfo,expiresMaxAge',
        })
    }
}

const mk_db = new MKDexie()

const addVideoData = async (bv: string, data: {
    tags: string[];
    userInfo: UserInfoData;
    videoInfo: VideoInfoData
}): Promise<boolean> => {
    const {tags, userInfo, videoInfo} = data

    try {
        await mk_db.videoInfos.add({
            bv, tags, userInfo, videoInfo,
            expiresMaxAge: getFutureTimestamp(getExpiresMaxAgeGm())
        })
    } catch (e) {
        console.warn(`添加视频数据失败`, bv, data, e)
        return false
    }
    return true
}

interface BulkImportResult {
    state: boolean
    lastKeyItem?: any
    error?: any
}

const bulkImportVideoInfos = async (friendsData: VideoInfoRecord[]): Promise<BulkImportResult> => {
    try {
        const lastKeyItem = await mk_db.videoInfos.bulkPut(friendsData)
        console.info('批量导入成功，最后一个插入的主键:', lastKeyItem)
        return {state: true, lastKeyItem}
    } catch (error) {
        console.error('批量导入时出错:', error)
        return {state: false, error}
    }
}

const getVideoInfo = async (): Promise<VideoInfoRecord[]> => {
    return await mk_db.videoInfos.toArray()
}

const getVideoInfoCount = async (): Promise<number> => {
    return await mk_db.videoInfos.count()
}

const findVideoInfoByBv = async (bv: string): Promise<VideoInfoRecord | null> => {
    const data = await mk_db.videoInfos.get(bv)
    return data ? data : null
}

const clearVideoInfosTable = async (): Promise<boolean> => {
    try {
        await mk_db.videoInfos.clear()
        return true
    } catch (e) {
        console.log('清除videoInfos表失败', e)
        return false
    }
}

const checkVideoInfoExpire = async (): Promise<void> => {
    console.log('开始检查视频缓存表过期数据')
    const list = await getVideoInfo()
    const currentTimestamp = new Date().getTime()
    for (let item of list) {
        const {bv, expiresMaxAge = -1} = item
        if (expiresMaxAge === -1) {
            await mk_db.videoInfos.update(bv, {expiresMaxAge: getFutureTimestamp(7)})
            console.log(`更新bv号为${bv}的过期时间戳为7天后`, item)
            continue
        }
        if (currentTimestamp > expiresMaxAge) {
            await mk_db.videoInfos.delete(bv)
            console.log(`删除bv号为${bv}的过期数据`, item, currentTimestamp)
        }
    }
    console.log('检查视频缓存表过期数据结束')
}

setTimeout(async () => {
    await checkVideoInfoExpire()
}, 1000 * 15)

const delVideoInfoItem = async (bv: string): Promise<boolean> => {
    try {
        const item = await findVideoInfoByBv(bv)
        if (!item) return false
        await mk_db.videoInfos.delete(bv)
        return true
    } catch (e) {
        return false
    }
}

interface BulkDelResult {
    state: boolean
    success: string[]
    fail: string[]
}

const bulkDelVideoInfoItem = async (bvArr: string[]): Promise<BulkDelResult> => {
    const data: BulkDelResult = {state: false, success: [], fail: []}
    try {
        const existingItem = await mk_db.videoInfos.bulkGet(bvArr)
        const existingKeys = existingItem.filter(item => item).map(item => item!.bv)
        if (existingKeys.length === 0) {
            data.fail = bvArr
            return data
        }
        data.state = true
        data.success.push(...existingKeys)
        if (existingKeys.length !== bvArr.length) {
            data.fail.push(...bvArr.filter(item => !existingKeys.includes(item)))
        }
        await mk_db.videoInfos.bulkDelete(bvArr)
        return data
    } catch (e) {
        console.log('批量删除数据库中指定bv号失败:', e)
        return data
    }
}

export default {
    addVideoData, findVideoInfoByBv,
    clearVideoInfosTable,
    bulkImportVideoInfos,
    getVideoInfo,
    getVideoInfoCount,
    delVideoInfoItem,
    bulkDelVideoInfoItem
}
