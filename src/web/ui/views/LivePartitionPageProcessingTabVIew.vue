<script lang="ts">
import Vue from 'vue';
import {isRoomListAdaptiveGm} from "../../state/localMKData.ts";
import liveSectionModel from "../../pages/live_sectionModel.ts";
import cssManager from "../../domain/cssManager.ts";
import PartitionTagWhiterListPanel from "./PatitionTagWhiterListPanel.vue";

export default Vue.extend({
  components: {PartitionTagWhiterListPanel},
  data() {
    return {
      isRoomListAdaptiveVal: isRoomListAdaptiveGm(),
      isDelLivePartitionPageRightSidebarVal: false
    }
  },
  watch: {
    isRoomListAdaptiveVal(n) {
      GM_setValue('is_room_list_adaptive_gm', n)
      if (liveSectionModel.isLiveSection()) {
        cssManager.liveStreamPartitionStyle(n);
      }
    },
    isDelLivePartitionPageRightSidebarVal(n) {
      GM_setValue('is_del_live_partition_page_right_sidebar_gm', n)
      if (liveSectionModel.isLiveSection()) {
        // cssManager
      }
    }
  },
})
</script>

<template>
  <div>
    <el-card shadow="never">
      <el-switch v-model="isRoomListAdaptiveVal" active-text="房间列表自适应"/>
      <el-switch v-model="isDelLivePartitionPageRightSidebarVal" active-text="屏蔽右侧侧边栏"/>
    </el-card>
    <el-card shadow="never">
      <template #header>顶部切换分区面板白单名展示(仅展示列表中分区,启用后生效，启用了如留空则会清空列表)</template>
      <gz-space>
        <PartitionTagWhiterListPanel partition-list-key="mobile_game_list_gm" switch-key="mobile_game_status_gm"
                                     title="手游分区"/>
        <PartitionTagWhiterListPanel partition-list-key="online_game_list_gm" switch-key="online_game_status_gm"
                                     title="网游分区"/>
        <PartitionTagWhiterListPanel partition-list-key="console_game_list_gm" switch-key="console_game_status_gm"
                                     title="单机游戏"/>
      </gz-space>
    </el-card>
  </div>
</template>