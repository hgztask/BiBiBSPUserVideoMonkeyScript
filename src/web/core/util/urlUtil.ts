export default {
    /**
     * 解析 URL
     * @param urlString {string} 要解析的 URL 字符串
     * @returns {{protocol: string, hostname: string, search: string, port: string, queryParams: {}, pathSegments: string[], hash: string, pathname: string}}
     */
    parseUrl(urlString: string) {
        const url = new URL(urlString);

        const pathSegments = url.pathname.split('/').filter(segment => segment !== '');

        const searchParams = new URLSearchParams(url.search.slice(1));
        const queryParams: Record<string, string> = {};
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
    getUrlRoomId(url: string): number {
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
    getUrlUID(url: string): number {
        let uid: string | undefined;
        if (url.startsWith('http')) {
            const parseUrl = this.parseUrl(url);
            uid = parseUrl.pathSegments[0]?.trim()
            return parseInt(uid as string)
        }
        const isDoYouHaveAnyParameters = url.indexOf('?');
        const lastIndexOf = url.lastIndexOf("/");
        if (isDoYouHaveAnyParameters === -1) {
            if (url.endsWith('/')) {
                const nTheIndexOfTheLastSecondOccurrenceOfTheSlash = url.lastIndexOf('/', url.length - 2);
                uid = url.substring(nTheIndexOfTheLastSecondOccurrenceOfTheSlash + 1, url.length - 1);
            } else {
                uid = url.substring(lastIndexOf + 1);
            }
        } else {
            uid = url.substring(lastIndexOf + 1, isDoYouHaveAnyParameters);
        }
        return parseInt(uid);
    },
    /**
     * 获取url中的BV号
     * @param url {string}
     * @returns {string|null}
     */
    getUrlBV(url: string): string | null {
        let match = url.match(/video\/(.+)\//);
        if (match === null) {
            match = url.match(/video\/(.+)\?/)
        }
        if (match === null) {
            match = url.match(/video\/(.+)/)
        }
        if (match !== null) {
            return match?.[1]?.trim();
        }
        const {queryParams: {bvid = null}} = this.parseUrl(url);
        return bvid;
    }
}
