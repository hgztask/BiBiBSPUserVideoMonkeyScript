<script setup lang="ts">
import {ref, watch} from 'vue';

const props = withDefaults(defineProps<{
    title?: string;
    isMaxText?: string;
    isMinText?: string;
    minDefVal?: number;
    maxDefVal?: number;
    isMaxVal?: boolean;
    isMinVal?: boolean;
    minInputKey: string;
    maxInputKey: string;
    isMaxKey: string;
    isMinKey: string;
}>(), {
    title: '默认标题',
    isMaxText: '启用最大',
    isMinText: '启用最小',
    minDefVal: 0,
    maxDefVal: 1,
    isMaxVal: false,
    isMinVal: false
});

const localIsMaxVal = ref(GM_getValue(props.isMaxKey, false));
const localIsMinVal = ref(GM_getValue(props.isMinKey, false));
const localMinInputVal = ref(GM_getValue(props.minInputKey, props.minDefVal));
const localMaxInputVal = ref(GM_getValue(props.maxInputKey, props.maxDefVal));

watch(localIsMaxVal, (n) => {
    GM_setValue(props.isMaxKey, n);
});
watch(localIsMinVal, (n) => {
    GM_setValue(props.isMinKey, n);
});
watch(localMinInputVal, (n) => {
    GM_setValue(props.minInputKey, n);
});
watch(localMaxInputVal, (n) => {
    GM_setValue(props.maxInputKey, n);
});
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
