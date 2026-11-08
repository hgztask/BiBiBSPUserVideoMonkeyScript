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

export interface WebdavConfig {
    /** 远程备份文件的完整URL，如 https://dav.jianguoyun.com/dav/BIBIShield/backup.json */
    fileUrl: string
    username: string
    password: string
}

/** 地址格式校验，返回错误提示或null */
const validateUrl = (url: string): string | null => {
    let parsed: URL | null = null
    try {
        parsed = new URL(url)
    } catch {
        return '远程文件地址格式不正确'
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return '远程文件地址仅支持 http:// 或 https://'
    }
    if (!parsed.hostname) {
        return '远程文件地址缺少主机名'
    }
    if (parsed.pathname === '/' || parsed.pathname === '') {
        return '地址需要指向备份文件（如 http://127.0.0.1:8180/backup.json），而不是站点根路径'
    }
    return null
}

/** 去掉URL的query与hash */
const stripQueryHash = (url: string): string => url.split('#')[0].split('?')[0]

/** 去掉末尾斜杠 */
const trimTrailingSlash = (url: string): string => url.replace(/\/+$/, '')

/** 补全协议：缺省协议时默认 http://（本机服务常见场景），已有协议则原样返回 */
const normalizeUrl = (url: string): string => {
    const clean = trimTrailingSlash(url.trim())
    if (!clean) return clean
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(clean)) return clean
    return 'http://' + clean
}

/** 获取父级集合URL；已到站点根时返回自身 */
const parentUrlOf = (url: string): string => {
    const clean = stripQueryHash(trimTrailingSlash(url))
    const schemeIdx = clean.indexOf('://')
    const originEnd = schemeIdx === -1 ? -1 : clean.indexOf('/', schemeIdx + 3)
    if (originEnd === -1) return clean
    const lastSlash = clean.lastIndexOf('/')
    if (lastSlash <= originEnd) return clean.slice(0, originEnd)
    return clean.slice(0, lastSlash)
}

/** UTF-8安全的Basic认证头 */
const basicAuthHeader = (username: string, password: string): string => {
    const bytes = new TextEncoder().encode(`${username}:${password}`)
    let binary = ''
    for (const byte of bytes) {
        binary += String.fromCharCode(byte)
    }
    return 'Basic ' + btoa(binary)
}

/**
 * 创建WebDAV提供方。
 * 使用GM_xmlhttpRequest发起PROPFIND/MKCOL/PUT/GET，绕过页面CORS限制。
 */
export const createWebdavProvider = (config: WebdavConfig): BackupProvider => {
    const fileUrl = normalizeUrl(config.fileUrl)
    const auth = basicAuthHeader(config.username, config.password)
    const baseHeaders = {Authorization: auth}

    // rclone serve webdav 等服务端对带body的PROPFIND返回400，故无body探测
    const propfind = (url: string) => defTmRequest.raw({
        url,
        method: 'PROPFIND',
        headers: {...baseHeaders, Depth: '0'},
        responseType: 'text',
        timeout: 15000
    })

    const mkcol = (url: string) => defTmRequest.raw({
        url,
        method: 'MKCOL',
        headers: {...baseHeaders},
        responseType: 'text',
        timeout: 15000
    })

    /** 递归确保集合存在；已存在（405）视为成功 */
    const ensureCollection = async (url: string): Promise<void> => {
        const res = await mkcol(url)
        if (res.status >= 200 && res.status < 300) return
        if (res.status === 405) return
        if (res.status === 409) {
            const parent = parentUrlOf(url)
            if (parent === url) throw errorFromStatus(res.status, '创建远程目录')
            await ensureCollection(parent)
            const retry = await mkcol(url)
            if ((retry.status >= 200 && retry.status < 300) || retry.status === 405) return
            throw errorFromStatus(retry.status, '创建远程目录')
        }
        if (res.status === 401) throw errorFromStatus(401, '创建远程目录')
        if (res.status === 403) throw errorFromStatus(403, '创建远程目录')
        throw errorFromStatus(res.status, '创建远程目录')
    }

    const test = async (): Promise<ProviderTestResult> => {
        const invalid = validateUrl(fileUrl)
        if (invalid) return {ok: false, message: invalid}
        const parent = parentUrlOf(fileUrl)
        try {
            const res = await propfind(parent)
            if (res.status === 207 || res.status === 200) return {ok: true, message: '连接成功'}
            if (res.status === 404) {
                await ensureCollection(parent)
                return {ok: true, message: '连接成功，远程目录已创建'}
            }
            const error = errorFromStatus(res.status, '连接测试')
            return {ok: false, message: error.message}
        } catch (e: any) {
            const error = errorFromNetwork(e, '连接测试')
            return {ok: false, message: error.message}
        }
    }

    const read = async (): Promise<ProviderReadResult | null> => {
        const invalid = validateUrl(fileUrl)
        if (invalid) throw new BackupProviderError('URL', invalid)
        const res = await defTmRequest.raw({
            url: fileUrl,
            method: 'GET',
            headers: {...baseHeaders},
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

    const put = (content: string, ifMatchEtag?: string) => {
        const headers: Record<string, string> = {
            ...baseHeaders,
            'Content-Type': 'application/json; charset=utf-8'
        }
        if (ifMatchEtag) headers['If-Match'] = ifMatchEtag
        return defTmRequest.raw({
            url: fileUrl,
            method: 'PUT',
            headers,
            data: content,
            responseType: 'text',
            timeout: 30000
        })
    }

    const write = async (content: string, ifMatchEtag?: string): Promise<ProviderWriteResult> => {
        const invalid = validateUrl(fileUrl)
        if (invalid) throw new BackupProviderError('URL', invalid)
        let res = await put(content, ifMatchEtag)
        if (res.status === 409) {
            await ensureCollection(parentUrlOf(fileUrl))
            res = await put(content, ifMatchEtag)
        }
        if (res.status >= 200 && res.status < 300) {
            return {etag: res.headers['etag']}
        }
        if (res.status === 404) {
            throw new BackupProviderError('NOT_FOUND', '远程备份路径不存在，请检查文件地址', 404)
        }
        throw errorFromStatus(res.status, '上传远程备份')
    }

    return {type: 'webdav', test, read, write}
}
