<script>
/**
 * @description Slider卡片滑块组件
 * @version 1.0.0
 */
export default {
  props: {
    // 格式化tooltip函数
    formatTooltip: {
      type: Function
    },
    switchActiveText: {type: String, default: '启用'},
    step: {type: Number, default: 1},
    min: {type: Number, default: 0},
    max: {type: Number, default: 100},
    value: {type: Number, default: 0},
    switchVal: {type: Boolean, default: false},
    // 是否为范围选择
    range: {type: Boolean, default: false}
  },
  data() {
    return {
      local_switchVal: this.switchVal,
      disabled: !this.switchVal,
      sliderVal: this.value
    }
  },
  methods: {},
  watch: {
    //监听父组件v-model 的值变化，更新本地的sliderVal
    value(n) {
      this.sliderVal = n
    },
    // 监听本地的sliderVal的值变化，通知父组件更新v-model的值
    sliderVal(n) {
      this.$emit('input', n)
    },
    // 监听本地的disabled的值变化，发送事件通知父组件
    disabled(n) {
      this.$emit('slider-disabled-change', n)
    },
    // 监听本地的switchVal的值变化，通知父组件更新值
    switchVal(n) {
      this.local_switchVal = n
    },
    //本地local_switchVal值变化时，更新disabled的值，并更新父组件中的switchVal的值
    local_switchVal(n) {
      this.disabled = !n
      this.$emit('update:switchVal', n)
    }
  }
}
</script>

<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <slot name="header"></slot>
      </template>
      <slot name="describe"></slot>
      <div style="display: flex; align-items: center">
        <el-switch v-model="local_switchVal" :active-text="switchActiveText"/>
        <div style="flex: 1;margin-left: 15px">
          <el-slider v-model="sliderVal" :disabled="disabled" :format-tooltip="formatTooltip" :max="max" :min="min"
                     :range="range"
                     :step="step"
                     show-input></el-slider>
        </div>
      </div>
    </el-card>
  </div>
</template>
