import Vue from "vue";
import './ruleManagement/basicRulesVue.js'
import rule_export_import_vue from './ruleManagement/ruleExportImportVue.js'
import other_parameter_filter from './ruleManagement/otherParameterFilterVue.js'
import rule_information_vue from './ruleManagement/ruleInformationVue.js'

// 规则管理组件
Vue.component('rule_management_vue', {
    components: {
        rule_export_import_vue,
        other_parameter_filter,
        rule_information_vue
    },
    template: `
      <div>
      <el-tabs type="border-card" tab-position="left">
        <el-tab-pane label="基础规则">
          <basic_rules_vue/>
        </el-tab-pane>
        <el-tab-pane label="其他规则">
          <other_parameter_filter/>
        </el-tab-pane>
        <el-tab-pane label="高级规则">高级规则</el-tab-pane>
        <el-tab-pane label="导出导入">
          <rule_export_import_vue/>
        </el-tab-pane>
        <el-tab-pane label="规则信息">
          <rule_information_vue/>
        </el-tab-pane>
      </el-tabs>
      </div>`,
    data() {
        return {}
    }
})

