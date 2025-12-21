export default {
    /**
     * 解析 URL
     * @param urlString {string} 要解析的 URL 字符串
     * @returns {{protocol: string, hostname: string, search: string, port: string, queryParams: {}, pathSegments: string[], hash: string, pathname: string}}
     */
    parseUrl(urlString) {
        // 创建一个新的 URL 对象
        const url = new URL(urlString);

        // 提取路径部分并分割成数组
        const pathSegments = url.pathname.split('/').filter(segment => segment !== '');

        // 使用 URLSearchParams 来解析查询参数
        const searchParams = new URLSearchParams(url.search.slice(1));
        const queryParams = {};
        for (const [key, value] of searchParams.entries()) {
            queryParams[key] = value;
        }

        return {
            protocol: url.protocol,
            hostname: url.hostname,
            port: url.port,
            pathname: url.pathname,
            pathSegments,
            search: url.search,
            queryParams,
            hash: url.hash
        };
    },
    getUrlRoomId(url) {
        const match = url.match(/live\.bilibili\.com\/(\d+)/);
        if (match === null) {
            return -1
        }
        return parseInt(match[1])
    },
    /**
     *获取url中的uid
     * @param url{string}
     * @return {number}
     */
    getUrlUID(url) {
        let uid;
        if (url.startsWith('http')) {
            const parseUrl = this.parseUrl(url);
            uid = parseUrl.pathSegments[0]?.trim()
            return parseInt(uid)
        }
        //是否有参数
        const isDoYouHaveAnyParameters = url.indexOf('?');
        const lastIndexOf = url.lastIndexOf("/");
        if (isDoYouHaveAnyParameters === -1) {
            if (url.endsWith('/')) {
                // 当url以/结尾时，取倒数第二个/
                const nTheIndexOfTheLastSecondOccurrenceOfTheSlash = url.lastIndexOf('/', url.length - 2);
                uid = url.substring(nTheIndexOfTheLastSecondOccurrenceOfTheSlash + 1, url.length - 1);
            } else {
                // 当没有参数时，取url的最后一个/之后的内容
                uid = url.substring(lastIndexOf + 1);
            }
        } else {
            //当url中有参数时，取参数前的uid
            uid = url.substring(lastIndexOf + 1, isDoYouHaveAnyParameters);
        }
        return parseInt(uid);
    },
    /**
     * 获取url中的BV号
     * @param url {string}
     * @returns {string|null}
     */
    getUrlBV(url) {
        //例子：https://www.bilibili.com/video/BV1gLCWYAE5C/?spm_id_from=333.788.recommend_more_video.1
        let match = url.match(/video\/(.+)\//);
        if (match === null) {
            //例子：https://www.bilibili.com/video/BV1wB421r7NX?spm_id_from=333.1245.recommend_more_video.1
            match = url.match(/video\/(.+)\?/)
        }
        if (match === null) {
            //例子:https://www.bilibili.com/video/BV1B1cxewECr
            match = url.match(/video\/(.+)/)
        }
        if (match !== null) {
            return match?.[1]?.trim();
        }
        const {queryParams: {bvid = null}} = this.parseUrl(url);
        return bvid;
    }
}