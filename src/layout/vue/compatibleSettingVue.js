import Vue from "vue";
import localMKData from "../../data/localMKData.js";

/**
 * 兼容性设置
 */
Vue.component('compatible_setting', {
    template: `
      <div>
      <div>
        <el-checkbox v-model="adaptationBAppRecommend">首页屏蔽适配Bilibili-Gate脚本(bilibili-app-recommend)
        </el-checkbox>
      </div>
      <div>
        <el-tooltip content="使用之后需刷新对应页面才可生效，勾选即评论区使用新版获取方式，不再使用旧版方式"
                    placement="top">
          <el-checkbox v-model="discardOldCommentAreasV">弃用旧版评论区处理</el-checkbox>
        </el-tooltip>
      </div>
      <div>
        <el-checkbox v-model="compatible_BEWLY_BEWLY">兼容BewlyBewly插件</el-checkbox>
      </div>
      </div>`,
    data() {
        return {
            //是否适配bilibili-app-commerce脚本(Bilibili-Gate脚本)
            adaptationBAppRecommend: localMKData.getAdaptationBAppCommerce(),
            //是否兼容BewlyBewly插件
            compatible_BEWLY_BEWLY: localMKData.isCompatible_BEWLY_BEWLY(),
            //是否全部兼容新版评论区
            discardOldCommentAreasV: localMKData.isDiscardOldCommentAreas()
        }
    },
    watch: {
        adaptationBAppRecommend(newVal) {
            localMKData.setAdaptationBAppCommerce(newVal);
        },
        compatible_BEWLY_BEWLY(newVal) {
            localMKData.setCompatible_BEWLY_BEWLY(newVal)
        },
        discardOldCommentAreasV(newVal) {
            localMKData.setDiscardOldCommentAreas(newVal)
        }
    }
})
