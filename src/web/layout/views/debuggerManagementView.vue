<script>
import gmUtil from "../../utils/gmUtil.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import {valueCache} from "../../model/localCache/valueCache.js";
import {bAfterLoadingThePageOpenMainPanel, isWsService} from "../../model/debuggerMeanagement.js";
import bFetch from "../../model/bFetch.js";
import {isLocalhostPageAutomaticallyOpenTheMainPanelGm} from "../../data/localMKData.js";
import bvRequestQueue from "../../model/queue/bvRequestQueue.js";

//调试管理
export default {
  data() {
    return {
      // 是否加载完页面打开主面板
      bAfterLoadingThePageOpenMainPanel: bAfterLoadingThePageOpenMainPanel(),
      isWsServiceVal: isWsService(),
      localhostPageAutomaticallyOpenTheMainPanelVal:isLocalhostPageAutomaticallyOpenTheMainPanelGm()
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
      console.log(bvRequestQueue.videoInfoRequestQueue)
      console.log(bvRequestQueue.fetchGetVideoReplyBoxDescRequestQueue)
    }
  },
  watch: {
    bAfterLoadingThePageOpenMainPanel(b) {
      gmUtil.setData('bAfterLoadingThePageOpenMainPanel', b)
    },
    isWsServiceVal(b) {
      gmUtil.setData('isWsService', b)
    },
    localhostPageAutomaticallyOpenTheMainPanelVal(b){
      gmUtil.setData('is_localhost_page_automatically_open_the_main_panel_gm', b)
    }
  }
}
</script>

<template>
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
          <el-switch v-model="localhostPageAutomaticallyOpenTheMainPanelVal" active-text="localhost页面自动打开主面板"/>
          <el-switch v-model="isWsServiceVal" active-text="开启ws服务"/>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
