import Vue from "vue";
import '../vue/panelSettingsVue.js'
import '../vue/ruleManagementVue.js'
import '../vue/compatibleSettingVue.js'
import '../vue/cacheManagementVue.js'
import donateLayoutVue from '../vue/donateLayoutVue.js'
import outputInformationVue from '../vue/outputInformationVue.js'
import {eventEmitter} from "../../model/EventEmitter.js";

const mainLayoutEl = document.createElement('div');
mainLayoutEl.style.position = 'fixed';
mainLayoutEl.style.left = '0';
mainLayoutEl.style.top = '0';
mainLayoutEl.style.width = '100%';
mainLayoutEl.style.height = '100%';
mainLayoutEl.id = 'main_drawer_layout'
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
        <el-tabs type="border-card">
          <el-tab-pane label="面板设置">
            <panel_settings_vue/>
          </el-tab-pane>
          <el-tab-pane label="规则管理">
            <rule_management_vue/>
          </el-tab-pane>
          <el-tab-pane label="兼容设置">
            <compatible_setting/>
          </el-tab-pane>
          <el-tab-pane label="缓存管理">
            <cache_management_vue/>
          </el-tab-pane>
          <el-tab-pane label="输出信息">
            <output_information_vue/>
          </el-tab-pane>
          <el-tab-pane label="支持打赏">
            <donate_layout_vue/>
          </el-tab-pane>
          <el-tab-pane label="关于和问题反馈">
          </el-tab-pane>
        </el-tabs>
      </el-drawer>
      </div>`,
    components: {
        output_information_vue: outputInformationVue,
        donate_layout_vue: donateLayoutVue
    },
    data() {
        return {
            drawer: false,
        }
    },
    methods: {},
    created() {
        eventEmitter.on('主面板开关', () => {
            const tempBool = this.drawer;
            this.drawer = !tempBool;
        })
    }
});
