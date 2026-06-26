interface RequestConfig {
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    data?: any;
    responseType?: 'json' | 'text';
    params?: Record<string, any>;
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
}

interface AxiosLikeClient {
    request: <T = any>(config: RequestConfig) => Promise<TmResponse<T>>;
    get: <T = any>(url: string, config?: RequestConfig) => Promise<TmResponse<T>>;
    post: <T = any>(url: string, data?: any, config?: RequestConfig) => Promise<TmResponse<T>>;
}

declare function GM_xmlhttpRequest(details: any): void;

function createAxiosLikeClient(): AxiosLikeClient {
    function request<T = any>(config: RequestConfig): Promise<TmResponse<T>> {
        return new Promise((resolve, reject) => {
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

            GM_xmlhttpRequest({
                method: mergedConfig.method,
                url: mergedConfig.url,
                headers: mergedConfig.headers,
                data: mergedConfig.data,
                responseType: mergedConfig.responseType,
                onload: (response: any) => {
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
                        reject(createError(response, 'HTTP Error'));
                    }
                },
                onerror: (error: any) => {
                    reject(createError(error, 'Network Error'));
                }
            });
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
            error: source
        };
    }

    return {
        request,

        get(url: string, config: RequestConfig = {}): Promise<TmResponse<any>> {
            if (config.params) {
                debugger
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
