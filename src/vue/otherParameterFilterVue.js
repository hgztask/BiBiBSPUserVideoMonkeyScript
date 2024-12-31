import Vue from "vue";
import gmUtil from "../utils/gmUtil.js";

const returnVue = () => {
    return new Vue({
        el: '#other_parameter_filter',
        template: `
          <div style="display: flex">
            <div style="width: 70vw">
              <div>
                <h2>使用说明</h2>
                <ol>
                  <li>如设置时长相关单位为秒</li>
                  <li>如设置播放量和弹幕量相关单位为个</li>
                  <li>设置最小播放量则小于该值的视频会屏蔽</li>
                  <li>设置最大播放量则大于该值的视频会屏蔽</li>
                  <li>设置最小弹幕量则小于该值的视频会屏蔽</li>
                  <li>设置最大弹幕量则大于该值的视频会屏蔽</li>
                  <li>设置最小时长则小于该值的视频会屏蔽</li>
                  <li>设置最大时长则大于该值的视频会屏蔽</li>
                  <li>设置评论区最小用户等级则小于该值的会屏蔽，低于该值的会屏蔽掉</li>
                  <li>设置评论区最大用户等级则大于该值的会屏蔽，高于该值的会屏蔽掉</li>
                  <li>取消相关限制条件则不做限制处理</li>
                  <li>右侧信息关键条件-1则为未做任何限制处理</li>
                  <li>最后因为设置限制条件冲突或限制太多，视频未能限制的情况下，请按需设置限制条件</li>
                </ol>
              </div>
              <input type="number" :min="inputMin" :max="inputMax" v-model="index">
              <select v-model="selectValue">
                <option :value="item.value" v-for="item in selectList">{{ item.name }}</option>
              </select>
              《====可点击切换限制条件
              <div>
                <button @click="okVideoSelectBut" gz_type>设置</button>
                <button @click="cancelBut" gz_type>取消</button>
                <button gz_type @click="allCancelBut">全部取消</button>
              </div>
            </div>
            <div>
              <button @click="updateInfoBut">刷新</button>
              <div v-for="item in selectList">
                {{ item.name }}
                <button gz_type>{{ item.defVal }}</button>
                {{ item.name.includes('时长') ? '秒' : '' }}
              </div>
            </div>
          </div>`,
        data() {
            return {
                index: 0,
                selectList: [
                    {
                        name: '最小播放量',
                        value: 'nMinimumPlay',
                        //关联
                        associated: 'nMaximumPlayback',
                        defVal: -1
                    },
                    {
                        name: '最大播放量',
                        value: 'nMaximumPlayback',
                        associated: 'nMinimumPlay',
                        //最大
                        bLarge: true,
                        defVal: -1
                    },
                    {
                        name: '最小弹幕数',
                        value: 'nMinimumBarrage',
                        associated: 'nMaximumBarrage',
                        defVal: -1
                    },
                    {
                        name: '最大弹幕数',
                        value: 'nMaximumBarrage',
                        associated: 'nMinimumBarrage',
                        bLarge: true,
                        defVal: -1
                    },
                    {
                        name: '最小时长',
                        value: 'nMinimumDuration',
                        associated: 'nMaximumDuration',
                        defVal: -1
                    },
                    {
                        name: '最大时长',
                        value: 'nMaximumDuration',
                        associated: 'nMinimumDuration',
                        bLarge: true,
                        defVal: -1
                    },
                    {
                        name: '评论区最小用户等级过滤',
                        value: 'nMinimumLevel',
                        associated: 'nMaximumLevel',
                        defVal: -1
                    },
                    {
                        name: '评论区最大用户等级过滤',
                        value: 'nMaximumLevel',
                        associated: 'nMinimumLevel',
                        bLarge: true,
                        defVal: -1
                    }
                ],
                selectValue: 'nMinimumPlay',
                inputMax: '',
                inputMin: '0'
            }
        },
        methods: {
            okVideoSelectBut() {
                const find = this.selectList.find(item => item.value === this.selectValue);
                //当前下拉框选中的条件的值对应的关联值，关联限制条件，如最小的xxx，对应的最大的xxx
                const associatedVal = gmUtil.getData(find.associated, -1);
                const associatedFind = this.selectList.find(item => item.value === find.associated)
                //当输入框的值，大于对应关联箱子条件时返回
                if (this.index > associatedVal && associatedVal !== -1) {
                    if (associatedFind.bLarge) {
                        xtip.alert(`要设置的${find.name}值不能大于${associatedFind.name}的值`)
                        return
                    }
                    console.log('正常修改')
                }
                xtip.alert(`已设置${find.name}，值为${this.index}`)
                gmUtil.setData(this.selectValue, this.index)
                this.updateInfo()
            },
            cancelBut() {
                gmUtil.setData(this.selectValue, -1)
                const find = this.selectList.find(item => item.value === this.selectValue);
                xtip.alert(`已取消${find.name}的限制`)
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
                xtip.alert('已刷新')
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
                    if (this.index > 6) {
                        this.index = 6
                    }
                    if (this.index < 3) {
                        this.index = 3
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
    })
}

// 导出视频参数过滤面板中的vue实例
export default returnVue
