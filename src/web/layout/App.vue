<script>
import cacheManagementView from "./views/cacheManagementView.vue";
import panelSettingsView from "./views/panelSettingsView.vue";
import compatibleSettingView from "./views/compatibleSettingView.vue";
import lookContentDialog from "./eventEmitter_components/lookContentDialog.vue";
import {bAfterLoadingThePageOpenMainPanel} from "../model/debuggerMeanagement.js";
import debuggerManagementView from './views/debuggerManagementView.vue';
import pageProcessingView from "./views/pageProcessingView.vue";
import aboutAndFeedbackView from "./views/aboutAndFeedbackView.vue";
import showImgDialog from "./eventEmitter_components/showImgDialog.vue";
import sheetDialog from "./components/sheetDialog.vue";
import bulletWordManagementView from "./views/bulletWordManagementView.vue";
import {eventEmitter} from "../model/EventEmitter.js";
import {requestIntervalQueue} from "../model/asynchronousIntervalQueue.js";
import gmUtil from "../utils/gmUtil.js";
import {isOpenDev} from "../data/localMKData.js";
import outputInformationView from './views/outputInformationView.vue'
import donateLayoutView from './views/donateLayoutView.vue'
import ruleManagementView from './views/ruleManagementView.vue'
import excludeURLsView from './views/excludeURLsView.vue'
import RightFloatingLayoutView from "./views/rightFloatingLayoutView.vue";


/**
 * todo 目前发现加载在视频页时，el-drawer的遮罩会挡住整个屏幕，先设置modal为false，关闭遮罩，待后续观察
 * Drawer 的内容是懒渲染的，即在第一次被打开之前，传入的默认 slot 不会被渲染到 DOM 上。
 */
export default {
  components: {
    RightFloatingLayoutView,
    outputInformationView,
    donateLayoutView,
    ruleManagementView,
    cacheManagementView,
    panelSettingsView,
    compatibleSettingView,
    lookContentDialog,
    debuggerManagementView,
    pageProcessingView,
    aboutAndFeedbackView,
    showImgDialog,
    sheetDialog,
    bulletWordManagementView,
    excludeURLsView
  },
  data() {
    return {
      drawer: false,
      // 默认打开的tab
      tabsActiveName: gmUtil.getData('mainTabsActiveName', '规则管理'),
      debug_panel_show: isOpenDev(),
      sheet_dialog: {
        show: false,
        list: [],
        title: "",
        /**
         * @type function
         * @returns boolean
         */
        optionsClick: null,
        closeOnClickModal: true
      }
    }
  },
  methods: {
    tabClick(tab) {
      gmUtil.setData('mainTabsActiveName', tab.name);
    },
    handleClose() {
      this.sheet_dialog.show = false
    },
    handleOptionsClick(item) {
      let tempBool;
      //如果回调函数返回true，则不关闭对话框，反之关闭对话框
      const temp = this.sheet_dialog.optionsClick(item);
      if (temp === undefined) {
        tempBool = false
      } else {
        tempBool = temp;
      }
      this.sheet_dialog.show = tempBool === true;
    }
  },
  created() {
    eventEmitter.on('主面板开关', () => {
      const tempBool = this.drawer;
      this.drawer = !tempBool;
    })

    eventEmitter.on('el-notify', (options) => {
      this.$notify(options)
    })
    eventEmitter.on('el-msg', (...options) => {
      this.$message(...options)
    })

    eventEmitter.on('el-alert', (...options) => {
      this.$alert(...options);
    })

    eventEmitter.handler('el-confirm', (...options) => {
      return this.$confirm(...options);
    })

    eventEmitter.on('debugger-dev-show', (bool) => {
      debugger
      this.debug_panel_show = bool
      if (bool) {
        this.$alert('已开启测试调试面板', 'tip')
      } else {
        this.$alert('已关闭测试调试面板', 'tip')
      }
    })

    eventEmitter.on('sheet-dialog', ({list, optionsClick, title = '选项', closeOnClickModal = false}) => {
      this.sheet_dialog.show = true
      this.sheet_dialog.list = list
      this.sheet_dialog.title = title
      this.sheet_dialog.optionsClick = optionsClick
      this.sheet_dialog.closeOnClickModal = closeOnClickModal
    })

    eventEmitter.handler('el-prompt', (...options) => {
      return this.$prompt(...options)
    })

    eventEmitter.on('请求获取视频信息失败', (response, bvId) => {
      requestIntervalQueue.clearPendingQueue()
      eventEmitter.send('更新根据bv号网络请求获取视频信息状态', true)
      this.$alert(`请求获取视频信息失败，状态码：${response.status}，bv号：${bvId}
                \n。已自动禁用根据bv号网络请求获取视频信息状态
                \n如需关闭，请在面板条件限制里手动关闭。`, '错误', {
        confirmButtonText: '确定',
        type: 'error'
      })
    })

    if (bAfterLoadingThePageOpenMainPanel()) {
      this.drawer = true
    }
  }
}
</script>

<template>
  <div>
    <el-drawer :modal="false"
               :visible.sync="drawer"
               :with-header="false"
               direction="ltr"
               size="100%"
               style="position: fixed">
      <el-tabs v-model="tabsActiveName" type="border-card"
               @tab-click="tabClick">
        <el-tab-pane label="面板设置" lazy name="面板设置">
          <panelSettingsView/>
        </el-tab-pane>
        <el-tab-pane label="规则管理" lazy name="规则管理">
          <ruleManagementView/>
        </el-tab-pane>
        <el-tab-pane label="排除页面" lazy name="排除页面">
          <excludeURLsView/>
        </el-tab-pane>
        <el-tab-pane label="兼容设置" lazy name="兼容设置">
          <compatibleSettingView/>
        </el-tab-pane>
        <el-tab-pane label="缓存管理" lazy name="缓存管理">
          <cacheManagementView/>
        </el-tab-pane>
        <el-tab-pane label="页面处理" lazy name="页面处理">
          <pageProcessingView/>
        </el-tab-pane>
        <el-tab-pane v-if="debug_panel_show" label="弹幕词管理" lazy name="弹幕词管理">
          <bulletWordManagementView/>
        </el-tab-pane>
        <el-tab-pane label="输出信息" name="输出信息">
          <outputInformationView/>
        </el-tab-pane>
        <el-tab-pane label="支持打赏" lazy name="支持打赏">
          <donateLayoutView/>
        </el-tab-pane>
        <el-tab-pane label="关于和问题反馈" lazy name="关于和问题反馈">
          <aboutAndFeedbackView/>
        </el-tab-pane>
        <el-tab-pane v-if="debug_panel_show" label="调试测试" lazy name="调试测试">
          <div v-show="debug_panel_show">
            <debuggerManagementView/>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
    <lookContentDialog/>
    <showImgDialog/>
    <sheetDialog :close-on-click-modal="sheet_dialog.closeOnClickModal" :list="sheet_dialog.list"
                 :show="sheet_dialog.show"
                 :title="sheet_dialog.title"
                 @close="handleClose"
                 @options-click="handleOptionsClick"/>
    <RightFloatingLayoutView/>
  </div>
</template>

<style>

</style>
