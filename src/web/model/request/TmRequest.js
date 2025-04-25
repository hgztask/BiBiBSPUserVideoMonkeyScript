/**
 * 创建类似 axios 的 HTTP 客户端 (油猴脚本专用)
 * @returns {Object} 包含 request/get/post 方法的客户端对象
 */
function createAxiosLikeClient() {
    /**
     * 核心请求方法
     * @typedef {Object} RequestConfig
     * @property {string} url - 请求地址 (必需)
     * @property {string} [method='GET'] - HTTP 方法 (GET/POST/PUT/DELETE等)
     * @property {Object} [headers={}] - 请求头 (自动处理 Content-Type)
     * @property {*} [data] - 请求体数据 (对象自动转 JSON 字符串)
     * @property {string} [responseType='json'] - 响应类型 (json/text)
     * @property {Object} [params] - URL 查询参数 (需自行拼接，见示例)
     *
     * @param {RequestConfig} config - 请求配置对象
     * @returns {Promise<Object>} 包含 data/status/headers 的响应对象
     */
    function request(config) {
        return new Promise((resolve, reject) => {
            // 合并默认配置与用户配置
            const mergedConfig = {
                method: 'GET',
                responseType: 'json',
                headers: {},
                ...config
            };

            // 自动处理 POST 数据
            if (mergedConfig.data) {
                if (typeof mergedConfig.data === 'object' &&
                    !mergedConfig.headers['Content-Type']) {
                    mergedConfig.headers['Content-Type'] = 'application/json';
                    mergedConfig.data = JSON.stringify(mergedConfig.data);
                }
            }

            // 发起油猴脚本请求
            GM_xmlhttpRequest({
                method: mergedConfig.method,
                url: mergedConfig.url,
                headers: mergedConfig.headers,
                data: mergedConfig.data,
                responseType: mergedConfig.responseType,
                onload: (response) => {
                    // 处理 2xx 状态码
                    if (response.status >= 200 && response.status < 300) {
                        const responseData = mergedConfig.responseType === 'json'
                            ? tryParseJson(response.responseText)
                            : response.responseText;

                        resolve({
                            data: responseData,
                            status: response.status,
                            headers: parseHeaders(response.responseHeaders)
                        });
                    } else {
                        // 非 2xx 状态码视为错误
                        reject(createError(response, 'HTTP Error'));
                    }
                },
                onerror: (error) => {
                    // 网络错误处理
                    reject(createError(error, 'Network Error'));
                }
            });
        });
    }

    // 辅助方法：JSON 安全解析
    function tryParseJson(text) {
        try {
            return JSON.parse(text);
        } catch (e) {
            console.warn('JSON 解析失败，返回原始文本');
            return text;
        }
    }

    // 辅助方法：解析响应头
    function parseHeaders(headersString) {
        return headersString.split('\n').reduce((acc, line) => {
            const [key, value] = line.split(': ');
            if (key) acc[key.toLowerCase()] = value;
            return acc;
        }, {});
    }

    // 辅助方法：构造错误对象
    function createError(source, message) {
        return {
            message,
            status: source.status,
            data: source.responseText,
            error: source
        };
    }

    return {
        request,

        /**
         * 发送 GET 请求
         * @param {string} url - 请求地址
         * @param {Object} [config] - 请求配置 (可包含 params/headers 等)
         * @param config.params - URL 查询参数 (自动拼接)
         * @returns {Promise<Object>} 响应 Promise
         */
        get(url, config = {}) {
            // 手动处理 URL 参数 (示例)
            if (config.params) {
                debugger
                const params = new URLSearchParams(config.params).toString();
                url += url.includes('?') ? `&${params}` : `?${params}`;
            }
            return this.request({
                ...config,
                method: 'GET',
                url: url
            });
        },

        /**
         * 发送 POST 请求
         * @param {string} url - 请求地址
         * @param {*} data - 请求体数据
         * @param {Object} [config] - 请求配置
         * @returns {Promise<Object>} 响应 Promise
         */
        post(url, data, config = {}) {
            return this.request({
                ...config,
                method: 'POST',
                url: url,
                data: data
            });
        }
    };
}


// 创建实例
export const defTmRequest = createAxiosLikeClient();
