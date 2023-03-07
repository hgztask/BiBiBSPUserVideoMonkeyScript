# b站屏蔽增强器

<hr>
b站根据用户名、uid、粉丝牌（目前还在测试）、视频关键词、言论关键词和视频时长限制（设置允许视频时长最小值和最大值）进行屏蔽
<hr>

**作用场所**

|   频道的视频 |  首页推荐   |  搜索页面   | 播放页右侧视频 |
|-----|-----|-----|---------|
|  视频评论区   |  专栏的评论区   |  消息中心的【回复我的】   | 消息中心的【@我的】 |

<hr>
需要添加要屏蔽的关键词，根据下面表格描述，修改js中的对应数组内容即可

| 类型      | 变量名 | 值类型      | 说明                                                                                   |
|---------|-----|----------|--------------------------------------------------------------------------------------|
| 用户名     |  userNameArr | 字符串（字符）  | 根据用户名进行屏蔽                                                                            |
| 用户uid   |   userUIDArr | int类型（纯数字） | 根据用户UID进行屏蔽                                                                          |
| 标题      |  titleArr | 字符串（字符）  | 根据标题关键词进行屏蔽，包含的都会屏蔽                                                                  |
| 评论违禁词   |   commentOnKeyArr | 字符串（字符）  | 根据评论的关键词进行屏蔽，包含的都会屏蔽                                                                 |
| 视频时长最小值 | filterSMin|int类型（纯数字 | 设置允许出现的视频时长最小值，单位秒<br/>比如小于60秒的都会被屏蔽<br/>反之大于则不屏蔽<br/>该值优先级比是视频时长最大值高<br/>设置0则不生效该屏蔽模式 |
| 视频时长最大值 | filterSMax |int类型（纯数字 | 设置允许出现的视频时长最大值，单位秒<br/>比如大于120秒的都会被屏蔽<br/>反之小于则不屏蔽<br/>设置0则不生效该屏蔽模式|

对着注释对应的数组后面添加即可
<hr>
精简处理的地方有：

搜索页面右侧悬浮按钮（貌似是新版的，没留意）

搜索页面底部信息

视频播放界面右侧个别悬浮按钮，和一些推广广告

首页右侧的个别悬浮按钮、左上角的导航栏，顶部大图的跳转链接

更新地址：[github地址](https://hgztask.github.io/BiBiBSPUserVideoMonkeyScript/b%E7%AB%99%E5%B1%8F%E8%94%BD%E6%8C%87%E5%AE%9A%E7%94%A8%E6%88%B7%E8%A7%86%E9%A2%91.js)
