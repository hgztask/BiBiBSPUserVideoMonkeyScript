// WebSocket 测试入口：用于在真实页面上快速测试小脚本
//
// 使用流程：
// 1. 运行 pnpm ws 启动构建服务（ws://127.0.0.1:9000）
// 2. 油猴脚本在 isWsService 开关开启时自动连接服务
// 3. 修改本文件保存后自动构建推送执行；也可在页面控制台调用 wsBuild() 手动触发
//
// 测试脚本运行在油猴沙箱内，可用能力：
// - GM_* API
// - 全局 Vue / Dexie（构建时以 external 形式引用）
// - 通过 @/ 别名导入 src/web 下的模块，如：import elUtil from '@/core/util/elUtil';
// - window.__wsReport(数据) 主动回传结构化结果（服务端日志可见）
console.log('[ws 测试] 执行成功 →', location.href);
(window as any).__wsReport?.({url: location.href, title: document.title});
