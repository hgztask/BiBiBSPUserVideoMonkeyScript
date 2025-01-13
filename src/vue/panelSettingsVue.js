import localMKData from "../data/localMKData.js";
import Vue from "vue";
import mainDrawer from "../layout/drawer/mainDrawer.js";
import {eventEmitter} from "../model/EventEmitter.js";

const returnVue = () => {
    return new Vue({
        template: `
          <div>
            <div>
              选色器:<input type="color" v-model="input_color">
            </div>
            <button gz_type @click="setBorderColorBut">设置边框色</button>
            <button gz_type @click="setDefFontColorForOutputInformationBut">设置输出信息默认字体色</button>
            <button gz_type @click="setTheFontColorForOutputInformationBut">设置输出信息高亮字体色</button>
            <button title="刷新页面生效" gz_type @click="setDefInfoBut">恢复默认</button>
            <div gz_bezel>
              <div>
                <label>
                  <input type="checkbox" v-model="hideMainButSwitch">隐藏主面板开关按钮
                </label>
              </div>
              <div>
                <label>
                  <input type="checkbox" v-model="hideRightTopMainButSwitch">隐藏右上角圆形主面板开关按钮
                </label>
              </div>
            </div>
            <hr>
            <div>
              <h4>说明</h4>
              <ol>
                <li>按键盘tab键上的~键为展开关闭主面板</li>
              </ol>
            </div>
          </div>`,
        el: '#shield #panel_settings_vue',
        data() {
            return {
                input_color: "",
                hideMainButSwitch: localMKData.isHideMainButSwitch(),
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
            }
        },
        watch: {
            hideMainButSwitch(newVal) {
                localMKData.setHideMainButSwitch(newVal);
                mainDrawer.externalButtonShow(!newVal)
            },
            hideRightTopMainButSwitch(newVal) {
                localMKData.setHideRightTopMainButSwitch(newVal);
                eventEmitter.emit('右上角开关按钮显隐', newVal)
            }
        }
    });
}


export default returnVue;
