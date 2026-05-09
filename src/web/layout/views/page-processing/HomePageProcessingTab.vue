<script>
import {defineComponent} from 'vue'
import bilibiliHome from "../../../pagesModel/home/bilibiliHome.js";
import {
  getReleaseTypeCardsGm,
  isAutomaticScrollingGm,
  isHideCarouselImageGm,
  isHideHomeTopHeaderBannerImageGm,
  isHideHomeTopHeaderChannelGm
} from "../../../data/localMKData.js";
import cssManager from "../../../model/cssManager.js";

export default defineComponent({
  name: "HomePageProcessingTab",
  data() {
    return {
      isHideCarouselImageVal: isHideCarouselImageGm(),
      isHideHomeTopHeaderBannerImageVal: isHideHomeTopHeaderBannerImageGm(),
      isHideTopHeaderChannelVal: isHideHomeTopHeaderChannelGm(),
      isAutomaticScrollingVal: isAutomaticScrollingGm(),
      releaseTypeCardVals: getReleaseTypeCardsGm(),
    }
  },
  watch: {
    isHideCarouselImageVal(n) {
      GM_setValue('is_hide_carousel_image_gm', n)
      bilibiliHome.hideHomeCarouselImage(n, true);
    },
    isHideHomeTopHeaderBannerImageVal(n) {
      GM_setValue('is_hide_home_top_header_banner_image_gm', n)
      bilibiliHome.hideHomeTopHeaderBannerImage(n);
    },
    isHideTopHeaderChannelVal(n) {
      GM_setValue('is_hide_home_top_header_channel_gm', n)
      cssManager.hideHomeTopHeaderChannel(n);
    },
    isAutomaticScrollingVal(n) {
      GM_setValue('is_automatic_scrolling_gm', n)
    },
    releaseTypeCardVals(n) {
      GM_setValue('release_type_cards_gm', n)
    }
  }
})
</script>

<template>
  <el-card shadow="never">
    <template #header>首页</template>
    <el-switch v-model="isHideCarouselImageVal" active-text="隐藏轮播图"/>
    <el-switch v-model="isHideHomeTopHeaderBannerImageVal" active-text="隐藏顶部标题横幅图片"/>
    <el-tooltip content="隐藏视频列表上方的动态、热门、频道栏一整行">
      <el-switch v-model="isHideTopHeaderChannelVal" active-text="隐藏顶部页面频道栏"/>
    </el-tooltip>
    <el-tooltip content="定时检测首页视频列表数量，如果数量<=9则模拟鼠标上下滚动">
      <el-switch v-model="isAutomaticScrollingVal" active-text="检查视频列表数量模拟鼠标上下滚动"/>
    </el-tooltip>
    <el-divider/>
    <el-tooltip content="但视频列表中出现选择的类型时跳过，反之屏蔽" placement="top">
      <div>放行的卡片
        <el-divider/>
        <el-checkbox-group v-model="releaseTypeCardVals">
          <el-checkbox label="直播"></el-checkbox>
          <el-checkbox label="番剧"></el-checkbox>
          <el-checkbox label="电影"></el-checkbox>
          <el-checkbox label="国创"></el-checkbox>
          <el-checkbox label="综艺"></el-checkbox>
          <el-checkbox label="课堂"></el-checkbox>
          <el-checkbox label="电视剧"></el-checkbox>
          <el-checkbox label="纪录片"></el-checkbox>
          <el-checkbox label="漫画"></el-checkbox>
        </el-checkbox-group>
      </div>
    </el-tooltip>
  </el-card>
</template>