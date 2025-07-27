<script>
import {eventEmitter} from "../../model/EventEmitter.js";
import gmUtil from "../../utils/gmUtil.js";
import ruleUtil from "../../utils/ruleUtil.js";

/**
 * 显示修改规则的对话框
 */
export default {
  data() {
    return {
      show: false,
      ruleType: "",
      ruleName: "",
      oldVal: '',
      newVal: ''
    }
  },
  methods: {
    okBut() {
      let tempOldVal = this.oldVal.trim();
      let tempNewVal = this.newVal.trim();
      if (tempOldVal.length === 0 || tempNewVal.length === 0) {
        this.$alert("请输入要修改的值或新值");
        return
      }
      if (tempNewVal === tempOldVal) {
        this.$alert("新值不能和旧值相同")
        return;
      }
      const tempRuleType = this.ruleType;
      if (tempRuleType === 'precise_uid' || tempRuleType === 'precise_uid_white') {
        // uid需要转换成数字
        tempOldVal = parseInt(tempOldVal);
        tempNewVal = parseInt(tempNewVal);
        if (isNaN(tempOldVal) || isNaN(tempNewVal)) {
          this.$alert("请输入整数数字");
          return
        }
      }
      if (!ruleUtil.findRuleItemValue(tempRuleType, tempOldVal)) {
        this.$alert("要修改的值不存在");
        return;
      }
      if (ruleUtil.findRuleItemValue(tempRuleType, tempNewVal)) {
        this.$alert("新值已存在");
        return;
      }
      const ruleArr = gmUtil.getData(tempRuleType, []);
      const indexOf = ruleArr.indexOf(tempOldVal);
      ruleArr[indexOf] = tempNewVal;
      gmUtil.setData(tempRuleType, ruleArr);
      this.$alert(`已将旧值【${tempOldVal}】修改成【${tempNewVal}】`)
      this.show = false
    }
  },
  watch: {
    show(newVal) {
      // 关闭对话框时重置数据
      if (newVal === false) this.oldVal = this.newVal = '';
    }
  },
  created() {
    eventEmitter.on('修改规则对话框', ({type, name}) => {
      this.show = true;
      this.ruleType = type;
      this.ruleName = name
    });
  }
}
</script>
<template>
  <div>
    <el-dialog :close-on-click-modal="false" :modal="false" :visible="show"
               title="修改单项规则值" width="30%">
      {{ ruleName }}-{{ ruleType }}
      <el-form>
        <el-form-item label="要修改的值">
          <el-input v-model="oldVal" clearable type="text"/>
        </el-form-item>
        <el-form-item label="修改后的值">
          <el-input v-model="newVal" clearable/>
        </el-form-item>
      </el-form>
      <template #footer class="dialog-footer">
        <el-button @click="show=false">取消</el-button>
        <el-button @click="okBut">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
