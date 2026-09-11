# 开发文档

## 一、项目简介

**哔哩哔哩屏蔽增强器**（BIBIShield v2）是一个 Tampermonkey 用户脚本，用于对 B 站的视频、评论、直播间、动态等内容进行多维度的屏蔽和过滤。

| 项目 | 说明 |
|------|------|
| 语言 | TypeScript (strict mode) |
| UI 框架 | Vue 2.7 + Element UI |
| 构建工具 | Rollup + esbuild |
| CSS 预处理 | Less |
| 包管理器 | pnpm |
| 存储 | Dexie (IndexedDB)、localStorage、GM_setValue/GM_getValue |
| 运行环境 | Tampermonkey / ScriptCat |

---

## 二、环境搭建

### 2.1 前置要求

- Node.js >= 18
- pnpm（必须使用 pnpm，不要用 npm）

### 2.2 安装依赖

```bash
pnpm install
```

> `.gitignore` 排除了 `pnpm-lock.yaml`，lockfile **不提交**到版本控制。

---

## 三、构建与运行

### 3.1 命令一览

| 命令 | 说明 |
|------|------|
| `pnpm build` | 生产构建，输出 `dist/local_build.js` |
| `pnpm watch:dev` | 监听模式 + dev server `localhost:3000` |
| `pnpm ws` | WebSocket 开发服务 `ws://127.0.0.1:9000` |

### 3.2 生产构建（`pnpm build`）

构建流程：

1. **类型检查**：自动执行 `tsc --noEmit` 检查 `.ts` 文件，再执行 `scripts/check-vue-types.mjs` 检查 `.vue` 文件中的 `<script lang="ts">`。类型错误会阻塞构建。
2. **编译打包**：Rollup 调用 esbuild 进行转译，Vue 插件处理 `.vue` SFC，Less 插件编译样式。
3. **元信息头部**：`plugin/rollup-test-plugin.ts` 读取 `tamper_monkey.json`，通过 `plugin/mkUtil.ts` 生成 `// ==UserScript==` 头部并拼接到输出文件。
4. **产物优化**：移除注释，剥离 `dev.js` 相关代码（开发辅助模块不进入生产包）。

### 3.3 开发模式（`pnpm watch:dev`）

- 开启文件监听，源文件变化时自动重新构建
- 在 `localhost:3000` 启动静态服务，提供 `dist/` 目录
- 保留注释，内联 source map，方便调试
- 需手动将构建后的 JS 复制到 Tampermonkey 编辑器

### 3.4 WebSocket 开发模式（`pnpm ws`）

用于快速迭代，无需手动复制代码：

1. 在终端运行 `pnpm ws`，启动 WebSocket 服务（端口 9000）
2. 打开 B 站页面，脚本中的 `dev/webWs.ts` 会自动连接 WebSocket
3. 在浏览器控制台调用 `wsBuild()`（暴露在 `unsafeWindow` 上），发送 `"build"` 指令
4. 服务端收到指令后，在内存中用 Rollup 构建 `src/test/main.ts`，将编译后的 JS 代码通过 WebSocket 发回
5. 客户端通过 `eval(code)` 执行收到的代码，实现热更新

> 服务端构建入口是 `src/test/main.ts`，它只构建指定的测试/开发入口代码，而非完整的生产包。

---

## 四、项目结构

### 4.1 顶层目录

