<script>
import {eventEmitter} from "../../model/EventEmitter.js";
import gmUtil from "../../utils/gmUtil.js";

/**
 * 规则信息组件
 */
export default {
  props: {
    ruleInfoArr: {
      type: Array
    }
  },
  methods: {
    refreshInfo(isTip = true) {
      for (let x of this.ruleInfoArr) {
        x.len = gmUtil.getData(x.type, []).length;
      }
      if (!isTip) return;
      this.$notify({title: 'tip', message: '刷新规则信息成功', type: 'success'})
    },
    refreshInfoBut() {
      this.refreshInfo()
    },
    lookRuleBut(item) {
      if (item.len === 0) {
        this.$message.warning('当前规则信息为空')
        return;
      }
      const data = gmUtil.getData(item.type, []);
      eventEmitter.send('展示内容对话框', JSON.stringify(data))
    }
  },
  created() {
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
        <div class="el-horizontal-outside">
          <div>基础规则信息</div>
          <div>
            <el-button @click="refreshInfoBut">刷新信息</el-button>
          </div>
        </div>
      </template>
      <div style=" display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;">
        <div v-for="item in ruleInfoArr" :key="item.name">
          <el-badge :value="item.len">
            <el-button @click="lookRuleBut(item)">{{ item.name }}</el-button>
          </el-badge>
        </div>
      </div>
    </el-card>
  </div>
</template>
