const AccountCenterVue = {
    returnVue() {
        const vue = new Vue({
            el: "#accountCenterLayout",
            components: {
                login: {//已登录状态
                    template: `
                        <div>
                        <h1>个人信息</h1>
                        <div style="display: flex">
                            <img src="https://hangexi.gitee.io/datafile/img/defaultAvatar.png"
                                 style="border-radius: 50%; height: 100px;" alt="图片加载不出来">
                            <div
                                style="display: flex;align-items: flex-start;padding-left: 10px;flex-direction: column;justify-content: center;">
                                <div>
                                    <span>用户名：</span><span>{{ userName }}</span>
                                </div>
                                <div>
                                    <span>注册时间：</span><span>{{ addTime }}</span>
                                </div>
                                <div id="ruleSharingDiv">
                                    规则共享状态：<span>{{ sharedState }}</span>
                                    <button @click="publicStateBut">公开我的规则</button>
                                    <button @click="notPublicStateBut">不公开我的规则</button>
                                    <input type="checkbox" v-model="isAnonymityCheckbox"><span
                                    title="选中为匿名公布，反之不匿名公布，每次提交会覆盖上一次的匿名状态">是否匿名公布(鼠标悬停我提示信息)</span>
                                </div>
                            </div>
                        </div>
                        <hr>
                        <div style="display: flex;justify-content: center;">
                            <button>
                                <a href="${registeredAddress}" target="_blank">注册</a>
                            </button>
                            <button @click="exitSignBut">退出登录</button>
                        </div>
                        </div>`,
                    data() {
                        return {
                            userName: "我是用户名占位符",
                            addTime: "我是注册时间占位符",
                            pwd: "",
                            sharedState: false,
                            isAnonymityCheckbox: false

                        }
                    },
                    methods: {
                        exitSignBut() {
                            if (!confirm("您确定要退出登录吗")) return;
                            LocalData.AccountCenter.setInfo({});
                            Qmsg.success("已退出登录！");
                            this.$emit("tab-click", "notLogin");
                        },
                        publicStateBut() {
                            if (!confirm("确定要公开自己的规则吗？\n匿名状态=" + this.isAnonymityCheckbox)) return;
                            ruleSharingSet(this.userName, this.pwd, true, this.isAnonymityCheckbox);
                        },
                        notPublicStateBut() {
                            if (!confirm("确定不公开自己的规则吗？")) return;
                            ruleSharingSet(this.userName, this.pwd, false, false);
                        }
                    },
                    created() {
                        let {name, pwd, share, addTime} = LocalData.AccountCenter.getInfo();
                        this.userName = name;
                        this.addTime = Util.timestampToTime(addTime);
                        this.sharedState = share;
                        this.pwd = pwd;
                    }
                },
                notLogin: {
                    template: `
                        <div style="display: flex;flex-direction: column;align-items: center;">
                        <h1>登录账号</h1>
                        <input type="text" placeholder="用户名" v-model.trim="userName">
                        <input type="text" placeholder="密码" v-model.trim="userPwd">
                        <div>
                            <button>
                                <a href="${registeredAddress}" target="_blank">注册</a>
                            </button>
                            <button @click="loginBut">登录</button>
                        </div>
                        </div>`,
                    data() {
                        return {userName: "", userPwd: ""}
                    },
                    methods: {
                        loginBut() {
                            const captcha = Util.randomNum(1000, 9999);
                            const s = prompt("请输入验证码\n" + captcha);
                            if (s === null) return;
                            if (s !== (captcha + "")) {
                                alert("验证码错误！");
                                return;
                            }
                            if (this.userName === "" || this.userPwd === "") {
                                alert("请正常填写账号信息！");
                                return;
                            }
                            if (this.userPwd.length < 6) {
                                alert("密码长度需要大于或登录6位");
                                return;
                            }
                            const loading = Qmsg.loading("正在登录中...");
                            const promise = HttpUtil.get(`${defApi}/bilibili/signInToRegister.php?userName=${this.userName}&userPassword=${this.userPwd}&model=logIn`);
                            promise.then(({bodyJson: body}) => {
                                const {code, message, userData} = body;
                                if (code !== 1) {
                                    Qmsg.error(message);
                                    return;
                                }
                                let {rule_content} = userData;
                                rule_content = JSON.parse(rule_content);
                                debugger;
                                try {
                                    delete userData["rule_content"];
                                } catch (e) {
                                    console.error("登录时出错！", e);
                                }
                                if (confirm("是要将云端规则导入覆盖本地规则吗？")) {
                                    ruleCRUDLlayoutVue().inputRuleLocalData(rule_content);
                                }
                                LocalData.AccountCenter.setInfo(userData);
                                Qmsg.success(message);
                                this.$emit("tab-click", "login");

                            }).catch((error) => {
                                console.log(error);
                            }).finally(() => {
                                loading.close();
                            });
                        }
                    }
                }
            },
            data() {
                return {
                    isTab: "login",
                }
            },
            methods: {
                getTabName(tabName) {
                    this.isTab = tabName;
                }
            },
            created() {
                const getInfo = LocalData.AccountCenter.getInfo();
                if (getInfo === {} || Object.keys(getInfo).length === 0) {//没有就进入非登录页面
                    this.isTab = "notLogin";
                } else {//有就进入已登录页面
                    this.isTab = "login";
                }
            }

        });
        return function () {
            return vue;
        }
    }
}


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
            const getInfo = LocalData.AccountCenter.getInfo();
            if (Object.keys(getInfo).length === 0) {
                Qmsg.error("更新本地账户信息错误！");
                return;
            }
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