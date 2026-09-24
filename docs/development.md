# 开发文档

## 一、项目简介

**哔哩哔哩屏蔽增强器**（BIBIShield v2）是一个 Tampermonkey 用户脚本，用于对 B 站的视频、评论、直播间、动态等内容进行多维度的屏蔽和过滤。

| 项目      | 说明                                                        |
|---------|-----------------------------------------------------------|
| 语言      | TypeScript (strict mode)                                  |
| UI 框架   | Vue 3.5 + Element Plus 2.14（全部组件为 `<script setup>`）       |
| 构建工具    | Vite 7（`build.lib` 输出单个 IIFE）+ `@vitejs/plugin-vue`       |
| 类型检查    | `vue-tsc --noEmit`（同时覆盖 `.ts` 与 `.vue`）                   |
| 样式      | CSS / Less，以 `?raw` 字符串导入后用 `GM_addStyle` 注入              |
| 包管理器    | pnpm                                                      |
| 测试      | Vitest + @vue/test-utils + jsdom                          |
| 存储      | Dexie 4 (IndexedDB)、localStorage、GM_setValue/GM_getValue   |
| 运行环境    | Tampermonkey / ScriptCat                                  |

---

## 二、环境搭建

### 2.1 前置要求

- Node.js >= 20.19（Vite 7 的最低要求，实测 v24 可用）
- pnpm（必须使用 pnpm，不要用 npm）

### 2.2 安装依赖

```bash
pnpm install
```

> `.gitignore` 排除了 `pnpm-lock.yaml`，lockfile **不提交**到版本控制。

---

## 三、构建与运行

### 3.1 命令一览

| 命令 | 实际执行 | 说明 |
|------|------|------|
| `pnpm build` | `vue-tsc --noEmit && vite build` | 生产构建，产出三个文件（见 3.2） |
| `pnpm watch:dev` | `vite build --watch` | 监听模式持续重建 `dist/local_build.js` |
| `pnpm ws` | `tsx server/wsServer.ts` | WebSocket 热测试通道 `ws://127.0.0.1:9000` |
| `pnpm test` | `vitest run` | 单元测试，用例位于 `tests/**/*.test.ts` |

### 3.2 产物与加载方式（@require 拼接作用域）

构建链为 **Vite 7 + `@vitejs/plugin-vue`**，`build.lib` 以 `src/web/main.ts` 为入口输出单个 IIFE。一次构建产出三个文件：

| 产物 | 内容 |
|------|------|
| `dist/local_build.js` | 应用本体：无 `==UserScript==` 头的 IIFE 库，外部依赖以裸全局名引用 |
| `dist/vue-bridge.js` | 1 行桥接：把 `@require` 拼接作用域内的顶层 `var Vue` 显式挂到 `window` |
| `dist/install.user.js` | 安装壳：元信息头部 + 按序 `@require`（由 `writeInstallShell()` 生成） |

`@require` 顺序固定为：`vue.global.prod.js` → `vue-bridge.js` → `element-plus` full → `dexie` → `local_build.js`。

**为什么需要 `vue-bridge.js`**：油猴把同一脚本的所有 `@require` 拼接进同一作用域顺序执行，所以应用产物可以直接引用裸全局名。但 Vue 3 的全局构建用顶层 `var Vue` 声明，只存在于该拼接作用域内、不会挂到 `window`；而 Element Plus 的 UMD 在加载时读 `globalThis.Vue`，因此必须在 vue 之后、EP 之前插入这一层桥接。参考的 demo 项目没有 EP，所以不需要它。

**部署方式**：把 `dist/install.user.js` 内容粘贴到油猴脚本（`@require` 列表提前配好一次，需允许脚本访问 `file://` URL），之后每次构建只需重建 `local_build.js`，刷新页面即生效，**不重装、不改版本号**。

CDN 地址与版本常量集中在 `vite.config.ts` 顶部（`VUE_URL` / `ELEMENT_PLUS_URL` / `DEXIE_URL`）；Element Plus 的完整 CSS 由 `src/web/ui/init.ts` 运行时注入 `<link>`，其版本需与 `ELEMENT_PLUS_URL` 保持一致。

### 3.3 生产构建流程（`pnpm build`）

1. **类型检查**：`vue-tsc --noEmit`，按 `tsconfig.json` 的 `include` 同时覆盖 `.ts`、`.vue`、`.d.ts`。类型错误会阻塞构建，无需额外的 SFC 检查脚本（旧的 `scripts/check-vue-types.mjs` 已随迁移删除）。
2. **编译打包**：Vite 以 lib / IIFE 形式打包，`@vitejs/plugin-vue` 处理 SFC，Less 由 Vite 内置支持编译。
3. **样式内联**：`tampermonkeyPlugin.generateBundle` 收集所有 CSS chunk，从产物中删除，并以 `GM_addStyle("…")` 前置注入入口 chunk，交付仍为单文件。
4. **注释与压缩**：生产模式下 `minify: 'esbuild'`，并用正则移除块注释与单行注释；`emptyOutDir: true` 每次清空 `dist/`。
5. **附加产物**：`closeBundle` 钩子写出 `vue-bridge.js` 与 `install.user.js`。后者经 `plugin/mkUtil.ts` 的 `readTamperMonkey()` + `generateTamperMeta()` 由 `tamper_monkey.json` 生成头部，并剔除 dev 专用 match（`*://localhost:5173/*`）与 `@resource`。

> **CSS 导入约定**：需要以字符串拿到 CSS 内容（用于 `GM_addStyle` / `installStyle`）时必须加 `?raw`，如 `import css from './styles/def.css?raw'`；不带 `?raw` 的 CSS 导入会被 Vite 注入页面而不是返回字符串。

### 3.4 监听模式（`pnpm watch:dev`）

