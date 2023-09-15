Util.addGMMenu('设置锁屏密码', () => {
    LockScreen.setPwdShow();
});
Util.addGMMenu('重置锁屏密码', () => {
    LockScreen.resetPwdShow();
});
Util.addGMMenu('设置加锁时间', () => {
    alert("这是锁屏密码重置功能！");
});

Util.addGMMenu('开关锁屏功能', () => {
    LockScreen.ioLLockScreenShow();
});