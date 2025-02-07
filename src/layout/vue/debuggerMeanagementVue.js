import {valueCache} from "../../model/localCache/valueCache.js";
import bFetch from "../../model/bFetch.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import gmUtil from "../../utils/gmUtil.js";

/**
 * 禁用根据bv号网络请求获取视频信息
 * @returns {boolean}
 */
export const isDisableNetRequestsBvVideoInfo = () => {
    return gmUtil.getData('isDisableNetRequestsBvVideoInfo', false)
}

/**
 * 设置是否禁用根据bv号网络请求获取视频信息
 * @param b {boolean}
 */
const setDisableNetRequestsBvVideoInfo = (b) => {
    gmUtil.setData('isDisableNetRequestsBvVideoInfo', b)
}

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
      <ol>
        <li>仅供测试</li>
      </ol>
      <el-card shadow="never">
        <template #header><span>测试</span></template>
        <el-button @click="demoBut">测试网络请求</el-button>
        <el-button @click="demo1but">测试对话框</el-button>
        <el-button @click="printValueCacheBut">打印valueCache值</el-button>
        <el-button @click="printEventBut">打印事件中心值</el-button>
        <el-divider/>
        <el-switch v-model="isDisableNetRequestsBvVideoInfo" active-text="禁用根据bv号网络请求获取视频信息"/>
        <el-switch v-model="bAfterLoadingThePageOpenMainPanel" active-text="加载完页面打开主面板"/>
      </el-card>
      </div>`,
    data() {
        return {
            isDisableNetRequestsBvVideoInfo: isDisableNetRequestsBvVideoInfo(),
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
        }
    },
    watch: {
        isDisableNetRequestsBvVideoInfo(b) {
            setDisableNetRequestsBvVideoInfo(b)
        },
        bAfterLoadingThePageOpenMainPanel(b) {
            setBAfterLoadingThePageOpenMainPanel(b)
        }
    }
}
