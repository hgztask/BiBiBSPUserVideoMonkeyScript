<script>
import replProcessingView from "./replProcessingView.vue";
import timeRangeMaskingView from "./timeRangeMaskingView.vue";
import videoMetricsFilterView from "./videoMetricsFilterView.vue";
import highLevelRuleView from "./highLevelRuleView.vue";
import blacklistManagementView from "./blacklistManagementView.vue";
import basicRulesView from "../views/basicRulesView.vue";
import ruleExportImportView from './ruleExportImportView.vue'
import otherParameterFilterView from './otherParameterFilterView.vue'
import ruleInformationView from './ruleInformationView.vue'
import conditionalityView from './conditionalityView.vue'


export default {
  components: {
    ruleExportImportView,
    otherParameterFilterView,
    ruleInformationView,
    conditionalityView,
    basicRulesView,
    blacklistManagementView,
    highLevelRuleView,
    videoMetricsFilterView,
    timeRangeMaskingView,
    replProcessingView
  }
}
</script>

<template>
  <div>
    <el-tabs tab-position="left" type="border-card">
      <el-tab-pane label="基础规则">
        <basicRulesView/>
      </el-tab-pane>
      <el-tab-pane label="高级规则" lazy>
        <highLevelRuleView/>
      </el-tab-pane>
      <el-tab-pane label="其他规则" lazy>
        <otherParameterFilterView/>
      </el-tab-pane>
      <el-tab-pane label="指标屏蔽" lazy>
        <videoMetricsFilterView/>
      </el-tab-pane>
      <el-tab-pane label="范围屏蔽" lazy>
        <timeRangeMaskingView/>
      </el-tab-pane>
      <el-tab-pane label="替换处理" lazy>
        <replProcessingView/>
      </el-tab-pane>
      <el-tab-pane label="导出导入" lazy>
        <ruleExportImportView/>
      </el-tab-pane>
      <el-tab-pane label="条件限制" lazy>
        <conditionalityView/>
      </el-tab-pane>
      <el-tab-pane label="规则信息">
        <ruleInformationView/>
      </el-tab-pane>
      <el-tab-pane label="黑名单管理" lazy>
        <blacklistManagementView/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
