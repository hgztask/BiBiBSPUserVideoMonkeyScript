<script lang="ts">
import {defineComponent} from 'vue';
import {eventEmitter} from "../../core/EventEmitter.ts";
//显示图片对话框
export default defineComponent({
  data() {
    return {
      show: false,
      title: "图片查看",
      imgList: [] as any[],
      imgSrc: '',
      isModal: true
    }
  },
  created() {
    eventEmitter.on('显示图片对话框', ({image, title, images, isModal}) => {
      this.imgSrc = image
      if (title) {
        this.title = title
      }
      if (images) {
        this.imgList = images
      } else {
        this.imgList = [image]
      }
      if (isModal) {
        this.isModal = isModal
      }
      this.show = true
    })
  }
})
</script>
<template>
  <div>
    <el-dialog
        :modal="isModal"
        :title="title"
        :visible.sync="show"
        center>
      <div class="el-vertical-center">
        <el-image
            :preview-src-list="imgList" :src="imgSrc"/>
      </div>
    </el-dialog>
  </div>
</template>
