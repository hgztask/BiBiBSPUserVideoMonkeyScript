import Dexie from "dexie";

const mk_db = new Dexie('mk-db');
mk_db.version(1).stores({
    videoInfos: 'bv,tags,userInfo,videoInfo',
});


/**
 *添加视频数据
 * @param bv {string}
 * @param data {{}}
 * @param data.userInfo {{}}
 * @param data.videoInfo {{}}
 * @param data.tags {string[]}
 * @returns {Promise<boolean>}
 */
const addVideoData = async (bv, data) => {
    const {tags, userInfo, videoInfo} = data
    try {
        await mk_db.videoInfos.add({
            bv, tags, userInfo, videoInfo
        })
    } catch (e) {
        console.log(`添加视频数据失败`, data, e)
        return false
    }
    return true
}

/**
 * 批量导入数据
 * @param friendsData
 * @returns {Promise<{state: boolean, any}>}
 */
const bulkImportVideoInfos = async (friendsData) => {
    try {
        // 使用 bulkPut 方法批量插入数据
        const lastKeyItem = await mk_db.videoInfos.bulkPut(friendsData);
        console.info('批量导入成功，最后一个插入的主键:', lastKeyItem);
        return {state: true, lastKeyItem}
    } catch (error) {
        console.error('批量导入时出错:', error);
        return {state: false, error}
    }
}

/**
 * 获取本地db视频数据
 * @returns {Promise<[bv:string,userInfos:{},videoInfo:{}]>}
 */
const getVideoInfo = async () => {
    return await mk_db.videoInfos.toArray()
}

/**
 * 获取本地db视频数据长度
 * @returns {Promise<number>}
 */
const getVideoInfoCount = async () => {
    return await mk_db.videoInfos.count()
}


/**
 * 清除视频缓存表
 * @returns {Promise<boolean>}
 */
const clearVideoInfosTable = async () => {
    try {
        await mk_db.videoInfos.clear()
        return true
    } catch (e) {
        console.log('清除videoInfos表失败', e)
        return false
    }
}


export default {
    addVideoData,
    clearVideoInfosTable,
    bulkImportVideoInfos,
    getVideoInfo,
    getVideoInfoCount
}
