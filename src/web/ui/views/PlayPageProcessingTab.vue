<script lang="ts">
import {defineComponent} from 'vue'
import localMKData, {isCloseCommentBlockingGm} from "../../state/localMKData.ts";

export default defineComponent({
  name: "PlayPageProcessingTab",
  data() {
    return {
      isDelPlayerPageAd: GM_getValue('isDelPlayerPageAd', false),
      isDelPlayerPageRightGameAd: GM_getValue('isDelPlayerPageRightGameAd', false),
      isDelPlayerPageRightVideoList: localMKData.isDelPlayerPageRightVideoList(),
      isDelBottomComment: localMKData.isDelBottomComment(),
      isDelPlayerEndingPanelVal: localMKData.isDelPlayerEndingPanel(),
      isCloseCommentBlockingVal: isCloseCommentBlockingGm()
    }
  },
  watch: {
    isDelPlayerPageAd(b) {
      GM_setValue('isDelPlayerPageAd', b)
    },
    isDelPlayerPageRightGameAd(b) {
      GM_setValue('isDelPlayerPageRightGameAd', b)
    },
    isDelPlayerPageRightVideoList(b) {
      GM_setValue('isDelPlayerPageRightVideoList', b)
    },
    isDelBottomComment(b) {
      GM_setValue('isDelBottomComment', b)
    },
    isDelPlayerEndingPanelVal(n) {
      GM_setValue('is_del_player_ending_panel', n)
    },
    isCloseCommentBlockingVal(n) {
      GM_setValue('is_close_comment_blocking_gm', n)
    }
  }
})
</script>

<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <span>播放页</span>
      </template>
      <el-switch v-model="isDelPlayerPageAd" active-text="屏蔽页面元素广告"/>
      <el-switch v-model="isDelPlayerPageRightGameAd" active-text="屏蔽右侧游戏推荐"/>
      <el-tooltip content="移除整个推荐列表，状态刷新生效">
        <el-switch v-model="isDelPlayerPageRightVideoList" active-text="移除右侧推荐列表"/>
      </el-tooltip>
      <el-tooltip content="状态刷新生效">
        <el-switch v-model="isDelBottomComment" active-text="移除评论区"/>
      </el-tooltip>
      <el-tooltip content="视频播放完之后会在播放器上显示推荐内容，开启之后移除播放器上整个推荐内容">
        <el-switch v-model="isDelPlayerEndingPanelVal" active-text="移除播放完推荐层"/>
      </el-tooltip>
      <el-tooltip content="开启后评论屏蔽功能关闭">
        <el-switch v-model="isCloseCommentBlockingVal" active-text="关闭评论屏蔽"/>
      </el-tooltip>
    </el-card>
  </div>
</template>

<style scoped>

</style>