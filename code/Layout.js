const layout = {
    css: {
        home: function () {
            Util.addStyle(`
#home_layout {
    background: ${Home.getBackgroundStr()};
    margin: 0px;
    height: 100%;
    width: 100%;
    max-height: 100%;
    position: fixed;
    z-index: 2023;
    overflow-y: auto;
    border: 3px solid green;
}
/* 隐藏标签布局，除了“active”的标签布局 */
.tab {
    display: none;
}
.tab.active {
    display: block;
}
ul {
    /* 隐藏ul标签的默认符号 */
    list-style: none;
}
/* 悬浮屏蔽布局 */
#suspensionDiv {
    position: fixed;
    display: none;
    z-index: 2024;
    background: rgb(149, 156, 135);
    overflow-y: auto;
    height: 30%;
    width: 10%;
    top: 70%;
    left: 90%;
    border: 3px solid green;
}
#suspensionDiv p {
    margin-top: 10px;
}
#suspensionDiv button {
    margin-top: 10px;
    padding: 5px 10px;
    border: none;
    background-color: #4CAF50;
    color: #fff;
    cursor: pointer;
}
#suspensionDiv button:hover {
    background-color: #3E8E41;
}
/* 悬浮屏蔽布局 */
#sort_typeSelect {
    display: none;
}
#mybut {
    position: fixed;
    z-index: 2024;
    width: 50px;
    height: 50px;
    left: 96%;
    bottom: 85%;
    background: rgb(67, 67, 124);
    color: white;
    border: none;
    border-radius: 50%;
}
#ruleCRUDLayout>div>div{
border: 0.5px solid green;
}
            `);
        }
    },
    getPanelSetsTheLayout: function () {//面板设置
        return `<div style="display: flex;flex-wrap: wrap;justify-content: flex-start;">
      <div>
        <span>背景透明度</span>
        <input id="backgroundPellucidityRange" type="range" value="1" min="0.1" max="1" step="0.1">
        <span id="backgroundPelluciditySpan">1</span>
      </div>
      <div>
        <span>高度</span>
        <input id="heightRange" type="range" value="100" min="20" max="100" step="0.1">
        <span id="heightSpan">100%</span>
      </div>
      <div>
        <span>宽度</span>
        <input id="widthRange" type="range" value="100" min="20" max="100" step="0.1">
        <span id="widthSpan">90%</span>
      </div>
    </div>
    <h1>快捷悬浮面板</h1>
    <input type="checkbox" id="DShielPanel"><span>禁用快捷悬浮屏蔽面板自动显示(提示:快捷键3可隐藏该快捷悬浮屏蔽面板)</span>
    <h1>悬浮屏蔽筛选列表面板</h1>
        <button id="OpenTheFilteredList" style="">打开筛选列表</button>`;
    },
    getRuleCRUDLayout: function () {
        return `
<div style="display: flex;flex-wrap: wrap;">
<div>
<div>
<h2>规则增删改查</h2>
        <select id="singleDoubleModel">
          <option value="one">单个</option>
          <option value="batch">批量</option>
        </select>
        <select id="model">
          <option value="userNameArr">用户名黑名单模式(精确匹配)</option>
          <option value="userNameKeyArr">用户名黑名单模式(模糊匹配)</option>
          <option value="userUIDArr">用户uid黑名单模式(精确匹配)</option>
          <option value="userWhiteUIDArr">用户白名单模式(精确匹配)</option>
          <option value="titleKeyArr">标题黑名单模式(模糊匹配)</option>
          <option value="titleKeyCanonicalArr">标题黑名单模式(正则匹配)</option>
          <option value="commentOnKeyArr">评论关键词黑名单模式(模糊匹配)</option>
          <option value="contentOnKeyCanonicalArr">评论关键词黑名单模式(正则匹配)</option>
          <option value="fanCardArr">粉丝牌黑名单模式(精确匹配)</option>
          <option value="contentColumnKeyArr">专栏关键词内容黑名单模式(模糊匹配)</option>
          <option value="dynamicArr">动态关键词内容黑名单模式(模糊匹配)</option>
        </select>
        <textarea id="inputTextAreaModel" style="resize: none; width: 40%; height: 100px; display: none"></textarea>
        <div>
          <button id="butadd">增加</button>
          <button id="butaddAll" style="display: none">批量增加</button>
          <button id="butdel">删除</button>
          <button id="butdelAll" style="display: none">全部删除</button>
          <button id="butSet">修改</button>
          <button id="butFind">查询</button>
          <button id="lookRuleContentBut">查看本地规则内容</button>
        </div>
      </div>
    <details>
      <summary>其他</summary> 
      <h4 style="color: red">注意下面为0则不生效</h4>
      <input min="0" style="width: 29%;height: 20px;" type="number" id="inputVideo" />
      <select id="selectVideo">
        <option value="filterSMin">时长最小值(单位秒)</option>
        <option value="filterSMax">时长最大值(单位秒)</option>
        <option value="broadcastMin">播放量最小值</option>
        <option value="broadcastMax">播放量最大值</option>
        <option value="barrageQuantityMin">弹幕量最小值</option>
        <option value="barrageQuantityMax">弹幕量最大值</option>
      </select>
      <button id="butSelectVideo">确定</button>
     </details>
     <h2>使用说明</h2>
     <ol>
     <li>
     <pre style="white-space: pre-wrap">脚本中会对要匹配的内容进行去除空格和转成小写，比如有个内容是【不 要  笑   挑  战  ChallEnGE】，会被识别称为【不要笑挑战challenge】</pre>
     </li>
     <li>在上述一点的情况下，模糊匹配和正则匹配的方式时不用考虑要匹配的内容中大写问题</li>
     <li>如果用户要添加自己的正则匹配相关的规则时，建议先去该网址进行测试再添加，避免浪费时间【<a href="https://c.runoob.com/front-end/854/" target="_blank" title="正则表达式在线测试 | 菜鸟工具">https://c.runoob.com/front-end/854/正则表达式在线测试|菜鸟工具</a>】</li>
     <li>如需要备份自己的规则可以考虑在当前选项卡下的【规则导入导出】中选择你要导出的方式，【全部规则到文件】、【全部规则到剪贴板】、【全部UID规则到文件】和【全部规则到云端账号】，如您需要备份在云端服务器上请选择【全部规则到云端账号】</li>
     </ol>
     </div>
     <div id="textRuleInfoDiv">
     <h2>规则信息</h2>
     <div></div>
    </div>
    <div>
    <h2>规则导入导出</h2>
      <div>
  <select id="outRuleSelect">
  <option>全部规则到文件</option>
  <option>全部规则到剪贴板</option>
  <option>全部UID规则到文件</option>
  <option>b站弹幕屏蔽规则</option>
  <option>全部规则到云端账号</option>
</select>
<button id="outExport">导出</button>
</div>
<div>
  <select id="inputRuleSelect">
  <option value="">从云端账号导入覆盖本地规则</option>
  <option value="">从下面编辑框导入全部规则</option>
  <option value="">从下面编辑框合并导入UID规则</option>
</select>
<button id="inputExport">导入</button>
</div>
    <textarea id="ruleEditorInput" placeholder="请填导入的规则内容" style="resize: none; height: 300px; width: 100%; font-size: 14px;display: none"></textarea>
    </div>
    </div>
`;
    },
    getHomePageLayout: function () {
        return ` <details open>
      <summary>首页</summary>
      <h3>首页推荐视频</h3>
      <span>指定推送</span>
      <input type="checkbox">
      <select id="pushTypeSelect" style="display: block">
        <option value="分区">分区</option>
        <option value="频道">频道</option>
      </select>
       <select id="sort_typeSelect">
        <option value="hot">近期热门</option>
        <option value="view">播放最多（近30天投稿）</option>
        <option value="new">最新投稿</option>
      </select>
      <select id="video_zoneSelect">
        <option value="1">下拉选择</option>
      </select>
      <div style="display: flex;flex-direction: row;justify-content: flex-end;align-items: center;padding-right: 2%;">
      <input type="checkbox" id="isIdCheckbox">
      <span>id</span>
      <button id="findButon" style="padding-right: 20px;padding-left: 10px;">查询</button>
      <button id="okButton">确定</button>
      </div>
      </details>`;
    },
    getVideo_params_layout: function () {
        return `<div>
                <input type="checkbox" id="autoPlayCheckbox"><span>禁止打开b站视频时的自动播放</span>
                <div>
                  <input type="checkbox" id="fenestruleCheckbox"><span>视频画中画</span>
                </div>
                <h3>视频播放速度</h3>
              拖动更改页面视频播放速度
                <input id="rangePlaySpeed" type="range" value="1.0" min="0.1" max="16" step="0.01">
                <span id="playbackSpeedText">1.0x</span>
                <button id="preservePlaySpeed">保存</button>
                <div>固定视频播放速度值
                  <select id="playbackSpeedModel">
                  <option value="1">1.0x</option>
                  <option value="0.25">0.25x</option>
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="0.9">0.9x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.35">1.35x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2">2x</option>
                </select>
                <button id="preservePlaybackSpeedModel">保存</button>
              </div>
              <hr>
              <div>
              </div>
              </div>
              <h3>播放画面翻转</h3>
             <button id="flipHorizontal">水平翻转</button>
             <button id="flipVertical">垂直翻转</button>
             <div>
              自定义角度
              <input id="axleRange" type="range" value="0" min="0" max="360" step="1"><span id="axleSpan">0%</span>
             </div>
             <div style="display: flex;">
             <input type="checkbox" id="delVideoCommentSectionsCheackBox">移除视频播放页底下的评论区
</div>
`;
    },
    getOutputInfoLayout: function () {
        return `<div>
      <button id="butClearMessage">清空信息</button>
      <input type="checkbox" checked="checked">
      <span>二次确认</span>
    </div>
    <div id="outputInfo">
    </div>`;
    },
    getOtherLayout: function () {
        return `<div>
      <button onclick="document.documentElement.scrollTop=0;">页面置顶</button>
    </div>
    <details>
      <summary>快捷键</summary>
      <div>
        <h1>快捷键</h1>
        <p> 显示隐藏面板 快捷键\`</p>
        <p>选中取消快捷悬浮屏蔽面板跟随鼠标 快捷键1</p>
        <p>选中固定快捷相符屏蔽面板的固定面板值 快捷键2</p>
        <p>隐藏快捷悬浮屏蔽面板 快捷键3</p>
      </div>
    </details>
    <hr>
    <details>
      <summary>b站SESSDATA</summary>
      <p>该数据一些b站api需要用到，一般情况下不用设置，以下的设置和读取均是需要用户自行添加b站对应的SESSDATA值，读取时候也是读取用户自己添加进去的SESSDATA值，脚本本身不获取b站登录的SESSDATA</p>
      <P>提示：为空字符串则取消移除SESSDATA，不可带有空格</P>
      <div style="display: flex; justify-content: space-between;" id="sgSessdata">
        <button title="为空字符串则取消">设置SESSDATA</button>
        <button>读取SESSDATA</button>
      </div>
      <div style=" display: flex;justify-content: space-between;" id="bili_jctDiv">
        <button>设置bili_jct</button>
        <button>设置b站登录的bili_jct</button>
        <button>读取b站登录的bili_jct</button>
        <button>读取bili_jct</button>
      </div>
    </details>
    <div style="display: flex">
    <input type="checkbox" id="openPrivacyModeCheckbox">开启隐私模式
    </div>
    <div>
    <button  value="bvBut">bv号转av号</button>
    <button  value="avBut">av号转bv号</button>
    </div>
    <hr>
    <div>
      <h1> 反馈问题</h1>
      <p>作者b站：<span><a href="https://space.bilibili.com/473239155" target="_blank">点我进行传送！</a></span></p>
      <p>本脚本gf反馈页<span>
          <a href="https://greasyfork.org/zh-CN/scripts/461382-b%E7%AB%99%E5%B1%8F%E8%94%BD%E5%A2%9E%E5%BC%BA%E5%99%A8/feedback" target="_blank">点我进行传送！</a>
        </span>
      </p>
    </div>`;
    },
    getSuspensionDiv: function () {
        return `<!-- 悬浮屏蔽布局 -->
      <div id="suspensionDiv">坐标:
        <span id="suspensionXY">xy</span>
        <div>
          <span>按钮跟随鼠标</span>
          <input id="quickLevitationShield" type="checkbox">
        </div>
       <div>
       <span>固定面板值</span>
       <input id="fixedPanelValueCheckbox" type="checkbox">
       </div>
        <p>用户名：<span id="nameSuspensionDiv"></span></p>
        <div>
        <details style="display: none">
        <summary>视频信息</summary>
        <p>标题:<span class="title"></span></p>
        <p>视频BV号:<span class="bv"></span></p>
        <p>视频AV号:<span class="av"></span></p>
</details>
        </div>
        <p>用户UID：<a id="uidSuspensionDiv" href="#" target="_blank">用户地址</a></p>
        <button id="butShieldName">add屏蔽用户名</button>
        <button id="butShieldUid">add屏蔽用户名UID</button>
        <button id="findUserInfo">查询基本信息</button>
        <button id="getVideoDanMueBut" style="display: none">获取视频弹幕</button>
        <button id="getVideoCommentArea" style="display: none" title="获取评论区目前页面可见得内容">获取评论区列表内容</button>
        <button id="getLiveHighEnergyListBut" style="display: none">获取高能用户列表</button>
        <button id="getLiveDisplayableBarrageListBut" style="display: none">获取当前可显示的弹幕列表</button>
      </div>
     <!-- 悬浮屏蔽按钮 -->`;
    },
    getFilter_queue: function () {//个人主页悬浮屏蔽按钮
        return $(`<div style="position: fixed;z-index: 2022;  top: 25%; left: 4%; width: 50px; height: 50px; border-radius: 25px; background-color: #FFA500; color: #FFF; font-size: 20px; text-align: center; line-height: 50px;">屏蔽</div>
`);
    },
    getDonateLayout: function () {//捐赠页面
        return $(`
   <div style="border: 3px solid #000;">
            <div style="display: flex;align-items: center;">
                <h2>零钱赞助</h2>
                <ul>
                    <li>1元不嫌少，10元不嫌多哦！感谢支持！</li>
                    <li>生活不易，作者叹息</li>
                    <li>您的支持是我最大的更新动力</li>
                </ul>
            </div>
            <hr>
        <div style="display: flex;justify-content: center;">
            <div>
                <img src="https://hangexi.gitee.io/datafile/img/paymentCodeZFB.png" alt="支付宝打赏支持" style="max-height: 500px;">
                <span style="display: flex;justify-content: center;">支付宝赞助</span>
            </div>
            <div>
                <img src="https://hangexi.gitee.io/datafile/img/paymentCodeWX.png" alt="微信打赏支持" style="max-height: 500px;">
                <span style="display: flex;justify-content: center;">微信赞助</span>
            </div>
                <div>
                <img src="https://hangexi.gitee.io/datafile/img/paymentCodeQQ.png" alt="QQ打赏支持" style="max-height: 500px;">
                <span style="display: flex;justify-content: center;">QQ赞助</span>
            </div>
        </div>
        <hr>
        <h1 style=" display: flex; justify-content: center;">打赏点猫粮</h1>
    </div>
`);
    },
    ruleCenter: {
        getRuleCenterLayout: function () {//规则中心
            return $(`<ul style="margin: 0;padding-left: 0">
</ul>`);
        }
    },
    getLogin: function () {//登录账号界面
        return $(`<div style="display: flex;flex-direction: column;align-items: center;">
    <h1>登录账号</h1>
    <input type="text" placeholder="用户名" id="userNameInput">
    <input type="text" placeholder="密码" id="userPasswordInput">
    <div>
        <button>
            <a href="https://vip.mikuchase.ltd/bilibili/shieldRule/enroll/" target="_blank">注册</a>
        </button>
        <button id="loginBut">登录</button>
    </div>
</div>`);
    }, loading: {
        home: function () {
            const bodyJQE = $("body");
            bodyJQE.prepend(`
      <div id="home_layout" style="display: none">
        <!-- 标签栏 -->
  <ul style="display: flex;justify-content: space-around;padding-top: 10px;" id="tabUl">
    <!-- 每个标签都有一个唯一的ID，可以在后面的标签布局中使用 -->
    <li><button value="panelSetsTheLayout">面板设置</button></li>
    <li><button value="ruleCRUDLayout">规则增删改查-信息-备份与恢复(导出与导入)</button></li>
    <li><button value="homePageLayout">首页</button></li>
    <li><button value="video_params_layout">视频参数</button></li>
    <li><button value="liveLayout">直播列表</button></li>
    <li><button value="outputInfoLayout">输出信息</button></li>
    <li><button value="otherLayout">其他</button></li>
    <li><button value="donateLayout">支持打赏作者</button></li>
    <li><button value="ruleCenterLayout">规则中心</button></li>
    <li><button value="accountCenterLayout">账户中心</button></li>
  </ul>
  <!-- 标签布局 -->
  <div class="tab" id="panelSetsTheLayout"></div><!-- 面板设置布局 -->
  <div class="tab" id="ruleCRUDLayout"></div><!-- 规则增删改查布局 -->
  <div class="tab" id="homePageLayout"></div><!-- 首页布局 -->
  <div class="tab active" id="outputInfoLayout"></div><!-- 输出信息布局 -->
  <div class="tab" id="otherLayout"></div><!-- 其他布局 -->
  <div class="tab" id="liveLayout"></div><!-- 直播列表布局 -->
  <div class="tab" id="video_params_layout"><!-- 视频参数布局 --></div>
  <div class="tab" id="donateLayout"><!-- 捐赠布局 --></div>
  <div class="tab" id="ruleCenterLayout"><!-- 规则中心布局 --></div>
  <div class="tab" id="accountCenterLayout"><!-- 账户中心布局 --></div>
      </div>
<!-- 分割home_layout -->
    `);
            $("#panelSetsTheLayout").append(layout.getPanelSetsTheLayout());
            $("#ruleCRUDLayout").append(layout.getRuleCRUDLayout());
            $("#homePageLayout").append(layout.getHomePageLayout());
            $("#video_params_layout").append(layout.getVideo_params_layout());
            $("#outputInfoLayout").append(layout.getOutputInfoLayout());
            $("#otherLayout").append(layout.getOtherLayout());
            $("#donateLayout").append(layout.getDonateLayout());
            $("#ruleCenterLayout").append(layout.ruleCenter.getRuleCenterLayout());
            AccountCenter.info();
            bodyJQE.append(layout.getSuspensionDiv());
        }
    }
}