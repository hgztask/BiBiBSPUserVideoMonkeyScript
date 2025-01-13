import bvDexie from "./bvDexie.js";

/**
 * 获取视频tag
 * @param bv
 * @returns {Promise<{bv:string, state: boolean,msgData, tags:[string]}>}
 */
const getVideoTags = async (bv) => {
    const response = await fetch(`https://api.bilibili.com/x/web-interface/view/detail/tag?bvid=${bv}`)
    const videoTagData = {bv, state: false, tags: []}
    if (!response.ok) {
        videoTagData.msgData = {msg: 'fetch网络请求失败:获取视频tag失败', response}
        return videoTagData
    }
    let responseJson;
    try {
        responseJson = await response.json()
    } catch (e) {
        videoTagData.msgData = {msg: '获取视频tag异常:转换json内容失败', e}
        return videoTagData
    }
    const {code, data} = responseJson
    if (code !== 0) {
        videoTagData.msgData = {msg: '获取视频tag失败', responseJson}
        return videoTagData
    }
    try {
        for (let datum of data) {
            videoTagData.tags.push(datum['tag_name'])
        }
    } catch (e) {
        videoTagData.msgData = {msg: '获取视频tag异常:遍历读取data数据时失败', e}
        return videoTagData
    }
    videoTagData.state = true
    videoTagData.msgData = {msg: '获取视频tag成功'}
    return videoTagData
}

//缓存数据
const data = []


/**
 * 获取视频tag-包装
 * 已做缓存处理
 * @param videoData {{}}
 * @returns {Promise<{state: boolean,data:{bv:string,name:string,title:string,tags:[string]}|any}>}
 */
const getVideoTagsPackaging = async (videoData) => {
    const {bv, title, name} = videoData
    const find = await bvDexie.findBv(bv)
    if (find) {
        return {state: true, data: {bv, name, title, tags: find.tags}}
    }
    const videoTagData = await getVideoTags(bv)
    if (!videoTagData.state) {
        console.error(videoTagData.msgData.msg, videoTagData.msgData)
        return {state: false, data: videoTagData}
    }
    const {tags} = videoTagData
    const bool = await bvDexie.addTagsData({bv, title, name, tags})
    if (bool) {
        await bvDexie.updateLocalData()
        console.log('mk-db-tags-添加数据成功', videoTagData, videoData)
    } else {
        console.error('mk-db-tags-添加数据失败', videoTagData, videoData)
    }
    return {state: true, data: {bv, name, title, tags}}
}


export default {
    getVideoTagsPackaging
}