- `vite build --watch`：源文件变化时自动重建 `dist/local_build.js`，配合安装壳的 `@require file://` 直连，刷新页面即生效，无需复制代码。
- 旧版 rollup watch + `localhost:3000` 静态服务已随构建链迁移一并移除。
- ⚠️ **当前 `watch:dev` 的产物与 `pnpm build` 完全同形**（压缩、去注释、`__DEV__ === false`）。原因在 `vite.config.ts` 的判定：`NODE_ENV === 'production' || process.argv.includes('build')`，而 `watch:dev` 执行的正是 `vite build --watch`，命令行含 `build` 即命中生产分支。实测 `vite build --watch` 的产物与生产构建 md5 一致。
  - 影响：本地 watch 构建拿不到可读代码；依赖 `__DEV__` 的调试页签（`App.vue` 的 `debug_panel_show`）在 watch 产物里也不会自动打开，改由 GM 开关 `isWsService` 保持可见。
  - 想要真正的 dev 产物，需要改判定以区分 `--watch`（或调整脚本命令），属代码改动，本文档只如实记录现状。
  - 需要可读、带注释的热执行代码时用 `pnpm ws`：`server/wsServer.ts` 显式设置了 `minify: false`、`__DEV__: true`。

### 3.5 WebSocket 热测试通道（`pnpm ws`）

用于在真实页面上快速验证小段逻辑，无需重装或复制代码：

1. 运行 `pnpm ws`（`tsx server/wsServer.ts`），监听 `ws://127.0.0.1:9000`，服务启动即先构建一次
2. 客户端接入由 GM 开关 `isWsService` 控制（主面板"调试测试"页签，默认关闭）；`src/web/dev/webWs.ts` 连接后立即收到最新代码
3. 服务端 `fs.watch('src')` 监听源码变化，500ms 防抖后用 Vite programmatic API（`vite.build` + `write: false` 内存构建）编译 `src/test/main.ts` 并广播给所有已连接客户端
4. 客户端在沙箱中 `eval` 收到的代码；页面 `console.log/warn/error`、代码返回值、运行时错误与 `__wsReport(数据)` 全部回传到服务端 stdout —— 改完测试文件直接看服务端日志即可
5. 手动触发：页面控制台调用 `wsBuild()`（挂在 `unsafeWindow` 上）

- 测试入口 `src/test/main.ts` 支持 TS 语法与 `@/` 别名导入 `src/web` 模块（含 `.vue`）；它是热测试流程的入口模板，**不是测试套件**
- 构建失败时保留上次产物并打印原因，下次变更自动重试；端口 9000 被占用时给出 `netstat -ano | findstr :9000` 排查提示
- 客户端代码在生产构建中同样保留，是否连接只取决于 `isWsService`

### 3.6 CDP 页面调试（`server/cdpClient.mjs`）

程序化操控真实页面（执行 JS、读 console、截图、导航）：`node server/cdpClient.mjs tabs|eval|console|shot|reload|goto`，`--tab 关键词` 选择标签页、`--port` 改端口。前提：Edge 以 `--remote-debugging-port=9222` 启动（正常重启后需再次带参数）。详见该文件头部注释。

---

## 四、项目结构

### 4.1 顶层目录

```
station_b_shield/
├── plugin/                   # 构建期辅助（已无 Rollup 插件）
│   ├── mkUtil.ts             # Tampermonkey 元信息读取与生成
│   └── tsconfig.json         # 该目录的 TypeScript 配置
├── server/
│   ├── wsServer.ts           # WebSocket 热测试服务（Vite 内存构建）
│   └── cdpClient.mjs         # CDP 页面调试客户端
├── src/
│   ├── test/main.ts          # 热测试通道的构建入口（非测试套件）
│   └── web/                  # 主源码目录
├── tests/                    # Vitest 单元测试（`*.test.ts`）
├── dist/                     # 构建产物（gitignore 排除）
├── tamper_monkey.json        # Tampermonkey 元信息配置（数据源）
├── vite.config.ts            # Vite 构建配置（含 tampermonkeyPlugin）
├── vitest.config.ts          # 测试配置（jsdom + vue 插件 + `@` 别名）
├── tsconfig.json             # TypeScript 配置（strict，由 vue-tsc 使用）
└── package.json
```

> 构建链迁移后已不存在 `rollup.config.mjs`、`plugin/rollup-test-plugin.ts`、`plugin/tsResolve.ts`、`scripts/check-vue-types.mjs`。
> `test/`（单数）是 gitignore 的个人草稿目录，与 `tests/` 无关。

### 4.2 主源码目录（`src/web/`）

