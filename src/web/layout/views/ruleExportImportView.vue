<script>
import defUtil, {saveTextAsFile} from "../../utils/defUtil.js";
import ruleUtil from "../../utils/ruleUtil.js";
import {eventEmitter} from "../../model/EventEmitter.js";

//规则导入导出组件
export default {
  data() {
    return {
      //要导入的规则内容
      ruleContentImport: ""
    }
  },
  methods: {
    //覆盖导入规则
    overwriteImportRulesBut() {
      this.$confirm('是否要覆盖导入规则？').then(() => {
        const trim = this.ruleContentImport.trim();
        if (ruleUtil.overwriteImportRules(trim)) {
          this.$alert('已覆盖导入成功！')
          eventEmitter.send('刷新规则信息');
        }
      })
    },
    //追加导入规则
    appendImportRulesBut() {
      this.$confirm('是否要追加导入规则？').then(() => {
        const trim = this.ruleContentImport.trim();
        if (ruleUtil.appendImportRules(trim)) {
          this.$message('已追加导入成功！')
          eventEmitter.send('刷新规则信息');
        }
      })
    },
    handleFileUpload(event) {
      defUtil.handleFileReader(event).then(data => {
        const {content} = data;
        try {
          JSON.parse(content);
        } catch (e) {
          this.$message('文件内容有误')
          return;
        }
        this.ruleContentImport = content;
        this.$message('读取到内容，请按需覆盖或追加')
      })
    },
    inputFIleRuleBut() {
      this.$refs.file.click()
    },
    outToInputBut() {
      this.ruleContentImport = ruleUtil.getRuleContent(2);
      this.$message('已导出到输入框中')
    },
    ruleOutToFIleBut() {
      let fileName = "b站屏蔽器规则-" + defUtil.toTimeString();
      this.$prompt('请输入文件名', '保存为', {
        inputValue: fileName
      }).then(({value}) => {
        if (value === "" && value.includes(' ')) {
          this.$alert('文件名不能为空或包含空格')
          return
        }
        saveTextAsFile(ruleUtil.getRuleContent(4), value + ".json");
      })

    },
    ruleOutToConsoleBut() {
      console.log(ruleUtil.getRuleContent());
      this.$message('已导出到控制台上，F12打开控制台查看')
    },
  },
}
</script>

<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <span>导出规则</span>
      </template>
      <el-button @click="ruleOutToFIleBut">导出到文件</el-button>
      <el-button @click="outToInputBut">导出到编辑框</el-button>
      <el-button @click="ruleOutToConsoleBut">导出到控制台</el-button>
    </el-card>
    <el-card shadow="never">
      <template #header>导入规则</template>
      <div>规则内容请在下面编辑框中导入</div>
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
                  autosize placeholder="要导入的规则内容" type="textarea"></el-input>
      </div>
    </el-card>
    <input ref="file" accept="application/json" style="display: none" type="file"
           @change="handleFileUpload">
  </div>
</template>
