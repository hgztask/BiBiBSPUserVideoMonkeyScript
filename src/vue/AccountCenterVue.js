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
                            <img src="https://tc.dhmip.cn/imgs/2024/04/30/7247e547a33ce1ed.png"
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
                                    <button @click="ruleSharingSet(true)">公开我的规则</button>
                                    <button @click="ruleSharingSet(false)">不公开我的规则</button>
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
                            sharedState: false,
                            isAnonymityCheckbox: false
                        }
                    },
                    methods: {
                        exitSignBut() {
                            if (!confirm("您确定要退出登录吗")) return;
                            LocalData.AccountCenter.setInfo({});
                            Tip.success("已退出登录！");
                            this.$emit("tab-click", "notLogin");
                        },
                        //设置规则共享
                        ruleSharingSet(isPublic) {
                            const userInfo = LocalData.AccountCenter.getInfo();
                            if (Object.keys(userInfo).length === 0) {
                                Tip.error("未登录！");
                                return;
                            }
                            const {name, pwd} = userInfo;
                            const loading = Tip.loading("请稍等...");
                            if (!confirm(`确定${isPublic ? "公开" : "不公开"}自己的规则吗？\n匿名状态=${this.anonymity}`)) return;
                            $.ajax({
                                type: "POST",
                                url: `${defApi}/bilibili/`,
                                data: {
                                    model: "setShare",
                                    userName: name,
                                    userPassword: pwd,
                                    share: isPublic,
                                    anonymity: this.anonymity
                                },
                                dataType: "json",
                                success({code, message, share, anonymity}) {
                                    loading.close();
                                    if (code !== 1) {
                                        Tip.error(message);
                                        return;
                                    }
                                    userInfo["share"] = this.sharedState = share;
                                    userInfo["anonymity"] = this.anonymity = anonymity;
                                    LocalData.AccountCenter.setInfo(userInfo);
                                    Tip.success(message);
                                },
                                error(xhr, status, error) {
                                    loading.close();
                                    console.log(error);
                                    console.log(status);
                                }
                            })
                            ;
                        }
                    },
                    created() {
                        let {name, share, addTime, anonymity} = LocalData.AccountCenter.getInfo();
                        this.userName = name;
                        this.addTime = Util.timestampToTime(addTime);
                        this.sharedState = share === 1;
                        this.isAnonymityCheckbox = anonymity === 1;
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
                            const loading = Tip.loading("正在登录中...");
                            const promise = HttpUtil.get(`${defApi}/bilibili/signInToRegister.php?userName=${this.userName}&userPassword=${this.userPwd}&model=logIn`);
                            promise.then(({bodyJson}) => {
                                const {code, message, userInfo, userRule} = bodyJson;
                                if (code !== 1) {
                                    Tip.error(message);
                                    return;
                                }
                                Tip.success(message);
                                if (userRule === null) {
                                    LocalData.AccountCenter.setInfo(userInfo);
                                } else {
                                    userInfo["first_push_time"] = userRule["first_push_time"];
                                    userInfo["anonymity"] = userRule["anonymity"];
                                    userInfo["share"] = userRule["share"];
                                    LocalData.AccountCenter.setInfo(userInfo);
                                    const rule_content = JSON.parse(userRule["rule_content"]);
                                    if (confirm("是要将云端规则导入覆盖本地规则吗？")) {
                                        window.RuleCRUDLayoutVue.inputRuleLocalData(rule_content);
                                    }
                                }
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
