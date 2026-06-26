<script lang="ts">
import {defineComponent} from 'vue';
import videoPlayModel from "../../../pages/video/playModel.ts";
import collectionVideoPlayPageModel from "../../../pages/video/collectionPlay.ts";
import space from "../../../pages/space/main.ts";
import ruleKeyListData from "../../../config/ruleKeyListData.ts";
import ruleUtil from "../../../core/util/ruleUtil.ts";
import videoPlayWatchLater from "../../../pages/video/watchLater.ts";
import {eventEmitter} from "../../../core/EventEmitter.ts";
import urlUtil from "../../../core/util/urlUtil.ts";
//个人空间页面右侧屏蔽按钮组件
export default defineComponent({
  data() {
    return {
      shieldingModelShow: true,
      shieldingUseUIDrButShow: false,
      removedShieldingUIDrButShow: false,
      selectUserBlockingButShow: false,
      uid: -1,
      urlUID: null as number | null
    }
  },
  methods: {
    async dropdownEvent(item: any) {
      if (item === '移除屏蔽uid') {
        const {uid} = await space.getUserInfo()
        ruleUtil.delRUlePreciseUid(uid)
        return
      }
      switch (item) {
        case '屏蔽uid':
          const {name, uid} = await space.getUserInfo()
          this.$confirm(`是否屏蔽当前用户【${name}】uid=【${uid}】`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            const {status, res} = ruleUtil.addRulePreciseUid(uid as any);
            this.$alert(res as string)
            if (status) {
              eventEmitter.send('通知屏蔽');
              // 屏蔽成功后隐藏屏蔽按钮并显示取消屏蔽按钮
              this.shieldingUseUIDrButShow = false
              this.removedShieldingUIDrButShow = true
            }
          })
          break;
        case '选择用户屏蔽':
          await videoPlayModel.selectUserBlocking()
          break;
        case '添加bv号屏蔽':
          const urlBvId = urlUtil.getUrlBV(window.location.href);
          this.$prompt(`确认添加该bv号【${urlBvId}】屏蔽吗？`, '提示', {
            inputValue: urlBvId ?? undefined,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValidator: (value: any) => {
              if (value.length >= 20) {
                return 'bv号格式不正确';
              }
              return value.startsWith('BV');
            }
          }).then(async ({value}: any) => {
            ruleUtil.addRulePreciseBv(value);
          })
          break;
        default:
          this.$message('未知选项')
      }
    }
  },
  async created() {
    if (videoPlayModel.isVideoPlayPage() || collectionVideoPlayPageModel.iscCollectionVideoPlayPage() ||
        videoPlayWatchLater.isVideoPlayWatchLaterPage()) {
      this.selectUserBlockingButShow = true
    }
    if (space.isSpacePage()) {
      this.urlUID = urlUtil.getUrlUID(window.location.href);
      if (ruleKeyListData.getPreciseUidArr().includes(this.urlUID)) {
        this.shieldingModelShow = true
        this.removedShieldingUIDrButShow = true
        await this.$alert('当前用户为已标记uid黑名单', '提示');
        return;
      }
      if (await space.isPersonalHomepage()) {
        this.shieldingModelShow = false
        return;
      }
      this.shieldingModelShow = true
      this.shieldingUseUIDrButShow = true
    }
  }
})
</script>

<template>
  <div>
    <el-dropdown v-if="shieldingModelShow"
                 @command="dropdownEvent">
      <el-button round>
        屏蔽操作<i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu v-slot="dropdown">
        <el-dropdown-item v-if="shieldingUseUIDrButShow"
                          command="屏蔽uid">屏蔽(uid)
        </el-dropdown-item>
        <el-dropdown-item v-if="removedShieldingUIDrButShow"
                          command="移除屏蔽uid">移除屏蔽(uid)
        </el-dropdown-item>
        <el-dropdown-item v-if="selectUserBlockingButShow" command="选择用户屏蔽">选择用户屏蔽</el-dropdown-item>
        <el-dropdown-item v-if="selectUserBlockingButShow" command="添加bv号屏蔽">添加bv号屏蔽</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
