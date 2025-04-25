import gmUtil from "../../../utils/gmUtil.js";
import ruleKeyListData from "../../../data/ruleKeyListData.js";
import {comment_word_limit_vue} from "../../commentWordLimitVue.js";

/**
 * 其他规则组件
 */
export default {
    components: {comment_word_limit_vue},
    template: `
      <div>
        <div style="display: flex">
          <div style="width: 70vw">
            <el-card>
              <template #header>
                <span>使用说明</span>
              </template>
              <ol>
                <li>如设置时长相关单位为秒</li>
                <li>如设置播放量和弹幕量相关单位为个</li>
                <li>设置最小播放量则小于该值的视频会屏蔽</li>
                <li>设置最大播放量则大于该值的视频会屏蔽</li>
                <li>设置最小弹幕量则小于该值的视频会屏蔽</li>
                <li>设置最大弹幕量则大于该值的视频会屏蔽</li>
                <li>设置最小时长则小于该值的视频会屏蔽</li>
                <li>设置最大时长则大于该值的视频会屏蔽</li>
                <li>设置最小用户等级则小于该值的会屏蔽，低于该值的会屏蔽掉</li>
                <li>设置最大用户等级则大于该值的会屏蔽，高于该值的会屏蔽掉</li>
                <li>取消相关限制条件则不做限制处理</li>
                <li>右侧信息关键条件-1则为未做任何限制处理</li>
                <li>最后因为设置限制条件冲突或限制太多，视频未能限制的情况下，请按需设置限制条件</li>
              </ol>
            </el-card>
            <input gz_type type="number" :min="inputMin" :max="inputMax" v-model="num">
            <el-select v-model="selectValue" filterable>
              <el-option :value="item.value" v-for="item in selectList" :label="item.name"></el-option>
            </el-select>
            <div>
              <el-button @click="okVideoSelectBut">设置</el-button>
              <el-button @click="cancelBut">取消</el-button>
              <el-button @click="allCancelBut">全部取消</el-button>
            </div>
          </div>
          <div>
            <el-button @click="updateInfoBut">刷新</el-button>
            <div v-for="item in selectList" style="padding: 5px">
              {{ item.name }}{{ item.defVal }}
              {{ item.name.includes('时长') ? '秒' : '' }}
            </div>
          </div>
        </div>
        <comment_word_limit_vue/>
      </div>`,
    data() {
        return {
            num: 0,
            selectList: ruleKeyListData.otherKeyListData,
            selectValue: 'nMinimumPlay',
            inputMax: "",
            inputMin: 0
        }
    },
    methods: {
        okVideoSelectBut() {
            const find = this.selectList.find(item => item.value === this.selectValue);
            //当前下拉框选中的条件的值对应的关联值，关联限制条件，如最小的xxx，对应的最大的xxx
            const associatedVal = gmUtil.getData(find.associated, -1);
            const associatedFind = this.selectList.find(item => item.value === find.associated)
            //当输入框的值，大于对应关联箱子条件时返回
            if (this.num > associatedVal && associatedVal !== -1) {
                if (associatedFind.bLarge) {
                    this.$alert(`要设置的${find.name}值不能大于${associatedFind.name}的值`)
                    return
                }
                console.log('正常修改')
            }
            this.$alert(`已设置${find.name}，值为${this.num}`)
            gmUtil.setData(this.selectValue, this.num)
            this.updateInfo()
        },
        cancelBut() {
            gmUtil.setData(this.selectValue, -1)
            const find = this.selectList.find(item => item.value === this.selectValue);
            this.$alert(`已取消${find.name}的限制`)
            this.updateInfo()
        },
        allCancelBut() {
            for (let item of this.selectList) {
                gmUtil.setData(item.value, -1);
            }
            this.updateInfo()
        },
        updateInfo() {
            for (let item of this.selectList) {
                item.defVal = gmUtil.getData(item.value, -1);
            }
        },
        updateInfoBut() {
            this.updateInfo()
            this.$alert('已刷新')
        },
    },
    watch: {
        selectValue(newVal) {
            const find = this.selectList.find(item => item.value === newVal);
            if (find.name.includes('用户等级')) {
                //b站等级最低2级别才能发送评论，设置最小限制等级为3
                this.inputMin = 3
                //b站等级目前最高7级，即硬核会员等级，设置最大限制等级为6
                this.inputMax = 6
                //修正限制等级
                if (this.num > 6) {
                    this.num = 6
                }
                if (this.num < 3) {
                    this.num = 3
                }
            } else {
                this.inputMin = 0
                this.inputMax = ''
            }
        }
    },
    created() {
        this.updateInfo()
    }
};
