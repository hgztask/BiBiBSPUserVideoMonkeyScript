<script>
import PageProcessingView from "./pageProcessingView.vue";
import LivePartitionPageProcessingTabVIew from "./LivePartitionPageProcessingTabVIew.vue";

export default {
  components: {LivePartitionPageProcessingTabVIew, PageProcessingView},
  data() {
    return {}
  }
}
</script>

<template>
  <el-tabs tab-position="left">
    <el-tab-pane label="默认设置" lazy>
      <pageProcessingView/>
    </el-tab-pane>
    <el-tab-pane label="直播分区" lazy>
      <LivePartitionPageProcessingTabVIew/>
    </el-tab-pane>
  </el-tabs>
</template>

<style scoped>

</style>