<script setup lang="ts">
import {ref, watch} from 'vue';
import cardSlider from "./cardSlider.vue";

/**
 * 视频指标过滤项
 */
const props = defineProps<{
    // 标题
    headerTitle?: string;
    //描述
    describe?: string;
    // 指标类型mk-key
    mkTypeRateKey?: string;
    // 指标状态mk-key
    mkRateStatusKey?: string;
}>();

//是否启用屏蔽
const rateBlockingStatus = ref(GM_getValue(props.mkRateStatusKey as string, false));
//比率
const ratioRateVal = ref(GM_getValue(props.mkTypeRateKey as string, 0.05));

const reteFormatTooltip = (val: any) => {
    return (val * 100).toFixed(0) + '%';
};

watch(ratioRateVal, (n) => {
    GM_setValue(props.mkTypeRateKey as string, n);
});
watch(rateBlockingStatus, (n) => {
    GM_setValue(props.mkRateStatusKey as string, n);
});
</script>
<template>
  <div>
    <cardSlider v-model="ratioRateVal" :format-tooltip="reteFormatTooltip" :max="1" :min="0"
                :step="0.01" v-model:switch-val="rateBlockingStatus">
      <template #header>{{ headerTitle }}</template>
      <template #describe>{{ describe }}</template>
    </cardSlider>
  </div>
</template>
