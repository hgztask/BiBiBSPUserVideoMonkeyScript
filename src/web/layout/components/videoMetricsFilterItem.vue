<script>
import cardSlider from "./cardSlider.vue";

/**
 * 视频指标过滤项
 */
export default {
  components: {cardSlider},
  props: {
    // 标题
    headerTitle: {type: String},
    //描述
    describe: {type: String},
    // 指标类型mk-key
    mkTypeRateKey: {type: String},
    // 指标状态mk-key
    mkRateStatusKey: {type: String}
  },
  data() {
    return {
      //是否启用屏蔽
      rateBlockingStatus: GM_getValue(this.mkRateStatusKey, false),
      //比率
      ratioRateVal: GM_getValue(this.mkTypeRateKey, 0.05),
    }
  },
  methods: {
    reteFormatTooltip(val) {
      return (val * 100).toFixed(0) + '%'
    }
  },
  watch: {
    ratioRateVal(n) {
      GM_setValue(this.mkTypeRateKey, n)
    },
    rateBlockingStatus(n) {
      GM_setValue(this.mkRateStatusKey, n)
    }
  }
}
</script>
<template>
  <div>
    <cardSlider v-model="ratioRateVal" :format-tooltip="reteFormatTooltip" :max="1" :min="0"
                :step="0.01" :switch-val.sync="rateBlockingStatus">
      <template #header>{{ headerTitle }}</template>
      <template #describe>{{ describe }}</template>
    </cardSlider>
  </div>
</template>
