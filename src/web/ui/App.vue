<script setup lang="ts">
import {ref, watch} from 'vue';
import cacheManagementView from "./views/debug/cacheManagementView.vue";
import panelSettingsView from "./views/settings/panelSettingsView.vue";
import compatibleSettingView from "./views/settings/compatibleSettingView.vue";
import lookContentDialog from "./dialogs/lookContentDialog.vue";
import debuggerManagementView from './views/debug/debuggerManagementView.vue';
import debuggerManagement from "../domain/debuggerManagement";
import PageProcessingTabsView from "./views/page/PageProcessingTabsView.vue";
import aboutAndFeedbackView from "./views/aboutAndFeedbackView.vue";
import showImgDialog from "./dialogs/showImgDialog.vue";
import sheetDialog from "./dialogs/sheetDialog.vue";
import bulletWordManagementView from "./views/bulletWordManagementView.vue";
import {eventEmitter} from "../core/EventEmitter.ts";
import localMKData, {getDrawerShortcutKeyGm} from "../state/localMKData.ts";
import outputInformationView from './views/debug/outputInformationView.vue'
import donateLayoutView from './views/settings/donateLayoutView.vue'
import ruleManagementView from './views/rule/ruleManagementView.vue'
import excludeURLsView from './views/settings/excludeURLsView.vue'
import RightFloatingLayoutView from "./views/settings/rightFloatingLayoutView.vue";
import conditionalityView from './views/rule/conditionalityView.vue';
import defUtil from "../core/util/defUtil.ts";
import {ElMessageBox} from 'element-plus';
import {nextTick} from 'vue';

const drawer = ref(false);
// 默认打开的tab
const tabsActiveName = ref(GM_getValue('mainTabsActiveName', '规则管理'));
const debug_panel_show = ref(__DEV__);
// ws 开关开启后，生产构建也显示"调试测试"页签，便于随时关闭 ws 连接
const ws_panel_show = ref(__DEV__ || debuggerManagement.isWsService());
const isShowBackToTopVal = ref(localMKData.isShowBackToTopBtn());

/**
 * B 站页面环境下 EP drawer 的 Vue Transition 动画间歇性不完成（enter-from 类残留、面板卡在视口外），
 * 用 Web Animations API 手动驱动开合动画，绕开 Vue Transition 的不稳定性：
 * - 打开：从 translateX(-100%) 滑入到 translateX(0)；
 * - 关闭：从 translateX(0) 滑出到 translateX(-100%)；
 * - 动画开始前清理 wrap 上残留的 Vue Transition 动画类，避免 enter-from 把 transform 锁死在 -100%。
 */
const animateDrawer = (open: boolean): void => {
  nextTick(() => {
    const wrapEl = document.querySelector('.is-drawer.el-modal-drawer') as HTMLElement | null;
    if (wrapEl) {
      // 清理 Vue Transition 残留动画类，避免锁死 transform
      wrapEl.classList.remove(
        'el-drawer-fade-enter-from', 'el-drawer-fade-enter-active', 'el-drawer-fade-enter-to',
        'el-drawer-fade-leave-from', 'el-drawer-fade-leave-active', 'el-drawer-fade-leave-to'
      );
    }
    const drawerEl = document.querySelector('.el-drawer') as HTMLElement | null;
    if (!drawerEl) return;
    // 取消进行中的动画，避免叠加
    drawerEl.getAnimations().forEach((anim) => anim.cancel());
    const from = open
      ? {transform: 'translateX(-100%)'}
      : {transform: 'translateX(0)'};
    const to = open
      ? {transform: 'translateX(0)'}
      : {transform: 'translateX(-100%)'};
    // 动画结束后（含失败/超时）强制归位，确保面板不卡在视口外
    const finalize = (): void => {
      drawerEl.style.transform = open ? 'translateX(0)' : 'translateX(-100%)';
    };
    try {
      drawerEl.animate([from, to], {duration: 280, easing: 'ease'}).finished.then(finalize).catch(finalize);
    } catch (e) {
      finalize();
    }
    // 超时兜底：动画异常不推进时也强制归位
    setTimeout(finalize, 500);
  });
}

