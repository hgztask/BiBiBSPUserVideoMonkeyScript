<script setup lang="ts">
import {ref, watch} from 'vue';
import {eventEmitter} from "@/core/EventEmitter.ts";
import {ElMessage, ElNotification} from 'element-plus';

/**
 * 规则信息组件
 */
const props = withDefaults(defineProps<{
  ruleInfoArr?: any[]
}>(), {
  ruleInfoArr: () => []
});

const refreshInfo = (isTip = true) => {
  for (let x of props.ruleInfoArr as any[]) {
    // Vue3 Proxy 响应式：直接赋值即可（无需 $set）
    x.len = GM_getValue(x.type, []).length;
  }
  if (!isTip) return;
  ElNotification({title: 'tip', message: '刷新规则信息成功', type: 'success'});
};
const refreshInfoBut = () => {
  refreshInfo();
};
const lookRuleBut = (item: any) => {
  if (item.len === 0) {
    ElMessage.warning('当前规则信息为空');
    return;
  }
  const data = GM_getValue(item.type, []);
  eventEmitter.send('展示内容对话框', JSON.stringify(data));
};

refreshInfo(false);
eventEmitter.on('刷新规则信息', (isTip = true) => {
  refreshInfo(isTip);
});
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
        <el-button v-for="item in ruleInfoArr" :key="item.name" size="small" @click="lookRuleBut(item)">
          {{ item.name }}
          <el-tag :effect="item.len>0?'dark':'light'" size="small">
            {{ item.len }}
          </el-tag>
        </el-button>
      </div>
    </el-card>
  </div>
</template>
