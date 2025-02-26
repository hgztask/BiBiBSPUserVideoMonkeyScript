import localMKData from "../data/localMKData.js";
import gmUtil from "../utils/gmUtil.js";

/**
 * 时间范围屏蔽组件
 */
export const time_range_masking_vue = {
    template: `
      <div>
        <el-card>
          <template #header>时间范围屏蔽</template>
          <div style="margin-bottom: 5px">说明：屏蔽在指定时间段内发布的视频，注意包括开始时间和结束时间</div>
          <el-switch v-model="status" active-text="启用"/>
          <el-date-picker style="margin-left: 5px" :disabled="!status"
                          v-model="value"
                          type="datetimerange"
                          :picker-options="pickerOptions"
                          range-separator="至"
                          start-placeholder="开始日期"
                          end-placeholder="结束日期"
                          align="right">
          </el-date-picker>
          <el-button type="success" style="margin-left: 5px" round @click="setBut" :disabled="!status">设置</el-button>
        </el-card>
      </div>`,
    data() {
        return {
            status: localMKData.isTimeRangeMaskingStatus(),
            pickerOptions: {
                shortcuts: [
                    {
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    },
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    },
                    {
                        text: '最近三个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        }
                    }
                ]
            },
            value: []
        }
    },
    methods: {
        setBut() {
            if (this.value.length === 0) return;
            // 获取时间date对象
            const [startTime, endTime] = this.value
            gmUtil.setData('time_range_masking', [startTime.getTime(), endTime.getTime()])
            this.$alert('设置时间范围屏蔽成功')
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
    },
    created() {
        const tempValue = localMKData.getTimeRangeMaskingVal();
        if (tempValue.length !== 0) {
            const [startTimestamp, endTimestamp] = tempValue
            this.value.push(new Date(startTimestamp));
            this.value.push(new Date(endTimestamp));
        }
    }
}
