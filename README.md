# B站屏蔽增强器 v2

对B站的视频、评论、直播间、动态等内容进行屏蔽和过滤的油猴脚本，支持多种屏蔽规则，可灵活组合使用。

---

## 特色功能

- **快捷屏蔽按钮**：鼠标悬停在视频标题或评论上会显示屏蔽按钮，点击可选择 **uid精确屏蔽** 和 **用户名精确屏蔽**（建议优先uid方式）
- **多维度屏蔽规则**：用户名、标题、视频tag、时长、播放量、弹幕数、用户等级、直播分区、组合规则等（完整列表见 [docs/mk.md](./docs/mk.md)）
- **直播分区页响应层过滤**：在页面渲染前过滤掉命中规则的直播间，避免渲染后再删除导致列表高度骤降；屏蔽记录在输出信息面板归入"直播间屏蔽"分类并标注来源（响应层过滤），同页重复请求自动去重
- **评论区响应层过滤（全局）**：在页面渲染前过滤命中规则的评论（含楼中楼与置顶），覆盖视频/影视/动态/空间等所有页面，不依赖首屏页面；命中记录在输出信息面板标注来源（响应层过滤），同一评论出现多处时自动去重
- **直播分区页"加载更多直播间"按钮**（右下角常驻）：屏蔽后列表数量过少、页面自身滚动加载失效时，按钮会变红呼吸提示"屏蔽后列表过短，点击补满一屏"；点击后自动循环"撑高文档+真实滚动"触发页面自身续载，直到列表填满视口或分区到底（到底后 60 秒内不再提示）
- **首页视频列表静默补载**：屏蔽导致首页列表高度不足或骨架卡片未继续加载时，自动触发 B 站页面自身的懒加载，不显示滚动动画，也不改变用户当前阅读位置
- **首页连续补载次数可配置**：主面板的"首页列表连续补载次数"默认为 3，允许设置为 0 关闭；每次补载只有在列表实际发生变化时才会继续，避免异常情况下无限请求

## 支持的屏蔽类型

涵盖用户名（模糊/精确/正则/uid/白名单）、标题（模糊/正则）、视频tag（模糊/精确/正则/组合）、时长、弹幕量、播放量、用户等级、粉丝牌、头像挂件、签名、视频简介、bv号、热搜、直播分区、直播标题等，以及性别、会员、视频类型、点赞率、互动率、三连率等高级规则。

> 完整 37 种屏蔽类型与高级/其他规则列表见 [docs/mk.md](./docs/mk.md)。

## 安装

### 方式一：脚本平台安装（推荐）

- [脚本猫](https://scriptcat.org/zh-CN/script-show-page/1029/)
- [GreasyFork](https://greasyfork.org/zh-CN/scripts/461382)

脚本更新优先更新到脚本猫平台，其次 GreasyFork。

### 方式二：本地构建安装

1. 克隆仓库，`pnpm install` 安装依赖
2. `pnpm build` 构建，产物在 `dist/` 下
3. 把 `dist/install.user.js` 内容粘贴到油猴脚本管理器（如 Tampermonkey / ScriptCat），并按需配置 `@require` 的 CDN 依赖
4. 之后每次构建只需重建 `dist/local_build.js`（`@require file://` 直连本地文件），刷新页面即生效，无需重装脚本

> 开发调试的详细流程见 [docs/development.md](./docs/development.md)。

## 快速使用

1. 安装脚本后打开 B 站任意页面，点击页面左上角按钮或按 `~`（波浪键）打开主面板
2. 在 **规则管理** 中按需添加屏蔽规则（关键词、正则、时长、播放量等）
3. 鼠标悬停在视频标题或评论上，点击弹出的屏蔽按钮可快速屏蔽指定用户

> 模糊匹配和正则匹配的规则会自动将匹配内容转为小写，如不需要自动转换，可在主面板中的 **规则管理 → 条件限制 → 模糊和正则匹配时，勾选转小写**。

## 相关链接

| 说明                | 链接                                                                                                         |
|-------------------|------------------------------------------------------------------------------------------------------------|
| 脚本发布 (脚本猫)        | [scriptcat.org](https://scriptcat.org/zh-CN/script-show-page/1029/)                                        |
| 脚本发布 (GreasyFork) | [greasyfork.org](https://greasyfork.org/zh-CN/scripts/461382)                                              |
| 源码 (GitHub)       | [github.com/hgztask/BiBiBSPUserVideoMonkeyScript](https://github.com/hgztask/BiBiBSPUserVideoMonkeyScript) |
| 发布平台完整描述          | [docs/mk.md](./docs/mk.md)                                                                                  |
| 常见问题汇总            | [腾讯文档](https://docs.qq.com/doc/DSlJNR1NVcGR3eEto)                                                          |
| 开发文档              | [docs/development.md](./docs/development.md)                                                                 |
| 开发文档 (腾讯文档)       | [腾讯文档](https://docs.qq.com/doc/DSkdTQ1p1aFNnVnRS?no_promotion=1)                                           |
| 更新日志              | [腾讯文档](https://docs.qq.com/doc/DSnhjSVZmRkpCd0Nj)                                                          |
| 完整自述文档            | [腾讯文档](https://docs.qq.com/doc/DSmJqSkhFaktBeUdk?u=1a1ff7b128d64f188a8bfb71b5acb28c)                       |

> 脚本更新优先更新到脚本猫平台，其次 GreasyFork。可二改，但需保留作者版权信息。

## 浏览器兼容性

推荐使用 Edge 或 Chrome 浏览器（包括[奔跑中的奶酪](https://www.runningcheese.com/edge)相关版本），其他浏览器可能存在问题。

> 如遇到脚本不执行，请尝试关闭插件或浏览器的开发者人员模式后重新开启，并重启浏览器。如依旧不行，请下载[奔跑中的奶酪便携版 Edge 或 Chrome](https://www.runningcheese.com/edge)。

## 关于作者

- [企鹅反馈群 876295632](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=tFU0xLt1uO5u5CXI2ktQRLh_XGAHBl7C&authKey=KAf4rICQYjfYUi66WelJAGhYtbJLILVWumOm%2BO9nM5fNaaVuF9Iiw3dJoPsVRUak&noverify=0&group_code=876295632) — 反馈提意见交流群，回复速度相对较快
- [B站个人主页](https://space.bilibili.com/473239155/dynamic) — 最新更新状态和内容
- [GreasyFork 主页](https://greasyfork.org/zh-CN/scripts/461382)
- [脚本猫主页](https://scriptcat.org/zh-CN/users/96219)

## 赞助

如果您觉得本脚本对您有帮助，欢迎赞助作者，以支持脚本的更新和开发。

<img src="https://www.mikuchase.ltd/img/paymentCodeZFB.webp" width="300">
<img src="https://www.mikuchase.ltd/img/paymentCodeWX.webp" width="300">
<img src="https://www.mikuchase.ltd/img/paymentCodeQQ.webp" width="300">
