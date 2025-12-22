//间隔执行器
export class IntervalExecutor {
    static #intervalExecutorList = [];
    #interval = null;
    /**
     * @param func {function} 异步执行函数
     */
    #func;
    #config;
    #statusObj = {};
    #keyIntervalName = '';

    /**
     * 创建间隔执行器
     * @param func {function} 异步执行函数
     * @param config {{}} 配置项
     * @param config.timeout {number} 间隔时间
     * @param config.processTips {boolean} 是否打印执行信息
     * @param config.intervalName {string} 间隔名称
     */
    constructor(func, config = {}) {
        const defConfig = {timeout: 2000, processTips: false, intervalName: null}
        this.#config = Object.assign(defConfig, config);
        if (this.#config.intervalName === null) {
            throw new Error('请设置间隔名称');
        }
        this.#func = func;
        const intervalName = this.#config.intervalName;
        const intervalExecutorList = IntervalExecutor.#intervalExecutorList;
        const index = intervalExecutorList.length + 1;
        this.#keyIntervalName = `${intervalName}_${index}`;
        this.#statusObj = {status: false, key: this.#keyIntervalName, name: this.#config.intervalName}
        intervalExecutorList.push(this);
    }

    //根据Key名称设置对应执行器状态
    static setIntervalExecutorStatus(keyIntervalName, status) {
        const find = IntervalExecutor.#intervalExecutorList.find(item => item.getKeyIntervalName() === keyIntervalName);
        if (find === undefined) return;
        if (status) {
            find.start();
        } else {
            find.stop();
        }
    }

    getKeyIntervalName = () => {
        return this.#keyIntervalName;
    }

    stop(msg = null) {
        const i = this.#interval;
        if (i === null) return;
        clearInterval(i);
        this.#interval = null;
        const processTips = this.#config.processTips;
        if (msg) {
            console.log(msg);
        }
        if (processTips) {
            console.log(`stop:检测${this.#config.intervalName}间隔执行器`)
        }
        this.#statusObj.status = false;
    }

    setTimeout(timeout) {
        this.#config.timeout = timeout;
    }

    start() {
        if (this.#interval !== null) return;
        this.#statusObj.status = true;
        this.#interval = setInterval(this.#func, this.#config.timeout);
        const processTips = this.#config.processTips;
        if (processTips) {
            console.log(`start:检测${this.#config.intervalName}间隔执行器`)
        }
    }

    setExecutorStatus(status) {
        if (status) {
            this.start()
        } else {
            this.stop()
        }
    }
}