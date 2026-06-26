class ValueCache {
    #mapCache = new Map<string, any>();

    set(key: string, value: any): any {
        this.#mapCache.set(key, value)
        return value;
    }

    get(key: string, defaultValue: any = null): any {
        const newVar = this.#mapCache.get(key);
        if (newVar) {
            return newVar;
        }
        return defaultValue;
    }

    getAll(): Map<string, any> {
        return this.#mapCache;
    }

}

export const valueCache = new ValueCache();
