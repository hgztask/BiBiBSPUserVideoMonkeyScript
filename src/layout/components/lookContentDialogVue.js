import {eventEmitter} from "../../model/EventEmitter.js";

export const look_content_dialog_vue = {
    template: `
      <div>
      <el-dialog
          :fullscreen="true"
          title="提示"
          :visible.sync="dialogVisible"
          width="30%"
          :before-close="handleClose">
        <el-input autosize
                  type="textarea"
                  v-model="content"></el-input>
        <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
  </span>
      </el-dialog>

      </div>`,
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
