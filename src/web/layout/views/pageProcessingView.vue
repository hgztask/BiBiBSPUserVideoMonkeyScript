<script>
import gmUtil from "../../utils/gmUtil.js";
import bilibiliHome from "../../pagesModel/home/bilibiliHome.js";
import hotSearch from "../../pagesModel/search/hotSearch.js";
import topInput from "../../pagesModel/search/topInput.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import dynamicCard from "./page-processing/dynamicCard.vue";
import localMKData, {
  getReleaseTypeCardsGm,
  isAutomaticScrollingGm,
  isClearLiveCardGm,
  isCloseCommentBlockingGm,
  isDelLiveBottomBannerAdGm,
  isDelLivePageRightSidebarGm,
  isHideCarouselImageGm,
  isHideHomeTopHeaderBannerImageGm,
  isHideHomeTopHeaderChannelGm,
  isHideHotSearchesPanelGm,
  isHideLiveGiftPanelGm,
  isHideSearchHistoryPanelGm,
  isRoomBackgroundHideGm,
  isRoomListAdaptiveGm
} from "../../data/localMKData.js";
import liveSectionModel from "../../pagesModel/live/liveSectionModel.js";
import liveRoomModel from "../../pagesModel/live/liveRoomModel.js";
import liveCommon from "../../pagesModel/live/liveCommon.js";

