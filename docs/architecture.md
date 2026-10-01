# 架构文档

项目结构与架构分层详解：目录、启动流程、路由、事件、网络监听、核心模块。

## 项目结构

### 顶层目录

```
station_b_shield/
├── plugin/                   # 构建期辅助
│   ├── mkUtil.ts             # Tampermonkey 元信息读取与生成
│   └── tsconfig.json         # 该目录的 TypeScript 配置
├── server/
│   ├── wsServer.ts           # WebSocket 热测试服务（Vite 内存构建）
│   └── cdpClient.mjs         # CDP 页面调试客户端
├── src/
│   ├── test/main.ts          # 热测试通道的构建入口（非测试套件）
│   └── web/                  # 主源码目录
├── tests/                    # Vitest 单元测试（`*.test.ts`）
├── docs/                     # 开发文档（本文档 + 构建/工作流）
├── dist/                     # 构建产物（gitignore 排除）
├── tamper_monkey.json        # Tampermonkey 元信息配置（数据源）
├── vite.config.ts            # Vite 构建配置（含 tampermonkeyPlugin）
├── vitest.config.ts          # 测试配置（jsdom + vue 插件 + `@` 别名）
├── tsconfig.json             # TypeScript 配置（strict，由 vue-tsc 使用）
└── package.json
```

> `test/`（单数）是 gitignore 的个人草稿目录，与 `tests/` 无关。

### 主源码目录（`src/web/`）

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

## 架构分层详解

### 启动流程（`main.ts`）

脚本以 `@run-at document-start` 注入，`main.ts` 的启动顺序如下：

1. **模块副作用导入**：四个响应层过滤模块（`homeResponseRewrite` / `searchResponseRewrite` / `commentResponseRewrite` / `liveSectionResponseRewrite`，需尽早安装页面侧 fetch hook）、`menu.ts`（注册菜单）、`externalLibraryVerification.ts`（验证 `window.Vue` / `window.ElementPlus` / `window.Dexie` 已由 `@require` 就绪，缺失即弹窗提示并抛错）、`ui/init.ts`（挂载 UI）、`notificationBlocking.ts`、`replaceKeywords.ts`、`videoDanmakuFilter.ts`、`videoDanmakuInspector.ts`、`dev/dev.ts`
2. **路由初始化**：导入 `router.ts` 注册路由
3. **首屏路由**：按 `document.readyState` 判断 —— 已是 `complete` 则立即执行 `router.staticRoute()`，否则监听 `window.load`（`@require` 拼接作用域下可能已错过事件）
4. **监听注册**：
   - `watchUtil.addEventListenerUrlChange()` 启动 URL 轮询（每秒检查 `location.href`），变化时调用 `router.dynamicRouting()`
   - `watchUtil.addEventListenerNetwork()` 用 `PerformanceObserver` 监听网络请求，回调 `observeNetwork.observeNetwork()`

### 路由系统（`router.ts`）

路由系统分为两个阶段：

- **`staticRoute(title, url)`**：页面首次加载时调用，执行完整的页面初始化逻辑（首页、视频、直播、搜索、空间等各页面模型）。
- **`dynamicRouting(title, url)`**：SPA 导航时调用（URL 变化但页面未刷新），只执行部分逻辑（直播间检测、消息页面、搜索用户标签等）。

URL 变化检测通过 `watchUtil.addEventListenerUrlChange()` 实现，原理是每 1000ms 轮询 `window.location.href`，发现变化则触发回调。

### 事件系统（`EventEmitter.ts`）

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

### 网络监听机制

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

### 首页视频列表静默补载（`pages/home/bilibili.ts`）

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
|---|---|---:|
| `home_feed_load_attempts_gm` | `3` | 一次连续补载事件允许的最多尝试次数；设置为 `0` 表示关闭；不设置代码硬上限 |

用户可以在主面板“首页”页签修改“首页列表连续补载次数”。当一次尝试没有检测到列表状态变化、加载哨兵消失或等待超时，控制器会停止本轮补载，避免异常情况下持续触发请求。

旧配置 `is_automatic_scrolling_gm` 已废弃，首页不再提供“检查视频列表数量模拟鼠标上下滚动”开关。脚本进入标准首页时会清理该旧配置值。

### 直播分区响应层过滤与饥饿提示（`domain/liveSectionResponseRewrite.ts` + `pages/live/sectionModel.ts`）

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

### 评论区响应层过滤（`domain/commentResponseRewrite.ts`）

#### 问题背景

评论区屏蔽的 DOM 层实现在渲染后删除命中评论，存在评论闪现后消失的观感。评论接口在视频、影视、动态详情、用户空间等页面共用，若按"页面 + 开关"条件安装（如首页/搜索/直播分区响应过滤的做法），逐页维护页面清单容易漏页——例如影视播放页路径为 `/bangumi/play/` 而非 `/video/`，直接打开时响应层不会生效。

#### 全局安装

