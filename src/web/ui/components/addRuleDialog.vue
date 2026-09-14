<script setup lang="ts">
import {ref, watch} from 'vue';
import ruleUtil from "../../core/util/ruleUtil.ts";
import {eventEmitter} from "@/core/EventEmitter.ts";
import {ElMessage, ElMessageBox} from 'element-plus';

const props = withDefaults(defineProps<{
  modelValue?: boolean;
  isNumerical?: boolean;
  ruleInfo?: Record<string, any>;
}>(), {
  modelValue: false,
  isNumerical: false,
  ruleInfo: () => {
    return {
      type: 'ruleInfo默认type值',
      name: 'ruleInfo默认name值'
    };
  }
});
const emit = defineEmits(['update:modelValue']);

const dialogTitle = ref('');
const dialogVisible = ref(false);
const inputVal = ref('');
const fragments = ref<any[]>([]);
const separator = ref(',');
const successAfterCloseVal = ref(true);

const closeHandle = () => {
  inputVal.value = '';
};
const addBut = () => {
  if (fragments.value.length === 0) {
    ElMessage.warning('未有分割项，请输入');
    return;
  }
  const {successList, failList} = ruleUtil.batchAddRule(fragments.value, props.ruleInfo.type);
  ElMessageBox.alert(`成功项${successList.length}个:${successList.join(separator.value)}\n
                失败项${failList.length}个:${failList.join(separator.value)}
                `, 'tip');
  if (successList.length > 0 && successAfterCloseVal.value) {
    dialogVisible.value = false;
  }
  if (successList.length > 0) {
    eventEmitter.emit('通知屏蔽');
  }
  eventEmitter.send('刷新规则信息');
};

watch(dialogVisible, (val) => {
  emit('update:modelValue', val);
});
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val;
});
watch(inputVal, (val: string) => {
  const list: any[] = [];
  for (let s of val.split(separator.value)) {
    if (s === "") continue;
    if (list.includes(s)) continue;
    s = s.trim();
    let item: any = s;
    if (props.isNumerical) {
      if (isNaN(s as any)) {
        continue;
      } else {
        item = parseInt(s);
      }
    }
    list.push(item);
  }
  fragments.value = list;
});
</script>

<template>
  <div>
    <el-dialog :close-on-click-modal="false" :close-on-press-escape="false"
               :title="'批量添加'+ruleInfo.name+'-'+ruleInfo.type" v-model="dialogVisible"
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
