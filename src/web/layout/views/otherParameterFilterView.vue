<script>
import gmUtil from "../../utils/gmUtil.js";
import externalList from "../../res/otherKeyListDataJson.json";
import commentWordLimitView from "./commentWordLimitView.vue";
import UserLevelFilteringView from "./other-parameter-filter/UserLevelFilteringView.vue";
import SwitchMinMaxInputCard from "../components/SwitchMinMaxInputCard.vue";

/**
 * 其他规则组件
 */
export default {
  components: {SwitchMinMaxInputCard, commentWordLimitView, UserLevelFilteringView},
  data() {
    return {
      showInfoList: [
        {key: 'minimum_user_level_video_gm', label: '最小用户等级限制-视频'},
        {key: 'maximum_user_level_video_gm', label: '最大用户等级限制-视频'},
        {key: 'minimum_user_level_comment_gm', label: '最小用户等级限制-评论'},
        {key: 'maximum_user_level_comment_gm', label: '最大用户等级限制-评论'}
      ],
      externalList
    }
  },
  methods: {
    updateInfo(isTip=false) {
      for (const v of this.showInfoList) {
        v.showVal = gmUtil.getData(v.key, '');
      }
      isTip && this.$notify({type: 'info', position: 'bottom-right', message: '已刷新'})
    }
  },
  created() {
    for (const v of this.externalList) {
      this.showInfoList.push({label: v['minLabel'], key: v['minInputKey'], showVal: ''});
      this.showInfoList.push({label: v['maxLabel'], key: v['maxInputKey'], showVal: ''});
    }
    this.updateInfo();
  }
}
</script>

<template>
  <div>
    <div style="display: flex">
      <div style="width: 70vw">
        <UserLevelFilteringView/>
        <div style="display: flex;">
          <switch-min-max-input-card v-for="v in externalList" :key="v.title"
                                     :is-max-key="v.isMaxKey"
                                     :is-min-key="v.isMinKey"
                                     :max-def-val="v.maxDefVal"
                                     :max-input-key="v.maxInputKey"
                                     :min-def-val="v.minDefVal"
                                     :min-input-key="v.minInputKey"
                                     :title="v.title"/>
        </div>
        <commentWordLimitView/>
      </div>
      <div>
        <el-card shadow="never">
          <template #header>
            <span>使用说明</span>
          </template>
          <ol>
            <li>如设置时长相关单位为秒</li>
            <li>如设置播放量和弹幕量相关单位为个</li>
            <li>最小播放量则小于该值的视频会屏蔽</li>
            <li>最大播放量则大于该值的视频会屏蔽</li>
            <li>最小弹幕量则小于该值的视频会屏蔽</li>
            <li>最大弹幕量则大于该值的视频会屏蔽</li>
            <li>最小时长则小于该值的视频会屏蔽</li>
            <li>最大时长则大于该值的视频会屏蔽</li>
            <li>最小用户等级则小于该值的会屏蔽</li>
            <li>最大用户等级则大于该值的会屏蔽</li>
            <li>取消相关限制条件则不做限制处理</li>
            <li>右侧信息关键条件-1则为未做任何限制处理</li>
            <li>最后因为设置限制条件冲突或限制太多，视频未能限制的情况下，请按需设置限制条件</li>
          </ol>
        </el-card>
        <el-button @click="updateInfo(true)">刷新</el-button>
        <div v-for="v in showInfoList" :key="v.label">
          {{ v.label }}
          <el-tag>{{ v.showVal }}</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>
