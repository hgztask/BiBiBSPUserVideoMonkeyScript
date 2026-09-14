<script setup lang="ts">
import {ref} from 'vue';
import {eventEmitter} from "@/core/EventEmitter.ts";
import {ElMessage, ElMessageBox} from 'element-plus';

const dialogVisible = ref(false);
const typeMap = ref<Record<string, any>>({});
const showTags = ref<any[]>([]);

const updateShowRuleTags = () => {
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
const closedHandle = () => {
  typeMap.value = {};
  showTags.value.splice(0, showTags.value.length);
};

eventEmitter.on('event-lookRuleDialog', (newTypeMap) => {
  typeMap.value = newTypeMap;
  dialogVisible.value = true;
  updateShowRuleTags();
});
</script>
<template>
  <div>
    <el-dialog :close-on-click-modal="false" :close-on-press-escape="false"
               :fullscreen="true" :modal="false"
               v-model="dialogVisible"
               title="查看规则内容" @closed="closedHandle">
      <el-card>
        <template #header>规则信息</template>
        <el-tag>{{ typeMap.name + '|' + typeMap.type }}</el-tag>
        <el-tag>{{ showTags.length }}个</el-tag>
      </el-card>
      <el-card>
        <el-tag v-for="(item,index) in showTags" :key="index" closable @close="handleTagClose(item,index)">
          {{ item }}
        </el-tag>
      </el-card>
    </el-dialog>
  </div>
</template>
