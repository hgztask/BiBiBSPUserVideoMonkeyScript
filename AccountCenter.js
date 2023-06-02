const AccountCenter = {//账号中心
    info: function () {//加载配置信息
        const getInfo = LocalData.AccountCenter.getInfo();
        if (getInfo === {} || getInfo === null || Object.keys(getInfo).length === 0) {
            this.login();
            return;
        }
        this.haveLanded();
    },
    login: function () {//未登录
        $("#accountCenterLayout").append(layout.getLogin());
        $("#loginBut").click(() => {
            const captcha = Util.randomNum(1000, 9999);
            const s = prompt("请输入验证码\n" + captcha);
            if (s === null) {
                return;
            }
            if (s !== (captcha + "")) {
                alert("验证码错误！");
                return;
            }
            const userName = $("#userNameInput").val();
            const userPass = $("#userPasswordInput").val();
            if (userName === "" || userName.includes(" ") || userPass === "" || userPass.includes(" ")) {
                alert("请正常填写账号信息！");
                return;
            }
            if (userPass.length < 6) {
                alert("密码长度需要大于或登录6位");
                return;
            }
            const loading = Qmsg.loading("正在登录中...");
            HttpUtil.get(`https://vip.mikuchase.ltd/bilibili/shieldRule/SignInToRegister?userName=${userName}&userPassword=${userPass}`, (res) => {
                loading.close();
                const body = JSON.parse(res.responseText);
                const code = body["code"];
                const message = body["message"];
                if (code !== 1) {
                    Qmsg.error(message);
                    return;
                }
                const ruleData = body["ruleData"];
                LocalData.AccountCenter.setInfo(body["userInfo"]);
                Qmsg.success("登录成功！");
                $("#accountCenterLayout>*").remove();
                this.haveLanded();
            }, (err) => {
                loading.close();
                console.log(err)
            });

        });
    },
    haveLanded: function () {//已登录
        $("#accountCenterLayout").append(`<div>
    <h1>个人信息</h1>
    <div style="display: flex">
        <img src="https://hangexi.gitee.io/datafile/img/defaultAvatar.png"
             style="border-radius: 50%; height: 100px;">
        <div style="display: flex;align-items: flex-start;padding-left: 10px;flex-direction: column;justify-content: center;">
            <div>
                <span>用户名：</span><span id="userNameSpan">我是用户名占位符</span>
            </div>
            <div><span>注册时间：</span><span id="asideuserAddTimeSpan">我是注册时间占位符</span></div>
        </div>
    </div>
    <hr>
    <div style="display: flex;justify-content: center;">
     <button>
     <a href="https://vip.mikuchase.ltd/bilibili/shieldRule/enroll/" target="_blank">注册</a>
     </button>
        <button id="exitSignBut">退出登录</button>
    </div>
</div>`);
        const getInfo = LocalData.AccountCenter.getInfo();
        const infoName = getInfo["userName"];
        const infoAddTime = getInfo["addTime"];
        $("#userNameSpan").text(infoName);
        $("#asideuserAddTimeSpan").text(Util.timestampToTime(infoAddTime));
        $("#exitSignBut").click(() => {
            if (!confirm("您确定要退出登录吗")) {
                return;
            }
            LocalData.AccountCenter.setInfo({});
            Qmsg.success("已退出登录！");
            $("#accountCenterLayout>*").remove();
            this.login();
        });
    }
}