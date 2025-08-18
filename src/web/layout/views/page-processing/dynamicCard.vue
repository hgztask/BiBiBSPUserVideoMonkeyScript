<script>
import {
  enableDynamicItemsContentBlockingGm,
  isBlockAppointmentDynamicGm,
  isBlockGoodsDynamicGm,
  isBlockRepostDynamicGm,
  isBlockUPowerLotteryDynamicGm,
  isBlockVoteDynamicGm
} from "../../../data/localMKData.js";
import gmUtil from "../../../utils/gmUtil.js";

export default {
  data() {
    return {
      enableDynamicItemsContentBlockingVal: enableDynamicItemsContentBlockingGm(),
      isBlockRepostDynamicVal: isBlockRepostDynamicGm(),
      isBlockAppointmentDynamicVal: isBlockAppointmentDynamicGm(),
      isBlockVoteDynamicVal: isBlockVoteDynamicGm(),
      isBlockUPowerLotteryDynamicVal: isBlockUPowerLotteryDynamicGm(),
      isBlockGoodsDynamicVal: isBlockGoodsDynamicGm(),
    }
  },
  watch: {
    enableDynamicItemsContentBlockingVal(n) {
      gmUtil.setData('enable_dynamic_items_content_blocking_gm', n)
    },
    isBlockRepostDynamicVal(n) {
      gmUtil.setData('is_block_repost_dynamic_gm', n)
    },
    isBlockAppointmentDynamicVal(n) {
      gmUtil.setData('is_block_appointment_dynamic_gm', n)
    },
    isBlockVoteDynamicVal(n) {
      gmUtil.setData('is_block_vote_dynamic_gm', n)
    },
    isBlockUPowerLotteryDynamicVal(n) {
      gmUtil.setData('is_block_u_power_lottery_dynamic_gm', n)
    },
    isBlockGoodsDynamicVal(n) {
      gmUtil.setData('is_block_goods_dynamic_gm', n)
    },
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
    </el-card>
  </div>
</template>
