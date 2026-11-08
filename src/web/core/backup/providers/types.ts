/** 远程备份提供方类型 */
export type ProviderType = 'webdav' | 'http'

export interface ProviderTestResult {
    ok: boolean
    message: string
}

export interface ProviderReadResult {
    content: string
    etag?: string
    lastModified?: string
}

export interface ProviderWriteResult {
    etag?: string
}

/** 远程备份提供方：WebDAV / 通用HTTP接口 */
export interface BackupProvider {
    readonly type: ProviderType
    /** 测试连接与权限 */
    test(): Promise<ProviderTestResult>
    /** 读取远程备份，不存在返回null */
    read(): Promise<ProviderReadResult | null>
    /** 写入远程备份；ifMatchEtag用于条件写入，防止覆盖其他设备的修改 */
    write(content: string, ifMatchEtag?: string): Promise<ProviderWriteResult>
}

export type ProviderErrorCode =
    | 'AUTH'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'QUOTA'
    | 'NETWORK'
    | 'HTTP'
    | 'URL'

/** 提供方统一错误，UI按code给出中文提示 */
export class BackupProviderError extends Error {
    code: ProviderErrorCode
    status?: number

    constructor(code: ProviderErrorCode, message: string, status?: number) {
        super(message)
        this.name = 'BackupProviderError'
        this.code = code
        this.status = status
    }
}

/** 将HTTP状态码映射为统一错误 */
export const errorFromStatus = (status: number, context: string): BackupProviderError => {
    if (status === 401) return new BackupProviderError('AUTH', '认证失败，请检查用户名与应用密码/访问令牌', status)
    if (status === 403) return new BackupProviderError('FORBIDDEN', '没有访问权限，请检查账号授权', status)
    if (status === 404) return new BackupProviderError('NOT_FOUND', `${context}不存在`, status)
    if (status === 409) return new BackupProviderError('CONFLICT', '远程状态冲突，请重试', status)
    if (status === 412) return new BackupProviderError('CONFLICT', '远程备份已被其他设备修改', status)
    if (status === 507) return new BackupProviderError('QUOTA', '远程存储空间不足', status)
    return new BackupProviderError('HTTP', `${context}失败：HTTP ${status}`, status)
}

/** 将GM网络层异常映射为统一错误；被脚本管理器拦截时给出可操作的提示 */
export const errorFromNetwork = (error: any, context: string): BackupProviderError => {
    if (error instanceof BackupProviderError) return error
    const detail = typeof error?.errorText === 'string' && error.errorText ? `：${error.errorText}` : ''
    const message = `${context}网络错误${detail}。常见原因：地址缺少 http:// 或 https:// 前缀（https 服务请写全）、跨域未授权（需在脚本管理器的 XHR 安全中添加域名，本机地址已预授权），或服务未启动`
    return new BackupProviderError('NETWORK', message)
}
