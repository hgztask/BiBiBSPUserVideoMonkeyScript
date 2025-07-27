<script>
import bFetch from '../../model/bFetch.js'

/**
 * 弹幕词管理
 */
export default {
  data: () => {
    return {
      resData: {},
      resList: [],
    }
  },
  methods: {
    // 初始化
    async initial() {
      const {state, list, msg} = await bFetch.fetchGetBarrageBlockingWords();
      if (!state) {
        this.$message.warning(msg)
        return false
      }
      this.resList = list
      this.$notify({message: '已初始化', type: 'success'})
      return true
    },
    fetchGetBarrageBlockingWordsBut() {
      if (this.resList.length === 0) {
        this.$message.info('未有弹幕屏蔽词内容或未初始化')
        return
      }
      const list = this.resList
      this.$message.success(`已打印在控制台上，数量${list.length}`)
      console.log('获取弹幕屏蔽词_start=====')
      console.log(list);
      console.log('获取弹幕屏蔽词_end=======')
    },
    outToJsonFIleBut() {

    }
  },
  created() {
    this.initial()
  }
}
</script>
<template>
  <div>
    <el-button @click="fetchGetBarrageBlockingWordsBut">获取弹幕屏蔽词</el-button>
    <el-button @click="outToJsonFIleBut">导出至json文件</el-button>
  </div>
</template>
