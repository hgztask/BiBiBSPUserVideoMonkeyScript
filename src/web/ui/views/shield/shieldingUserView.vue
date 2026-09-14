<script setup lang="ts">
import {ref} from 'vue';
import videoPlayModel from "../../../pages/video/playModel.ts";
import collectionVideoPlayPageModel from "../../../pages/video/collectionPlay.ts";
import space from "../../../pages/space/main.ts";
import ruleKeyListData from "../../../config/ruleKeyListData.ts";
import ruleUtil from "../../../core/util/ruleUtil.ts";
import videoPlayWatchLater from "../../../pages/video/watchLater.ts";
import {eventEmitter} from "@/core/EventEmitter.ts";
import urlUtil from "../../../core/util/urlUtil.ts";
import {ElMessage, ElMessageBox} from 'element-plus';

//个人空间页面右侧屏蔽按钮组件
const shieldingModelShow = ref(true);
const shieldingUseUIDrButShow = ref(false);
const removedShieldingUIDrButShow = ref(false);
const selectUserBlockingButShow = ref(false);
const uid = ref(-1);
const urlUID = ref<number | null>(null);

const dropdownEvent = async (item: any) => {
  if (item === '移除屏蔽uid') {
    const {uid: delUid} = await space.getUserInfo();
    ruleUtil.delRUlePreciseUid(delUid);
    return;
  }
  switch (item) {
    case '屏蔽uid': {
      const {name, uid: shieldUid} = await space.getUserInfo();
      ElMessageBox.confirm(`是否屏蔽当前用户【${name}】uid=【${shieldUid}】`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const {status, res} = ruleUtil.addRulePreciseUid(shieldUid as any);
        ElMessageBox.alert(res as string);
        if (status) {
          eventEmitter.send('通知屏蔽');
          // 屏蔽成功后隐藏屏蔽按钮并显示取消屏蔽按钮
          shieldingUseUIDrButShow.value = false;
          removedShieldingUIDrButShow.value = true;
        }
      });
      break;
    }
    case '选择用户屏蔽':
      await videoPlayModel.selectUserBlocking();
      break;
    case '添加bv号屏蔽': {
      const urlBvId = urlUtil.getUrlBV(window.location.href);
      ElMessageBox.prompt(`确认添加该bv号【${urlBvId}】屏蔽吗？`, '提示', {
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
      });
      break;
    }
    default:
      ElMessage('未知选项');
  }
};

const init = async () => {
  if (videoPlayModel.isVideoPlayPage() || collectionVideoPlayPageModel.iscCollectionVideoPlayPage() ||
      videoPlayWatchLater.isVideoPlayWatchLaterPage()) {
    selectUserBlockingButShow.value = true;
  }
  if (space.isSpacePage()) {
    urlUID.value = urlUtil.getUrlUID(window.location.href);
    if (ruleKeyListData.getPreciseUidArr().includes(urlUID.value)) {
      shieldingModelShow.value = true;
      removedShieldingUIDrButShow.value = true;
      await ElMessageBox.alert('当前用户为已标记uid黑名单', '提示');
      return;
    }
    if (await space.isPersonalHomepage()) {
      shieldingModelShow.value = false;
      return;
    }
    shieldingModelShow.value = true;
    shieldingUseUIDrButShow.value = true;
  }
};
void init();
</script>

<template>
  <div>
    <el-dropdown v-if="shieldingModelShow"
                 @command="dropdownEvent">
      <el-button round>
        屏蔽操作<el-icon class="el-icon--right"><arrow-down/></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-if="shieldingUseUIDrButShow"
                            command="屏蔽uid">屏蔽(uid)
          </el-dropdown-item>
          <el-dropdown-item v-if="removedShieldingUIDrButShow"
                            command="移除屏蔽uid">移除屏蔽(uid)
          </el-dropdown-item>
          <el-dropdown-item v-if="selectUserBlockingButShow" command="选择用户屏蔽">选择用户屏蔽</el-dropdown-item>
          <el-dropdown-item v-if="selectUserBlockingButShow" command="添加bv号屏蔽">添加bv号屏蔽</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
