<script setup lang="ts">
import {ref, watch} from 'vue';
import {
  getMaximumUserLevelCommentGm,
  getMaximumUserLevelVideoGm,
  getMinimumUserLevelCommentGm,
  getMinimumUserLevelVideoGm,
  isEnableMaximumUserLevelCommentGm,
  isEnableMaximumUserLevelVideoGm,
  isEnableMinimumUserLevelCommentGm,
  isEnableMinimumUserLevelVideoGm
} from "@/state/localMKData.ts";
import {ElMessage} from 'element-plus';

const minVal = 0;
const maxVal = 7;
const minimumUserLevelVideoVal = ref(getMinimumUserLevelVideoGm());
const maximumUserLevelVideoVal = ref(getMaximumUserLevelVideoGm());
const minimumCommentVal = ref(getMinimumUserLevelCommentGm());
const maximumCommentVal = ref(getMaximumUserLevelCommentGm());
const isEnableMinimumUserLevelVideoVal = ref(isEnableMinimumUserLevelVideoGm());
const isEnableMaximumUserLevelVideoVal = ref(isEnableMaximumUserLevelVideoGm());
const isEnableMinimumUserLevelCommentVal = ref(isEnableMinimumUserLevelCommentGm());
const isEnableMaximumUserLevelCommentVal = ref(isEnableMaximumUserLevelCommentGm());

watch(minimumUserLevelVideoVal, (n) => {
  const max = maximumUserLevelVideoVal.value;
  if (n > max) {
    minimumUserLevelVideoVal.value = max;
    ElMessage.warning('最小等级不能大于最大等级');
    return;
  }
  if (n === max) {
    --minimumUserLevelVideoVal.value;
    ElMessage.warning('最小等级不能等于最大等级');
    return;
  }
  GM_setValue("minimum_user_level_video_gm", n);
});
watch(maximumUserLevelVideoVal, (n) => {
  const min = minimumUserLevelVideoVal.value;
  if (n < min) {
    maximumUserLevelVideoVal.value = min;
    ElMessage.warning('最大等级不能小于最小等级');
    return;
  }
  if (n === min) {
    ++maximumUserLevelVideoVal.value;
    ElMessage.warning('最大等级不能等于最小等级');
    return;
  }
  GM_setValue("maximum_user_level_video_gm", maximumUserLevelVideoVal.value);
});
watch(minimumCommentVal, (n) => {
  const max = maximumCommentVal.value;
  if (n > max) {
    minimumCommentVal.value = max;
    ElMessage.warning('最小等级不能大于最大等级');
    return;
  }
  if (n === max) {
    --minimumCommentVal.value;
    ElMessage.warning('最小等级不能等于最大等级');
    return;
  }
  GM_setValue("minimum_user_level_comment_gm", n);
});
watch(maximumCommentVal, (n) => {
  const min = minimumCommentVal.value;
  if (n < min) {
    maximumCommentVal.value = min;
    ElMessage.warning('最大等级不能小于最小等级');
    return;
  }
  if (n === min) {
    ++maximumCommentVal.value;
    ElMessage.warning('最大等级不能等于最小等级');
    return;
  }
  GM_setValue("maximum_user_level_comment_gm", n);
});
watch(isEnableMinimumUserLevelVideoVal, (n) => {
  GM_setValue("is_enable_minimum_user_level_video_gm", n);
});
watch(isEnableMaximumUserLevelVideoVal, (n) => {
  GM_setValue("is_enable_maximum_user_level_video_gm", n);
});
watch(isEnableMinimumUserLevelCommentVal, (n) => {
  GM_setValue("is_enable_minimum_user_level_comment_gm", n);
});
watch(isEnableMaximumUserLevelCommentVal, (n) => {
  GM_setValue("is_enable_maximum_user_level_comment_gm", n);
});
</script>
<template>
  <el-card shadow="never">
    <template #header>等级限制</template>
    <div class="el-horizontal-left">
      <div>
        视频类
        <div>启用最小等级{{ minimumUserLevelVideoVal }}
          <el-switch v-model="isEnableMinimumUserLevelVideoVal"/>
          <el-input-number v-model="minimumUserLevelVideoVal" :max="maxVal" :min="minVal"/>
        </div>
        <div>启用最大等级{{ maximumUserLevelVideoVal }}
          <el-switch v-model="isEnableMaximumUserLevelVideoVal"/>
          <el-input-number v-model="maximumUserLevelVideoVal" :max="maxVal" :min="1"/>
        </div>
      </div>
      <el-divider class="height-auto" direction="vertical"/>
      <div>
        评论类
        <div>启用最小等级{{ minimumCommentVal }}
          <el-switch v-model="isEnableMinimumUserLevelCommentVal"/>
          <el-input-number v-model="minimumCommentVal" :max="maxVal" :min="3"/>
        </div>
        <div>启用最大等级{{ maximumCommentVal }}
          <el-switch v-model="isEnableMaximumUserLevelCommentVal"/>
          <el-input-number v-model="maximumCommentVal" :max="maxVal" :min="3"/>
        </div>
      </div>
      <el-divider class="height-auto" direction="vertical"/>
    </div>
  </el-card>
</template>
