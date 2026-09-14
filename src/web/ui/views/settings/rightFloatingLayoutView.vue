<script setup lang="ts">
import {onMounted, ref} from 'vue';
import localMKData from "../../../state/localMKData.ts";
import {eventEmitter} from "@/core/EventEmitter.ts";
import shieldingUserView from "../shield/shieldingUserView.vue";

/**
 * 右侧悬浮布局
 */
//布局显示开关
const panelShow = ref(localMKData.isShowRightTopMainButSwitch());
const divRef = ref<HTMLDivElement>();

const showBut = () => {
  eventEmitter.send('主面板开关');
};
const handleMouseEnter = () => {
  divRef.value!.style.transform = "translateX(0)";
};
const handleMouseLeave = () => {
  divRef.value!.style.transform = 'translateX(80%)';
};

eventEmitter.on('显隐主面板开关', (bool: boolean) => {
  panelShow.value = bool;
});

onMounted(() => {
  const divStyle = divRef.value!.style;
  if (!localMKData.isFirstFullDisplay()) {
    divStyle.transform = 'translateX(80%)';
  } else {
    if (localMKData.isHalfHiddenIntervalAfterInitialDisplay()) {
      setTimeout(() => {
        divStyle.transform = 'translateX(80%)';
        eventEmitter.send('el-notify', {
          message: '自动隐藏外部主面板显隐按钮',
          position: 'button-right',
        });
      }, 8000);
    }
  }
});
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
