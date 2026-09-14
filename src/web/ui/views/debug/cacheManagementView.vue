<script setup lang="ts">
import {ref} from 'vue';
import bvDexie from "../../../core/cache/bvDexie.ts";
import {httpLocalHost} from "@/config/globalValue.ts";
import {defTmRequest} from "@/core/http/TmRequest.ts";
import {eventEmitter} from "@/core/EventEmitter.ts";
import defUtil from "../../../core/util/defUtil.ts";
import {ElMessage, ElMessageBox} from 'element-plus';
import {ElLoading} from 'element-plus';

const hostname = ref(window.location.hostname);
const expiresMaxAgeVal = ref(7);
const inputDemo = ref<HTMLInputElement>();

const outDbDataBut = () => {
  bvDexie.getVideoInfo().then((data) => {
    if (data.length === 0) {
      ElMessage('当前域名下没有缓存视频数据');
      return;
    }
    const out = {
      hostName: hostname.value,
      size: data.length,
      data: data
    } as any;
    defUtil.fileDownload(JSON.stringify(out, null, 4), 'mk-db-videoInfos-cache.json');
    ElMessage('已导出当前域名的缓存数据');
    console.log(out);
  });
};
const handleFileUpload = (event: any) => {
  defUtil.handleFileReader(event).then(data => {
    const {content} = data;
    /**
     // * @type {{hostName:string,tags:[{bv:string,name:string,title:string,tags:[string]}]}}
     */
    let parse;
    try {
      parse = JSON.parse(content);
    } catch (e) {
      ElMessage('文件内容有误');
      return;
    }
    const {hostName = null, videoInfos = []} = parse;
    if (!hostName) {
      ElMessage('hostName字段不存在');
      return;
    }
    if (!defUtil.isIterable(videoInfos)) {
      ElMessage('文件内容有误，非可迭代的数组！');
      return;
    }
    if (videoInfos.length === 0) {
      ElMessage('tags数据为空');
      return;
    }
    for (let item of videoInfos) {
      if (!item['bv']) {
        ElMessage('bv字段不存在');
        return;
      }
      if (!item['tags']) {
        ElMessage('tags字段不存在');
        return;
      }
      if (!item['userInfo']) {
        ElMessage('userInfo字段不存在');
        return;
      }
      if (!item['videoInfo']) {
        ElMessage('videoInfo字段不存在');
        return;
      }
    }
    bvDexie.bulkImportVideoInfos(videoInfos).then((bool) => {
      if (bool) {
        ElMessage('导入成功');
      } else {
        ElMessage('导入失败');
      }
    });
  });
};
const inputFIleBut = () => {
  inputDemo.value!.click();
};
const clearPageVideoCacheDataBut = () => {
  ElMessageBox.confirm('是否清空当前域名下的tags数据').then(() => {
    bvDexie.clearVideoInfosTable().then((bool) => {
      if (bool) {
        ElMessage('已清空当前域名下的视频缓存数据');
      } else {
        ElMessage('清空失败');
      }
    });
  });
};
const lookContentBut = () => {
  ElMessageBox.confirm('当数据量过大时，可能卡顿，等待时间会较为长，是要继续吗').then(async () => {
    const loading = ElLoading.service({text: "获取中..."});
    const r = await bvDexie.getVideoInfo();
    loading.close();
    eventEmitter.send('展示内容对话框', JSON.stringify(r));
    ElMessage('获取成功');
  });
};
const outToConsoleBut = () => {
  bvDexie.getVideoInfo().then(r => {
    ElMessageBox.alert('已导出至控制台上，可通过f12等方式查看');
    const host = hostname.value;
    console.log(`${host}的视频数据===start`);
    console.log(r);
    console.log(`${host}的视频数据=====end`);
  });
};
const outToLocalServerBut = async () => {
  let loading = ElLoading.service({text: '请求中...'});
  try {
    await defTmRequest.get(httpLocalHost);
  } catch (e) {
    console.warn(e);
    ElMessageBox.alert('请先运行本地localhost服务器，并开放3000端口');
    return;
  } finally {
    loading.close();
  }
  loading = ElLoading.service({text: '获取缓存数据中...'});
  const r = await bvDexie.getVideoInfo();
  loading.close();
  if (r.length === 0) {
    ElMessageBox.alert('当前域名下没有缓存视频数据');
    return;
  }
  loading = ElLoading.service({text: '请求中...'});
  defTmRequest.post(httpLocalHost + '/data', r).then(res => {
    console.log(res);
    if (res.status !== 200) {
      ElMessageBox.alert('服务器返回错误');
      return;
    }
    ElMessageBox.alert(res.data.msg);
  }).catch((e) => {
    ElMessageBox.alert('请求失败');
    console.warn(e);
  }).finally(() => loading.close());
};
const lookContentLenBut = () => {
  bvDexie.getVideoInfoCount().then((len) => {
    ElMessageBox.alert(`数据量${len}`);
  });
};
const batchDelBut = () => {
  ElMessageBox.prompt('请输入删除的bv号，多个bv号用逗号隔开', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(async ({value}: any) => {
    value = value?.trim() || null || "";
    if (value === null) return;
    const bvs = value.split(',');
    if (bvs.length === 1) {
      const bool = await bvDexie.delVideoInfoItem(bvs[0]);
      if (bool) {
        ElMessage.success(`删除${value}的视频缓存数据成功`);
      } else {
        ElMessage.warning(`删除失败，未找到${value}的视频缓存数据`);
      }
      return;
    }
    const data = await bvDexie.bulkDelVideoInfoItem(bvs);
    if (data.state) {
      if (data.success.length === bvs.length) {
        ElMessageBox.alert(`删除${data.success.join(',')}的视频缓存数据成功`, {
          type: 'success'
        });
      } else {
        ElMessageBox.alert(`删除${data.success.join(',')}的视频缓存数据成功，${data.fail.join(',')}的视频缓存数据未找到`, {
          type: 'warning'
        });
      }
    } else {
      ElMessage.warning(`删除失败,错误信息请看控制台`);
    }
  });
};
const modifyCacheTimeoutBut = () => {
  ElMessageBox.prompt('请输入缓存超时时间，单位为天', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'number',
    inputPattern: /^\d+$/, // 仅允许整数
    inputValidator: (value: any) => {
      if (!/^\d+$/.test(value)) {
        return '请输入有效的整数';
      }
      const num = parseInt(value);
      if (num < 1) {
        return '不能低于1天';
      }
      if (num <= 365) {
        return true;
      }
      return '不能超出365天';
    }
  }).then(async ({value}: any) => {
    GM_setValue('expires_max_age_gm', parseInt(value));
    expiresMaxAgeVal.value = value;
    ElMessage.success(`已修改视频缓存超时时间为${value}天`);
  });
};
</script>
<template>
  <div>
    <el-card>
      <template #header>说明</template>
      <div>1.每个域名中的缓存数据不同</div>
      <div>2.仅仅支持导入json格式</div>
      <div>3.下面导入默认追加模式</div>
      <div>4.当前域名
        <el-tag>{{ hostname }}</el-tag>
      </div>
      <div>5.缓存超时时间:{{ expiresMaxAgeVal }}天</div>
    </el-card>
    <el-card>
      <template #header>操作</template>
      <el-button @click="modifyCacheTimeoutBut">修改缓存超时时间</el-button>
      <el-button @click="inputFIleBut">追加导入视频缓存数据</el-button>
      <input ref="inputDemo" accept="application/json" style="display: none" type="file"
             @change="handleFileUpload">
      <el-button @click="clearPageVideoCacheDataBut">清空当前域名的视频缓存数据</el-button>
      <el-button @click="lookContentBut">查看内容</el-button>
      <el-button @click="lookContentLenBut">查看数据量</el-button>
      <el-button type="warning" @click="batchDelBut">批量删除</el-button>
    </el-card>
    <el-card>
      <template #header>导出</template>
      <el-button @click="outDbDataBut">至文件</el-button>
      <el-button @click="outToConsoleBut">至控制台</el-button>
      <el-button @click="outToLocalServerBut">至本地服务器</el-button>
    </el-card>
  </div>
</template>
