<script setup lang="ts">
import {reactive, ref, watch} from 'vue';
import {eventEmitter} from "@/core/EventEmitter.ts";
import ruleUtil from "../../core/util/ruleUtil.ts";
import defUtil from "../../core/util/defUtil.ts";
import {asynchronousIntervalQueue} from "@/core/cache/asynchronousIntervalQueue.ts";
import {ElMessage, ElMessageBox, ElNotification} from 'element-plus';

//获取黑名单请求队列
const queue = new asynchronousIntervalQueue();

const getData = async (page = 1) => {
  const response = await fetch(`https://api.bilibili.com/x/relation/blacks?pn=${page}&ps=50&jsonp=jsonp`, {
    credentials: 'include'
  });
  if (response.status !== 200) {
    eventEmitter.send('el-msg', '拉取黑名单数据响应失败.');
    return {state: false};
  }
  const resJson = await response.json();
  const {data: {list, total}, message, code} = resJson;
  if (code !== 0) {
    eventEmitter.send('el-msg', '请求相应内容失败：code=' + code);
    return {state: false, msg: `请求相应内容失败：msg=${message} code=` + code};
  }
  const newList = list.map(({face, mid, mtime, uname, sign}: any) => {
    return {face, mid, mtime, uname, sign};
  });
  return {state: true, list: newList, total};
};

/**
 * 黑名单管理组件
 * 管理B站自身的黑名单
 */
const select = reactive({
  val: 'uname',
  options: [{
    label: "用户UID",
    value: 'mid',
  }, {
    label: "用户名",
    value: 'uname',
  }, {
    label: '用户签名',
    value: 'sign'
  }]
});
const total = ref(0);
const list = ref<any[]>([]);
const showList = ref<any[]>([]);
const findVal = ref('');
// 请求间隔
const sliderInterval = ref(0.6);
const isDivLoading = ref(false);
// 取消列表显示最大限制
const isCancelMaxLimit = ref(false);
const pageSize = ref(50);

const filterTable = (dataList: any, val: any) => {
  const filter = dataList.filter((x: any) => {
    const x1 = x[select.val];
    if (Number.isInteger(x1)) {
      return x1.toString().includes(val);
    }
    return x1.includes(val);
  });
  if (filter.length === 0) {
    ElNotification({
      title: '没有匹配到数据',
      message: '',
      type: 'warning',
      duration: 2000
    });
    return [];
  }
  if (filter.length > 50 && !isCancelMaxLimit.value) {
    ElNotification({
      title: '数据过多，已截取前50条',
      message: '',
      type: 'warning',
      duration: 2000
    });
    return filter.slice(0, 50);
  }
  return filter;
};
const getOnePageDataBut = async () => {
  const {state, list: resList, total: resTotal} = await getData();
  if (!state) {
    return;
  }
  list.value = resList;
  showList.value = resList;
  total.value = resTotal;
  ElMessage('获取成功');
};
//打开地址
const tableOpenAddressBut = (row: any) => {
  GM_openInTab(`https://space.bilibili.com/${row.mid}`);
};
const tableAddUidBlackBut = (row: any) => {
  const uid = row.mid;
  const name = row.uname;
  if (ruleUtil.findRuleItemValue('precise_uid', uid)) {
    ElMessage(`该用户:${name}的uid:${uid}已添加过`);
    return;
  }
  ElMessageBox.confirm(`确定添加${name}的uid:${uid}到uid精确屏蔽吗？`).then(() => {
    ruleUtil.addRulePreciseUid(uid);
  });
  console.log(row);
};
const outDataToConsoleBut = () => {
  console.log('黑名单管理列表====start');
  console.log(JSON.parse(JSON.stringify(list.value)));
  console.log('黑名单管理列表====end');
  ElMessageBox.alert('已导出到控制台，可通过f12查看');
};
const outDataToFileBut = () => {
  ElMessageBox.prompt('请输入文件名', '保存为', {
    inputValue: 'B站黑名单列表'
  }).then(({value}: any) => {
    if (value.trim() === '') {
      return;
    }
    const tempData = {
      total: total.value,
      list: list.value
    };
    const s = JSON.stringify(tempData, null, 4);
    defUtil.fileDownload(s, value.trim() + '.json');
    ElMessageBox.alert('已导出到文件，请按需保存');
  });
};
const getAllBut = async () => {
  isDivLoading.value = true;
  const {state, list: resList, total: resTotal} = await getData();
  if (!state) return;
  if (resTotal === 0) {
    isDivLoading.value = false;
    ElMessage('没有更多数据了');
    return;
  }
  total.value = resTotal;
  const totalPage = Math.ceil(resTotal / 50);
  if (totalPage === 1) {
    //总数量<=50
    list.value = resList;
    isDivLoading.value = false;
    return;
  }
  list.value = resList;
  //从第二页开始获取
  for (let i = 2; i <= totalPage; i++) {
    const {state: pageState, list: pageList} = await queue.add(() => getData(i));
    if (!pageState) return;
    resList.push(...pageList);
  }
  if (list.value.length > 50 && !isCancelMaxLimit.value) {
    showList.value = resList.slice(0, 50);
  } else {
    showList.value = resList;
  }
  showList.value = resList;
  ElMessage('获取成功');
  isDivLoading.value = false;
};
const handleCurrentChange = (page: number) => {
  showList.value = list.value.slice((page - 1) * 50, page * 50);
};
const clearTableBut = () => {
  list.value = [];
  showList.value = [];
  ElMessage('已清空列表');
};
const tableAddUidBlackButAll = () => {
  if (list.value.length === 0) {
    ElMessage('列表为空');
    return;
  }
  ElMessageBox.confirm(`确定添加所有用户到uid精确屏蔽吗？`).then(() => {
    if (ruleUtil.addPreciseUidItemRule(list.value.map(x => x.mid), true, false)) {
      eventEmitter.send('刷新规则信息');
    }
  });
};

