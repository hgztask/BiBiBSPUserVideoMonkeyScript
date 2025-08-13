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
    },
    /**
     * 更新输出信息
     * 统计次数和更新时间·
     * 将旧信息移到数组头部
     * 重复content时更新，重复唯一id时更新
     */
    updateOutInfo(infoData, index) {
      const outPutInfoData = this.outputInfoArr[index];
      outPutInfoData.count++;
      outPutInfoData.time = defUtil.toTimeString();
      outPutInfoData.content = infoData.content;
      this.outputInfoArr.splice(index, 1);
      this.outputInfoArr.unshift(outPutInfoData);
    },
    addOutInfo(infoData) {
      const findIdIndex = this.outputInfoArr.findIndex(item => {
        if (infoData.id === undefined || item.id === undefined) {
          return false;
        }
        return item.id === infoData.id;
      });
      if (findIdIndex !== -1) {
        this.updateOutInfo(infoData, findIdIndex);
        return;
      }
      const findContentIndex = this.outputInfoArr.findIndex(item => item.content === infoData.content);
      if (findContentIndex !== -1) {
        this.updateOutInfo(infoData, findContentIndex);
        return;
      }
      infoData.time = defUtil.toTimeString();
      infoData.count = 1;
      this.outputInfoArr.unshift(infoData);
    },
  },
  created() {
    eventEmitter.on('打印信息', (content) => {
      this.addOutInfo({type: 'info', content})
    })
    eventEmitter.on('event-update-out-info', (data) => {
      this.addOutInfo({
        type: 'update-out-info',
        id: data.id,
        content: data.msg
      })
    })
    eventEmitter.on('event-打印屏蔽视频信息', (type, matching, videoData) => {
      if (isWsService()) {
        eventEmitter.send('ws-send-json', {type, matching, videoData})
      }
      const {name, uid, title, videoUrl} = videoData;
      const info = `<b style="color: ${outputInformationFontColor}; ">
根据${type}-${matching ? `<b style="color: ${highlightInformationColor}">【${matching}】</b>` : ""}-屏蔽用户【${name}】uid=
            <a href="https://space.bilibili.com/${uid}"
            style="color: ${highlightInformationColor}"
            target="_blank">【${uid}】</a>
            标题【<a href="${videoUrl}" target="_blank" style="color: ${highlightInformationColor}">${title}</a>】
            </b>`
      this.addOutInfo({
        type: 'shield-video-info',
        content: info
      })
    })

    eventEmitter.on('屏蔽评论信息', (type, matching, commentData) => {
      const {name, uid, content} = commentData;
      this.addOutInfo({
        type: 'shield-comment-info',
        content: `<b style="color: ${outputInformationFontColor};">
根据${type}-${matching ? `<b style="color: ${highlightInformationColor}">【${matching}】</b>` : ""}-屏蔽用户【${name}】uid=
            <a href="https://space.bilibili.com/${uid}"
            style="color: ${highlightInformationColor}"
            target="_blank">【${uid}】</a>
            评论【${content}】
            </b>`
      })
    })

    eventEmitter.on('正则匹配时异常', (errorData) => {
      const {msg, e} = errorData
      this.addOutInfo({
        type: 'error',
        content: msg
      })
      console.error(msg)
      throw new Error(e)
    })
  }
}
</script>

<template>
  <div>
    <el-table :data="outputInfoArr" border stripe>
      <el-table-column prop="time" label="显示时间" width="148">
      </el-table-column>
      <el-table-column>
        <template #header>
          <el-button type="info" @click="clearInfoBut">清空消息</el-button>
        </template>
        <template v-slot="scope">
          <div v-html="scope.row.content"></div>
        </template>
      </el-table-column>
      <el-table-column label="计数" width="50" prop="count"></el-table-column>
    </el-table>
  </div>
</template>
