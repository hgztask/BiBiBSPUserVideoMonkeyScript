import gmUtil from "../../utils/gmUtil.js";
import localMKData, {
    enableDynamicItemsContentBlockingGm,
    isCloseCommentBlockingGm,
    isHideCarouselImageGm,
    isHideHomeTopHeaderBannerImageGm,
    isHideHomeTopHeaderChannelGm,
    isHideHotSearchesPanelGm,
    isHideSearchHistoryPanelGm
} from "../../data/localMKData.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import topInput from "../../pagesModel/search/topInput.js";
import hotSearch from "../../pagesModel/search/hotSearch.js";
import bilibiliHome from "../../pagesModel/home/bilibiliHome.js";

//页面处理处理
export const page_processing_vue = {
    template: `
      <div>
        <el-card>
          <template #header>
            <span>搜索页</span>
          </template>
          <el-switch v-model="isRemoveSearchBottomContent"
                     active-text="屏蔽底部额外内容"/>
        </el-card>
        <el-card>
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
        <el-card>
          <template #header>
            <span>顶部搜索框</span>
          </template>
          <el-switch v-model="isClearTopInputTipContent" active-text="清空内容"/>
          <el-switch v-model="isHideHotSearchesPanelVal" active-text="隐藏热搜"/>
          <el-switch v-model="isHideSearchHistoryPanelVal" active-text="隐藏搜索历史"/>
        </el-card>
        <el-card>
          <template #header>首页</template>
          <el-switch v-model="isHideCarouselImageVal" active-text="隐藏轮播图"/>
          <el-switch v-model="isHideHomeTopHeaderBannerImageVal" active-text="隐藏顶部标题横幅图片"/>
          <el-tooltip content="隐藏视频列表上方的动态、热门、频道栏一整行">
            <el-switch v-model="isHideTopHeaderChannelVal" active-text="隐藏顶部页面频道栏"/>
          </el-tooltip>
        </el-card>
        <el-card>
          <template #header>动态首页</template>
          <el-tooltip content="启用该项后，对应页面中的动态会对uid白名单处理，和动态内容处理">
            <el-switch v-model="enableDynamicItemsContentBlockingVal" active-text="启用动态内容屏蔽"/>
          </el-tooltip>
        </el-card>
      </div>`,
    data() {
        return {
            isRemoveSearchBottomContent: gmUtil.getData('isRemoveSearchBottomContent', false),
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
            enableDynamicItemsContentBlockingVal: enableDynamicItemsContentBlockingGm()
        }
    },
    methods: {},
    watch: {
        isRemoveSearchBottomContent(b) {
            gmUtil.setData('isRemoveSearchBottomContent', b)
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
        enableDynamicItemsContentBlockingVal(n) {
            gmUtil.setData('enable_dynamic_items_content_blocking_gm', n)
        }
    }
}
