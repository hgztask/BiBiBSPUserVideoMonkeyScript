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
                isMyButShow: LocalData.isMyButSHow(),
                isDShieldPanel: LocalData.isDShieldPanel(),//是否禁用快捷悬浮屏蔽面板自动显示
                isDShowHidePanel: false,//是否禁用显示隐藏主面板快捷键
                isDShieldPanelFollowMouse: false,//快捷悬浮屏蔽面板是否跟随鼠标
                isFixedPanelValueCheckbox: false,//是否固定快捷悬浮屏蔽面板的值，也有该复选框是否选中的意思
                showKCMap: {
                    dHMainPanel_KC_text: LocalData.localKeyCode.getDHMainPanel_KC(),
                    dTQFSPToTriggerDisplay_KC_text: LocalData.localKeyCode.getDTQFSPToTriggerDisplay_KC(),
                    hideQuickSuspensionBlockButton_KC_text: LocalData.localKeyCode.getHideQuickSuspensionBlockButton_KC(),
                    qFlBBFollowsTheMouse_KC_text: LocalData.localKeyCode.getQFlBBFollowsTheMouse_KC(),
                    fixedQuickSuspensionPanelValue_KC_text: LocalData.localKeyCode.getFixedQuickSuspensionPanelValue_KC()
                }

            },
            methods: {
                __showInputKC(text) {
                    let input = prompt(text, "");
                    if (input === null) return null;
                    input = input.trim();
                    if (input === "") {
                        Tip.error("请输入正确的快捷键");
                        return null;
                    }
                    return input;
                },
                __isPrintKC(kcData, fun) {//临时将就着用的
                    if (!kcData) return;
                    let msg;
                    if (fun) {
                        msg = `已修改快捷键：${kcData}`;
                        Tip.success(msg);
                    } else {
                        msg = "快捷键已被占用，请重新设置！";
                        Tip.error(msg);
                    }
                    console.log(msg);
                    alert(msg);
                },
                setDHMPKCBut() {
                    const kc = this.__showInputKC("请输入显示隐藏主面板的快捷键");
                    this.__isPrintKC(kc, LocalData.localKeyCode.setDHMainPanel_KC(kc));
                },
                setDTQFSPToTDKCBut() {//有用
                    const kc = this.__showInputKC("请输入切换快捷悬浮屏蔽面板自动显示状态的按键");
                    this.__isPrintKC(kc, LocalData.localKeyCode.setDTQFSPToTriggerDisplay_KC(kc));
                },
                setQFlBBFTMouseKCBut() {
                    const kc = this.__showInputKC("请输入快捷悬浮屏蔽面板是否跟随鼠标的快捷键");
                    this.__isPrintKC(kc, LocalData.localKeyCode.setQFlBBFollowsTheMouse_KC(kc));
                },
                setHQSBlockButton_KCBut() {
                    const kc = this.__showInputKC("请输入隐藏快捷悬浮面板的按键");
                    this.__isPrintKC(kc, LocalData.localKeyCode.setHideQuickSuspensionBlockButton_KC(kc));
                },
                setsetFixedQuickSPanelValue_KCBut() {
                    const kc = this.__showInputKC("请输入固定快捷悬浮屏蔽面板的快捷键");
                    this.__isPrintKC(kc, LocalData.localKeyCode.setFixedQuickSuspensionPanelValue_KC(kc));
                }
            },
            watch: {
                isMyButShow(newVal) {
                    LocalData.setMyButShow(newVal);
                    window.isShowVue.show = newVal;
                },
                isDShieldPanel(newVal) {
                    LocalData.setDShieldPanel(newVal);
                    Tip.success(`您更改了【禁用快捷悬浮屏蔽面板自动显示】的状态，当前为：${newVal ? "启用" : "不启用"}状态`);
                },
                isDShowHidePanel(newVal) {

                },
                isDShieldPanelFollowMouse(newVal) {
                    Tip.infoBottomRight(`${newVal ? '启动' : '禁用'}快捷悬浮屏蔽面板跟随鼠标`);
                },
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
                }
            }
        });
    }
}
