<script setup lang="ts">
import {ref, watch} from 'vue';
import {
  enableReplacementProcessing,
  getSubstituteWordsArr,
  isClearCommentEmoticons,
  isReplaceCommentSearchTerms
} from "@/state/localMKData.ts";
import {ElMessage, ElMessageBox, ElNotification} from 'element-plus';

/**
 * 内容替换处理布局组件
 */
const tableData = ref<any[]>(getSubstituteWordsArr());
const enableReplacementProcessingVal = ref(enableReplacementProcessing());
const clearCommentEmoticonsVal = ref(isClearCommentEmoticons());
const isReplaceCommentSearchTermsVal = ref(isReplaceCommentSearchTerms());

//验证
const validate = (item: any) => {
  if (item.actionScopes.length === 0) {
    ElMessage.error('请选择作用域再后续处理');
    return;
  }
  if (item.findVal === '') {
    ElMessage.error('请输入查找内容再后续处理');
    return;
  }
  return true;
};
const verifyDuplicate = (val: any) => {
  if (val === '') return;
  const set = new Set();
  for (const v of tableData.value) {
    if (set.has(v.findVal)) {
      ElMessageBox.alert(`已添加过该查找值，不可重复添加【${v.findVal}】`, '错误', {
        type: 'error'
      });
      return;
    }
    set.add(v.findVal);
  }
};
const addBut = () => {
  tableData.value.unshift({
    actionScopes: ['评论内容'],
    findVal: '',
    replaceVal: ''
  });
  ElNotification({title: '', message: '已添加一条替换处理到顶部'});
};
const delItemBut = (row: any, index: number) => {
  if (row.findVal === '' && row.replaceVal === '') {
    tableData.value.splice(index, 1);
    ElNotification({title: '', message: '已删除一条替换处理'});
    return;
  }
  if (validate(row) !== true) return;
  ElMessageBox.confirm('确定删除该条替换处理吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tableData.value.splice(index, 1);
    ElNotification({title: '', message: '已删除一条替换处理'});
  });
};
const refreshBut = () => {
  tableData.value = getSubstituteWordsArr();
  ElMessage.info('已刷新');
};
const saveBut = () => {
  if (tableData.value.length === 0) {
    ElMessage.error('请先添加数据再保存！');
    return;
  }
  for (let item of tableData.value) {
    if (validate(item) !== true) return;
  }
  const duplicateRemoval = new Set();
  for (const v of tableData.value) {
    if (duplicateRemoval.has(v.findVal)) {
      ElMessageBox.alert(`查找内容不能重复【${v.findVal}】`, '错误', {
        type: 'error'
      });
      return;
    }
    duplicateRemoval.add(v.findVal);
  }
  GM_setValue('substitute_words', tableData.value);
  ElMessage.success('已保存');
};
const actionScopesChange = (newArr: any) => {
  if (newArr.length === 0) return;
  if (newArr.some((v: any) => v === '评论表情')) {
    newArr.splice(0, newArr.length, '评论表情');
  }
};

watch(clearCommentEmoticonsVal, (n) => {
  GM_setValue('is_clear_comment_emoticons', n);
});
watch(isReplaceCommentSearchTermsVal, (n) => {
  GM_setValue('is_replace_comment_search_terms', n);
});
</script>

<template>
  <div>
    <el-card shadow="never">
      <template #header>说明
        <el-row>
          <el-col :span="12">
            <div>1.评论内容暂不支持替换表情</div>
            <div>2.如修改后或添加数据需保存方可生效</div>
            <div>3.暂不支持标题替换</div>
            <div>4.支持正则替换，
              <el-link
                  href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll"
                  target="_blank"
                  type="primary">
                详情参考js中的replaceAll用法
              </el-link>
            </div>
            <div>5.搜索暂时先用快捷键ctrl+f代替</div>
            <div>6.作用域中，选择了评论表情再选其他之前需要取消选项评论表情</div>
            <div>7.评论表情，查找时要用英文输入法[]包裹表情关键词，留空为评论中移除该表情。反之替换普通文本内容。
              <el-link href="https://docs.qq.com/doc/DSlJNR1NVcGR3eEto" target="_blank"
                       title="页面中用搜索定位表情包对照表" type="primary">表情包对照表
              </el-link>
            </div>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never">
              <template #header>全局</template>
              <el-tooltip content="当该选项未启用时下面表格中的不生效">
                <el-switch v-model="enableReplacementProcessingVal" active-text="启用"/>
              </el-tooltip>
              <el-switch v-model="clearCommentEmoticonsVal" active-text="清除评论表情"/>
              <el-tooltip content="将评论中的蓝色关键词带搜索小图标的内容替换成普通文本内容">
                <el-switch v-model="isReplaceCommentSearchTermsVal" active-text="替换评论搜索词"/>
              </el-tooltip>
            </el-card>
          </el-col>
        </el-row>
      </template>
    </el-card>
    <el-table :data="tableData" border stripe>
      <el-table-column label="作用域" width="450px">
        <template #default="scope">
          <el-checkbox-group v-model="scope.row.actionScopes" @change="actionScopesChange">
            <el-checkbox border disabled value="视频标题">视频标题</el-checkbox>
            <el-checkbox border value="评论内容">评论内容</el-checkbox>
            <el-checkbox border value="评论表情">评论表情</el-checkbox>
          </el-checkbox-group>
        </template>
      </el-table-column>
      <el-table-column label="查找">
        <template #default="scope">
          <el-input v-model="scope.row.findVal" clearable maxlength="10" @change="verifyDuplicate"/>
        </template>
      </el-table-column>
      <el-table-column label="替换">
        <template #default="scope">
          <el-input v-model="scope.row.replaceVal" clearable maxlength="10"/>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #header>
          <el-button @click="addBut">添加</el-button>
          <el-button @click="refreshBut">刷新</el-button>
          <el-button type="success" @click="saveBut">保存</el-button>
        </template>
        <template #default="scope">
          <el-button type="warning" @click="delItemBut(scope.row,scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
