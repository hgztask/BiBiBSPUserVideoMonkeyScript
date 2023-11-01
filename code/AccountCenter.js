/**
 *
 * 设置规则共享
 * @param userName
 * @param userPassword
 * @param {boolean}shareBool 共享状态
 * @param {boolean}anonymityBool 匿名状态
 */
function ruleSharingSet(userName, userPassword, shareBool, anonymityBool) {
    const loading = Qmsg.loading("请稍等...");
    $.ajax({
        type: "POST",
        url: `${defApi}/bilibili/`,
        data: {
            model: "setShare",
            userName: userName,
            userPassword: userPassword,
            share: shareBool,
            anonymity: anonymityBool
        },
        dataType: "json",
        success({message, code, share}) {
            loading.close();
            if (code !== 1) {
                Qmsg.error(message);
                return;
            }
            // $("#ruleSharingDiv>span").text(share);
            //TODO 这里需要调整，是否匿名公布布尔值显示效果，不需要为0，要求为false或者true
            const getInfo = LocalData.AccountCenter.getInfo();
            if (Object.keys(getInfo).length === 0) {
                Qmsg.error("更新本地账户信息错误！");
                return;
            }
            //TODO 待调整，有关于该share的布尔值字符串问题
            getInfo["share"] = share;
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
            const promise = HttpUtil.get(`${defApi}/bilibili/signInToRegister.php?userName=${userName}&userPassword=${userPass}&model=logIn`);
            promise.then(({bodyJson: body}) => {
                const {code, message, userData} = body;
                if (code !== 1) {
                    Qmsg.error(message);
                    return;
                }
                // const ruleData = body["ruleData"];
                //TODO 由于api接口变动，需要适配接口的变化，相关代码需要修正后续需要调整为登录之后顺带提示用户是否要覆盖本地的规则！
                let {rule_content} = userData;
                rule_content = JSON.parse(rule_content);
                debugger;
                try {
                    // delete userData["share"];
                    // delete userData["anonymity"];
                    delete userData["rule_content"];
                } catch (e) {
                    console.error("登录时出错！", e);
                }
                if (confirm("是要将云端规则导入覆盖本地规则吗？")) {
                    ruleCRUDLlayoutVue().inputRuleLocalData(rule_content);
                }
                LocalData.AccountCenter.setInfo(userData);
                Qmsg.success(message);
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
     <a href="https://www.mikuchase.ltd/web/#/registerAndLogIn" target="_blank">注册</a>
     </button>
        <button id="exitSignBut">退出登录</button>
    </div>
</div>`);
        let {name: infoName, pwd, share, addTime: infoAddTime} = LocalData.AccountCenter.getInfo();
        $("#userNameSpan").text(infoName);
        $("#asideuserAddTimeSpan").text(Util.timestampToTime(infoAddTime));
        //TODO 这里需要调整，是否匿名公布布尔值显示效果，不需要为0，要求为false或者true
        // $("#ruleSharingDiv>span:eq(0)").text(share);
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
            ruleSharingSet(infoName, pwd, true, isAnonymity);
        });
        $("#ruleSharingDiv>button[value='notPublic']").click(() => {
            if (!confirm("确定不公开自己的规则吗？")) {
                return;
            }
            ruleSharingSet(infoName, pwd, false, false);
        });
    }
}