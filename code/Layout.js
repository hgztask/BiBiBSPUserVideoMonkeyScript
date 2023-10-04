const layout = {
    css: {
        home() {
            Util.addStyle(`
#home_layout {
    background: ${Home.getBackgroundStr()};
    margin: 0px;
    height: 100%;
    width: 100%;
    max-height: 100%;
    position: fixed;
    z-index: 2024;
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
    z-index: 2023;
    background: rgb(149, 156, 135);
    height: atuo;
    width: 10%;
    top: 49%;
    left: 90%;
    border: 3px solid green;
}
#suspensionDiv p {
    margin-top: 10px;
}
#suspensionDiv .center button,#home_layout button,#rightLayout button{
    margin-top: 10px;
    padding: 5px 10px;
    border: none;
    background-color: #4CAF50;
    color: #fff;
    cursor: pointer;
}
#suspensionDiv .center button:hover,#home_layout button:hover,#rightLayout button:hover {
    background-color: #3E8E41;
}

#mybut {
    position: fixed;
    z-index: 2025;
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
    panel: {
        /**
         * 悬浮球
         * @param text 显示内容
         * @param top
         * @param left
         * @param position
         * @returns {*|jQuery|HTMLElement}
         */
        getHoverball(text, top, left, position = "fixed") {
            return $(`<button style=" position: ${position};margin-top: 10px;z-index: 2000;left: ${left};top: ${top};
    padding: 5px 10px;
    border: none;
    background-color: #4CAF50;
    color: #fff;
    cursor: pointer;">${text}</button>`);
        },
        getFilter_queue() {//个人主页悬浮屏蔽按钮
            return this.getHoverball("屏蔽", "15%", "4%");
        },
        getFollowersOrWatchlists() {
            return this.getHoverball("获取xxx列表", "22%", "4%");
        }
    },
    getRuleCRUDLayout() {
        return `
<div style="display: flex;flex-wrap: wrap;">
<div>
<div>
<h2>规则增删改查</h2>
<select v-model="model">
<option v-for="(item,key) in modelList" v-bind:value="key">{{item}}</option>
</select>      
<select v-model="defaultSelect">
<option v-for="(item,key) in ruleKeyList" v-bind:value="key">{{item.name}}</option>
</select> 
<div>
<textarea style="width: 40%; height: 100px;"v-show="isBatchShow" v-model.trim="ruleEditBox"></textarea>
</div>  
        <div>
          <button @click="add" v-show="isSingleShow">增加指定规则</button>
          <button @click="addAll" v-show="isBatchShow">批量增加规则</button>
          <button @click="delItem" v-show="isBatchShow">删除下拉框选中的规则</button>
          <button @click="delKey" v-show="isSingleShow">删除指定规则</button>
          <button @click="delAll" v-show="isBatchShow">删除所有规则</button>
          <button @click="setKey" v-show="isSingleShow">修改</button>
          <button @click="findKey" v-show="isSingleShow">查询</button>
          <button @click="lookLocalRUleContent">查看本地下拉框中所有的规则内容</button>
          <button @click="lookLocalAppointRUleContent">查看下拉框中指定的规则内容</button>
        </div>
        <hr>
        <h3>测试规则</h3>
        <select v-model="defaultMPSelect">
        <option v-for="item in MPSList" :value="item">{{item}}</option>
        </select>模式
        <div>
        二次确认<input type="checkbox" v-model=debugSeC>
        </div>
        <div>
        填写规则时自动测试<input type="checkbox" v-model="debugATestOInput">
        </div>
        <div>
        要匹配的内容(测试内容)：<input type="text" v-model.trim="debugText">
        </div>
        <div>
        规则：<input type="text" v-model.trim="debugRuleVal">
        </div>
        <button @click="okDebugRule" title="用于测试指定规则类型是否能匹配内容">测试</button>
      </div>
      <hr>
    <details>
      <summary>视频基本信息处理(时长弹幕播放量)</summary> 
      <h4 style="color: red">注意下面为0则不生效</h4>
      <input min="0" style="width: 29%;height: 20px;" type="number" v-model="videoRuleValueInput"/>
      <select v-model="videoSelectValue">
       <option v-for="(item,key) in videoRuleList" v-bind:value="key">{{item}}</option>
      </select>
      <button @click="okVideoSelectBut">确定</button>
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
     <div>
     <h2>规则信息</h2>
     <p v-for="(item,key) in ruleKeyList">{{item.name}}个数<span style="color: #ff0000">{{item.size}}</span>个</p>
    </div>
    <div>
    <h2>规则导入导出</h2>
      <div>
  <select v-model="outRuleSelect">
  <option v-for="(item,key) in outRUleModelList":value="key">{{item}}</option>
</select>
<button @click="outRule">导出</button>
</div>
<div>
  <select v-model="inputRuleSelect">
  <option  v-for="item in inoutRUleModelList" :value="item">{{item}}</option>
</select>
<button @click="inputRule">导入</button>
</div><textarea v-model.trim="inputEditContent" placeholder="请填导入的规则内容" style="height: 300px; width: 100%; font-size: 14px;" v-show="isInputEditShow"></textarea></div>
</div>
`;
    },
    getHomePageLayout() {
        return `
      <h3>首页推荐视频</h3>
      <div>
          <span>指定推送</span>
          <input type="checkbox" v-model="isMainVideoListCheckbox">
          <select v-model="pushTypeSelect"><option v-for="item in pushTypeList" :value="item">{{item}}</option></select>
           <select v-model="sort_typeSelect" v-if="isChannelSelect">
            <option v-for="(item,key) in sort_typeList" :value="key">{{item}}</option>
          </select>
          <select v-model="showListSelect">
            <option v-for="(item,key) in showList" :value="key">{{item}}</option>
          </select>
      </div>

      <div>
      <input type="checkbox" v-model="isIdCheckbox">id
      <button @click="findBut">查询</button>
      <button @click="okBut">确定</button>
      </div>`;
    },
    getVideo_params_layout() {
        return `<div>
<div>
<h1>播放器</h1>
<div>
<input type="checkbox" v-model="autoPlayCheckbox">禁止打开b站视频时的自动播放
</div>
<div>
<button @click="VideoPIPicture">视频画中画</button>
</div>
<h3>视频播放速度</h3>
 <div>固定视频播放速度值
   <select v-model="playbackSpeedSelect">
   <option v-for="item in playbackSpeedList" :value="item">{{item}}x</option>
    </select>
  </div>
拖动更改页面视频播放速度<input v-model="rangePlaySpeed" type="range" value="1.0" min="0.1" max="16" step="0.01">
 <span>{{rangePlaySpeed}}x</span>
 <button @click="preservePlaySpeed">保存</button>
<hr>
</div>
    <h3>播放画面翻转</h3>
   <button @click="okFlipHorizontal">水平翻转</button>
   <button @click="okFlipVertical">垂直翻转</button>
   <div>
    自定义角度
    <input v-model="axleRange" type="range" value="0" min="0" max="360" step="1"><span>{{axleRange}}%</span>
   </div>
   <hr>
   <h3>播放页界面元素显隐</h3>
   <div style="display: flex;">
       <input type="checkbox" v-model="hideVideoTopTitleInfoCheackBox">默认隐藏视频播放页顶部标题信息布局</div>
       <input type="checkbox" v-model="hideVideoButtonCheackBox">默认隐藏视频播放页的评论区</div>
       <input type="checkbox" v-model="hideVideoRightLayoutCheackBox">默认隐藏视频播放页播放器的右侧布局
   </div>`;
    },
    getOutputInfoLayout() {
        return `<div>
      <button id="butClearMessage">清空信息</button>
      <input type="checkbox" checked="checked">
      <span>二次确认</span>
    </div>
    <div id="outputInfo">
    </div>`;
    },
    getOtherLayout() {
        return `<div>
      <button onclick="document.documentElement.scrollTop=0;">页面置顶</button>
    </div>
    <details>
      <summary>快捷键</summary>
      <div>
        <p> 显示隐藏面板 快捷键\`</p>
        <p>选中取消快捷悬浮屏蔽面板跟随鼠标 快捷键1</p>
        <p>选中固定快捷相符屏蔽面板的固定面板值 快捷键2</p>
        <p>隐藏快捷悬浮屏蔽面板 快捷键3</p>
      </div>
    </details>
    <hr>
    <details open>
      <summary>b站SESSDATA</summary>
      <p>该数据一些b站api需要用到，一般情况下不用设置，以下的设置和读取均是需要用户自行添加b站对应的SESSDATA值，读取时候也是读取用户自己添加进去的SESSDATA值，脚本本身不获取b站登录的SESSDATA</p>
      <P>提示：为空字符串则取消移除SESSDATA，不可带有空格</P>
      <div>
        <button title="为空字符串则取消" @click="setSgSessdataBut">设置SESSDATA</button>
        <button @click="getSgSessdataBut">读取SESSDATA</button>
      </div>
      <div>
        <button @click="setBili_jctBut">设置bili_jct</button>
        <button @click="setLogInBili_jctBut">设置b站登录的bili_jct</button>
        <button @click="getLogInBili_jctBut">读取b站登录的bili_jct</button>
        <button @click="getBili_jctBut">读取bili_jct</button>
      </div>
    </details>
    <div style="display: flex">
    <input type="checkbox" v-model="isPrivacyModeCheckbox">开启隐私模式
    </div>
    <div>
    <h1>网络请求</h1>
    <p>默认仅仅只能请求b站的顶级域，如需请求其他的网站，请在油猴中打开本脚本的设置，在XHR安全选项卡中，针对性添加域名白名单，pan.baidu.com，和baidu.com，后者范围更大，前者无法请求到其他百度的子域名。</p>
    请求Url：
    <input type="text" v-model.trim="requestUrl" style="width: 100%">
    Cookie：
    <input type="text" v-model.trim="requestCookie" style="width: 100%">
    <div><select v-model="requestTypeSelect"><option  v-for="item in requestType" :value="item">{{item}}</option></select></div>
    <div><button @click="sendRequestBut">发送请求</button></div>
    <details>
    <summary>相应结果</summary>
    <textarea style="width: 100%;height: 500px" readonly>{{responseResult}}</textarea>
    </details>
    </div>
    <div>
    <h1>其他</h1>
    <button @click="bvToAvBut">bv号转av号</button>
    <button @click="avTObvBut">av号转bv号</button>
    </div>
    <hr>
<details open>
    <summary>GBT乐赏游戏空间</summary>
    <button @click="openGBTWebBut">前往GBT乐赏游戏空间地址</button>
    <button @click="getGBTPageDataInfoBut">初始化页面资源信息</button>
    <button @click="getGBTDataBut">获取页面资源</button>
    <button @click="getGBTFildKeysBut">获取指定key的项目</button>
</details>
<details title="设置之后加载其他动态内容或者刷新页面才生效" open>
<summary>动态</summary>
<input type="checkbox" v-model="isTrendsItemsTwoColumnCheackbox">动态首页动态展示双列显示
</details>
<details open>
<summary>b站页面传送门</summary>
<button v-for="(item,keyName) in BWebOpenList" :value="item" @click="openBWeb(item,keyName)">{{keyName}}</button>
</details>
    <div>
      <h1> 反馈问题</h1>
      <p>作者b站：<span><a href="https://space.bilibili.com/473239155" target="_blank">点我进行传送！</a></span></p>
      <p>本脚本gf反馈页<span>
          <a href="https://greasyfork.org/zh-CN/scripts/461382-b%E7%AB%99%E5%B1%8F%E8%94%BD%E5%A2%9E%E5%BC%BA%E5%99%A8/feedback" target="_blank">点我进行传送！</a>
        </span>
      </p>
    </div>`;
    },
    getSuspensionDiv() {
        return `<!-- 悬浮屏蔽布局 -->
      <div id="suspensionDiv">
       <div style="display: flex;justify-content: center;">
        <button value="上" @click="moveTop" >↑</button>
    </div>
        <div style="display: flex;justify-content: space-between;">
        <button value="左" @click="moveLrft">←</button>
       <div class="center">
       <div>移动步长：{{moveLayoutValue}}<input type="range" value="5" min="1" max="1000" v-model="moveLayoutValue"></div>
      坐标:x{{xy.x}}|y:{{xy.y}}
        <div>
          <span>按钮跟随鼠标</span>
          <input id="quickLevitationShield" type="checkbox">
        </div>
       <div>
       <span>固定面板值</span>
       <input id="fixedPanelValueCheckbox" type="checkbox">
       </div>
        <p>用户名：{{upName}}</p>
        <p>UID：<a v-bind:href="'https://space.bilibili.com/'+uid" target="_blank">{{uid}}</a></p>
        <details v-show="videoData.show" :open="videoData.show" @toggle="handleToggle">
        <summary>视频信息</summary>
        <p>标题:{{videoData.title}}</span></p>
        <p>视频BV号:{{videoData.bv}}</span></p>
        <p>视频AV号:{{videoData.av}}</p>
        <button @click="addToWatchedBut">添加进已观看</button>
        <button @click="addLookAtItLater">添加进稍后再看</button>
</details>
        <button @click="addShieldName">add屏蔽用户名</button>
        <button @click="addShieldUid">add屏蔽用户名UID</button>
        <button @click="findUserInfo">查询基本信息</button>
        <button id="getLiveHighEnergyListBut" style="display: none">获取高能用户列表</button>
        <button id="getLiveDisplayableBarrageListBut" style="display: none">获取当前可显示的弹幕列表</button>
       </div>
        <button value="右" @click="moveRight">→</button>
    </div>
    <div style="display: flex;justify-content: center;">
        <button value="下" @click="moveButton">↓</button>
    </div>
    
    
      </div>
     <!-- 悬浮屏蔽按钮 -->`;
    },
    getDonateLayout() {//捐赠页面
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
                <div v-for="item in list" :title="item.name"><img :src="item.src" :alt="item.alt" style="max-height: 500px;">
                <span style="display: flex;justify-content: center;">{{item.name}}</span>
                </div>
        </div>
        <hr>
        <h1 style=" display: flex; justify-content: center;">打赏点猫粮</h1>
    </div>
`);
    },
    ruleCenter: {
        getRuleCenterLayout() {//规则中心
            return $(`<ul style="margin: 0;padding-left: 0">
</ul>`);
        }
    },
    getLogin() {//登录账号界面
        return $(`<div style="display: flex;flex-direction: column;align-items: center;">
    <h1>登录账号</h1>
    <input type="text" placeholder="用户名" id="userNameInput">
    <input type="text" placeholder="密码" id="userPasswordInput">
    <div>
        <button>
            <a href="https://api.mikuchase.ltd/bilibili/shieldRule/enroll/" target="_blank">注册</a>
        </button>
        <button id="loginBut">登录</button>
    </div>
</div>`);
    }, loading: {
        home() {
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
    <li><button value="watchedListLayout">已观看列表</button></li>
    <li><button value="lookAtItLaterListLayout">稍后再看列表</button></li>
    <li><button value="outputInfoLayout">输出信息</button></li>
    <li><button value="otherLayout">其他</button></li>
    <li><button value="donateLayout">支持打赏作者</button></li>
    <li><button value="ruleCenterLayout">规则中心</button></li>
    <li><button value="accountCenterLayout">账户中心</button></li>
  </ul>
  <!-- 标签布局 -->
  <div class="tab" id="panelSetsTheLayout">
  <div style="display: flex;flex-wrap: wrap;justify-content: flex-start;">
      <div>
        <span>背景透明度</span>
        <input type="range" value="1" min="0.1" max="1" step="0.1" v-model="backgroundPellucidRange">
        <span>{{backgroundPellucidRange}}</span>
      </div>
      <div>
        <span>高度</span>
        <input type="range" value="100" min="20" max="100" step="0.1" v-model="heightRange">
        <span>{{heightRangeText}}</span>
      </div>
      <div>
        <span>宽度</span>
        <input type="range" value="100" min="20" max="100" step="0.1" v-model="widthRange">
        <span>{{widthRangeText}}</span>
      </div>
    </div>
    <h1>快捷悬浮面板</h1>
    <input type="checkbox" v-model="isDShieldPanel"><span title="快捷键3可隐藏该快捷悬浮屏蔽面板，快捷键4可切换此开关">禁用快捷悬浮屏蔽面板自动显示</span>
</div><!-- 面板设置布局 -->
  <div class="tab" id="ruleCRUDLayout"></div><!-- 规则增删改查布局 -->
  <div class="tab" id="homePageLayout"></div><!-- 首页布局 -->
  <div class="tab active" id="outputInfoLayout"></div><!-- 输出信息布局 -->
  <div class="tab" id="otherLayout"></div><!-- 其他布局 -->
  <div class="tab" id="liveLayout">
  点击用户名打开直播间,点击用户头像打开用户主页
  <div></div>
  <div>关注列表在中正在直播的用户-({{listOfFollowers.length}})个
  <button @click="loadFollowLst" v-if="isLoadFollowBut">加载列表</button>
  <button @click="hRecoveryListOfFollowersBut" v-if="hRecoveryListOfFollowersIf">恢复列表</button>
  </div>
  <div>
  搜索：<input type="text" v-model.trim="findFollowListRoomKey">
  搜索条件<select v-model="siftTypeSelect"><option v-for="item in siftTypeList" :value="item">{{item}}</option></select>
  </div>
  <hr>
   <div style="display: grid;grid-template-columns: auto auto auto auto auto; margin:0 12px">
        <live-room-item v-for="item in listOfFollowers"
        :title="item.title"
         :up-address="item.upAddress"
        :face="item.face"
        :up-name="item.upName"
        :room-id="joinRoomAddress(item.roomId)"
        ></live-room-item>
    </div>
    <hr>
    <div>其他分区直播列表{{otherLiveRoomList.length}}个</div>
    <select v-model="mainPartitionSelect"><option  v-for="(item,key) in partitionObjList" :value="key">{{key}}</option></select>
    <select v-model="sPartitionSelectID"><option v-for="item in sPartitionObjList" :value="item.id">{{item.name}}</option></select>
    <button @click="loadOtherPartitionLiveListBut">加载</button>
    <button @click="hRecoveryOtherLiveRoomListBut" v-if="hRecoveryOtherLiveListIf">恢复列表</button>
    <button @click="findThisSubPartitionBut">从{{mainPartitionSelect}}查询子分区</button>
    <button @click="findSubPartitionBut">查询子分区</button>
    <button @click="openPartitionWebAddressBut">打开页面</button>
    <div>
   <div>
  搜索：<input type="text" v-model.trim="findOtherListRoomKey">
  搜索条件<select v-model="siftOtherLiveTypeSelect"><option v-for="item in siftOtherLiveTypeList" :value="item">{{item}}</option></select>
  </div>
   <div style="display: grid;grid-template-columns: auto auto auto auto auto;margin: 0px 12px;justify-items: stretch;">
    <live-room-front-cover-item v-for="item in otherLiveRoomList"
        :title="item.title"
         :up-address="item.upAddress"
        :face="item.face"
        :up-name="item.upName"
        :room-id="joinRoomAddress(item.roomId)"
        :front-cover="item.frontCover"
        ></live-room-front-cover-item>
    </div>
    <div style="display: flex;justify-content:center" v-if="otherLoadMoreIf"><button @click="otherLoadMoreBut">加载更多</button></div>
</div>
  <!-- 直播列表布局 -->
</div>
  <div class="tab" id="watchedListLayout">
  <h3>已观看视频个数{{watchedList.length}}个</h3>
 <div v-for="item in watchedList">
 <p>{{item.upName}}</p>
</div>
</div><!-- 已观看列表布局 -->
  <div class="tab" id="lookAtItLaterListLayout">
  <h3>稍后再看项目共{{lookAtItLaterList.length}}个</h3>
  <button @click="renovateLayoutItemList">刷新列表</button>
  <button @click="clearLookAtItLaterArr">清空脚本稍后再看列表数据</button>
  <button @click="listInversion">列表反转</button>
  <button><a href="https://www.bilibili.com/watchlater/?spm_id_from=333.1007.0.0#/list" target="_blank">前往b站网页端的稍后再看页面</a></button>
  <button @click="getBWebLookAtItLaterListBut">获取b站账号的稍后再看列表(需SESSDATA)</button>
  <div>
<input type="checkbox" v-model="isAddToInput">{{isAddToInputTxt}}<select v-model="inputOutSelect"><option v-for="item in inputOutSelectArr" :value="item">{{item}}</option></select><button @click="okOutOrInputClick">执行</button>
</div>
  <textarea v-model.trim="inputEditContent" v-show="isInputSelect" placeholder="请输入导出时的格式json（本轮操作为追加数据操作）"style="width: 80%;height: 400px"></textarea>
  <div>
  搜索<input type="text" v-model.trim="searchKey">搜索条件<select v-model="typeListShowValue"><option v-for="item in typeList">{{item}}</option></select>
</div>
  <ol>
  <li style="border: 1px solid green" v-for="(item,index) in lookAtItLaterList">
  <div>Title：<a v-bind:href=splicingVideoAddress(item.bv) target="_blank">{{item.title}}</a></div>
  <div>UP：<a v-bind:href=splicingUserAddress(item.uid) target="_blank">{{item.upName}}</a></div>
    <button @click="delListItem(item)">删除该项</button>
    <button @click="setListItem(item,index,'upName','用户名',item.upName)">修改用户名</button>
    <button @click="setListItem(item,index,'uid','uid',item.uid)">修改uid</button>
    <button @click="setListItem(item,index,'title','标题',item.title)">修改标题</button>
    <button @click="setListItem(item,index,'bv','BV号',item.bv)">修改bv</button>
    <div>
</div>
</li>
</ol>
  <!-- 稍后再看列表布局 --></div>
  <div class="tab" id="video_params_layout"><!-- 视频参数布局 --></div>
  <div class="tab" id="donateLayout"><!-- 捐赠布局 --></div>
  <div class="tab" id="ruleCenterLayout">
<!-- 规则中心布局 -->
<button disabled><a href="https://www.bilibili.com/read/cv25025973" target="_blank">提示error解决方案</a></button>
<!-- 规则中心布局 -->
</div>
  <div class="tab" id="accountCenterLayout"><!-- 账户中心布局 --></div>
      </div>
<!-- 分割home_layout -->
    `);
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
    },
    htmlVue: {
        videoPlayVue() {
            return $(`<div style="position: fixed;left: 95%;top: 15%">
<div id="rightLayout" style="display: flex; flex-direction: column;">
<button @click="subItemShowBut">{{subItemButText}}</button>
<div v-show="subItemButShow">
<button @click="addUid">屏蔽(uid)</button>
<button @click="getTheVideoBarrage">获取视频弹幕</button>
<button @click="getTheVideoAVNumber">获取视频av号</button>
<button @click="getVideoCommentArea">获取评论区页面可见数据</button>
<button @click="getLeftTopVideoListBut">获取视频选集列表数据</button>
<button @click="addLefToWatchedBut">添加进已观看</button>
<button @click="addLefToLookAtItLaterListBut">添加进稍后再看</button>
<button @click="isHideButtonLayoutBut">{{hideButtonLayoutButText}}</button>
<button @click="isHideRightLayoutBut">{{hideRightLayoutButText}}</button>
<button @click="isHideTopVideoTitleInfoBut">{{hideTopVideoTitleInfoButText}}</button>
<button @click="VideoPIPicture">播放器画中画</button>
<button @click="openVideoSubtitle">字幕开关</button>
</div>


</div>
</div>`);
        }
    }
}