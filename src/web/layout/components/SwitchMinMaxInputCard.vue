<script>
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
      localIsMaxVal: GM_getValue(this.isMaxKey, false),
      localIsMinVal: GM_getValue(this.isMinKey, false),
      localMinInputVal: GM_getValue(this.minInputKey, this.minDefVal),
      localMaxInputVal: GM_getValue(this.maxInputKey, this.maxDefVal)
    }
  },
  watch: {
    localIsMaxVal(n) {
      GM_setValue(this.isMaxKey, n)
    },
    localIsMinVal(n) {
      GM_setValue(this.isMinKey, n)
    },
    localMinInputVal(n) {
      GM_setValue(this.minInputKey, n)
    },
    localMaxInputVal(n) {
      GM_setValue(this.maxInputKey, n)
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