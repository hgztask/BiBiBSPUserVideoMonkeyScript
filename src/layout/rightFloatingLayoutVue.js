import {eventEmitter} from "../model/EventEmitter.js";
import Vue from "vue";
import localMKData from "../data/localMKData.js";
import {Tip} from "../utils/Tip.js";
import {shielding_user_vue} from "./vue/space/shieldingUserVue.js";


const addLayout = () => {
    const div = document.createElement('div');
    const divStyle = div.style;
    divStyle.position = 'fixed'
    divStyle.zIndex = '9000'
    divStyle.right = "0";
    divStyle.top = '13%'
    divStyle.transition = 'transform 0.5s';
    if (!localMKData.isFirstFullDisplay()) {
        divStyle.transform = 'translateX(80%)'
    } else {
        if (localMKData.isHalfHiddenIntervalAfterInitialDisplay()) {
            setTimeout(() => {
                divStyle.transform = 'translateX(80%)'
                Tip.infoBottomRight('自动隐藏外部主面板显隐按钮')
            }, 8000);
        }
    }
    const vueDiv = document.createElement('div')
    div.appendChild(vueDiv)
    document.body.appendChild(div)
    const config = {
        components: {
            shielding_user_vue
        },
        el: vueDiv,
        template: `
          <div v-show="panelShow" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
          <div>
            <el-button round @click="showBut">主面板</el-button>
          </div>
          <shielding_user_vue/>
          </div>`,
        data() {
            return {
                //布局显示开关
                panelShow: localMKData.isShowRightTopMainButSwitch(),
            }
        },
        methods: {
            showBut() {
                eventEmitter.send('主面板开关')
            },
            handleMouseEnter() {
                divStyle.transform = "translateX(0)";
            },
            handleMouseLeave() {
                divStyle.transform = 'translateX(80%)'
            }
        },
        created() {
            eventEmitter.on('显隐主面板开关', (bool) => {
                this.panelShow = bool
            })

        }
    };
    new Vue(config)
}


//右侧悬浮布局
export default {
    addLayout
}
