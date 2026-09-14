<script setup lang="ts">
import {ref, watch} from 'vue';
import {eventEmitter} from "../../../core/EventEmitter.ts";
import {valueCache} from "../../../core/cache/valueCache.ts";
import debuggerManagement from "../../../domain/debuggerManagement.ts";
import bFetch from "../../../core/http/bFetch.ts";
import {isLocalhostPageAutomaticallyOpenTheMainPanelGm} from "../../../state/localMKData.ts";
import bvRequestQueue from "../../../core/http/bvRequestQueue.ts";
import {ElMessageBox} from 'element-plus';

//调试管理
// 是否加载完页面打开主面板
const bAfterLoadingThePageOpenMainPanel = ref(debuggerManagement.bAfterLoadingThePageOpenMainPanel());
const isWsServiceVal = ref(debuggerManagement.isWsService());
const localhostPageAutomaticallyOpenTheMainPanelVal = ref(isLocalhostPageAutomaticallyOpenTheMainPanelGm());

const printValueCacheBut = () => {
  console.log(valueCache.getAll());
};
const demoBut = () => {

};
const fetchGetVideoInfoBut = () => {
  ElMessageBox.prompt('请输入视频bv号', {
    title: '请输入视频bv号',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^BV[A-Za-z0-9]{10}$/,
    inputErrorMessage: '请输入正确的视频bv号'
  }).then(({value}: any) => {
    bFetch.fetchGetVideoInfo(value).then(data => {
      console.log(data);
      debugger;
    });
  });
};
const printEventBut = () => {
  console.log(eventEmitter.getEvents());
};
const printReqIntervalQueueVal = () => {
  console.log(bvRequestQueue.videoInfoRequestQueue);
  console.log(bvRequestQueue.fetchGetVideoReplyBoxDescRequestQueue);
};

watch(bAfterLoadingThePageOpenMainPanel, (b) => {
  GM_setValue('bAfterLoadingThePageOpenMainPanel', b);
});
watch(isWsServiceVal, (b) => {
  GM_setValue('isWsService', b);
  eventEmitter.emit('event:ws-status', b);
});
watch(localhostPageAutomaticallyOpenTheMainPanelVal, (b) => {
  GM_setValue('is_localhost_page_automatically_open_the_main_panel_gm', b);
});
</script>

<template>
  <div>
    <el-tabs tab-position="left">
      <el-tab-pane label="基础">
        <el-card shadow="never">
          <template #header><span>测试</span></template>
          <el-button @click="demoBut">测试网络请求</el-button>
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
