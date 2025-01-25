import ruleUtil from "../../../utils/ruleUtil.js";
import ruleConversion from "../../../model/ruleConversion.js";
import defUtil from "../../../utils/defUtil.js";
import {eventEmitter} from "../../../model/EventEmitter.js";

//规则导入导出组件
export default {
    template: `
      <div>
      <el-row>
        <el-col :span="20">
          <div>
            <h2>导出规则</h2>
            <button gz_type @click="ruleOutToFIleBut">导出到文件</button>
            <button gz_type @click="outToInputBut">导出到编辑框</button>
            <button gz_type @click="ruleOutToConsoleBut">导出到控制台</button>
          </div>
          <h2>导入规则</h2>
          <div>
            <ol>
              <li>规则内容请在下面编辑框中导入</li>
              <li>旧版本的需要使用下面的v1旧版本导入规则</li>
              <li>旧版本的只能覆盖导入</li>
              <li>v1之后的版本可以选择覆盖和追加</li>
              <li>旧规则转新规则，用于2.0之前版本升上来旧规则内容丢失问题</li>
            </ol>
          </div>
          <input ref="file" type="file" accept="application/json" @change="handleFileUpload"
                 style="display: none">
          <button gz_type @click="inputFIleRuleBut">读取外部规则文件</button>
          <button gz_type @click="overwriteImportRulesBut">覆盖导入规则</button>
          <button gz_type @click="appendImportRulesBut">追加导入规则</button>
          <button gz_type @click="overwriteImportRulesV1But">v1旧版本覆盖导入规则</button>
          <button gz_type @click="ruleOldToNewBut">旧规则自动转新规则</button>
          <div>
            <el-input autosize
                      :autosize="{ minRows: 2, maxRows: 50}"
                      type="textarea" v-model="ruleContentImport" placeholder="要导入的规则内容"></el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <div v-for="item in ruleReference">
            <button gz_type='info' @click="xtipAlertBut(item.content,item.title)">
              {{ item.title }}
            </button>
          </div>
        </el-col>
      </el-row>
      </div>`,
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
            xtip.confirm('是否要覆盖导入规则？', {
                icon: 'a',
                btn1: () => {
                    const trim = this.ruleContentImport.trim();
                    if (ruleUtil.overwriteImportRules(this.ruleKeyArr, trim)) {
                        xtip.msg('已覆盖导入成功！', {icon: 's'})
                        eventEmitter.emit('刷新规则信息', null);
                    }
                }
            })
        },
        //追加导入规则
        appendImportRulesBut() {
            xtip.confirm('是否要追加导入规则？', {
                icon: 'a',
                btn1: () => {
                    const trim = this.ruleContentImport.trim();
                    if (ruleUtil.appendImportRules(this.ruleKeyArr, trim)) {
                        xtip.msg('已追加导入成功！', {icon: 's'})
                        eventEmitter.emit('刷新规则信息', null);
                    }
                }
            })
        },
        //旧版本导入规则-覆盖
        overwriteImportRulesV1But() {
            xtip.confirm('旧版本-是否导入规则？', {
                icon: 'a',
                btn1: () => {
                    const trim = this.ruleContentImport.trim();
                    if (ruleUtil.overwriteImportRulesV1(trim)) {
                        xtip.msg('已导入成功！', {icon: 's'})
                        eventEmitter.emit('刷新规则信息', null);
                    }
                }
            })
        },
        xtipAlertBut(content, title) {
            this.$alert(content, title)
        },
        ruleOldToNewBut() {
            ruleConversion.oldToNewRule()
            eventEmitter.emit('刷新规则信息', null);
            xtip.msg('已转换成功！', {icon: 's'})
        },
        handleFileUpload(event) {
            defUtil.handleFileReader(event).then(data => {
                const {content} = data;
                try {
                    JSON.parse(content);
                } catch (e) {
                    xtip.msg('文件内容有误', {icon: 'e'})
                    return;
                }
                this.ruleContentImport = content;
                xtip.msg('读取到内容，请按需覆盖或追加', {icon: 's'})
            })
        },
        inputFIleRuleBut() {
            this.$refs.file.click()
        },
        outToInputBut() {
            this.ruleContentImport = ruleUtil.getRuleContent(2);
            xtip.msg('已导出到输入框！', {icon: 's'})
        },
        ruleOutToFIleBut() {
            const ruleContent = ruleUtil.getRuleContent(4);
            let fileName = "b站屏蔽器规则-" + defUtil.toTimeString();
            const s = prompt("保存为", fileName);
            if (s === null) return;
            if (!(s.includes(" ") || s === "" || s.length === 0)) fileName = s;
            defUtil.fileDownload(ruleContent, fileName + ".json");
        },
        ruleOutToConsoleBut() {
            xtip.msg('已导出到控制台上！', {icon: 's'})
            console.log(ruleUtil.getRuleContent());
        },
    },
};
