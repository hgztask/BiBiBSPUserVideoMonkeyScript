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
        props: ["userName", "time", "ruleList"],
        template: `
            <li>
            <div>
                <div>
                    <span>作者：</span><span class="authorNameSpan">{{ userName }}</span>
                </div>
                <div>
                    <span>更新时间：</span><span class="updateTimeSpan">{{ formatTIme(time) }}</span>
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
                if (!confirm(`是要查询用户 ${this.userName} 的${keyName} 规则吗？`)) {
                    return;
                }
                Util.openWindowWriteContent(JSON.stringify(keyData, null, 3));
            },
            inputLocalRuleBut() {
                if (!confirm(`您确定要导入该用户 ${this.userName} 的规则并覆盖您当前本地已有的规则？`)) {
                    return;
                }
                ruleCRUDLlayoutVue().inputRuleLocalData(this.ruleList);
            },
            inputCloudRuleBut() {//导入覆盖云端规则
                alert("暂不支持导入覆盖云端规则！");
            },
            lookUserRuleBut() {
                if (!confirm(`您是要查看用户 ${this.userName} 的规则内容吗，需要注意的是，在某些浏览器中，由于安全原因，脚本不能使用 window.open() 创建新窗口。对于这些浏览器，如果您出现打不开的情况，用户必须将浏览器设置为允许弹出窗口才能打开新窗口`)) {
                    return;
                }
                Util.openWindowWriteContent(JSON.stringify(this.ruleList, null, 2));

            },
            formatTIme(time) {
                return Util.timestampToTime(time);
            }
        }
    }
);

//用于稍后再看和已观看列表item项组件
Vue.component("list-item", {
    template: `
        <li style="border: 1px solid green">
        <div>Title：<a v-bind:href=splicingVideoAddress(bv) target="_blank">{{ title }}</a></div>
        <div>UP：<a v-bind:href=splicingUserAddress(uid) target="_blank">{{ upName }}</a></div>
        <button @click="delItem">删除该项</button>
        <button @click="setItem('upName','用户名',upName)">修改用户名</button>
        <button @click="setItem('uid','uid',uid)">修改uid</button>
        <button @click="setItem('title','标题',title)">修改标题</button>
        <button @click="setItem('bv','BV号',bv)">修改bv</button>
        <div>
        </div>
        </li>`,
    props: ["objItem", "title", "upName", "bv", "uid",],
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
    }
});

//TODO 后续完善下面的def-list-layout，用于稍后再看和已观看列表的默认布局
Vue.component("def-list-layout", {
    template: `
        <div>
        <h3>{{ listLayoutName }}项目共{{ showList.length }}个</h3>
        <button @click="renovateLayoutItemList">刷新列表</button>
        <button @click="clearLookAtItLaterArr">清空脚本稍后再看列表数据</button>
        <button @click="listInversion">列表反转</button>
        <slot name="topRight"></slot>
        <!--        <button><a href="https://www.bilibili.com/watchlater/?spm_id_from=333.1007.0.0#/list" target="_blank">前往b站网页端的稍后再看页面</a>-->
        <!--        </button>-->
        <!--        <button @click="getBWebLookAtItLaterListBut">获取b站账号的稍后再看列表(需SESSDATA)</button>-->
        <div>
            <slot name="findLeft"></slot>
            <!--            <input type="checkbox" v-model="isAddToInput">{{ isAddToInputTxt }}-->
            <select v-model="tempModelSelect">
                <option v-for="item in modelSelectArr" :key="item" :value="item">{{ item }}</option>
            </select>
            <button @click="okBut">执行</button>
        </div>
        <textarea v-model.trim="inputEditContent" v-show="isInputSelect"
                  placeholder="请输入导出时的格式json（本轮操作为追加数据操作）"
                  style="width: 80%;height: 400px"></textarea>
        <div>
            搜索<input type="text" v-model.trim="searchKey">
            搜索条件<select v-model="tempFindListType">
            <option v-for="item in typeList" :key="item">{{ item }}</option>
        </select>
        </div>
        <ol>
            <slot name="buttonList" :showList="showList"></slot>
            <!--            <list-item v-for="(item,key) in showList"-->
            <!--                       :title="item.title"-->
            <!--                       :up-name="item.upName"-->
            <!--                       :uid="item.uid"-->
            <!--                       :bv="item.bv"-->
            <!--                       :obj-item="item"-->
            <!--                       v-on:del-item-click="delListItem"-->
            <!--                       v-on:set-item-click="setListItem"></list-item>-->
        </ol>

        </div>
    `,
    props: {
        list: null,
        listLayoutName: {
            default: "列表",

        },
        modelSelectArr: {},
        modelSelect: {},
        typeList: {},
        findListType: {}
    },
    data() {
        return {
            inputEditContent: "",
            isInputSelect: false,
            tempModelSelect: this.modelSelect,//模式下拉框model
            searchKey: "",
            tempFindListType: this.findListType,//监听搜索条件下拉框model
            showList: this.list
        }
    },
    methods: {
        renovateLayoutItemList() {//刷新
            this.showList = this.list;
        },
        clearLookAtItLaterArr() {//清空
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
        tempModelSelect(newVal) {
            this.$emit("model-select-event", newVal);
        },
        tempFindListType(newVal) {
            this.$emit("find-list-type-event", newVal);
        }
    },
    created() {
        // console.log("声明周期函数created()")
    }
});