<script lang="ts">
import {defineComponent} from 'vue'
import localMKData from "../../../state/localMKData.ts";
import topColumnProcessing from "../../../pages/topColumnProcessing.ts";

export default defineComponent({
  name: "TopColumnProcessingTab",
  data() {
    return {
      hideTheLeftTopColumnsVal: localMKData.getHideTheLeftTopColumnsGm(),
      topBarColumnShieldingStatusVal: localMKData.isTopBarColumnShieldingStatusGm()
    }
  },
  watch: {
    hideTheLeftTopColumnsVal(newList) {
      GM_setValue('hide_the_left_top_columns_gm', newList)
      this.topBarColumnShieldingStatusVal && topColumnProcessing.processHideTheTopColumns(false)
    },
    topBarColumnShieldingStatusVal(n) {
      GM_setValue('top_bar_column_shielding_status_gm', n)
      n && topColumnProcessing.processHideTheTopColumns(false)
    }
  },
  methods: {
    addBut() {
      this.$prompt("请输入要屏蔽的栏目名称", 'tip').then(({value}: any) => {
        if (value === null || value.trim() === '') return
        const valueTrim = value.trim()
        if (this.hideTheLeftTopColumnsVal.some(item => item === valueTrim)) {
          return this.$message.warning('该栏目已存在')
        }
        this.hideTheLeftTopColumnsVal.push(valueTrim)
      })
    },
    handleClose(tag: any) {
      this.$confirm(`是要移除栏目吗【${tag}】`).then(() => {
      })
      const findIndex = this.hideTheLeftTopColumnsVal.findIndex(item => item === tag);
      if (findIndex !== -1) {
        this.hideTheLeftTopColumnsVal.splice(findIndex, 1);
      }
    }
  }
})
</script>

<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <gz-space>
          顶栏栏目屏蔽
          <el-switch v-model="topBarColumnShieldingStatusVal" active-text="启用"/>
        </gz-space>
      </template>
      <gz-space align-items="flex-start" direction="">
        <gz-space align-items="flex-start" direction="">
          <span>说明:栏目范围，顶部左侧和右侧，其中左侧的哔哩哔哩图标，栏目值为【logo】、右侧的个人头像栏值为【个人logo】</span>
        </gz-space>
        <gz-space wrap>
          <el-button size="medium" @click="addBut">添加</el-button>
          <el-tag v-for="item in hideTheLeftTopColumnsVal" :key="item" closable
                  @close="handleClose(item)">
            {{ item }}
          </el-tag>
        </gz-space>
      </gz-space>
    </el-card>
  </div>
</template>