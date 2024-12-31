import localMKData from "../../data/localMKData.js";

const mainDrawer = new Drawer_gz({
    show: false,
    height: "50vh",
    headerShow: false,
    title: "屏蔽器主面板",
    direction: "top",
    externalButtonText: "屏蔽器",
    externalButtonWidth: "80px",
    externalButtonShow: !localMKData.isHideMainButSwitch(),
    zIndex: 9000,
    drawerBorder: `1px solid ${localMKData.getBorderColor()}`,
    bodyHtml: `<div id="shield"></div>`,
})


export default mainDrawer

