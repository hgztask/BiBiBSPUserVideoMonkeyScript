import gmUtil from "../utils/gmUtil.js";
import localMKData from "../data/localMKData.js";

/**
 * uid范围屏蔽vue组件
 */
export const uid_range_masking_vue = {
    template: `
      <div>
        <el-card>
          <template #header>
            uid范围屏蔽
          </template>
          <el-switch v-model="status" active-text="启用" style="margin-bottom: 10px"/>
          <div style="margin-bottom: 10px">
            范围内的uid都会被屏蔽掉，改动需重新设置方可生效，且再下次检查时屏蔽(如视频列表加载，评论加载)
          </div>
          <el-form label-position="left" :disabled="!status" style="width: 20%">
            <el-form-item label="最小值">
              <el-input v-model.number="head"></el-input>
            </el-form-item>
            <el-form-item label="最大值">
              <el-input v-model.number="tail"></el-input>
            </el-form-item>
            <el-form-item class="el-horizontal-right">
              <el-button @click="setRangeBut">设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>`,
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
            gmUtil.setData('uid_range_masking', [this.head, this.tail])
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
            gmUtil.setData('uid_range_masking_status', n)
        }
    },
    created() {
        const arr = localMKData.getUidRangeMasking();
        this.head = arr[0]
        this.tail = arr[1]
    }
}
