<script>
import {eventEmitter} from "../../model/EventEmitter.js";
import gmUtil from "../../utils/gmUtil.js";

//多重规则编辑对话框
export default {
  data() {
    return {
      dialogVisible: false,
      typeMap: {},
      showTags: [],
    }
  },
  methods: {
    updateShowRuleTags() {
      this.showTags = gmUtil.getData(this.typeMap.type, []);
    },
    handleTagClose(tag, index) {
      if (tag === '') return;
      this.$confirm(`确定要删除 ${tag} 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.showTags.splice(index, 1)
        gmUtil.setData(this.typeMap.type, this.showTags);
        this.$message.success(`已移除 ${tag}`)
        eventEmitter.send('刷新规则信息', false)
      })
    },
    closedHandle() {
      console.log('closed')
      this.typeMap = {}
      this.showTags.splice(0, this.showTags.length);
    }
  },
  created() {
    eventEmitter.on('event-lookRuleDialog', (typeMap) => {
      this.typeMap = typeMap;
      this.dialogVisible = true;
      this.updateShowRuleTags();
    })
  }
}
</script>
<template>
  <div>
    <el-dialog :close-on-click-modal="false" :close-on-press-escape="false"
               :fullscreen="true" :modal="false"
               @closed="closedHandle"
               :visible.sync="dialogVisible" title="查看规则内容">
      <el-card>
        <template #header>规则信息</template>
        <el-tag>{{ typeMap.name + '|' + typeMap.type }}</el-tag>
        <el-tag>{{ showTags.length }}个</el-tag>
      </el-card>
      <el-card>
        <el-tag v-for="(item,index) in showTags" :key="index" closable @close="handleTagClose(item,index)">
          {{ item }}
        </el-tag>
      </el-card>
    </el-dialog>
  </div>
</template>
