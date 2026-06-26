<script lang="ts">
import {defineComponent} from 'vue';
import localMKData from "../../../state/localMKData.ts";
import {eventEmitter} from "../../../core/EventEmitter.ts";
import shieldingUserView from "../shield/shieldingUserView.vue";

/**
 * 右侧悬浮布局
 */
export default defineComponent({
  components: {
    shieldingUserView,
  },
  data() {
    return {
      //布局显示开关
      panelShow: localMKData.isShowRightTopMainButSwitch(),
    }
  },
  methods: {
    showBut() {
      eventEmitter.send('主面板开关')
    },
    handleMouseEnter() {
      (this.$refs!.divRef as any).style.transform = "translateX(0)";
    },
    handleMouseLeave() {
      (this.$refs!.divRef as any).style.transform = 'translateX(80%)'
    }
  },
  created() {
    eventEmitter.on('显隐主面板开关', (bool) => {
      this.panelShow = bool
    })
  },
  mounted() {
    const divStyle = (this.$refs!.divRef as any).style;
    if (!localMKData.isFirstFullDisplay()) {
      divStyle.transform = 'translateX(80%)'
    } else {
      if (localMKData.isHalfHiddenIntervalAfterInitialDisplay()) {
        setTimeout(() => {
          divStyle.transform = 'translateX(80%)'
          eventEmitter.send('el-notify', {
            message: '自动隐藏外部主面板显隐按钮',
            position: 'button-right',
          })
        }, 8000);
      }
    }
  }
})
</script>

<template>
  <div v-show="panelShow" ref="divRef"
       style="position: fixed;z-index: 9000;right: 0;top: 13%;transition: transform 0.5s;"
       @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div>
      <el-button round @click="showBut">主面板</el-button>
    </div>
    <shieldingUserView/>
  </div>
</template>
