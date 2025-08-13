import bvDexie from "../bvDexie.js";
import defUtil from "../../utils/defUtil.js";
import {eventEmitter} from "../EventEmitter.js";

/**
 * 视频信息缓存
 */
class VideoInfoCache {
    #caches = [];
    //请求相应数据
    #resList = []

    getCaches() {
        return this.#caches;
    }

    getResList() {
        return this.#resList;
    }

    getCount() {
        return this.#caches.length;
    }

    addData(data) {
        this.#caches.push(data);
    }

    //添加临时响应数据
    addResData(bv, data, elData) {
        this.#resList.push({bv, data, elData});
    }

    clearResData() {
        this.#resList = [];
    }

    /**
     *判断bv号是否存在于缓存中
     * @param bv {string} bv号信息
     */
    is(bv) {
        return this.#caches.some(item => item.bv === bv);
    }

    /**
     *查找缓存视频信息
     *
     * @param bv {string} bv号信息
     * @returns {null|{bv:string,userInfos:{},videoInfos:{}}}
     */
    find(bv) {
        const localCacheFind = this.#caches.find(item => item.bv === bv);
        if (localCacheFind) {
            return localCacheFind
        }
        //如果没有找到，则从临时响应数据中查找
        const resFind = this.#resList.find(item => item.bv === bv);
        if (resFind) {
            return resFind.data;
        }
        return null;
    }

    /**
     * 更新缓存，从数据库中覆盖更新
     * 并返回缓存
     * @returns {Promise<[]>}
     */
    async update() {
        this.#caches = await bvDexie.getVideoInfo();
        return this.getCaches();
    }
}

export const videoInfoCache = new VideoInfoCache();

export const videoInfoCacheUpdateDebounce = defUtil.debounce(async () => {
    const resList = videoInfoCache.getResList();
    for (let {bv, data, elData, method} of resList) {
        if ((await bvDexie.addVideoData(bv, data))) {
            console.log('mk-db-添加视频信息到数据库成功', elData)
        }
        eventEmitter.send('event-检查其他视频参数屏蔽', data, elData, method)
    }
    videoInfoCache.clearResData();
    await videoInfoCache.update()
    const msg = `已更新videoInfoCache，当前缓存数量：${videoInfoCache.getCount()}`;
    console.log(msg)
    eventEmitter.send('event-update-out-info', {id: '更新videoInfoCache', msg})
}, 2400);
