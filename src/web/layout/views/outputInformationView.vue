<script>
import {eventEmitter} from "../../model/EventEmitter.js";
import defUtil from "../../utils/defUtil.js";
import localMKData from "../../data/localMKData.js";
import {isWsService} from "../../model/debuggerMeanagement.js";
// 输出信息字体颜色
const outputInformationFontColor = localMKData.getOutputInformationFontColor();
// 高亮信息字体颜色
const highlightInformationColor = localMKData.getHighlightInformationColor();

export default {
  data() {
    return {
      //输出信息
      outputInfoArr: [],
    }
  },
  methods: {
    clearInfoBut() {
      this.$confirm('是否清空信息', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.outputInfoArr = [];
        this.$notify({
          message: '已清空信息',
          type: 'success'
        })
      })
    }
  },
  created() {
    eventEmitter.on('打印信息', (content) => {
      const liEL = document.createElement("li");
      liEL.innerHTML = content;
      this.outputInfoArr.push(liEL.innerHTML)
    })
    eventEmitter.on('event-打印屏蔽视频信息', (type, matching, videoData) => {
      if (isWsService()) {
        eventEmitter.send('ws-send-json', {type, matching, videoData})
      }
      const toTimeString = defUtil.toTimeString();
      const {name, uid, title, videoUrl} = videoData;
      const info = `<b style="color: ${outputInformationFontColor}; " gz_bezel>
${toTimeString}-根据${type}-${matching ? `<b style="color: ${highlightInformationColor}">【${matching}】</b>` : ""}-屏蔽用户【${name}】uid=
            <a href="https://space.bilibili.com/${uid}"
            style="color: ${highlightInformationColor}"
            target="_blank">【${uid}】</a>
            标题【<a href="${videoUrl}" target="_blank" style="color: ${highlightInformationColor}">${title}</a>】
            </b>`
      this.outputInfoArr.push(info)
    })

    eventEmitter.on('屏蔽评论信息', (type, matching, commentData) => {
      const toTimeString = defUtil.toTimeString();
      const {name, uid, content} = commentData;
      this.outputInfoArr.push(`<b style="color: ${outputInformationFontColor}; " gz_bezel>
${toTimeString}-根据${type}-${matching ? `<b style="color: ${highlightInformationColor}">【${matching}】</b>` : ""}-屏蔽用户【${name}】uid=
            <a href="https://space.bilibili.com/${uid}"
            style="color: ${highlightInformationColor}"
            target="_blank">【${uid}】</a>
            评论【${content}】
            </b>`)
    })

    eventEmitter.on('正则匹配时异常', (errorData) => {
      const {msg, e} = errorData
      this.outputInfoArr.push(msg)
      console.error(msg)
      throw new Error(e)
    })
  }
}
</script>

<template>
  <div>
    <el-button type="info" @click="clearInfoBut">清空消息</el-button>
    <div v-for="item in outputInfoArr" v-html="item"></div>
  </div>
</template>
