<script setup lang="ts">
import {computed, ref} from 'vue';
import {eventEmitter} from "../../../core/EventEmitter.ts";
import defUtil from "../../../core/util/defUtil.ts";
import {ElMessage, ElMessageBox, ElNotification} from 'element-plus';
import {
  areShieldLogRecordsSame,
  createShieldLogRecord,
  isShieldLogEvent,
  type JsonValue,
  type ShieldLogEvent,
  type ShieldLogRecord
} from "../../../core/shieldLog.ts";

type OutputInfo = {
  type: string;
  content: string;
  htmlContent?: string;
  time?: string;
  firstSeenAt?: string;
  updatedAt?: string;
  count?: number;
  id?: string;
  shield?: any;
};

const typeOptions = [
  {value: 'all', label: '全部日志'},
  {value: 'info', label: '普通信息'},
  {value: 'response-shield-info', label: '响应层过滤'},
  {value: 'shield-video-info', label: '视频屏蔽'},
  {value: 'shield-comment-info', label: '评论屏蔽'},
  {value: 'shield-live-info', label: '直播间屏蔽'},
  {value: 'other-shield-info', label: '其他屏蔽'},
  {value: 'update-out-info', label: '状态更新'},
  {value: 'error', label: '错误信息'},
];

const outputInfoArr = ref<OutputInfo[]>([]);
const selectedType = ref('all');
const searchKeyword = ref('');

const filteredInfoArr = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase();
  return outputInfoArr.value.filter((item) => {
    if (selectedType.value !== 'all' && item.type !== selectedType.value) return false;
    if (!keyword) return true;
    return getPlainContent(item.content).toLowerCase().includes(keyword);
  });
});
const emptyText = computed<string>(() => {
  if (outputInfoArr.value.length === 0) return '暂无输出信息';
  return '没有符合条件的输出信息';
});

const getPlainContent = (content: string): string => {
  return String(content || '').replace(/<[^>]*>/g, ' ');
};
const getTypeLabel = (type: string): string => {
  const option = typeOptions.find(item => item.value === type);
  return option?.label || '其他信息';
};
const getTypeTag = (type: string): string => {
  if (type === 'error') return 'danger';
  if (type === 'shield-video-info' || type === 'shield-comment-info' || type === 'shield-live-info'
    || type === 'response-shield-info' || type === 'other-shield-info') return 'warning';
  if (type === 'update-out-info') return 'success';
  if (type === 'info') return 'primary';
  return 'info';
};
const clearInfoBut = () => {
  ElMessageBox.confirm('是否清空全部输出信息？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    outputInfoArr.value = [];
    ElNotification({
      title: '输出信息',
      message: '清空成功',
      type: 'success',
      position: 'bottom-right'
    });
  }).catch(() => undefined);
};
const updateOutInfo = (infoData: OutputInfo, index: number) => {
  const outPutInfoData = outputInfoArr.value[index];
  outPutInfoData.count = (outPutInfoData.count || 0) + 1;
  outPutInfoData.time = defUtil.toTimeString();
  outPutInfoData.content = infoData.content;
  outputInfoArr.value.splice(index, 1);
  outputInfoArr.value.unshift(outPutInfoData);
};
const addOutInfo = (infoData: OutputInfo) => {
  infoData.content = String(infoData.content ?? '');
  if (infoData.shield) {
    infoData.time = defUtil.toTimeString();
    infoData.count = 1;
    outputInfoArr.value.unshift(infoData);
    return;
  }
  const findIdIndex = outputInfoArr.value.findIndex(item => {
    if (infoData.id === undefined || item.id === undefined) return false;
    return item.id === infoData.id;
  });
  if (findIdIndex !== -1) {
    updateOutInfo(infoData, findIdIndex);
    return;
  }
  const findContentIndex = outputInfoArr.value.findIndex(item => item.content === infoData.content);
  if (findContentIndex !== -1) {
    updateOutInfo(infoData, findContentIndex);
    return;
  }
  infoData.time = defUtil.toTimeString();
  infoData.count = 1;
  outputInfoArr.value.unshift(infoData);
};

