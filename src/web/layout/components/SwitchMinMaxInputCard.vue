<script>
import gmUtil from "../../utils/gmUtil.js";

export default {
  props: {
    title: {
      type: String,
      default: '默认标题'
    },
    isMaxText: {default: '启用最大'},
    isMinText: {default: '启用最小'},
    minDefVal: {default: 0},
    maxDefVal: {default: 1},
    isMaxVal: {default: false},
    isMinVal: {default: false},
    minInputKey: {type: String, required: true},
    maxInputKey: {type: String, required: true},
    isMaxKey: {type: String, required: true},
    isMinKey: {type: String, required: true}
  },
  data() {
    return {
      localIsMaxVal: gmUtil.getData(this.isMaxKey, false),
      localIsMinVal: gmUtil.getData(this.isMinKey, false),
      localMinInputVal: gmUtil.getData(this.minInputKey, this.minDefVal),
      localMaxInputVal: gmUtil.getData(this.maxInputKey, this.maxDefVal)
    }
  },
  watch: {
    localIsMaxVal(n) {
      gmUtil.setData(this.isMaxKey, n)
    },
    localIsMinVal(n) {
      gmUtil.setData(this.isMinKey, n)
    },
    localMinInputVal(n) {
      gmUtil.setData(this.minInputKey, n)
    },
    localMaxInputVal(n) {
      gmUtil.setData(this.maxInputKey, n)
    }
  }
}
</script>

<template>
  <el-card shadow="never">
    <template #header>{{ title }}</template>
    <div>
      <el-switch v-model="localIsMinVal" :active-text="isMinText"/>
      <el-input-number v-model="localMinInputVal" :max="localMaxInputVal-1" :min="0"/>
    </div>
    <div>
      <el-switch v-model="localIsMaxVal" :active-text="isMaxText"/>
      <el-input-number v-model="localMaxInputVal" :min="localMinInputVal+1"/>
    </div>
  </el-card>
</template>