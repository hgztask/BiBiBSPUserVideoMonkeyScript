import gmUtil from "../../../utils/gmUtil.js";
import localMKData from "../../../data/localMKData.js";

/**
 * 高级规则
 */
export const high_level_rule_vue = {
    template: `
      <div>
        <el-switch v-model="blockFollowed" active-text="屏蔽已关注"/>
        <el-switch v-model="is_up_owner_exclusive" active-text="屏蔽充电专属视频"></el-switch>
      </div>`,
    data() {
        return {
            blockFollowed: localMKData.isBlockFollowed(),
            is_up_owner_exclusive: localMKData.isUpOwnerExclusive()
        }
    },
    methods: {},
    watch: {
        blockFollowed(n) {
            gmUtil.setData('blockFollowed', n)
        },
        is_up_owner_exclusive(n) {
            gmUtil.setData('is_up_owner_exclusive', n)
        }
    }
}
