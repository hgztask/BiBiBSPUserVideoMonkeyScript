<script>
import {eventEmitter} from "../../model/EventEmitter.js";

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
        x.len = GM_getValue(x.type, []).length;
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
      const data = GM_getValue(item.type, []);
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
      <div style="display: flex;flex-wrap: wrap;row-gap: 2px;justify-content: flex-start;">
        <el-button v-for="item in ruleInfoArr" :key="item.name"  size="small" @click="lookRuleBut(item)">
          {{ item.name }}
          <el-tag :effect="item.len>0?'dark':'light'" size="mini">
            {{ item.len }}
          </el-tag>
        </el-button>
      </div>
    </el-card>
  </div>
</template>
