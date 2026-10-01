# 构建文档

构建相关的完整说明：命令、产物、加载机制、Tampermonkey 元信息、构建配置细节。

## 构建与运行

### 命令一览

| 命令 | 实际执行 | 说明 |
|------|------|------|
| `pnpm build` | `vue-tsc --noEmit && vite build` | 生产构建（本地调试产物），产出三个文件（见「产物与加载方式」） |
| `pnpm build:release` | `vue-tsc --noEmit && vite build --mode publish` | **发布构建**：产出单文件自包含产物 `dist-release/publish.user.js`（见「发布专用产物」） |
| `pnpm watch:dev` | `vite build --watch` | 监听模式持续重建 `dist/local_build.js` |
| `pnpm ws` | `tsx server/wsServer.ts` | WebSocket 热测试通道 `ws://127.0.0.1:9000` |
| `pnpm test` | `vitest run` | 单元测试，用例位于 `tests/**/*.test.ts` |

### 发布专用产物（`pnpm build:release`）

脚本平台（脚本猫 / GreasyFork）上传要求**单个 JS 文件且头部即元信息**，而本地调试产物 `install.user.js` 的 `@require` 是 `file://` 本地路径、`local_build.js` 无头部——两者都不能直接发布。因此构建链提供发布模式：

- 构建方式：`pnpm build:release`（`vite build --mode publish`），输出到 **`dist-release/`**（与 `dist/` 完全隔离，互不覆盖）
- 产物：`dist-release/publish.user.js` = **完整头部元信息**（`generateTamperMeta` 生成）+ **全部应用代码**（vue / element-plus / dexie **全部内联打包**，`external: []`）
- 特点：无 `@require`、无 `file://` 路径；`__PUBLISH__` 编译期为 true，`externalLibraryVerification.ts` 跳过外部库验证（内联模式无需检查 `window.Vue` 等）
- 头部自动补 `@grant unsafeWindow`（`videoDanmakuFilter` / `defUtil` / `dev` 模块直接使用 `unsafeWindow`，本地 json 未声明，发布产物补全以保证运行）
- 发布流程：改 `tamper_monkey.json` 的 `@version`（如需指定版本）→ `pnpm build:release` → 上传 `dist-release/publish.user.js`
- 体积：内联全部依赖后约 1.8MB（gzip 约 513KB），脚本平台可接受；`chunkSizeWarningLimit` 已调大避免告警

> Element Plus 完整 CSS 仍由 `src/web/ui/init.ts` 运行时从 unpkg `<link>` 拉取（与本地模式一致），发布后在线可用，无需内联。

### 产物与加载方式（@require 拼接作用域）

构建链为 **Vite 7 + `@vitejs/plugin-vue`**，`build.lib` 以 `src/web/main.ts` 为入口输出单个 IIFE。一次构建产出三个文件：

| 产物 | 内容 |
|------|------|
| `dist/local_build.js` | 应用本体：无 `==UserScript==` 头的 IIFE 库，外部依赖以裸全局名引用 |
| `dist/vue-bridge.js` | 1 行桥接：把 `@require` 拼接作用域内的顶层 `var Vue` 显式挂到 `window` |
| `dist/install.user.js` | 安装壳：元信息头部 + 按序 `@require`（由 `writeInstallShell()` 生成） |

`@require` 顺序固定为：`vue.global.prod.js` → `vue-bridge.js` → `element-plus` full → `dexie` → `local_build.js`。

**为什么需要 `vue-bridge.js`**：油猴把同一脚本的所有 `@require` 拼接进同一作用域顺序执行，所以应用产物可以直接引用裸全局名。但 Vue 3 的全局构建用顶层 `var Vue` 声明，只存在于该拼接作用域内、不会挂到 `window`；而 Element Plus 的 UMD 在加载时读 `globalThis.Vue`，因此必须在 vue 之后、EP 之前插入这一层桥接。

**部署方式**：把 `dist/install.user.js` 内容粘贴到油猴脚本（`@require` 列表提前配好一次，需允许脚本访问 `file://` URL），之后每次构建只需重建 `local_build.js`，刷新页面即生效，**不重装、不改版本号**。

CDN 地址与版本常量集中在 `vite.config.ts` 顶部（`VUE_URL` / `ELEMENT_PLUS_URL` / `DEXIE_URL`）；Element Plus 的完整 CSS 由 `src/web/ui/init.ts` 运行时注入 `<link>`，其版本需与 `ELEMENT_PLUS_URL` 保持一致。

### 生产构建流程（`pnpm build`）

