<script setup lang="ts">
import {ref, watch} from 'vue';
import localMKData from "../../../state/localMKData.ts";
import {ElMessage, ElMessageBox} from 'element-plus';

/**
 * uid范围屏蔽vue组件
 */
const status = ref(localMKData.isUidRangeMaskingStatus());
const head = ref(0);
const tail = ref(100);

const setRangeBut = () => {
  ElMessageBox.alert('设置成功');
  GM_setValue('uid_range_masking', [head.value, tail.value]);
};

watch(head, (newVal, oldVal) => {
  if (newVal > tail.value) {
    ElMessage('最小值不能大于最大值');
    head.value = oldVal;
  }
});
watch(tail, (newVal, oldVal) => {
  if (newVal < head.value) {
    ElMessage('最大值不能小于最小值');
    tail.value = oldVal;
  }
});
watch(status, (n) => {
  GM_setValue('uid_range_masking_status', n);
});

const arr = localMKData.getUidRangeMasking();
head.value = arr[0];
tail.value = arr[1];
</script>
<template>
  <div>
    <el-card>
      <template #header>
        uid范围屏蔽
      </template>
      <div style="margin-bottom: 10px">
        范围内的uid都会被屏蔽掉，改动需重新设置方可生效，且再下次检查时屏蔽(如视频列表加载，评论加载)。比较关系【最小>=uid<=最大】
      </div>
      <el-switch v-model="status" active-text="启用" style="margin-bottom: 10px"/>
      <el-input v-model.number="head" style="width: 30%;">
        <template #prepend>最小</template>
      </el-input>
      <el-input v-model.number="tail" style="width: 30%;">
        <template #prepend>最大</template>
      </el-input>
      <el-button @click="setRangeBut">设置</el-button>
    </el-card>
  </div>
</template>
