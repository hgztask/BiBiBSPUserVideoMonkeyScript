<script setup lang="ts">
import {ref, watch} from 'vue';
import localMKData, {
  getLimitationVideoSubmitSumGm,
  isCommentDisabledVideosBlockedGm,
  isFollowers7DaysOnlyVideosBlockedGm,
  isLimitationVideoSubmitStatusGm,
  isSeniorMemberOnly,
  isVideosInFeaturedCommentsBlockedGm
} from "../../../state/localMKData.ts";
import uidRangeMaskingView from "../shield/uidRangeMaskingView.vue";

/**
 * 高级规则
 */
const isLimitationVideoSubmitStatusVal = ref(isLimitationVideoSubmitStatusGm());
const LimitationContributeVal = ref(getLimitationVideoSubmitSumGm());
const blockFollowed = ref(localMKData.isBlockFollowed());
const is_up_owner_exclusive = ref(localMKData.isUpOwnerExclusive());
const genderRadioVal = ref(localMKData.isGenderRadioVal());
const vipTypeRadioVal = ref(localMKData.isVipTypeRadioVal());
const is_senior_member_val = ref(localMKData.isSeniorMember());
const copyrightRadioVal = ref(localMKData.isCopyrightRadio());
const is_vertical_val = ref(localMKData.isBlockVerticalVideo());
const is_check_team_member = ref(localMKData.isCheckTeamMember());
const isSeniorMemberOnlyVal = ref(isSeniorMemberOnly());
const isVideosInFeaturedCommentsBlockedVal = ref(isVideosInFeaturedCommentsBlockedGm());
const isFollowers7DaysOnlyVideosBlockedVal = ref(isFollowers7DaysOnlyVideosBlockedGm());
const isCommentDisabledVideosBlockedVal = ref(isCommentDisabledVideosBlockedGm());

watch(blockFollowed, (n) => {
  GM_setValue('blockFollowed', n);
});
watch(is_up_owner_exclusive, (n) => {
  GM_setValue('is_up_owner_exclusive', n);
});
watch(genderRadioVal, (n) => {
  GM_setValue('genderRadioVal', n);
});
watch(vipTypeRadioVal, (n) => {
  GM_setValue('vipTypeRadioVal', n);
});
watch(is_senior_member_val, (n) => {
  GM_setValue('is_senior_member', n);
});
watch(copyrightRadioVal, (n) => {
  GM_setValue('copyrightRadioVal', n);
});
watch(is_vertical_val, (n) => {
  GM_setValue('blockVerticalVideo', n);
});
watch(is_check_team_member, (n) => {
  GM_setValue('checkTeamMember', n);
});
watch(isSeniorMemberOnlyVal, (n) => {
  GM_setValue('is_senior_member_only', n);
});
watch(LimitationContributeVal, (n) => {
  GM_setValue('limitation_video_submit_sum_gm', n);
});
watch(isLimitationVideoSubmitStatusVal, (n) => {
  GM_setValue('is_limitation_video_submit_status_gm', n);
});
watch(isVideosInFeaturedCommentsBlockedVal, (n) => {
  GM_setValue('is_videos_in_featured_comments_blocked_gm', n);
});
watch(isFollowers7DaysOnlyVideosBlockedVal, (n) => {
  GM_setValue('is_followers_7_days_only_videos_blocked_gm', n);
});
watch(isCommentDisabledVideosBlockedVal, (n) => {
  GM_setValue('is_comment_disabled_videos_blocked_gm', n);
});
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
          <el-radio-button value="原创"></el-radio-button>
          <el-radio-button value="转载"></el-radio-button>
          <el-radio-button value="不处理"></el-radio-button>
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
              <el-radio-button value="无"></el-radio-button>
              <el-radio-button value="月大会员"></el-radio-button>
              <el-radio-button value="年度及以上大会员"></el-radio-button>
              <el-radio-button value="不处理"></el-radio-button>
            </el-radio-group>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>性别屏蔽</template>
            <el-radio-group v-model="genderRadioVal">
              <el-radio-button value="男性"></el-radio-button>
              <el-radio-button value="女性"></el-radio-button>
              <el-radio-button value="保密"></el-radio-button>
              <el-radio-button value="不处理"></el-radio-button>
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
