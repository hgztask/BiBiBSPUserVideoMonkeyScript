import ruleUtil from "../../../utils/ruleUtil.js";
import {eventEmitter} from "../../../model/EventEmitter.js";

export default {
    props: {
        value: {
            type: Boolean,
            default: false
        },
        isNumerical: {
            type: Boolean,
            default: false
        },
        ruleInfo: {
            type: Object,
            default: () => {
                return {
                    type: 'ruleInfo默认type值',
                    name: 'ruleInfo默认name值'
                }
            }
        }
    },
    template: `
      <div>
        <el-dialog :visible.sync="dialogVisible" @close="closeHandle"
                   :close-on-press-escape="false" :close-on-click-modal="false"
                   :title="'批量添加'+ruleInfo.name+'-'+ruleInfo.type">
          <el-card shadow="never">
            <div>1.分割项唯一，即重复xxx，只算1个</div>
            <div>2.uid类时，非数字跳过</div>
            <div>3.空项跳过</div>
          </el-card>
          <el-form>
            <el-form-item label="分割项" v-show="fragments.length!==0">
              <el-card shadow="never">
                <template #header>数量:
                  <el-tag>{{ fragments.length }}</el-tag>
                </template>
                <el-tag v-for="v in fragments" :key="v" style="margin-left: 5px;">{{ v }}</el-tag>
              </el-card>
            </el-form-item>
            <el-form-item label="分隔符">
              <el-input v-model="separator"></el-input>
            </el-form-item>
            <el-form-item label="输入项">
              <el-input type="textarea" v-model="inputVal"></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="addBut">添加</el-button>
          </template>
        </el-dialog>
      </div>`,
    data: () => {
        return {
            dialogTitle: '',
            dialogVisible: false,
            inputVal: '',
            fragments: [],
            separator: ','
        }
    },
    methods: {
        closeHandle() {
            this.inputVal = '';
        },
        addBut() {
            if (this.fragments.length === 0) {
                this.$message.warning('未有分割项，请输入')
                return
            }
            const {successList, failList} = ruleUtil.batchAddRule(this.fragments, this.ruleInfo.type)
            this.$alert(`成功项${successList.length}个:${successList.join(this.separator)}\n
                失败项${failList.length}个:${failList.join(this.separator)}
                `, 'tip')
            eventEmitter.send('刷新规则信息');
        }
    },
    watch: {
        dialogVisible(val) {
            this.$emit('input', val)
        },
        value(val) {
            this.dialogVisible = val
        },
        inputVal(val) {
            const list = []
            for (let s of val.split(this.separator)) {
                if (s === "") continue;
                if (list.includes(s)) continue;
                s = s.trim()
                if (this.isNumerical) {
                    if (isNaN(s)) {
                        continue;
                    } else {
                        s = parseInt(s)
                    }
                }
                list.push(s)
            }
            this.fragments = list
        }
    },
}
