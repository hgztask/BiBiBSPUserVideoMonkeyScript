<script setup lang="ts">
import {ref} from 'vue';
import bFetch from '../../core/http/bFetch.ts'
import {ElMessage, ElNotification} from 'element-plus';

/**
 * 弹幕词管理
 */
const resData = ref({});
const resList = ref<any[]>([]);

// 初始化
const initial = async () => {
  const {state, list, msg} = await bFetch.fetchGetBarrageBlockingWords();
  if (!state) {
    ElMessage.warning(msg);
    return false;
  }
  resList.value = list ?? [];
  ElNotification({title: '', message: '已初始化', type: 'success'});
  return true;
};
const fetchGetBarrageBlockingWordsBut = () => {
  if (resList.value.length === 0) {
    ElMessage.info('未有弹幕屏蔽词内容或未初始化');
    return;
  }
  const list = resList.value;
  ElMessage.success(`已打印在控制台上，数量${list.length}`);
  console.log('获取弹幕屏蔽词_start=====');
  console.log(list);
  console.log('获取弹幕屏蔽词_end=======');
};
const outToJsonFIleBut = () => {

};

void initial();
</script>
<template>
  <div>
    <el-button @click="fetchGetBarrageBlockingWordsBut">获取弹幕屏蔽词</el-button>
    <el-button @click="outToJsonFIleBut">导出至json文件</el-button>
  </div>
</template>
