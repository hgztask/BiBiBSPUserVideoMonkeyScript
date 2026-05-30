<script>
import {defineComponent} from 'vue'
import defUtil from "../../../utils/defUtil.js";
import localMKData from "../../../data/localMKData.js";

export default defineComponent({
  name: "FanCardLevelRestrictionsView",
  data() {
    return {
      dataList: []
    }
  },
  methods: {
    refresh(tip = false) {
      this.dataList = localMKData.getFansLevelLimitListGm()
      tip && this.$message.success("刷新成功")
    },
    saveBut() {
      const raw = defUtil.toRaw(this.dataList);
      GM_setValue('fans_level_limit_list_gm', raw)
      this.$notify({message: "已保存", position: "bottom-right"})
    },
    addBut() {
      this.$prompt("请输入粉丝牌名称", {
        title: "添加粉丝牌",
      }).then(({value}) => {
        if (!value) {
          this.$message.warning("请输入正确的粉丝牌名称")
          return this.addBut()
        }
        value = value.trim()
        if (value.length > 6) {
          this.$message.warning("请输入正确的粉丝牌名称")
          return this.addBut()
        }
        if (this.dataList.some(item => item.name === value)) {
          this.$message.warning("已存在该粉丝牌名称")
          return this.addBut()
        }
        this.dataList.push({name: value, limitLevel: 0, status: false})
      })
    },
    delBut(row) {
      this.$confirm(`是要删除该粉丝牌配置吗？【${row.name}】`).then(() => {
        this.dataList = this.dataList.filter(item => item !== row)
        this.$notify({message: "已删除", position: "bottom-right"})
      })
    }
  },
  created() {
    this.refresh()
  }
})
</script>

<template>
  <div>
    <el-row>
      <el-col :span="6">
        <el-table :data="dataList" border stripe>
          <el-table-column label="粉丝牌" prop="name" width="170"/>
          <el-table-column label="限制等级" width="155">
            <template #default="scope">
              <el-input-number v-model="scope.row.limitLevel" :max="100" :min="0" size="small"/>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="50">
            <template #default="scope">
              <gz-space justify-content="center">
                <el-checkbox v-model="scope.row.status"/>
              </gz-space>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <gz-space>
                <el-button type="warning" @click="delBut(scope.row)">移除</el-button>
              </gz-space>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="18">
        <el-card>
          <template #header>
            <gz-space>
              <span>说明</span>
              <el-button type="success" @click="saveBut">保存</el-button>
              <el-button @click="refresh(true)">刷新</el-button>
              <el-button type="info" @click="addBut">添加</el-button>
            </gz-space>
          </template>
          <div>
            仅限直播间弹幕列表,修改、删除和新增等操作需要手动保存
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>