const RuleCenterLayoutVue = {
    httpGetList() {
        return new Promise((resolve, reject) => {
            const data = {
                code: -1,
                message: "未能成功响应"
            };
            //TODO 后续对下面代码进行调整
            $.ajax({
                type: "GET",
                url: "https://api.mikuchase.ltd/bilibili/shieldRule/",
                data: {
                    model: "ruleCenter"
                },
                dataType: "json",
                success(body) {
                    const message = body["message"];
                    const code = body["code"];
                    data.message = message;
                    data.code = code;
                    if (code !== 1) {
                        reject(data);
                        return;
                    }
                    const tempDataList = [];
                    for (const v of body["list"]) {
                        const name = v["userName"];
                        const time = v["rule"]["time"];
                        const ruleList = v["rule"]["ruleRes"];
                        tempDataList.push({name: name, time: time, ruleList: ruleList});
                    }
                    data["dataList"] = tempDataList;
                    data["body"] = body;
                    resolve(data);
                }, error(xhr, status, error) { //请求失败的回调函数
                    data["xhr"] = xhr;
                    data["status"] = status;
                    data["error"] = error;
                    reject(data);
                }
            });
        })
    },
    returnVue() {
        const vue = new Vue({
            el: "#ruleCenterLayout",
            data: {
                list: [],
                isReloadListButShow: false,
            },
            methods: {
                reloadListBut() {
                    const loading = Qmsg.loading("正在重新加载，请稍等...");
                    this.isReloadListButShow = false;
                    const promise = RuleCenterLayoutVue.httpGetList();
                    promise.then(dataBody => {
                        Qmsg.success(dataBody.message);
                        this.list = dataBody.dataList;
                        this.isReloadListButShow = true;
                    }).catch(reason => {
                        this.isReloadListButShow = true;
                        debugger;
                        console.log(reason);
                    }).finally(() => {
                        loading.close();
                    });
                }
            }
        });
        return function () {
            return vue;
        }
    }
}