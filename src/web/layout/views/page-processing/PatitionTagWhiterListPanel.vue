<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    switchKey: {
      type: String,
      default: ''
    },
    partitionListKey: {
      type: String,
      default: ''
    },
  },
  data() {
    return {
      partition: '',
      partitionList: [],
      switchVal: false
    }
  },
  computed: {
    showPartitionList() {
      if (this.partition === '') return this.partitionList
      return this.partitionList.filter(item => item.includes(this.partition))
    }
  },
  watch: {
    switchVal(newV) {
      GM_setValue(this.switchKey, newV)
    }
  },
  methods: {
    addBut() {
      if (this.partition === '') {
        return this.$message.warning('请输入分区名称');
      }
      if (this.partitionList.some(item => item === this.partition)) {
        return this.$message.warning('该分区已存在');
      }
      if (this.partitionList.length >= 50) {
        return this.$message.warning('最多添加50个白名单分区，请移除不需要的分区再添加');
      }
      this.partitionList.push(this.partition)
      this.partition = ''
      this.save()
    },
    delBut(item) {
      if (this.partitionList.some(someItem => someItem === item)) {
        return this.$message.warning('该分区不存在');
      }
      this.partitionList = this.partitionList.filter(item => item !== item)
      this.save()
    },
    save() {
      GM_setValue(this.partitionListKey, this.partitionList)
      this.$message.success(`保存${this.title}配置成功`)
    }
  },
  created() {
    this.partitionList = GM_getValue(this.partitionListKey, [])
    this.switchVal = GM_getValue(this.switchKey, false)
  }
}
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <gz-space>
        <span>{{ title }}</span>
        <el-switch v-model.lazy="switchVal" active-text="启用"/>
      </gz-space>
    </template>
    <el-input v-model.lazy.trim="partition" clearable style="width: 250px;"/>
    <el-button @click="addBut">添加</el-button>
    <gz-space wrap>
      <el-popconfirm v-for="item in showPartitionList" :key="item"
                     :title="`是要删除tag【${item}】吗？`"
                     @confirm="delBut(item)">
        <template #reference>
          <el-tag>{{ item }}</el-tag>
        </template>
      </el-popconfirm>
    </gz-space>
  </el-card>
</template>
