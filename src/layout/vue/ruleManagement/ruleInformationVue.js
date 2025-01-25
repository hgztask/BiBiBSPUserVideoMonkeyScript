import gmUtil from "../../../utils/gmUtil.js";
import {eventEmitter} from "../../../model/EventEmitter.js";
import ruleUtil from "../../../utils/ruleUtil.js";

/**
 * 规则信息组件
 */
export default {
    template: `
      <div>
      <h2>规则信息</h2>
      <button gz_type @click="refreshInfoBut">刷新信息</button>
      <div v-for="item in ruleInfoArr"
           style="padding: 5px">
        {{ item.name }}{{ item.len }}个
      </div>
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
            Qmsg.info('已刷新规则信息');
        },
    },
    created() {
        for (let newRuleKeyListElement of ruleUtil.getNewRuleKeyList()) {
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
