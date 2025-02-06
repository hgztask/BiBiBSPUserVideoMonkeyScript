import Vue from "vue";
import '../vue/panelSettingsVue.js'
import '../vue/ruleManagementVue.js'
import '../vue/compatibleSettingVue.js'
import '../vue/cacheManagementVue.js'
import donateLayoutVue from '../vue/donateLayoutVue.js'
import outputInformationVue from '../vue/outputInformationVue.js'
import ruleManagementVue from '../vue/ruleManagementVue.js'
import {eventEmitter} from "../../model/EventEmitter.js";
import {Tip} from "../../utils/Tip.js";
import {cache_management_vue} from "../vue/cacheManagementVue.js";
import {panel_settings_vue} from "../vue/panelSettingsVue.js";
import {compatible_setting_vue} from "../vue/compatibleSettingVue.js";
import {look_content_dialog_vue} from "../components/lookContentDialogVue.js";
import {bAfterLoadingThePageOpenMainPanel, debugger_management_vue} from "../vue/debuggerMeanagementVue.js";
import {page_processing_vue} from "../vue/pageProcessingVue.js";
import gmUtil from "../../utils/gmUtil.js";
import {about_and_feedback_vue} from "../vue/aboutAndFeedbackVue.js";
import {show_img_dialog_vue} from "../components/showImgDialogVue.js";

const mainLayoutEl = document.createElement('div');
mainLayoutEl.style.position = 'fixed';
mainLayoutEl.style.left = '0';
mainLayoutEl.style.top = '0';
mainLayoutEl.style.width = '100%';
mainLayoutEl.style.height = '100%';
document.body.appendChild(mainLayoutEl);

if (document.head.querySelector('#element-ui-css') === null) {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://unpkg.com/element-ui/lib/theme-chalk/index.css'
    linkElement.id = 'element-ui-css'
    document.head.appendChild(linkElement)
    console.log('挂载element-ui样式成功')
}


/**
 * todo 目前发现加载在视频页时，el-drawer的遮罩会挡住整个屏幕，先设置modal为false，关闭遮罩，待后续观察
 * Drawer 的内容是懒渲染的，即在第一次被打开之前，传入的默认 slot 不会被渲染到 DOM 上。
 * 因此，如果需要执行 DOM 操作，或通过 ref 获取相应组件，请在 open 事件回调中进行。
 */
new Vue({
    el: mainLayoutEl,
    template: `
      <div>
      <el-drawer
          :visible.sync="drawer"
          direction="ltr"
          size="100%"
          :modal="false"
          :with-header="false">
        <el-tabs type="border-card" v-model="tabsActiveName"
                 @tab-click="tabClick">
          <el-tab-pane label="面板设置" name="面板设置" lazy>
            <panel_settings_vue/>
          </el-tab-pane>
          <el-tab-pane label="规则管理" name="规则管理" lazy>
            <rule_management_vue/>
          </el-tab-pane>
          <el-tab-pane label="兼容设置" name="兼容设置" lazy>
            <compatible_setting_vue/>
          </el-tab-pane>
          <el-tab-pane label="缓存管理" name="缓存管理" lazy>
            <cache_management_vue/>
          </el-tab-pane>
          <el-tab-pane label="页面处理" name="页面处理" lazy>
            <page_processing_vue/>
          </el-tab-pane>
          <el-tab-pane label="输出信息" name="输出信息" lazy>
            <output_information_vue/>
          </el-tab-pane>
          <el-tab-pane label="支持打赏" name="支持打赏" lazy>
            <donate_layout_vue/>
          </el-tab-pane>
          <el-tab-pane label="关于和问题反馈" name="关于和问题反馈" lazy>
            <about_and_feedback_vue/>
          </el-tab-pane>
          <el-tab-pane label="调试测试" name="调试测试" lazy v-if="debug_panel_show">
            <div v-show="debug_panel_show">
              <debugger_management_vue/>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-drawer>
      <look_content_dialog_vue/>
      <show_img_dialog_vue/>
      </div>`,
    components: {
        output_information_vue: outputInformationVue,
        donate_layout_vue: donateLayoutVue,
        rule_management_vue: ruleManagementVue,
        cache_management_vue,
        panel_settings_vue,
        compatible_setting_vue,
        look_content_dialog_vue,
        debugger_management_vue,
        page_processing_vue,
        about_and_feedback_vue,
        show_img_dialog_vue
    },
    data() {
        return {
            drawer: false,
            tabsActiveName: '规则管理',
            debug_panel_show: gmUtil.getData('open-dev', false)
        }
    },
    methods: {
        tabClick(tab) {
            gmUtil.setData('mainTabsActiveName', tab.name);
        }
    },
    created() {
        eventEmitter.on('主面板开关', () => {
            const tempBool = this.drawer;
            this.drawer = !tempBool;
        })

        eventEmitter.on('notification', (options) => {
            this.$notify(options)
        })
        Tip.infoBottomRight('主面板组件已加载')
        //记忆主面板激活的tab
        this.tabsActiveName = gmUtil.getData('mainTabsActiveName', '规则管理')


        eventEmitter.on('debugger-dev-show', (bool) => {
            debugger
            this.debug_panel_show = bool
            if (bool) {
                this.$alert('已开启测试调试面板', 'tip')
            } else {
                this.$alert('已关闭测试调试面板', 'tip')
            }
        })

        if (bAfterLoadingThePageOpenMainPanel()) {
            this.drawer = true
        }
    }
});
