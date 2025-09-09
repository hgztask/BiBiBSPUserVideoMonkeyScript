<script>
import gmUtil from "../../utils/gmUtil.js";
import otherKeyListDataJson from "../../res/otherKeyListDataJson.json";
import commentWordLimitView from "./commentWordLimitView.vue";
import UserLevelFilteringView from "./UserLevelFilteringView.vue";

/**
 * 其他规则组件
 */
export default {
  components: {commentWordLimitView, UserLevelFilteringView},
  data() {
    return {
      num: 0,
      selectList: otherKeyListDataJson,
      selectValue: 'nMinimumPlay',
      inputMax: "",
      inputMin: 0,
      minimumUserLevelList: [
        {key: 'minimum_user_level_video_gm', label: '最小用户等级限制-视频', defVal: ''},
        {key: 'maximum_user_level_video_gm', label: '最大用户等级限制-视频', defVal: ''},
        {key: 'minimum_user_level_comment_gm', label: '最小用户等级限制-评论', defVal: ''},
        {key: 'maximum_user_level_comment_gm', label: '最大用户等级限制-评论', defVal: ''}
      ]
    }
  },
  methods: {
    okVideoSelectBut() {
      const find = this.selectList.find(item => item.value === this.selectValue);
      //当前下拉框选中的条件的值对应的关联值，关联限制条件，如最小的xxx，对应的最大的xxx
      const associatedVal = gmUtil.getData(find.associated, -1);
      const associatedFind = this.selectList.find(item => item.value === find.associated)
      //当输入框的值，大于对应关联箱子条件时返回
      if (this.num > associatedVal && associatedVal !== -1) {
        if (associatedFind.bLarge) {
          this.$alert(`要设置的${find.name}值不能大于${associatedFind.name}的值`)
          return
        }
        console.log('正常修改')
      }
      this.$alert(`已设置${find.name}，值为${this.num}`)
      gmUtil.setData(this.selectValue, this.num)
      this.updateInfo()
    },
    cancelBut() {
      gmUtil.setData(this.selectValue, -1)
      const find = this.selectList.find(item => item.value === this.selectValue);
      this.$message.success(`已取消${find.name}的限制`)
      this.updateInfo()
    },
    allCancelBut() {
      for (let item of this.selectList) {
        gmUtil.setData(item.value, -1);
      }
      this.updateInfo()
    },
    updateInfo() {
      for (let item of this.selectList) {
        item.defVal = gmUtil.getData(item.value, -1);
      }
      for (const v of this.minimumUserLevelList) {
        v.defVal = gmUtil.getData(v.key, '');
      }
    },
    updateInfoBut() {
      this.updateInfo()
      this.$notify({type:'info',position: 'bottom-right', message: '已刷新'})
    },
  },
  watch: {
    selectValue(newVal) {
      this.inputMin = 0
      this.inputMax = ''
    }
  },
  created() {
    this.updateInfo()
  }
}
</script>

<template>
  <div>
    <div style="display: flex">
      <div style="width: 70vw">
        <input v-model="num" :max="inputMax" :min="inputMin" gz_type type="number">
        <el-select v-model="selectValue" filterable>
          <el-option v-for="item in selectList" :key="item.name" :label="item.name" :value="item.value"></el-option>
        </el-select>
          <el-button @click="okVideoSelectBut">设置</el-button>
          <el-button @click="cancelBut">取消</el-button>
          <el-button @click="allCancelBut">全部取消</el-button>
        <UserLevelFilteringView/>
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
        <el-button @click="updateInfoBut">刷新</el-button>
        <div v-for="item in selectList" style="padding: 5px">
          {{ item.name }}{{ item.defVal }}
          {{ item.name.includes('时长') ? '秒' : '' }}
        </div>
        <div v-for="v in minimumUserLevelList" :key="v.label">
          {{ v.label }}
          <el-tag>{{ v.defVal }}</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>
