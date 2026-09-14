<script setup lang="ts">
import {ref} from 'vue';
import {eventEmitter} from "@/core/EventEmitter.ts";
import {ElMessage, ElMessageBox} from 'element-plus';

const dialogVisible = ref(false);
const content = ref('');

const handleClose = (done: () => void) => {
  ElMessageBox.confirm('确认关闭？')
      .then((_: any) => {
        done();
      })
      .catch((_: any) => {
      });
};

eventEmitter.on('展示内容对话框', (newContent: string) => {
  content.value = newContent;
  ElMessage('已更新内容');
  dialogVisible.value = true;
});
</script>
<template>
  <div>
    <el-dialog
        :before-close="handleClose"
        :fullscreen="true"
        v-model="dialogVisible"
        title="提示"
        width="30%">
      <el-input v-model="content"
                autosize
                type="textarea"></el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
