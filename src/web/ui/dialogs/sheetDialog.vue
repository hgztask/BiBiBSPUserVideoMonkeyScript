<script setup lang="ts">
import {ref} from 'vue';
import {eventEmitter} from "@/core/EventEmitter.ts";

/**
 * 选项对话框组件
 */
const visible = ref(false);
const optionsList = ref<any[]>([]);
const dialogTitle = ref('');
/**
 * 选项点击回调，返回 true 则不关闭对话框
 */
const optionsClick = ref<((item: any) => boolean | undefined | void) | null>(null);
const closeOnClickModal = ref(true);
const contents = ref<any[]>([]);

const handleClose = () => {
  visible.value = false;
  if (contents.value.length > 0) {
    contents.value = [];
  }
};
const handleOptionsClick = (item: any) => {
  if (closeOnClickModal.value) {
    return;
  }
  let tempBool: boolean;
  //如果回调函数返回true，则不关闭对话框，反之关闭对话框
  const temp = (optionsClick.value as any)(item);
  if (temp === undefined) {
    tempBool = false;
  } else {
    tempBool = temp;
  }
  visible.value = tempBool === true;
};

eventEmitter.on('sheet-dialog', ({
                                   list, optionsClick: click, title = '选项',
                                   closeOnClickModal: clickModal = false, contents: newContents
                                 }) => {
  visible.value = true;
  optionsList.value = list;
  dialogTitle.value = title;
  optionsClick.value = click;
  closeOnClickModal.value = clickModal;
  if (newContents) {
    contents.value = newContents;
  }
});
</script>
<template>
  <div>
    <el-dialog :close-on-click-modal="closeOnClickModal" :title="dialogTitle"
               v-model="visible" center
               width="30%"
               @close="handleClose">
      <div>
        <el-row>
          <el-col>
            <div v-for="v in contents" :key="v">{{ v }}</div>
          </el-col>
          <el-col v-for="item in optionsList" :key="item.label">
            <el-button :title="item.title" style="width: 100%" @click="handleOptionsClick(item)">{{
                item.label
              }}
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>
