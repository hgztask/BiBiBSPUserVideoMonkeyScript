import './ruleManagement/basicRulesVue.js'
import rule_export_import_vue from './ruleManagement/ruleExportImportVue.js'
import other_parameter_filter from './ruleManagement/otherParameterFilterVue.js'
import rule_information_vue from './ruleManagement/ruleInformationVue.js'
import conditionalityVue from './ruleManagement/conditionalityVue.js'
import {basic_rules_vue} from "./ruleManagement/basicRulesVue.js";
import {blacklist_management_vue} from "../blacklistManagementVue.js";

// 规则管理组件
export default {
    components: {
        rule_export_import_vue,
        other_parameter_filter,
        rule_information_vue,
        conditionalityVue,
        basic_rules_vue,
        blacklist_management_vue
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
        <el-tab-pane label="条件限制">
          <conditionalityVue/>
        </el-tab-pane>
        <el-tab-pane label="规则信息">
          <rule_information_vue/>
        </el-tab-pane>
        <el-tab-pane label="黑名单管理" lazy>
          <blacklist_management_vue/>
        </el-tab-pane>
      </el-tabs>
      </div>`,
    data() {
        return {}
    }
};

