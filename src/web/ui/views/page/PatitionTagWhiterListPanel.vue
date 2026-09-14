<script setup lang="ts">
import {computed, ref, watch} from 'vue';
import {ElMessage} from 'element-plus';

const props = withDefaults(defineProps<{
    title?: string;
    switchKey?: string;
    partitionListKey?: string;
}>(), {
    title: '',
    switchKey: '',
    partitionListKey: '',
});

const partition = ref('');
const partitionList = ref<any[]>([]);
const switchVal = ref(false);

const showPartitionList = computed(() => {
  if (partition.value === '') return partitionList.value;
  return partitionList.value.filter(item => item.includes(partition.value));
});

watch(switchVal, (newV) => {
  GM_setValue(props.switchKey as string, newV);
});

const addBut = () => {
  if (partition.value === '') {
    ElMessage.warning('请输入分区名称');
    return;
  }
  if (partitionList.value.some((item: any) => item === partition.value)) {
    ElMessage.warning('该分区已存在');
    return;
  }
  if (partitionList.value.length >= 50) {
    ElMessage.warning('最多添加50个白名单分区，请移除不需要的分区再添加');
    return;
  }
  partitionList.value.push(partition.value);
  partition.value = '';
  save();
};
const delBut = (item: any) => {
  if (partitionList.value.some((someItem: any) => someItem === item)) {
    ElMessage.warning('该分区不存在');
    return;
  }
  partitionList.value = partitionList.value.filter((v: any) => v !== item);
  save();
};
const save = () => {
  GM_setValue(props.partitionListKey, partitionList.value);
  ElMessage.success(`保存${props.title}配置成功`);
};

partitionList.value = GM_getValue(props.partitionListKey, []);
switchVal.value = GM_getValue(props.switchKey, false);
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <gz-space>
        <span>{{ title }}</span>
        <el-switch v-model.lazy="switchVal" active-text="启用"/>
      </gz-space>
    </template>
    <el-input v-model.lazy.trim="partition" clearable style="width: 250px;"/>
    <el-button @click="addBut">添加</el-button>
    <gz-space wrap>
      <el-popconfirm v-for="item in showPartitionList" :key="item"
                     :title="`是要删除tag【${item}】吗？`"
                     @confirm="delBut(item)">
        <template #reference>
          <el-tag>{{ item }}</el-tag>
        </template>
      </el-popconfirm>
    </gz-space>
  </el-card>
</template>
