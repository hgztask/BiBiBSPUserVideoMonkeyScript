import gmUtil from "../../../utils/gmUtil.js";
import localMKData from "../../../data/localMKData.js";

/**
 * 高级规则
 */
export const high_level_rule_vue = {
    template: `
      <div>
        <el-card>
          <template #header>性别屏蔽</template>
          <el-radio-group v-model="genderRadioVal">
            <el-radio-button label="男性"></el-radio-button>
            <el-radio-button label="女性"></el-radio-button>
            <el-radio-button label="保密"></el-radio-button>
            <el-radio-button label="不处理"></el-radio-button>
          </el-radio-group>
        </el-card>
        <el-switch v-model="blockFollowed" active-text="屏蔽已关注"/>
        <el-switch v-model="is_up_owner_exclusive" active-text="屏蔽充电专属视频"></el-switch>
      </div>`,
    data() {
        return {
            blockFollowed: localMKData.isBlockFollowed(),
            is_up_owner_exclusive: localMKData.isUpOwnerExclusive(),
            genderRadioVal: localMKData.isGenderRadioVal()
        }
    },
    methods: {},
    watch: {
        blockFollowed(n) {
            gmUtil.setData('blockFollowed', n)
        },
        is_up_owner_exclusive(n) {
            gmUtil.setData('is_up_owner_exclusive', n)
        },
        genderRadioVal(n) {
            gmUtil.setData('genderRadioVal', n)
        }
    }
}