const shieldRecordType = (category: ShieldLogRecord['category']): string => {
  if (category === '响应层过滤') return 'response-shield-info';
  if (category === '视频屏蔽') return 'shield-video-info';
  if (category === '评论屏蔽') return 'shield-comment-info';
  if (category === '直播间屏蔽') return 'shield-live-info';
  return 'other-shield-info';
};

const addShieldLog = (event: ShieldLogEvent) => {
  const record = createShieldLogRecord(event);
  const existingIndex = outputInfoArr.value.findIndex(item =>
    item.shield !== undefined && areShieldLogRecordsSame(item.shield, record));
  if (existingIndex !== -1) {
    const existing = outputInfoArr.value[existingIndex];
    const oldRecord = existing.shield!;
    const updatedAt = record.firstSeenAt;
    Object.assign(oldRecord, record, {
      firstSeenAt: oldRecord.firstSeenAt,
      updatedAt,
      count: oldRecord.count + 1
    });
    existing.content = oldRecord.message;
    existing.htmlContent = oldRecord.htmlMessage;
    existing.firstSeenAt = oldRecord.firstSeenAt;
    existing.updatedAt = updatedAt;
    existing.count = oldRecord.count;
    outputInfoArr.value.splice(existingIndex, 1);
    outputInfoArr.value.unshift(existing);
    return;
  }
  addOutInfo({
    type: shieldRecordType(record.category),
    content: record.message,
    htmlContent: record.htmlMessage,
    firstSeenAt: record.firstSeenAt,
    count: 1,
    shield: record
  });
};

const originalDialogVisible = ref(false);
const originalDialogText = ref('');
const originalDialogTitle = ref('原文');
const getLatestOriginal = (info: OutputInfo): JsonValue | undefined => info.shield?.normalizedOriginal;
const stringifyJson = (value: JsonValue | undefined): string => value === undefined ? '' : JSON.stringify(value, null, 2);

const showOriginal = (info: OutputInfo) => {
  const text = stringifyJson(getLatestOriginal(info));
  if (!text) return;
  originalDialogTitle.value = `${info.shield?.objectType ?? '对象'}原文`;
  originalDialogText.value = text;
  originalDialogVisible.value = true;
};

const copyText = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Clipboard API 失败时尝试兼容旧页面环境。
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch { copied = false; }
  textarea.remove();
  return copied;
};

const copyOriginal = async (info: OutputInfo) => {
  const text = stringifyJson(getLatestOriginal(info));
  if (!text) return;
  if (await copyText(text)) ElMessage.success('原文复制成功');
  else ElMessage.error('原文复制失败');
};

const printOriginal = (info: OutputInfo) => {
  const record = info.shield;
  if (!record) return;
  console.log('屏蔽日志元信息', {
    source: record.source,
    category: record.category,
    message: record.message,
    firstSeenAt: record.firstSeenAt,
    updatedAt: record.updatedAt,
    count: record.count
  });
  console.log('屏蔽日志原文', getLatestOriginal(info));
};

eventEmitter.on('打印信息', (content: string) => {
  addOutInfo({type: 'info', content: String(content ?? '')});
});
eventEmitter.on('屏蔽日志', (event: ShieldLogEvent) => {
  if (!isShieldLogEvent(event)) {
    console.error('屏蔽日志事件无效', event);
    return;
  }
  addShieldLog(event);
});
eventEmitter.on('event-update-out-info', (data: any) => {
  addOutInfo({
    type: 'update-out-info',
    id: data.id,
    content: String(data.msg ?? '')
  });
});
eventEmitter.on('屏蔽错误信息', (message: string) => {
  addOutInfo({type: 'error', content: String(message ?? '')});
});
eventEmitter.on('正则匹配时异常', (errorData: any) => {
  const {msg, e} = errorData;
  addOutInfo({
    type: 'error',
    content: msg
  });
  console.error(msg);
  throw new Error(e);
});
</script>

