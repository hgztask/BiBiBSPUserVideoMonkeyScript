const LockScreen = {
    screen: LocalData.LockScreen,
    verifyPwd() {//验证锁屏密码流程
        const pwd = this.screen.getPwd();
        if (pwd === null) {
            return true;
        }
        const input = prompt("您需要输入锁屏密码来验证身份")
        if (input === null) return null;
        return input === pwd;

    },
    setPwdShow(isVerifyPod = true) {//设置锁屏密码流程
        if (isVerifyPod) {
            const verifyPwd = this.verifyPwd();
            if (verifyPwd === null) return;
            if (!verifyPwd) {
                Qmsg.error("验证失败！");
                return;
            }
        }
        const oldPwd = this.screen.getPwd();
        let newPwd = prompt("请输入新的锁屏密码作为锁屏密码");
        if (newPwd === null) return;
        newPwd = newPwd.trim();
        if (newPwd === oldPwd) {
            alert("旧锁屏密码不能和新密码相同！");
            return;
        }
        this.screen.setPwd(newPwd);
        const tip = `设置成功！，您当前的锁屏密码为${newPwd}`;
        Qmsg.success(tip);
        Print.ln(tip);
        alert(tip);
    },
    resetPwdShow() {//重置锁屏密码流程
        const verifyPwd = this.verifyPwd();
        if (verifyPwd === null) return;
        if (!verifyPwd) {
            Qmsg.error("验证失败！");
            return;
        }
        this.setPwdShow(false);
    },
    ioLLockScreenShow() {//设置锁屏的开关
        const pwd = this.screen.getPwd();
        if (pwd === null) {
            if (!confirm("请先设置锁屏密码先，点击确定设置锁屏密码，取消则取消")) {
                return;
            }
            this.setPwdShow();
            return;
        }
        const verifyPwd = this.verifyPwd();
        if (verifyPwd === null) return;
        if (verifyPwd === false) {
            Qmsg.error("验证失败！");
            return;
        }
        const s = prompt(`输入1为开启，0为关闭，当前为${this.screen.getState() ? "开启" : "关闭"}状态`);
        if (s === null) return;
        let boo = null;
        if (s == "1") {
            boo = true;
        }
        if (s == "0") {
            boo = false;
        }
        if (boo === null) {
            Qmsg.error("输入错误，请按照格式正确输入！");
            return;
        }
        const state = this.screen.getState();
        if (state === boo) {
            alert("相同状态无需设置！");
            return;
        }
        this.screen.setState(boo);
        const tip = `已设置锁屏开关状态，当前为${boo ? "开启" : "关闭"}状态`;
        Qmsg.success(tip);
        Print.ln(tip);
        alert(tip);
    }
}