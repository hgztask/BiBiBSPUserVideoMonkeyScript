import {eventEmitter} from "../../model/EventEmitter.js";
import globalValue from '../../data/globalValue.js'

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
        <el-link target="_blank" :href="b_url" type="primary">b站传送门</el-link>
      </el-card>
      <el-card>
        <template #header>
          <span>交流群</span>
        </template>
        <el-link
            :href='group_url' target="_blank" type="primary">====》Q群传送门《====
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
              <el-link target="_blank" type="primary" :href="scriptCat_js_url">
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
        return {
            group_url: globalValue.group_url,
            scriptCat_js_url: globalValue.scriptCat_js_url,
            b_url: globalValue.b_url
        }
    },
    methods: {
        lookImgBut() {
            eventEmitter.send('显示图片对话框', {image: "https://www.mikuchase.ltd/img/qq_group_876295632.webp"})
        }

    },
    created() {
    }
}