```
src/web/
├── config/               # 静态配置层
│   ├── globalValue.ts    # 全局常量
│   ├── ruleKeyListData.ts    # 规则键列表
│   ├── ruleKeyListDataJson.json # 规则键列表数据
│   ├── otherKeyListDataJson.json # 其他规则键列表数据
│   ├── video_zoneData.ts     # 视频分区数据
│   └── video_zone.json       # 视频分区 JSON 数据
├── types/                # 类型定义层
│   ├── http.ts           # HTTP 相关类型定义
│   ├── shielding.ts      # 屏蔽相关类型定义
│   ├── storage.ts        # 存储相关类型定义
│   ├── video.ts          # 视频相关类型定义
│   └── homeResponse.ts   # 首页推荐响应层类型
├── core/                 # 基础设施层
│   ├── cache/            # 缓存模块
│   │   ├── bvDexie.ts    # IndexedDB（Dexie）封装
│   │   ├── valueCache.ts # 内存缓存
│   │   ├── videoCacheManager.ts
│   │   ├── asynchronousIntervalQueue.ts
│   │   └── IntervalExecutor.ts
│   ├── http/             # HTTP 请求
│   │   ├── bFetch.ts     # B 站 API 请求封装（含 WBI 签名）
│   │   ├── bvRequestQueue.ts  # 请求队列
│   │   └── TmRequest.ts  # 油猴跨域请求封装
│   ├── util/             # 工具函数
│   │   ├── elUtil.ts     # DOM 操作
│   │   ├── defUtil.ts    # 通用工具（含 `initVueApp`）
│   │   ├── urlUtil.ts    # URL 解析
│   │   ├── ruleUtil.ts   # 规则处理
│   │   ├── ruleMatchingUtil.ts  # 规则匹配
│   │   ├── strFormatUtil.ts
│   │   ├── crc32Util.ts
│   │   └── arrUtil.ts
│   ├── EventEmitter.ts   # 事件总线（全局单例）
│   ├── elEventEmitter.ts # DOM 元素级事件总线
│   ├── shieldLog.ts      # 屏蔽日志统一输出格式
│   ├── BilibiliEncoder.ts    # B 站编码工具（含 WBI 签名）
│   └── externalLibraryVerification.ts  # 外部库（Vue/EP/Dexie）加载验证
├── domain/               # 领域逻辑层
│   ├── shielding/        # 屏蔽核心
│   │   ├── main.ts       # 屏蔽引擎
│   │   ├── video.ts      # 视频屏蔽
│   │   ├── live.ts       # 直播屏蔽
│   │   ├── comments.ts   # 评论屏蔽
│   │   └── combinationRules.ts  # 组合规则
│   ├── cssManager.ts     # 样式管理
│   ├── homeResponseRewrite.ts    # 首页推荐响应层过滤
│   ├── searchResponseRewrite.ts  # 搜索结果响应层过滤
│   ├── commentResponseRewrite.ts # 评论区响应层过滤（全局安装）
│   ├── liveSectionResponseRewrite.ts # 直播分区getList响应层过滤
│   ├── videoDanmakuFilter.ts     # 视频弹幕过滤
│   ├── videoDanmakuInspector.ts  # 视频弹幕巡检
│   ├── observeNetwork.ts # 网络请求监听与分发
│   ├── notificationBlocking.ts  # 通知屏蔽
│   ├── replaceKeywords.ts      # 关键词替换
│   ├── watchUtil.ts      # 观察器工具（URL 变化、网络、DOM）
│   └── debuggerManagement.ts   # 调试管理（含 ws 连接开关）
├── pages/                # 页面入口层
│   ├── home/             # 首页
│   ├── video/            # 视频播放页
│   ├── live/             # 直播页
│   ├── search/           # 搜索页
│   ├── space/            # 个人空间
│   ├── dynamic/          # 动态页
│   ├── message/          # 消息页
│   ├── popular/          # 热门页
│   ├── history/          # 历史记录
│   ├── biliGame.ts       # B 站游戏页
│   ├── partition.ts      # 分区页面处理
│   ├── topicDetail.ts    # 话题详情页处理
│   ├── commentSectionModel.ts  # 评论区通用模型
│   ├── userProfile.ts    # 用户资料处理
│   └── topColumnProcessing.ts  # 顶部栏处理
├── state/                # 运行时状态层
│   ├── localMKData.ts    # GM_setValue/GM_getValue 封装（所有可配置项的 getter/setter）
│   └── elData.ts         # DOM 元素缓存
├── ui/                   # UI 层（Vue 3 SFC，统一 `<script setup lang="ts">`）
│   ├── App.vue           # 主面板根组件
│   ├── init.ts           # UI 初始化：注入 EP 样式、创建应用、注册全局组件
│   ├── elBridge.ts       # eventEmitter 的 el-* 事件 → Element Plus 消息 API
│   ├── components/       # 通用组件：GzSpace、GzText、SwitchMinMaxInputCard、
│   │                     #   addRuleDialog、cardSlider、videoMetricsFilterItem
│   ├── dialogs/          # 弹窗：sheetDialog、viewRulesRuleDialog、
│   │                     #   multipleRuleEditDialog、ruleSetValueDialog、
│   │                     #   lookContentDialog、showImgDialog
│   ├── views/            # 视图页面
│   │   ├── rule/         # 规则管理
│   │   ├── shield/       # 屏蔽操作
│   │   ├── page/         # 页面处理
│   │   ├── settings/     # 设置面板
│   │   ├── glory/        # 荣耀等级
│   │   ├── debug/        # 调试面板
│   │   ├── aboutAndFeedbackView.vue  # 关于与反馈视图
│   │   ├── blacklistManagementView.vue  # 黑名单管理视图
│   │   ├── bulletWordManagementView.vue # 弹幕词管理视图
│   │   ├── commentWordLimitView.vue     # 评论字数限制视图
│   │   ├── otherParameterFilterView.vue # 其他参数过滤视图
│   │   ├── replProcessingView.vue       # 回复处理视图
│   │   └── UserLevelFilteringView.vue   # 用户等级过滤视图
│   ├── styles/           # 样式文件：以 .css 为主，仅 defHome.less 用 Less；
│   │                     #   均以 `?raw` 导入后由 GM_addStyle 注入
│   ├── excludeURLs.ts    # URL 排除逻辑
│   └── output_informationTab.ts # 输出信息标签
├── dev/                  # 开发辅助（生产包同样保留，由 GM 开关控制是否生效）
│   ├── dev.ts            # 暴露 unsafeWindow.mk_window/elUtil/urlUtil，按开关连 ws
│   └── webWs.ts          # WebSocket 客户端与沙箱执行
├── main.ts               # 脚本入口
├── router.ts             # 基于 URL 的页面路由
├── menu.ts               # Tampermonkey 菜单注册
├── element-plus.d.ts     # Element Plus 相关类型声明
├── global.d.ts           # 全局变量、`__DEV__`、window 扩展声明
└── shims-vue.d.ts        # `.vue` 与 `*.css?raw` / `*.less?raw` 模块声明
```

