<script>
import gmUtil from "../../utils/gmUtil.js";
import localMKData from "../../data/localMKData.js";

/**
 * 评论字数限制布局组件
 */
export default {
  data() {
    return {
      value: localMKData.getCommentWordLimitVal()
    }
  },
  watch: {
    value(newVal, oldVal) {
      //如果旧值小于3，则不做任何处理
      if (oldVal <= 3) return;
      if (newVal < 3) {
        this.$notify({
          message: '已关闭屏蔽字数限制功能',
          type: 'warning',
        })
      }
      gmUtil.setData('comment_word_limit', newVal)
    }
  }
}
</script>

<template>
  <div>
    <el-card shadow="never">
      <template #header>评论字数限制</template>
      <div>超出设置限制的字数时屏蔽(不包括)，低于3则不生效</div>
      <div>改动即生效</div>
      <el-input-number v-model="value"/>
    </el-card>
  </div>
</template>
