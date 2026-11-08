<script setup lang="ts">
import {computed, reactive, ref} from 'vue';
import {ElMessage, ElMessageBox} from 'element-plus';
import {eventEmitter} from '@/core/EventEmitter.ts';
import backupService, {
  RemoteChangedError,
  type RemoteBackupConfig,
  type RemotePreview
} from '@/core/backup/backupService.ts';

/** 远程备份组件：WebDAV / 自建HTTP接口，手动上传与恢复 */
const config = reactive<RemoteBackupConfig>(backupService.getRemoteConfig());
const lastSync = ref(backupService.getLastSync());
const uploading = ref(false);
const downloading = ref(false);
const testing = ref(false);

const lastSyncText = computed(() => {
  const info = lastSync.value;
  if (!info) return '暂无同步记录';
  return `${new Date(info.at).toLocaleString()} · ${info.providerType === 'webdav' ? 'WebDAV' : 'HTTP'}`;
});

const refreshLastSync = () => {
  lastSync.value = backupService.getLastSync();
};

const persistConfig = (): boolean => {
  if (config.type === 'webdav' && config.webdav.fileUrl.trim() === '') {
    ElMessage.warning('请填写 WebDAV 远程文件地址');
    return false;
  }
  if (config.type === 'http' && config.http.url.trim() === '') {
    ElMessage.warning('请填写中间层接口地址');
    return false;
  }
  backupService.saveRemoteConfig(config);
  return true;
};

const showError = (e: any) => {
  const message = e?.message ?? String(e);
  // 跨域被脚本管理器拦截时，引导用户到XHR安全设置手动添加域名
  if (/跨域请求|@connect|Domain not permitted|Not permitted/i.test(message)) {
    ElMessageBox.alert(
      '本机地址（127.0.0.1 / localhost）已预授权，无需设置。其他域名请手动添加授权：\n' +
      '1. 打开脚本管理器（如 Tampermonkey）管理面板\n' +
      '2. 设置选项卡 → 配置模式改为「高级」\n' +
      '3. 本脚本详情 → XHR 安全 → 添加域名（如 dav.jianguoyun.com）\n' +
      '4. 保存后刷新页面重试\n\n详细步骤见文档 docs/backup.md「跨域授权」。',
      '需要添加跨域授权',
      {type: 'warning'}
    ).catch(() => {
    });
    return;
  }
  ElMessageBox.alert(message, '操作失败', {type: 'error'}).catch(() => {
  });
};

const saveConfigBut = () => {
  if (!persistConfig()) return;
  ElMessage.success('远程备份配置已保存');
  refreshLastSync();
};

const testBut = async () => {
  if (!persistConfig()) return;
  testing.value = true;
  try {
    const result = await backupService.testProvider(config);
    if (result.ok) {
      ElMessage.success(result.message);
    } else {
      ElMessage.error(result.message);
    }
  } catch (e: any) {
    showError(e);
  } finally {
    testing.value = false;
  }
};

const uploadBut = async () => {
  if (!persistConfig()) return;
  uploading.value = true;
  try {
    const result = await backupService.upload();
    if (result.status === 'unchanged') {
      ElMessage.info('远程与本地规则一致，无需上传');
    } else {
      ElMessage.success('已上传到远程');
    }
    refreshLastSync();
  } catch (e: any) {
    if (e instanceof RemoteChangedError) {
      try {
        await ElMessageBox.confirm(
          '远程备份在别处已被修改。继续上传会用本地规则覆盖远程内容，是否继续？',
          '远程备份冲突',
          {type: 'warning', confirmButtonText: '覆盖上传', cancelButtonText: '取消'}
        );
      } catch {
        return;
      }
      try {
        await backupService.upload({force: true});
        ElMessage.success('已覆盖上传');
        refreshLastSync();
      } catch (forceError: any) {
        showError(forceError);
      }
      return;
    }
    showError(e);
  } finally {
    uploading.value = false;
  }
};

const openPreview = (preview: RemotePreview) => {
  if (preview.localDirty) {
    ElMessage.warning('本地存在未同步的修改，请预览后选择覆盖或合并');
  }
  eventEmitter.send('备份导入预览对话框', {
    title: '从远程恢复备份',
    rules: preview.rules,
    source: '远程备份',
    unknownKeys: preview.unknownKeys,
    invalidCounts: preview.invalidCounts,
    apply: async (mode: 'overwrite' | 'merge') => {
      await backupService.confirmDownload(preview, mode);
      refreshLastSync();
    }
  });
};

const downloadBut = async () => {
  if (!persistConfig()) return;
  downloading.value = true;
  try {
    const preview = await backupService.previewRemote();
    openPreview(preview);
  } catch (e: any) {
    showError(e);
  } finally {
    downloading.value = false;
  }
};

const clearConfigBut = async () => {
  try {
    await ElMessageBox.confirm('将清除已保存的远程备份配置与同步记录（不会删除远程文件），是否继续？', '清除远程配置', {
      type: 'warning'
    });
  } catch {
    return;
  }
  backupService.clearRemoteConfig();
  refreshLastSync();
  ElMessage.success('已清除远程备份配置');
};
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="el-horizontal-outside">
        <div>远程备份（WebDAV / 自建 HTTP）</div>
        <div>{{ lastSyncText }}</div>
      </div>
    </template>
    <div>备份内容为全部规则（明文 JSON）。WebDAV 建议使用应用密码；接口令牌请妥善保管。上传/恢复均为手动操作。</div>
    <el-divider/>
    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
      <span>方式</span>
      <el-select v-model="config.type" style="width: 180px;">
        <el-option label="WebDAV" value="webdav"/>
        <el-option label="自建 HTTP 接口" value="http"/>
      </el-select>
    </div>
    <template v-if="config.type === 'webdav'">
      <div style="margin-top: 8px;">
        <el-input v-model="config.webdav.fileUrl"
                  placeholder="远程文件地址，如 https://dav.jianguoyun.com/dav/BIBIShield/backup.json"/>
      </div>
      <div style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
        <el-input v-model="config.webdav.username" placeholder="用户名" style="width: 240px;"/>
        <el-input v-model="config.webdav.password" placeholder="应用密码" show-password style="width: 240px;"/>
      </div>
    </template>
    <template v-else>
      <div style="margin-top: 8px;">
        <el-input v-model="config.http.url" placeholder="中间层接口地址（GET 读取 / PUT 写入）"/>
      </div>
      <div style="margin-top: 8px;">
        <el-input v-model="config.http.token" placeholder="访问令牌（Bearer Token）" show-password/>
      </div>
    </template>
    <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
      <el-button :disabled="uploading || downloading" @click="saveConfigBut">保存配置</el-button>
      <el-button :loading="testing" :disabled="uploading || downloading" @click="testBut">测试连接</el-button>
      <el-button :loading="uploading" :disabled="downloading" type="primary" @click="uploadBut">上传到远程</el-button>
      <el-button :loading="downloading" :disabled="uploading" @click="downloadBut">从远程恢复</el-button>
      <el-button :disabled="uploading || downloading" plain type="danger" @click="clearConfigBut">清除远程配置</el-button>
    </div>
  </el-card>
</template>
