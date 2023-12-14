const PanelSetsTheLayout = {//面板设置
    returnVue() {
        window.panelSetsTheLayoutVue = new Vue({
            el: "#panelSetsTheLayout",
            data: {
                backgroundPellucidRange: 1,
                heightRange: 100,
                heightRangeText: "100%",
                widthRange: 100,
                widthRangeText: "100%",
                isDShieldPanel: LocalData.isDShieldPanel(),
                isMyButShow: LocalData.isMyButSHow(),
                titleContent: "可通过快捷键~显示控制面板，右击页面和左键油猴插件选择本脚本的【显示隐藏控制面板】"
            },
            watch: {
                backgroundPellucidRange(newVal) {
                    const back = Home.background;
                    $("#home_layout").css("background", Util.getRGBA(back.r, back.g, back.b, newVal));
                },
                heightRange(newVal) {
                    this.heightRangeText = newVal + "%";
                    $("#home_layout").css("height", `${newVal}%`);
                },
                widthRange(newVal) {
                    this.widthRangeText = newVal + "%";
                    $("#home_layout").css("width", `${newVal}%`);
                },
                isDShieldPanel(newVal) {
                    LocalData.setDShieldPanel(newVal);
                    Tip.success(`您更改了【禁用快捷悬浮屏蔽面板自动显示】的状态，当前为：${newVal ? "启用" : "不启用"}状态`);
                },
                isMyButShow(newVal) {
                    LocalData.setMyButShow(newVal);
                    window.isShowVue.show = newVal;
                }
            }
        });
    }
}