import './drawer/newMainDrawer.js'
import './output_informationTab.js'
import gmUtil from "../utils/gmUtil.js";
import localMKData from "../data/localMKData.js";
import externalHoverSwitchPanelButton from "./externalHoverSwitchPanelButton.js";
import defCss from '../css/def.css'


// installAboutAndFeedbackComponentsVue('#station_b_shield_problem_feedback',
//     {
//         title: 'B站屏蔽增强器',
//         gfFeedbackUrl: 'https://greasyfork.org/zh-CN/scripts/461382'
//     }
// )


// 设置边框样式
gmUtil.addStyle(`
[gz_bezel]{
border:1px solid ${localMKData.getBorderColor()}
}
`);

gmUtil.addStyle(defCss)


externalHoverSwitchPanelButton.addLayout()
