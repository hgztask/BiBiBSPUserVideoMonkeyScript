# 工作流文档

开发工作流、质量关卡与常见开发场景。

## 开发工作流

### 方案一：常规开发（`pnpm watch:dev`）

适合大多数开发场景：

1. 首次部署：把 `dist/install.user.js` 内容粘贴到油猴脚本，并允许脚本访问本地文件 URL
2. 运行 `pnpm watch:dev`，Vite 进入监听模式
3. 修改源代码，自动重建 `dist/local_build.js`
4. 刷新 B 站页面查看效果 —— 安装壳用 `@require file://` 直连本地产物，**不需要再把代码复制进编辑器**

> 注意「构建文档 · 监听模式」描述的现实：当前 `watch:dev` 产物与生产构建同形（已压缩、无注释），断点调试体验有限。

### 方案二：WebSocket 热测试（`pnpm ws`）

适合在真实页面上快速验证小段逻辑：

1. 运行 `pnpm ws` 启动 WebSocket 服务（服务启动即构建一次）
2. 打开 B 站页面（需先装好完整脚本），在主面板"调试测试"页签开启 `isWsService` 开关
3. 保存 `src/` 下任意文件，服务端 500ms 防抖后编译 `src/test/main.ts` 并推送，页面沙箱 `eval` 执行
4. 页面日志、代码返回值、`__wsReport(数据)` 直接回传到服务端 stdout —— 改完看服务端日志即可
5. 也可在页面控制台调用 `wsBuild()` 手动触发

> 该测试构建显式设置了 `minify: false`、`__DEV__: true`，所以热测试代码是可读的。

### 方案三：直接调试

- 浏览器控制台可访问 `unsafeWindow.mk_window`、`unsafeWindow.elUtil`、`unsafeWindow.urlUtil`（由 `dev/dev.ts` 暴露），以及 `window.mk_vue_app`（Vue 3 应用实例）
- `sourcemap: false`，主构建产物不可读；需要程序化操控页面时用 `node server/cdpClient.mjs`（见「构建文档 · CDP 页面调试」）

### 单元测试（`pnpm test`）

- 用例位于 `tests/**/*.test.ts`，配置见 `vitest.config.ts`（`jsdom` 环境 + `@vitejs/plugin-vue` + `@` 别名）
- 现有用例：`tests/shieldLog.test.ts`（屏蔽日志统一格式）、`tests/outputInformationView.test.ts`（输出信息视图）
- `pnpm test` 即 `vitest run`；**不在** `pnpm build` 链路中，需手动执行

---

## 质量关卡：无 CI / 无 Lint

项目没有 CI 流水线、pre-commit 钩子、husky 或 lint 配置。自动化的检查只有两项：

| 关卡 | 何时执行 | 是否阻塞 |
|------|------|------|
| `vue-tsc --noEmit` | `pnpm build` 的第一步 | 是，类型错误中断构建 |
| `vitest run` | 仅手动 `pnpm test` | 否，不在构建链路中 |

---

## 常见开发场景

### 新增一个屏蔽规则

1. 在 `config/ruleKeyListData.ts` 中定义规则键和类型
2. 在 `state/localMKData.ts` 中添加对应的 getter/setter（GM 存储读写）
3. 在 `domain/shielding/main.ts` 的屏蔽引擎中添加匹配逻辑
4. 在 `ui/views/rule/` 中添加规则配置的 UI 组件
5. 构建验证

### 新增一个页面适配

1. 在 `pages/` 下创建新目录（参考现有页面如 `search/`、`live/`）
2. 实现页面模型，暴露 `isUrlPage(url)`、`run()` 等方法
3. 在 `router.ts` 的 `staticRoute()` 中添加路由分发
4. 如果页面有 SPA 导航，在 `dynamicRouting()` 中添加对应处理
5. 在 `domain/observeNetwork.ts` 中添加 API 监听（如需网络触发）

### 修改 Tampermonkey 元信息

编辑 `tamper_monkey.json` 后执行 `pnpm build` 即可。新增 `@grant`、`@match`、`@require` 等直接添加对应字段，**键名必须带 `@` 前缀**（不带前缀会被 `readTamperMonkey()` 静默跳过）。注意安装壳的 `@require` 由 `vite.config.ts` 生成，改的是那三个 CDN 常量而不是 json。

### 修改全局常量

编辑 `config/globalValue.ts`，涉及 URL、功能开关、默认值等配置。

### 新增一个 UI 组件

1. 在 `ui/components/` 或 `ui/views/<对应页签>/` 下新建 `.vue`，用 `<script setup lang="ts">`（约定见「架构文档 · Vue 3 / Element Plus 组件写法约定」）
2. 需要通用工具时用 `@/core/util/...` 别名导入；跨模块通知走 `eventEmitter`
3. 消息提示统一 `ElMessage` / `ElNotification` / `ElMessageBox`，或用 `eventEmitter.emit('el-msg', ...)` 经 `ui/elBridge.ts` 转发
4. 需要组件级样式直接写 `<style>`（构建会内联）；需要以字符串注入的公共样式用 `?raw` 导入 CSS
5. `pnpm build` 验证类型检查通过，`pnpm test` 跑一遍现有用例

### 升级 Vue / Element Plus / Dexie 版本

三处必须同步：`vite.config.ts` 的 `VUE_URL` / `ELEMENT_PLUS_URL` / `DEXIE_URL`、`src/web/ui/init.ts` 里 EP CSS `<link>` 的版本号、以及 `node_modules` 中的开发依赖版本。改完重新构建并刷新页面验证外部库诊断日志（`[外部库诊断]`）无报错。