<template>
  <section class="output-information-view">
    <div class="output-toolbar">
      <div class="output-toolbar__title">
        <span class="output-title">输出信息</span>
        <span class="output-subtitle">记录屏蔽动作与运行状态</span>
      </div>
      <div class="output-summary">
        <el-tag size="small" effect="plain">累计 {{ outputInfoArr.length }}</el-tag>
        <el-tag size="small" type="primary" effect="plain">显示 {{ filteredInfoArr.length }}</el-tag>
        <el-button type="danger" size="small" plain @click="clearInfoBut">清空</el-button>
      </div>
    </div>

    <div class="output-filter-bar">
      <el-select v-model="selectedType" size="small" class="output-filter-type" placeholder="筛选类型">
        <el-option
            v-for="option in typeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"/>
      </el-select>
      <el-input
          v-model="searchKeyword"
          class="output-filter-search"
          size="small"
          clearable
          placeholder="搜索日志内容、标题或用户名"/>
      <span class="output-filter-hint" v-if="selectedType !== 'all' || searchKeyword">已启用筛选</span>
    </div>

    <div class="output-list" role="log" aria-live="polite">
      <div v-if="filteredInfoArr.length === 0" class="output-empty">
        <strong>{{ emptyText }}</strong>
        <span v-if="outputInfoArr.length > 0">请调整筛选条件后重试</span>
        <span v-else>触发屏蔽或运行操作后，相关信息会显示在这里</span>
      </div>
      <article
          v-for="(info, index) in filteredInfoArr"
          :key="`${info.id || info.type}-${info.content}-${index}`"
          class="output-item"
          :class="`output-item--${info.type}`">
        <div class="output-item__accent"/>
        <div class="output-item__main">
          <div class="output-item__head">
            <el-tag :type="getTypeTag(info.type)" size="small" effect="light">
              {{ getTypeLabel(info.type) }}
            </el-tag>
            <span class="output-item__position">#{{ filteredInfoArr.length - index }}</span>
          </div>
          <div class="output-item__content" v-html="info.htmlContent || info.content"></div>
        </div>
        <div class="output-item__meta">
          <template v-if="info.shield">
            <span class="output-item__time">首次：{{ info.firstSeenAt }}</span>
            <span v-if="info.updatedAt" class="output-item__time">更新：{{ info.updatedAt }}</span>
          </template>
          <span v-else class="output-item__time">{{ info.time }}</span>
          <el-tag v-if="(info.count || 0) > 1" class="output-item__count" type="info" size="small" effect="dark">
            ×{{ info.count }}
          </el-tag>
          <el-dropdown v-if="info.shield?.normalizedOriginal && (typeof info.shield.normalizedOriginal === 'object')" trigger="click" class="output-item__actions">
            <el-button text size="small">更多</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="showOriginal(info)">查看原文</el-dropdown-item>
                <el-dropdown-item @click="copyOriginal(info)">复制内容</el-dropdown-item>
                <el-dropdown-item @click="printOriginal(info)">打印内容</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </article>
    </div>
    <el-dialog v-model="originalDialogVisible" :title="originalDialogTitle" width="720px">
      <pre class="original-json">{{ originalDialogText }}</pre>
      <template #footer>
        <el-button @click="copyText(originalDialogText)">复制</el-button>
        <el-button type="primary" @click="originalDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<style scoped>
.output-information-view {
  --output-border: #e6eaf0;
  --output-muted: #8a94a6;
  --output-text: #25324a;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 360px;
  height: calc(100vh - 88px);
  padding: 14px 16px 16px;
  background: #f5f7fa;
}

.output-toolbar,
.output-filter-bar {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--output-border);
  border-radius: 8px;
  background: #ffffff;
}

