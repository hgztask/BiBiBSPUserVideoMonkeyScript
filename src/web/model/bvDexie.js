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
 * 根据主键bv号查询视频数据
 * @param bv {string} bv号
 * @returns {Promise<{}>} 视频数据
 */
const findVideoInfoByBv = async (bv) => {
    return await mk_db.videoInfos.get(bv)
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


/**
 * 删除数据库中指定bv号的数据-主键是bv号
 * @param bv {string} bv号
 * @returns {Promise<boolean>} 删除成功返回true，反之false
 */
const delVideoInfoItem = async (bv) => {
    try {
        const item = await findVideoInfoByBv(bv);
        if (!item) return false;
        await mk_db.videoInfos.delete(bv)
        return true
    } catch (e) {
        return false
    }
}

/**
 * 批量删除数据库中指定bv号的数据-主键是bv号
 * @param bvArr {string[]} bv号数组
 * @returns {Promise<{fail: string[],success: string[], state: boolean}>} 返回状态和成功失败的bv号数组
 */
const bulkDelVideoInfoItem = async (bvArr) => {
    const data = {state: false, success: [], fail: []}
    try {
        const existingItem = await mk_db.videoInfos.bulkGet(bvArr)
        const existingKeys = existingItem.filter(item => item).map(item => item.bv)
        if (existingKeys.length === 0) {
            data.fail = bvArr
            return data
        }
        data.state = true;
        data.success.push(...existingKeys)
        if (existingKeys.length !== bvArr.length) {
            //bv号数组里存在不存在的bv号
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
    addVideoData,
    clearVideoInfosTable,
    bulkImportVideoInfos,
    getVideoInfo,
    getVideoInfoCount,
    delVideoInfoItem,
    bulkDelVideoInfoItem
}
