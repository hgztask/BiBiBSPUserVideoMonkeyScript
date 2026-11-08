import backupSnapshot, {type BackupSnapshot} from './backupSnapshot.ts'
import backupMerge, {type ApplyMode, type RuleDiffResult} from './backupMerge.ts'
import type {RuleMap} from './backupKeys.ts'
import {createWebdavProvider, type WebdavConfig} from './providers/webdav.ts'
import {createHttpProvider, type HttpBackupConfig} from './providers/http.ts'
import type {BackupProvider, ProviderTestResult, ProviderType} from './providers/types.ts'

/** 远程备份配置的GM存储key */
const CONFIG_KEY = 'backup_remote_config'
/** 上次同步元数据的GM存储key */
const LAST_SYNC_KEY = 'backup_remote_last_sync'

export interface RemoteBackupConfig {
    type: ProviderType
    webdav: WebdavConfig
    http: HttpBackupConfig
}

export interface LastSyncInfo {
    etag?: string
    /** 上次同步时远程规则内容的hash */
    hash: string
    at: number
    providerType: ProviderType
}

export interface UploadResult {
    status: 'uploaded' | 'unchanged'
}

export interface RemotePreview {
    rules: RuleMap
    source: 'backup' | 'legacy'
    appVersion: string
    createdAt: number
    unknownKeys: { key: string, count: number }[]
    invalidCounts: { key: string, count: number }[]
    etag?: string
    /** 远程规则内容的hash */
    remoteHash: string
    /** 本地是否存在尚未同步的修改 */
    localDirty: boolean
    diff: RuleDiffResult
}

/** 远程备份已被其他设备修改，需要用户确认是否强制覆盖 */
export class RemoteChangedError extends Error {
    remoteContent: string
    remoteEtag?: string

    constructor(remoteContent: string, remoteEtag?: string) {
        super('远程备份已被其他设备修改')
        this.name = 'RemoteChangedError'
        this.remoteContent = remoteContent
        this.remoteEtag = remoteEtag
    }
}

/** 默认配置 */
const defaultConfig = (): RemoteBackupConfig => ({
    type: 'webdav',
    webdav: {fileUrl: '', username: '', password: ''},
    http: {url: '', token: ''}
})

/** 读取远程备份配置（缺省字段补齐） */
const getRemoteConfig = (): RemoteBackupConfig => {
    const saved = GM_getValue<any>(CONFIG_KEY, null)
    const def = defaultConfig()
    if (!saved || typeof saved !== 'object') return def
    return {
        type: saved.type === 'http' ? 'http' : 'webdav',
        webdav: {...def.webdav, ...(saved.webdav ?? {})},
        http: {...def.http, ...(saved.http ?? {})}
    }
}

/** 保存远程备份配置；入参可能是Vue响应式代理，先转普通对象 */
const saveRemoteConfig = (config: RemoteBackupConfig): void => {
    GM_setValue(CONFIG_KEY, JSON.parse(JSON.stringify(config)))
}

/** 清除远程配置与同步记录 */
const clearRemoteConfig = (): void => {
    GM_deleteValue(CONFIG_KEY)
    GM_deleteValue(LAST_SYNC_KEY)
}

const getLastSync = (): LastSyncInfo | null => {
    const value = GM_getValue<any>(LAST_SYNC_KEY, null)
    if (!value || typeof value !== 'object' || typeof value.hash !== 'string') return null
    return value as LastSyncInfo
}

const setLastSync = (info: LastSyncInfo): void => {
    GM_setValue(LAST_SYNC_KEY, info)
}

const isRemoteConfigured = (config: RemoteBackupConfig): boolean => {
    if (config.type === 'webdav') return config.webdav.fileUrl.trim() !== ''
    return config.http.url.trim() !== ''
}

const requireConfig = (): RemoteBackupConfig => {
    const config = getRemoteConfig()
    if (!isRemoteConfigured(config)) {
        throw new Error('请先配置远程备份地址')
    }
    return config
}

const createProvider = (config: RemoteBackupConfig): BackupProvider => {
    if (config.type === 'webdav') return createWebdavProvider(config.webdav)
    return createHttpProvider(config.http)
}

