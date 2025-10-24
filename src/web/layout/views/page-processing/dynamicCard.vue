<script>
import {
  enableDynamicItemsContentBlockingGm,
  hidePersonalInfoCardGm,
  isBlockAppointmentDynamicGm,
  isBlockGoodsDynamicGm,
  isBlockRepostDynamicGm,
  isBlockSpecialColumnForChargingDynamicGm,
  isBlockUPowerLotteryDynamicGm,
  isBlockVideoChargingExclusiveDynamicGm,
  isBlockVoteDynamicGm
} from "../../../data/localMKData.js";
import dynamicPage from "../../../pagesModel/dynamic/dynamicPage.js";

export default {
  data() {
    return {
      enableDynamicItemsContentBlockingVal: enableDynamicItemsContentBlockingGm(),
      isBlockRepostDynamicVal: isBlockRepostDynamicGm(),
      isBlockAppointmentDynamicVal: isBlockAppointmentDynamicGm(),
      isBlockVoteDynamicVal: isBlockVoteDynamicGm(),
      isBlockUPowerLotteryDynamicVal: isBlockUPowerLotteryDynamicGm(),
      isBlockGoodsDynamicVal: isBlockGoodsDynamicGm(),
      isBlockSpecialColumnForChargingDynamicVal: isBlockSpecialColumnForChargingDynamicGm(),
      isBlockVideoChargingExclusiveDynamicVal: isBlockVideoChargingExclusiveDynamicGm(),
      hidePersonalInfoCardVal: hidePersonalInfoCardGm()
    }
  },
  watch: {
    enableDynamicItemsContentBlockingVal(n) {
      GM_setValue('enable_dynamic_items_content_blocking_gm', n)
    },
    isBlockRepostDynamicVal(n) {
      GM_setValue('is_block_repost_dynamic_gm', n)
    },
    isBlockAppointmentDynamicVal(n) {
      GM_setValue('is_block_appointment_dynamic_gm', n)
    },
    isBlockVoteDynamicVal(n) {
      GM_setValue('is_block_vote_dynamic_gm', n)
    },
    isBlockUPowerLotteryDynamicVal(n) {
      GM_setValue('is_block_u_power_lottery_dynamic_gm', n)
    },
    isBlockGoodsDynamicVal(n) {
      GM_setValue('is_block_goods_dynamic_gm', n)
    },
    isBlockSpecialColumnForChargingDynamicVal(n) {
      GM_setValue('is_block_special_column_for_charging_dynamic_gm', n)
    },
    isBlockVideoChargingExclusiveDynamicVal(n) {
      GM_setValue('is_block_video_charging_exclusive_dynamic_gm', n)
    },
    hidePersonalInfoCardVal(n) {
      GM_setValue('hide_personal_info_card_gm', n)
      if (dynamicPage.isUrlDynamicHomePage()) {
        dynamicPage.hidePersonalInfoCard(n);
      }
    }
  }
}
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
    </el-card>
  </div>
</template>