---

## 五、架构分层详解

### 5.1 启动流程（`main.ts`）

脚本以 `@run-at document-start` 注入，`main.ts` 的启动顺序如下：

1. **模块副作用导入**：四个响应层过滤模块（`homeResponseRewrite` / `searchResponseRewrite` / `commentResponseRewrite` / `liveSectionResponseRewrite`，需尽早安装页面侧 fetch hook）、`menu.ts`（注册菜单）、`externalLibraryVerification.ts`（验证 `window.Vue` / `window.ElementPlus` / `window.Dexie` 已由 `@require` 就绪，缺失即弹窗提示并抛错）、`ui/init.ts`（挂载 UI）、`notificationBlocking.ts`、`replaceKeywords.ts`、`videoDanmakuFilter.ts`、`videoDanmakuInspector.ts`、`dev/dev.ts`
2. **路由初始化**：导入 `router.ts` 注册路由
3. **首屏路由**：按 `document.readyState` 判断 —— 已是 `complete` 则立即执行 `router.staticRoute()`，否则监听 `window.load`（`@require` 拼接作用域下可能已错过事件）
4. **监听注册**：
   - `watchUtil.addEventListenerUrlChange()` 启动 URL 轮询（每秒检查 `location.href`），变化时调用 `router.dynamicRouting()`
   - `watchUtil.addEventListenerNetwork()` 用 `PerformanceObserver` 监听网络请求，回调 `observeNetwork.observeNetwork()`

### 5.2 路由系统（`router.ts`）

路由系统分为两个阶段：

- **`staticRoute(title, url)`**：页面首次加载时调用，执行完整的页面初始化逻辑（首页、视频、直播、搜索、空间等各页面模型）。
- **`dynamicRouting(title, url)`**：SPA 导航时调用（URL 变化但页面未刷新），只执行部分逻辑（直播间检测、消息页面、搜索用户标签等）。

URL 变化检测通过 `watchUtil.addEventListenerUrlChange()` 实现，原理是每 1000ms 轮询 `window.location.href`，发现变化则触发回调。

### 5.3 事件系统（`EventEmitter.ts`）

项目实现了自定义事件总线，分为两种事件类型：

**常规事件（Regular Events）：**
- `on(eventName, callback, overrideEvents?)` — 订阅事件，可选是否覆盖已注册回调
- `emit(eventName, ...data)` — 同步触发事件，无 preHandle 预处理、无 futures 缓存，handler 未注册则静默丢弃
- `emitAsync(eventName, ...data)` — 异步触发事件，通过 `setTimeout` 将 handler 执行推迟到下一个 macrotask，避免同步序言阻塞当前调用栈中的微任务执行
- `send(eventName, ...data)` — 发布事件，经 preHandle 预处理后投递，无订阅者时进入 futures 队列待补发
- `sendAsync(eventName, ...data)` — 异步发送事件，与 send 语义一致（支持 preHandle 和 futures），但延迟到下一个 macrotask 执行
- `sendDebounce(eventName, ...data)` — 防抖发布（默认 1500ms）
- `setDebounceWaitTime(eventName, wait)` — 设置指定事件的防抖等待时长（毫秒）
- `onPreHandle(eventName, callback)` — 注册预处理钩子，在 send/sendAsync 投递前对参数进行转换
- `off(eventName)` — 取消订阅

**回调事件（Callback Events）：**
- `handler(eventName, callback)` — 注册回调处理器，与 invoke 配合实现 Promise 风格请求/响应模式
- `invoke(eventName, ...data)` — 返回 Promise，轮询等待 handler 注册后执行并返回结果
- `setInvokeInterval(interval)` — 设置 invoke 轮询 handler 的间隔时间（毫秒）

**调试方法：**
- `getEvents()` — 获取 internal regularEvents 和 callbackEvents 快照，用于调试检查

全局单例 `eventEmitter` 在各模块中共享。

### 5.4 网络监听机制

流程如下：

```
性能监听器 (PerformanceObserver)
        ↓
watchUtil.addEventListenerNetwork(callback)
        ↓
observeNetwork.observeNetwork(url, windowUrl, winTitle, initiatorType)
        ↓
根据 API 端点分发到对应页面模型
  ├─ 首页推荐 → bilibiliHome.startDebounceShieldingHomeVideoList()
  ├─ 评论区 → 发送 'event-检查评论区屏蔽'
  ├─ 热门 → popularAll.startShieldingVideoList()
  └─ 个人空间动态 → space.checkUserSpaceShieldingDynamicContentThrottle()
```

- 使用 `PerformanceObserver` 监听 `resource` 类型性能条目
- 匹配 B 站 API 端点（如 `x/web-interface/wbi/index/top/feed/rcmd`）来触发对应屏蔽逻辑
- 可配置排除页面和仅首页屏蔽模式

### 5.5 首页视频列表静默补载（`pages/home/bilibili.ts`）

#### 问题背景

首页推荐列表使用 B 站自身的懒加载机制。屏蔽规则在页面渲染后移除大量卡片，或首页推荐响应过滤提前删除条目后，列表高度可能不足以触发页面的下一次滚动检查，后续内容会停留在骨架状态。旧实现通过定时检查卡片数量并执行平滑滚动解决，但会改变用户视口位置，也会在列表尾部克隆骨架卡片，存在用户观感和加载可靠性问题。

#### 当前实现

首页标准页面初始化后启动静默补载控制器，Bilibili-Gate 和 Bewly 兼容模式不参与该流程。控制器通过以下状态判断列表是否需要补载：

- `.container.is-version8` 中的真实视频卡片数量。
- `.bili-video-card__skeleton` 骨架卡片数量及其视口附近数量。
- 首页列表底部与视口底部的距离。