1. **类型检查**：`vue-tsc --noEmit`，按 `tsconfig.json` 的 `include` 同时覆盖 `.ts`、`.vue`、`.d.ts`。类型错误会阻塞构建。
2. **编译打包**：Vite 以 lib / IIFE 形式打包，`@vitejs/plugin-vue` 处理 SFC，Less 由 Vite 内置支持编译。
3. **样式内联**：`tampermonkeyPlugin.generateBundle` 收集所有 CSS chunk，从产物中删除，并以 `GM_addStyle("…")` 前置注入入口 chunk，交付仍为单文件。
4. **注释与压缩**：生产模式下 `minify: 'esbuild'`，并用正则移除块注释与单行注释；`emptyOutDir: true` 每次清空 `dist/`。
5. **附加产物**：`closeBundle` 钩子写出 `vue-bridge.js` 与 `install.user.js`。后者经 `plugin/mkUtil.ts` 的 `readTamperMonkey()` + `generateTamperMeta()` 由 `tamper_monkey.json` 生成头部，并剔除 dev 专用 match（`*://localhost:5173/*`）与 `@resource`。

> **CSS 导入约定**：需要以字符串拿到 CSS 内容（用于 `GM_addStyle` / `installStyle`）时必须加 `?raw`，如 `import css from './styles/def.css?raw'`；不带 `?raw` 的 CSS 导入会被 Vite 注入页面而不是返回字符串。

### 监听模式（`pnpm watch:dev`）

- `vite build --watch`：源文件变化时自动重建 `dist/local_build.js`，配合安装壳的 `@require file://` 直连，刷新页面即生效，无需复制代码。
- ⚠️ **当前 `watch:dev` 的产物与 `pnpm build` 完全同形**（压缩、去注释、`__DEV__ === false`）。原因在 `vite.config.ts` 的判定：`NODE_ENV === 'production' || process.argv.includes('build')`，而 `watch:dev` 执行的正是 `vite build --watch`，命令行含 `build` 即命中生产分支。实测 `vite build --watch` 的产物与生产构建 md5 一致。
  - 影响：本地 watch 构建拿不到可读代码；依赖 `__DEV__` 的调试页签（`App.vue` 的 `debug_panel_show`）在 watch 产物里也不会自动打开，改由 GM 开关 `isWsService` 保持可见。
  - 想要真正的 dev 产物，需要改判定以区分 `--watch`（或调整脚本命令），属代码改动，本文档只如实记录现状。
  - 需要可读、带注释的热执行代码时用 `pnpm ws`：`server/wsServer.ts` 显式设置了 `minify: false`、`__DEV__: true`。

### WebSocket 热测试通道（`pnpm ws`）

用于在真实页面上快速验证小段逻辑，无需重装或复制代码：

1. 运行 `pnpm ws`（`tsx server/wsServer.ts`），监听 `ws://127.0.0.1:9000`，服务启动即先构建一次
2. 客户端接入由 GM 开关 `isWsService` 控制（主面板"调试测试"页签，默认关闭）；`src/web/dev/webWs.ts` 连接后立即收到最新代码
3. 服务端 `fs.watch('src')` 监听源码变化，500ms 防抖后用 Vite programmatic API（`vite.build` + `write: false` 内存构建）编译 `src/test/main.ts` 并广播给所有已连接客户端
4. 客户端在沙箱中 `eval` 收到的代码；页面 `console.log/warn/error`、代码返回值、运行时错误与 `__wsReport(数据)` 全部回传到服务端 stdout —— 改完测试文件直接看服务端日志即可
5. 手动触发：页面控制台调用 `wsBuild()`（挂在 `unsafeWindow` 上）

- 测试入口 `src/test/main.ts` 支持 TS 语法与 `@/` 别名导入 `src/web` 模块（含 `.vue`）；它是热测试流程的入口模板，**不是测试套件**
- 构建失败时保留上次产物并打印原因，下次变更自动重试；端口 9000 被占用时给出 `netstat -ano | findstr :9000` 排查提示
- 客户端代码在生产构建中同样保留，是否连接只取决于 `isWsService`

### CDP 页面调试（`server/cdpClient.mjs`）

程序化操控真实页面（执行 JS、读 console、截图、导航）：`node server/cdpClient.mjs tabs|eval|console|shot|reload|goto`，`--tab 关键词` 选择标签页、`--port` 改端口。前提：Edge 以 `--remote-debugging-port=9222` 启动（正常重启后需再次带参数）。详见该文件头部注释。

---

## Tampermonkey 元信息

### 配置来源

元信息数据源为 `tamper_monkey.json`，**键名带 `@` 前缀**：

