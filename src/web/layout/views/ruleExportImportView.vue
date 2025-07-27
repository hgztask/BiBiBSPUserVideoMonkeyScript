<script>
import defUtil, {saveTextAsFile} from "../../utils/defUtil.js";
import ruleUtil from "../../utils/ruleUtil.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import ruleConversion from "../../model/ruleConversion.js";

//规则导入导出组件
export default {
  data() {
    return {
      //要导入的规则内容
      ruleContentImport: "",
      ruleReference: [
        {
          title: "旧版本规则参考",
          content: ` {"用户名黑名单模式(精确匹配)":["账号已注销"],"BV号黑名单模式(精确匹配)":[],
                        "用户名黑名单模式(模糊匹配)":["bili_","_bili"],"用户uid黑名单模式(精确匹配)":[442010132,76525078,225219967,3493283164588093],
                        "用户uid白名单模式(精确匹配)":[344490740,1861980711],"标题黑名单模式(模糊匹配)":["激励计划","蚌不住","手游激励","游戏活动打卡"],
                        "标题黑名单模式(正则匹配)":["感觉.*不如","不要笑.*挑战"],"评论关键词黑名单模式(模糊匹配)":["感觉不如","差不多的了"],
                        "评论关键词黑名单模式(正则匹配)":["这不.+吗","玩.*的","不要笑.*挑战"],"粉丝牌黑名单模式(精确匹配)":[],
                        "专栏关键词内容黑名单模式(模糊匹配)":[],"动态关键词内容黑名单模式(模糊匹配)":["拼多多","京东红包","京东618红包","618活动"]}`
        },
        {
          title: "新版本规则参考",
          content: "待补充"
        }
      ],
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
    //旧版本导入规则-覆盖
    overwriteImportRulesV1But() {
      this.$confirm('旧版本-是否导入规则？').then(() => {
        const trim = this.ruleContentImport.trim();
        if (ruleUtil.overwriteImportRulesV1(trim)) {
          this.$message('已导入成功！')
          eventEmitter.send('刷新规则信息');
        }

      })
    },
    xtipAlertBut(content, title) {
      this.$alert(content, title)
    },
    ruleOldToNewBut() {
      ruleConversion.oldToNewRule()
      eventEmitter.send('刷新规则信息');
      this.$message('已转换成功！')
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
      <template #header>
        <el-row>
          <el-col :span="12">
            <div class="el-horizontal-left">导入规则</div>
          </el-col>
          <el-col :span="12">
            <div class="el-horizontal-right">
              <el-button v-for="item in ruleReference" :key="item.title"
                         @click="xtipAlertBut(item.content,item.title)">
                {{ item.title }}
              </el-button>
            </div>
          </el-col>
        </el-row>
      </template>
      <div>规则内容请在下面编辑框中导入</div>
      <div>旧版本的需要使用下面的v1旧版本导入规则</div>
      <div>旧版本的只能覆盖导入</div>
      <div>v1之后的版本可以选择覆盖和追加</div>
      <div>旧规则转新规则，用于2.0之前版本升上来旧规则内容丢失问题</div>
      <el-divider/>
      <div>
        <el-button @click="inputFIleRuleBut">读取外部规则文件</el-button>
        <el-button @click="overwriteImportRulesBut">覆盖导入规则</el-button>
        <el-button @click="appendImportRulesBut">追加导入规则</el-button>
        <el-button @click="overwriteImportRulesV1But">v1旧版本覆盖导入规则</el-button>
        <el-button @click="ruleOldToNewBut">旧规则自动转新规则</el-button>
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
