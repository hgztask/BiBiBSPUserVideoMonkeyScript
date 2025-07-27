<script>
import localMKData, {isOpenDev, setOpenDev} from "../../data/localMKData.js";
import {eventEmitter} from "../../model/EventEmitter.js";
import gmUtil from "../../utils/gmUtil.js";

export default {
  data() {
    return {
      input_color: null,
      showRightTopMainButSwitch: localMKData.isShowRightTopMainButSwitch(),
      isFirstFullDisplay: localMKData.isFirstFullDisplay(),
      isHalfHiddenIntervalAfterInitialDisplay: localMKData.isHalfHiddenIntervalAfterInitialDisplay(),
      devToolsInputVal: ''
    }
  },
  methods: {
    setBorderColorBut() {
      this.$confirm('是否设置面板边框颜色', '提示').then(() => {
        localMKData.setBorderColor(this.input_color);
        this.$alert("已设置面板边框颜色，刷新生效")
      })
    },
    setDefFontColorForOutputInformationBut() {
      this.$confirm("是否设置输出信息默认字体颜色", "提示").then(() => {
        localMKData.setOutputInformationFontColor(this.input_color);
        this.$alert("已设置输出信息默认字体颜色，刷新生效");
      })
    },
    setTheFontColorForOutputInformationBut() {
      this.$confirm('是要设置输出信息高亮字体颜色吗？').then(() => {
        localMKData.setHighlightInformationColor(this.input_color);
        this.$alert("已设置输出信息高亮字体颜色，刷新生效");
      })
    },
    setDefInfoBut() {
      localMKData.setDefaultColorInfo()
      this.$alert("已恢复默认颜色，刷新生效");
    },
    changeDevToolsInput() {
      const toolsInputVal = this.devToolsInputVal;
      if (toolsInputVal === 'show-dev') {
        setOpenDev(true)
        eventEmitter.send('debugger-dev-show', true)
        this.devToolsInputVal = ''
        return
      }
      if (toolsInputVal === 'stop-dev') {
        setOpenDev(false)
        eventEmitter.send('debugger-dev-show', false)
        this.devToolsInputVal = ''
        return;
      }
      if (isOpenDev()) {
        eventEmitter.send(toolsInputVal)
      }
    }
  },
  watch: {
    showRightTopMainButSwitch(newVal) {
      //设置是否显示右上角主面板按钮开关
      gmUtil.setData("showRightTopMainButSwitch", newVal === true)
      eventEmitter.send('显隐主面板开关', newVal)
    },
    isFirstFullDisplay(newVal) {
      //设置是否第一次完整显示外部开关主面板按钮
      gmUtil.setData('isFirstFullDisplay', newVal === true)
    },
    isHalfHiddenIntervalAfterInitialDisplay(newBool) {
      //设置初次显示后间隔半隐藏主面板开关按钮
      gmUtil.setData('is_half_hidden_interval_after_initial_display', newBool === true)
    }
  }
}
</script>

<template>
  <div>
    <el-card shadow="never">
      <template #header>
        <span>颜色设置</span>
      </template>
      <div class="el-horizontal-center">
        选择器
        <el-color-picker v-model="input_color"/>
      </div>
      <el-button @click="setBorderColorBut">设置边框色</el-button>
      <el-button @click="setDefFontColorForOutputInformationBut">设置输出信息默认字体色</el-button>
      <el-button @click="setTheFontColorForOutputInformationBut">设置输出信息高亮字体色</el-button>
      <el-tooltip content="刷新页面生效">
        <el-button @click="setDefInfoBut">恢复默认</el-button>
      </el-tooltip>
    </el-card>
    <el-card shadow="never">
      <template #header>
        <span>页面右侧悬浮按钮设置</span>
      </template>
      <el-switch v-model="showRightTopMainButSwitch" active-text="显示按钮"></el-switch>
      <el-tooltip content="页面每次加载完之后是否完整展示按钮，否则半隐藏">
        <el-switch v-model="isFirstFullDisplay" active-text="初次完整显示"></el-switch>
      </el-tooltip>
      <el-tooltip content="页面每次加载完之后如完整展示按钮时，间隔10秒后半隐藏处理">
        <el-switch v-model="isHalfHiddenIntervalAfterInitialDisplay"
                   active-text="初次显示后间隔半隐藏"/>
      </el-tooltip>
    </el-card>
    <el-card shadow="never">
      <template #header>
        <span>说明</span>
      </template>
      <div>按键盘tab键上的~键为展开关闭主面板</div>
    </el-card>
    <el-card shadow="never">
      <template #header>
        <span>devTools</span>
      </template>
      <el-input v-model.trim="devToolsInputVal" @keyup.enter.native="changeDevToolsInput"></el-input>
    </el-card>
  </div>
</template>
