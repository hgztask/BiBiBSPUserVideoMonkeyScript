# b站屏蔽增强器
<hr>
b站根据用户名、uid、视频关键词、言论关键词进行屏蔽
<hr>
作用场所:频道的视频，首页推荐，搜索页面,播放页右侧推送，视频评论区、专栏的评论区
、消息中心的【回复我的】【@我的】
<hr>
需要添加要屏蔽的关键词，根据下面表格描述，修改js中的对应数组内容即可

| 类型  | 变量名 |
|-----|-----|
| 用户名 |  userNameArr  |
| 用户uid |   userUIDArr  |
| 标题  |  titleArr |
| 评论违禁词 |   commentOnKeyArr  |

对着注释对应的数组后面添加即可
<hr>
精简处理的地方有：

搜索页面右侧悬浮按钮（貌似是新版的，没留意）

搜索页面底部信息

视频播放界面右侧个别悬浮按钮

更新地址：[github地址](https://hgztask.github.io/BiBiBSPUserVideoMonkeyScript/b%E7%AB%99%E5%B1%8F%E8%94%BD%E6%8C%87%E5%AE%9A%E7%94%A8%E6%88%B7%E8%A7%86%E9%A2%91.js)
