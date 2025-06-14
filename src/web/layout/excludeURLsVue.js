import gmUtil from "../utils/gmUtil.js";
import {getExcludeURLsGm, isExcludeURLSwitchGm} from "../data/localMKData.js";
import {eventEmitter} from "../model/EventEmitter.js";
import {returnTempVal} from "../data/globalValue.js";

// 排除页面组件
export default {
    template: `
      <div>
        <el-card shadow="never">
          <template #header>说明</template>
          <div>1.被排除的页面大部分功能会失效</div>
          <div>2.修改后建议刷新页面</div>
          <el-switch v-model="excludeURLSwitchVal" active-text="启用设置"/>
        </el-card>
        <el-table :data="data" stripe border>
          <el-table-column label="启用" width="100">
            <template v-slot="scope">
              <el-switch v-model="scope.row.state"/>
            </template>
          </el-table-column>
          <el-table-column label="正则地址">
            <template v-slot="scope">
              <el-input v-model.trim="scope.row.regularURL"/>
            </template>
          </el-table-column>
          <el-table-column label="描述">
            <template v-slot="scope">
              <el-input v-model.trim="scope.row.desc"/>
            </template>
          </el-table-column>
          <el-table-column width="300" align="center">
            <template #header>
              <el-button @click="tableAddItemBut">添加</el-button>
              <el-button @click="refreshBut">刷新</el-button>
              <el-button type="success" @click="saveBut">保存</el-button>
            </template>
            <template v-slot="scope">
              <el-button type="danger" size="mini" @click="tableDelItemBut(scope.$index,scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>`,
    data() {
        return {
            excludeURLSwitchVal: isExcludeURLSwitchGm(),
            data: getExcludeURLsGm()
        }
    },
    methods: {
        tableAddItemBut() {
            this.data.push({state: false, regularURL: "", desc: ""})
        },
        tableDelItemBut(index) {
            this.data.splice(index, 1)
        },
        refreshBut() {
            this.data = getExcludeURLsGm();
            this.$message.success("刷新成功");
        },
        saveBut() {
            for (let v of this.data) {
                if (v.regularURL === "") {
                    this.$message.error("正则地址不能为空");
                    return
                }
            }
            gmUtil.setData("exclude_urls_gm", this.data)
            this.$message.success("保存成功");
        }
    },
    watch: {
        excludeURLSwitchVal(n) {
            gmUtil.setData("is_exclude_url_switch_gm", n)
        }
    }
}


/**
 * 测试检查url是否排除页面
 * @param url {string}
 * @returns {{state: boolean, regularURL: string}|{state: boolean}}
 */
const checkAndExcludePageTest = (url) => {
    const arr = getExcludeURLsGm();
    if (arr.length === 0) return returnTempVal;
    for (let v of arr) {
        if (!v.state) continue;
        if (url.search(v.regularURL) !== 0) {
            return {state: true, regularURL: v.regularURL};
        }
    }
    return returnTempVal;
}


/**
 * 检查是否排除页面
 * @param url {string}
 * @returns {boolean}
 */
export const checkAndExcludePage = (url) => {
    if (!isExcludeURLSwitchGm()) return false;
    const {state, regularURL} = checkAndExcludePageTest(url)
    if (state) {
        console.log("排除页面", regularURL)
        eventEmitter.send('打印信息', '排除页面：' + regularURL);
    }
    return state
}
