import gmUtil from "../../utils/gmUtil.js";
import globalValue from "../../data/globalValue.js";

/**
 * 支持打赏组件
 * 该组件需要时才加载
 */
export default {
    template: `
      <div>
        <el-card shadow="hover">
          <template #header>
            <span>零钱赞助</span>
          </template>
          <span>1元不嫌少，10元不嫌多，感谢支持！</span>
          <el-divider/>
          <span>生活不易，作者叹息</span>
          <el-divider/>
          <span>用爱发电不容易，您的支持是我最大的更新动力</span>
        </el-card>
        <el-divider/>
        <div class="el-vertical-center" @click="gotoAuthorBut">
          <el-avatar size="large"
                     src="//i0.hdslb.com/bfs/face/87e9c69a15f7d2b68294be165073c8e07a541e28.jpg@128w_128h_1c_1s.webp"></el-avatar>
        </div>
        <div class="el-vertical-center">
          <el-button round type="primary" @click="showDialogBut">打赏点猫粮</el-button>
        </div>
        <el-dialog
            center
            :title="dialogIni.title"
            :visible.sync="dialogIni.show">
          <div class="el-vertical-center">
            <el-image v-for="item in list"
                      :src="item.src"
                      style="height: 300px"
                      :preview-src-list="dialogIni.srcList"/>
          </div>
        </el-dialog>
      </div>`,
    data() {
        return {
            list: [
                {
                    name: "支付宝赞助",
                    alt: "支付宝支持",
                    src: "https://www.mikuchase.ltd/img/paymentCodeZFB.webp"
                },
                {name: "微信赞助", alt: "微信支持", src: "https://www.mikuchase.ltd/img/paymentCodeWX.webp"},
                {name: "QQ赞助", alt: "QQ支持", src: "https://www.mikuchase.ltd/img/paymentCodeQQ.webp"},
            ],
            dialogIni: {
                title: "打赏点猫粮",
                show: false,
                srcList: []
            }
        }
    },
    methods: {
        showDialogBut() {
            this.dialogIni.show = true
        },
        gotoAuthorBut() {
            gmUtil.openInTab(globalValue.b_url)
        }
    },
    created() {
        this.dialogIni.srcList = this.list.map(x => x.src)
    }
}
