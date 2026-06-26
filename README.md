# B站屏蔽增强器 v2

对B站的视频、评论、直播间、动态等内容进行屏蔽和过滤的油猴脚本，支持多种屏蔽规则，可灵活组合使用。

---

## 技术栈

| 类别      | 技术                                         |
|---------|--------------------------------------------|
| 语言      | TypeScript (strict mode)                   |
| UI 框架   | Vue 2.7 + Element UI                       |
| 构建工具    | Rollup + esbuild                           |
| 包管理器    | pnpm                                       |
| CSS 预处理 | Less                                       |
| 存储      | Dexie (IndexedDB)、localStorage、GM_setValue |
| 运行环境    | 油猴脚本 (Tampermonkey / ScriptCat)            |

## 项目目录结构

```
src/web/
├── config/                  # 静态配置
│   ├── globalValue.ts       # 全局常量
│   ├── ruleKeyListData.ts   # 规则键列表
│   └── video_zoneData.ts    # 视频分区数据
├── core/                    # 基础设施层
│   ├── cache/               # 缓存模块
│   │   ├── bvDexie.ts       # IndexedDB 封装
│   │   ├── valueCache.ts    # 内存缓存
│   │   ├── videoCacheManager.ts
│   │   ├── asynchronousIntervalQueue.ts
│   │   └── IntervalExecutor.ts
│   ├── http/                # HTTP 请求模块
│   │   ├── bFetch.ts        # B站 API 请求封装
│   │   ├── bvRequestQueue.ts # 请求队列
│   │   └── TmRequest.ts     # 油猴跨域请求
│   ├── util/                # 工具函数
│   │   ├── elUtil.ts        # DOM 操作
│   │   ├── defUtil.ts       # 通用工具
│   │   ├── urlUtil.ts       # URL 解析
│   │   ├── ruleUtil.ts      # 规则处理
│   │   ├── ruleMatchingUtil.ts
│   │   ├── strFormatUtil.ts
│   │   └── arrUtil.ts
│   ├── EventEmitter.ts      # 事件总线
│   └── BilibiliEncoder.ts   # B站编码
├── domain/                  # 领域逻辑层
│   ├── shielding/           # 屏蔽核心
│   │   ├── main.ts          # 主屏蔽逻辑
│   │   ├── video.ts         # 视频屏蔽
│   │   ├── live.ts          # 直播屏蔽
│   │   ├── comments.ts      # 评论屏蔽
│   │   └── combinationRules.ts # 组合规则
│   ├── cssManager.ts        # 样式管理
│   ├── observeNetwork.ts    # 网络监听
│   ├── notificationBlocking.ts # 通知屏蔽
│   ├── replaceKeywords.ts   # 关键词替换
│   ├── watchUtil.ts         # 观察器工具
│   └── debuggerManagement.ts # 调试管理
├── pages/                   # 页面入口层
│   ├── home/                # 首页
│   ├── live/                # 直播页
│   ├── video/               # 视频播放页
│   ├── search/              # 搜索页
│   ├── space/               # 个人空间
│   ├── message/             # 消息页
│   ├── dynamic/             # 动态页
│   ├── popular/             # 热门页
│   ├── history/             # 历史记录
│   ├── commentSectionModel.ts # 评论区通用
│   ├── userProfile.ts       # 用户资料
│   └── topColumnProcessing.ts
├── state/                   # 运行时状态
│   ├── localMKData.ts       # 本地存储读写
│   └── elData.ts            # DOM 元素缓存
├── ui/                      # UI 层
│   ├── views/               # 视图组件
│   │   ├── rule/            # 规则管理
│   │   ├── shield/          # 屏蔽操作
│   │   ├── page/            # 页面处理
│   │   ├── glory/           # 荣耀等级
│   │   ├── settings/        # 设置面板
│   │   └── debug/           # 调试面板
│   ├── components/          # 通用组件
│   ├── dialogs/             # 弹窗组件
│   ├── styles/              # 样式文件
│   ├── App.vue              # 主面板
│   └── init.ts              # UI 初始化
├── dev/                     # 开发工具
│   ├── dev.ts               # 开发辅助
│   └── webWs.ts             # WebSocket 热更新
├── main.ts                  # 脚本入口
├── router.ts                # 页面路由
└── menu.ts                  # 菜单注册
```

