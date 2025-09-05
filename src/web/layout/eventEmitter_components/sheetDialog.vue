<script>
import {eventEmitter} from "../../model/EventEmitter.js";

/**
 * 选项对话框组件
 */
export default {
  data() {
    return {
      visible: false,
      optionsList: [],
      dialogTitle: '',
      /**
       * @type function
       * @returns boolean
       */
      optionsClick: null,
      closeOnClickModal: true,
      contents: []
    }
  },
  methods: {
    handleClose() {
      this.visible = false;
      if (this.contents.length > 0) {
        this.contents = [];
      }
    },
    handleOptionsClick(item) {
      if (this.closeOnClickModal) {
        return;
      }
      let tempBool;
      //如果回调函数返回true，则不关闭对话框，反之关闭对话框
      const temp = this.optionsClick(item);
      if (temp === undefined) {
        tempBool = false
      } else {
        tempBool = temp;
      }
      this.visible = tempBool === true;
    }
  },
  created() {
    eventEmitter.on('sheet-dialog', ({
                                       list, optionsClick, title = '选项',
                                       closeOnClickModal = false, contents
                                     }) => {
      this.visible = true
      this.optionsList = list
      this.dialogTitle = title
      this.optionsClick = optionsClick
      this.closeOnClickModal = closeOnClickModal
      if (contents) {
        this.contents = contents;
      }
      console.log(this);
    })
  }
}
</script>
<template>
  <div>
    <el-dialog :close-on-click-modal="closeOnClickModal" :title="dialogTitle"
               :visible="visible" center
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
