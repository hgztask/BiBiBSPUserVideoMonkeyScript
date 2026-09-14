<script setup lang="ts">
import {ref} from 'vue';
import {eventEmitter} from "@/core/EventEmitter.ts";

//显示图片对话框
const show = ref(false);
const title = ref("图片查看");
const imgList = ref<any[]>([]);
const imgSrc = ref('');
const isModal = ref(true);

eventEmitter.on('显示图片对话框', ({image, title: newTitle, images, isModal: modal}) => {
  imgSrc.value = image;
  if (newTitle) {
    title.value = newTitle;
  }
  if (images) {
    imgList.value = images;
  } else {
    imgList.value = [image];
  }
  if (modal) {
    isModal.value = modal;
  }
  show.value = true;
});
</script>
<template>
  <div>
    <el-dialog
        :modal="isModal"
        :title="title"
        v-model="show"
        center>
      <div class="el-vertical-center">
        <el-image
            :preview-src-list="imgList" :src="imgSrc"/>
      </div>
    </el-dialog>
  </div>
</template>
