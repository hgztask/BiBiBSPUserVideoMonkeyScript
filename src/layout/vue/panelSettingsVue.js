import Vue from "vue";
import localMKData from "../../data/localMKData.js";
import bFetch from '../../model/bFetch.js'

Vue.component('panel_settings_vue', {
    template: `
      <div>
      选色器
      <el-color-picker v-model="input_color"></el-color-picker>
      <div>
      </div>
      <button gz_type @click="setBorderColorBut">设置边框色</button>
      <button gz_type @click="setDefFontColorForOutputInformationBut">设置输出信息默认字体色</button>
      <button gz_type @click="setTheFontColorForOutputInformationBut">设置输出信息高亮字体色</button>
      <el-tooltip content="刷新页面生效">
        <el-button @click="setDefInfoBut">恢复默认</el-button>
      </el-tooltip>
      <div>
        <el-checkbox v-model="hideRightTopMainButSwitch">隐藏右上角圆形主面板开关按钮</el-checkbox>
      </div>
      <div>
        <h4>说明</h4>
        <ol>
          <li>按键盘tab键上的~键为展开关闭主面板</li>
        </ol>
        <el-button @click="demoBut">测试网络请求</el-button>
        <el-button @click="demo1but">测试对话框</el-button>
      </div>
      </div>`,
    data() {
        return {
            input_color: "",
            hideRightTopMainButSwitch: localMKData.isHideRightTopMainButSwitch()
        }
    },
    methods: {
        setBorderColorBut() {
            xtip.confirm("是要否设置面板边框颜色吗？", {
                icon: "a",
                btn1: () => {
                    localMKData.setBorderColor(this.input_color);
                    xtip.alert("已设置面板边框颜色，刷新生效");
                }
            })
        },
        setDefFontColorForOutputInformationBut() {
            xtip.confirm("是要否设置输出信息默认字体颜色吗？", {
                icon: "a",
                btn1: () => {
                    localMKData.setOutputInformationFontColor(this.input_color);
                    xtip.alert("已设置输出信息默认字体颜色，刷新生效");
                }
            })
        },
        setTheFontColorForOutputInformationBut() {
            xtip.confirm("是要否设置输出信息高亮字体颜色吗？", {
                icon: "a",
                btn1: () => {
                    localMKData.setHighlightInformationColor(this.input_color);
                    xtip.alert("已设置输出信息高亮字体颜色，刷新生效");
                }
            })
        },
        setDefInfoBut() {
            localMKData.setDefaultColorInfo()
            xtip.alert("已恢复默认颜色，刷新生效");
        },
        demoBut() {
            bFetch.fetchGetVideoInfo('BV152cWeXEhW').then(data => {
                console.log(data);
                debugger
            })
        },
        demo1but() {
            this.$alert('这是一段内容', '标题名称', {
                confirmButtonText: '确定',
                callback: action => {
                    this.$message({
                        type: 'info',
                        message: `action: ${action}`
                    });
                }
            })
        }
    },
    watch: {
        hideRightTopMainButSwitch(newVal) {
            localMKData.setHideRightTopMainButSwitch(newVal);
        }
    }
})
