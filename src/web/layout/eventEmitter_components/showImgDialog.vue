<script>
import {eventEmitter} from "../../model/EventEmitter.js";
//显示图片对话框
export default {
  data() {
    return {
      show: false,
      title: "图片查看",
      imgList: [],
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
}
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
