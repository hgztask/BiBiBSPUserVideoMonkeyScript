import ruleUtil from "../../../utils/ruleUtil.js";
import gmUtil from "../../../utils/gmUtil.js";
import {eventEmitter} from "../../../model/EventEmitter.js";
import ruleKeyListData from "../../../data/ruleKeyListData.js";
//基础规则管理
export const basic_rules_vue = {
    template: `
      <div>
      <el-card shadow="never">
        <template #header>
          <span>使用说明</span>
        </template>
        <div>脚本中会对要匹配的内容进行去除空格和转成小写，比如有个内容是【不 要 笑 挑 战
          ChallEnGE】，会被识别称为【不要笑挑战challenge】
        </div>
        <div>在上述一点的情况下，模糊匹配和正则匹配的方式时不用考虑要匹配的内容中大写问题</div>
        <div>大部分情况下模糊匹配比精确匹配好用</div>
        <div>如果用户要添加自己的正则匹配相关的规则时，建议先去该网址进行测试再添加，避免浪费时间
          <el-link href="https://www.jyshare.com/front-end/854/" target="_blank"
                   type="primary">>>>正则表达式在线测试<<<
          </el-link>
        </div>
        <div>
          如果更新脚本之后规则全没了，请点击下面的【旧规则自动转新规则】按钮，进行转换，如不行请通过关于和问题反馈选项卡中的反馈渠道联系作者
        </div>
      </el-card>

      <div>
        <select v-model="selectVal">
          <option v-for="item in ruleInfoArr" :value="item.type">{{ item.name }}</option>
        </select>
        《====可点击切换条件
      </div>
      <el-divider/>
      <el-button-group>
        <el-button @click="operationBut('add')">添加{{ selectText }}</el-button>
        <el-button @click="operationBut('del')">移除{{ selectText }}</el-button>
        <el-button @click="operationBut('set')">修改{{ selectText }}</el-button>
        <el-button @click="operationBut('find-item-all')">查询{{ selectText }}的内容</el-button>
      </el-button-group>
      <el-divider/>
      <el-button-group>
        <el-button @click="clearItemRuleBut" type="danger">移除{{ selectText }}项</el-button>
        <el-button type="danger" @click="operationBut('del_all')">全部移除</el-button>
      </el-button-group>
      </div>`,
    data() {
        return {
            selectVal: 'name',
            selectText: "",
            ruleActions: [
                {
                    type: "uid",
                    name: "uid(精确)",
                }
            ],
            //规则key列表
            ruleKeyArr: [],
            //规则信息
            ruleInfoArr: [],

        }
    },
    methods: {
        operationBut(model) {
            const type = this.selectVal;
            if (model === "add") {
                ruleUtil.showAddRuleInput(type).then((msg) => {
                    eventEmitter.send('刷新规则信息');
                    alert(msg);
                }).catch(errMsg => {
                    Qmsg.info(errMsg);
                });
            }
            if (model === "del") {
                ruleUtil.showDelRuleInput(type).then((msg) => {
                    eventEmitter.send('刷新规则信息');
                    alert(msg);
                }).catch(errMsg => {
                    Qmsg.info(errMsg);
                });
            }
            if (model === "set") {
                ruleUtil.showSetRuleInput(type).then((msg) => {
                    eventEmitter.send('刷新规则信息');
                    alert(msg);
                }).catch(errMsg => {
                    Qmsg.info(errMsg);
                });
            }
            if (model === "del_all") {
                this.$confirm('确定要删除所有规则吗？').then(() => {
                    for (let x of this.ruleKeyArr) {
                        gmUtil.delData(x);
                    }
                    this.$alert("删除全部规则成功");
                    eventEmitter.send('刷新规则信息');
                })
            }
            if (model === 'find-item-all') {
                const ruleData = gmUtil.getData(type, []);
                eventEmitter.send('展示内容对话框', JSON.stringify(ruleData, null, 4))
            }
        },
        clearItemRuleBut() {
            const type = this.selectVal;
            const find = this.ruleInfoArr.find(item => item.type === type);
            this.$confirm(`是要清空${find.name}的规则内容吗？`, 'tip').then(() => {

                ruleKeyListData.clearKeyItem(type);
                this.$alert(`已清空${find.name}的规则内容`)
            })
        }
    },
    watch: {
        selectVal(newVal) {
            console.log(newVal)
            const find = this.ruleInfoArr.find(item => item.type === newVal);
            this.selectText = find.name;
        }
    },
    created() {
        for (let newRuleKeyListElement of ruleUtil.getNewRuleKeyList()) {
            this.ruleKeyArr.push(newRuleKeyListElement.key);
            this.ruleInfoArr.push({
                type: newRuleKeyListElement.key,
                name: newRuleKeyListElement.name,
            })
        }
        const find = this.ruleInfoArr.find(item => item.type === this.selectVal);
        this.selectText = find.name;
    }
};
