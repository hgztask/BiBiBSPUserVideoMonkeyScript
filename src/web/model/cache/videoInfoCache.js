import bvDexie from "../bvDexie.js";

/**
 * 视频信息缓存
 */
class VideoInfoCache {
    #caches = [];

    getCaches() {
        return this.#caches;
    }

    getCount() {
        return this.#caches.length;
    }

    addData(data) {
        this.#caches.push(data);
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
        const find = this.#caches.find(item => item.bv === bv);
        if (find) {
            return find
        }
        return null
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
