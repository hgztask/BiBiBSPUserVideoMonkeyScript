import localMKData from "../../../data/localMKData.js";

/**
 * 条件处理组件
 */
export default {
    template: `
      <div>
      <el-switch v-model="bOnlyTheHomepageIsBlocked" active-text="仅首页屏蔽生效屏蔽"/>
      <el-tooltip content="模糊和正则匹配时，将匹配词转小写与规则值匹配。修改后刷新页面生效">
        <el-switch v-model="bFuzzyAndRegularMatchingWordsToLowercase" active-text="模糊和正则匹配词转小写"></el-switch>
      </el-tooltip>
      </div>`,
    data() {
        return {
            //是否仅首页屏蔽生效
            bOnlyTheHomepageIsBlocked: localMKData.getBOnlyTheHomepageIsBlocked(),
            //是否模糊和正则匹配词转小写
            bFuzzyAndRegularMatchingWordsToLowercase: localMKData.bFuzzyAndRegularMatchingWordsToLowercase(),
        }
    },
    methods: {},
    watch: {
        bOnlyTheHomepageIsBlocked(newVal) {
            localMKData.setBOnlyTheHomepageIsBlocked(newVal);
        },
        bFuzzyAndRegularMatchingWordsToLowercase(newVal) {
            localMKData.setFuzzyAndRegularMatchingWordsToLowercase(newVal)
        }
    },
    created() {

    }
}
