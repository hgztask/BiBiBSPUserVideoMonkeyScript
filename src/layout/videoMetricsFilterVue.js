import gmUtil from "../utils/gmUtil.js";

/**
 * 视频指标过滤项
 */
const video_metrics_filter_item_vue = {
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
        <el-card shadow="never">
          <template #header>{{ headerTitle }}</template>
          <div>{{ describe }}</div>
          <div style="display: flex; align-items: center">
            <el-switch v-model="rateBlockingStatus" active-text="启用"/>
            <div style="flex: 1;margin-left: 15px">
              <el-slider v-model="ratioRateVal" :step="0.01" :min="0" :max="1" show-input
                         :format-tooltip="reteFormatTooltip"
                         :disabled="rateDisabled"></el-slider>
            </div>
          </div>
        </el-card>
      </div>`,
    data() {
        return {
            //是否启用屏蔽
            rateBlockingStatus: false,
            //比率
            ratioRateVal: 0,
            //是否禁用
            rateDisabled: false,
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
            this.rateDisabled = !n
            gmUtil.setData(this.mkRateStatusKey, n)
        }
    },
    created() {
        this.ratioRateVal = gmUtil.getData(this.mkTypeRateKey, 0.05)
        const bool = gmUtil.getData(this.mkRateStatusKey, false);
        this.rateBlockingStatus = bool;
        //如果开启状态则不禁用，反之禁用
        this.rateDisabled = !bool;
    }
}


/**
 * 视频指标过滤页面vue
 */
export const video_metrics_filter_vue = {
    components: {video_metrics_filter_item_vue},
    template: `
      <div>
        <video_metrics_filter_item_vue v-for="item in metricsFilterList" :key="item.headerTitle"
                                       :header-title="item.headerTitle"
                                       :describe="item.describe"
                                       :mk-rate-status-key="item.mkRateStatusKey"
                                       :mk-type-rate-key="item.mkTypeRateKey"
        />
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
                }
            ]
        }
    }
}
