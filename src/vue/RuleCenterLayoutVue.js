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
                url: `${defApi}/bilibili/`,
                data: {
                    model: "ruleCenter"
                },
                dataType: "json",
                success({message, code, dataList}) {//上面已声明了json，之后响应体会自动转成json处理
                    data.message = message;
                    data.code = code;
                    if (code !== 1) {
                        reject(data);
                        return;
                    }
                    const tempDataList = [];
                    for (const {name, rule_content, first_push_time, update_time} of dataList) {
                        tempDataList.push({
                            name: name,
                            ruleList: JSON.parse(rule_content),
                            update_time: update_time,
                            first_push_time: first_push_time
                        });
                    }
                    data["dataList"] = tempDataList;
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
        window.ruleCenterLayoutVue = new Vue({
            el: "#ruleCenterLayout",
            data: {
                list: [],
                isReloadListButShow: false,
            },
            methods: {
                reloadListBut() {
                    const loading = Tip.loading("正在重新加载，请稍等...");
                    this.isReloadListButShow = false;
                    const promise = RuleCenterLayoutVue.httpGetList();
                    promise.then(dataBody => {
                        Tip.success(dataBody.message);
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
    }
}