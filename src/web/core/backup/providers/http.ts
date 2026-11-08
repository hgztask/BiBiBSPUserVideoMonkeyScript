import {defTmRequest} from '../../http/TmRequest.ts'
import {
    BackupProviderError,
    errorFromNetwork,
    errorFromStatus,
    type BackupProvider,
    type ProviderReadResult,
    type ProviderTestResult,
    type ProviderWriteResult
} from './types.ts'

export interface HttpBackupConfig {
    /** 中间层备份接口地址，GET读取、PUT写入 */
    url: string
    /** 访问令牌，作为 Bearer Token 发送 */
    token: string
}

/** 补全协议：缺省协议时默认 http:// */
const normalizeUrl = (url: string): string => {
    const clean = url.trim()
    if (!clean) return clean
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(clean)) return clean
    return 'http://' + clean
}

/**
 * 通用HTTP备份提供方，用于自建中间层（Cloudflare Worker / 自有服务器）。
 * 协议：GET读取备份，PUT写入备份；401/403认证失败，412条件写入冲突。
 */
export const createHttpProvider = (config: HttpBackupConfig): BackupProvider => {
    const url = normalizeUrl(config.url)
    const headers: Record<string, string> = {
        Authorization: `Bearer ${config.token}`,
        'Content-Type': 'application/json; charset=utf-8'
    }

    const test = async (): Promise<ProviderTestResult> => {
        try {
            const res = await defTmRequest.raw({
                url,
                method: 'GET',
                headers,
                responseType: 'text',
                timeout: 15000
            })
            if (res.status === 200) return {ok: true, message: '连接成功'}
            if (res.status === 404) return {ok: true, message: '连接成功，远程暂无备份'}
            const error = errorFromStatus(res.status, '连接测试')
            return {ok: false, message: error.message}
        } catch (e: any) {
            const error = errorFromNetwork(e, '连接测试')
            return {ok: false, message: error.message}
        }
    }

    const read = async (): Promise<ProviderReadResult | null> => {
        const res = await defTmRequest.raw({
            url,
            method: 'GET',
            headers,
            responseType: 'text',
            timeout: 30000
        })
        if (res.status === 404) return null
        if (res.status >= 200 && res.status < 300) {
            return {
                content: res.data,
                etag: res.headers['etag'],
                lastModified: res.headers['last-modified']
            }
        }
        throw errorFromStatus(res.status, '读取远程备份')
    }

    const write = async (content: string, ifMatchEtag?: string): Promise<ProviderWriteResult> => {
        const requestHeaders: Record<string, string> = {...headers}
        if (ifMatchEtag) requestHeaders['If-Match'] = ifMatchEtag
        const res = await defTmRequest.raw({
            url,
            method: 'PUT',
            headers: requestHeaders,
            data: content,
            responseType: 'text',
            timeout: 30000
        })
        if (res.status >= 200 && res.status < 300) {
            return {etag: res.headers['etag']}
        }
        if (res.status === 404) {
            throw new BackupProviderError('NOT_FOUND', '远程备份接口不存在，请检查地址', 404)
        }
        throw errorFromStatus(res.status, '上传远程备份')
    }
    return {type: 'http', test, read, write}
}
