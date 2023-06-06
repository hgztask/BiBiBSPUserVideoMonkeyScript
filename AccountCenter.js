function ruleSharingSet(userName, userPassword, bool) {
    const loading = Qmsg.loading("请稍等...");
    $.ajax({
        type: "POST",
        url: "https://vip.mikuchase.ltd/bilibili/shieldRule/",
        data: {
            model: "setShare",
            userName: userName,
            userPassword: userPassword,
            postData: bool
        },
        dataType: "json",
        success: function (data) {
            loading.close();
            const message = data["message"];
            if (data["code"] !== 1) {
                Qmsg.error(message);
                return;
            }
            $("#ruleSharingDiv>span").text(bool);
            const getInfo = LocalData.AccountCenter.getInfo();
            if (Object.keys(getInfo).length === 0) {
                Qmsg.error("更新本地账户信息错误！");
                return;
            }
            getInfo["share"] = bool;
            LocalData.AccountCenter.setInfo(getInfo);
            Qmsg.success(message);
        }, error: function (xhr, status, error) { //请求失败的回调函数
            loading.close();
            console.log(error);
            console.log(status);
        }
    });
}

const AccountCenter = {//账号中心
    info: function () {//加载配置信息
        const getInfo = LocalData.AccountCenter.getInfo();
        if (getInfo === {} || Object.keys(getInfo).length === 0) {
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
            <div>
            <span>注册时间：</span><span id="asideuserAddTimeSpan">我是注册时间占位符</span>
            </div>
            <div id="ruleSharingDiv">
           规则共享状态：<span>我是规则共享状态占位符</span>
            <button value="public">公开我的规则</button>
            <button value="notPublic">不公开我的规则</button>
            </div>
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
        const share = getInfo["share"] === true;
        $("#userNameSpan").text(infoName);
        $("#asideuserAddTimeSpan").text(Util.timestampToTime(infoAddTime));
        $("#ruleSharingDiv>span").text(share);
        $("#exitSignBut").click(() => {
            if (!confirm("您确定要退出登录吗")) {
                return;
            }
            LocalData.AccountCenter.setInfo({});
            Qmsg.success("已退出登录！");
            $("#accountCenterLayout>*").remove();
            this.login();
        });
        $("#ruleSharingDiv>button[value='public']").click(() => {
            if (!confirm("确定要公开自己的规则吗？")) {
                return;
            }
            ruleSharingSet(infoName, getInfo["userPassword"], true);
        });
        $("#ruleSharingDiv>button[value='notPublic']").click(() => {
            if (!confirm("确定要不公开自己的规则吗？")) {
                return;
            }
            ruleSharingSet(infoName, getInfo["userPassword"], false);
        });
    }
}