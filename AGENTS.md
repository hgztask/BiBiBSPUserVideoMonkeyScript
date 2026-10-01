# AGENTS.md

## 项目概述

**哔哩哔哩屏蔽增强器**（BIBIShield v2）：Tampermonkey 用户脚本，对 B 站视频、评论、直播间、动态等内容进行多维度屏蔽。技术栈：TypeScript（strict）+ Vue 3 + Element Plus + Vite 7，单文件交付（IIFE 应用库 + `@require` 外部依赖）。

## 常用命令

```bash
pnpm install          # 安装依赖（pnpm-lock.yaml 不提交）
pnpm build            # vue-tsc 类型检查 + Vite 生产构建 → dist/（本地调试产物）
pnpm build:release    # 发布构建 → dist-release/publish.user.js（单文件自包含，供脚本平台上传）
pnpm watch:dev        # Vite 监听模式持续构建到 dist/local_build.js
pnpm ws               # WebSocket 热测试通道 ws://127.0.0.1:9000
pnpm test             # Vitest 单元测试（tests/**/*.test.ts，不在构建链路，需手动执行）
```

- **类型检查**：`pnpm build` / `pnpm build:release` 先执行 `vue-tsc --noEmit`（覆盖 .ts 与 .vue），类型错误会阻塞构建。
- 生产模式移除注释；`.vue` 组件样式与 CSS 以 `GM_addStyle` 内联进 JS（单文件交付）。`local_build.js` **不含** `==UserScript==` 头，头部只出现在安装壳 `install.user.js` / 发布产物 `publish.user.js`。
- **产物分工**：
  - `dist/`（`pnpm build`）：本地调试三件套——`install.user.js`（安装壳，`@require file://` 直连本地）+ `local_build.js`（应用库）+ `vue-bridge.js`。
  - `dist-release/`（`pnpm build:release`）：发布专用 `publish.user.js`——头部元信息 + 全部依赖内联（vue/element-plus/dexie 全打包），无 `@require`/`file://`，**上传到脚本平台即被解析出完整元信息**。
  - 发布前如需指定版本号，先改 `tamper_monkey.json` 的 `@version` 再 `pnpm build:release`。

## 易错陷阱（优先排查）

- **`watch:dev` 产物与 `pnpm build` 完全同形**（压缩、去注释、`__DEV__ === false`，实测 md5 一致）。想要可读的热执行代码用 `pnpm ws`（`wsServer.ts` 里显式 `minify: false`、`__DEV__: true`）。
- **`elUtil.findElements` 匹配 0 个时立即返回 `[]`**（不悬挂、不报错）：DOM 结构变化导致选择器失效时整条链路静默无日志，排查问题先验证选择器是否命中（先例：BewlyCat 1.8.0 新增 `.video-card-slot` 层导致旧选择器命中 0 个、屏蔽完全静默失效）。
- **`tamper_monkey.json` 的 `@version` 与线上发布版本不同步**（发布版本由脚本猫等发布渠道管理），日常修复**不顺手改版本号**。
- **CSS 导入必须带 `?raw`**（`import css from './x.css?raw'`），不带 `?raw` 会被 Vite 注入页面而不是返回字符串。
- **`@require` 顺序固定**：vue.global.prod.js → vue-bridge.js → element-plus full → dexie → local_build.js。乱序会导致 Element Plus 读不到 `Vue`。
- **`pnpm-lock.yaml` 不提交**（`.gitignore` 已排除）。

## 路径别名

`@/` → `src/web/` — 在 `tsconfig.json` 配置 paths，构建时由 Vite 原生 alias 解析（`vite.config.ts` 与 `server/wsServer.ts` 均已配置），无需自定义插件。

## CSS 导入约定

需要以字符串形式拿到 CSS 内容（用于 `GM_addStyle`/`installStyle`）时，必须使用 `?raw` 后缀导入：`import css from './x.css?raw'`。不带 `?raw` 的 CSS 导入会被 Vite 注入页面而不是返回字符串。

## 外部全局变量与加载方式（demo 式 @require）

```js
external: ['vue', 'element-plus', 'dexie']
globals: { vue: 'Vue', 'element-plus': 'ElementPlus', dexie: 'Dexie' }
```

