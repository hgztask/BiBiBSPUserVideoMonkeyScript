import localMKData from "../data/localMKData.js";

/**
 * 异步间隔队列
 * 测试依旧有问题，需要优化
 */
class asynchronousIntervalQueue {

    // 队列是否正在运行
    #isProcessing = false;

    // 队列状态
    // 等待执行的队列
    #pendingQueue = [];

    // 异步函数间隔 (ms)
    #interval = 200;

    /**
     *
     * @param options {{}} 配置
     * @param options.interval {number} - 每个异步函数间隔 (ms)
     */
    constructor(options = {}) {
        // 配置参数
        this.#interval = options.interval || 200;
    }

    /**
     * 修改实例配置间隔
     * @param interval {number} - 间隔 (ms)
     */
    setInterval(interval) {
        this.#interval = interval
    }

    /**
     * 添加到队列
     * @param  func {function} - 必须返回 Promise 的函数
     * @param  config {{}}   - 单个异步函数的独立配置 (可覆盖全局配置)
     * @param config.interval {number} - 间隔 (ms)
     */
    add(func, config = {}) {
        return new Promise((resolve, reject) => {
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


    /**
     * 处理队列
     * */
    async #processQueue() {
        this.#isProcessing = true;
        while (this.#pendingQueue.length > 0) {
            const task = this.#pendingQueue.shift();
            try {
                let result;
                const funcFn = task.funcFn;
                //当函数是async函数时，需要调用await
                if (funcFn instanceof Promise) {
                    const template = await funcFn
                    //当值为函数时，调用函数获取其值
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
                //当配置中有间隔时，使用配置中的间隔，否则使用全局间隔
                const interval = task.config.interval || this.#interval;
                // 按间隔延迟执行下一个任务
                await new Promise(resolve =>
                    setTimeout(resolve, interval)
                );
            }
        }
        this.#isProcessing = false;
    }
}


/**
 * 请求异步间隔队列
 * @type {asynchronousIntervalQueue}
 */
export const requestIntervalQueue = new asynchronousIntervalQueue({
    interval: localMKData.isRequestFrequencyVal() * 1000
});




