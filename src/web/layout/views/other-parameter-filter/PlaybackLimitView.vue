<script>
import {getMinimumPlayGm, isMaximumPlayGm, isMinimumPlayGm} from "../../../data/localMKData.js";
import gmUtil from "../../../utils/gmUtil.js";

export default {
  data() {
    return {
      minimumPlayV: getMinimumPlayGm(),
      maximumPlayV: getMinimumPlayGm(),
      isMinimumPlay: isMinimumPlayGm(),
      isMaximumPlay: isMaximumPlayGm()
    }
  },
  methods: {},
  watch: {
    isMinimumPlay(n) {
      gmUtil.setData("is_minimum_play_gm", n)
    },
    isMaximumPlay(n) {
      gmUtil.setData("is_maximum_play_gm", n)
    },
    minimumPlayV(n) {
      gmUtil.setData("minimum_play_gm", n)
    },
    maximumPlayV(n) {
      gmUtil.setData("maximum_play_gm", n)
    }
  }
}
</script>
<template>
  <el-card shadow="never">
    <template #header>播放量限制</template>
    <div>
      <el-switch v-model="isMinimumPlay" active-text="启用最小"/>
      <el-input-number v-model="minimumPlayV" :max="maximumPlayV-1" :min="0"/>
    </div>
    <div>
      <el-switch v-model="isMaximumPlay" active-text="启用最大"/>
      <el-input-number v-model="maximumPlayV" :min="minimumPlayV"/>
    </div>
  </el-card>
</template>