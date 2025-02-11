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


//调试管理
export const debugger_management_vue = {
    template: `
      <div>
        <el-card shadow="never">
          <template #header><span>测试</span></template>
          <el-button @click="demoBut">测试网络请求</el-button>
          <el-button @click="demo1but">测试对话框</el-button>
          <el-button @click="printValueCacheBut">打印valueCache值</el-button>
          <el-button @click="printEventBut">打印事件中心值</el-button>
          <el-button @click="printReqIntervalQueueVal">打印requestIntervalQueue值</el-button>
          <el-divider/>
          
          <el-switch v-model="bAfterLoadingThePageOpenMainPanel" active-text="加载完页面打开主面板"/>
        </el-card>
      </div>`,
    data() {
        return {
            // 是否加载完页面打开主面板
            bAfterLoadingThePageOpenMainPanel: bAfterLoadingThePageOpenMainPanel()
        }
    },
    methods: {
        printValueCacheBut() {
            console.log(valueCache.getAll());
        },
        demoBut() {
            bFetch.fetchGetVideoInfo('BV152cWeXEhW').then(data => {
                console.log(data);
                debugger
            })
        },
        demo1but() {
            this.$alert('这是一段内容', '标题名称', {
                confirmButtonText: '确定',
                callback: action => {
                    this.$message({
                        type: 'info',
                        message: `action: ${action}`
                    });
                }
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
        }
    }
}
