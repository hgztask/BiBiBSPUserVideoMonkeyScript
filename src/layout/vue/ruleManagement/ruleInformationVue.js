import gmUtil from "../../../utils/gmUtil.js";
import {eventEmitter} from "../../../model/EventEmitter.js";
import ruleKeyListData from "../../../data/ruleKeyListData.js";

/**
 * 规则信息组件
 */
export default {
    template: `
      <div>
        <el-button @click="refreshInfoBut">刷新信息</el-button>
        <el-descriptions title="规则信息">
          <el-descriptions-item v-for="item in ruleInfoArr" :key="item.name"
                                :label="item.name">
            <el-badge :value="item.len">
              <el-button>个</el-button>
            </el-badge>
          </el-descriptions-item>
        </el-descriptions>
      </div>`,
    data() {
        return {
            //规则信息
            ruleInfoArr: [],
        }
    },
    methods: {
        // 刷新规则信息
        refreshInfoBut() {
            for (let x of this.ruleInfoArr) {
                x.len = gmUtil.getData(x.type, []).length;
            }
            this.$notify({
                title: 'tip',
                message: '刷新规则信息成功',
                type: 'success',
            })
        },
    },
    created() {
        for (let newRuleKeyListElement of ruleKeyListData.getRuleKeyListData()) {
            this.ruleInfoArr.push({
                type: newRuleKeyListElement.key,
                name: newRuleKeyListElement.name,
                len: 0
            })
        }
        this.refreshInfoBut();
        eventEmitter.on('刷新规则信息', () => {
            this.refreshInfoBut();
        })
    }
};
