<script>
import localMKData from "../../data/localMKData.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import gmUtil from "../../utils/gmUtil.js";
// 保存表格数据
const saveTable = (tableData) => {
  const newList = []
  for (let {status, r} of tableData) {
    if (r === null) {
      eventEmitter.send('el-alert', '表格内还有未设置时间范围的项，请先设置或删除才可以保存！')
      return
    }
    const [startTime, endTime] = r;
    newList.push({
      status,
      r: [startTime.getTime(), endTime.getTime()]
    })
  }
  if (newList.length === 0) return;
  gmUtil.setData('time_range_masking', newList)
  eventEmitter.send('el-notify', {
    title: '保存成功',
    message: '已保存该时间范围屏蔽',
    type: 'success'
  })
}
/**
 * 时间范围屏蔽表格组件
 */
export default {
  data() {
    return {
      tableData: [],
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
      }
    }
  },
  methods: {
    //刷新表格数据
    refreshTableData() {
      if (this.tableData.length > 0) {
        this.tableData.splice(0, this.tableData.length);
      }
      const timeRangeMaskingArr = localMKData.getTimeRangeMaskingArr();
      if (timeRangeMaskingArr.length !== 0) {
        let index = 0;
        for (let {status, r} of timeRangeMaskingArr) {
          this.tableData.push({
            index: index++,
            status,
            r: [new Date(r[0]), new Date(r[1])],
            // 用于判断是否修改
            startTimeStamp: r[0],
            endTimeStamp: r[1],
          })
        }
      }
    },
    //恢复上次时间范围
    restoreTheLastTimeRange(row) {
      // 获取未修改前的时间戳
      let {startTimeStamp, endTimeStamp} = row;
      console.log('上次时间戳', startTimeStamp, endTimeStamp)
      if (startTimeStamp === null || startTimeStamp === undefined) {
        row.r = null
        return
      }
      row.r = [new Date(startTimeStamp), new Date(endTimeStamp)]
      console.log('已恢复上次时间范围', row)
    },
    // 时间选择器改变
    tableDatePickerChange(row) {
      const rowR = row.r;
      if (rowR === null) return
      // 获取未修改前的时间戳
      let {oldStartTimeStamp, oldEndTimeStamp} = row;
      // 获取当前项的时间戳
      const newStartTimeStamp = rowR[0].getTime();
      const newEndTimeStamp = rowR[1].getTime();
      // 如果未修改过时间戳，则取当前项的时间戳
      const comparisonSTS = newStartTimeStamp || oldStartTimeStamp;
      const comparisonETS = newEndTimeStamp || oldEndTimeStamp;
      // 如果未修改过时间戳，则取当前项的时间戳
      for (let v of this.tableData) {
        //跳过时间范围为空的项
        if (v.r === null) continue;
        // 跳过当前项
        if (v.index === row.index) continue;
        const tempStartTimeStamp = v.r[0].getTime();
        const tempEndTimeStamp = v.r[1].getTime();
        if (tempStartTimeStamp === comparisonSTS && tempEndTimeStamp === comparisonETS) {
          this.$alert('已存在该时间范围屏蔽')
          this.restoreTheLastTimeRange(row)
          return;
        }
        if (comparisonSTS >= tempStartTimeStamp && comparisonETS <= tempEndTimeStamp) {
          this.$alert('小于已添加过的时间范围')
          this.restoreTheLastTimeRange(row)
          return;
        }
      }
      //更新时间戳
      row.startTimeStamp = newStartTimeStamp;
      row.endTimeStamp = newEndTimeStamp;
      saveTable(this.tableData)
    },
    // 开关改变
    tableSwitchChange(row) {
      if (row.r === null) return
      saveTable(this.tableData)
    },
    addBut() {
      const length = this.tableData.length;
      this.tableData.push({
        index: length, status: true, r: null,
        startTimeStamp: null, endTimeStamp: null
      })
      this.$notify({message: '已添加一条时间范围屏蔽到底部'})
    },
    delItemBut(row) {
      // 刚添加的项未设置时间戳，则直接删除
      if (row.startTimeStamp === null) {
        this.tableData.splice(row.index, 1)
        return;
      }
      for (let {r} of this.tableData) {
        if (r === null) {
          this.$alert('表格内还有未设置时间范围的项，请先设置或删除才可以保存！')
          return
        }
      }
      this.$confirm('确定删除该条时间范围屏蔽吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.tableData.splice(row.index, 1)
        saveTable(this.tableData)
        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      })
    },
    saveTableBut() {
      saveTable(this.tableData)
    }
  },
  created() {
    this.refreshTableData()
  }
}
</script>
<template>
  <div>
    <el-table :data="tableData" border stripe>
      <el-table-column label="状态" width="120px">
        <template v-slot="scope">
          <el-switch v-model="scope.row.status" active-text="启用" @change="tableSwitchChange(scope.row)"/>
        </template>
      </el-table-column>
      <el-table-column label="时间范围" width="400px">
        <template v-slot="scope">
          <el-date-picker
              v-model="scope.row.r"
              :picker-options="pickerOptions"
              end-placeholder="结束日期"
              range-separator="至"
              start-placeholder="开始日期"
              type="datetimerange"
              @change="tableDatePickerChange(scope.row)">
          </el-date-picker>
          <el-tag>{{ scope.row.r }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column>
        <template #header>
          <el-button type="info" @click="addBut">添加</el-button>
          <el-button @click="refreshTableData">刷新</el-button>
          <el-button @click="saveTableBut">保存</el-button>
        </template>
        <template v-slot="scope">
          <el-button type="warning" @click="delItemBut(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
