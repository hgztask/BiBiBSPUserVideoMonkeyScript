import {valueCache} from "../../model/localCache/valueCache.js";
import bFetch from "../../model/bFetch.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import gmUtil from "../../utils/gmUtil.js";
import {requestIntervalQueue} from "../../model/asynchronousIntervalQueue.js";

/**
 * 是否加载完页面打开主面板
 * @returns {boolean}
 */
export const bAfterLoadingThePageOpenMainPanel = () => {
    return gmUtil.getData('bAfterLoadingThePageOpenMainPanel', false)
}

/**
 * 设置是否加载完页面打开主面板
 * @param b {boolean}
 */
const setBAfterLoadingThePageOpenMainPanel = (b) => {
    gmUtil.setData('bAfterLoadingThePageOpenMainPanel', b === true)
}

// 是否开启ws服务
export const isWsService = () => {
    return gmUtil.getData('isWsService', false)
}

//调试管理
export const debugger_management_vue = {
    template: `
      <div>
        <el-tabs tab-position="left">
          <el-tab-pane label="基础">
            <el-card shadow="never">
              <template #header><span>测试</span></template>
              <el-button @click="demoBut">测试网络请求</el-button>
              <el-button @click="sendWsMsgBut">向ws发送消息</el-button>
              <el-button @click="fetchGetVideoInfoBut">请求获取视频信息</el-button>
              <el-button @click="printValueCacheBut">打印valueCache值</el-button>
              <el-button @click="printEventBut">打印事件中心值</el-button>
              <el-button @click="printReqIntervalQueueVal">打印requestIntervalQueue值</el-button>
              <el-divider/>
              <el-switch v-model="bAfterLoadingThePageOpenMainPanel" active-text="加载完页面打开主面板"/>
              <el-switch v-model="isWsServiceVal" active-text="开启ws服务"/>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </div>`,
    data() {
        return {
            // 是否加载完页面打开主面板
            bAfterLoadingThePageOpenMainPanel: bAfterLoadingThePageOpenMainPanel(),
            isWsServiceVal: isWsService()
        }
    },
    methods: {
        sendWsMsgBut() {
            this.$prompt('请输入ws消息', {
                title: '请输入ws消息',
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(({value}) => {
                eventEmitter.send('ws-send', value)
            })
        },
        printValueCacheBut() {
            console.log(valueCache.getAll());
        },
        demoBut() {
            bFetch.fetchGetVideoInfo('BV152cWeXEhW').then(data => {
                console.log(data);
                debugger
            })
        },
        fetchGetVideoInfoBut() {
            this.$prompt('请输入视频bv号', {
                title: '请输入视频bv号',
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                inputPattern: /^BV[A-Za-z0-9]{10}$/,
                inputErrorMessage: '请输入正确的视频bv号'
            }).then(({value}) => {
                bFetch.fetchGetVideoInfo(value).then(data => {
                    console.log(data);
                    debugger
                })
            })
        },
        printEventBut() {
            console.log(eventEmitter.getEvents())
        },
        printReqIntervalQueueVal() {
            console.log(requestIntervalQueue)
        }
    },
    watch: {
        bAfterLoadingThePageOpenMainPanel(b) {
            setBAfterLoadingThePageOpenMainPanel(b)
        },
        isWsServiceVal(b) {
            gmUtil.setData('isWsService', b)
        }
    }
}
