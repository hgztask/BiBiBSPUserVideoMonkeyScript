import Vue from "vue";
import localMKData from "../data/localMKData.js";


const returnVue = () => {
    return new Vue({
        el: "#shield #compatible_setting",
        template: `
          <div>
            <div>
              <label>
                <input type="checkbox" v-model="adaptationBAppRecommend">首页屏蔽适配Bilibili-Gate脚本(bilibili-app-recommend)
              </label>
            </div>
            <div>
              <label>
                <input type="checkbox" v-model="compatible_BEWLY_BEWLY">兼容BewlyBewly插件
              </label>
              <div title="使用之后需刷新对应页面才可生效，勾选即所欲评论区使用新版获取方式">
                <label>
                  <input type="checkbox" v-model="newCommentArea">评论区适配新版
                </label>
              </div>
            </div>
          </div>`,
        data() {
            return {
                //是否适配bilibili-app-commerce脚本(Bilibili-Gate脚本)
                adaptationBAppRecommend: localMKData.getAdaptationBAppCommerce(),
                //是否兼容BewlyBewly插件
                compatible_BEWLY_BEWLY: localMKData.isCompatible_BEWLY_BEWLY(),
                //是否全部兼容新版评论区
                newCommentArea:localMKData.isCompatibleNewCommentArea()
            }
        },
        watch:{
            adaptationBAppRecommend(newVal) {
                localMKData.setAdaptationBAppCommerce(newVal);
            },
            compatible_BEWLY_BEWLY(newVal) {
                localMKData.setCompatible_BEWLY_BEWLY(newVal)
            },
            newCommentArea(newVal) {
                localMKData.setCompatibleNewCommentArea(newVal)
            }
        }
    })
}

//兼容选项卡vue实例
export default returnVue