评论响应层采用**全局安装**：总开关 `is_comment_response_rewrite_gm` 开启后不依赖首屏页面，页面侧 fetch hook 按 URL 自动只拦截 `api.bilibili.com` 的评论主楼/楼中楼接口（`/x/v2/reply/wbi/main`、`/x/v2/reply/main`、`/x/v2/reply/reply`），视频/影视/动态/空间等任何页面直接打开即生效，SPA 跳转后仍持续拦截。

#### 双层架构

- **页面上下文 fetch hook**（注入 `<script>`）：拦截评论响应，递归收集顶层评论与嵌套预览（楼中楼），携带 `rpid` 供沙箱按 rpid 集合剔除所有出现位置；800ms 超时或改写异常时放行原始响应，退化为 DOM 层兜底。
- **沙箱判定**：复用 `shieldingComment` 规则引擎逐项判定，命中索引回传页面 hook 在渲染前剔除。屏蔽记录经事件 `屏蔽评论信息` 输出到面板，来源标记【响应层过滤】；同一评论在响应中出现多处时按 `rpid` 去重只输出一条。

#### 配置项

| 配置项 | 默认值 | 说明 |
|---|---|---:|
| `is_comment_response_rewrite_gm` | `false` | 评论区响应过滤总开关（主面板"播放页"页签"响应过滤评论区（实验）"）；关闭评论屏蔽时无效，修改后需刷新页面 |

旧开关 `is_dynamic_comment_response_rewrite_gm`（动态详情评论区响应过滤）已合并进总开关，不保留兼容。

### 屏蔽引擎（`domain/shielding/main.ts`）

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

### 数据存储

- **`state/localMKData.ts`**：封装 `GM_setValue` / `GM_getValue`，为所有用户可配置的设置提供类型安全的 getter/setter，如屏蔽规则、UI 偏好、功能开关等。
- **`core/cache/bvDexie.ts`**：基于 Dexie（IndexedDB）的视频元数据缓存，含 TTL 过期策略。Dexie 同样由 `@require` 提供，不打包。
- **`core/cache/valueCache.ts`**：轻量级内存缓存。

### 类型系统（`types/`）

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

### UI 层（`ui/init.ts` + `core/util/defUtil.ts`）

UI 初始化流程（`ui/init.ts`，DOM 就绪后执行）：

1. 注入 Element Plus 完整样式 `<link>`（unpkg `element-plus/dist/index.css`，id 为 `element-plus-css`；版本需与 `@require` 的 EP JS 一致）
2. `elUtil.createVueDiv(document.body)` 创建挂载容器
3. `installElBridge()`（`ui/elBridge.ts`）：把 `eventEmitter` 上的 `el-msg` / `el-notify` / `el-alert` / `el-confirm` / `el-prompt` 事件桥接到 `ElMessage` / `ElNotification` / `ElMessageBox`；业务层继续走 `eventEmitter`
4. `initVueApp(mountEl, App)`（`core/util/defUtil.ts`）：`createApp(App)` → `app.use(ElementPlus, {locale: zhCn})` → `app.mount(el)`
   - `zhCn` 从 `element-plus/es/locale/lang/zh-cn` 子路径导入，与 `rollupOptions.external` 里的精确模块名 `element-plus` 不匹配，因此该语言包会内联进产物（`@require` 的 EP UMD 提供的是 `ElementPlus` 全局对象本身）
   - 返回值是 Vue 3 **应用实例**，赋给 `window.mk_vue_app`；这与 `window.Vue`（由 `dist/vue-bridge.js` 挂载）是两回事
5. 全局注册自定义组件 `gz-space`（`GzSpace.vue`）、`gz-text`（`GzText.vue`）
6. `addGzStyle(document)`、`cssManager.updateCssVModal()`，并以 `GM_addStyle` 注入边框色与 `def.css?raw`

面板快捷键为 `~`（波浪键），也可点击页面左上角按钮展开。

### Vue 3 / Element Plus 组件写法约定

48 个 `.vue` 组件已在迁移中统一为 Composition API，新增组件沿用同一套约定：

- 一律 `<script setup lang="ts">`，不使用 Options API
- 弹窗消息用 `ElMessage` / `ElNotification` / `ElMessageBox`（从 `element-plus` 导入），不再使用 `this.$message` 等实例方法
- `el-dialog` / `el-drawer` 用 `v-model`（不再是 `:visible.sync`）；子组件双向绑定用 `v-model:propName` + `emit('update:propName')`（不再是 `.sync`）
- `el-checkbox` / `el-radio-button` 的值属性为 `value`（Element Plus 2.x，不再是 `label`）
- `el-radio-button` 的 `value` 只表示选中值，按钮文字必须放在默认插槽中，例如 `<el-radio-button value="原创">原创</el-radio-button>`
- 表格列插槽统一 `#default="scope"`；`size="mini"` 已废除，用 `size="small"`；`el-dropdown` 菜单放进 `#dropdown` 模板插槽
