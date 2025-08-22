# b站屏蔽增强器v2版

<hr>
对B站的视频和评论项进行屏蔽，其中包括动态直播间的评论等，详情可看下面支持的屏蔽类型

- 支持快捷屏蔽按钮，鼠标放在视频标题或评论上会显示屏蔽按钮，点击可选择uid精确屏蔽和用户名精确屏蔽，建议优先uid方式
- 所有屏蔽规则都可以在主面板，快捷键~打开或点击页面左上角按钮展开，中的规则管理按需添加规则
- 脚本发布在[脚本猫](https://scriptcat.org/zh-CN/script-show-page/1029/)
  和[greasyfork](https://greasyfork.org/zh-CN/scripts/461382)平台，脚本更新会优先更新到脚本猫上，其次greasyfork平台
  - 可使用下方插件安装，具体操作可看脚本猫或篡改猴平台介绍
  - [脚本猫](https://scriptcat.org/)
  - [篡改猴](https://chrome.zzzmh.cn/info/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- 常见问题汇总(持续更新)[https://docs.qq.com/doc/DSlJNR1NVcGR3eEto](https://docs.qq.com/doc/DSlJNR1NVcGR3eEto)
- 脚本项目开发文档[===》B站屏蔽器脚本项目开发需知《===](https://docs.qq.com/doc/DSkdTQ1p1aFNnVnRS?no_promotion=1)
  ，可二改，但需要留下作者版权信息
- 更新日志(包括发布前开发完的内容):[===》更新日志《===](https://docs.qq.com/doc/DSnhjSVZmRkpCd0Nj)
- 推荐使用edge或chrome浏览器(包括奔跑中的奶酪相关edge和chrome版本)，其他浏览器可能存在问题。
  ``
  如遇到插件的脚本不执行，请尝试关闭插件或浏览器的开发者人员模式再开启并重启浏览器尝试，如依旧不行，请下载[奔跑中的奶酪版本的便携版本edge或chrome](https://www.runningcheese.com/edge)
  ``

完整脚本描述可看(持续更新):[自述文档](https://docs.qq.com/doc/DSmJqSkhFaktBeUdk?u=1a1ff7b128d64f188a8bfb71b5acb28c)

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

需要注意的是模糊匹配和正则匹配的规则不用考虑要匹配的内容大写问题，如标题，会自动转成小写进行匹配。如不需要自动转换，可在主面板中的规则管理=>
条件限制=>模糊和正则匹配时，勾选转小写

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

## 最后的说明

1. 相比v1版本，该版本尽可能的减少非屏蔽相关的功能
2.

脚本开源在gitee，地址为：[https://gitee.com/hangexi/BiBiBSPUserVideoMonkeyScript](https://gitee.com/hangexi/BiBiBSPUserVideoMonkeyScript)

3. 如果有什么问题，欢迎提issue或前往作者交流群或b站个人主页上反馈
4. 该如还有未补充的，待后续完善描述

## 关于作者

[传送门\(企鹅反馈群聊876295632\)](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=tFU0xLt1uO5u5CXI2ktQRLh_XGAHBl7C&authKey=KAf4rICQYjfYUi66WelJAGhYtbJLILVWumOm%2BO9nM5fNaaVuF9Iiw3dJoPsVRUak&noverify=0&group_code=876295632)
作者所建的反馈提意见交流群(如果你有更好的建议或者想法以及需求都可以来反馈)，得到作者回复相对比其他平台要快.

[传送门](https://space.bilibili.com/473239155/dynamic)作者b站，最快更新状态和内容以及追进，也方便反馈相关问题

[传送门](https://greasyfork.org/zh-CN/scripts/461382)GF脚本主页

[传送门](https://scriptcat.org/zh-CN/users/96219)作者脚本猫地址

## 赞助

- 如果您觉得本脚本对您有帮助，欢迎赞助作者，以支持脚本的更新和开发。

<img src="https://www.mikuchase.ltd/img/paymentCodeZFB.webp" width="300">
<img src="https://www.mikuchase.ltd/img/paymentCodeWX.webp" width="300">
<img src="https://www.mikuchase.ltd/img/paymentCodeQQ.webp" width="300">
