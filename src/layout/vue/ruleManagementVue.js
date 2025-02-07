import './ruleManagement/basicRulesVue.js'
import rule_export_import_vue from './ruleManagement/ruleExportImportVue.js'
import other_parameter_filter from './ruleManagement/otherParameterFilterVue.js'
import rule_information_vue from './ruleManagement/ruleInformationVue.js'
import conditional_processing_vue from './ruleManagement/conditionalProcessingVue.js'
import {basic_rules_vue} from "./ruleManagement/basicRulesVue.js";

// 规则管理组件
export default {
    components: {
        rule_export_import_vue,
        other_parameter_filter,
        rule_information_vue,
        conditional_processing_vue,
        basic_rules_vue
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
        <el-tab-pane label="高级规则">待补充</el-tab-pane>
        <el-tab-pane label="导出导入">
          <rule_export_import_vue/>
        </el-tab-pane>
        <el-tab-pane label="条件处理">
          <conditional_processing_vue/>
        </el-tab-pane>
        <el-tab-pane label="规则信息">
          <rule_information_vue/>
        </el-tab-pane>
      </el-tabs>
      </div>`,
    data() {
        return {}
    }
};

