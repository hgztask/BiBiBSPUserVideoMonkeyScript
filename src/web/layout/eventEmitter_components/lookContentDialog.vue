<script>
import {eventEmitter} from "../../model/EventEmitter.js";

export default {
  data() {
    return {
      dialogVisible: false,
      content: ''
    }
  },
  methods: {
    handleClose(done) {
      this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {
          });
    }
  },
  created() {
    eventEmitter.on('展示内容对话框', (newContent) => {
      this.content = newContent
      this.$message('已更新内容')
      this.dialogVisible = true
    })
  }
}
</script>
<template>
  <div>
    <el-dialog
        :before-close="handleClose"
        :fullscreen="true"
        :visible.sync="dialogVisible"
        title="提示"
        width="30%">
      <el-input v-model="content"
                autosize
                type="textarea"></el-input>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
  </span>
    </el-dialog>

  </div>
</template>
