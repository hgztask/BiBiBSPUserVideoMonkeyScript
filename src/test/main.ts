// WebSocket 测试入口：远程备份 WebDAV 诊断
//
// 在B站任意页面执行，逐环节检查远程备份链路：
// 1. 脚本管理器环境（GM_xmlhttpRequest 是否存在）
// 2. 已保存的备份配置（地址、账号、密码是否填了）
// 3. 绕过 provider 直接发一次 GM_xmlhttpRequest GET（看是不是被拦截）
// 4. provider 完整测试连接
// 5. 本地快照构建
//
// 注意：会真实请求一次配置的远程地址（GET只读，不会修改远程文件）。

import diagnoseWebdav from './diagnoseWebdav.ts';

diagnoseWebdav().catch(e => console.error('[备份诊断] 执行失败', e));