/** 测试连接；不写入配置 */
const testProvider = async (config?: RemoteBackupConfig): Promise<ProviderTestResult> => {
    const target = config ?? getRemoteConfig()
    if (!isRemoteConfigured(target)) {
        return {ok: false, message: '请先填写远程备份地址'}
    }
    return createProvider(target).test()
}

/** 计算快照规则内容的hash（不含createdAt/deviceId等元信息） */
const snapshotRulesHash = async (snapshot: BackupSnapshot): Promise<string> => {
    return backupSnapshot.sha256Hex(backupSnapshot.snapshotHashInput(snapshot))
}

/**
 * 上传本地规则到远程。
 * 远程存在且与本地不一致时，若无法确认远程仍是上次同步的版本，则抛出RemoteChangedError，由UI询问是否强制覆盖。
 */
const upload = async (options: { force?: boolean } = {}): Promise<UploadResult> => {
    const config = requireConfig()
    const provider = createProvider(config)
    const snapshot = await backupSnapshot.buildSnapshot()
    const content = backupSnapshot.stableStringify(snapshot)
    const localHash = await snapshotRulesHash(snapshot)
    const remote = await provider.read()
    const lastSync = getLastSync()
    let ifMatch: string | undefined

    if (remote) {
        const parsedRemote = backupSnapshot.parseSnapshot(remote.content)
        const remoteHash = parsedRemote
            ? await snapshotRulesHash(parsedRemote.snapshot)
            : await backupSnapshot.sha256Hex(remote.content)
        if (parsedRemote && remoteHash === localHash) {
            setLastSync({
                etag: remote.etag ?? lastSync?.etag,
                hash: localHash,
                at: Date.now(),
                providerType: config.type
            })
            return {status: 'unchanged'}
        }
        if (!options.force && (!lastSync || remoteHash !== lastSync.hash)) {
            throw new RemoteChangedError(remote.content, remote.etag)
        }
        // 弱ETag不能用于If-Match，交给服务端最新状态判断
        ifMatch = remote.etag && !remote.etag.startsWith('W/') ? remote.etag : undefined
    }

    const writeResult = await provider.write(content, ifMatch)
    setLastSync({
        etag: writeResult.etag,
        hash: localHash,
        at: Date.now(),
        providerType: config.type
    })
    return {status: 'uploaded'}
}

/** 读取远程备份并生成预览差异，不写入本地 */
const previewRemote = async (): Promise<RemotePreview> => {
    const config = requireConfig()
    const remote = await createProvider(config).read()
    if (remote === null) throw new Error('远程还没有备份文件，请先上传')
    const parsed = backupSnapshot.parseSnapshot(remote.content)
    if (parsed === null) throw new Error('远程备份内容无法解析')
    const rules = parsed.snapshot.data.rules
    if (Object.keys(rules).length === 0) throw new Error('远程备份内容为空')

    const remoteHash = await snapshotRulesHash(parsed.snapshot)
    const localSnapshot = await backupSnapshot.buildSnapshot()
    const localHash = await snapshotRulesHash(localSnapshot)
    const lastSync = getLastSync()
    const localDirty = lastSync ? localHash !== lastSync.hash : localHash !== remoteHash

    return {
        rules,
        source: parsed.source,
        appVersion: parsed.snapshot.appVersion,
        createdAt: parsed.snapshot.createdAt,
        unknownKeys: parsed.unknownKeys,
        invalidCounts: parsed.invalidCounts,
        etag: remote.etag,
        remoteHash,
        localDirty,
        diff: backupMerge.diffRuleMap(backupMerge.getLocalRuleMap(), rules)
    }
}

/** 应用远程预览内容（覆盖或合并），并记录同步元数据 */
const confirmDownload = async (preview: RemotePreview, mode: ApplyMode): Promise<void> => {
    const config = requireConfig()
    backupMerge.applyRuleMap(preview.rules, mode)
    setLastSync({
        etag: preview.etag,
        hash: preview.remoteHash,
        at: Date.now(),
        providerType: config.type
    })
}

export default {
    getRemoteConfig,
    saveRemoteConfig,
    clearRemoteConfig,
    getLastSync,
    setLastSync,
    isRemoteConfigured,
    testProvider,
    upload,
    previewRemote,
    confirmDownload
}
