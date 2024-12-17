import './drawer/mainDrawer.js'
import './tabs/mainTabs.js'
import panelSettingsVue from './../vue/panelSettingsVue.js'
import ruleManagementVue from './../vue/ruleManagementVue.js'
import './output_informationTab.js'
import gmUtil from "../utils/gmUtil.js";
import localMKData from "../data/localMKData.js";

panelSettingsVue();
ruleManagementVue();

// 设置边框样式
gmUtil.addStyle(`
[gz_bezel]{
border:1px solid ${localMKData.getBorderColor()}
}
`);

