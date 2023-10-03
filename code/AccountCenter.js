/**
 *
 * @param userName
 * @param userPassword
 * @param {boolean}shareBool 共享状态
 * @param {boolean}anonymityBool 匿名状态
 */
function ruleSharingSet(userName, userPassword, shareBool, anonymityBool) {
    const loading = Qmsg.loading("请稍等...");
    $.ajax({
        type: "POST",
        url: "https://api.mikuchase.ltd/bilibili/shieldRule/",
        data: {
            model: "setShare",
            userName: userName,
            userPassword: userPassword,
            postData: shareBool,
            anonymity: anonymityBool
        },
        dataType: "json",
        success(data) {
            loading.close();
            const message = data["message"];
            if (data["code"] !== 1) {
                Qmsg.error(message);
                return;
            }
            $("#ruleSharingDiv>span").text(shareBool);
            const getInfo = LocalData.AccountCenter.getInfo();
            if (Object.keys(getInfo).length === 0) {
                Qmsg.error("更新本地账户信息错误！");
                return;
            }
            getInfo["share"] = shareBool;
            LocalData.AccountCenter.setInfo(getInfo);
            Qmsg.success(message);
        }, error(xhr, status, error) {
            loading.close();
            console.log(error);
            console.log(status);
        }
    });
}

const AccountCenter = {//账号中心
    info() {//加载配置信息
        const getInfo = LocalData.AccountCenter.getInfo();
        if (getInfo === {} || Object.keys(getInfo).length === 0) {
            this.login();
            return;
        }
        this.haveLanded();
    },
    login() {//未登录
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
            const promise = HttpUtil.get(`https://api.mikuchase.ltd/bilibili/shieldRule/SignInToRegister?userName=${userName}&userPassword=${userPass}`);
            promise.then(res => {
                const body = res.bodyJson;
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
            }).catch((error) => {
                console.log(error);
            }).finally(() => {
                loading.close();
            });
        });
    },
    haveLanded() {//已登录
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
            <input type="checkbox" id="isAnonymityCheckbox"><span title="选中为匿名公布，反之不匿名公布，每次提交会覆盖上一次的匿名状态">是否匿名公布(鼠标悬停我提示信息)</span> 
            </div>
        </div>
    </div>
    <hr>
    <div style="display: flex;justify-content: center;">
     <button>
     <a href="https://api.mikuchase.ltd/bilibili/shieldRule/enroll/" target="_blank">注册</a>
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
        $("#ruleSharingDiv>span:eq(0)").text(share);
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
            const isAnonymity = $('#isAnonymityCheckbox').prop('checked');
            if (!confirm("确定要公开自己的规则吗？\n匿名状态=" + isAnonymity)) {
                return;
            }
            ruleSharingSet(infoName, getInfo["userPassword"], true, isAnonymity);
        });
        $("#ruleSharingDiv>button[value='notPublic']").click(() => {
            if (!confirm("确定不公开自己的规则吗？")) {
                return;
            }
            ruleSharingSet(infoName, getInfo["userPassword"], false, false);
        });
    }
}