需要补载时，控制器记录当前 `scrollY`，临时将页面定位到底部触发 B 站原生滚动加载检查，再立即恢复原滚动位置。触发过程不使用平滑滚动，不插入假卡片，也不显示按钮。每次尝试后等待真实 DOM 状态变化，只有真实卡片增加、骨架状态变化或列表布局推进时，才允许继续下一次尝试。

#### 配置项

配置存储在 `GM_setValue` 中：

| 配置项 | 默认值 | 说明 |
|---|---:|---|
| `home_feed_load_attempts_gm` | `3` | 一次连续补载事件允许的最多尝试次数；设置为 `0` 表示关闭；不设置代码硬上限 |

用户可以在主面板“首页”页签修改“首页列表连续补载次数”。当一次尝试没有检测到列表状态变化、加载哨兵消失或等待超时，控制器会停止本轮补载，避免异常情况下持续触发请求。

旧配置 `is_automatic_scrolling_gm` 已废弃，首页不再提供“检查视频列表数量模拟鼠标上下滚动”开关。脚本进入标准首页时会清理该旧配置值。

### 5.6 直播分区响应层过滤与饥饿提示（`domain/liveSectionResponseRewrite.ts` + `pages/live/sectionModel.ts`）

#### 问题背景

直播分区页（`live.bilibili.com/p/eden/area-tags`）的直播间列表由页面自身 fetch `api.live.bilibili.com/xlive/web-interface/v1/second/getList` 加载。DOM 层屏蔽在渲染后删除卡片，会造成列表高度骤降的闪烁观感。更棘手的是“滚动加载饿死”：页面只监听 document 的 scroll 事件，当屏蔽规则命中率高、过滤后卡片填不满一屏时，文档高度小于视口、无滚动空间，页面自身的续载永远不触发。

#### 响应层过滤

`liveSectionResponseRewrite.ts` 采用与首页/搜索/评论响应过滤相同的双层架构：

- **页面上下文 fetch hook**（注入 `<script>`）：拦截 getList 响应，把 `data.list` 通过 `postMessage` 发往沙箱判定；超时（2000ms）或改写异常时放行原始响应并输出 `console.warn('[station-b-shield] ...')` 便于诊断。
- **沙箱判定**：复用 `shieldingLiveRoom` 规则引擎逐项判定，命中索引回传页面 hook 在渲染前剔除。屏蔽记录经事件 `屏蔽直播信息` 输出到面板，来源标记【响应层过滤】；相同指纹 10 秒窗口去重（B 站同页会重复请求 getList）。

开关 `is_live_section_response_rewrite_gm` 默认开启（主面板“直播分区”页签）。

#### 饥饿提示与补满按钮（sectionModel.ts）

响应过滤解决闪烁，但会加剧饿死——这部分由右下角常驻按钮承担：

- **饥饿检测提示**：MutationObserver 监听列表增删（300ms 防抖）+ 首屏 1.5s 首评；列表不满一屏（列表底部文档坐标 ≤ 视口高 + 200px）时按钮变红呼吸并改文案“屏蔽后列表过短，点击补满一屏”，明确告知用户由手动触发恢复，而非脚本静默处理。
- **点击补满一屏**：循环「递增撑高 body + 真实滚动到底 → 等 getList 响应到达（PerformanceObserver，只认 observe 之后新条目，主脚本会 clearResourceTimings 故不能用全量缓冲做基线）→ 等列表 MutationObserver 静默（300ms 无增删，上限 2.5s）→ 文档坐标测满屏」。停止条件：满屏 / 4s 无新响应（到底）/ 滚动目标不变 / 10 轮上限。
- **到底冷却**：整轮补满未等到任何 getList 响应视为分区到底，按钮熄灭并 60s 冷却不再提示。
- 撑高用 `dataset` 保存原始内联高度、循环期间保持、结束一次性复原，规避中途复原的列表跳动与 prevMinHeight 循环污染问题。

### 5.7 评论区响应层过滤（`domain/commentResponseRewrite.ts`）

#### 问题背景

评论区屏蔽的 DOM 层实现在渲染后删除命中评论，存在评论闪现后消失的观感。评论接口在视频、影视、动态详情、用户空间等页面共用，若按"页面 + 开关"条件安装（如首页/搜索/直播分区响应过滤的做法），逐页维护页面清单容易漏页——例如影视播放页路径为 `/bangumi/play/` 而非 `/video/`，直接打开时响应层不会生效。

#### 全局安装

评论响应层采用**全局安装**：总开关 `is_comment_response_rewrite_gm` 开启后不依赖首屏页面，页面侧 fetch hook 按 URL 自动只拦截 `api.bilibili.com` 的评论主楼/楼中楼接口（`/x/v2/reply/wbi/main`、`/x/v2/reply/main`、`/x/v2/reply/reply`），视频/影视/动态/空间等任何页面直接打开即生效，SPA 跳转后仍持续拦截。

#### 双层架构

- **页面上下文 fetch hook**（注入 `<script>`）：拦截评论响应，递归收集顶层评论与嵌套预览（楼中楼），携带 `rpid` 供沙箱按 rpid 集合剔除所有出现位置；800ms 超时或改写异常时放行原始响应，退化为 DOM 层兜底。
- **沙箱判定**：复用 `shieldingComment` 规则引擎逐项判定，命中索引回传页面 hook 在渲染前剔除。屏蔽记录经事件 `屏蔽评论信息` 输出到面板，来源标记【响应层过滤】；同一评论在响应中出现多处时按 `rpid` 去重只输出一条。

#### 配置项

| 配置项 | 默认值 | 说明 |
|---|---:|---|
| `is_comment_response_rewrite_gm` | `false` | 评论区响应过滤总开关（主面板"播放页"页签"响应过滤评论区（实验）"）；关闭评论屏蔽时无效，修改后需刷新页面 |

