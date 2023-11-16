Util.addGMMenu('设置锁屏密码', () => LockScreen.setPwdShow());
Util.addGMMenu('重置锁屏密码', () => LockScreen.resetPwdShow());
Util.addGMMenu('设置加锁时间', () => LockScreen.setScreenLockTimeShow());
Util.addGMMenu("手动锁屏", () => LockScreen.manualLockScreen());
Util.addGMMenu('开关锁屏功能', () => LockScreen.ioLLockScreenShow());
Util.addGMMenu('查询锁屏时间', () => LockScreen.lookScreenLockTime());
Util.addGMMenu('禁用脚本快捷键', () => {
    const input = prompt(`当前脚快捷键状态为：${LocalData.isEnableShortcutKeys() ? "启用" : "禁用"}\n输入1为启用，输入0为禁用`);
    if (input === null) return;
    const is = {0: false, 1: true};
    if (is[input] === undefined) {
       Tip.error(`输入了意外的内容！`);
        return;
    }
    LocalData.setEnableShortcutKeys(is[input]);
    Tip.success(`已设置快捷键状态为：${is[input] ? "启用" : "禁用"}`);
});
Util.addGMMenu("显示隐藏控制面板", () => Home.hideDisplayHomeLaylout());
