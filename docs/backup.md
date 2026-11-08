# 规则备份与远程同步

> 面向：使用备份功能的用户 + 维护备份模块的开发者
>
> 入口：主面板 → 规则管理 → 导出导入

## 备份范围

当前备份**仅包含屏蔽规则**（`src/web/config/ruleKeyListDataJson.json` 中全部规则 key，含组合规则），不包含：

- 面板设置、页面处理开关、条件限制等设置项
- 荣耀等级、粉丝牌、组合规则方案、排除 URL、替换词等高级列表
- Dexie 中的视频信息缓存（可随时重建）

格式后续可在 `data` 下扩展 `settings` / `lists` 字段；扩展时递增 `schemaVersion` 并补充迁移即可，不影响现有规则数据。

## 备份格式

```json
{
  "format": "bibishield-backup",
  "schemaVersion": 1,
  "appVersion": "2.18.1",
  "createdAt": 1760000000000,
  "deviceId": "dev-xxxx",
  "data": {
    "rules": {
      "name": ["关键词"],
      "precise_uid": [123456],
      "videoTag_preciseCombination": [["tagA", "tagB"]],
      "title": []
    }
  }
}
```

要点：

- 全部规则 key 都会写入，**空数组也会保留**；覆盖导入时用空数组清空目标端对应类型。
- `appVersion` 取自 `GM_info.script.version`；`createdAt`、`deviceId` 仅用于展示与冲突提示。
- 数字类型规则在导入时会校验并转换为数字（`"123"` → `123`）。
- 组合规则必须是 `string[][]`，内层数组、外层列表均按集合语义去重。
- 未知 key 会被忽略并计数，不会写入 GM 存储（避免旧实现可写入任意设置项的隐患）。
- 兼容旧版扁平格式 `{key: [...]}`；旧格式中的空数组按原行为跳过。

## 本地备份与恢复

- **导出备份文件**：生成带格式版本的全量规则备份。
- **读取外部备份文件**：选择 JSON 文件，内容会填入导入编辑框。
- **预览导入编辑框内容**：解析内容并展示差异表格，可选择：
  - **覆盖导入**：文件里出现的 key 整体替换，空数组清空本地该类型；未出现的 key 保持不变。
  - **合并导入**：按规则集合取并集，组合规则按内容去重。
- 原有的“覆盖导入规则 / 追加导入规则”按钮仍然可用，底层已换成同一套校验与合并逻辑。

导入预览会列出：本地数量、文件数量、仅本地（覆盖会删除）、仅文件（合并会新增），以及被忽略的未知类型和非法内容。

## 远程备份

手动上传/下载，不会自动同步。支持两种方式：

### WebDAV

适用于坚果云、Nextcloud、Alist、群晖、InfiniCLOUD 等支持 Basic Auth 的 WebDAV 服务。

配置项：

| 字段 | 说明 |
|------|------|
| 远程文件地址 | 完整文件 URL，如 `https://dav.jianguoyun.com/dav/BIBIShield/backup.json`；缺省协议时自动按 `http://` 处理 |
| 用户名 | WebDAV 用户名 |
| 应用密码 | 建议使用服务商提供的应用密码，而不是登录密码 |

**跨域授权（非本机地址必读）**：脚本头部预授权 `unpkg.com`（外部依赖）、`127.0.0.1` / `localhost`（本机备份）。使用其他域名（坚果云、Nextcloud、群晖等）时，请手动在脚本管理器中为脚本添加对应域名授权，以 Tampermonkey 为例：

1. 打开 Tampermonkey 图标 → 找到本脚本 → **管理面板**
2. 切换到 **设置** 选项卡，将配置模式设为 **高级**（否则看不到 XHR 安全设置）
3. 在脚本的 **XHR 安全**（`@connect` 授权列表）中点击 **添加**，填入 WebDAV 域名，如 `dav.jianguoyun.com`
4. 保存后刷新 B 站页面即可

脚本猫（ScriptCat）：脚本详情 → 授权/网络权限中添加对应域名。

> 出于安全考虑脚本不会预授权任意域名（不使用 `@connect *`）。如果嫌手动添加麻烦，也可以在首次请求弹出的授权提示中选择"总是允许"，效果相同。

实现说明：

- 使用 `GM_xmlhttpRequest` 发起 `PROPFIND` / `MKCOL` / `GET` / `PUT`，绕过页面 CORS。
- 测试连接对父集合发起 `PROPFIND Depth: 0`；目录不存在时自动逐级 `MKCOL`。
- 写入时若已知远程 `ETag`，会带 `If-Match` 做条件写入；弱 `ETag` 会被忽略。
- 只支持 Basic Auth；Digest/NTLM 认证的 WebDAV 不支持。
- 坚果云有请求频率限制，手动同步不受影响；请避免频繁点击测试/上传。

示例地址：

- 坚果云：`https://dav.jianguoyun.com/dav/你的目录/backup.json`
- Nextcloud：`https://你的域名/remote.php/dav/files/用户名/目录/backup.json`
- Alist：`https://你的域名/dav/目录/backup.json`
- 群晖：`https://你的域名:5006/目录/backup.json`
- rclone（本机/局域网）：`http://127.0.0.1:8180/backup.json`

