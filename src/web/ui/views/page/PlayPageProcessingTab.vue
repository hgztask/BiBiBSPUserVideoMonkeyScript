<script setup lang="ts">
import {ref, watch} from 'vue'
import {eventEmitter} from "@/core/EventEmitter.ts";
import localMKData, {getCommentBlockButtonStyleGm, isCloseCommentBlockingGm, isCommentResponseRewriteGm} from "../../../state/localMKData.ts";

const isDelPlayerPageAd = ref(GM_getValue('isDelPlayerPageAd', false));
const isDelPlayerPageRightGameAd = ref(GM_getValue('isDelPlayerPageRightGameAd', false));
const isDelPlayerPageRightVideoList = ref(localMKData.isDelPlayerPageRightVideoList());
const isDelBottomComment = ref(localMKData.isDelBottomComment());
const isDelPlayerEndingPanelVal = ref(localMKData.isDelPlayerEndingPanel());
const isCloseCommentBlockingVal = ref(isCloseCommentBlockingGm());
const isCommentResponseRewriteVal = ref(isCommentResponseRewriteGm());
const commentBlockButtonStyleVal = ref<'default' | 'hide' | 'more'>(getCommentBlockButtonStyleGm());

watch(isDelPlayerPageAd, (b) => {
  GM_setValue('isDelPlayerPageAd', b);
});
watch(isDelPlayerPageRightGameAd, (b) => {
  GM_setValue('isDelPlayerPageRightGameAd', b);
});
watch(isDelPlayerPageRightVideoList, (b) => {
  GM_setValue('isDelPlayerPageRightVideoList', b);
});
watch(isDelBottomComment, (b) => {
  GM_setValue('isDelBottomComment', b);
});
watch(isDelPlayerEndingPanelVal, (n) => {
  GM_setValue('is_del_player_ending_panel', n);
});
watch(isCloseCommentBlockingVal, (n) => {
  GM_setValue('is_close_comment_blocking_gm', n);
});
watch(isCommentResponseRewriteVal, (n) => {
  GM_setValue('is_comment_response_rewrite_gm', n);
});
watch(commentBlockButtonStyleVal, (n) => {
  GM_setValue('comment_block_button_style_gm', n);
  // 切换后由 commentSectionModel 清理旧形态入口并重扫，保证实时生效
  eventEmitter.send('event-评论屏蔽按钮样式变更');
});
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
      <el-tooltip content="评论屏蔽按钮的显示位置：用户名后面（默认，内联在用户信息后）/ 隐藏 / 三点菜单中（新版评论区悬浮操作条内）">
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
          <span style="white-space: nowrap;">评论屏蔽按钮位置</span>
          <el-select v-model="commentBlockButtonStyleVal" style="width: 160px;">
            <el-option value="default" label="用户名后面"/>
            <el-option value="hide" label="隐藏"/>
            <el-option value="more" label="三点菜单中"/>
          </el-select>
        </div>
      </el-tooltip>
      <el-tooltip content="实验功能：全局修改评论接口响应（视频/影视/动态/空间等所有页面），在渲染前过滤可识别的评论（含楼中楼与置顶），命中规则输出到输出信息；关闭评论屏蔽时本开关无效，修改后请刷新页面">
        <el-switch v-model="isCommentResponseRewriteVal" active-text="响应过滤评论区（实验）"/>
      </el-tooltip>
    </el-card>
  </div>
</template>
