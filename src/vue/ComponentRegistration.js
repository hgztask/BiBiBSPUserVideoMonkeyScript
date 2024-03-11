//{"weight":1}
//拼接直播地址
Vue.filter("joinRoomAddress", (roomId) => {
    return `https://live.bilibili.com/${roomId}`;
})
//定义自定义组件
Vue.component("liveRoomItem", {//用于显示直播列表中默认的项目，无封面信息
    props: ["upAddress", "face", "roomId", "title", "upName"],
    template: `
      <div style="display: flex;flex-direction: row;height: 64px;align-items: center;border: 1px solid aqua">
      <div style="width: 48px;height: 48px;border-radius: 50%;overflow: hidden;margin-right:15px;">
        <a :href="upAddress" target="_blank">
          <img v-bind:src="face" style="width: 100%; height: 100%;object-fit: inherit">
        </a>
      </div>
      <div style="display: flex;flex-direction: column;justify-content: space-around;">
        <a :href="roomId|joinRoomAddress" target="_blank">
          <div :title="title" style="font-size: 17px;font-weight: bold">{{ title }}</div>
        </a>
        <a>
          <div :title="upName">{{ upName }}</div>
        </a>
      </div>
      </div>`
})
Vue.component("liveRoomFrontCoverItem", {
    props: ["upAddress", "face", "roomId", "title", "upName", "videoFrameImg", "frontCoverImg"],
    template: `
      <div style="border: 1px solid aqua;display: flex;align-items: center;flex-direction: column;">
      <div style="height: 144px;width: 256px;"><img :src="videoCover" alt="" style="height: 100%"
                                                    @mouseover="setVideoFrameImg" @mouseleave="setFrontCoverImg">
      </div>
      <div style="display: flex;flex-direction: row;height: 64px;align-items: center;">
        <div style="width: 48px;height: 48px;border-radius: 50%;overflow: hidden;margin-right:15px;">
          <a :href="upAddress" target="_blank">
            <img v-bind:src="face" style="width: 100%; height: 100%;object-fit: inherit">
          </a>
        </div>
        <div style="display: flex;flex-direction: column;justify-content: space-around;">
          <a :href="roomId|joinRoomAddress" target="_blank">
            <div :title="title" style="font-size: 17px;font-weight: bold">{{ title }}</div>
          </a>
          <a>
            <div :title="upName">{{ upName }}</div>
          </a>
        </div>
      </div>
      </div>`,
    data() {
        return {
            videoCover: this.frontCoverImg
        };
    },
    methods: {
        setVideoFrameImg() {
            this.videoCover = this.videoFrameImg;
        },
        setFrontCoverImg() {
            this.videoCover = this.frontCoverImg;
        }
    }
});
//规则中心的项目item
Vue.component("ruleCenterItem", {
        props: ["userName", "update_time", "ruleList", "first_push_time"],
        template: `
          <li>
          <div>
            <div>
              <span>作者：</span><span class="authorNameSpan">{{ userName }}</span>
            </div>
            <div>
              <span>更新时间：</span><span>{{ formatTIme(update_time) }}</span>
            </div>
            <div>
              <span>创建时间：</span><span>{{ formatTIme(first_push_time) }}</span>
            </div>
          </div>
          <div style="column-count: 4">
            <div v-for="(item,key) in ruleList">
              {{ key }}<span style="color: rgb(217, 217, 37)">{{ item.length }}</span>个
              <button @click="lookKeyRuleBut(item,key)">查询</button>
            </div>
          </div>
          <div>
            <button @click="inputLocalRuleBut">导入覆盖本地规则</button>
            <button @click="inputCloudRuleBut">导入覆盖云端规则</button>
            <button @click="lookUserRuleBut">查看该用户的规则</button>
          </div>
          </li>`,
        methods: {
            lookKeyRuleBut(keyData, keyName) {
                if (!confirm(`是要查询用户 ${this.userName} 的${keyName} 规则吗？`)) return;
                Util.openWindowWriteContent(JSON.stringify(keyData, null, 3));
            },
            inputLocalRuleBut() {
                if (!confirm(`您确定要导入该用户 ${this.userName} 的规则并覆盖您当前本地已有的规则？`)) return;
                window.RuleCRUDLayoutVue.inputRuleLocalData(this.ruleList);
            },
            inputCloudRuleBut() {//导入覆盖云端规则
                alert("暂不支持导入覆盖云端规则！");
            },
            lookUserRuleBut() {
                if (!confirm(`您是要查看用户 ${this.userName} 的规则内容吗，需要注意的是，在某些浏览器中，由于安全原因，脚本不能使用 window.open() 创建新窗口。对于这些浏览器，如果您出现打不开的情况，用户必须将浏览器设置为允许弹出窗口才能打开新窗口`)) return;
                Util.openWindowWriteContent(JSON.stringify(this.ruleList, null, 2));
            },
            formatTIme(time) {
                return Util.timestampToTime(time);
            }
        }
    }
);
//用于稍后再看item项组件
Vue.component("list-item", {
    template: `
      <li style="border: 1px solid green">
      <div style="display: flex">
        <div style="height: 144px; width: 256px;">
          <img :src="front_cover|setFrontCover" alt="显示失败" style="height: 100%;">
        </div>
        <div>
          <div>Title：<a v-bind:href=splicingVideoAddress(bv) target="_blank">{{ title }}</a></div>
          <div>UP：<a v-bind:href=splicingUserAddress(uid) target="_blank">{{ upName }}</a></div>
          <button @click="delItem">删除该项</button>
          <button @click="setItem('upName','用户名',upName)">修改用户名</button>
          <button @click="setItem('uid','uid',uid)">修改uid</button>
          <button @click="setItem('title','标题',title)">修改标题</button>
          <button @click="setItem('bv','BV号',bv)">修改bv</button>
        </div>
      </div>
      </li>`,
    props: ["objItem", "title", "upName", "bv", "uid", "front_cover"],
    methods: {
        delItem() {
            this.$emit("del-item-click", this.objItem);
        },
        setItem(key, name, value) {
            this.$emit("set-item-click", this.objItem, key, name, value);
        },
        splicingVideoAddress(s) {//拼接视频地址
            return "https://www.bilibili.com/video/" + s;
        },
        splicingUserAddress(str) {//拼接用户地址
            return "https://space.bilibili.com/" + str;
        },
    },
    filters: {
        setFrontCover(img) {
            const defImg = "http://i2.hdslb.com/bfs/archive/43276436b25529ae0e2c6e3dc896ec8a66ef4d60.jpg";
            if (img === null || img === undefined) return defImg;
            return img;
        }
    }
});
//TODO 后续完善下面的def-list-layout，用于稍后再看的默认布局
Vue.component("def-list-layout", {
    template: `
      <div>
      <h3>{{ listLayoutName }}项目共{{ showList.length }}个</h3>
      <button @click="renovateList">刷新列表</button>
      <button @click="clearShowListBut">清空列表数据(不删除实际数据)</button>
      <button @click="clearListBut">清空列表数据(影响实际数据)</button>
      <button @click="listInversion">列表反转</button>
      <slot name="top-right"></slot>
      <slot name="center"></slot>
      <div>
        搜索<input type="text" v-model.trim="tempSearchKey">
        搜索条件<select v-model="tempFindListType">
        <option v-for="item in typeList" :key="item">{{ item }}</option>
      </select>
      </div>
      <ol>
        <slot name="button-list" :showList="showList"></slot>
      </ol>
      </div>
    `,
    props: {
        list: {
            default: []
        },
        listLayoutName: {
            default: "列表",
        },
        typeList: {},
        findListType: {}
    },
    data() {
        return {
            tempSearchKey: "",
            tempFindListType: this.findListType,//监听搜索条件下拉框model
            showList: this.list
        }
    },
    methods: {
        renovateList() {//刷新
            this.$emit("renovate-list-event");
        },
        clearShowListBut() {
            this.showList = [];
        },
        clearListBut() {//清空列表
            this.$emit("clear-but");
        },
        listInversion() {//列表反转
            this.showList.reverse();
        },
        okBut() {
            this.$emit("okBut");
        }
    },
    watch: {
        tempSearchKey(newVal, oldVal) {
            this.$emit("search-key-event", newVal, oldVal);
        }
    },
    created() {
        this.$emit("set-sub-this", this);
    }
});

