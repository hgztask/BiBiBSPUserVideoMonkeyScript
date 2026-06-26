<script lang="ts">
import Vue from 'vue';
import replProcessingView from "../replProcessingView.vue";
import timeRangeMaskingView from "../shield/timeRangeMaskingView.vue";
import videoMetricsFilterView from "../shield/videoMetricsFilterView.vue";
import highLevelRuleView from "./highLevelRuleView.vue";
import blacklistManagementView from "../blacklistManagementView.vue";
import basicRulesView from "./basicRulesView.vue";
import ruleExportImportView from './ruleExportImportView.vue'
import otherParameterFilterView from '../otherParameterFilterView.vue'
import viewRulesRuleDialog from "../../dialogs/viewRulesRuleDialog.vue";
import GloryLevelTabView from "../glory/GloryLevelTabView.vue";
import FanCardLevelRestrictionsView from "../glory/FanCardLevelRestrictionsView.vue";
import CombinationRuleView from "../glory/CombinationRuleView.vue";

export default Vue.extend({
  components: {
    CombinationRuleView,
    FanCardLevelRestrictionsView,
    GloryLevelTabView,
    ruleExportImportView,
    otherParameterFilterView,
    basicRulesView,
    blacklistManagementView,
    highLevelRuleView,
    videoMetricsFilterView,
    timeRangeMaskingView,
    replProcessingView,
    viewRulesRuleDialog,
  }
})
</script>

<template>
  <div>
    <el-tabs id="规则管理" tab-position="left" type="border-card">
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
      <el-tab-pane label="组合规则" lazy>
        <CombinationRuleView/>
      </el-tab-pane>
      <el-tab-pane label="荣耀等级" lazy>
        <GloryLevelTabView/>
      </el-tab-pane>
      <el-tab-pane label="粉丝牌等级" lazy>
        <FanCardLevelRestrictionsView/>
      </el-tab-pane>
      <el-tab-pane label="导出导入" lazy>
        <ruleExportImportView/>
      </el-tab-pane>
      <el-tab-pane label="黑名单管理" lazy>
        <blacklistManagementView/>
      </el-tab-pane>
    </el-tabs>
    <viewRulesRuleDialog/>
  </div>
</template>
<style>
/*调整规则管理tabs容器的边距*/
#规则管理 > .el-tabs__content {
  padding: 5px 0;
}
</style>