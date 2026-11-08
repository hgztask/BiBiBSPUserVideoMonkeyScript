<script setup lang="ts">
import {reactive, ref} from 'vue';
import defUtil, {saveTextAsFile} from "../../../core/util/defUtil.ts";
import ruleUtil from "@/core/util/ruleUtil.ts";
import {eventEmitter} from "@/core/EventEmitter.ts";
import ruleKeyListData from "../../../config/ruleKeyListData.ts";
import {ElMessage, ElMessageBox} from 'element-plus';
import backupSnapshot from '@/core/backup/backupSnapshot.ts';
import backupKeys from '@/core/backup/backupKeys.ts';
import remoteBackupView from './remoteBackupView.vue';

//规则导入导出组件
//要导入的规则内容
const ruleContentImport = ref("");
const ruleKeyCount = backupKeys.allRuleKeys().length;
const select = reactive({
  val: [] as any[],
  options: [] as any[],
});
const file = ref<HTMLInputElement>();

const getSelectValRuleContent = () => {
  const val = select.val;
  if (val.length === 0) return false;
  const map: Record<string, any> = {};
  for (const valKey of val) {
    const find = select.options.find(item => item.key === valKey);
    if (find === undefined) continue;
    const {key} = find;
    const ruleItemList = GM_getValue(key, []);
    if (ruleItemList.length === 0) continue;
    map[key] = ruleItemList;
  }
  if (Object.keys(map).length === 0) {
    ElMessage.warning(`选定的规则类型都为空`);
    return false;
  }
  return map;
};
//覆盖导入规则
const overwriteImportRulesBut = () => {
  ElMessageBox.confirm('是否要覆盖导入规则？').then(() => {
    const trim = ruleContentImport.value.trim();
    if (ruleUtil.overwriteImportRules(trim)) {
      ElMessageBox.alert('已覆盖导入成功！');
      eventEmitter.send('刷新规则信息');
    }
  });
};
//追加导入规则
const appendImportRulesBut = () => {
  ElMessageBox.confirm('是否要追加导入规则？').then(() => {
    const trim = ruleContentImport.value.trim();
    if (ruleUtil.appendImportRules(trim)) {
      ElMessage('已追加导入成功！');
      eventEmitter.send('刷新规则信息');
    }
  });
};
const handleFileUpload = (event: any) => {
  defUtil.handleFileReader(event).then(data => {
    const {content} = data;
    try {
      JSON.parse(content);
    } catch (e) {
      ElMessage('文件内容有误');
      return;
    }
    ruleContentImport.value = content;
    ElMessage('读取到内容，请选择导入方式');
  });
};
const inputFIleRuleBut = () => {
  file.value!.click();
};
const outToInputBut = () => {
  ruleContentImport.value = ruleUtil.getRuleContent() as string;
  ElMessage('已导出到输入框中');
};
const ruleOutToFIleBut = () => {
  const map = getSelectValRuleContent();
  if (map === false) return;
  ElMessageBox.prompt('请输入文件名', '保存为', {
    inputValue: "b站屏蔽器规则-指定类型-" + defUtil.toTimeString()
  }).then(({value}: any) => {
    if (value === "" && value.includes(' ')) {
      ElMessageBox.alert('文件名不能为空或包含空格');
      return;
    }
    saveTextAsFile(JSON.stringify(map, null, 4), value + '.json');
  });
};
const basisRuleOutToFIleBut = () => {
  let fileName = "b站屏蔽器规则-" + defUtil.toTimeString();
  ElMessageBox.prompt('请输入文件名', '保存为', {
    inputValue: fileName
  }).then(({value}: any) => {
    if (value === "" && value.includes(' ')) {
      ElMessageBox.alert('文件名不能为空或包含空格');
      return;
    }
    saveTextAsFile(ruleUtil.getRuleContent(true, 4) as string, value + ".json");
  });
};
const ruleOutToConsoleBut = () => {
  const map = getSelectValRuleContent();
  if (map === false) return;
  console.log(map);
  ElMessage.info('已导出到控制台上，F12打开控制台查看');
};
const basisRuleOutToConsoleBut = () => {
  console.log(ruleUtil.getRuleContent(false));
  ElMessage('已导出到控制台上，F12打开控制台查看');
};
//导出全量备份文件（含格式版本与全部规则key，空类型也保留）
const backupOutToFileBut = async () => {
  const snapshot = await backupSnapshot.buildSnapshot();
  const text = JSON.stringify(snapshot, null, 4);
  ElMessageBox.prompt('请输入文件名', '导出备份', {
    inputValue: "b站屏蔽器规则备份-" + defUtil.toTimeString()
  }).then(({value}: any) => {
    if (value === "" || value.includes(' ')) {
      ElMessageBox.alert('文件名不能为空或包含空格');
      return;
    }
    saveTextAsFile(text, value + '.json');
  }).catch(() => {
  });
};
//预览导入当前编辑框/文件中的备份内容
const backupImportPreviewBut = () => {
  const trim = ruleContentImport.value.trim();
  if (!trim) {
    ElMessage.warning('请先读取外部文件或粘贴备份内容');
    return;
  }
  const parsed = backupSnapshot.parseSnapshot(trim);
  if (parsed === null) {
    ElMessage.error('备份内容有误，无法解析');
    return;
  }
  const rules = parsed.snapshot.data.rules;
  if (Object.keys(rules).length === 0) {
    ElMessage.warning('备份内容为空');
    return;
  }
  eventEmitter.send('备份导入预览对话框', {
    title: '备份导入预览',
    rules,
    source: parsed.source === 'backup' ? `备份格式 v${parsed.snapshot.schemaVersion}` : '旧版规则格式',
    unknownKeys: parsed.unknownKeys,
    invalidCounts: parsed.invalidCounts
  });
};

