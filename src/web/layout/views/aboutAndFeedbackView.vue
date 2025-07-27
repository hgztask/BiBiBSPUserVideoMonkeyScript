<script>
import globalValue from "../../data/globalValue.js";
import {eventEmitter} from "../../model/EventEmitter.js";

/**
 * 关于与反馈组件
 */
export default {
  data() {
    return {
      group_url: globalValue.group_url,
      scriptCat_js_url: globalValue.scriptCat_js_url,
      b_url: globalValue.b_url,
      common_question_url: globalValue.common_question_url,
      update_log_url: globalValue.update_log_url
    }
  },
  methods: {
    lookImgBut() {
      eventEmitter.send('显示图片对话框', {image: "https://www.mikuchase.ltd/img/qq_group_876295632.webp"})
    }
  }
}
</script>
<template>
  <div>
    <el-card>
      <template #header>
        <span>作者b站</span>
      </template>
      <el-link :href="b_url" target="_blank" type="primary">b站传送门</el-link>
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
            <el-link href="https://greasyfork.org/scripts/461382/" target="_blank" type="primary">===》传送门《===
            </el-link>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <span>脚本猫</span>
            <el-link :href="scriptCat_js_url" target="_blank" type="primary">
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
            <el-link href="https://gitee.com/hangexi/BiBiBSPUserVideoMonkeyScript" target="_blank" type="primary"
            >https://gitee.com/hangexi/BiBiBSPUserVideoMonkeyScript
            </el-link>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <span>github</span>
            <el-link href="https://github.com/hgztask/BiBiBSPUserVideoMonkeyScript" target="_blank" type="primary"
            >https://github.com/hgztask/BiBiBSPUserVideoMonkeyScript
            </el-link>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
    <el-card>
      <template #header>常见问题和使用文档</template>
      <el-row>
        <el-col :span="12">
          常见问题
          <el-link :href="common_question_url" target="_blank" type="primary">==>传送门<==
          </el-link>
        </el-col>
        <el-col :span="12">
          使用文档
          <el-link href="https://docs.qq.com/doc/DSmJqSkhFaktBeUdk?u=1a1ff7b128d64f188a8bfb71b5acb28c" target="_blank"
                   type="primary">==>传送门<==
          </el-link>
        </el-col>
        <div>
          更新日志
          <el-link :href="update_log_url" target="_blank" type="primary">==>传送门<==</el-link>
        </div>
      </el-row>
    </el-card>
  </div>
</template>
