<script lang="ts">
import {defineComponent} from 'vue'
import bilibiliHome from "../../../pages/home/bilibili.ts";
import {
  getHomeFeedLoadAttemptsGm,
  getReleaseTypeCardsGm,
  isHideCarouselImageGm,
  isHideHomeTopHeaderBannerImageGm,
  isHideHomeTopHeaderChannelGm,
  isHomeResponseRewriteGm
} from "@/state/localMKData.ts";
import cssManager from "../../../domain/cssManager.ts";

export default defineComponent({
  name: "HomePageProcessingTab",
  data() {
    return {
      isHideCarouselImageVal: isHideCarouselImageGm(),
      isHideHomeTopHeaderBannerImageVal: isHideHomeTopHeaderBannerImageGm(),
      isHideTopHeaderChannelVal: isHideHomeTopHeaderChannelGm(),
      homeFeedLoadAttemptsVal: getHomeFeedLoadAttemptsGm(),
      isHomeResponseRewriteVal: isHomeResponseRewriteGm(),
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
    homeFeedLoadAttemptsVal(n) {
      const value = Number(n)
      GM_setValue('home_feed_load_attempts_gm', Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 3)
    },
    isHomeResponseRewriteVal(n) {
      GM_setValue('is_home_response_rewrite_gm', n)
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
    <el-tooltip content="首页列表未填满视口时，静默触发页面自身加载；每次连续补载的最多尝试次数，设置为0表示关闭">
      <div>
        <span>首页列表连续补载次数：</span>
        <el-input-number v-model="homeFeedLoadAttemptsVal" :min="0" :step="1"/>
      </div>
    </el-tooltip>
    <el-tooltip content="实验功能：过滤首页响应中明确识别的广告、直播、发布类型和基础视频规则；未知类型与深度规则仍由原有页面流程处理，修改后请刷新首页">
      <el-switch v-model="isHomeResponseRewriteVal" active-text="通过响应过滤首页推荐视频（实验）"/>
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