旧开关 `is_dynamic_comment_response_rewrite_gm`（动态详情评论区响应过滤）已合并进总开关，不保留兼容。

### 5.8 屏蔽引擎（`domain/shielding/main.ts`）

核心接口：

```typescript
interface BlockResult {
    state: boolean;       // true = 需要屏蔽
    type?: string;        // 匹配类型
    matching?: string | number | boolean;  // 匹配到的内容
    msg?: string;         // 提示信息
}

interface BlockButtonData {
    data: {
        insertionPositionEl: HTMLElement;  // 插入位置
        uid?: number;       // 用户 ID
        name?: string;      // 用户名
        bv?: string;        // 视频 BV 号
        title?: string;     // 视频标题
        roomId?: number | string;  // 直播间 ID
        // ...
    };
    updateFunc?: (el: HTMLElement) => any;
    maskingFunc?: () => void;
    mouseoverFun?: (buttonEl: HTMLElement) => void;
}
```

屏蔽引擎从 `localMKData` 读取用户配置的规则（关键词、正则、时长、播放量等），遍历规则列表进行匹配，返回 `BlockResult` 决定是否屏蔽。

### 5.9 数据存储

- **`state/localMKData.ts`**：封装 `GM_setValue` / `GM_getValue`，为所有用户可配置的设置提供类型安全的 getter/setter，如屏蔽规则、UI 偏好、功能开关等。
- **`core/cache/bvDexie.ts`**：基于 Dexie（IndexedDB）的视频元数据缓存，含 TTL 过期策略。Dexie 同样由 `@require` 提供，不打包。
- **`core/cache/valueCache.ts`**：轻量级内存缓存。

### 5.10 类型系统（`types/`）

项目将共享类型定义集中到 `src/web/types/` 目录：

| 文件 | 内容 |
|------|------|
| `http.ts` | HTTP 请求/响应、WBI 签名相关类型 |
| `shielding.ts` | 屏蔽结果、屏蔽按钮数据、规则匹配类型 |
| `storage.ts` | 存储模块类型（规则、配置项） |
| `video.ts` | 视频元数据、分区信息类型 |
| `homeResponse.ts` | 首页推荐响应层的数据结构类型 |

此外，以下 `.d.ts` 声明文件位于 `src/web/` 根目录：

| 文件 | 作用 |
|------|------|
| `element-plus.d.ts` | 引入 `ElMessage` / `ElNotification` / `ElMessageBox` 的按需样式模块，保证这些组件不依赖额外样式注入即可用 |
| `global.d.ts` | `/// <reference types="tampermonkey" />`、编译期常量 `__DEV__`、`window.Vue` / `window.ElementPlus` 及 `Element` 扩展声明 |
| `shims-vue.d.ts` | `.vue`、`*.css?raw`、`*.less?raw` 模块声明，让 TS 识别 SFC 与 `?raw` 样式导入 |

### 5.11 UI 层（`ui/init.ts` + `core/util/defUtil.ts`）

UI 初始化流程（`ui/init.ts`，DOM 就绪后执行）：

1. 注入 Element Plus 完整样式 `<link>`（unpkg `element-plus/dist/index.css`，id 为 `element-plus-css`；版本需与 `@require` 的 EP JS 一致）
2. `elUtil.createVueDiv(document.body)` 创建挂载容器
3. `installElBridge()`（`ui/elBridge.ts`）：把 `eventEmitter` 上的 `el-msg` / `el-notify` / `el-alert` / `el-confirm` / `el-prompt` 事件桥接到 `ElMessage` / `ElNotification` / `ElMessageBox`，取代 Vue 2 时代依赖组件实例 `$message` 的写法；业务层继续走 `eventEmitter`
4. `initVueApp(mountEl, App)`（`core/util/defUtil.ts`）：`createApp(App)` → `app.use(ElementPlus, {locale: zhCn})` → `app.mount(el)`
   - `zhCn` 从 `element-plus/es/locale/lang/zh-cn` 子路径导入，与 `rollupOptions.external` 里的精确模块名 `element-plus` 不匹配，因此该语言包会内联进产物（`@require` 的 EP UMD 提供的是 `ElementPlus` 全局对象本身）
   - 返回值是 Vue 3 **应用实例**，赋给 `window.mk_vue_app`；这与 `window.Vue`（由 `dist/vue-bridge.js` 挂载）是两回事
5. 全局注册自定义组件 `gz-space`（`GzSpace.vue`）、`gz-text`（`GzText.vue`）
6. `addGzStyle(document)`、`cssManager.updateCssVModal()`，并以 `GM_addStyle` 注入边框色与 `def.css?raw`

面板快捷键为 `~`（波浪键），也可点击页面左上角按钮展开。

### 5.12 Vue 3 / Element Plus 组件写法约定

48 个 `.vue` 组件已在迁移中统一为 Composition API，新增组件沿用同一套约定：

- 一律 `<script setup lang="ts">`，不使用 Options API
- 弹窗消息用 `ElMessage` / `ElNotification` / `ElMessageBox`（从 `element-plus` 导入），不再使用 `this.$message` 等实例方法
- `el-dialog` / `el-drawer` 用 `v-model`（不再是 `:visible.sync`）；子组件双向绑定用 `v-model:propName` + `emit('update:propName')`（不再是 `.sync`）
- `el-checkbox` / `el-radio-button` 的值属性为 `value`（Element Plus 2.x，不再是 `label`）
- `el-radio-button` 的 `value` 只表示选中值，按钮文字必须放在默认插槽中，例如 `<el-radio-button value="原创">原创</el-radio-button>`
- 表格列插槽统一 `#default="scope"`；`size="mini"` 已废除，用 `size="small"`；`el-dropdown` 菜单放进 `#dropdown` 模板插槽