```
station_b_shield/
├── plugin/               # Rollup 自定义插件
│   ├── mkUtil.ts         # Tampermonkey 元信息生成工具
│   ├── rollup-test-plugin.ts  # Rollup 插件：拼接元信息、移除 dev.js
│   └── tsconfig.json     # 插件 TypeScript 配置
├── scripts/
│   └── check-vue-types.mjs    # Vue SFC 类型检查脚本
├── server/
│   └── wsServer.ts       # WebSocket 开发服务器
├── src/
│   ├── test/main.ts      # WebSocket 开发模式的构建入口（非测试套件）
│   └── web/              # 主源码目录
├── dist/                 # 构建产物（gitignore 排除）
├── tamper_monkey.json    # Tampermonkey 元信息配置（数据源）
├── rollup.config.mjs     # Rollup 构建配置
├── tsconfig.json         # TypeScript 配置
└── package.json
```

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
│   └── video.ts          # 视频相关类型定义
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
│   │   ├── defUtil.ts    # 通用工具
│   │   ├── urlUtil.ts    # URL 解析
│   │   ├── ruleUtil.ts   # 规则处理
│   │   ├── ruleMatchingUtil.ts  # 规则匹配
│   │   ├── strFormatUtil.ts
│   │   └── arrUtil.ts
│   ├── EventEmitter.ts   # 事件总线（全局单例）
│   ├── elEventEmitter.ts # DOM 元素级事件总线
│   ├── BilibiliEncoder.ts    # B 站编码工具（含 WBI 签名）
│   └── externalLibraryVerification.ts  # 外部库加载验证
├── domain/               # 领域逻辑层
│   ├── shielding/        # 屏蔽核心
│   │   ├── main.ts       # 屏蔽引擎（750 行）
│   │   ├── video.ts      # 视频屏蔽
│   │   ├── live.ts       # 直播屏蔽
│   │   ├── comments.ts   # 评论屏蔽
│   │   └── combinationRules.ts  # 组合规则
│   ├── cssManager.ts     # 样式管理
│   ├── homeResponseRewrite.ts    # 首页推荐响应层过滤
│   ├── searchResponseRewrite.ts  # 搜索结果响应层过滤
│   ├── commentResponseRewrite.ts # 评论区响应层过滤
│   ├── liveSectionResponseRewrite.ts # 直播分区getList响应层过滤
│   ├── observeNetwork.ts # 网络请求监听与分发
│   ├── notificationBlocking.ts  # 通知屏蔽
│   ├── replaceKeywords.ts      # 关键词替换
│   ├── watchUtil.ts      # 观察器工具（URL 变化、网络、DOM）
│   └── debuggerManagement.ts   # 调试管理
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
│   ├── localMKData.ts    # GM_setValue/GM_getValue 封装（574 行）
│   └── elData.ts         # DOM 元素缓存
├── ui/                   # UI 层
│   ├── App.vue           # 主面板根组件
│   ├── init.ts           # UI 初始化（Vue 挂载、Element UI 加载）
│   ├── components/       # 通用 Vue 组件（GzSpace、GzText 等）
│   ├── dialogs/          # 弹窗组件
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
│   ├── styles/           # 全局样式（Less）
│   ├── excludeURLs.ts    # URL 排除逻辑
│   └── output_informationTab.ts # 输出信息标签
├── dev/                  # 开发辅助（不进入生产包）
│   ├── dev.ts            # 开发环境初始化
│   └── webWs.ts          # WebSocket 客户端
├── main.ts               # 脚本入口
├── router.ts             # 基于 URL 的页面路由
├── menu.ts               # Tampermonkey 菜单注册
├── element-ui.d.ts       # Element UI 类型声明
├── global.d.ts           # 全局类型声明
└── shims-vue.d.ts        # Vue SFC 类型声明
```

---

## 五、架构分层详解

### 5.1 启动流程（`main.ts`）

脚本的启动顺序如下：

1. **模块副作用导入**：`menu.ts`（注册菜单）、`externalLibraryVerification.ts`（验证 Vue/Dexie 已加载）、`ui/init.ts`（挂载 UI）、`domain/notificationBlocking.ts`、`domain/replaceKeywords.ts`、`dev/dev.ts`
2. **路由初始化**：导入 `router.ts` 注册路由
3. **监听注册**：通过 `watchUtil` 注册 URL 变化监听和网络请求监听
4. **`window.load` 事件**：
   - 调用 `router.staticRoute()` 执行首次页面路由
   - 启动 URL 轮询（每秒检查 `location.href`），变化时调用 `router.dynamicRouting()`
   - 启动 `PerformanceObserver` 监听网络请求，回调 `observeNetwork.observeNetwork()`

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

### 5.7 屏蔽引擎（`domain/shielding/main.ts`）

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

### 5.8 数据存储

- **`state/localMKData.ts`**（574 行）：封装 `GM_setValue` / `GM_getValue`，为所有用户可配置的设置提供类型安全的 getter/setter，如屏蔽规则、UI 偏好、功能开关等。
- **`core/cache/bvDexie.ts`**：基于 Dexie.js（IndexedDB）的视频元数据缓存，含 TTL 过期策略。
- **`core/cache/valueCache.ts`**：轻量级内存缓存。

### 5.9 类型系统（`types/`）

项目将共享类型定义集中到 `src/web/types/` 目录：

| 文件 | 内容 |
|------|------|
| `http.ts` | HTTP 请求/响应、WBI 签名相关类型 |
| `shielding.ts` | 屏蔽结果、屏蔽按钮数据、规则匹配类型 |
| `storage.ts` | 存储模块类型（规则、配置项） |
| `video.ts` | 视频元数据、分区信息类型 |

此外，以下 `.d.ts` 声明文件位于 `src/web/` 根目录：

| 文件 | 作用 |
|------|------|
| `element-ui.d.ts` | Element UI 模块类型声明 |
| `global.d.ts` | 全局变量、window 扩展类型声明 |
| `shims-vue.d.ts` | `.vue` 文件模块声明，让 TS 能识别 SFC导入 |

### 5.10 UI 层（`ui/init.ts`）

UI 初始化流程：

1. 动态注入 Element UI 样式表
2. 创建 Vue 2.7 根实例，挂载 `App.vue`（Vue 2.7 原生支持 Composition API，组件已迁移至 `setup()` 风格）
3. 全局注册 `GzSpace` 和 `GzText` 两个自定义组件
4. 注入自定义样式（边框颜色等）
5. 将 Vue 实例挂载到 `window.mk_vue_app`

面板快捷键为 `~`（波浪键），也可点击页面左上角按钮展开。

---

## 六、Tampermonkey 元信息

### 6.1 配置来源

元信息数据源为 `tamper_monkey.json`，键名不带 `@` 前缀：

```json
{
    "name": "哔哩哔哩屏蔽增强器",
    "namespace": "http://tampermonkey.net/",
    "version": "2.18.1",
    "grant": ["GM_setValue", "GM_getValue", "GM_addStyle", ...],
    "match": ["*://www.bilibili.com/*", ...],
    "require": ["https://unpkg.com/vue@2.7.16/dist/vue.min.js", ...]
}
```

### 6.2 生成流程

1. 构建时 `plugin/rollup-test-plugin.ts` 调用 `plugin/mkUtil.ts` 的 `readTamperMonkey()` 读取 `tamper_monkey.json`
2. `generateTamperMeta()` 将配置格式化为对齐的 `// ==UserScript==` 头部
3. 在 `renderChunk` 钩子中拼接到输出文件最前面

