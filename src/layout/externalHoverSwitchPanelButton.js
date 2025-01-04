import css from '../css/externalHoverSwitchPanelButtonCss.css'
import mainDrawer from './drawer/mainDrawer.js'
import {eventEmitter} from "../model/EventEmitter.js";
import localMKData from "../data/localMKData.js";

const addLayout = () => {
    const div = document.createElement('div');
    div.style.position = 'fixed'
    div.style.zIndex = '9001'
    div.style.display = localMKData.isHideRightTopMainButSwitch() ? 'none' : ''
    const but = document.createElement('button');
    but.textContent = '屏蔽器'
    const shadowRoot = div.attachShadow({mode: 'open'});
    const styleElement = document.createElement('style');
    styleElement.textContent = css;
    shadowRoot.appendChild(but)
    shadowRoot.appendChild(styleElement)
    document.querySelector('body').appendChild(div)
    but.addEventListener('click', () => mainDrawer.showDrawer())
    eventEmitter.on('右上角开关按钮显隐', (loop) => {
        div.style.display = !loop ? '' : 'none'
    })
}

//外部悬浮开关面板按钮
export default {
    addLayout
}