---

## 六、Tampermonkey 元信息

### 6.1 配置来源

元信息数据源为 `tamper_monkey.json`，**键名带 `@` 前缀**：

```json
{
    "@name": "哔哩哔哩屏蔽增强器",
    "@namespace": "http://tampermonkey.net/",
    "@version": "2.18.1",
    "@runAt": "document-start",
    "@noFrames": true,
    "@grant": ["GM_setValue", "GM_getValue", "GM_addStyle", "..."],
    "@match": ["*://www.bilibili.com/*", "*://localhost:5173/*", "..."],
    "@require": ["https://unpkg.com/dexie@4.2.0/dist/dexie.min.js"]
}
```

版本号就在 `@version`，改版本只改这里。

> `readTamperMonkey()` 只识别以 `@` 开头的键并剥掉前缀，**不带 `@` 的键会被静默跳过**（这就是 `"alias"`、`"homepage"` 不出现在产物头部的原因）。

### 6.2 生成流程

1. `vite.config.ts` 的 `writeInstallShell()`（在 `closeBundle` 钩子中调用）用 `plugin/mkUtil.ts` 的 `readTamperMonkey()` 读取配置，取 `notDevData`
2. 删掉 `resource`，并把 `require` 整体替换为 3.2 中那 5 条 `@require`（CDN + `file://`）—— 因此 `tamper_monkey.json` 里写的 `@require` 实际不会进入安装壳
3. `generateTamperMeta()` 按固定字段列表输出对齐的 `// ==UserScript==` 头部，写入 `dist/install.user.js`
4. `local_build.js` 自身**不带**头部：它是被 `@require` 的库文件

### 6.3 注意事项

- 产物头部只包含 `plugin/mkUtil.ts` 中 `TamperMetaOpts` 定义的字段（name/namespace/version/description/author/icon/license/homepageURL/supportURL/updateURL/downloadURL/run-at/noframes/match/include/exclude/grant/connect/require/resource/antifeature）；`@source` 之类的额外键会被丢弃
- `notDevData` 会剔除含 `localhost` 的 `@match`，dev 专用 match 不进安装壳
- Vue 3、Element Plus、Dexie 通过 `@require` 加载，**不打包**进产物（`element-plus/es/...` 子路径是例外，见 5.11）
- 已**没有**"移除 `dev.js`"这一步：`dev/dev.ts` 与 ws 客户端始终进入生产包，是否生效由 GM 开关决定
- 添加 `@grant` / `@match` / `@require` 时编辑 `tamper_monkey.json` 后重新构建即可

---

## 七、构建配置细节

### 7.1 路径别名

`@/` → `src/web/`

三处需保持一致，均已配置：`tsconfig.json` 的 `paths`（供 `vue-tsc`）、`vite.config.ts` 的 `resolve.alias`（供主构建）、`server/wsServer.ts` 与 `vitest.config.ts` 的内联 alias（供热测试与测试）。新增 `@/` 导入不需要自定义解析插件（旧的 `plugin/tsResolve.ts` 已删除）。

### 7.2 外部全局变量（`rollupOptions`）

```js
external: ['vue', 'element-plus', 'dexie']
globals: { vue: 'Vue', 'element-plus': 'ElementPlus', dexie: 'Dexie' }
```

三个库都由 `@require` 提供。由于应用与它们处于同一拼接作用域，产物里直接引用**裸全局名**（`Vue` / `ElementPlus` / `Dexie`），而不是 UMD 常见的 `globalThis.X` 访问。

注意 `external` 是**精确模块名**匹配：`element-plus/es/locale/lang/zh-cn` 这类子路径不算外部，会从 node_modules 打进产物。

### 7.3 构建插件

| 插件 | 位置 | 作用 |
|------|------|------|
| `@vitejs/plugin-vue` | `vite.config.ts` | 编译 `.vue` SFC（`<script setup>`、scoped style） |
| `tampermonkeyPlugin` | `vite.config.ts` | `enforce: 'post'`；`generateBundle` 把 CSS chunk 内联为 `GM_addStyle` 并在生产模式去注释；`closeBundle` 写出 `vue-bridge.js` 与 `install.user.js` |
| `plugin/mkUtil.ts` | 构建期辅助 | 元信息读取与头部生成（不再是 Rollup 插件） |

另有 `define: { __DEV__: JSON.stringify(!isProd) }` 提供编译期常量。

### 7.4 类型检查

`pnpm build` 的第一步 `vue-tsc --noEmit` 能直接解析 `.vue`，取代了旧的两段式方案（`tsc --noEmit` + `scripts/check-vue-types.mjs` 用 `vue-template-compiler` 抽出 `<script lang="ts">` 写临时 `.vue.ts`、生成临时 `tsconfig.vue-check.json`、过滤 `TS2307`）。这些临时文件与过滤逻辑都已随迁移移除。

`src/web/element-plus.d.ts`、`global.d.ts`、`shims-vue.d.ts` 由 `tsconfig.json` 的 `include` 自动纳入。

TypeScript 配置要点：`strict: true`、`moduleResolution: 'bundler'`、`allowImportingTsExtensions: true`（所以源码里普遍写 `import './x.ts'` 带扩展名）、`resolveJsonModule: true`、`types: ['tampermonkey', 'node']`、`target`/`lib` 为 `ES2021 + DOM + DOM.Iterable`。

---

## 八、开发工作流

### 8.1 方案一：常规开发（`pnpm watch:dev`）

适合大多数开发场景：

1. 首次部署：把 `dist/install.user.js` 内容粘贴到油猴脚本，并允许脚本访问本地文件 URL
2. 运行 `pnpm watch:dev`，Vite 进入监听模式
3. 修改源代码，自动重建 `dist/local_build.js`
4. 刷新 B 站页面查看效果 —— 安装壳用 `@require file://` 直连本地产物，**不需要再把代码复制进编辑器**

