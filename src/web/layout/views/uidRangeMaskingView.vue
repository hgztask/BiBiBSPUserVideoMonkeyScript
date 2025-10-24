<script>
import localMKData from "../../data/localMKData.js";

/**
 * uid范围屏蔽vue组件
 */
export default {
  data() {
    return {
      status: localMKData.isUidRangeMaskingStatus(),
      head: 0,
      tail: 100
    }
  },
  methods: {
    setRangeBut() {
      this.$alert('设置成功')
      GM_setValue('uid_range_masking', [this.head, this.tail])
    }
  },
  watch: {
    head(newVal, oldVal) {
      if (newVal > this.tail) {
        this.$message('最小值不能大于最大值')
        this.head = oldVal
      }
    },
    tail(newVal, oldVal) {
      if (newVal < this.head) {
        this.$message('最大值不能小于最小值')
        this.tail = oldVal
      }
    },
    status(n) {
      GM_setValue('uid_range_masking_status', n)
    }
  },
  created() {
    const arr = localMKData.getUidRangeMasking();
    this.head = arr[0]
    this.tail = arr[1]
  }
}
</script>
<template>
  <div>
    <el-card>
      <template #header>
        uid范围屏蔽
      </template>
      <div style="margin-bottom: 10px">
        范围内的uid都会被屏蔽掉，改动需重新设置方可生效，且再下次检查时屏蔽(如视频列表加载，评论加载)。比较关系【最小>=uid<=最大】
      </div>
      <el-switch v-model="status" active-text="启用" style="margin-bottom: 10px"/>
      <el-input v-model.number="head" style="width: 30%;">
        <template #prepend>最小</template>
      </el-input>
      <el-input v-model.number="tail" style="width: 30%;">
        <template #prepend>最大</template>
      </el-input>
      <el-button @click="setRangeBut">设置</el-button>
    </el-card>
  </div>
</template>
