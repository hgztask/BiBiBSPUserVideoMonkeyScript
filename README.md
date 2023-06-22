# b站屏蔽增强器

<hr>

1. 支持根据用户名（模糊匹配和完全匹配）、用户UID、标题（模糊匹配和正则匹配）适用于视频标题、专栏标题、热搜、播放量大小限制、弹幕量大小限制、视频时长大小限制进行屏蔽页面上的内容。
2. 支持对页面视频进行镜像翻转和旋转，和视频画中画（youtube视频页和直播页也支持在播放页开启视频画中画），适用于直播间。
3. 支持对页面视频进行控制倍数播放，最小0.1倍数，最大16倍数，适用于直播间。
4. 支持对动态内容指定关键词进行屏蔽(模糊匹配和正则匹配)。
5. 支持为B站首页添加像App一样的推荐，可指定分区和频道视频加载（如游戏区，如原神频道）
6. 动态首页，面板支持显示用户关注列表中所有处于正在直播的用户。
7. 隐私模式，开启时候，用户无法正常访问当当前账号登录的一些信息，右上角顶栏的查询用户主页动态，后续会完善该功能
8. 支持导出用户的所有历史记录内容。
9. 支持导出用户的稍后再看内容(可指定已观看)。
10. 支持导出用户选中的收藏夹内容。
11. 支持导出用户关注列表的用户。
12. 支持导出用户粉丝列表的用户。
13. 支持获取视频的评论区目前页面可见的评论并导出。
14. 支持获取视频的弹幕。
15. 支持获取直播间的右边弹幕栏的页面可见弹幕内容并导出。
16. 支持获取直播间的高能用户列表并导出。
17. 针对于页面上一些布局调整。
18. 支持一次性显示用户关注列表中的开播用户（需要b站登录账号之后的sessdata Cookie值）显示在面板上
19. 支持可选移除视频播放页下的评论区，移除之后将不可见

平时少看GF和脚本猫，如有需求请通过下面描述通过b站联系或者邮箱byhgz@qq.com反馈

部分规则暂不支持修改，后续开放修改，目前也够日常使用

对界面进行适当排版和精简处理
<hr>

[传送门](https://space.bilibili.com/473239155/dynamic)作者b站，最快更新状态和内容以及追进，也方便反馈相关问题

[传送门](https://greasyfork.org/zh-CN/scripts/461382-b站屏蔽增强器)GF脚本主页

[传送门](https://scriptcat.org/script-show-page/1029)脚本猫主页

| 针对视频的屏蔽操作                     |
|-------------------------------|
| 根据视频作者用户名（包含或者完全匹配）进行屏蔽       |
| 根据视频标题（包含）进行屏蔽                |
| 根据视频作者用户UID进行屏蔽               |
| 根据视频播放量大小进行设置最大可展示的视频时长       |
| 根据视频播放量大小进行设置最小可展示的视频时长       |
| 根据视频播放量大小进行设置最大可展示的视频         |
| 根据视频播放量大小进行设置最小可展示的视频         |
| 根据视频弹幕量大小进行设置最大可展示的视频(目前还在测试) |
| 根据视频弹幕量大小进行设置最小可展示的视频(目前还在测试) |

| 针对于评论区和直播间的评论或弹幕屏蔽操作（专栏下评论区和单独打开动态页面评论区也算） |
|-------------------------------------------|
| 根据发言者用户名（包含或者完全匹配）进行屏蔽      |
| 根据发言者用户UID进行屏蔽                 |
| 根据发言的关键词进行匹配屏蔽操作（一但匹配即屏蔽）  |

**作用场所**

| 频道的视频 | 首页推荐   | 搜索页面        | 播放页右侧视频 |
|------|--------|-------------|---------|
| 视频评论区 | 专栏的评论区 | 消息中心的【回复我的】 | 消息中心的【@我的】 |
| 直播间  | 热门视频   | 首页的专区（如美食）  |            |

用户可以根据js文件中的规则参数阻止b站自动播放视频和控制视频播放的速度，一般情况下，没有登录或者没有设置b站默认会自动播放的，根据个人
习惯，作者是不太喜欢这一逻辑的，所以该脚本是默认让视频不自动播放的，如果用户想要自动播放可以修改规则信息里的
autoPlay值，改成true即可，也就是不用脚本来控制视频的自动播放，让b站自己控制
<hr>

rule变量中的设置规则默认仅供参考，用户可按需修改，后续可以在面板上修改。

<hr>
精简处理的地方有：

搜索页面右侧悬浮按钮（貌似是新版的，没留意）

搜索页面底部信息

视频播放界面右侧个别悬浮按钮，和一些推广广告

首页右侧的个别悬浮按钮、左上角的导航栏，顶部大图的跳转链接

进入直播首页会移除大窗口直播间和大视频右侧的直播列表，并且该直播间会暂停播放（由于b站的尿性，会自动播放直播间画面和声音的，就算暂停了，也毕竟是脚本的注入，这期间的时间，会听到一点，暂停之后就听不到了）