> 注意 3.4 描述的现实：当前 `watch:dev` 产物与生产构建同形（已压缩、无注释），断点调试体验有限。

### 8.2 方案二：WebSocket 热测试（`pnpm ws`）

适合在真实页面上快速验证小段逻辑：

1. 运行 `pnpm ws` 启动 WebSocket 服务（服务启动即构建一次）
2. 打开 B 站页面（需先装好完整脚本），在主面板"调试测试"页签开启 `isWsService` 开关
3. 保存 `src/` 下任意文件，服务端 500ms 防抖后编译 `src/test/main.ts` 并推送，页面沙箱 `eval` 执行
4. 页面日志、代码返回值、`__wsReport(数据)` 直接回传到服务端 stdout —— 改完看服务端日志即可
5. 也可在页面控制台调用 `wsBuild()` 手动触发

> 该测试构建显式设置了 `minify: false`、`__DEV__: true`，所以热测试代码是可读的。

### 8.3 方案三：直接调试

- 浏览器控制台可访问 `unsafeWindow.mk_window`、`unsafeWindow.elUtil`、`unsafeWindow.urlUtil`（由 `dev/dev.ts` 暴露），以及 `window.mk_vue_app`（Vue 3 应用实例）
- `sourcemap: false`，主构建产物不可读；需要程序化操控页面时用 `node server/cdpClient.mjs`（见 3.6）

### 8.4 单元测试（`pnpm test`）

- 用例位于 `tests/**/*.test.ts`，配置见 `vitest.config.ts`（`jsdom` 环境 + `@vitejs/plugin-vue` + `@` 别名）
- 现有用例：`tests/shieldLog.test.ts`（屏蔽日志统一格式）、`tests/outputInformationView.test.ts`（输出信息视图）
- `pnpm test` 即 `vitest run`；**不在** `pnpm build` 链路中，需手动执行

---

## 九、质量关卡：无 CI / 无 Lint

项目没有 CI 流水线、pre-commit 钩子、husky 或 lint 配置。自动化的检查只有两项：

| 关卡 | 何时执行 | 是否阻塞 |
|------|------|------|
| `vue-tsc --noEmit` | `pnpm build` 的第一步 | 是，类型错误中断构建 |
| `vitest run` | 仅手动 `pnpm test` | 否，不在构建链路中 |

---

## 十、常见开发场景

### 10.1 新增一个屏蔽规则

1. 在 `config/ruleKeyListData.ts` 中定义规则键和类型
2. 在 `state/localMKData.ts` 中添加对应的 getter/setter（GM 存储读写）
3. 在 `domain/shielding/main.ts` 的屏蔽引擎中添加匹配逻辑
4. 在 `ui/views/rule/` 中添加规则配置的 UI 组件
5. 构建验证

### 10.2 新增一个页面适配

1. 在 `pages/` 下创建新目录（参考现有页面如 `search/`、`live/`）
2. 实现页面模型，暴露 `isUrlPage(url)`、`run()` 等方法
3. 在 `router.ts` 的 `staticRoute()` 中添加路由分发
4. 如果页面有 SPA 导航，在 `dynamicRouting()` 中添加对应处理
5. 在 `domain/observeNetwork.ts` 中添加 API 监听（如需网络触发）

### 10.3 修改 Tampermonkey 元信息

编辑 `tamper_monkey.json` 后执行 `pnpm build` 即可。新增 `@grant`、`@match`、`@require` 等直接添加对应字段，**键名必须带 `@` 前缀**（不带前缀会被 `readTamperMonkey()` 静默跳过）。注意安装壳的 `@require` 由 `vite.config.ts` 生成，改的是那三个 CDN 常量而不是 json。

### 10.4 修改全局常量

编辑 `config/globalValue.ts`，涉及 URL、功能开关、默认值等配置。

### 10.5 新增一个 UI 组件

1. 在 `ui/components/` 或 `ui/views/<对应页签>/` 下新建 `.vue`，用 `<script setup lang="ts">`（约定见 5.12）
2. 需要通用工具时用 `@/core/util/...` 别名导入；跨模块通知走 `eventEmitter`
3. 消息提示统一 `ElMessage` / `ElNotification` / `ElMessageBox`，或用 `eventEmitter.emit('el-msg', ...)` 经 `ui/elBridge.ts` 转发
4. 需要组件级样式直接写 `<style>`（构建会内联）；需要以字符串注入的公共样式用 `?raw` 导入 CSS
5. `pnpm build` 验证类型检查通过，`pnpm test` 跑一遍现有用例

### 10.6 升级 Vue / Element Plus / Dexie 版本

三处必须同步：`vite.config.ts` 的 `VUE_URL` / `ELEMENT_PLUS_URL` / `DEXIE_URL`、`src/web/ui/init.ts` 里 EP CSS `<link>` 的版本号、以及 `node_modules` 中的开发依赖版本。改完重新构建并刷新页面验证外部库诊断日志（`[外部库诊断]`）无报错。

---

## 十一、外部资源

| 资源 | 链接 |
|------|------|
| 脚本发布 (脚本猫) | https://scriptcat.org/zh-CN/script-show-page/1029 |
| 脚本发布 (GreasyFork) | https://greasyfork.org/zh-CN/scripts/461382 |
| 源码 (GitHub) | https://github.com/hgztask/BiBiBSPUserVideoMonkeyScript |
| 开发文档 (完整) | https://docs.qq.com/doc/DSkdTQ1p1aFNnVnRS |
| 更新日志 | https://docs.qq.com/doc/DSnhjSVZmRkpCd0Nj |
| 常见问题 | https://docs.qq.com/doc/DSlJNR1NVcGR3eEto |
