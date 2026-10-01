# 开发文档

## 文档分工

仓库内共有多份 Markdown 文档，定位各不相同，改动时请保持分工明确，**不要跨文档重复维护**：

| 文档 | 位置 | 面向 | 内容 |
|------|------|------|------|
| `README.md` | 仓库根目录 | GitHub 用户 | 项目简介、特色功能、安装方式、快速使用、相关链接（用户向门面，不包含开发细节） |
| `docs/mk.md` | `docs/` 目录 | 发布平台（脚本猫 / GreasyFork） | 发布平台的脚本描述原文，包含完整屏蔽类型列表（37 种）与高级/其他规则，由发布者复制到平台 |
| `docs/development.md` | `docs/` 目录 | 开发者 | 本文档：文档索引 + 文档分工 + 项目简介 + 环境搭建 + 外部资源 |
| `docs/build.md` | `docs/` 目录 | 开发者 | 构建与运行、Tampermonkey 元信息、构建配置细节 |
| `docs/architecture.md` | `docs/` 目录 | 开发者 | 项目结构、架构分层详解 |
| `docs/workflow.md` | `docs/` 目录 | 开发者 | 开发工作流、质量关卡、常见开发场景 |

> **维护约定**：
> - 37 种屏蔽类型完整列表只在 `docs/mk.md` 维护（README 只列概要并链接到它）
> - 构建、架构、开发相关的详细内容按主题分布在 `docs/build.md` / `docs/architecture.md` / `docs/workflow.md`
> - 本文档只保留索引与入门信息，详细内容一律进对应主题文档

---

## 项目简介

**哔哩哔哩屏蔽增强器**（BIBIShield v2）是一个 Tampermonkey 用户脚本，用于对 B 站的视频、评论、直播间、动态等内容进行多维度的屏蔽和过滤。

| 项目      | 说明                                                        |
|---------|-----------------------------------------------------------|
| 语言      | TypeScript (strict mode)                                  |
| UI 框架   | Vue 3 + Element Plus（全部组件为 `<script setup>`，具体版本见 package.json） |
| 构建工具    | Vite 7（`build.lib` 输出单个 IIFE）+ `@vitejs/plugin-vue`       |
| 类型检查    | `vue-tsc --noEmit`（同时覆盖 `.ts` 与 `.vue`）                   |
| 样式      | CSS / Less，以 `?raw` 字符串导入后用 `GM_addStyle` 注入              |
| 包管理器    | pnpm                                                      |
| 测试      | Vitest + @vue/test-utils + jsdom                          |
| 存储      | Dexie 4 (IndexedDB)、localStorage、GM_setValue/GM_getValue   |
| 运行环境    | Tampermonkey / ScriptCat                                  |

---

## 环境搭建

### 前置要求

- Node.js >= 20.19（Vite 7 的最低要求，实测 v24 可用）
- pnpm（必须使用 pnpm，不要用 npm）

### 安装依赖

```bash
pnpm install
```

> `.gitignore` 排除了 `pnpm-lock.yaml`，lockfile **不提交**到版本控制。

---

## 外部资源

| 资源 | 链接 |
|------|------|
| 项目 README | https://github.com/hgztask/BiBiBSPUserVideoMonkeyScript |
| 发布平台描述 (mk.md) | https://github.com/hgztask/BiBiBSPUserVideoMonkeyScript/blob/main/docs/mk.md |
| 脚本发布 (脚本猫) | https://scriptcat.org/zh-CN/script-show-page/1029 |
| 脚本发布 (GreasyFork) | https://greasyfork.org/zh-CN/scripts/461382 |
| 源码 (GitHub) | https://github.com/hgztask/BiBiBSPUserVideoMonkeyScript |
| 开发文档 (腾讯文档) | https://docs.qq.com/doc/DSkdTQ1p1aFNnVnRS |
| 更新日志 | https://docs.qq.com/doc/DSnhjSVZmRkpCd0Nj |
| 常见问题 | https://docs.qq.com/doc/DSlJNR1NVcGR3eEto |