## 架构分层

项目采用分层架构，从底到上依次为：

| 层级    | 目录        | 职责                                   |
|-------|-----------|--------------------------------------|
| 基础设施层 | `core/`   | 通用工具、HTTP 请求、缓存、事件总线，不依赖业务逻辑         |
| 领域逻辑层 | `domain/` | 屏蔽规则实现、样式管理、网络监听等核心业务                |
| 页面入口层 | `pages/`  | 各页面路由入口，负责页面级逻辑编排                    |
| 状态层   | `state/`  | 全局运行时状态管理，封装 GM_setValue/GM_getValue |
| UI 层  | `ui/`     | Vue 视图组件、弹窗、通用组件、样式                  |
| 配置层   | `config/` | 静态配置数据、规则定义                          |

## 开发指南

### 环境要求

- Node.js >= 18
- pnpm（包管理器）

### 安装依赖

```bash
pnpm install
```

### 构建

```bash
# 生产构建
pnpm build

# 开发模式（watch + 热更新服务）
pnpm watch:dev
```

构建产物输出到 `dist/local_build.js`，可直接导入油猴脚本使用。

### 类型检查

构建时会自动执行 `tsc --noEmit` 进行类型检查，类型错误会阻塞构建。项目启用 TypeScript strict 模式。

### 开发调试

1. 运行 `pnpm watch:dev` 启动开发模式
2. 将 `dist/local_build.js` 内容复制到油猴脚本编辑器中
3. 访问 B站相应页面进行调试

---

## 屏蔽的类型

1. 用户名模糊匹配
2. 用户名精确匹配
3. 用户名正则匹配
4. 用户uid匹配
5. 用户白名单uid匹配
6. 话题tag模糊匹配
7. 粉丝牌精确匹配
8. 视频最短时长屏蔽（低于设置值的会屏蔽）
9. 视频最大弹幕量屏蔽（高于设置值的会屏蔽）
10. 视频最小播放量屏蔽（低于设置值的会屏蔽）
11. 最小用户等级过滤（低于设置值的会屏蔽）
12. 视频tag标签模糊匹配
13. 视频tag标签精确匹配
14. 视频tag标签正则匹配
15. 专栏屏蔽（暂不支持）
16. 热搜关键词模糊匹配（页面顶部搜索框的热搜）
17. 头像挂件名精确匹配（目前仅支持视频）
18. 头像挂件名模糊匹配（目前仅支持视频）
19. 用户签名模糊匹配（目前仅支持视频）
20. 视频简介模糊匹配
21. 标题模糊匹配
22. 标题正则匹配
23. 评论模糊匹配
24. 评论正则匹配
25. 话题tag精确匹配
26. 话题tag正则匹配
27. 直播分区黑名单(精确匹配)
28. 视频最长时长屏蔽（高于设置值的会屏蔽）
29. 视频最小弹幕量屏蔽（低于设置值的会屏蔽）
30. 视频最大播放量屏蔽（高于设置值的会屏蔽）
31. 最大用户等级过滤（高于设置值的会屏蔽）
32. 热搜关键词正则匹配（页面顶部搜索框的热搜）
33. 用户签名正则匹配（目前仅支持视频）
34. 视频简介正则匹配（目前仅支持视频）
35. bv号精确匹配
36. 视频tag(组合精确匹配)
37. 直播标题(正则和模糊匹配)

> 其余屏蔽规则可看自述文档

> **注意**：模糊匹配和正则匹配的规则会自动将匹配内容转为小写，如不需要自动转换，可在主面板中的 **规则管理 → 条件限制 →
模糊和正则匹配时，勾选转小写**。

## 高级规则

