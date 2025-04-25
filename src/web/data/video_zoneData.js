import video_zone from '../res/video_zone.json'

/**
 *
 * 根据二级分区查找其父分区
 * @param itemKey {string} 子分区
 * @returns {string|null} 父分区，如获取不到，则返回null
 */
const findKey = (itemKey) => {
    for (let key in video_zone) {
        /**
         * 该父分区下的子分区组
         * @type {Array}
         */
        const arr = video_zone[key];
        if (arr.some((i) => i === itemKey)) return key;
    }
    return null;
}

export default {findKey}