//页面处理处理
export default {
  components: {dynamicCard},
  data() {
    return {
      isRemoveSearchBottomContent: gmUtil.getData('isRemoveSearchBottomContent', false),
      isClearLiveCardVal: isClearLiveCardGm(),
      isDelPlayerPageAd: gmUtil.getData('isDelPlayerPageAd', false),
      isDelPlayerPageRightGameAd: gmUtil.getData('isDelPlayerPageRightGameAd', false),
      isDelPlayerPageRightVideoList: localMKData.isDelPlayerPageRightVideoList(),
      isDelBottomComment: localMKData.isDelBottomComment(),
      isClearTopInputTipContent: gmUtil.getData('isClearTopInputTipContent', false),
      isDelPlayerEndingPanelVal: localMKData.isDelPlayerEndingPanel(),
      isHideHotSearchesPanelVal: isHideHotSearchesPanelGm(),
      isHideSearchHistoryPanelVal: isHideSearchHistoryPanelGm(),
      isCloseCommentBlockingVal: isCloseCommentBlockingGm(),
      isHideCarouselImageVal: isHideCarouselImageGm(),
      isHideHomeTopHeaderBannerImageVal: isHideHomeTopHeaderBannerImageGm(),
      isHideTopHeaderChannelVal: isHideHomeTopHeaderChannelGm(),
      releaseTypeCardVals: getReleaseTypeCardsGm(),
      isAutomaticScrollingVal: isAutomaticScrollingGm(),
      isRoomListAdaptiveVal: isRoomListAdaptiveGm(),
      isDelLivePageRightSidebarVal: isDelLivePageRightSidebarGm(),
      isRoomBackgroundHideVal: isRoomBackgroundHideGm(),
      isHideLiveGiftPanelVal: isHideLiveGiftPanelGm(),
      isDelLiveBottomBannerAdVal: isDelLiveBottomBannerAdGm()
    }
  },
  methods: {},
  watch: {
    isRemoveSearchBottomContent(b) {
      gmUtil.setData('isRemoveSearchBottomContent', b)
    },
    isClearLiveCardVal(b) {
      gmUtil.setData('is_clear_live_card_gm', b)
    },
    isDelPlayerPageAd(b) {
      gmUtil.setData('isDelPlayerPageAd', b)
    },
    isDelPlayerPageRightGameAd(b) {
      gmUtil.setData('isDelPlayerPageRightGameAd', b)
    },
    isDelPlayerPageRightVideoList(b) {
      gmUtil.setData('isDelPlayerPageRightVideoList', b)
    },
    isDelBottomComment(b) {
      gmUtil.setData('isDelBottomComment', b)
    },
    isClearTopInputTipContent(b) {
      gmUtil.setData('isClearTopInputTipContent', b)
      if (b) {
        eventEmitter.send('执行清空顶部搜索框提示内容')
        return
      }
      topInput.setTopInputPlaceholder()
    },
    isDelPlayerEndingPanelVal(n) {
      gmUtil.setData('is_del_player_ending_panel', n)
    },
    isHideHotSearchesPanelVal(n) {
      gmUtil.setData('is_hide_hot_searches_panel_gm', n)
      hotSearch.setTopSearchPanelDisplay(n, '热搜', 4000);
    },
    isHideSearchHistoryPanelVal(n) {
      gmUtil.setData('is_hide_search_history_panel_gm', n)
      hotSearch.setTopSearchPanelDisplay(n, '搜索历史', 4000);
    },
    isCloseCommentBlockingVal(n) {
      gmUtil.setData('is_close_comment_blocking_gm', n)
    },
    isHideCarouselImageVal(n) {
      gmUtil.setData('is_hide_carousel_image_gm', n)
      bilibiliHome.hideHomeCarouselImage(n, true);
    },
    isHideHomeTopHeaderBannerImageVal(n) {
      gmUtil.setData('is_hide_home_top_header_banner_image_gm', n)
      bilibiliHome.hideHomeTopHeaderBannerImage(n);
    },
    isHideTopHeaderChannelVal(n) {
      gmUtil.setData('is_hide_home_top_header_channel_gm', n)
      bilibiliHome.hideHomeTopHeaderChannel(n);
    },
    releaseTypeCardVals(n) {
      gmUtil.setData('release_type_cards_gm', n)
    },
    isAutomaticScrollingVal(n) {
      gmUtil.setData('is_automatic_scrolling_gm', n)
    },
    isRoomListAdaptiveVal(n) {
      gmUtil.setData('is_room_list_adaptive_gm', n)
      if (liveSectionModel.isLiveSection()) {
        liveSectionModel.liveStreamPartitionStyle(n);
      }
    },
    isDelLivePageRightSidebarVal(n) {
      gmUtil.setData('is_del_live_page_right_sidebar_gm', n)
      if (liveSectionModel.isLiveSection() || liveRoomModel.isLiveRoom()) {
        liveCommon.setLivePageRightSidebarHide(n)
      }
    },
    isRoomBackgroundHideVal(n) {
      gmUtil.setData('is_room_background_hide_gm', n)
      if (liveRoomModel.isLiveRoom()) {
        liveRoomModel.setRoomBackgroundDisplay(n);
      }
    },
    isHideLiveGiftPanelVal(n) {
      gmUtil.setData('is_hide_live_gift_panel_gm', n)
      if (liveRoomModel.isLiveRoom()) {
        liveRoomModel.setGiftControlPanelDisplay(n);
      }
    },
    isDelLiveBottomBannerAdVal(n) {
      gmUtil.setData('is_del_live_bottom_banner_ad_val_gm', n)
      if (liveRoomModel.isLiveRoom() && !liveRoomModel.isLiveRoomActivity()) {
        liveRoomModel.delLivePageRightSidebarAd();
      }
    }
  }
}
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
    <el-card shadow="never">
      <template #header>
        <span>顶部搜索框</span>
      </template>
      <el-switch v-model="isClearTopInputTipContent" active-text="清空内容"/>
      <el-switch v-model="isHideHotSearchesPanelVal" active-text="隐藏热搜"/>
      <el-switch v-model="isHideSearchHistoryPanelVal" active-text="隐藏搜索历史"/>
    </el-card>
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
    <dynamicCard/>
    <el-card shadow="never">
      <template #header>直播页</template>
      <el-switch v-model="isDelLivePageRightSidebarVal" active-text="屏蔽右侧侧边栏"/>
      <el-divider/>
      直播分区页
      <el-divider/>
      <el-switch v-model="isRoomListAdaptiveVal" active-text="房间列表自适应"/>
      <el-divider/>
      直播间
      <el-divider/>
      <el-switch v-model="isRoomBackgroundHideVal" active-text="背景移除"/>
      <el-switch v-model="isHideLiveGiftPanelVal" active-text="隐藏礼物栏"/>
      <el-switch v-model="isDelLiveBottomBannerAdVal" active-text="移除底部横幅广告"
                 title="移除页面礼物栏下方的横幅广告"/>
    </el-card>
  </div>
</template>
