/**
 * ValueCache 类用于存储和检索键值对数据。
 */
class ValueCache {
    #mapCache = new Map();

    /**
     * 设置键值对到缓存中。并返回要设置的值
     * @param {string} key - 键。
     * @param {*} value - 值。
     * @returns {any|boolean} value的值
     */
    set(key, value) {
        this.#mapCache.set(key, value)
        return value;
    }

    /**
     * 根据键从缓存中获取值。
     * @param {string} key - 键。
     * @param defaultValue - 默认值
     * @returns {*} 返回与键关联的值，如果键不存在则返回 undefined。
     */
    get(key, defaultValue = null) {
        const newVar = this.#mapCache.get(key);
        if (newVar) {
            return newVar;
        }
        return defaultValue;
    }

    /**
     * 获取所有缓存数据
     * @returns {Map<any, any>}
     */
    getAll() {
        return this.#mapCache;
    }

}

export const valueCache = new ValueCache();
