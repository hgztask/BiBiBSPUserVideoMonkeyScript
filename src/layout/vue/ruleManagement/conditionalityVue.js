import localMKData from "../../../data/localMKData.js";
import gmUtil from "../../../utils/gmUtil.js";
import {requestIntervalQueue} from "../../../model/asynchronousIntervalQueue.js";

/**
 * 设置请求频率
 * @param v {number}
 */
const setRequestFrequencyVal = (v) => {
    gmUtil.setData('requestFrequencyVal', v > 0 && v <= 5 ? v : 0.2)
}

/**
 * 设置是否禁用根据bv号网络请求获取视频信息
 * @param b {boolean}
 */
const setDisableNetRequestsBvVideoInfo = (b) => {
    gmUtil.setData('isDisableNetRequestsBvVideoInfo', b)
}

/**
 * 条件限制组件
 */
export default {
    template: `
      <div>
        <el-switch v-model="bOnlyTheHomepageIsBlocked" active-text="仅首页屏蔽生效屏蔽"/>
        <el-tooltip content="模糊和正则匹配时，将匹配词转小写与规则值匹配。修改后刷新页面生效">
          <el-switch v-model="bFuzzyAndRegularMatchingWordsToLowercase"
                     active-text="模糊和正则匹配词转小写"></el-switch>
        </el-tooltip>
        <el-card>
          <template #header>
            <span>网络请求频率(单位秒)</span>
            <div>如设置0，则为不限制，比如设置2，则为每个请求之间隔2秒，可有效降低对B站api接口的压力，降低风控</div>
            <div>注意：设置过低可能会导致部分接口风控</div>
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
            bOnlyTheHomepageIsBlocked: localMKData.getBOnlyTheHomepageIsBlocked(),
            //是否模糊和正则匹配词转小写
            bFuzzyAndRegularMatchingWordsToLowercase: localMKData.bFuzzyAndRegularMatchingWordsToLowercase(),
            isDisableNetRequestsBvVideoInfo: localMKData.isDisableNetRequestsBvVideoInfo()
        }
    },
    methods: {},
    watch: {
        bOnlyTheHomepageIsBlocked(newVal) {
            localMKData.setBOnlyTheHomepageIsBlocked(newVal);
        },
        bFuzzyAndRegularMatchingWordsToLowercase(newVal) {
            localMKData.setFuzzyAndRegularMatchingWordsToLowercase(newVal)
        },
        isDisableNetRequestsBvVideoInfo(b) {
            setDisableNetRequestsBvVideoInfo(b)
        },
        requestFrequencyVal(n) {
            setRequestFrequencyVal(n)
            requestIntervalQueue.setInterval(n * 1000)
        }
    },
    created() {

    }
}
