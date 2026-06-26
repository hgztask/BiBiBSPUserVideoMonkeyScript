<script lang="ts">
import {defineComponent} from 'vue';
import PageProcessingView from "./pageProcessingView.vue";
import LivePartitionPageProcessingTabVIew from "./LivePartitionPageProcessingTabVIew.vue";
import dynamicCard from "./dynamicCard.vue";
import PlayPageProcessingTab from "./PlayPageProcessingTab.vue";
import HomePageProcessingTab from "./HomePageProcessingTab.vue";
import TopColumnProcessingTab from "./TopColumnProcessingTab.vue";

export default defineComponent({
  components: {
    TopColumnProcessingTab,
    HomePageProcessingTab,
    PlayPageProcessingTab, LivePartitionPageProcessingTabVIew, PageProcessingView, dynamicCard
  },
  data() {
    return {}
  }
})
</script>

<template>
  <el-tabs tab-position="left">
    <el-tab-pane label="默认设置" lazy>
      <pageProcessingView/>
    </el-tab-pane>
    <el-tab-pane label="首页" lazy>
      <HomePageProcessingTab/>
    </el-tab-pane>
    <el-tab-pane label="直播分区" lazy>
      <LivePartitionPageProcessingTabVIew/>
    </el-tab-pane>
    <el-tab-pane label="播放页" lazy>
      <PlayPageProcessingTab/>
    </el-tab-pane>
    <el-tab-pane label="动态" lazy>
      <dynamicCard/>
    </el-tab-pane>
    <el-tab-pane label="顶栏" lazy>
      <TopColumnProcessingTab/>
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped>

</style>