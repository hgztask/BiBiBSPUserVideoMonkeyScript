import bFetch from '../bFetch.js'
import {getRequestFrequencyVal} from "../../data/localMKData.js";

/**
 * BV号请求队列管理器
 * @class BvRequestQueue
 */
class BvRequestQueue {
    #cacheMap = new Map(); // bv => Promise
    #queue = [];
    #processing = false;
    #interval = 1000;
    /**
     *
     * @type {function}
     * @returns {Promise<any>}
     */
    #fetchBvData = null;
    constructor(options = {}) {
        this.#interval = options.interval ?? 1000;
        this.#fetchBvData = options.fetchBvData ?? this.#fetchBvData;
    }

    setInterval(interval) {
        this.#interval = interval;
    }
    addBv(bv) {
        if (this.#cacheMap.has(bv)) {
            return this.#cacheMap.get(bv);
        }
        const promise = new Promise((resolve, reject) => {
            this.#queue.push({bv, resolve, reject});
            if (!this.#processing) {
                this.#startProcessing();
            }
        });
        this.#cacheMap.set(bv, promise);
        return promise;
    }
    #startProcessing() {
        this.#processing = true;
        this.#processNext();
    }
    async #processNext() {
        if (this.#queue.length === 0) {
            this.#processing = false;
            return;
        }
        const {bv, resolve, reject} = this.#queue.shift();
        try {
            const result = await this.#fetchBvData(bv);
            resolve(result);
        } catch (error) {
            this.#cacheMap.delete(bv);
            reject(error);
        } finally {
            // 继续处理下一个（带间隔）
            if (this.#queue.length > 0) {
                await new Promise(r => setTimeout(r, this.#interval));
                this.#processNext();
            } else {
                this.#processing = false;
            }
        }
    }
}

const videoInfoRequestQueue = new BvRequestQueue({
    interval: getRequestFrequencyVal() * 1000,
    fetchBvData: (bv) => {
        return new Promise((resolve, reject) => {
            bFetch.fetchGetVideoInfo(bv)
                .then(res => resolve(res))
                .catch(error => reject(error))
        });
    }
});

// 视频评论框描述请求队列
const fetchGetVideoReplyBoxDescRequestQueue = new BvRequestQueue({
    fetchBvData: (bv) => {
        return new Promise((resolve, reject) => {
            bFetch.fetchGetVideoReplyBoxDescription(bv)
                .then(res => {
                    resolve(res)
                })
                .catch(error => reject(error))
        });
    }
})

export default {
    videoInfoRequestQueue,fetchGetVideoReplyBoxDescRequestQueue
}