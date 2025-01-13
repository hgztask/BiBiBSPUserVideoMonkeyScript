import Dexie from "dexie";

const mk_db = new Dexie('mk-db');
mk_db.version(1).stores({
    tags: 'bv,title,name'
});


//临时缓存
const localData = []

//更新缓存
const updateLocalData = async () => {
    localData.splice(0, localData.length, ...await mk_db.tags.toArray())
}

updateLocalData().then(r => {
    console.log('初始化视频tags表临时缓存')
})
/**
 *查找临时缓存里是否有该bv号信息
 * @param bv{string}
 */
const findBv = async (bv) => {
    const find = localData.find(item => item.bv === bv);
    if (find === undefined) {
        return false
    }
    return find
}


/**
 *添加视频tag数据
 * @param data {{}}
 * @param data.title {string}
 * @param data.bv {string}
 * @param data.name {string}
 * @param data.tags {string[]}
 * @returns {Promise<boolean>}
 */
const addTagsData = async (data) => {
    const {title, bv, name, tags} = data
    try {
        await mk_db.tags.add({
            bv,
            title,
            name,
            tags
        })
    } catch (e) {
        console.log(`添加视频tags失败`, data, e)
        return false
    }
    return true
}

/**
 * 获取视频tag数据
 * @returns {Promise<{bv:string,title:string,name:string, tags:[string]}>}
 */
const getVideoAllTags = async () => {
    return await mk_db.tags.toArray()
}


/**
 * 获取视频tags表的长度
 * @returns {Promise<{count: number, state: boolean, error}|{count: number, state: boolean}>}
 */
const getTagsCount = async () => {
    try {
        const count = await mk_db.tags.count()
        return {state: true, count}
    } catch (e) {
        return {state: false, count: -1, error: e}
    }
}

/**
 * 清除tags表
 * @returns {Promise<boolean>}
 */
const clearTagsTable = async () => {
    try {
        await mk_db.tags.clear()
        return true
    } catch (e) {
        console.log('清除tags表失败', e)
        return false
    }
}


export default {
    addTagsData,
    getVideoAllTags,
    findBv,
    updateLocalData,
    getTagsCount,
    clearTagsTable
}