Vue.component("footer_layout", {
    template: `
      <div>
      <div>关于我们</div>
      作者相关群聊：
      <div v-for="item in group" :key="item.name">
        {{ item.name }}<a :href="item.url" target="_blank"><img :alt="item.name"
                                                                :title="item.name"
                                                                src="//pub.idqqimg.com/wpa/images/group.png"></a>
      </div>
      <div>
        作者其他作品：
        <div v-for="v in works" :key="v.label">
          <button><a :href="v.url" target="_blank">{{ v.label }}</a></button>
          开源地址：<a :href="v.openSourceUrl" target="_blank">{{ v.openSourceLabel }}</a>
        </div>
        <div> 作者b站：
          <button><a href="https://space.bilibili.com/473239155">传送门地址</a></button>
        </div>
      </div>
      </div>`,
    data() {
        return {
            group: [
                {
                    name: "桐子酱的油猴脚本官方群",
                    url: "//qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=zD3QMvs1ssNugrHekhe16Y1p6ofNtFaA&authKey=FpgEzNW82mhUYUa74jcb8Y2dVkSd4Qh%2FgxflxdUBJ9VohHQlM26PxZ0Fl6E6qfnq&noverify=0&group_code=876295632"
                },
            ],
            works: [
                {
                    label: "b站屏蔽增强器油猴脚本",
                    url: "https://greasyfork.org/zh-CN/scripts/461382",
                    openSourceUrl: "https://gitee.com/hangexi/BiBiBSPUserVideoMonkeyScript",
                    openSourceLabel: "gitee"
                },
                {
                    label: "b站频道生成器",
                    url: "https://greasyfork.org/zh-CN/scripts/481719",
                    openSourceUrl: "https://gitee.com/hangexi/bilibili-channel-viewer",
                    openSourceLabel: "gitee"
                },
                {
                    label: "github链接新标签打开",
                    url: "https://greasyfork.org/zh-CN/scripts/489538",
                    openSourceUrl: "https://gitee.com/hangexi/github_new_tab_open",
                    openSourceLabel: "gitee"
                },
                {
                    label: "b站动态设置",
                    url: "https://greasyfork.org/zh-CN/scripts/489577",
                    openSourceUrl: "https://gitee.com/hangexi/bilibili_dynamic_set_js",
                    openSourceLabel: "gitee"
                }
            ]
        }
    }
})
