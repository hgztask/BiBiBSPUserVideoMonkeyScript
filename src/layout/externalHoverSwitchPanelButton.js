import css from '../css/externalHoverSwitchPanelButtonCss.css'
import {eventEmitter} from "../model/EventEmitter.js";

const addLayout = () => {
    const div = document.createElement('div');
    div.style.position = 'fixed'
    div.style.zIndex = '9001'
    // div.style.display = localMKData.isHideRightTopMainButSwitch() ? 'none' : ''
    const but = document.createElement('button');
    but.textContent = '屏蔽器'
    const shadowRoot = div.attachShadow({mode: 'open'});
    const styleElement = document.createElement('style');
    styleElement.textContent = css;
    shadowRoot.appendChild(but)
    shadowRoot.appendChild(styleElement)
    document.querySelector('body').appendChild(div)
    but.addEventListener('click', () => {
        eventEmitter.emit('主面板开关')
    })
}

//外部悬浮开关面板按钮
export default {
    addLayout
}
