import ruleUtil from "../../../utils/ruleUtil.js";
import gmUtil from "../../../utils/gmUtil.js";
import {eventEmitter} from "../../../model/EventEmitter.js";
import ruleKeyListData from "../../../data/ruleKeyListData.js";
import {rule_set_value_dialog} from "./ruleSetValueDialog.js";
import {multiple_rule_edit_dialog_vue} from "../../eventEmitter_components/multipleRuleEditDialogVue.js";
//基础规则管理
export const basic_rules_vue = {
    components: {rule_set_value_dialog, multiple_rule_edit_dialog_vue},
    template: `
      <div>
        <el-card shadow="never">
          <template #header>
            <span>使用说明</span>
          </template>
          <div>1.基础规则类型较多，下拉框支持搜索定位，鼠标点击出现光标时支持筛选</div>
          <div>2.大部分情况下模糊匹配比精确匹配好用</div>
          <div>3.如果可以的话，请优先考虑根据uid精确屏蔽，而非使用用户名相关屏蔽，因用户名可以随意更改</div>
          <div>4.如果用户要添加自己的正则匹配相关的规则时，建议先去该网址进行测试再添加，避免浪费时间
            <el-link href="https://www.jyshare.com/front-end/854/" target="_blank"
                     type="primary">>>>正则表达式在线测试<<<
            </el-link>
          </div>
          <div>
            5.如果更新脚本之后规则全没了，请点击下面的【旧规则自动转新规则】按钮，进行转换，如不行请通过关于和问题反馈选项卡中的反馈渠道联系作者
          </div>
          <div>6.改动实时生效</div>
          <div>7. 分区包括子分区属于视频tag范畴,如需按分区屏蔽在对应视频tag类型添加</div>
          <div>8.
            基础规则中的项和组合规则互斥，如xxx添加到视频tag多重规则，则不能添加到对应基础规则视频tag，反之同理，限类型，如组合精确匹配
          </div>
        </el-card>
        <el-card shadow="never">
          <template #header>选择规则</template>
          <el-cascader v-model="cascaderVal" @change="handleChangeCascader"
                       :options="cascaderOptions" :show-all-levels="false"
                       :props="{ expandTrigger: 'hover' }" filterable/>
          <el-divider/>
          <el-row>
            <el-col :span="12">
              <el-button-group>
                <el-button @click="addRuleBut">添加</el-button>
                <el-button @click="setRuleBut">修改</el-button>
                <el-button @click="findItemAllBut">查询</el-button>
                <el-button @click="delBut">移除</el-button>
              </el-button-group>
            </el-col>
            <el-col :span="12">
              <div class="el-horizontal-right">
                <el-button-group>
                  <el-button @click="clearItemRuleBut" type="danger">清空项</el-button>
                  <el-button type="danger" @click="delAllBut">全部移除</el-button>
                </el-button-group>
              </div>
            </el-col>
          </el-row>
        </el-card>
        <rule_set_value_dialog/>
        <multiple_rule_edit_dialog_vue/>
      </div>`,
    data() {
        return {
            cascaderVal: ["精确匹配", "precise_uid"],
            cascaderOptions: ruleKeyListData.getSelectOptions(),
            //规则信息
            ruleInfoArr: [],
        }
    },
    methods: {
        handleChangeCascader(val) {
            console.log(val)
        },
        addRuleBut() {
            const [model, mk_type] = this.cascaderVal;
            if (model === '多重匹配') {
                const typeMap = this.ruleInfoArr.find(item => item.type === mk_type);
                eventEmitter.send('打开多重规则编辑对话框', typeMap)
                return
            }
            ruleUtil.showAddRuleInput(mk_type);
        },
        setRuleBut() {
            const [model, type] = this.cascaderVal;
            const typeMap = this.ruleInfoArr.find(item => item.type === type);
            if (model === '多重匹配') {
                eventEmitter.send('打开多重规则编辑对话框', typeMap)
                return
            }
            eventEmitter.send('修改规则对话框', typeMap)
        },
        findItemAllBut() {
            const [model, type] = this.cascaderVal;
            const typeMap = this.ruleInfoArr.find(item => item.type === type);
            if (model === '多重匹配') {
                eventEmitter.send('打开多重规则编辑对话框', typeMap)
                return
            }
            const ruleData = gmUtil.getData(type, []);
            eventEmitter.send('展示内容对话框', JSON.stringify(ruleData, null, 4))
        },
        delAllBut() {
            this.$confirm('确定要删除所有规则吗？').then(() => {
                for (let x of this.ruleInfoArr) {
                    gmUtil.delData(x.type);
                }
                this.$message.success("删除全部规则成功");
                eventEmitter.send('刷新规则信息', false);
            })
        },
        delBut() {
            const [model, type] = this.cascaderVal;
            const typeMap = this.ruleInfoArr.find(item => item.type === type);
            if (model === '多重匹配') {
                eventEmitter.send('打开多重规则编辑对话框', typeMap)
                return
            }
            ruleUtil.showDelRuleInput(type)
        },
        clearItemRuleBut() {
            const type = this.cascaderVal[1];
            const find = this.ruleInfoArr.find(item => item.type === type);
            this.$confirm(`是要清空${find.name}的规则内容吗？`, 'tip').then(() => {
                ruleKeyListData.clearKeyItem(type);
                this.$alert(`已清空${find.name}的规则内容`)
            })
        }
    },
    watch: {},
    created() {
        for (let newRuleKeyListElement of ruleKeyListData.getRuleKeyListData()) {
            this.ruleInfoArr.push({
                type: newRuleKeyListElement.key,
                name: newRuleKeyListElement.name,
            })
        }
    }
};
