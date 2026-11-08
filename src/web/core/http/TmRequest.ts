interface RequestConfig {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    data?: any;
    responseType?: 'json' | 'text';
    params?: Record<string, any>;
    /** 超时时间，单位毫秒；不传则由脚本管理器决定 */
    timeout?: number;
}

interface TmResponse<T = any> {
    data: T;
    status: number;
    headers: Record<string, string>;
}

interface TmError {
    message: string;
    status?: number;
    data?: string;
    error?: any;
    /** GM_xmlhttpRequest onerror 附带的原始错误描述，如被脚本管理器拦截时的提示 */
    errorText?: string;
}

interface AxiosLikeClient {
    request: <T = any>(config: RequestConfig) => Promise<TmResponse<T>>;
    /** 不做状态码判断，任何HTTP状态都resolve；供WebDAV等需要读取404/409/412的场景使用 */
    raw: <T = any>(config: RequestConfig) => Promise<TmResponse<T>>;
    get: <T = any>(url: string, config?: RequestConfig) => Promise<TmResponse<T>>;
    post: <T = any>(url: string, data?: any, config?: RequestConfig) => Promise<TmResponse<T>>;
}

declare function GM_xmlhttpRequest(details: any): void;

function createAxiosLikeClient(): AxiosLikeClient {
    function buildDetails(config: RequestConfig, handlers: {
        onload: (response: any) => void;
        onerror: (error: any) => void;
    }): any {
        const mergedConfig: RequestConfig = {
            method: 'GET',
            responseType: 'json',
            headers: {},
            ...config
        };

        if (mergedConfig.data) {
            if (typeof mergedConfig.data === 'object' &&
                !mergedConfig.headers!['Content-Type']) {
                mergedConfig.headers!['Content-Type'] = 'application/json';
                mergedConfig.data = JSON.stringify(mergedConfig.data);
            }
        }

        return {
            method: mergedConfig.method,
            url: mergedConfig.url,
            headers: mergedConfig.headers,
            data: mergedConfig.data,
            responseType: mergedConfig.responseType,
            timeout: mergedConfig.timeout,
            onload: handlers.onload,
            onerror: handlers.onerror,
            ontimeout: () => handlers.onerror(createError({status: 0}, 'Request Timeout'))
        };
    }

    /** 从GM错误响应中提取原始错误文本，便于判断是否被脚本管理器拦截 */
    const extractErrorText = (source: any): string | undefined => {
        for (const key of ['errorText', 'error', 'responseText']) {
            const value = source?.[key]
            if (typeof value === 'string' && value) return value
        }
        return undefined
    }

    function request<T = any>(config: RequestConfig): Promise<TmResponse<T>> {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest(buildDetails(config, {
                onload: (response: any) => {
                    if (response.status >= 200 && response.status < 300) {
                        const responseData = (config.responseType ?? 'json') === 'json'
                            ? tryParseJson(response.responseText)
                            : response.responseText;

                        resolve({
                            data: responseData,
                            status: response.status,
                            headers: parseHeaders(response.responseHeaders)
                        });
                    } else {
                        reject(createError(response, 'HTTP Error'));
                    }
                },
                onerror: (error: any) => {
                    reject(createError(error, 'Network Error'));
                }
            }));
        });
    }

    function raw<T = any>(config: RequestConfig): Promise<TmResponse<T>> {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest(buildDetails(config, {
                onload: (response: any) => {
                    resolve({
                        data: (config.responseType === 'json'
                            ? tryParseJson(response.responseText)
                            : response.responseText) as T,
                        status: response.status,
                        headers: parseHeaders(response.responseHeaders)
                    });
                },
                onerror: (error: any) => {
                    reject(createError(error, 'Network Error'));
                }
            }));
        });
    }

    function tryParseJson(text: string): any {
        try {
            return JSON.parse(text);
        } catch (e) {
            console.warn('JSON 解析失败，返回原始文本');
            return text;
        }
    }

    function parseHeaders(headersString: string): Record<string, string> {
        return headersString.split('\n').reduce((acc: Record<string, string>, line: string) => {
            const [key, value] = line.split(': ');
            if (key) acc[key.toLowerCase()] = value;
            return acc;
        }, {});
    }

    function createError(source: any, message: string): TmError {
        return {
            message,
            status: source.status,
            data: source.responseText,
            error: source,
            errorText: extractErrorText(source)
        };
    }

    return {
        request,
        raw,

        get(url: string, config: RequestConfig = {}): Promise<TmResponse<any>> {
            if (config.params) {
                const params = new URLSearchParams(config.params).toString();
                url += url.includes('?') ? `&${params}` : `?${params}`;
            }
            return request({
                ...config,
                method: 'GET',
                url: url
            });
        },

        post(url: string, data?: any, config: RequestConfig = {}): Promise<TmResponse<any>> {
            return request({
                ...config,
                method: 'POST',
                url: url,
                data: data
            });
        }
    };
}

export const defTmRequest = createAxiosLikeClient();
