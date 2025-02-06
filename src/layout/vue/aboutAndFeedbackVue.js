import {eventEmitter} from "../../model/EventEmitter.js";

/**
 * 关于与反馈组件
 */
export const about_and_feedback_vue = {
    template: `
      <div>
      <el-card>
        <template #header>
          <span>作者b站</span>
        </template>
        <el-link target="_blank" href="https://space.bilibili.com/473239155" type="primary">b站传送门</el-link>
      </el-card>
      <el-card>
        <template #header>
          <span>交流群</span>
        </template>
        <el-link
            href="http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=tFU0xLt1uO5u5CXI2ktQRLh_XGAHBl7C&authKey=KAf4rICQYjfYUi66WelJAGhYtbJLILVWumOm%2BO9nM5fNaaVuF9Iiw3dJoPsVRUak&noverify=0&group_code=876295632"
            target="_blank" type="primary">====》Q群传送门《====
        </el-link>
        <el-tooltip content="点击查看群二维码">
          <el-tag @click="lookImgBut">876295632</el-tag>
        </el-tooltip>
      </el-card>


      <el-card>
        <template #header>
          <span>发布、更新、反馈地址</span>
        </template>
        <el-row>
          <el-col :span="12">
            <el-card>
              <span>greasyfork</span>
              <el-link target="_blank" type="primary" href="https://greasyfork.org/scripts/461382/">===》传送门《===
              </el-link>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <span>脚本猫</span>
              <el-link target="_blank" type="primary" href="https://scriptcat.org/zh-CN/script-show-page/1029/">
                ===》传送门《===
              </el-link>
            </el-card>
          </el-col>
        </el-row>

      </el-card>
      <el-card>
        <template #header>
          <span>开源地址</span>
        </template>
        <el-row>
          <el-col :span="12">
            <el-card>
              <span>gitee</span>
              <el-link target="_blank" type="primary" href="https://gitee.com/hangexi/BiBiBSPUserVideoMonkeyScript"
              >https://gitee.com/hangexi/BiBiBSPUserVideoMonkeyScript
              </el-link>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card>
              <span>github</span>
              <el-link target="_blank" type="primary" href="https://github.com/hgztask/BiBiBSPUserVideoMonkeyScript"
              >https://github.com/hgztask/BiBiBSPUserVideoMonkeyScript
              </el-link>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
      </div>`,
    data() {
        return {}
    },
    methods: {
        lookImgBut() {
            eventEmitter.send('显示图片对话框', {image: "https://www.mikuchase.ltd/img/qq_group_876295632.webp"})
        }

    },
    created() {
    }
}
