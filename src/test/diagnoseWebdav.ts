/**
 * WebDAV诊断：在B站页面控制台执行，检查备份链路每一环。
 * 用法（WebSocket热测试）：wsBuild() 推送后查看服务端日志；
 * 或在页面控制台粘贴整个IIFE立即执行。
 * 所有输出走 console.log / __wsReport，无需打开主面板。
 */
import backupService from '@/core/backup/backupService.ts';
import backupSnapshot from '@/core/backup/backupSnapshot.ts';
import backupKeys from '@/core/backup/backupKeys.ts';

export default async function diagnoseWebdav(): Promise<void> {
    const report: any = {steps: []};
    const step = (name: string, data: any) => {
        report.steps.push({name, data});
        console.log(`[备份诊断] ${name}`, data);
    };

    // 1. 脚本管理器环境
    step('环境', {
        hasGmXhr: typeof GM_xmlhttpRequest === 'function',
        hasGmInfo: typeof GM_info !== 'undefined',
        scriptVersion: typeof GM_info !== 'undefined' ? GM_info.script.version : null,
        userAgent: navigator.userAgent.slice(0, 60)
    });

    // 2. 备份配置
    const config = backupService.getRemoteConfig();
    const configured = backupService.isRemoteConfigured(config);
    step('远程配置', {
        type: config.type,
        configured,
        fileUrl: config.type === 'webdav' ? config.webdav.fileUrl : config.http.url,
        username: config.type === 'webdav' ? config.webdav.username : '(token方式)',
        passwordFilled: config.type === 'webdav' ? config.webdav.password.length > 0 : config.http.token.length > 0,
        lastSync: backupService.getLastSync()
    });

    if (!configured) {
        console.error('[备份诊断] 未配置远程地址，停止');
        return;
    }

    // 3. 最小GM请求直测（绕过provider逻辑，直接发GM_xmlhttpRequest）
    const rawUrl = config.type === 'webdav' ? config.webdav.fileUrl : config.http.url;
    await new Promise<void>((resolve) => {
        const started = Date.now();
        try {
            GM_xmlhttpRequest({
                method: 'GET',
                url: rawUrl,
                headers: config.type === 'webdav'
                    ? {Authorization: 'Basic ' + btoa(`${config.webdav.username}:${config.webdav.password}`)}
                    : {Authorization: `Bearer ${config.http.token}`},
                timeout: 10000,
                onload: (res: any) => {
                    step('GM直测结果', {
                        status: res.status,
                        finalUrl: res.finalUrl,
                        ms: Date.now() - started,
                        bodyPreview: String(res.responseText ?? '').slice(0, 120)
                    });
                    resolve();
                },
                onerror: (err: any) => {
                    step('GM直测结果', {failed: true, errorText: err?.errorText ?? String(err), ms: Date.now() - started});
                    resolve();
                },
                ontimeout: () => {
                    step('GM直测结果', {failed: true, reason: 'timeout', ms: Date.now() - started});
                    resolve();
                }
            });
        } catch (e: any) {
            step('GM直测结果', {threw: String(e)});
            resolve();
        }
    });

    // 4. 走provider完整链路
    try {
        const result = await backupService.testProvider();
        step('provider测试连接', result);
    } catch (e: any) {
        step('provider测试连接', {threw: e?.message ?? String(e)});
    }

    // 5. 本地快照可用性
    try {
        const snapshot = await backupSnapshot.buildSnapshot();
        const ruleCount = Object.keys(snapshot.data.rules).length;
        const nonEmpty = Object.values(snapshot.data.rules).filter((v: any) => v.length > 0).length;
        step('本地快照', {ruleTypes: ruleCount, nonEmptyTypes: nonEmpty, allKeys: backupKeys.allRuleKeys().length});
    } catch (e: any) {
        step('本地快照', {threw: e?.message ?? String(e)});
    }

    console.log('[备份诊断] 完成，把上面的输出发出来即可定位问题');
}
