import gmUtil from "../../utils/gmUtil.js";
import localMKData from "../../data/localMKData.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import topInput from "../../pagesModel/search/topInput.js";

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
      <el-card>
        <template #header>
          <span>顶部搜索框</span>
        </template>
        <el-switch v-model="isClearTopInputTipContent" active-text="清空内容"/>
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
        }
    }
}