### 6.3 注意事项

- 添加或修改 `@grant`、`@match`、`@require` 等时，直接编辑 `tamper_monkey.json` 后重新构建即可
- Vue 2、Element UI、Dexie 通过 `@require` 从 CDN 加载，**不会打包**到产物中
- 生产构建时会自动移除 `dev.js`（开发辅助）相关代码

---

## 七、构建配置细节

### 7.1 路径别名

`@/` → `src/web/`

配置在 `tsconfig.json` 的 `paths` 中，同时由 `rollup.config.mjs` 中的自定义 `tsResolve()` Rollup 插件在构建时解析。新增 `@/` 导入时，确认 Rollup 插件能正确处理（插件会尝试添加 `.ts`、`.vue`、`.json` 扩展名）。

### 7.2 外部全局变量（Rollup `output.globals`）

```js
globals: { vue: 'Vue', dexie: 'Dexie' }
```

由于 `vue` 和 `dexie` 通过脚本文本头部的 `@require` 以全局变量形式加载，Rollup 将其标记为外部模块，在打包时保留为全局变量引用 `Vue` 和 `Dexie`，而非内联代码。

### 7.3 自定义 Rollup 插件

| 插件 | 文件 | 作用 |
|------|------|------|
| `tsResolve()` | `rollup.config.mjs` | 解析 `.ts`、`.vue`、`.json` 扩展名；处理 `@/` 路径别名 |
| `type-check` | `rollup.config.mjs` | 在 `buildStart` 时执行 `tsc --noEmit` + `check-vue-types.mjs` |
| `mk-plugin` | `plugin/rollup-test-plugin.ts` | 非开发模式：移除 `dev.js`、生成元信息头部 |

### 7.4 Vue SFC 类型检查（`scripts/check-vue-types.mjs`）

由于 `tsc` 无法直接解析 `.vue` 文件，该脚本：

1. 遍历 `src/web/` 下所有 `.vue` 文件
2. 用 `vue-template-compiler` 提取 `<script lang="ts">` 内容
3. 写入临时 `.vue.ts` 文件
4. 生成临时 `tsconfig.vue-check.json`，包含这些临时文件
5. 执行 `tsc --noEmit`，过滤掉 `TS2307`（模块解析）错误
6. 清理临时文件

类型辅助声明文件 `src/web/element-ui.d.ts`、`src/web/global.d.ts`、`src/web/shims-vue.d.ts` 用于补充全局类型和模块声明，`tsc` 构建时自动包含。

---

## 八、开发工作流

### 8.1 方案一：常规开发（`pnpm watch:dev`）

适合大多数开发场景：

1. 运行 `pnpm watch:dev`，Rollup 进入监听模式
2. 修改源代码，Rollup 自动重新构建
3. 手动将 `dist/local_build.js` 内容复制到 Tampermonkey 编辑器
4. 刷新 B 站页面查看效果

### 8.2 方案二：WebSocket 热更新（`pnpm ws`）

适合快速迭代调试：

1. 运行 `pnpm ws` 启动 WebSocket 服务
2. 打开 B 站页面（需先安装完整版脚本）
3. 在浏览器控制台调用 `wsBuild()` 触发构建
4. 服务端编译 `src/test/main.ts` 并将代码通过 WebSocket 推送到页面
5. 页面通过 `eval()` 执行新代码，无需手动刷新

> 此模式下需确保 `debuggerManagement.isWsService()` 返回 `true`，脚本才会尝试连接 WebSocket。

### 8.3 方案三：直接调试

- 可通过 `unsafeWindow.mk_window`、`unsafeWindow.elUtil`、`unsafeWindow.urlUtil` 在浏览器控制台访问内部模块
- 开发模式下保留注释和 source map，可直接在源码上断点调试

---

## 九、无 CI / 无 Lint

项目没有配置 CI 流水线、pre-commit 钩子、husky 或 lint 工具。类型检查（`tsc --noEmit` + Vue SFC 检查）是唯一的自动化质量关卡，且仅在生产构建时触发。

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

编辑 `tamper_monkey.json` 后执行 `pnpm build` 即可。新增 `@grant`、`@match`、`@require` 等直接添加对应字段（键名不带 `@` 前缀）。

### 10.4 修改全局常量

编辑 `config/globalValue.ts`，涉及 URL、功能开关、默认值等配置。

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
