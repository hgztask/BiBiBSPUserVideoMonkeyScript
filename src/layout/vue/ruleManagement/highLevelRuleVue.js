import gmUtil from "../../../utils/gmUtil.js";
import localMKData from "../../../data/localMKData.js";
import {uid_range_masking_vue} from "../../uidRangeMaskingVue.js";

/**
 * 高级规则
 */
export const high_level_rule_vue = {
    components: {
        uid_range_masking_vue,
    },
    template: `
      <div>
        <uid_range_masking_vue/>
        <el-card>
          <template #header>视频类型</template>
          <div>选中的类型会被屏蔽</div>
          <el-radio-group v-model="copyrightRadioVal">
            <el-radio-button label="原创"></el-radio-button>
            <el-radio-button label="转载"></el-radio-button>
            <el-radio-button label="不处理"></el-radio-button>
          </el-radio-group>
          <el-divider/>
          <el-switch v-model="is_vertical_val" active-text="屏蔽竖屏类视频"/>
          <el-switch v-model="blockFollowed" active-text="屏蔽已关注"/>
          <el-switch v-model="is_up_owner_exclusive" active-text="屏蔽充电专属视频"></el-switch>
          <el-switch v-model="is_senior_member_val" active-text="屏蔽硬核会员"/>
          <el-row>
            <el-col :span="12">
              <el-card shadow="never">
                <template #header>会员类型屏蔽</template>
                <el-radio-group v-model="vipTypeRadioVal">
                  <el-radio-button label="无"></el-radio-button>
                  <el-radio-button label="月大会员"></el-radio-button>
                  <el-radio-button label="年度及以上大会员"></el-radio-button>
                  <el-radio-button label="不处理"></el-radio-button>
                </el-radio-group>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card shadow="never">
                <template #header>性别屏蔽</template>
                <el-radio-group v-model="genderRadioVal">
                  <el-radio-button label="男性"></el-radio-button>
                  <el-radio-button label="女性"></el-radio-button>
                  <el-radio-button label="保密"></el-radio-button>
                  <el-radio-button label="不处理"></el-radio-button>
                </el-radio-group>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
        <el-card>
          <template #header>计算创作团队</template>
          <el-tooltip content="当作者未匹配上时检查其他成员"></el-tooltip>
          <el-switch v-model="is_check_team_member" active-text="检查创作团队中成员"/>
        </el-card>
      </div>`,
    data() {
        return {
            blockFollowed: localMKData.isBlockFollowed(),
            is_up_owner_exclusive: localMKData.isUpOwnerExclusive(),
            genderRadioVal: localMKData.isGenderRadioVal(),
            vipTypeRadioVal: localMKData.isVipTypeRadioVal(),
            is_senior_member_val: localMKData.isSeniorMember(),
            copyrightRadioVal: localMKData.isCopyrightRadio(),
            is_vertical_val: localMKData.isBlockVerticalVideo(),
            is_check_team_member: localMKData.isCheckTeamMember()
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
        },
        vipTypeRadioVal(n) {
            gmUtil.setData('vipTypeRadioVal', n)
        },
        is_senior_member_val(n) {
            gmUtil.setData('is_senior_member', n)
        },
        copyrightRadioVal(n) {
            gmUtil.setData('copyrightRadioVal', n)
        },
        is_vertical_val(n) {
            gmUtil.setData('blockVerticalVideo', n)
        },
        is_check_team_member(n) {
            gmUtil.setData('checkTeamMember', n)
        }
    }
}
