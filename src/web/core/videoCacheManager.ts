import bvDexie from "./bvDexie.ts";
import defUtil from "./defUtil.ts";
import {eventEmitter} from "./EventEmitter.ts";

interface VideoInfoRecord {
    bv: string;
    tags: string[];
    userInfo: any;
    videoInfo: any;
    expiresMaxAge: number;
}

class VideoCacheManager {
    updateCacheDebounce = defUtil.debounce(() => {
        this.updateCache()
    }, 3000);
    #cachePr: Promise<VideoInfoRecord[]> | null = null;

    async getCache(): Promise<VideoInfoRecord[]> {
        if (this.#cachePr !== null) {
            return this.#cachePr;
        }
        const p = new Promise<VideoInfoRecord[]>(resolve => {
            bvDexie.getVideoInfo().then(res => resolve(res))
        })
        this.#cachePr = p;
        return p;
    }

    async updateCache(): Promise<void> {
        this.#cachePr = null;
        await this.getCache().then(list => {
            const msg = `已更新videoInfoCache，当前缓存数量：${list.length}`;
            console.log(msg)
            eventEmitter.send('event-update-out-info', {id: '更新videoInfoCache', msg})
            return list
        });
    }

    async find(bv: string): Promise<VideoInfoRecord | null> {
        const list = await this.getCache()
        const find = list.find(item => item.bv === bv);
        return find ? find : null;
    }
}

export const videoCacheManager = new VideoCacheManager();
