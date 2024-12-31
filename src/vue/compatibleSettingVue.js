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
            </div>
          </div>`,
        data() {
            return {
                //是否适配bilibili-app-commerce脚本(Bilibili-Gate脚本)
                adaptationBAppRecommend: localMKData.getAdaptationBAppCommerce(),
                //是否兼容BewlyBewly插件
                compatible_BEWLY_BEWLY: localMKData.isCompatible_BEWLY_BEWLY()
            }
        },
        watch:{
            adaptationBAppRecommend(newVal) {
                localMKData.setAdaptationBAppCommerce(newVal);
            },
            compatible_BEWLY_BEWLY(newVal) {
                localMKData.setCompatible_BEWLY_BEWLY(newVal)
            },
        }
    })
}

//兼容选项卡vue实例
export default returnVue
