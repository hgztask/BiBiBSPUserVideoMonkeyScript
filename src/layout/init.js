import './drawer/mainDrawer.js'
import './tabs/mainTabs.js'
import panelSettingsVue from './../vue/panelSettingsVue.js'
import ruleManagementVue from './../vue/ruleManagementVue.js'
import donateLayoutVue from './../vue/donateLayoutVue.js'
import otherParameterFilterVue from '../vue/otherParameterFilterVue.js'
import compatibleSettingVue from '../vue/compatibleSettingVue.js'
import cacheTagsManagementVue from '../vue/cacheTagsManagementVue.js'
import './output_informationTab.js'
import gmUtil from "../utils/gmUtil.js";
import localMKData from "../data/localMKData.js";
import externalHoverSwitchPanelButton from "./externalHoverSwitchPanelButton.js";

panelSettingsVue();
ruleManagementVue();
donateLayoutVue();
otherParameterFilterVue()
compatibleSettingVue()
cacheTagsManagementVue()

installAboutAndFeedbackComponentsVue('#station_b_shield_problem_feedback',
    {
        title: 'B站屏蔽增强器',
        gfFeedbackUrl: 'https://greasyfork.org/zh-CN/scripts/461382'
    }
)

// 设置边框样式
gmUtil.addStyle(`
[gz_bezel]{
border:1px solid ${localMKData.getBorderColor()}
}
`);

externalHoverSwitchPanelButton.addLayout()

