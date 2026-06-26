<script lang="ts">
import Vue from 'vue';
import hotSearch from "../../pages/search_hot.ts";
import topInput from "../../pages/search_topInput.ts";
import {eventEmitter} from "../../core/EventEmitter.ts";
import localMKData, {
  isClearLiveCardGm,
  isDelLiveBottomBannerAdGm,
  isDelLivePageRightSidebarGm,
  isHideHotSearchesPanelGm,
  isHideLiveGiftPanelGm,
  isHideSearchHistoryPanelGm,
  isRoomBackgroundHideGm,
} from "../../state/localMKData.ts";
import liveSectionModel from "../../pages/live_sectionModel.ts";
import liveRoomModel from "../../pages/live_roomModel.ts";
import liveCommon from "../../pages/live_common.ts";
import space from "../../pages/space_main.ts";

//页面处理处理
export default Vue.extend({
  components: {},
  data() {
    return {
      isRemoveSearchBottomContent: GM_getValue('isRemoveSearchBottomContent', false),
      isClearLiveCardVal: isClearLiveCardGm(),
      isClearTopInputTipContent: GM_getValue('isClearTopInputTipContent', false),
      isHideHotSearchesPanelVal: isHideHotSearchesPanelGm(),
      isHideSearchHistoryPanelVal: isHideSearchHistoryPanelGm(),
      isDelLivePageRightSidebarVal: isDelLivePageRightSidebarGm(),
      isRoomBackgroundHideVal: isRoomBackgroundHideGm(),
      isHideLiveGiftPanelVal: isHideLiveGiftPanelGm(),
      isDelLiveBottomBannerAdVal: isDelLiveBottomBannerAdGm(),
      isHideAddSeeLaterVal: localMKData.isHideAddSeeLater(),
      isHideChargingDedicatedVideosVal: localMKData.isHideChargingDedicatedVideos(),
      isLiveReplayVideosHideVal: localMKData.isLiveReplayVideosHide()
    }
  },
  methods: {},
  watch: {
    isRemoveSearchBottomContent(b) {
      GM_setValue('isRemoveSearchBottomContent', b)
    },
    isClearLiveCardVal(b) {
      GM_setValue('is_clear_live_card_gm', b)
    },
    isClearTopInputTipContent(b) {
      GM_setValue('isClearTopInputTipContent', b)
      if (b) {
        eventEmitter.send('执行清空顶部搜索框提示内容')
        return
      }
      topInput.setTopInputPlaceholder()
    },
    isHideHotSearchesPanelVal(n) {
      GM_setValue('is_hide_hot_searches_panel_gm', n)
      hotSearch.setTopSearchPanelDisplay(n, '热搜', 4000);
    },
    isHideSearchHistoryPanelVal(n) {
      GM_setValue('is_hide_search_history_panel_gm', n)
      hotSearch.setTopSearchPanelDisplay(n, '搜索历史', 4000);
    },
    isDelLivePageRightSidebarVal(n) {
      GM_setValue('is_del_live_page_right_sidebar_gm', n)
      if (liveSectionModel.isLiveSection() || liveRoomModel.isLiveRoom()) {
        liveCommon.setLivePageRightSidebarHide(n)
      }
    },
    isRoomBackgroundHideVal(n) {
      GM_setValue('is_room_background_hide_gm', n)
      if (liveRoomModel.isLiveRoom()) {
        liveRoomModel.setRoomBackgroundDisplay(n);
      }
    },
    isHideLiveGiftPanelVal(n) {
      GM_setValue('is_hide_live_gift_panel_gm', n)
      if (liveRoomModel.isLiveRoom()) {
        liveRoomModel.setGiftControlPanelDisplay(n);
      }
    },
    isDelLiveBottomBannerAdVal(n) {
      GM_setValue('is_del_live_bottom_banner_ad_val_gm', n)
      if (liveRoomModel.isLiveRoom() && !liveRoomModel.isLiveRoomActivity()) {
        liveRoomModel.delLivePageRightSidebarAd();
      }
    },
    isHideAddSeeLaterVal(n) {
      GM_setValue('is_hide_add_see_later', n)
    },
    isHideChargingDedicatedVideosVal(n) {
      GM_setValue('is_hide_charging_dedicated_videos', n)
      space.executeSetChargingVideosVisible(n)
    },
    isLiveReplayVideosHideVal(n) {
      GM_setValue('is_live_replay_videos_hide_gm', n)
      space.executeSetLiveReplayVideosVisible(n)
    }
  }
})
</script>
<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <span>搜索页</span>
      </template>
      <el-switch v-model="isRemoveSearchBottomContent"
                 active-text="屏蔽底部额外内容"/>
      <el-tooltip content="综合选项卡视频列表中出现的直播卡片">
        <el-switch v-model="isClearLiveCardVal" active-text="屏蔽推荐直播类"/>
      </el-tooltip>
    </el-card>
    <el-card shadow="never">
      <template #header>
        <span>顶部搜索框</span>
      </template>
      <el-switch v-model="isClearTopInputTipContent" active-text="清空内容"/>
      <el-switch v-model="isHideHotSearchesPanelVal" active-text="隐藏热搜"/>
      <el-switch v-model="isHideSearchHistoryPanelVal" active-text="隐藏搜索历史"/>
    </el-card>
    <el-card shadow="never">
      <template #header>直播页</template>
      <el-switch v-model="isDelLivePageRightSidebarVal" active-text="屏蔽右侧侧边栏"/>
      <el-divider/>
      直播间
      <el-divider/>
      <el-switch v-model="isRoomBackgroundHideVal" active-text="背景移除"/>
      <el-switch v-model="isHideLiveGiftPanelVal" active-text="隐藏礼物栏"/>
      <el-switch v-model="isDelLiveBottomBannerAdVal" active-text="移除底部横幅广告"
                 title="移除页面礼物栏下方的横幅广告"/>
    </el-card>
    <el-card shadow="never">
      <template #header>视频列表项</template>
      <el-switch v-model="isHideAddSeeLaterVal" active-text="隐藏添加至稍后再看按钮" title="刷新页面生效"/>
    </el-card>
    <el-card shadow="never">
      <template #header>用户空间主页</template>
      <el-switch v-model="isHideChargingDedicatedVideosVal" active-text="隐藏投稿选项卡中充电视频"/>
      <el-switch v-model="isLiveReplayVideosHideVal" active-text="隐藏投稿选项卡直播回放"/>
    </el-card>
  </div>
</template>