- **交付**：`pnpm build` 生成三个产物——`dist/local_build.js`（无头应用库，裸 `(Vue, ElementPlus, Dexie)`）、`dist/vue-bridge.js`、`dist/install.user.js`（安装壳模板）。
- **部署**：把 `dist/install.user.js` 内容粘贴到油猴脚本（`@require` 列表提前配好一次），之后每次构建只需重建 `local_build.js`（`@require file://` 直连本地，刷新页面即生效），**不重装、不改版本号**。
- **加载机制**（参考本地 demo：`mk-vue3-rollup-demo`）：所有 `@require` 在油猴中拼接为同一作用域执行，故应用产物用裸全局名。
- **vue-bridge.js 为什么必需**：Vue3 全局构建用顶层 `var Vue` 声明，只存在于 @require 拼接作用域内、不会挂 `window`；而 element-plus 的 UMD 在加载时读 `globalThis.Vue`，故需在 vue 之后、EP 之前用这 1 行桥接文件显式挂到 `window`。demo 无 EP 所以没有它。
- 修改 CDN 地址/版本：同步 `vite.config.ts` 的 `VUE_URL`/`ELEMENT_PLUS_URL`/`DEXIE_URL` 与 `src/web/ui/init.ts` 的 EP CSS 版本。
- Element Plus 的完整 CSS 在 `src/web/ui/init.ts` 运行时注入 `<link>`（unpkg element-plus/dist/index.css）。

> 加载机制与构建细节详见 [docs/build.md](docs/build.md)。

## 架构

```
src/web/
├── config/     # 静态数据（规则键、分区数据、常量）
├── core/       # 基础设施：HTTP、缓存、EventEmitter、工具函数
├── domain/     # 业务逻辑：屏蔽、CSS、网络监听
├── pages/      # 各页面入口逻辑（视频、直播、搜索、空间……）
├── state/      # 运行时状态，GM_setValue/GM_getValue 封装
├── ui/         # Vue 3 + Element Plus 组件（<script setup>）、弹窗、样式
├── dev/        # 开发辅助、WebSocket 热更新
├── main.ts     # 入口
└── router.ts   # 基于 URL 的页面路由
```

> 完整目录与架构分层详解见 [docs/architecture.md](docs/architecture.md)。

## 代码约定

### Vue 3 / Element Plus

- 所有 `.vue` 组件统一使用 `<script setup lang="ts">`（Composition API）
- 弹窗消息用 `ElMessage` / `ElNotification` / `ElMessageBox`（从 `element-plus` 导入），不再使用 `this.$message` 等 Vue2 实例方法
- `eventEmitter` 的 `el-msg`/`el-notify`/`el-alert`/`el-confirm`/`el-prompt` 事件由 `src/web/ui/elBridge.ts` 统一桥接到 Element Plus API（业务层继续走 eventEmitter）
- Element Plus 中文语言包：`app.use(ElementPlus, { locale: zhCn })`（`src/web/core/util/defUtil.ts` 的 `initVueApp`，`zhCn` 从 `element-plus/es/locale/lang/zh-cn` 导入，随产物打包）
- el-dialog/el-drawer 使用 `v-model`（Element Plus），不再是 `:visible.sync`
- 子组件双向绑定用 `v-model:propName` + `emit('update:propName')`，不再是 `.sync`
- el-checkbox/el-radio-button 的值属性为 `value`（Element Plus 2.x），不再是 `label`
- 表格列插槽统一 `#default="scope"`，旧 `v-slot`/`slot-scope` 写法不再支持
- `size="mini"` 已废除，用 `size="small"`
- el-dropdown 菜单放进 `#dropdown` 模板插槽

### 语言约定

- 所有注释、JSDoc、提示信息、commit message 均使用中文
- 代码标识符（变量名、函数名、类型名）使用英文
- 回复语言使用中文

## 文档分工

仓库文档分层，改动时保持分工，**不要跨文档重复维护**：

| 文档 | 面向 | 内容 |
|------|------|------|
| `README.md`（根目录） | GitHub 用户 | 简介、特色功能、安装、快速使用、链接；屏蔽类型只列概要 |
| `docs/mk.md` | 发布平台（脚本猫/GreasyFork） | 发布平台描述原文，37 种屏蔽类型完整列表**独占维护** |
| `docs/development.md` | 开发者 | 文档索引 + 文档分工 + 项目简介 + 环境搭建 + 外部资源 |
| `docs/build.md` | 开发者 | 构建与运行、Tampermonkey 元信息、构建配置细节 |
| `docs/architecture.md` | 开发者 | 项目结构、架构分层详解 |
| `docs/workflow.md` | 开发者 | 开发工作流、质量关卡、常见开发场景 |

