# b站屏蔽增强器

<hr>

1. 支持根据用户名（模糊匹配和完全匹配）、用户UID、标题（模糊匹配和正则匹配）适用于视频标题、专栏标题、热搜、播放量大小限制、弹幕量大小限制、视频时长大小限制进行屏蔽页面上的内容。
2. 支持对页面视频进行镜像翻转和旋转，和视频画中画（youtube视频页和直播页也支持在播放页开启视频画中画），适用于直播间。
3. 支持对动态内容指定关键词进行屏蔽(模糊匹配和正则匹配)。
4. 支持为B站首页添加像App一样的推荐，可指定分区加载（如游戏区）
5. 支持导出用户的所有历史记录内容。
6. 支持导出用户的稍后再看内容(可指定已观看)。
7. 支持导出用户选中的收藏夹内容。
8. 支持导出用户关注列表的用户。
9. 支持导出用户粉丝列表的用户。
10. 支持获取视频的评论区目前页面可见的评论并导出。
11. 支持获取视频的弹幕。
12. 支持获取直播间的右边弹幕栏的页面可见弹幕内容并导出。
13. 支持获取直播间的高能用户列表并导出。
14. 针对于页面上一些布局调整。
15. 支持一次性显示用户关注列表中的开播用户（需要b站登录账号之后的sessdata Cookie值）显示在面板上
16. 支持可选移除视频播放页下的评论区，移除之后将不可见

平时少看GF和脚本猫，如有需求请通过下面描述通过b站联系或者邮箱byhgz@qq.com反馈

部分规则暂不支持修改，后续开放修改，目前也够日常使用

对界面进行适当排版和精简处理
<hr>

[传送门\(企鹅反馈群聊876295632\)](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=tFU0xLt1uO5u5CXI2ktQRLh_XGAHBl7C&authKey=KAf4rICQYjfYUi66WelJAGhYtbJLILVWumOm%2BO9nM5fNaaVuF9Iiw3dJoPsVRUak&noverify=0&group_code=876295632)
作者所建的反馈提意见交流群(如果你有更好的建议或者想法以及需求都可以来反馈)，得到作者回复相对比其他平台要快.

[传送门](https://space.bilibili.com/473239155/dynamic)作者b站，最快更新状态和内容以及追进，也方便反馈相关问题

[传送门](https://greasyfork.org/zh-CN/scripts/461382-b站屏蔽增强器)GF脚本主页

[传送门](https://scriptcat.org/script-show-page/1029)脚本猫主页

| 针对视频的屏蔽操作                       |
|---------------------------------|
| 根据视频作者用户名（包含或者完全匹配）进行屏蔽         |
| 根据视频标题（包含）进行屏蔽                  |
| 根据视频作者用户UID进行屏蔽                 |
| 根据视频播放量大小进行设置最大可展示的视频时长(目前还在测试) |
| 根据视频播放量大小进行设置最小可展示的视频时长(目前还在测试) |
| 根据视频播放量大小进行设置最大可展示的视频(目前还在测试)   |
| 根据视频播放量大小进行设置最小可展示的视频(目前还在测试)   |
| 根据视频弹幕量大小进行设置最大可展示的视频(目前还在测试)   |
| 根据视频弹幕量大小进行设置最小可展示的视频(目前还在测试)   |

| 针对于评论区和直播间的评论或弹幕屏蔽操作（专栏下评论区和单独打开动态页面评论区也算） |
|--------------------------------------------|
| 根据发言者用户名（包含或者完全匹配）进行屏蔽                     |
| 根据发言者用户UID进行屏蔽                             |
| 根据发言的关键词进行匹配屏蔽操作（一但匹配即屏蔽）                  |

**作用场所**

| 频道的视频 | 首页推荐   | 搜索页面        | 播放页右侧视频 |
|------|--------|-------------|---------|
| 视频评论区 | 专栏的评论区 | 消息中心的【回复我的】 | 消息中心的【@我的】 |
| 直播间  | 热门视频   | 首页的专区（如美食）  |            |

<hr>
精简处理的地方有：

搜索页面右侧悬浮按钮（貌似是新版的，没留意）

搜索页面底部信息

视频播放界面右侧个别悬浮按钮，和一些推广广告

网站顶栏中左侧的部分选项移除

首页右侧的个别悬浮按钮，顶部大图的跳转链接
