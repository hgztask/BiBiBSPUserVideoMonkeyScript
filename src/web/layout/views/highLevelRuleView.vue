<script>
import gmUtil from "../../utils/gmUtil.js";
import localMKData, {
  getLimitationVideoSubmitSumGm,
  isCommentDisabledVideosBlockedGm,
  isFollowers7DaysOnlyVideosBlockedGm,
  isLimitationVideoSubmitStatusGm,
  isSeniorMemberOnly,
  isVideosInFeaturedCommentsBlockedGm
} from "../../data/localMKData.js";
import uidRangeMaskingView from "./uidRangeMaskingView.vue";

/**
 * 高级规则
 */
export default {
  components: {
    uidRangeMaskingView,
  },
  data() {
    return {
      isLimitationVideoSubmitStatusVal: isLimitationVideoSubmitStatusGm(),
      LimitationContributeVal: getLimitationVideoSubmitSumGm(),
      blockFollowed: localMKData.isBlockFollowed(),
      is_up_owner_exclusive: localMKData.isUpOwnerExclusive(),
      genderRadioVal: localMKData.isGenderRadioVal(),
      vipTypeRadioVal: localMKData.isVipTypeRadioVal(),
      is_senior_member_val: localMKData.isSeniorMember(),
      copyrightRadioVal: localMKData.isCopyrightRadio(),
      is_vertical_val: localMKData.isBlockVerticalVideo(),
      is_check_team_member: localMKData.isCheckTeamMember(),
      isSeniorMemberOnlyVal: isSeniorMemberOnly(),
      isVideosInFeaturedCommentsBlockedVal: isVideosInFeaturedCommentsBlockedGm(),
      isFollowers7DaysOnlyVideosBlockedVal: isFollowers7DaysOnlyVideosBlockedGm(),
      isCommentDisabledVideosBlockedVal: isCommentDisabledVideosBlockedGm()
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
    },
    isSeniorMemberOnlyVal(n) {
      gmUtil.setData('is_senior_member_only', n)
    },
    LimitationContributeVal(n) {
      gmUtil.setData('limitation_video_submit_sum_gm', n)
    },
    isLimitationVideoSubmitStatusVal(n) {
      gmUtil.setData('is_limitation_video_submit_status_gm', n)
    },
    isVideosInFeaturedCommentsBlockedVal(n) {
      gmUtil.setData('is_videos_in_featured_comments_blocked_gm', n)
    },
    isFollowers7DaysOnlyVideosBlockedVal(n) {
      gmUtil.setData('is_followers_7_days_only_videos_blocked_gm', n)
    },
    isCommentDisabledVideosBlockedVal(n) {
      gmUtil.setData('is_comment_disabled_videos_blocked_gm', n)
    }
  }
}
</script>

<template>
  <div>
    <uidRangeMaskingView/>
    <el-card>
      <template #header>投稿数屏蔽</template>
      <div>启用后，视频列表中用户投稿数低于该值的屏蔽，改动即生效</div>
      <el-switch v-model="isLimitationVideoSubmitStatusVal" active-text="启用"/>
      <el-input-number v-model="LimitationContributeVal" :min="0"></el-input-number>
    </el-card>
    <el-card>
      <template #header>视频类型</template>
      <el-tooltip content="选中的类型会被屏蔽">
        <el-radio-group v-model="copyrightRadioVal">
          <el-radio-button label="原创"></el-radio-button>
          <el-radio-button label="转载"></el-radio-button>
          <el-radio-button label="不处理"></el-radio-button>
        </el-radio-group>
      </el-tooltip>
      <el-divider/>
      <el-switch v-model="is_vertical_val" active-text="屏蔽竖屏类视频"/>
      <el-switch v-model="blockFollowed" active-text="屏蔽已关注"/>
      <el-switch v-model="is_up_owner_exclusive" active-text="屏蔽充电专属视频"></el-switch>
      <el-switch v-model="is_senior_member_val" active-text="屏蔽硬核会员"/>
      <el-divider/>
      <div>下面三个选项尽量不要启用，任意一个启用都会增加对b站的请求次数，请酌情使用</div>
      <el-tooltip content="视频评论区评论被up主精选后对所有人可见">
        <el-switch v-model="isVideosInFeaturedCommentsBlockedVal" active-text="屏蔽精选评论区类视频"/>
      </el-tooltip>
      <el-switch v-model="isFollowers7DaysOnlyVideosBlockedVal" active-text="屏蔽关注UP主7天以上的人可发评论类视频"/>
      <el-tooltip content="视频评论区输入框是禁止输入状态而非可输入类视频">
        <el-switch v-model="isCommentDisabledVideosBlockedVal" active-text="屏蔽禁止评论类视频"/>
      </el-tooltip>
      <el-divider/>
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
      <el-card shadow="never">
        <template #header>计算创作团队</template>
        <el-tooltip content="当作者未匹配上时检查其他成员">
          <el-switch v-model="is_check_team_member" active-text="检查创作团队中成员"/>
        </el-tooltip>
      </el-card>
    </el-card>
    <el-card>
      <template #header>评论</template>
      <el-switch v-model="isSeniorMemberOnlyVal" active-text="仅看硬核会员"/>
    </el-card>
  </div>
</template>
