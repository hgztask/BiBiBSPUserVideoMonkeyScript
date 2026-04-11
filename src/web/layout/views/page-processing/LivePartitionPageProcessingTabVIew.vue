<script>
import {isRoomListAdaptiveGm} from "../../../data/localMKData.js";
import liveSectionModel from "../../../pagesModel/live/liveSectionModel.js";
import cssManager from "../../../model/cssManager.js";
import PartitionTagWhiterListPanel from "./PatitionTagWhiterListPanel.vue";

export default {
  components: {PartitionTagWhiterListPanel},
  data() {
    return {
      isRoomListAdaptiveVal: isRoomListAdaptiveGm(),
    }
  },
  watch: {
    isRoomListAdaptiveVal(n) {
      GM_setValue('is_room_list_adaptive_gm', n)
      if (liveSectionModel.isLiveSection()) {
        cssManager.liveStreamPartitionStyle(n);
      }
    },
  },
}
</script>

<template>
  <div>
    <el-card shadow="never">
      <el-switch v-model="isRoomListAdaptiveVal" active-text="房间列表自适应"/>
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