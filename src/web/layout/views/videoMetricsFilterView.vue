<script>
import {getLimitationFanSumGm, isFansNumBlockingStatusGm} from "../../data/localMKData.js";
import video_metrics_filter_item_view from '../components/videoMetricsFilterItem.vue'
import CardSlider from "../components/cardSlider.vue";

/**
 * 视频指标过滤页面
 */
export default {
  components: {video_metrics_filter_item_view, card_slider: CardSlider},
  data() {
    return {
      metricsFilterList: [
        {
          headerTitle: '视频点赞率屏蔽',
          describe: '限制的点赞率，默认为2%，小于或等于值限时制的屏蔽该视频，公式【点赞率=点赞数/播放量*100】',
          mkRateStatusKey: 'video_like_rate_blocking_status',
          mkTypeRateKey: 'video_like_rate'
        },
        {
          headerTitle: '视频互动率屏蔽',
          describe: '限制的占比率，默认为2%，小于或等于值限时制的屏蔽该视频，公式【(弹幕数+评论数)/播放数*100】',
          mkRateStatusKey: 'interactive_rate_blocking_status',
          mkTypeRateKey: 'interactive_rate'
        },
        {
          headerTitle: '视频三连率屏蔽',
          describe: '限制的占比率，默认为2%，小于或等于值限时制的屏蔽该视频，公式【(收藏数+投币数+分享数)/播放数*100】',
          mkRateStatusKey: 'triple_rate_blocking_status',
          mkTypeRateKey: 'triple_rate'
        },
        {
          headerTitle: '视频投币/点赞比（内容价值）屏蔽',
          describe: '限制的占比率，默认为2%，小于或等于值限时制的屏蔽该视频，投币成本较高，比值越高内容越优质。公式【投币数 / 获赞数】',
          mkRateStatusKey: 'coin_likes_ratio_rate_blocking_status',
          mkTypeRateKey: 'coin_likes_ratio_rate'
        }
      ],
      limitationFanSumVal: getLimitationFanSumGm(),
      fansNumBlockingStatus: isFansNumBlockingStatusGm()
    }
  },
  watch: {
    limitationFanSumVal(n) {
      GM_setValue('limitation_fan_sum_gm', parseInt(n))
    },
    fansNumBlockingStatus(n) {
      GM_setValue('is_fans_num_blocking_status_gm', n)
    }
  }
}
</script>

<template>
  <div>
    <el-card>
      <template #header>指标屏蔽(改动实时生效)</template>
      <video_metrics_filter_item_view v-for="item in metricsFilterList" :key="item.headerTitle"
                                      :describe="item.describe"
                                      :header-title="item.headerTitle"
                                      :mk-rate-status-key="item.mkRateStatusKey"
                                      :mk-type-rate-key="item.mkTypeRateKey"
      />
      <card_slider v-model="limitationFanSumVal" :max="90000"
                   :switch-val.sync="fansNumBlockingStatus">
        <template #header>粉丝数屏蔽</template>
        <template #describe>限制的粉丝数，小于或等于值限时制的屏蔽该视频，限制上限9万</template>
      </card_slider>
    </el-card>
  </div>
</template>
