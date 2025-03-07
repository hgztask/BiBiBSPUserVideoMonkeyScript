import localMKData from "../../data/localMKData.js";
import globalValue from "../../data/globalValue.js";

// 兼容性设置组件
export const compatible_setting_vue = {
    template: `
      <div>
        <el-card>
          <template #header>说明</template>
          <div>如果用户没有安装并使用对应脚本或插件，就不要开启相关兼容选项</div>
        </el-card>
        <el-card>
          <template #header>Bilibili-Gate脚本(bilibili-app-recommend)</template>
          <el-switch v-model="adaptationBAppRecommend" active-text="首页屏蔽适配"/>
        </el-card>
        <el-card>
          <template #header>BewlyBewly插件</template>
          <el-switch v-model="compatible_BEWLY_BEWLY" active-text="首页适配"/>
        </el-card>
        <el-card>
          <template #header>评论区</template>
          使用之后需刷新对应页面才可生效，勾选即评论区使用新版获取方式，不再使用旧版方式
          <div>
            <el-switch v-model="discardOldCommentAreasV" active-text="弃用旧版评论区处理"/>
          </div>
        </el-card>
      </div>`,
    data() {
        return {
            //是否适配bilibili-app-commerce脚本(Bilibili-Gate脚本)
            adaptationBAppRecommend: globalValue.adaptationBAppCommerce,
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
};
