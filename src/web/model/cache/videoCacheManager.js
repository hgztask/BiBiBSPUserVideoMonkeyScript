import bvDexie from "../bvDexie.js";
import defUtil from "../../utils/defUtil.js";
import {eventEmitter} from "../EventEmitter.js";

class VideoCacheManager {
    #cachePr = null;
    /**
     *更新缓存-防抖版本
     * @type {function}
     */
    updateCacheDebounce = defUtil.debounce(() => {
        this.updateCache()
    }, 3000);

    async getCache() {
        if (this.#cachePr !== null) {
            return this.#cachePr;
        }
        const p = new Promise(resolve => {
            bvDexie.getVideoInfo().then(res => resolve(res))
        })
        this.#cachePr = p;
        return p;
    }

    async updateCache() {
        this.#cachePr = null;
        await this.getCache().then(list => {
            const msg = `已更新videoInfoCache，当前缓存数量：${list.length}`;
            console.log(msg)
            eventEmitter.send('event-update-out-info', {id: '更新videoInfoCache', msg})
            return list
        });
    }

    async find(bv) {
        const list = await this.getCache()
        const find = list.find(item => item.bv === bv);
        return find ? find : null;
    }
}

export const videoCacheManager = new VideoCacheManager();
