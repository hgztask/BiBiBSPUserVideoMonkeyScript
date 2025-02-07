import './drawer/newMainDrawer.js'
import './output_informationTab.js'
import gmUtil from "../utils/gmUtil.js";
import localMKData from "../data/localMKData.js";
import defCss from '../css/def.css'

// 设置边框样式
gmUtil.addStyle(`
[gz_bezel]{
border:1px solid ${localMKData.getBorderColor()}
}
`);

gmUtil.addStyle(defCss)
