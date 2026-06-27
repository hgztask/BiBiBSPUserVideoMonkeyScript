<script lang="ts">
import {defineComponent} from 'vue';
import {eventEmitter} from "@/core/EventEmitter.ts";

export default defineComponent({
  data() {
    return {
      dialogVisible: false,
      content: ''
    }
  },
  methods: {
    handleClose(done: any) {
      this.$confirm('确认关闭？')
          .then((_: any) => {
            done();
          })
          .catch((_: any) => {
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
})
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
