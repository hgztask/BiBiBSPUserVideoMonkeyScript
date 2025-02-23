import localMKData from "../data/localMKData.js";
import gmUtil from "../utils/gmUtil.js";

/**
 * 视频指标过滤页面vue
 */
export const video_metrics_filter_vue = {
    template: `
      <div>
        <el-card>
          <template #header>视频点赞率屏蔽</template>
          <div>用户指定限制的点赞率，默认为2%，小于或等于值限时制的屏蔽该视频，公式:点赞率=点赞数/播放量</div>
          <div style="display: flex; align-items: center">
            <el-switch v-model="videoLikeRateBlockingStatus" active-text="启用"/>
            <div style="flex: 1;margin-left: 15px">
              <el-slider v-model="videoLikeRateVal" :step="0.01" :min="0" :max="1" show-input
                         :format-tooltip="videoLikeReteFormatTooltip" :disabled="videoLikeRateDisabled"></el-slider>
            </div>
          </div>
        </el-card>
      </div>`,
    data() {
        return {
            videoLikeRateBlockingStatus: localMKData.isVideoLikeRateBlockingStatus(),
            videoLikeRateVal: localMKData.getVideoLikeRate(),
            videoLikeRateDisabled: !localMKData.isVideoLikeRateBlockingStatus(),
        }
    },
    methods: {
        videoLikeReteFormatTooltip(val) {
            return (val * 100).toFixed(0) + '%'
        }
    },
    watch: {
        videoLikeRateVal(n) {
            gmUtil.setData('video_like_rate', n)
        },
        videoLikeRateBlockingStatus(n) {
            this.videoLikeRateDisabled = !n
            gmUtil.setData('video_like_rate_blocking_status', n)
        }
    }
}
