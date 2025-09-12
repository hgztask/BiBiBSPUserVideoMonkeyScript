<script>
import {eventEmitter} from "../../model/EventEmitter.js";
import ruleKeyListData from "../../data/ruleKeyListData.js";
import gmUtil from "../../utils/gmUtil.js";

/**
 * 规则信息组件
 */
export default {
  data() {
    return {
      //规则信息
      ruleInfoArr: [],
    }
  },
  methods: {
    refreshInfo(isTip = true) {
      for (let x of this.ruleInfoArr) {
        x.len = gmUtil.getData(x.type, []).length;
      }
      if (!isTip) return;
      this.$notify({
        title: 'tip',
        message: '刷新规则信息成功',
        type: 'success',
      })
    },
    // 刷新规则信息
    refreshInfoBut() {
      this.refreshInfo()
    }
  },
  created() {
    for (let newRuleKeyListElement of ruleKeyListData.getRuleKeyListData()) {
      this.ruleInfoArr.push({
        type: newRuleKeyListElement.key,
        name: newRuleKeyListElement.name,
        len: 0
      })
    }
    this.refreshInfo(false);
    eventEmitter.on('刷新规则信息', (isTip = true) => {
      this.refreshInfo(isTip);
    })
  }
};
</script>

<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <el-button @click="refreshInfoBut">刷新信息</el-button>
      </template>
      <div style=" display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;">
        <div v-for="item in ruleInfoArr" :key="item.name">
          <el-badge :value="item.len">
            <el-button>{{ item.name }}</el-button>
          </el-badge>
        </div>
      </div>
    </el-card>
  </div>
</template>
