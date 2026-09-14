<script setup lang="ts">
import {nextTick, ref} from 'vue';
import {eventEmitter} from "@/core/EventEmitter.ts";
import ruleKeyListData from "../../config/ruleKeyListData.ts";
import arrUtil from "../../core/util/arrUtil.ts";
import {ElMessage, ElMessageBox} from 'element-plus';

//多重规则编辑对话框
const dialogVisible = ref(false);
const inputVisible = ref(false);
const inputValue = ref('');
//最小项
const min = 2;
const typeMap = ref<Record<string, any>>({});
const showTags = ref<any[]>([]);
const saveTagInput = ref<any>();

const filterTag = (tag: any) => {
  return tag.join('||');
};
const updateShowTags = () => {
  showTags.value = GM_getValue(typeMap.value.type, []);
};
const handleTagClose = (tag: any, index: number) => {
  if (tag === '') return;
  ElMessageBox.confirm(`确定要删除 ${tag} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    showTags.value.splice(index, 1);
    GM_setValue(typeMap.value.type, showTags.value);
    ElMessage.success(`已移除 ${tag}`);
    eventEmitter.send('刷新规则信息', false);
  });
};
const showInput = () => {
  inputVisible.value = true;
  nextTick(() => {
    // Element Plus 的 el-input 组件暴露 focus() 方法
    saveTagInput.value?.focus();
  });
};
const handleInputConfirm = () => {
  let input = inputValue.value;
  inputVisible.value = false;
  if (input === '') return;
  submitBut(input);
  inputValue.value = '';
};
const submitBut = (input: any) => {
  const split = input.split(',');
  if (split.length < min) {
    ElMessage.error('最少添加' + min + '项');
    return;
  }
  const preciseVideoTagArr = ruleKeyListData.getPreciseVideoTagArr();
  const videoTagArr = ruleKeyListData.getVideoTagArr();
  for (let showTag of split) {
    showTag = showTag.trim();
    if (showTag === "") {
      ElMessage.error('不能添加空项');
      return;
    }
    if (preciseVideoTagArr.includes(showTag)) {
      ElMessage.error('不能添加视频tag(精确匹配)已有的项，请先移除对应的项！');
      return;
    }
    if (videoTagArr.includes(showTag)) {
      ElMessage.error('不能添加视频tag(模糊匹配)已有的项，请先移除对应的项！');
      return;
    }
    if (showTag.length > 15) {
      ElMessage.error('项不能超过15个字符');
      return;
    }
  }
  const arr = GM_getValue(typeMap.value.type, [] as any[]);
  for (let mk_arr of arr) {
    if (arrUtil.arraysLooseEqual(mk_arr, split)) {
      ElMessage.error('不能重复添加已有的组合！');
      return;
    }
    if (arrUtil.arrayContains(mk_arr, split)) {
      ElMessage.error('该组合已添加过或包括该组合');
      return;
    }
  }
  arr.push(split);
  GM_setValue(typeMap.value.type, arr);
  console.log(typeMap.value, split, arr);
  ElMessage.success(`${typeMap.value.name}添加成功`);
  updateShowTags();
  eventEmitter.send('刷新规则信息', false);
};

eventEmitter.on('打开多重规则编辑对话框', (newTypeMap) => {
  typeMap.value = newTypeMap;
  dialogVisible.value = true;
  updateShowTags();
});
</script>
<template>
  <div>
    <el-dialog :close-on-click-modal="false" :close-on-press-escape="false"
               :modal="false"
               v-model="dialogVisible" title="多重规则">
      <el-tag>{{ typeMap.name }}</el-tag>
      <el-card>
        <template #header>说明</template>
        <div>1.组合类型每条项至少大于1</div>
        <div>2.不能添加空项</div>
        <div>3.每组中的项不能超过15个字符</div>
        <div>4.不能重复添加已有的组合</div>
        <div>5.每组不能添加过包括已有的组合</div>
        <div>6.不能添加视频tag(精确匹配)已有的项，如需要，请先移除对应的项！包括视频tag(模糊匹配)</div>
      </el-card>
      <el-card>
        <el-input
            v-if="inputVisible"
            ref="saveTagInput"
            v-model="inputValue"
            class="input-new-tag"
            placeholder="多个项时请用英文符号分割"
            size="small"
            @blur="handleInputConfirm"
            @keyup.enter="handleInputConfirm"
        >
        </el-input>
        <el-button v-else size="small" @click="showInput">+ New Tag</el-button>
        <el-tag v-for="(item,index) in showTags" :key="index" closable @close="handleTagClose(item,index)">
          {{ filterTag(item) }}
        </el-tag>
      </el-card>
    </el-dialog>
  </div>
</template>