for (const v of ruleKeyListData.getRuleKeyListData()) {
  select.options.push(v);
}
</script>

<template>
  <div>
    <remoteBackupView/>
    <el-card shadow="never">
      <template #header>
        <span>规则备份（推荐）</span>
      </template>
      <div>备份包含全部规则类型（{{ ruleKeyCount }} 个 key），未使用的类型也会保留，恢复时可精确覆盖；兼容旧版扁平规则文件。</div>
      <div style="margin-top: 8px;">
        <el-button type="primary" @click="backupOutToFileBut">导出备份文件</el-button>
        <el-button @click="inputFIleRuleBut">读取外部备份文件</el-button>
        <el-button @click="backupImportPreviewBut">预览导入编辑框内容</el-button>
      </div>
    </el-card>
    <el-card shadow="never">
      <template #header>
        <span>导出基础规则</span>
      </template>
      <el-button @click="basisRuleOutToFIleBut">导出文件</el-button>
      <el-button @click="outToInputBut">导出编辑框</el-button>
      <el-button @click="basisRuleOutToConsoleBut">导出控制台</el-button>
    </el-card>
    <el-card shadow="never">
      <template #header>导出指定规则</template>
      <el-select v-model="select.val" clearable filterable multiple placeholder="请选择导出规则类型">
        <el-option
            v-for="item in select.options"
            :key="item.key"
            :label="item.name"
            :value="item.key">
        </el-option>
      </el-select>
      <el-button @click="ruleOutToFIleBut">导出文件</el-button>
      <el-button @click="ruleOutToConsoleBut">导出控制台</el-button>
    </el-card>
    <el-card shadow="never">
      <template #header>导入规则</template>
      <div>仅支持json格式内容导入,且最外层为对象(花括号)</div>
      <div>内容格式为{key: [规则列表]}</div>
      <div>可以只导入指定类型规则，最外层需为对象，key为规则的内部key，value为规则列表</div>
      <el-divider/>
      <div>
        <el-button @click="inputFIleRuleBut">读取外部规则文件</el-button>
        <el-button @click="overwriteImportRulesBut">覆盖导入规则</el-button>
        <el-button @click="appendImportRulesBut">追加导入规则</el-button>
      </div>
      <el-divider/>
      <div>
        <el-input v-model="ruleContentImport"
                  :autosize="{ minRows: 10, maxRows: 50}"
                  placeholder="要导入的规则内容" type="textarea"></el-input>
      </div>
    </el-card>
    <input ref="file" accept="application/json" style="display: none" type="file"
           @change="handleFileUpload">
  </div>
</template>
