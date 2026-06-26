interface QueueTask<T = any> {
    funcFn: (() => Promise<T>) | (() => T) | Promise<T> | T;
    config: {
        interval: number | null;
    };
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
}

interface AsynchronousIntervalQueueOptions {
    interval?: number;
}

export class asynchronousIntervalQueue {

    #isProcessing = false;

    #pendingQueue: QueueTask[] = [];

    #interval = 200;

    constructor(options: AsynchronousIntervalQueueOptions = {}) {
        this.#interval = options.interval || 200;
    }

    setInterval(interval: number): void {
        this.#interval = interval
    }

    add<T = any>(func: (() => Promise<T>) | (() => T) | Promise<T> | T, config: {
        interval?: number
    } = {}): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.#pendingQueue.push({
                funcFn: func,
                config: {
                    interval: config.interval || null,
                },
                resolve,
                reject
            });

            if (!this.#isProcessing) {
                this.#processQueue();
            }
        });
    }

    clearPendingQueue(): void {
        this.#pendingQueue = [];
        this.#isProcessing = false;
    }

    async #processQueue(): Promise<void> {
        this.#isProcessing = true;
        while (this.#pendingQueue.length > 0) {
            const task = this.#pendingQueue.shift()!;
            try {
                let result: any;
                const funcFn = task.funcFn;
                if (funcFn instanceof Promise) {
                    const template = await funcFn
                    if (template instanceof Function) {
                        result = template()
                    } else {
                        result = template
                    }
                }
                if (funcFn instanceof Function) {
                    const template = funcFn()
                    if (template instanceof Promise) {
                        result = await template
                    } else {
                        result = template
                    }
                }
                task.resolve(result);
            } catch (error) {
                task.reject(error);
            } finally {
                const interval = task.config.interval || this.#interval;
                await new Promise(resolve =>
                    setTimeout(resolve, interval)
                );
            }
        }
        this.#isProcessing = false;
    }
}
