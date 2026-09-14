<script setup lang="ts">
import {ref, watch} from 'vue';
import {eventEmitter} from "@/core/EventEmitter.ts";
import ruleUtil from "../../core/util/ruleUtil.ts";
import {ElMessageBox} from 'element-plus';

/**
 * 显示修改规则的对话框
 */
const show = ref(false);
const ruleType = ref("");
const ruleName = ref("");
const oldVal = ref('');
const newValRef = ref('');

const okBut = () => {
  let tempOldVal: any = oldVal.value.trim();
  let tempNewVal: any = newValRef.value.trim();
  if (tempOldVal.length === 0 || tempNewVal.length === 0) {
    ElMessageBox.alert("请输入要修改的值或新值");
    return;
  }
  if (tempNewVal === tempOldVal) {
    ElMessageBox.alert("新值不能和旧值相同");
    return;
  }
  const tempRuleType = ruleType.value;
  if (ruleUtil.isRuleIntType(tempRuleType)) {
    // uid需要转换成数字
    tempOldVal = parseInt(tempOldVal);
    tempNewVal = parseInt(tempNewVal);
    if (isNaN(tempOldVal) || isNaN(tempNewVal)) {
      ElMessageBox.alert("请输入整数数字");
      return;
    }
  }
  if (!ruleUtil.findRuleItemValue(tempRuleType, tempOldVal)) {
    ElMessageBox.alert("要修改的值不存在");
    return;
  }
  if (ruleUtil.findRuleItemValue(tempRuleType, tempNewVal)) {
    ElMessageBox.alert("新值已存在");
    return;
  }
  const ruleArr = GM_getValue(tempRuleType, [] as any[]);
  const indexOf = ruleArr.indexOf(tempOldVal);
  ruleArr[indexOf] = tempNewVal;
  GM_setValue(tempRuleType, ruleArr);
  ElMessageBox.alert(`已将旧值【${tempOldVal}】修改成【${tempNewVal}】`);
  show.value = false;
};

watch(show, (newShow) => {
  // 关闭对话框时重置数据
  if (newShow === false) {
    oldVal.value = '';
    newValRef.value = '';
  }
});

eventEmitter.on('修改规则对话框', ({type, name}) => {
  show.value = true;
  ruleType.value = type;
  ruleName.value = name;
});
</script>
<template>
  <div>
    <el-dialog :close-on-click-modal="false" :modal="false" v-model="show"
               title="修改单项规则值" width="30%">
      {{ ruleName }}-{{ ruleType }}
      <el-form>
        <el-form-item label="要修改的值">
          <el-input v-model="oldVal" clearable type="text"/>
        </el-form-item>
        <el-form-item label="修改后的值">
          <el-input v-model="newValRef" clearable/>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="show=false">取消</el-button>
          <el-button @click="okBut">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