1. 根据性别屏蔽，可以屏蔽男、女、保密的用户，默认不处理
2. 根据视频类型屏蔽，可以选择屏蔽原创或转载类视频，默认不处理
3. 根据会员类型屏蔽，可以选择屏蔽月大会员、非会员，年度及以上大会员，默认不处理
4. 根据用户是否是硬核会员等级屏蔽，默认否，即不处理
5. 是否屏蔽已关注视频，默认否，即不处理
6. 是否屏蔽充电专属视频，默认否，即不处理
7. 屏蔽竖屏类视频
8. 计算创作团队，有时且作者未匹配上时依次检查其他成员
9. 根据视频点赞率屏蔽
10. 根据视频互动率屏蔽
11. 根据视频三连率屏蔽
12. 视频投币/点赞比（内容价值）屏蔽
13. uid范围屏蔽
14. 视频时间范围屏蔽

## 其他规则

1. 播放量最小最大限制
2. 弹幕数最小最大限制
3. 时长最小最大限制
4. 用户等级最大最小过滤
5. 评论字数限制

---

## 特色功能

- 支持快捷屏蔽按钮，鼠标悬停在视频标题或评论上会显示屏蔽按钮，点击可选择 **uid精确屏蔽** 和 **用户名精确屏蔽**（建议优先uid方式）
- 所有屏蔽规则都可以在主面板（快捷键 `~` 打开，或点击页面左上角按钮展开）中的 **规则管理** 按需添加规则

## 相关链接

| 说明                | 链接                                                                                                         |
|-------------------|------------------------------------------------------------------------------------------------------------|
| 脚本发布 (脚本猫)        | [scriptcat.org](https://scriptcat.org/zh-CN/script-show-page/1029/)                                        |
| 脚本发布 (GreasyFork) | [greasyfork.org](https://greasyfork.org/zh-CN/scripts/461382)                                              |
| 源码 (GitHub)       | [github.com/hgztask/BiBiBSPUserVideoMonkeyScript](https://github.com/hgztask/BiBiBSPUserVideoMonkeyScript) |
| 常见问题汇总            | [腾讯文档](https://docs.qq.com/doc/DSlJNR1NVcGR3eEto)                                                          |
| 开发文档              | [腾讯文档](https://docs.qq.com/doc/DSkdTQ1p1aFNnVnRS?no_promotion=1)                                           |
| 更新日志              | [腾讯文档](https://docs.qq.com/doc/DSnhjSVZmRkpCd0Nj)                                                          |
| 完整自述文档            | [腾讯文档](https://docs.qq.com/doc/DSmJqSkhFaktBeUdk?u=1a1ff7b128d64f188a8bfb71b5acb28c)                       |

> 脚本更新优先更新到脚本猫平台，其次 GreasyFork。可二改，但需保留作者版权信息。

## 浏览器兼容性

推荐使用 Edge 或 Chrome 浏览器（包括[奔跑中的奶酪](https://www.runningcheese.com/edge)相关版本），其他浏览器可能存在问题。

>
如遇到脚本不执行，请尝试关闭插件或浏览器的开发者人员模式后重新开启，并重启浏览器。如依旧不行，请下载[奔跑中的奶酪便携版 Edge 或 Chrome](https://www.runningcheese.com/edge)。

## 关于作者

- [企鹅反馈群 876295632](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=tFU0xLt1uO5u5CXI2ktQRLh_XGAHBl7C&authKey=KAf4rICQYjfYUi66WelJAGhYtbJLILVWumOm%2BO9nM5fNaaVuF9Iiw3dJoPsVRUak&noverify=0&group_code=876295632) —
  反馈提意见交流群，回复速度相对较快
- [B站个人主页](https://space.bilibili.com/473239155/dynamic) — 最新更新状态和内容
- [GreasyFork 主页](https://greasyfork.org/zh-CN/scripts/461382)
- [脚本猫主页](https://scriptcat.org/zh-CN/users/96219)

## 赞助

如果您觉得本脚本对您有帮助，欢迎赞助作者，以支持脚本的更新和开发。

<img src="https://www.mikuchase.ltd/img/paymentCodeZFB.webp" width="300">
<img src="https://www.mikuchase.ltd/img/paymentCodeWX.webp" width="300">
<img src="https://www.mikuchase.ltd/img/paymentCodeQQ.webp" width="300">