watch(drawer, (open) => {
  animateDrawer(open);
});

watch(tabsActiveName,(n)=>{
  GM_setValue('mainTabsActiveName', n);
})

eventEmitter.on('主面板开关', () => {
  drawer.value = !drawer.value;
});
document.addEventListener('keydown', (event) => {
  eventEmitter.emit('event-keydownEvent', event);
  if (event.key === getDrawerShortcutKeyGm()) {
    drawer.value = !drawer.value;
  }
});

const alertFunDebounce = defUtil.debounce((response: any, bvId: string) => {
  ElMessageBox.alert(`请求获取视频信息失败，状态码：${response.status}，bv号：${bvId}
                \n。已自动禁用根据bv号网络请求获取视频信息状态
                \n如需关闭，请在面板条件限制里手动关闭。`, '错误', {
    confirmButtonText: '确定',
    type: 'error'
  });
}, 2000);
eventEmitter.on('请求获取视频信息失败', (response: any, bvId: string) => {
  eventEmitter.send('更新根据bv号网络请求获取视频信息状态', true);
  alertFunDebounce(response, bvId);
});

eventEmitter.on('e:设置顶部按钮状态', (show: boolean) => {
  isShowBackToTopVal.value = show;
});
</script>

<template>
  <div>
    <el-drawer :modal="false"
               v-model="drawer"
               :with-header="false"
               direction="ltr"
               size="100%"
               style="position: fixed">
      <el-tabs id="gz-drawer-tabs" v-model="tabsActiveName"
               type="border-card">
        <el-tab-pane label="面板设置" lazy name="面板设置">
          <panelSettingsView/>
        </el-tab-pane>
        <el-tab-pane label="规则管理" lazy name="规则管理">
          <ruleManagementView/>
        </el-tab-pane>
        <el-tab-pane label="页面处理" lazy name="页面处理">
          <PageProcessingTabsView/>
        </el-tab-pane>
        <el-tab-pane label="兼容设置" lazy name="兼容设置">
          <compatibleSettingView/>
        </el-tab-pane>
        <el-tab-pane label="排除页面" lazy name="排除页面">
          <excludeURLsView/>
        </el-tab-pane>
        <el-tab-pane label="条件限制" lazy name="条件限制">
          <conditionalityView/>
        </el-tab-pane>
        <el-tab-pane label="输出信息" name="输出信息">
          <outputInformationView/>
        </el-tab-pane>
        <el-tab-pane label="缓存管理" lazy name="缓存管理">
          <cacheManagementView/>
        </el-tab-pane>
        <el-tab-pane v-if="debug_panel_show" label="弹幕词管理" lazy name="弹幕词管理">
          <bulletWordManagementView/>
        </el-tab-pane>
        <el-tab-pane label="支持打赏" lazy name="支持打赏">
          <donateLayoutView/>
        </el-tab-pane>
        <el-tab-pane label="关于和问题反馈" lazy name="关于和问题反馈">
          <aboutAndFeedbackView/>
        </el-tab-pane>
        <el-tab-pane v-if="ws_panel_show" label="调试测试" lazy name="调试测试">
          <debuggerManagementView/>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
    <lookContentDialog/>
    <showImgDialog/>
    <sheetDialog/>
    <RightFloatingLayoutView/>
    <el-backtop v-if="isShowBackToTopVal"/>
  </div>
</template>

<style>
/* 主面板 tabs 容器样式；id 使用 gz-drawer-tabs 避免与 B 站页面自身 #app 冲突（深色主题下 #app 会被 B 站深色 CSS 染色/干扰，导致面板样式异常、drawer 动画卡住） */
#gz-drawer-tabs > .el-tabs__content {
  padding: 0 !important;
  background: var(--el-bg-color-page);
}

/* 开合动画由 App.vue 的 animateDrawer 用 Web Animations API 驱动（见 script 区）：
   - 动画前清理 Vue Transition 残留动画类（避免 enter-from 锁死 transform），动画后强制 transform 归位，
     从而绕开 B 站页面环境下 Vue Transition 动画偶发不完成导致的"面板卡在视口外" */
</style>
