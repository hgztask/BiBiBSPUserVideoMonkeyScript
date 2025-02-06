import {eventEmitter} from "../../model/EventEmitter.js";

/**
 * 显示图片对话框
 */
export const show_img_dialog_vue = {
    template: `
      <div>
      <el-dialog
          center
          :title="title"
          :modal="isModal"
          :visible.sync="show">
        <div class="el-vertical-center">
          <el-image
              :src="imgSrc" :preview-src-list="imgList"/>
        </div>
      </el-dialog>
      </div>`,
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
