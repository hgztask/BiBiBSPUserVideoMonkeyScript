import bFetch from './bFetch.ts'
import {getRequestFrequencyVal} from "@/state/localMKData.ts";

interface BvRequestQueueOptions<T = any> {
    interval?: number;
    fetchBvData?: (bv: string) => Promise<T>;
}

interface QueueItem<T = any> {
    bv: string;
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
}

class BvRequestQueue<T = any> {
    #cacheMap = new Map<string, Promise<T>>();
    #queue: QueueItem<T>[] = [];
    #processing = false;
    #interval = 1000;
    #fetchBvData: ((bv: string) => Promise<T>) | null = null;

    constructor(options: BvRequestQueueOptions<T> = {}) {
        this.#interval = options.interval ?? 1000;
        this.#fetchBvData = options.fetchBvData ?? this.#fetchBvData;
    }

    setInterval(interval: number): void {
        this.#interval = interval;
    }

    addBv(bv: string): Promise<T> {
        if (this.#cacheMap.has(bv)) {
            return this.#cacheMap.get(bv)!;
        }
        const promise = new Promise<T>((resolve, reject) => {
            this.#queue.push({bv, resolve, reject});
            if (!this.#processing) {
                this.#startProcessing();
            }
        });
        this.#cacheMap.set(bv, promise);
        return promise;
    }

    #startProcessing(): void {
        this.#processing = true;
        this.#processNext();
    }

    async #processNext(): Promise<void> {
        if (this.#queue.length === 0) {
            this.#processing = false;
            return;
        }
        const {bv, resolve, reject} = this.#queue.shift()!;
        try {
            const result = await this.#fetchBvData!(bv);
            resolve(result);
        } catch (error) {
            this.#cacheMap.delete(bv);
            reject(error);
        } finally {
            if (this.#queue.length > 0) {
                await new Promise(r => setTimeout(r, this.#interval));
                this.#processNext();
            } else {
                this.#processing = false;
            }
        }
    }
}

interface VideoInfoResult {
    state: boolean;
    msg: string;
    data?: any;
}

interface ReplyBoxResult {
    state: boolean;
    message: string;
    childText?: string;
    disabled?: boolean;
}

const videoInfoRequestQueue = new BvRequestQueue<VideoInfoResult>({
    fetchBvData: (bv: string): Promise<VideoInfoResult> => {
        return new Promise((resolve, reject) => {
            bFetch.fetchGetVideoInfo(bv)
                .then(res => resolve(res))
                .catch(error => reject(error))
        });
    }
});

const fetchGetVideoReplyBoxDescRequestQueue = new BvRequestQueue<ReplyBoxResult>({
    fetchBvData: (bv: string): Promise<ReplyBoxResult> => {
        return new Promise((resolve, reject) => {
            (bFetch as any).fetchGetVideoReplyBoxDescription(bv)
                .then((res: ReplyBoxResult) => {
                    resolve(res)
                })
                .catch((error: any) => reject(error))
        });
    }
})

const setAllRequestInterval = (interval: number): void => {
    videoInfoRequestQueue.setInterval(interval);
    fetchGetVideoReplyBoxDescRequestQueue.setInterval(interval);
}

setAllRequestInterval(getRequestFrequencyVal() * 1000);

export default {
    videoInfoRequestQueue, fetchGetVideoReplyBoxDescRequestQueue, setAllRequestInterval
}