watch(findVal, (n) => {
  showList.value = filterTable(list.value, n);
});
watch(sliderInterval, (n) => {
  queue.setInterval(n * 1000);
});
watch(isCancelMaxLimit, (n) => {
  pageSize.value = n ? 1000000 : 50;
});

queue.setInterval(sliderInterval.value * 1000);
</script>
<template>
  <div>
    <el-space direction="vertical" alignment="stretch">
      <el-text>1.注意：该功能为b站自身的黑名单</el-text>
      <el-text>1.对应地址
        <el-link href="https://account.bilibili.com/account/blacklist" target="_blank">
          https://account.bilibili.com/account/blacklist
        </el-link>
      </el-text>
      <el-text>3.需要登录才可以使用</el-text>
    </el-space>
    <el-card v-loading="isDivLoading" element-loading-text="拼命加载中" shadow="never">
      <template #header>
        <el-row>
          <el-col :span="8">
            <el-badge :value="total">
              <el-tag>累计</el-tag>
            </el-badge>
            <el-badge :value="showList.length" style="margin-left: 45px">
              <el-tag>显示数</el-tag>
            </el-badge>
            <div>
              <el-card shadow="never">
                <template #header>请求的间隔({{ sliderInterval }}S)</template>
                <el-slider v-model="sliderInterval" max="10" step="0.1"></el-slider>
              </el-card>
              <el-button @click="getOnePageDataBut">获取第一页</el-button>
              <el-button @click="getAllBut">获取全部</el-button>
              <el-button type="warning" @click="clearTableBut">清空列表</el-button>
              <el-button @click="outDataToConsoleBut">导出控制台</el-button>
              <el-button @click="outDataToFileBut">导出文件</el-button>
            </div>
          </el-col>
          <el-col :span="16">
            <el-card shadow="never">
              <template #header><span>过滤</span></template>
              <div>
                <el-switch v-model="isCancelMaxLimit" active-text="取消列表显示最大限制"/>
              </div>
              <el-select v-model="select.val">
                <el-option
                    v-for="item in select.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                </el-option>
              </el-select>
              <el-input v-model="findVal"></el-input>
            </el-card>
          </el-col>
        </el-row>
      </template>
      <el-table :data="showList" border stripe>
        <el-table-column label="时间" prop="mtime" width="155px">
          <template #default="scope">
            {{ new Date(scope.row.mtime * 1000).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="头像" width="55px">
          <template #default="scope">
            <el-avatar :src="scope.row.face" shape="square"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="用户名" prop="uname" width="190px"></el-table-column>
        <el-table-column label="用户ID" prop="mid" width="180px"></el-table-column>
        <el-table-column label="签名" prop="sign"></el-table-column>
        <el-table-column label="标记" width="50px">
          <template #default="scope">
            未定
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #header>
            <el-button @click="tableAddUidBlackButAll">一键添加uid屏蔽</el-button>
          </template>
          <template #default="scope">
            <el-button @click="tableOpenAddressBut(scope.row)">打开地址</el-button>
            <el-button @click="tableAddUidBlackBut(scope.row)">uid屏蔽</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
          :page-size="pageSize"
          :total="list.length"
          background
          layout="prev, pager, next"
          @current-change="handleCurrentChange"
      >
      </el-pagination>
    </el-card>
  </div>
</template>
