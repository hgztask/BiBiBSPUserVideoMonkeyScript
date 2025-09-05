<script>
/**
 * 选项对话框组件
 */
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => []
    },
    /**
     * 点击遮罩层是否关闭对话框
     */
    closeOnClickModal: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: '选项'
    },
    //点击选项之后是否继续显示对话框，默认为否，则不显示
    clickItemClose: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogShow: true
    }
  },
  methods: {
    handleClick(item) {
      if (this.clickItemClose) {
        return;
      }
      this.$emit('options-click', item)
    }
  }
}
</script>
<template>
  <div>
    <el-dialog :close-on-click-modal="closeOnClickModal" :title="title"
               :visible="show" center
               width="30%"
               @close="$emit('close')">
      <div>
        <el-row>
          <el-col v-for="item in list" :key="item.label">
            <el-button :title="item.title" style="width: 100%" @click="handleClick(item)">{{
                item.label
              }}
            </el-button>
          </el-col>
        </el-row>
      </div>
    </el-dialog>
  </div>
</template>
