interface IntervalExecutorConfig {
    timeout: number
    processTips: boolean
    intervalName: string | null
}

interface StatusObj {
    status: boolean
    key: string
    name: string | null
}

export class IntervalExecutor {
    static #intervalExecutorList: IntervalExecutor[] = []
    #interval: ReturnType<typeof setInterval> | null = null
    #func: () => void
    #config: IntervalExecutorConfig
    #statusObj: StatusObj
    #keyIntervalName: string = ''

    constructor(func: () => void, config: Partial<IntervalExecutorConfig> = {}) {
        const defConfig: IntervalExecutorConfig = {timeout: 2000, processTips: false, intervalName: null}
        this.#config = Object.assign(defConfig, config)
        if (this.#config.intervalName === null) {
            throw new Error('请设置间隔名称')
        }
        this.#func = func
        const intervalName = this.#config.intervalName
        const intervalExecutorList = IntervalExecutor.#intervalExecutorList
        const index = intervalExecutorList.length + 1
        this.#keyIntervalName = `${intervalName}_${index}`
        this.#statusObj = {status: false, key: this.#keyIntervalName, name: this.#config.intervalName}
        intervalExecutorList.push(this)
    }

    static setIntervalExecutorStatus(keyIntervalName: string, status: boolean): void {
        const find = IntervalExecutor.#intervalExecutorList.find(item => item.getKeyIntervalName() === keyIntervalName)
        if (find === undefined) return
        if (status) {
            find.start()
        } else {
            find.stop()
        }
    }

    getKeyIntervalName = (): string => {
        return this.#keyIntervalName
    }

    stop(msg: string | null = null): void {
        const i = this.#interval
        if (i === null) return
        clearInterval(i)
        this.#interval = null
        const processTips = this.#config.processTips
        if (msg) {
            console.log(msg)
        }
        if (processTips) {
            console.log(`stop:检测${this.#config.intervalName}间隔执行器`)
        }
        this.#statusObj.status = false
    }

    setTimeout(timeout: number): void {
        this.#config.timeout = timeout
    }

    start(): void {
        if (this.#interval !== null) return
        this.#statusObj.status = true
        this.#interval = setInterval(this.#func, this.#config.timeout)
        const processTips = this.#config.processTips
        if (processTips) {
            console.log(`start:检测${this.#config.intervalName}间隔执行器`)
        }
    }

    setExecutorStatus(status: boolean): void {
        if (status) {
            this.start()
        } else {
            this.stop()
        }
    }
}
