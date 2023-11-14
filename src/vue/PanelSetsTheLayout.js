const PanelSetsTheLayout = {//面板设置
    returnVue() {
        const vue = new Vue({
            el: "#panelSetsTheLayout",
            data: {
                backgroundPellucidRange: 1,
                heightRange: 100,
                heightRangeText: "100%",
                widthRange: 100,
                widthRangeText: "100%",
                isDShieldPanel: LocalData.isDShieldPanel()
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
                    Qmsg.success(`您更改了【禁用快捷悬浮屏蔽面板自动显示】的状态，当前为：${newVal ? "启用" : "不启用"}状态`);
                }
            }
        });
        return function () {
            return vue;
        };
    }
}