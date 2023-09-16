Util.addGMMenu('设置锁屏密码', () => LockScreen.setPwdShow());
Util.addGMMenu('重置锁屏密码', () => LockScreen.resetPwdShow());
Util.addGMMenu('设置加锁时间', () => LockScreen.setScreenLockTimeShow());

Util.addGMMenu("手动锁屏", () => LockScreen.manualLockScreen());

Util.addGMMenu('开关锁屏功能', () => LockScreen.ioLLockScreenShow());
Util.addGMMenu('查询锁屏时间', () => LockScreen.lookScreenLockTime());