<script setup lang="ts">
import {ref, watch} from 'vue';
import {getExcludeURLsGm, isExcludeURLSwitchGm} from "@/state/localMKData.ts";
import {ElMessage} from 'element-plus';

const excludeURLSwitchVal = ref(isExcludeURLSwitchGm());
const data = ref(getExcludeURLsGm());
const testInputRegVal = ref("");
const testInputVal = ref('');

const tableAddItemBut = () => {
  data.value.push({state: false, regularURL: "", desc: ""});
};
const tableDelItemBut = (index: number) => {
  data.value.splice(index, 1);
};
const refreshBut = () => {
  data.value = getExcludeURLsGm();
  ElMessage.success("刷新成功");
};
const saveBut = () => {
  for (let v of data.value) {
    if (v.regularURL === "") {
      ElMessage.error("正则地址不能为空");
      return;
    }
  }
  GM_setValue("exclude_urls_gm", data.value);
  ElMessage.success("保存成功");
};
const tableVerificationItemUrlBut = (url: string) => {
  if (window.location.href.search(url) !== -1) {
    ElMessage.success('匹配成功！');
  } else {
    ElMessage.warning('匹配失败！');
  }
};
const testVerificationBut = () => {
  const inputVal = testInputVal.value;
  const inputRegVal = testInputRegVal.value;
  if (inputVal.length === 0 || inputRegVal.length === 0) {
    ElMessage.warning('请正确填写内容');
    return;
  }
  if (inputVal.search(inputRegVal) !== -1) {
    ElMessage.success('匹配成功！');
  } else {
    ElMessage.warning('匹配失败！');
  }
};

watch(excludeURLSwitchVal, (n) => {
  GM_setValue("is_exclude_url_switch_gm", n);
});
</script>

<template>
  <div>
    <el-card shadow="never">
      <template #header>说明</template>
      <el-row>
        <el-col :span="12">
          <div>1.被排除的页面大部分功能会失效</div>
          <div>2.修改后建议刷新页面</div>
          <el-switch v-model="excludeURLSwitchVal" active-text="启用设置"/>
        </el-col>
        <el-col :span="12">
          <el-input v-model.trim="testInputRegVal">
            <template #prepend>正则地址</template>
          </el-input>
          <el-input v-model.trim="testInputVal">
            <template #prepend>测试地址</template>
          </el-input>
          <div class="el-horizontal-right">
            <el-button @click="testVerificationBut">测试验证</el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <el-table :data="data" border stripe>
      <el-table-column label="启用" width="100">
        <template #default="scope">
          <el-switch v-model="scope.row.state"/>
        </template>
      </el-table-column>
      <el-table-column label="正则地址">
        <template #default="scope">
          <el-input v-model.trim="scope.row.regularURL"/>
        </template>
      </el-table-column>
      <el-table-column label="描述">
        <template #default="scope">
          <el-input v-model.trim="scope.row.desc"/>
        </template>
      </el-table-column>
      <el-table-column align="center" width="300">
        <template #header>
          <el-button @click="tableAddItemBut">添加</el-button>
          <el-button @click="refreshBut">刷新</el-button>
          <el-button type="success" @click="saveBut">保存</el-button>
        </template>
        <template #default="scope">
          <el-tooltip content="以当前网页url用于验证匹配结果">
            <el-button @click="tableVerificationItemUrlBut(scope.row.regularURL)">验证当前Url</el-button>
          </el-tooltip>
          <el-button type="danger" @click="tableDelItemBut(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
