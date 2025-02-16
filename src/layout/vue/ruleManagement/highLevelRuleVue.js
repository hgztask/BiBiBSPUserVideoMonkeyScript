import gmUtil from "../../../utils/gmUtil.js";
import localMKData from "../../../data/localMKData.js";

/**
 * 高级规则
 */
export const high_level_rule_vue = {
    template: `
      <div>
        <el-switch v-model="blockFollowed" active-text="屏蔽已关注"/>
      </div>`,
    data() {
        return {
            blockFollowed: localMKData.isBlockFollowed(),
        }
    },
    methods: {},
    watch: {
        blockFollowed(n) {
            gmUtil.setData('blockFollowed', n)
        }
    }
}
