import Vue from "vue";
import '../vue/panelSettingsVue.js'
import '../vue/ruleManagementVue.js'
import '../vue/compatibleSettingVue.js'
import '../vue/cacheManagementVue.js'
import donateLayoutVue from '../vue/donateLayoutVue.js'
import outputInformationVue from '../vue/outputInformationVue.js'
import ruleManagementVue from '../vue/ruleManagementVue.js'
import {eventEmitter} from "../../model/EventEmitter.js";
import {cache_management_vue} from "../vue/cacheManagementVue.js";
import {panel_settings_vue} from "../vue/panelSettingsVue.js";
import {compatible_setting_vue} from "../vue/compatibleSettingVue.js";
import {look_content_dialog_vue} from "../eventEmitter_components/lookContentDialogVue.js";
import {bAfterLoadingThePageOpenMainPanel, debugger_management_vue} from "../vue/debuggerMeanagementVue.js";
import {page_processing_vue} from "../vue/pageProcessingVue.js";
import gmUtil from "../../utils/gmUtil.js";
import {about_and_feedback_vue} from "../vue/aboutAndFeedbackVue.js";
import {show_img_dialog_vue} from "../eventEmitter_components/showImgDialogVue.js";
import {sheet_dialog_vue} from "../components/sheetDialogVue.js";
import {requestIntervalQueue} from "../../model/asynchronousIntervalQueue.js";
import {bullet_word_management_vue} from "../bulletWordManagementVue.js";
import {isOpenDev} from "../../data/localMKData.js";

const mainLayoutEl = document.createElement('div');

if (document.head.querySelector('#element-ui-css') === null) {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://unpkg.com/element-ui/lib/theme-chalk/index.css'
    linkElement.id = 'element-ui-css'
    document.head.appendChild(linkElement)
    console.log('挂载element-ui样式成功')
}

window.addEventListener('load', () => {
    document.body.appendChild(mainLayoutEl)
    /**
     * todo 目前发现加载在视频页时，el-drawer的遮罩会挡住整个屏幕，先设置modal为false，关闭遮罩，待后续观察
     * Drawer 的内容是懒渲染的，即在第一次被打开之前，传入的默认 slot 不会被渲染到 DOM 上。
     */
    new Vue({
        el: mainLayoutEl,
        template: `
          <div>
            <el-drawer style="position: fixed"
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
                <el-tab-pane v-if="debug_panel_show" label="弹幕词管理" name="弹幕词管理" lazy>
                  <bullet_word_management_vue/>
                </el-tab-pane>
                <el-tab-pane label="输出信息" name="输出信息">
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
            <sheet_dialog_vue :show="sheet_dialog.show" :list="sheet_dialog.list" :title="sheet_dialog.title"
                              @close="handleClose"
                              :close-on-click-modal="sheet_dialog.closeOnClickModal"
                              @options-click="handleOptionsClick"/>
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
            show_img_dialog_vue,
            sheet_dialog_vue,
            bullet_word_management_vue
        },
        data() {
            return {
                drawer: false,
                // 默认打开的tab
                tabsActiveName: gmUtil.getData('mainTabsActiveName', '规则管理'),
                debug_panel_show: isOpenDev(),
                sheet_dialog: {
                    show: false,
                    list: [],
                    title: "",
                    /**
                     * @type function
                     * @returns boolean
                     */
                    optionsClick: null,
                    closeOnClickModal: true
                }
            }
        },
        methods: {
            tabClick(tab) {
                gmUtil.setData('mainTabsActiveName', tab.name);
            },
            handleClose() {
                this.sheet_dialog.show = false
            },
            handleOptionsClick(item) {
                let tempBool;
                //如果回调函数返回true，则不关闭对话框，反之关闭对话框
                const temp = this.sheet_dialog.optionsClick(item);
                if (temp === undefined) {
                    tempBool = false
                } else {
                    tempBool = temp;
                }
                this.sheet_dialog.show = tempBool === true;
            }
        },
        created() {
            eventEmitter.on('主面板开关', () => {
                const tempBool = this.drawer;
                this.drawer = !tempBool;
            })

            eventEmitter.on('el-notify', (options) => {
                this.$notify(options)
            })
            eventEmitter.on('el-msg', (...options) => {
                this.$message(...options)
            })

            eventEmitter.on('el-alert', (...options) => {
                this.$alert(...options);
            })

            eventEmitter.handler('el-confirm', (...options) => {
                return this.$confirm(...options);
            })

            eventEmitter.on('debugger-dev-show', (bool) => {
                debugger
                this.debug_panel_show = bool
                if (bool) {
                    this.$alert('已开启测试调试面板', 'tip')
                } else {
                    this.$alert('已关闭测试调试面板', 'tip')
                }
            })

            eventEmitter.on('sheet-dialog', ({list, optionsClick, title = '选项', closeOnClickModal = false}) => {
                this.sheet_dialog.show = true
                this.sheet_dialog.list = list
                this.sheet_dialog.title = title
                this.sheet_dialog.optionsClick = optionsClick
                this.sheet_dialog.closeOnClickModal = closeOnClickModal
            })

            eventEmitter.handler('el-prompt', (...options) => {
                return this.$prompt(...options)
            })

            eventEmitter.on('请求获取视频信息失败', (response, bvId) => {
                requestIntervalQueue.clearPendingQueue()
                eventEmitter.send('更新根据bv号网络请求获取视频信息状态', true)
                this.$alert(`请求获取视频信息失败，状态码：${response.status}，bv号：${bvId}
                \n。已自动禁用根据bv号网络请求获取视频信息状态
                \n如需关闭，请在面板条件限制里手动关闭。`, '错误', {
                    confirmButtonText: '确定',
                    type: 'error'
                })
            })

            if (bAfterLoadingThePageOpenMainPanel()) {
                this.drawer = true
            }
        }
    });
})