```json
{
    "@name": "哔哩哔哩屏蔽增强器",
    "@namespace": "http://tampermonkey.net/",
    "@version": "见发布渠道（发布版本由脚本猫等渠道管理，仓库内与线上不一定同步）",
    "@runAt": "document-start",
    "@noFrames": true,
    "@grant": ["GM_setValue", "GM_getValue", "GM_addStyle", "..."],
    "@match": ["*://www.bilibili.com/*", "*://localhost:5173/*", "..."],
    "@require": ["https://unpkg.com/dexie@4.2.0/dist/dexie.min.js"]
}
```

> `readTamperMonkey()` 只识别以 `@` 开头的键并剥掉前缀，**不带 `@` 的键会被静默跳过**（这就是 `"alias"`、`"homepage"` 不出现在产物头部的原因）。

### 生成流程

1. `vite.config.ts` 的 `writeInstallShell()`（在 `closeBundle` 钩子中调用）用 `plugin/mkUtil.ts` 的 `readTamperMonkey()` 读取配置，取 `notDevData`
2. 删掉 `resource`，并把 `require` 整体替换为「构建与运行」中那 5 条 `@require`（CDN + `file://`）—— 因此 `tamper_monkey.json` 里写的 `@require` 实际不会进入安装壳
3. `generateTamperMeta()` 按固定字段列表输出对齐的 `// ==UserScript==` 头部，写入 `dist/install.user.js`
4. `local_build.js` 自身**不带**头部：它是被 `@require` 的库文件

### 注意事项

- 产物头部只包含 `plugin/mkUtil.ts` 中 `TamperMetaOpts` 定义的字段（name/namespace/version/description/author/icon/license/homepageURL/supportURL/updateURL/downloadURL/run-at/noframes/match/include/exclude/grant/connect/require/resource/antifeature）；`@source` 之类的额外键会被丢弃
- `notDevData` 会剔除含 `localhost` 的 `@match`，dev 专用 match 不进安装壳
- Vue 3、Element Plus、Dexie 通过 `@require` 加载，**不打包**进产物（`element-plus/es/...` 子路径是例外，见「架构文档」的 UI 层说明）
- `dev/dev.ts` 与 ws 客户端始终进入生产包，是否生效由 GM 开关决定
- 添加 `@grant` / `@match` / `@require` 时编辑 `tamper_monkey.json` 后重新构建即可

---

## 构建配置细节

### 路径别名

`@/` → `src/web/`

三处需保持一致，均已配置：`tsconfig.json` 的 `paths`（供 `vue-tsc`）、`vite.config.ts` 的 `resolve.alias`（供主构建）、`server/wsServer.ts` 与 `vitest.config.ts` 的内联 alias（供热测试与测试）。

### 外部全局变量（`rollupOptions`）

```js
external: ['vue', 'element-plus', 'dexie']
globals: { vue: 'Vue', 'element-plus': 'ElementPlus', dexie: 'Dexie' }
```

三个库都由 `@require` 提供。由于应用与它们处于同一拼接作用域，产物里直接引用**裸全局名**（`Vue` / `ElementPlus` / `Dexie`），而不是 UMD 常见的 `globalThis.X` 访问。

注意 `external` 是**精确模块名**匹配：`element-plus/es/locale/lang/zh-cn` 这类子路径不算外部，会从 node_modules 打进产物。

### 构建插件

| 插件 | 位置 | 作用 |
|------|------|------|
| `@vitejs/plugin-vue` | `vite.config.ts` | 编译 `.vue` SFC（`<script setup>`、scoped style） |
| `tampermonkeyPlugin` | `vite.config.ts` | `enforce: 'post'`；`generateBundle` 把 CSS chunk 内联为 `GM_addStyle` 并在生产模式去注释；`closeBundle` 写出 `vue-bridge.js` 与 `install.user.js` |
| `plugin/mkUtil.ts` | 构建期辅助 | 元信息读取与头部生成 |

另有 `define: { __DEV__: JSON.stringify(!isProd) }` 提供编译期常量。

### 类型检查

`pnpm build` 的第一步 `vue-tsc --noEmit` 直接解析 `.vue`（含 `<script setup>` 与模板类型检查），不需要额外的 SFC 检查脚本。

`src/web/element-plus.d.ts`、`global.d.ts`、`shims-vue.d.ts` 由 `tsconfig.json` 的 `include` 自动纳入。

TypeScript 配置要点：`strict: true`、`moduleResolution: 'bundler'`、`allowImportingTsExtensions: true`（所以源码里普遍写 `import './x.ts'` 带扩展名）、`resolveJsonModule: true`、`types: ['tampermonkey', 'node']`、`target`/`lib` 为 `ES2021 + DOM + DOM.Iterable`。
