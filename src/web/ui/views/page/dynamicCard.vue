<script setup lang="ts">
import {ref, watch} from 'vue';
import localMKData, {
  enableDynamicItemsContentBlockingGm,
  hidePersonalInfoCardGm,
  isBlockAppointmentDynamicGm,
  isBlockGoodsDynamicGm,
  isBlockRepostDynamicGm,
  isBlockSpecialColumnForChargingDynamicGm,
  isBlockUPowerLotteryDynamicGm,
  isBlockVideoChargingExclusiveDynamicGm,
  isBlockVoteDynamicGm
} from "../../../state/localMKData.ts";
import dynamicPage from "../../../pages/dynamic/page.ts";
import cssManager from "../../../domain/cssManager.ts";

const enableDynamicItemsContentBlockingVal = ref(enableDynamicItemsContentBlockingGm());
const isBlockRepostDynamicVal = ref(isBlockRepostDynamicGm());
const isBlockAppointmentDynamicVal = ref(isBlockAppointmentDynamicGm());
const isBlockVoteDynamicVal = ref(isBlockVoteDynamicGm());
const isBlockUPowerLotteryDynamicVal = ref(isBlockUPowerLotteryDynamicGm());
const isBlockGoodsDynamicVal = ref(isBlockGoodsDynamicGm());
const isBlockSpecialColumnForChargingDynamicVal = ref(isBlockSpecialColumnForChargingDynamicGm());
const isBlockVideoChargingExclusiveDynamicVal = ref(isBlockVideoChargingExclusiveDynamicGm());
const hidePersonalInfoCardVal = ref(hidePersonalInfoCardGm());
const isDynamicHomeRightLayHideVal = ref(localMKData.isDynamicHomeRightLayHide());
const hideBackToOldVersionButVal = ref(localMKData.hideBackToOldVersionButGm());

watch(enableDynamicItemsContentBlockingVal, (n) => {
  GM_setValue('enable_dynamic_items_content_blocking_gm', n);
});
watch(isBlockRepostDynamicVal, (n) => {
  GM_setValue('is_block_repost_dynamic_gm', n);
});
watch(isBlockAppointmentDynamicVal, (n) => {
  GM_setValue('is_block_appointment_dynamic_gm', n);
});
watch(isBlockVoteDynamicVal, (n) => {
  GM_setValue('is_block_vote_dynamic_gm', n);
});
watch(isBlockUPowerLotteryDynamicVal, (n) => {
  GM_setValue('is_block_u_power_lottery_dynamic_gm', n);
});
watch(isBlockGoodsDynamicVal, (n) => {
  GM_setValue('is_block_goods_dynamic_gm', n);
});
watch(isBlockSpecialColumnForChargingDynamicVal, (n) => {
  GM_setValue('is_block_special_column_for_charging_dynamic_gm', n);
});
watch(isBlockVideoChargingExclusiveDynamicVal, (n) => {
  GM_setValue('is_block_video_charging_exclusive_dynamic_gm', n);
});
watch(hidePersonalInfoCardVal, (n) => {
  GM_setValue('hide_personal_info_card_gm', n);
  if (dynamicPage.isUrlDynamicHomePage()) {
    dynamicPage.hidePersonalInfoCard(n);
  }
});
watch(isDynamicHomeRightLayHideVal, (n) => {
  GM_setValue('is_dynamic_home_right_lay_hide', n);
  cssManager.setDynamicHomeRightLayHide(n);
});
watch(hideBackToOldVersionButVal, (n) => {
  GM_setValue('hide_back_to_old_version_but_gm', n);
  dynamicPage.runHideBackToOldVersionButFun(n);
});
</script>

<template>
  <div>
    <el-card>
      <template #header>动态首页</template>
      <el-tooltip content="启用该项后，对应页面中的动态会对uid白名单处理，和动态内容处理">
        <el-switch v-model="enableDynamicItemsContentBlockingVal" active-text="启用动态内容屏蔽"/>
      </el-tooltip>
      <el-tooltip content="动态首页中左侧的个人信息卡片，展示关注粉丝动态该卡片">
        <el-switch v-model="hidePersonalInfoCardVal" active-text="隐藏个人信息卡片"/>
      </el-tooltip>
      <el-switch v-model="isDynamicHomeRightLayHideVal" active-text="隐藏右侧布局(热搜)"
                 title="区域为热搜和其上方的社区中心"/>
    </el-card>
    <el-card>
      <template #header>动态</template>
      <el-switch v-model="isBlockRepostDynamicVal" active-text="屏蔽转发类型"/>
      <el-tooltip content="如直播预约动态">
        <el-switch v-model="isBlockAppointmentDynamicVal" active-text="屏蔽预约类型"/>
      </el-tooltip>
      <el-switch v-model="isBlockVoteDynamicVal" active-text="屏蔽投票类型"/>
      <el-switch v-model="isBlockUPowerLotteryDynamicVal" active-text="屏蔽充电专属抽奖类型"/>
      <el-switch v-model="isBlockGoodsDynamicVal" active-text="屏蔽商品类"/>
      <el-switch v-model="isBlockSpecialColumnForChargingDynamicVal" active-text="屏蔽充电专属专栏"/>
      <el-switch v-model="isBlockVideoChargingExclusiveDynamicVal" active-text="屏蔽充电专属视频"/>
      <el-switch v-model="hideBackToOldVersionButVal" active-text="屏蔽右下角的回到旧版悬浮按钮"/>
    </el-card>
  </div>
</template>