.output-toolbar__title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.output-title {
  color: var(--output-text);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: .2px;
}

.output-subtitle {
  overflow: hidden;
  color: var(--output-muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.output-summary {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
}

.output-filter-bar {
  justify-content: flex-start;
  padding: 9px 10px;
}

.output-filter-type {
  flex: none;
  width: 128px;
}

.output-filter-search {
  flex: 1;
  min-width: 180px;
  max-width: 520px;
}

.output-filter-hint {
  flex: none;
  color: #409eff;
  font-size: 12px;
}

.output-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 2px 4px 12px 2px;
  scrollbar-color: #cbd3df transparent;
  scrollbar-width: thin;
}

.output-list::-webkit-scrollbar {
  width: 6px;
}

.output-list::-webkit-scrollbar-thumb {
  border-radius: 8px;
  background: #cbd3df;
}

.output-item {
  position: relative;
  display: flex;
  gap: 12px;
  box-sizing: border-box;
  min-height: 72px;
  margin-bottom: 8px;
  overflow: hidden;
  border: 1px solid var(--output-border);
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(31, 45, 61, .03);
  transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease;
}

.output-item:hover {
  border-color: #c8d7ea;
  box-shadow: 0 4px 14px rgba(31, 45, 61, .08);
  transform: translateY(-1px);
}

.output-item__accent {
  flex: none;
  width: 3px;
  background: #409eff;
}

.output-item--shield-video-info .output-item__accent,
.output-item--shield-comment-info .output-item__accent {
  background: #e6a23c;
}

.output-item--update-out-info .output-item__accent {
  background: #67c23a;
}

.output-item--error .output-item__accent {
  background: #f56c6c;
}

.output-item__main {
  flex: 1;
  min-width: 0;
  padding: 10px 0 11px;
}

.output-item__head {
  display: flex;
  align-items: center;
  gap: 7px;
  height: 20px;
  margin-bottom: 5px;
}

.output-item__position {
  color: #b2bac8;
  font-size: 11px;
}

.output-item__content {
  color: var(--output-text);
  font-size: 13px;
  line-height: 1.65;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.output-item__content a {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.output-item__content b {
  font-weight: 500;
}

.output-item__meta {
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 6px;
  min-width: 86px;
  padding: 12px 12px 11px 0;
}

.output-item__time {
  color: var(--output-muted);
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
}

.output-item__actions {
  margin-top: auto;
}

.original-json {
  box-sizing: border-box;
  max-height: 60vh;
  margin: 0;
  overflow: auto;
  padding: 12px;
  border-radius: 6px;
  background: #172033;
  color: #dce7f7;
  font: 12px/1.6 Consolas, "Courier New", monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

.output-item__count {
  align-self: flex-end;
}

.output-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: 240px;
  height: 100%;
  padding: 32px;
  border: 1px dashed #cfd7e3;
  border-radius: 8px;
  background: rgba(255, 255, 255, .72);
  color: var(--output-muted);
  text-align: center;
}

.output-empty i {
  margin-bottom: 12px;
  color: #b8c2d1;
  font-size: 30px;
}

.output-empty strong {
  margin-bottom: 6px;
  color: #5c687a;
  font-size: 14px;
  font-weight: 500;
}

.output-empty span {
  font-size: 12px;
}

@media (max-width: 640px) {
  .output-information-view {
    height: calc(100vh - 64px);
    padding: 10px;
  }

  .output-toolbar,
  .output-filter-bar {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .output-toolbar__title {
    width: 100%;
  }

  .output-summary {
    width: 100%;
    justify-content: flex-end;
  }

  .output-filter-type,
  .output-filter-search {
    width: 100%;
    max-width: none;
  }

  .output-item__meta {
    min-width: 68px;
    padding-right: 8px;
  }

  .output-item__time {
    white-space: normal;
    text-align: right;
  }
}
</style>