### 自建 HTTP 中间层

脚本只依赖一个极简接口，可自行部署 Cloudflare Worker / Vercel / 自有服务器：

```
GET  {url}  -> 200 备份JSON + ETag 头；404 表示暂无备份
PUT  {url}  -> 写入备份；成功返回 200/201/204 + ETag；冲突返回 412
鉴权：Authorization: Bearer {token}
条件写：PUT 时若带 If-Match，需与当前 ETag 匹配，否则返回 412
```

注意：

- `ETag` 应随内容变化；弱 ETag 不会被脚本用于 `If-Match`。
- 中间层要做原子版本控制，不要用最终一致的 KV 直接做 `If-Match`（推荐 R2 / D1 / Durable Objects）。
- 服务端只需存储一段 JSON，不需要理解规则结构。

## 冲突处理

每次上传前会读取远程内容并与本地比较：

- 远程规则与本地一致：视为无需上传。
- 远程自上次同步后被修改：提示“远程备份已被其他设备修改”，由用户确认是否用本地覆盖。
- 恢复时如果本地存在未同步修改：预览页会提示，用户可选择覆盖或合并。

同步记录（`backup_remote_last_sync`）保存在 GM 存储中，包含 `etag`、规则内容 hash、时间与提供方类型；「清除远程配置」会同时清除同步记录（不会删除远程文件）。

## 安全说明

- 远程备份是**明文 JSON**，包含屏蔽关键词/uid 等内容，请放在私有目录，不要使用公开分享链接。
- 跨域权限：脚本头部预授权 `unpkg.com`（外部依赖 CDN）、`127.0.0.1`、`localhost`（本机备份）。填其他域名（坚果云、Nextcloud、自建服务器等）时，请在脚本管理器的 XHR 安全中手动添加域名（见上文「跨域授权」）。
- **不使用 `@connect *`**：让脚本可请求任意域名的权限面过大；新增常用服务时可在 `tamper_monkey.json` 的 `@connect` 里追加对应域名。
- WebDAV 密码与 Token 保存在脚本管理器的 GM 存储中；建议使用可随时撤销的应用密码或独立 Token。
- 脚本不会备份 B 站 Cookie、账号信息或缓存数据。
- 加密（AES-GCM）为后续可选增强，当前版本未实现。

## 常见错误

| 现象 | 原因与处理 |
|------|------------|
| 网络错误 | 地址缺 `http://`/`https://` 前缀（脚本会自动补 `http://`，https 服务请写全）；脚本管理器拦截跨域请求——本机地址已预授权，**其他域名请按上文「跨域授权」在脚本管理器的 XHR 安全中手动添加域名**；服务未启动 |
| 认证失败 (401) | 用户名/密码错误；坚果云需使用应用密码 |
| 没有访问权限 (403) | 账号无该目录权限，或 Token 无效 |
| 远程备份不存在 (404) | 先执行一次上传 |
| 远程状态冲突 (409) | 目录层级异常，重试通常会自动创建目录 |
| 远程备份已被其他设备修改 (412) | 按提示选择覆盖，或先下载/合并 |
| 远程存储空间不足 (507) | 清理网盘空间 |

已知兼容性说明：

- **rclone serve webdav**：对带请求体的 `PROPFIND` 返回 400，脚本已改为无 body 探测，可正常使用。
- 本机局域网服务（如 `http://127.0.0.1:8180/backup.json`）同样支持，直接填文件地址即可，无需特殊配置。

## 开发者说明

模块位置：

```
src/web/core/backup/
├── backupKeys.ts       # 规则key注册表与类型判断
├── backupSnapshot.ts   # 快照构建/解析/校验/hash/设备id
├── backupMerge.ts      # 差异统计与覆盖/合并写入
├── backupService.ts    # 远程配置、上传、预览恢复、同步元数据
└── providers/
    ├── types.ts        # BackupProvider 接口与统一错误
    ├── webdav.ts       # WebDAV 实现
    └── http.ts         # 通用HTTP中间层实现
```

新增提供方：实现 `BackupProvider`（`test` / `read` / `write`）并在 `backupService.createProvider` 中注册。

测试：

- `tests/backupSnapshot.test.ts`：快照构建、旧格式兼容、校验、hash
- `tests/backupMerge.test.ts`：差异、覆盖/合并、组合规则去重
- `tests/backupProvider.test.ts`：WebDAV/HTTP 请求与错误映射（mock `GM_xmlhttpRequest`）
- `tests/backupService.test.ts`：上传、冲突、预览恢复
- `tests/backupView.test.ts`：远程备份表单与预览对话框渲染

远程备份依赖 `tamper_monkey.json` 中 `@connect` 的本机域名声明（`127.0.0.1` / `localhost`；`unpkg.com` 为 `@require` 外部依赖域名，与备份无关）；用户自填的其他域名需在脚本管理器中手动授权。**不要改成 `*`**，权限面过大。
