import gmUtil from "../../utils/gmUtil.js";
import localMKData from "../../data/localMKData.js";

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
      </el-card>
      </div>`,
    data() {
        return {
            isRemoveSearchBottomContent: gmUtil.getData('isRemoveSearchBottomContent', false),
            isDelPlayerPageAd: gmUtil.getData('isDelPlayerPageAd', false),
            isDelPlayerPageRightGameAd: gmUtil.getData('isDelPlayerPageRightGameAd', false),
            isDelPlayerPageRightVideoList: localMKData.isDelPlayerPageRightVideoList(),
            isDelBottomComment: gmUtil.getData('isDelBottomComment', false)
        }
    },
    methods: {},
    watch: {
        isRemoveSearchBottomContent(newBool) {
            gmUtil.setData('isRemoveSearchBottomContent', newBool)
        },
        isDelPlayerPageAd(newBool) {
            gmUtil.setData('isDelPlayerPageAd', newBool)
        },
        isDelPlayerPageRightGameAd(newBool) {
            gmUtil.setData('isDelPlayerPageRightGameAd', newBool)
        },
        isDelPlayerPageRightVideoList(newBool) {
            gmUtil.setData('isDelPlayerPageRightVideoList', newBool)
        },
        isDelBottomComment(newBool) {
            gmUtil.setData('isDelBottomComment', newBool)
        }
    }
}