## 提交规范

- 格式：`type(scope): 中文描述`，如 `fix(bewly): 适配 BewlyCat 1.8.0 视频网格 video-card-slot`、`docs: 拆分开发文档为多篇`。
- `type` 取值：`fix` / `feat` / `refactor` / `docs` / `chore` / `test`。
- **一提交一主题**：逻辑无关的改动拆成多个提交，不要混在一个提交里。
- commit message 使用中文（见语言约定）。

## 开发工作流

1. 修改代码（`src/web/` 下，注意路径别名与 CSS `?raw` 约定）
2. `pnpm build` 验证类型检查与构建（类型错误会阻塞）
3. `pnpm test` 跑现有用例（新增逻辑可补测试到 `tests/**/*.test.ts`）
4. 按提交规范提交；涉及文档分工边界时同步更新对应文档

## Tampermonkey 元信息

- 数据源：`tamper_monkey.json`（键名带 `@` 前缀，如 `"@name"`。`plugin/mkUtil.ts` 的 `readTamperMonkey()` 只读取带 `@` 前缀的键并剥掉前缀，不带 `@` 的键会被静默跳过）
- 产物头部只包含 `mkUtil.ts` 中 `TamperMetaOpts` 定义的固定字段（name/version/match/grant/require 等）；`@source`、`homepage` 等额外键不会出现在生成的头部
- 构建时 `vite.config.ts` 的 `tampermonkeyPlugin`（`closeBundle` 钩子 → `writeInstallShell()`）读取该文件，把头部写进 `dist/install.user.js`（`notDevData` 会剔除 localhost match，`@require` 则整体替换为 CDN + `file://` 那 5 条）
- 添加 `@grant`、`@match`、`@require` 等时，编辑 `tamper_monkey.json` 后重新构建即可

> 生成流程详见 [docs/build.md](docs/build.md)。

## 调试通道

- **WebSocket 热测试通道**（`pnpm ws`）：在真实页面上快速测试小脚本。服务端监听 `src/` 文件变更，用 Vite programmatic API（`vite.build`，`write:false` 内存构建）编译 `src/test/main.ts`（支持 TS 语法与 `@/` 别名导入 `src/web` 模块，含 .vue 文件）并推送给已连接的油猴客户端在沙箱中 eval 执行；客户端接入即推送最新代码。页面里的 `console.log/warn/error`、测试代码返回值、运行时错误、`__wsReport(数据)` 都会回传到服务端 stdout——**改完测试文件直接看服务端日志即可**。手动触发：页面控制台调用 `wsBuild()`。构建失败保留上次产物并打印原因，下次变更自动重试。
- 客户端连接由 GM 开关 `isWsService` 控制（默认关闭）。开关在主面板"调试测试"页签：只要该开关开启过就保持可见（`App.vue` 的 `ws_panel_show = __DEV__ || isWsService()`）；`debug_panel_show` 仍只由 `__DEV__` 决定（按易错陷阱第一条，当前各地产物都为 false）。
- **CDP 页面调试**（`server/cdpClient.mjs`）：程序化操控真实页面（执行 JS、读 console、截图、导航）。前提：Edge 以 `--remote-debugging-port=9222` 启动（Edge 正常重启后失效，需再次带参数启动）。用法：`node server/cdpClient.mjs tabs|eval|console|shot|reload|goto`，`--tab 关键词` 选择标签页，`--port` 改端口，详见 `server/cdpClient.mjs` 头部注释。
- `src/test/main.ts` 是 WebSocket 热测试流程的入口模板，**不是**测试套件。真正的测试套件在 `tests/`（Vitest + @vue/test-utils + jsdom，配置见 `vitest.config.ts`），用 `pnpm test` 运行。
- 无 CI、无 pre-commit 钩子、无 lint 配置。自动化关卡只有 `vue-tsc --noEmit`（阻塞 `pnpm build`）和 Vitest（需手动 `pnpm test`，不在构建链路中）。
- `plugin/mkUtil.ts` 提供了 `readTamperMonkey` 辅助函数，可用于编程方式读取配置。
- ws 客户端（`src/web/dev/webWs.ts`）在生产构建中保留，是否连接由 GM 开关 `isWsService` 控制（默认关闭）。
