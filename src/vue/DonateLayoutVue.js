const DonateLayoutVue = {
    returnVue() {
        const vue = new Vue({
            el: "#home_layout #donateLayout",
            data: {
                list: [
                    {
                        name: "支付宝赞助",
                        alt: "支付宝支持",
                        src: "https://hangexi.gitee.io/datafile/img/paymentCodeZFB.png"
                    },
                    {name: "微信赞助", alt: "微信支持", src: "https://hangexi.gitee.io/datafile/img/paymentCodeWX.png"},
                    {name: "QQ赞助", alt: "QQ支持", src: "https://hangexi.gitee.io/datafile/img/paymentCodeQQ.png"},
                ]
            }
        });
        return function () {
            return vue;
        }
    }
}