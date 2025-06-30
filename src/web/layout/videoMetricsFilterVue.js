import gmUtil from "../utils/gmUtil.js";
import {card_slider_vue} from "./components/card_slider_vue.js";
import {getLimitationFanSumGm, isFansNumBlockingStatusGm} from "../data/localMKData.js";

/**
 * 视频指标过滤项
 */
const video_metrics_filter_item_vue = {
    components: {card_slider_vue},
    props: {
        // 标题
        headerTitle: {type: String},
        //描述
        describe: {type: String},
        // 指标类型mk-key
        mkTypeRateKey: {type: String},
        // 指标状态mk-key
        mkRateStatusKey: {type: String},
    },
    template: `
      <div>
        <card_slider_vue v-model="ratioRateVal" :step="0.01" :min="0" :max="1"
                         :switch-val.sync="rateBlockingStatus" :format-tooltip="reteFormatTooltip">
          <template #header>{{ headerTitle }}</template>
          <template #describe>{{ describe }}</template>
        </card_slider_vue>
      </div>`,
    data() {
        return {
            //是否启用屏蔽
            rateBlockingStatus: gmUtil.getData(this.mkRateStatusKey, false),
            //比率
            ratioRateVal: gmUtil.getData(this.mkTypeRateKey, 0.05),
        }
    },
    methods: {
        reteFormatTooltip(val) {
            return (val * 100).toFixed(0) + '%'
        }
    },
    watch: {
        ratioRateVal(n) {
            gmUtil.setData(this.mkTypeRateKey, n)
        },
        rateBlockingStatus(n) {
            gmUtil.setData(this.mkRateStatusKey, n)
        }
    }
}

/**
 * 视频指标过滤页面vue
 */
export const video_metrics_filter_vue = {
    components: {video_metrics_filter_item_vue, card_slider_vue},
    template: `
      <div>
        <el-card>
          <template #header>指标屏蔽(改动实时生效)</template>
          <video_metrics_filter_item_vue v-for="item in metricsFilterList" :key="item.headerTitle"
                                         :header-title="item.headerTitle"
                                         :describe="item.describe"
                                         :mk-rate-status-key="item.mkRateStatusKey"
                                         :mk-type-rate-key="item.mkTypeRateKey"
          />
          <card_slider_vue v-model="limitationFanSumVal" :max="90000"
                           :switch-val.sync="fansNumBlockingStatus">
            <template #header>粉丝数屏蔽</template>
            <template #describe>限制的粉丝数，小于或等于值限时制的屏蔽该视频，限制上限9万</template>
          </card_slider_vue>
        </el-card>
      </div>`,
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
                },
                {
                    mkRateStatusKey: 'fans_num_blocking_status',
                    mkTypeRateKey: 'limitation_fans_num'
                }
            ],
            limitationFanSumVal: getLimitationFanSumGm(),
            fansNumBlockingStatus: isFansNumBlockingStatusGm()
        }
    },
    watch: {
        limitationFanSumVal(n) {
            gmUtil.setData('limitation_fan_sum_gm', parseInt(n))
        },
        fansNumBlockingStatus(n) {
            gmUtil.setData('is_fans_num_blocking_status_gm', n)
        }
    }
}
