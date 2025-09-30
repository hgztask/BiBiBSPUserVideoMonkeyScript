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

    constructor(options = {}) {
        this.#interval = options.interval ?? 1000;
    }

    setInterval(interval) {
        this.#interval = interval;
    }

    addBv(bv) {
        // ✅ 如果已有缓存 Promise，直接返回（无论成功/失败？不！只缓存未完成或成功的）
        if (this.#cacheMap.has(bv)) {
            return this.#cacheMap.get(bv);
        }

        // ✅ 创建 Promise，但不在其内部引用自身
        const promise = new Promise((resolve, reject) => {
            // ❌ 不要在这里写 this.#cacheMap.set(bv, promise) —— 这会导致 TDZ！
            // ✅ 而是：先放入队列，稍后再缓存

            // 将任务加入队列（携带 resolve/reject）
            this.#queue.push({bv, resolve, reject});

            // 启动处理（如果未运行）
            if (!this.#processing) {
                this.#startProcessing();
            }
        });

        // ✅ 在 Promise 创建完成后，再缓存它
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
            // ✅ 成功：保留缓存（已存在，无需操作）
        } catch (error) {
            // ❌ 失败：移除缓存，以便下次重新请求
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

    /**
     * 模拟API请求（实际项目中替换为真实请求）
     * @private
     */
    #fetchBvData(bv) {
        return new Promise((resolve, reject) => {
            bFetch.fetchGetVideoInfo(bv)
                .then(res => resolve(res))
                .catch(error => reject(error))
        });
    }
}

export const bvRequestQueue = new BvRequestQueue({interval: getRequestFrequencyVal() * 1000});