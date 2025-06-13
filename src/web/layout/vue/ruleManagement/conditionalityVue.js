import localMKData, {isEffectiveUIDShieldingOnlyVideo} from "../../../data/localMKData.js";
import gmUtil from "../../../utils/gmUtil.js";
import {requestIntervalQueue} from "../../../model/asynchronousIntervalQueue.js";
import {eventEmitter} from "../../../model/EventEmitter.js";
import globalValue from "../../../data/globalValue.js";

/**
 * 条件限制组件
 */
export default {
    template: `
      <div>
        <el-switch v-model="bOnlyTheHomepageIsBlocked" active-text="仅首页屏蔽生效屏蔽"/>
        <el-tooltip content="模糊和正则匹配时，将匹配词转小写与规则值匹配。修改后刷新页面生效">
          <el-switch v-model="bFuzzyAndRegularMatchingWordsToLowercase"
                     active-text="模糊和正则匹配词转小写"/>
        </el-tooltip>
        <el-tooltip content="改动实时生效">
          <el-switch v-model="isEffectiveUIDShieldingOnlyVideoVal" active-text="仅生效UID屏蔽(限视频)"/>
        </el-tooltip>
        <el-card>
          <template #header>
            <span>网络请求频率(单位秒)</span>
            <div>如设置0，则为不限制，比如设置2，则为每个请求之间隔2秒，可有效降低对B站api接口的压力，降低风控</div>
            <div>注意：设置过低可能会导致部分接口风控</div>
            <div>如接口风控了请先勾选下面的【禁用根据bv号网络请求获取视频信息】</div>
            <div>修改实时生效</div>
          </template>
          <el-switch v-model="isDisableNetRequestsBvVideoInfo" active-text="禁用根据bv号网络请求获取视频信息"/>
          <el-slider v-model="requestFrequencyVal" max="5" step="0.1" show-stops show-input
                     :disabled="isDisableNetRequestsBvVideoInfo"
          ></el-slider>
        </el-card>
      </div>`,
    data() {
        return {
            requestFrequencyVal: localMKData.isRequestFrequencyVal(),
            //是否仅首页屏蔽生效
            bOnlyTheHomepageIsBlocked: globalValue.bOnlyTheHomepageIsBlocked,
            isEffectiveUIDShieldingOnlyVideoVal: isEffectiveUIDShieldingOnlyVideo(),
            //是否模糊和正则匹配词转小写
            bFuzzyAndRegularMatchingWordsToLowercase: localMKData.bFuzzyAndRegularMatchingWordsToLowercase(),
            isDisableNetRequestsBvVideoInfo: localMKData.isDisableNetRequestsBvVideoInfo()
        }
    },
    methods: {},
    watch: {
        bOnlyTheHomepageIsBlocked(newVal) {
            gmUtil.setData("bOnlyTheHomepageIsBlocked", newVal === true);
        },
        bFuzzyAndRegularMatchingWordsToLowercase(newVal) {
            gmUtil.setData("bFuzzyAndRegularMatchingWordsToLowercase", newVal === true)
        },
        isDisableNetRequestsBvVideoInfo(b) {
            gmUtil.setData('isDisableNetRequestsBvVideoInfo', b)
        },
        isEffectiveUIDShieldingOnlyVideoVal(b) {
            gmUtil.setData('is_effective_uid_shielding_only_video', b)
        },
        requestFrequencyVal(n) {
            //设置请求频率
            gmUtil.setData('requestFrequencyVal', n > 0 && n <= 5 ? n : 0.2)
            requestIntervalQueue.setInterval(n * 1000)
        }
    },
    created() {
        eventEmitter.on('更新根据bv号网络请求获取视频信息状态', (b) => {
            this.isDisableNetRequestsBvVideoInfo = b
        });
    }
}
