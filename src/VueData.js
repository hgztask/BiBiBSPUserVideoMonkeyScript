//{"weight":2}

const VueData = {//vue组件数据获取与设置
    panelSetsTheLayout: {//面板设置布局
        isDShieldPanelFollowMouse() {//是否跟随鼠标
            return window.panelSetsTheLayoutVue.isDShieldPanelFollowMouse;
        },
        setDShieldPanelFollowMouse(boolVal) {//设置是否跟随鼠标
            window.panelSetsTheLayoutVue.isDShieldPanelFollowMouse = boolVal;
        },
        isFixedPanelValueCheckbox(){//是否固定面板值
            return window.panelSetsTheLayoutVue.isFixedPanelValueCheckbox;
        },
        setFixedPanelValueCheckbox(boolVal) {//设置是否固定面板值
            window.panelSetsTheLayoutVue.isFixedPanelValueCheckbox = boolVal;
        }
    }
}
