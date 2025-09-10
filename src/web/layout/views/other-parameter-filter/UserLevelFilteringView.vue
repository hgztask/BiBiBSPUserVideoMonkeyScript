<script>
import {
  getMaximumUserLevelCommentGm,
  getMaximumUserLevelVideoGm,
  getMinimumUserLevelCommentGm,
  getMinimumUserLevelVideoGm,
  isEnableMaximumUserLevelCommentGm,
  isEnableMaximumUserLevelVideoGm,
  isEnableMinimumUserLevelCommentGm,
  isEnableMinimumUserLevelVideoGm
} from "../../../data/localMKData.js";
import gmUtil from "../../../utils/gmUtil.js";

export default {
  data() {
    return {
      minVal: 0,
      maxVal: 7,
      minimumUserLevelVideoVal: getMinimumUserLevelVideoGm(),
      maximumUserLevelVideoVal: getMaximumUserLevelVideoGm(),
      minimumCommentVal: getMinimumUserLevelCommentGm(),
      maximumCommentVal: getMaximumUserLevelCommentGm(),
      isEnableMinimumUserLevelVideoVal: isEnableMinimumUserLevelVideoGm(),
      isEnableMaximumUserLevelVideoVal: isEnableMaximumUserLevelVideoGm(),
      isEnableMinimumUserLevelCommentVal: isEnableMinimumUserLevelCommentGm(),
      isEnableMaximumUserLevelCommentVal: isEnableMaximumUserLevelCommentGm()
    }
  },
  methods: {
  },
  watch: {
    minimumUserLevelVideoVal(n) {
      const max = this.maximumUserLevelVideoVal;
      if (n > max) {
        this.minimumUserLevelVideoVal = max;
        this.$message.warning('最小等级不能大于最大等级')
        return;
      }
      if (n === max) {
        --this.minimumUserLevelVideoVal;
        this.$message.warning('最小等级不能等于最大等级')
        return;
      }
      gmUtil.setData("minimum_user_level_video_gm", n);
    },
    maximumUserLevelVideoVal(n) {
      const min = this.minimumUserLevelVideoVal;
      if (n < min) {
        this.maximumUserLevelVideoVal = min;
        this.$message.warning('最大等级不能小于最小等级')
        return
      }
      if (n === min) {
        ++this.maximumUserLevelVideoVal;
        this.$message.warning('最大等级不能等于最小等级')
        return;
      }
      gmUtil.setData("maximum_user_level_video_gm", this.maximumUserLevelVideoVal)
    },
    minimumCommentVal(n) {
      const max = this.maximumCommentVal;
      if (n > max) {
        this.minimumCommentVal = max;
        this.$message.warning('最小等级不能大于最大等级')
        return
      }
      if (n === max) {
        --this.minimumCommentVal;
        this.$message.warning('最小等级不能等于最大等级')
        return;
      }
      gmUtil.setData("minimum_user_level_comment_gm", n)
    },
    maximumCommentVal(n) {
      const min = this.minimumCommentVal;
      if (n < min) {
        this.maximumCommentVal = min;
        this.$message.warning('最大等级不能小于最小等级')
        return;
      }
      if (n === min) {
        ++this.maximumCommentVal;
        this.$message.warning('最大等级不能等于最小等级')
        return;
      }
      gmUtil.setData("maximum_user_level_comment_gm", n)
    },
    isEnableMinimumUserLevelVideoVal(n) {
      gmUtil.setData("is_enable_minimum_user_level_video_gm", n)
    },
    isEnableMaximumUserLevelVideoVal(n) {
      gmUtil.setData("is_enable_maximum_user_level_video_gm", n)
    },
    isEnableMinimumUserLevelCommentVal(n) {
      gmUtil.setData("is_enable_minimum_user_level_comment_gm", n)
    },
    isEnableMaximumUserLevelCommentVal(n) {
      gmUtil.setData("is_enable_maximum_user_level_comment_gm", n)
    }
  }
}
</script>
<template>
  <el-card shadow="never">
    <template #header>等级限制</template>
    <div class="el-horizontal-left">
      <div>
        视频类
        <div>启用最小等级{{minimumUserLevelVideoVal}}
          <el-switch  v-model="isEnableMinimumUserLevelVideoVal"/>
          <el-input-number v-model="minimumUserLevelVideoVal" :max="maxVal" :min="minVal"/>
        </div>
        <div>启用最大等级{{maximumUserLevelVideoVal}}
          <el-switch v-model="isEnableMaximumUserLevelVideoVal"/>
          <el-input-number v-model="maximumUserLevelVideoVal" :max="maxVal" :min="1"/>
        </div>
      </div>
      <el-divider class="height-auto" direction="vertical"/>
      <div>
        评论类
        <div>启用最小等级{{minimumCommentVal}}
          <el-switch v-model="isEnableMinimumUserLevelCommentVal"/>
          <el-input-number v-model="minimumCommentVal" :max="maxVal" :min="3"/>
        </div>
        <div>启用最大等级{{maximumCommentVal}}
          <el-switch v-model="isEnableMaximumUserLevelCommentVal"/>
          <el-input-number v-model="maximumCommentVal" :max="maxVal" :min="3"/>
        </div>
      </div>
      <el-divider class="height-auto" direction="vertical"/>
    </div>
  </el-card>
</template>