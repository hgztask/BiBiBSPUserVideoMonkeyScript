<script lang="ts">
import {defineComponent} from 'vue'
import defUtil from "../../../core/util/defUtil.ts";
import localMKData from "../../../state/localMKData.ts";
import combinationRulesShielding from "../../../domain/shielding/combinationRules.ts";

export default defineComponent({
  name: "CombinationRuleView",
  data() {
    return {
      matchModeOptions: combinationRulesShielding.matchModeOptions,
      fieldOptions: combinationRulesShielding.fieldOptions,
      dataList: []
    }
  },
  methods: {
    pintConsoleLog() {
      const newDataList = defUtil.toRaw(this.dataList).map(({temporary, ...item}) => {
        return item
      })
      console.log(newDataList)
    },
    addRuleBut(row) {
      const {temporary} = row;
      const selectedKey = temporary.key;
      row.ruleList.push({key: selectedKey, mode: this.matchModeOptions[0].value, value: ''})
    },
    delRuleBut(mainRow, row) {
      mainRow.ruleList = mainRow.ruleList.filter(item => item !== row)
    },
    addPlanBut() {
      const size = this.dataList.length;
      const newRow = {
        name: `方案${size + 1}`,
        ruleList: [],
        status: false,
        temporary: {key: this.fieldOptions[0].value}
      }
      if (size > 1) {
        const find = this.dataList.find(lastItem => lastItem.status === false && lastItem.ruleList.length === 0);
        if (find) {
          return this.$alert(`【${find.name}】未启用且为空组合规则,请使用该方案`, {type: "warning"})
        }
      }
      this.dataList.push(newRow)
    },
    delPlanBut(row) {
      this.dataList = this.dataList.filter(item => item !== row)
      this.$notify({message: "已删除", position: "bottom-right"})
    },
    savePlanBut() {
      const newDataList = defUtil.toRaw(this.dataList).map(({temporary, ...item}) => {
        return item
      })
      GM_setValue('combination_rule_list_gm', newDataList)
      this.$notify({message: "已保存组合规则方案列表", position: "bottom-right"})
    },
    refresh(tip = false) {
      this.dataList = []
      for (const item of localMKData.getCombinationRuleListGm()) {
        item.temporary = {key: this.fieldOptions[0].value}
        this.dataList.push(item)
      }
      tip && this.$notify({message: "刷新方案列表成功", type: "success", position: 'bottom-right'})
    }
  },
  created() {
    this.refresh()
  }
})
</script>

<template>
  <div>
    <el-row>
      <el-col :span="18">
        <el-table :data="dataList" border>
          <el-table-column label="方案名" width="180">
            <template #default="scope">
              <el-input v-model.trim="scope.row.name"/>
            </template>
          </el-table-column>
          <el-table-column label="" width="650">
            <template #header>
              <gz-space><span>组合规则=字段|匹配值</span>
                <el-button @click="pintConsoleLog">打印方案列表</el-button>
              </gz-space>
            </template>
            <template #default="mainScope">
              <el-table :data="mainScope.row.ruleList" :show-header="false" border empty-text="空组合规则">
                <el-table-column label="字段" width="150">
                  <template #default="scope">
                    <el-select v-model="scope.row.key" placeholder="请选择">
                      <el-option v-for="item in fieldOptions" :key="item.value" :label="item.label"
                                 :value="item.value"/>
                    </el-select>
                  </template>
                </el-table-column>
                <!--现阶段匹配模式留着占位，后续再考虑-->
                <el-table-column v-if="false" label="匹配模式" width="150">
                  <template #default="scope">
                    <el-select v-model="scope.row.mode" placeholder="请选择">
                      <el-option v-for="item in matchModeOptions" :key="item.value" :label="item.label"
                                 :value="item.value"/>
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="匹配值">
                  <template #default="scope">
                    <el-input v-model.trim="scope.row.value"/>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default="scope">
                    <el-popconfirm title="是要删除该条规则吗？" @confirm="delRuleBut(mainScope.row,scope.row)">
                      <template #reference>
                        <el-button type="warning">移除</el-button>
                      </template>
                    </el-popconfirm>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="scope">
              <el-switch v-model="scope.row.status" active-text="启用"/>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #header>
              <gz-space size="1px">
                <span>操作</span>
                <el-button @click="addPlanBut">添加方案</el-button>
                <el-button @click="refresh(true)">刷新方案</el-button>
                <el-button type="success" @click="savePlanBut">保存方案</el-button>
              </gz-space>
            </template>
            <template #default="scope">
              <gz-space align-items="flex-start" direction="">
                <div>
                  <el-select v-model="scope.row.temporary.key" placeholder="请选择">
                    <el-option v-for="item in fieldOptions" :key="item.value" :label="item.label"
                               :value="item.value"/>
                  </el-select>
                  <el-button @click="addRuleBut(scope.row)">添加规则</el-button>
                </div>
                <div>
                  <el-popconfirm :title="`是要删除该方案吗？【${scope.row.name}】`" @confirm="delPlanBut(scope.row)">
                    <template #reference>
                      <el-button type="warning">移除方案</el-button>
                    </template>
                  </el-popconfirm>
                </div>
              </gz-space>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never">
          <template #header>说明</template>
          <gz-space align-items="flex-start" direction="">
            <span>视频tag匹配值多个时用英文逗号隔开</span>
            <span>正则匹配包含模糊匹配</span>
            <span>标题和简介强制正则匹配方式，修改无效</span>
            <span>每个方案中的规则列表只有要有一个匹配不上算匹配失败</span>
            <span>字段类型：视频标题、视频tag、视频简介,后续再考虑拓展</span>
            <span>点击保存方案才生效</span>
            <span>如启用
              <span title="条件限制选项卡中的开关">禁用根据bv号网络请求获取视频信息】</span>
              则所有组合规则方案都无效</span>
          </gz-space>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>

</style>