<script>
import localMKData from "../../data/localMKData.js";
import gmUtil from "../../utils/gmUtil.js";
import time_range_masking_table_vue from "./timeRangeMaskingTableView.vue";

/**
 * 时间范围屏蔽组件
 */
export default {
  components: {time_range_masking_table_vue},
  data() {
    return {
      status: localMKData.isTimeRangeMaskingStatus()
    }
  },
  watch: {
    status(n) {
      this.$notify({
        message: n ? '时间范围屏蔽已开启' : '时间范围屏蔽已关闭',
        type: n ? 'success' : 'warning'
      })
      gmUtil.setData('time_range_masking_status', n)
    }
  }
}
</script>
<template>
  <div>
    <el-card>
      <template #header>时间范围</template>
      <div>使用说明</div>
      <div>1.不能添加重复的时间范围或者小于已添加过的时间范围</div>
      <div>2.修改时间范围的值和状态会自动保存(包括删除)，会有提示</div>
      <div>3.每个时间范围可独立控制开关状态，关闭则该条范围不生效</div>
      <div>4.总开关优先级最高，关闭则所有时间范围不生效</div>
      <el-switch v-model="status" active-text="总开关"/>
    </el-card>
    <time_range_masking_table_vue/>
  </div>
</template>
