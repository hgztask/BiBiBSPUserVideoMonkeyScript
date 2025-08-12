<script>
import ruleUtil from "../../utils/ruleUtil.js";
import {eventEmitter} from "../../model/EventEmitter.js";

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
  data: () => {
    return {
      dialogTitle: '',
      dialogVisible: false,
      inputVal: '',
      fragments: [],
      separator: ',',
      successAfterCloseVal: true
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
      if (successList.length > 0 && this.successAfterCloseVal) {
        this.dialogVisible = false
      }
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
  }
}
</script>

<template>
  <div>
    <el-dialog :close-on-click-modal="false" :close-on-press-escape="false"
               :title="'批量添加'+ruleInfo.name+'-'+ruleInfo.type" :visible.sync="dialogVisible"
               @close="closeHandle">
      <el-card shadow="never">
        <el-row>
          <el-col :span="8">
            <div>1.分割项唯一，即重复xxx，只算1个</div>
            <div>2.uid类时，非数字跳过</div>
            <div>3.空项跳过</div>
          </el-col>
          <el-col :span="16">
            <el-input v-model="separator" style="width: 200px">
              <template #prepend>分隔符</template>
            </el-input>
            <el-switch v-model="successAfterCloseVal" active-text="添加成功后关闭对话框"/>
          </el-col>
        </el-row>
      </el-card>
      <el-form>
        <el-form-item v-show="fragments.length!==0" label="分割项">
          <el-card shadow="never">
            <template #header>数量:
              <el-tag>{{ fragments.length }}</el-tag>
            </template>
            <el-tag v-for="v in fragments" :key="v" style="margin-left: 5px;">{{ v }}</el-tag>
          </el-card>
        </el-form-item>
        <el-form-item label="输入项">
          <el-input v-model="inputVal" type="textarea"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addBut">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>
