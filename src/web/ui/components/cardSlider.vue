<script setup lang="ts">
import {ref, watch} from 'vue';

/**
 * @description Slider卡片滑块组件
 * @version 1.0.0
 */
const props = withDefaults(defineProps<{
    // 格式化tooltip函数
    formatTooltip?: (val: number) => string;
    switchActiveText?: string;
    step?: number;
    min?: number;
    max?: number;
    modelValue?: number;
    switchVal?: boolean;
    // 是否为范围选择
    range?: boolean;
}>(), {
    switchActiveText: '启用',
    step: 1,
    min: 0,
    max: 100,
    modelValue: 0,
    switchVal: false,
    range: false
});
const emit = defineEmits(['update:modelValue', 'update:switchVal', 'slider-disabled-change']);

const local_switchVal = ref(props.switchVal);
const disabled = ref(!props.switchVal);
const sliderVal = ref(props.modelValue);

//监听父组件v-model 的值变化，更新本地的sliderVal
watch(() => props.modelValue, (n) => {
    sliderVal.value = n;
});
// 监听本地的sliderVal的值变化，通知父组件更新v-model的值
watch(sliderVal, (n) => {
    emit('update:modelValue', n);
});
// 监听本地的disabled的值变化，发送事件通知父组件
watch(disabled, (n) => {
    emit('slider-disabled-change', n);
});
// 监听本地的switchVal的值变化，更新值
watch(() => props.switchVal, (n) => {
    local_switchVal.value = n;
});
//本地local_switchVal值变化时，更新disabled的值，并更新父组件中的switchVal的值
watch(local_switchVal, (n) => {
    disabled.value = !n;
    emit('update:switchVal', n);
});
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
