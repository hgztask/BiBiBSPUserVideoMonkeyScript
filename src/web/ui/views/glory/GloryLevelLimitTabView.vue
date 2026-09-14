<script setup lang="ts">
import {ref} from 'vue'
import localMKData from "../../../state/localMKData.ts";
import {ElMessage, ElMessageBox} from 'element-plus';

const dataList = ref<any[]>([]);

const refresh = (tip = false) => {
  dataList.value = localMKData.getGloryLevelLimitListGm();
  tip && ElMessage.success("刷新成功");
};
const updateRoomIdRowBut = (row: any) => {
  const roomId = row.roomId;
  ElMessageBox.prompt("请输入房间号", {
    title: "修改房间号",
    inputPattern: /^[0-9]\d*$/,
    inputValue: roomId,
  }).then(({value}: any) => {
    value = parseInt(value);
    if (!(value >= 0)) {
      ElMessage.warning("请输入正确的房间号");
      return updateRoomIdRowBut(row);
    }
    if (dataList.value.some(item => item.roomId === value)) {
      ElMessage.warning("已存在该房间号");
      return updateRoomIdRowBut(row);
    }
    row.roomId = value;
  });
};
const delBut = (row: any) => {
  const roomId = row.roomId;
  if (roomId === "0" || roomId === 0) {
    ElMessage.warning("全局设置不可删除");
    return;
  }
  ElMessageBox.confirm(`是要删除该房间号配置吗？【${roomId}】`).then(() => {
    dataList.value = dataList.value.filter(item => item !== row);
  });
};
const addBut = () => {
  ElMessageBox.prompt("请输入房间号，添加之后需要手动设置对应的状态(开关)", {
    title: "添加房间号",
    inputPattern: /^[1-9]\d*$/,
  }).then(({value}: any) => {
    value = parseInt(value);
    if (!(value >= 1)) {
      ElMessage.warning("请输入正确的房间号");
      return addBut();
    }
    if (dataList.value.some(item => item.roomId === value)) {
      ElMessage.warning("已存在该房间号");
      return addBut();
    }
    dataList.value.push({roomId: value, limitLevel: 0, status: false});
  });
};
const saveBut = () => {
  GM_setValue('glory_level_limit_list_gm', dataList.value);
  ElMessage.success("保存成功");
};

refresh();
</script>

<template>
  <el-card :body-style="{ padding: '0px' }" shadow="never">
    <template #header>
      <gz-space align-items="flex-start" direction="">
        <span>荣誉等级限制</span>
        <span>可为每个房间设置不同的荣耀等级限制和状态。房间号为0则全局直播间。限制等级小于等于时屏蔽。保存才算生效</span>
      </gz-space>
    </template>
    <el-table :data="dataList" border>
      <el-table-column label="房间号" width="120">
        <template #default="scope">
          <div v-if="scope.row.roomId===0||scope.row.roomId==='0'">全局</div>
          <div v-else style="width: 100%;height: 100%" @click="updateRoomIdRowBut(scope.row)">{{
              scope.row.roomId
            }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="限制荣耀等级" width="155">
        <template #default="scope">
          <el-input-number v-model="scope.row.limitLevel" :max="80" :min="1" size="small"></el-input-number>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="50">
        <template #default="scope">
          <gz-space justify-content="center">
            <el-checkbox v-model="scope.row.status"></el-checkbox>
          </gz-space>
        </template>
      </el-table-column>
      <el-table-column>
        <template #header>
          <gz-space>
            <el-button type="success" @click="saveBut">保存</el-button>
            <el-button @click="refresh(true)">刷新</el-button>
            <el-button type="info" @click="addBut">新增</el-button>
          </gz-space>
        </template>
        <template #default="scope">
          <el-button type="warning" @click="delBut(scope.row)">移除</el-button>
          <el-button v-if="scope.row.roomId!==0" @click="updateRoomIdRowBut(scope.row)">修改房间号
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
